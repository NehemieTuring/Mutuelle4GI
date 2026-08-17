#!/usr/bin/env bash
# Lance l'import Excel Bilan → base Mutuelle (Docker local par défaut)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

EXCEL="${EXCEL:-$HOME/Desktop/Bilan_MEPY_2025-2026_v0_RO.xlsx}"
MEMBERS_JSON="${MEMBERS_JSON:-$ROOT/../members.json}"
DOCKER="${DOCKER:-mutuelle-db}"

ARGS=(
  --excel "$EXCEL"
  --docker "$DOCKER"
  --user "${DB_USER:-mutuelle_user}"
  --password "${DB_PASSWORD:-mutuelle_pass}"
  --database "${DB_NAME:-mutuelle_db}"
)

# Ajouter members.json si le fichier existe (sauf --skip-members)
SKIP_MEMBERS=0
USER_ARGS=()
for arg in "$@"; do
  if [[ "$arg" == "--skip-members" ]]; then
    SKIP_MEMBERS=1
  else
    USER_ARGS+=("$arg")
  fi
done

if [[ "$SKIP_MEMBERS" -eq 0 ]] && [[ -f "$MEMBERS_JSON" ]]; then
  ARGS+=(--members-json "$MEMBERS_JSON")
fi

ARGS+=("${USER_ARGS[@]}")

exec python3 "$SCRIPT_DIR/import_bilan_excel.py" "${ARGS[@]}"
