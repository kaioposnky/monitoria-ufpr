package com.sistema.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import jakarta.servlet.http.HttpServletRequest;

import java.time.OffsetDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    ResponseEntity<?> recursoNaoEncontrado(RecursoNaoEncontradoException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(erro(HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler({RegraNegocioException.class, IllegalArgumentException.class})
    ResponseEntity<?> regraNegocio(RuntimeException exception, HttpServletRequest request) {
        return ResponseEntity.status(exception instanceof RegraNegocioException
                        ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST)
                .body(erro(exception instanceof RegraNegocioException ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST,
                        exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> dadosInvalidos(MethodArgumentNotValidException exception, HttpServletRequest request) {
        var erros = exception.getBindingResult().getFieldErrors().stream()
                .collect(java.util.stream.Collectors.toMap(
                        erro -> erro.getField(),
                        erro -> erro.getDefaultMessage() == null ? "Valor inválido" : erro.getDefaultMessage(),
                        (atual, ignorado) -> atual));
        return ResponseEntity.badRequest().body(Map.of("timestamp", OffsetDateTime.now(),
                "status", 400, "codigo", "DADOS_INVALIDOS", "caminho", request.getRequestURI(), "erros", erros));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> integridade(DataIntegrityViolationException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(erro(HttpStatus.CONFLICT, "A operação viola uma restrição de integridade.", request.getRequestURI()));
    }

    private Map<String, Object> erro(HttpStatus status, String mensagem, String caminho) {
        return Map.of("timestamp", OffsetDateTime.now(), "status", status.value(),
                "codigo", status.name(), "mensagem", mensagem, "caminho", caminho);
    }
}
