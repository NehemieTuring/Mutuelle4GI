#!/usr/bin/env python3
"""
Importe les données du fichier Excel Bilan MEPY dans la base Mutuelle.

Feuilles prises en charge :
  - Synthese_Inscription 2026  → dette_inscription (colonne Reste), caisse inscriptions
  - Solidarité 2026            → dette_solidarité (colonne DETTE), caisse solidarités
  - Epargne 2026               → épargne membre, historique versements, caisse épargnes
  - Interets 2026              → intérêts cumulés membre
  - Emprunts 2026 / Remboursements 2026 → prêts et remboursements (si montants > 0)

Prérequis : Python 3.10+, accès MySQL (direct ou via Docker).
Optionnel : bcrypt (pour --members-json), pip install bcrypt

Usage :
  ./scripts/import_bilan_excel.py --excel ~/Desktop/Bilan_MEPY_2025-2026_v0_RO.xlsx
  ./scripts/import_bilan_excel.py --excel bilan.xlsx --members-json ../members.json --reset
  ./scripts/import_bilan_excel.py --dry-run --excel bilan.xlsx
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
import uuid
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
EXCEL_EPOCH = datetime(1899, 12, 30)
DEFAULT_BCRYPT = "$2b$10$TXYWhE3R.1Q/XsSdCM0W3OzvoYdkBkr1EK28QlvQGvd1fUrGgvdQa"  # MonMot2Passe!


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

def norm_name(value: str) -> str:
    s = unicodedata.normalize("NFD", value or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower().replace("'", "").replace("’", "")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()


# Correspondances connues Excel ↔ base (nom normalisé Excel → clé index)
NAME_ALIASES: dict[str, str] = {
    "atock a nwatchock stephane": "atock stephane",
    "atock a nwatchock stephan": "atock stephane",
    "meva a lucien": "mevaa lucien",
    "ngabireng claude marie": "ngabireng c m",
    "ekobo akoa brice": "ekobo brice",
    "elimbi aime": "elime aime",
    "enyegue a nyam": "enyegue nyam",
    "kangmogne abraham": "kammogne abraham",
    "madjadoumbaye jeremie": "madjadoumbaye j",
    "mandeng": "mandeng mandeng lucien",
    "ngnikam emmanuel": "ngnikam ngnikam benjamin",
    "pettang crepin": "pettang chrepin",
    "tale": "tale kalachi herve",
    "videme": "videme bossou olivier",
    "bitang": "bitang a ziem daniel",
    "manjia blanche": "manjia marceline",
}


def to_decimal(value: Any) -> Decimal:
    if value is None or value == "":
        return Decimal("0")
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    s = str(value).strip().replace("\u202f", "").replace(" ", "").replace(",", ".")
    if not s:
        return Decimal("0")
    try:
        return Decimal(s)
    except InvalidOperation:
        return Decimal("0")


def sql_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "''")


def excel_serial_to_label(serial: Any) -> str:
    try:
        n = int(float(serial))
        dt = EXCEL_EPOCH + timedelta(days=n)
        return dt.strftime("%B %Y")
    except (ValueError, TypeError, OverflowError):
        return str(serial)


def compute_etat(dette_solidarite: Decimal) -> str:
    if dette_solidarite >= Decimal("250000"):
        return "Inactif"
    if dette_solidarite > 0:
        return "non a jour"
    return "a jour"


# ---------------------------------------------------------------------------
# Lecture XLSX (stdlib)
# ---------------------------------------------------------------------------

def col_row(ref: str) -> tuple[str, int]:
    m = re.match(r"([A-Z]+)(\d+)", ref)
    if not m:
        return "", 0
    return m.group(1), int(m.group(2))


def col_index(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n


def load_workbook(path: Path) -> dict[str, dict[int, dict[int, Any]]]:
    sheets: dict[str, dict[int, dict[int, Any]]] = {}
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("m:si", NS):
                shared.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target = {rel.get("Id"): rel.get("Target") for rel in rels}

        for sh in wb.findall("m:sheets/m:sheet", NS):
            name = sh.get("name") or "sheet"
            rid = sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = "xl/" + rid_to_target[rid].lstrip("/")
            root = ET.fromstring(z.read(target))
            rows: dict[int, dict[int, Any]] = {}
            for row in root.findall("m:sheetData/m:row", NS):
                rnum = int(row.get("r"))
                cells: dict[int, Any] = {}
                for c in row.findall("m:c", NS):
                    ref = c.get("r")
                    if not ref:
                        continue
                    col, _ = col_row(ref)
                    ci = col_index(col)
                    t = c.get("t")
                    v = c.find("m:v", NS)
                    raw = v.text if v is not None else ""
                    if t == "s" and raw != "":
                        val: Any = shared[int(raw)]
                    elif t == "n" and raw:
                        f = float(raw)
                        val = int(f) if f.is_integer() else f
                    else:
                        val = raw
                    cells[ci] = val
                rows[rnum] = cells
            sheets[name] = rows
    return sheets


def find_header_col(rows: dict[int, dict[int, Any]], labels: list[str], search_rows: range = range(1, 4)) -> int | None:
    targets = {norm_name(l) for l in labels}
    for r in search_rows:
        for ci, val in rows.get(r, {}).items():
            if norm_name(str(val)) in targets:
                return ci
    return None


def find_header_cols_containing(rows: dict[int, dict[int, Any]], substring: str, search_rows: range = range(1, 4)) -> list[int]:
    out = []
    sub = norm_name(substring)
    for r in search_rows:
        for ci, val in rows.get(r, {}).items():
            if sub in norm_name(str(val)):
                out.append(ci)
    return sorted(set(out))


def read_data_rows(rows: dict[int, dict[int, Any]], name_col: int, start_row: int = 3) -> list[tuple[str, dict[int, Any]]]:
    data = []
    for r in sorted(rows):
        if r < start_row:
            continue
        cells = rows[r]
        name = str(cells.get(name_col, "")).strip()
        if not name or norm_name(name) in {"total", "totaux", "nom et prenom"}:
            continue
        if name.isdigit() and len(cells) <= 2:
            continue
        data.append((name, cells))
    return data


# ---------------------------------------------------------------------------
# MySQL
# ---------------------------------------------------------------------------

class MySQL:
    def __init__(self, host: str, port: int, user: str, password: str, database: str, docker: str | None = None):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.docker = docker

    def query(self, sql: str) -> list[list[str]]:
        if self.docker:
            cmd = [
                "docker", "exec", "-i", self.docker,
                "mysql", f"-u{self.user}", f"-p{self.password}",
                "--default-character-set=utf8mb4", self.database,
                "-N", "-B", "-e", sql,
            ]
        else:
            cmd = [
                "mysql", f"-h{self.host}", f"-P{self.port}", f"-u{self.user}", f"-p{self.password}",
                "--default-character-set=utf8mb4", self.database,
                "-N", "-B", "-e", sql,
            ]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())
        lines = [l.split("\t") for l in proc.stdout.strip().splitlines() if l.strip()]
        return lines

    def execute_script(self, sql: str) -> None:
        if self.docker:
            cmd = [
                "docker", "exec", "-i", self.docker,
                "mysql", f"-u{self.user}", f"-p{self.password}",
                "--default-character-set=utf8mb4", self.database,
            ]
        else:
            cmd = [
                "mysql", f"-h{self.host}", f"-P{self.port}", f"-u{self.user}", f"-p{self.password}",
                "--default-character-set=utf8mb4", self.database,
            ]
        proc = subprocess.run(cmd, input=sql, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.strip() or proc.stdout.strip())


# ---------------------------------------------------------------------------
# Appariement membres
# ---------------------------------------------------------------------------

@dataclass
class MembreRow:
    id: str
    nom: str
    prenom: str
    couriel: str


def load_db_members(db: MySQL) -> list[MembreRow]:
    rows = db.query(
        "SELECT id, nom, IFNULL(prenom,''), IFNULL(couriel,'') FROM membres ORDER BY nom, prenom"
    )
    return [MembreRow(r[0], r[1], r[2], r[3]) for r in rows]


def build_name_index(members: list[MembreRow]) -> dict[str, MembreRow]:
    index: dict[str, MembreRow] = {}
    for m in members:
        keys = {
            norm_name(f"{m.nom} {m.prenom}"),
            norm_name(f"{m.prenom} {m.nom}"),
            norm_name(m.nom),
            norm_name(f"{m.nom} {m.prenom[0]}") if m.prenom else "",
        }
        for k in keys:
            if k:
                index.setdefault(k, m)
    return index


def match_member(name: str, index: dict[str, MembreRow], members: list[MembreRow]) -> MembreRow | None:
    n = norm_name(name)
    alias = NAME_ALIASES.get(n)
    if alias and alias in index:
        return index[alias]
    if n in index:
        return index[n]
    parts = n.split()
    if len(parts) >= 2:
        for key in (f"{parts[0]} {parts[-1]}", f"{parts[-1]} {parts[0]}"):
            if key in index:
                return index[key]
    # Nom Excel tronqué (ex. « Bitang », « Tale ») → premier mot du nom en base
    if parts:
        surname = parts[0]
        candidates = [m for m in members if norm_name(m.nom).split()[0] == surname or norm_name(m.nom).startswith(surname + " ")]
        if len(candidates) == 1:
            return candidates[0]
        if len(parts) >= 2 and candidates:
            pre = parts[1][:3]
            for m in candidates:
                if norm_name(m.prenom).startswith(pre):
                    return m
    # tokens subset match
    tokens = set(parts)
    best: MembreRow | None = None
    best_score = 0
    for m in members:
        mt = set(norm_name(f"{m.nom} {m.prenom}").split())
        inter = len(tokens & mt)
        if inter > best_score and inter >= max(2, len(tokens) - 2):
            best_score = inter
            best = m
    return best


# ---------------------------------------------------------------------------
# Import members.json
# ---------------------------------------------------------------------------

def import_members_json(db: MySQL, path: Path, dry_run: bool) -> int:
    try:
        import bcrypt
    except ImportError:
        print("⚠ bcrypt non installé — mots de passe = MonMot2Passe! pour tous", file=sys.stderr)
        bcrypt = None

    data = json.loads(path.read_text(encoding="utf-8"))
    used_phones: set[str] = set()
    existing = {r[0].lower() for r in db.query("SELECT couriel FROM membres")}
    placeholder = 610000001
    inserts = []

    for m in data:
        email = (m.get("email") or "").strip()
        if not email:
            continue
        if email.lower() in existing:
            continue
        nom = (m.get("lastname") or "").strip()
        prenom = (m.get("firstname") or "").strip()
        phone = (m.get("phone") or "").strip()
        if not phone:
            while str(placeholder) in used_phones:
                placeholder += 1
            phone = str(placeholder)
            placeholder += 1
        used_phones.add(phone)
        pwd = m.get("password") or "MonMot2Passe!"
        if bcrypt:
            hashed = bcrypt.hashpw(pwd.encode(), bcrypt.gensalt(rounds=10)).decode()
        else:
            hashed = DEFAULT_BCRYPT
        mid = str(uuid.uuid4())
        inserts.append(
            f"('{mid}', '{sql_escape(nom)}', '{sql_escape(prenom)}', '{sql_escape(email)}', "
            f"'{phone}', '{hashed}', 1, 0, 0, 0, 0, 0, 0, 0, 'a jour')"
        )

    if not inserts:
        return 0
    sql = (
        "INSERT INTO membres (id, nom, prenom, couriel, telephone, mot_de_passe, "
        "compte_verifie, inscription_payee, solidarite_payee, dette_inscription, "
        "dette_solidarite, epargne, interet, dette, etat) VALUES\n"
        + ",\n".join(inserts)
        + ";"
    )
    if dry_run:
        print(f"[dry-run] Créerait {len(inserts)} membres depuis {path.name}")
    else:
        db.execute_script(sql)
        print(f"✓ {len(inserts)} membres créés depuis {path.name}")
    return len(inserts)


# ---------------------------------------------------------------------------
# Reset financier
# ---------------------------------------------------------------------------

def reset_financial(db: MySQL, dry_run: bool) -> None:
    sql = """
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM remboursements;
DELETE FROM prets;
DELETE FROM sorties;
DELETE FROM versements;
UPDATE parametres_generaux SET caisse_inscriptions = 0, caisse_solidarites = 0, caisse_epargnes = 0;
UPDATE membres SET
  inscription_payee = 0,
  solidarite_payee = 0,
  dette_inscription = 0,
  dette_solidarite = 0,
  epargne = 0,
  interet = 0,
  dette = 0,
  etat = 'a jour';
