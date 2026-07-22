package com.mutuelle.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationHorlogeRequest {
    /** Date/heure simulée, ex. {@code 2026-10-25T12:00:00} */
    private String date;
}
