package com.exemplo.demo.catalog;
public record CourseSubjectDto(Long courseId, Long subjectId) {
    static CourseSubjectDto from(CourseSubject x) { return new CourseSubjectDto(x.getId().getCourseId(), x.getId().getSubjectId()); }
}
