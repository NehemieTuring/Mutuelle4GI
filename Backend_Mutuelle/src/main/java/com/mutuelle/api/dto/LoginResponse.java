package com.mutuelle.api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private boolean success;
    private String message;
    private Object data;
}
