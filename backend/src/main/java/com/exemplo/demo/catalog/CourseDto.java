package com.exemplo.demo.catalog;
public record CourseDto(Long id, String code, String name, String sector) {
    static CourseDto from(Course x) { return new CourseDto(x.getId(), x.getCodigo(), x.getNome(), x.getSetor()); }
}
