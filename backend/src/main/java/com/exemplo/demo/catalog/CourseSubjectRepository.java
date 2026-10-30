package com.exemplo.demo.catalog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CourseSubjectRepository extends JpaRepository<CourseSubject, CourseSubjectId> {
    List<CourseSubject> findByIdCourseId(Long courseId);
    List<CourseSubject> findByIdSubjectId(Long subjectId);
}
