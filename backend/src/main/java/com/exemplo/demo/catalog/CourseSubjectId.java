package com.exemplo.demo.catalog;

import jakarta.persistence.*;
import java.io.Serializable;

@Embeddable
public class CourseSubjectId implements Serializable {
    @Column(name = "curso_id") private Long courseId;
    @Column(name = "materia_id") private Long subjectId;
    protected CourseSubjectId() {}
    public CourseSubjectId(Long courseId, Long subjectId) { this.courseId = courseId; this.subjectId = subjectId; }
    public Long getCourseId() { return courseId; }
    public Long getSubjectId() { return subjectId; }
    @Override public boolean equals(Object o) { return o instanceof CourseSubjectId x && courseId.equals(x.courseId) && subjectId.equals(x.subjectId); }
    @Override public int hashCode() { return java.util.Objects.hash(courseId, subjectId); }
}
