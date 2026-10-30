package com.exemplo.demo.catalog;
public record MonitoringVacancyDto(Long id, Long subjectId, Long professorId, String semester,
        Integer positions, String type, String requirements, String description, String status) {
    static MonitoringVacancyDto from(MonitoringVacancy x) {
        return new MonitoringVacancyDto(x.getId(), x.getSubjectId(), x.getProfessorId(), x.getSemestre(),
                x.getQuantidadeVagas(), x.getTipoVaga(), x.getRequisitos(), x.getDescricao(), x.getStatus());
    }
}