SET FOREIGN_KEY_CHECKS = 1;
"""
    if dry_run:
        print("[dry-run] Réinitialiserait données financières (versements, sorties, prêts, caisses, soldes membres)")
    else:
        db.execute_script(sql)
        print("✓ Données financières réinitialisées")


# ---------------------------------------------------------------------------
# Import Excel
# ---------------------------------------------------------------------------

@dataclass
class ImportStats:
    matched: int = 0
    unmatched: list[str] = field(default_factory=list)
    caisse_inscriptions: Decimal = Decimal("0")
    caisse_solidarites: Decimal = Decimal("0")
    caisse_epargnes: Decimal = Decimal("0")
    versements: int = 0
    prets: int = 0
    remboursements: int = 0


def get_exercice_id(db: MySQL) -> str:
    rows = db.query("SELECT id FROM exercices WHERE statut = 'en cours' LIMIT 1")
    if not rows:
        raise RuntimeError("Aucun exercice en cours. Ouvrez un exercice avant l'import.")
    return rows[0][0]


def import_excel(db: MySQL, excel_path: Path, dry_run: bool) -> ImportStats:
    wb = load_workbook(excel_path)
    stats = ImportStats()
    members = load_db_members(db)
    index = build_name_index(members)
    exercice_id = get_exercice_id(db)

    updates: list[str] = []
    versement_sql: list[str] = []
    pret_sql: list[str] = []
    remb_sql: list[str] = []

    # --- Inscription / Renflouement ---
    sheet_insc = wb.get("Synthese_Inscription 2026")
    if sheet_insc:
        name_col = find_header_col(sheet_insc, ["Nom et prénom"]) or 2
        reste_col = find_header_col(sheet_insc, ["Reste"]) or 18
        total_col = find_header_col(sheet_insc, ["TOTAL versement par membre"]) or 16
        for name, cells in read_data_rows(sheet_insc, name_col):
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Inscription] {name}")
                continue
            stats.matched += 1
            reste = max(Decimal("0"), to_decimal(cells.get(reste_col)))
            total_paid = max(Decimal("0"), to_decimal(cells.get(total_col)))
            stats.caisse_inscriptions += total_paid
            updates.append(
                f"UPDATE membres SET dette_inscription = {reste}, "
                f"inscription_payee = {1 if reste == 0 else 0} "
                f"WHERE id = '{m.id}';"
            )
            if total_paid > 0:
                vid = str(uuid.uuid4())
                versement_sql.append(
                    f"('{vid}', {total_paid}, NOW(), '{m.id}', '{exercice_id}', "
                    f"'inscription', 'accepte', 'Import Excel — renflouement/inscription 2026')"
                )

    # --- Solidarité ---
    sheet_sol = wb.get("Solidarité 2026")
    solidarite_by_member: dict[str, Decimal] = {}
    if sheet_sol:
        name_col = find_header_col(sheet_sol, ["Nom et prénom"]) or 2
        dette_col = find_header_col(sheet_sol, ["DETTE"]) or 19
        total_col = find_header_col(sheet_sol, ["TOTAL versement en 2025", "TOTAL versement"]) or 17
        for name, cells in read_data_rows(sheet_sol, name_col):
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Solidarité] {name}")
                continue
            dette = max(Decimal("0"), to_decimal(cells.get(dette_col)))
            total_paid = max(Decimal("0"), to_decimal(cells.get(total_col)))
            solidarite_by_member[m.id] = dette
            stats.caisse_solidarites += total_paid
            etat = compute_etat(dette)
            updates.append(
                f"UPDATE membres SET dette_solidarite = {dette}, "
                f"solidarite_payee = {1 if dette == 0 else 0}, etat = '{etat}' "
                f"WHERE id = '{m.id}';"
            )
            if total_paid > 0:
                vid = str(uuid.uuid4())
                versement_sql.append(
                    f"('{vid}', {total_paid}, NOW(), '{m.id}', '{exercice_id}', "
                    f"'solidarite', 'accepte', 'Import Excel — solidarité 2026')"
                )

    # Recalcul etat si membre pas dans feuille solidarité mais dette inscription seulement
    for m in members:
        if m.id not in solidarite_by_member:
            pass  # etat reste géré par solidarité existante ou 'a jour'

    # --- Épargne ---
    sheet_ep = wb.get("Epargne 2026")
    if sheet_ep:
        name_col = find_header_col(sheet_ep, ["Nom et prénom"]) or 2
        fin_col = find_header_col(sheet_ep, ["Epargne Fin 2025"]) or 3
        total_col = find_header_col(sheet_ep, ["Total 2026"]) or 16
        month_cols = []
        for r in [2]:
            for ci, val in sheet_ep.get(r, {}).items():
                if ci >= 4 and ci < (total_col or 99):
                    try:
                        int(float(val))
                        month_cols.append(ci)
                    except (ValueError, TypeError):
                        pass
        month_cols = sorted(set(month_cols))

        for name, cells in read_data_rows(sheet_ep, name_col):
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Épargne] {name}")
                continue
            total = max(Decimal("0"), to_decimal(cells.get(total_col)))
            stats.caisse_epargnes += total
            updates.append(f"UPDATE membres SET epargne = {total} WHERE id = '{m.id}';")

            fin2025 = to_decimal(cells.get(fin_col))
            if fin2025 > 0:
                vid = str(uuid.uuid4())
                versement_sql.append(
                    f"('{vid}', {fin2025}, NOW(), '{m.id}', '{exercice_id}', "
                    f"'epargne', 'accepte', 'Import Excel — solde fin 2025')"
                )
            sum_parts = fin2025 if fin2025 > 0 else Decimal("0")
            for ci in month_cols:
                amt = to_decimal(cells.get(ci))
                if amt > 0:
                    label = excel_serial_to_label(sheet_ep.get(2, {}).get(ci, ci))
                    vid = str(uuid.uuid4())
                    versement_sql.append(
                        f"('{vid}', {amt}, NOW(), '{m.id}', '{exercice_id}', "
                        f"'epargne', 'accepte', 'Import Excel — épargne {sql_escape(label)}')"
                    )
                    sum_parts += amt
            remainder = total - sum_parts
            if remainder > 0:
                vid = str(uuid.uuid4())
                versement_sql.append(
                    f"('{vid}', {remainder}, NOW(), '{m.id}', '{exercice_id}', "
                    f"'epargne', 'accepte', 'Import Excel — complément épargne 2026')"
                )

    # --- Intérêts ---
    sheet_int = wb.get("Interets 2026")
    if sheet_int:
        name_col = find_header_col(sheet_int, ["Nom et prénom"]) or 2
        total_col = find_header_col(sheet_int, ["Total 2026"]) or 15
        for name, cells in read_data_rows(sheet_int, name_col):
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Intérêts] {name}")
                continue
            interet = max(Decimal("0"), to_decimal(cells.get(total_col)))
            updates.append(f"UPDATE membres SET interet = {interet} WHERE id = '{m.id}';")

    # --- Emprunts ---
    sheet_pret = wb.get("Emprunts 2026")
    if sheet_pret:
        name_col = find_header_col(sheet_pret, ["Nom et prénom"]) or 2
        total_col = find_header_col(sheet_pret, ["Total 2026"]) or 15
        params = db.query(
            "SELECT taux_interet_emprunts, duree_maximale_emprunt FROM parametres_generaux LIMIT 1"
        )
        taux = Decimal(params[0][0]) if params else Decimal("0.03")
        duree = int(params[0][1]) if params else 3
        for name, cells in read_data_rows(sheet_pret, name_col):
            montant = to_decimal(cells.get(total_col))
            if montant <= 0:
                continue
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Emprunt] {name}")
                continue
            pid = str(uuid.uuid4())
            from decimal import ROUND_DOWN
            interets = (montant * taux).quantize(Decimal("1"), rounding=ROUND_DOWN)
            pret_sql.append(
                f"('{pid}', {montant}, NOW(), '{m.id}', '{exercice_id}', 'Emprunt import Excel', "
                f"{montant}, DATE_ADD(NOW(), INTERVAL {duree} MONTH), 'non rembourse', NULL)"
            )
            updates.append(f"UPDATE membres SET dette = dette + {montant} WHERE id = '{m.id}';")
            stats.prets += 1

    # --- Remboursements ---
    sheet_rem = wb.get("Remboursements 2026")
    if sheet_rem:
        name_col = find_header_col(sheet_rem, ["Nom et prénom"]) or 2
        total_col = find_header_col(sheet_rem, ["Total 2026"]) or 15
        for name, cells in read_data_rows(sheet_rem, name_col):
            montant = to_decimal(cells.get(total_col))
            if montant <= 0:
                continue
            m = match_member(name, index, members)
            if not m:
                stats.unmatched.append(f"[Remboursement] {name}")
                continue
            # prêt actif du membre
            prets = db.query(
                f"SELECT id FROM prets WHERE membre_id = '{m.id}' AND statut = 'non rembourse' "
                f"ORDER BY date_pret DESC LIMIT 1"
            )
            if not prets:
                stats.unmatched.append(f"[Remboursement sans prêt] {name}")
                continue
            pret_id = prets[0][0]
            rid = str(uuid.uuid4())
            remb_sql.append(
                f"('{rid}', '{pret_id}', '{exercice_id}', {montant}, NOW(), 'valide_tr')"
            )
            updates.append(
                f"UPDATE membres SET dette = GREATEST(0, dette - {montant}) WHERE id = '{m.id}';"
            )
            stats.remboursements += 1

    stats.versements = len(versement_sql)

    # --- Assemblage SQL ---
    chunks = ["SET FOREIGN_KEY_CHECKS = 0;"]
    chunks.extend(updates)
    if versement_sql:
        chunks.append(
            "INSERT INTO versements (id, montant, date_versement, membre_id, exercice_id, raison, statut, description) VALUES\n"
            + ",\n".join(versement_sql)
            + ";"
        )
    if pret_sql:
        chunks.append(
            "INSERT INTO prets (id, montant, date_pret, membre_id, exercice_id, raison, "
            "montant_a_rembourser, date_echeance, statut, liste_creatiers) VALUES\n"
            + ",\n".join(pret_sql)
            + ";"
        )
    if remb_sql:
        chunks.append(
            "INSERT INTO remboursements (id, pret_id, exercice_id, montant, date_remboursement, statut) VALUES\n"
            + ",\n".join(remb_sql)
            + ";"
        )
    chunks.append(
        f"UPDATE parametres_generaux SET "
        f"caisse_inscriptions = {stats.caisse_inscriptions}, "
        f"caisse_solidarites = {stats.caisse_solidarites}, "
        f"caisse_epargnes = {stats.caisse_epargnes};"
    )
    chunks.append("SET FOREIGN_KEY_CHECKS = 1;")

    full_sql = "\n".join(chunks)

    if dry_run:
        print(f"[dry-run] {len(updates)} mises à jour membres")
        print(f"[dry-run] {stats.versements} versements, {stats.prets} prêts, {stats.remboursements} remboursements")
        print(f"[dry-run] Caisses → inscriptions {stats.caisse_inscriptions}, "
              f"solidarités {stats.caisse_solidarites}, épargnes {stats.caisse_epargnes}")
    else:
        db.execute_script(full_sql)
        print("✓ Import Excel terminé")

    return stats


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Import Bilan Excel → base Mutuelle")
    parser.add_argument(
        "--excel", "-e",
        type=Path,
        default=Path.home() / "Desktop" / "Bilan_MEPY_2025-2026_v0_RO.xlsx",
        help="Chemin du fichier Excel Bilan",
    )
    parser.add_argument("--members-json", type=Path, help="Importer d'abord les membres depuis members.json")
    parser.add_argument("--reset", action="store_true", help="Réinitialiser données financières avant import")
    parser.add_argument("--dry-run", action="store_true", help="Simulation sans écriture")
    parser.add_argument("--docker", default="mutuelle-db", help="Conteneur Docker MySQL (vide = connexion directe)")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3307)
    parser.add_argument("--user", default="mutuelle_user")
    parser.add_argument("--password", default="mutuelle_pass")
    parser.add_argument("--database", default="mutuelle_db")
    args = parser.parse_args()

    if not args.excel.exists():
        print(f"Fichier Excel introuvable : {args.excel}", file=sys.stderr)
        return 1

    docker = args.docker if args.docker else None
    db = MySQL(args.host, args.port, args.user, args.password, args.database, docker)

    print(f"Excel : {args.excel}")
    print(f"MySQL : {'docker:' + docker if docker else f'{args.host}:{args.port}'}/{args.database}")

    if args.members_json:
        if not args.members_json.exists():
            print(f"members.json introuvable : {args.members_json}", file=sys.stderr)
            return 1
        import_members_json(db, args.members_json, args.dry_run)

    if args.reset:
        reset_financial(db, args.dry_run)

    stats = import_excel(db, args.excel, args.dry_run)

    if stats.unmatched:
        print(f"\n⚠ {len(stats.unmatched)} lignes non appariées :")
        for u in stats.unmatched[:20]:
            print(f"  - {u}")
        if len(stats.unmatched) > 20:
            print(f"  … et {len(stats.unmatched) - 20} autres")

    print(
        f"\nRésumé : caisses inscriptions={stats.caisse_inscriptions} | "
        f"solidarités={stats.caisse_solidarites} | épargnes={stats.caisse_epargnes}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
