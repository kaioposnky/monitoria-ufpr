package com.exemplo.demo.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "cursos_materias")
public class CourseSubject {
    @EmbeddedId private CourseSubjectId id;
    protected CourseSubject() {}
    public CourseSubject(long courseId, long subjectId) { this.id = new CourseSubjectId(courseId, subjectId); }
    public CourseSubjectId getId() { return id; }
}
