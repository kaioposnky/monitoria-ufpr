package com.sistema.dto.response;

public record AuthResponseDTO(
        String token,
        AuthUserDTO usuario
) {
}
