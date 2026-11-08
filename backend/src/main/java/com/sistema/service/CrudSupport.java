package com.sistema.service;

import com.sistema.exception.RecursoNaoEncontradoException;

import java.util.function.Supplier;

final class CrudSupport {
    private CrudSupport() {}
    static <T> T require(Supplier<T> lookup, String message) {
        T value = lookup.get();
        if (value == null) throw new RecursoNaoEncontradoException(message);
        return value;
    }
}
