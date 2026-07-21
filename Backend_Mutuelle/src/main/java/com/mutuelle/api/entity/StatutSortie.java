package com.mutuelle.api.entity;

public enum StatutSortie {
    en_attente_secretaire_general,
    en_attente_tresorier,
    accepte_par_sg_refuse_par_tr,
    accepte_par_sg_accepte_par_tr,
    refuse_par_sg_accepte_par_tr,
    refuse_par_sg_refuse_par_tr,
    recue_par_membre
}
