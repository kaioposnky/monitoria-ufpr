package com.exemplo.demo.catalog;
public record SubjectDto(Long id, String code, String name, String department) {
    static SubjectDto from(Subject x) { return new SubjectDto(x.getId(), x.getCodigo(), x.getNome(), x.getDepartamento()); }
}
