package com.exemplo.demo.catalog;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final CatalogService service;
    public CatalogController(CatalogService service) { this.service = service; }
    @GetMapping("/courses") public List<CourseDto> courses() { return service.courses(); }
    @GetMapping("/courses/{id}") public ResponseEntity<CourseDto> course(@PathVariable long id) { return ResponseEntity.of(service.course(id)); }
    @GetMapping("/subjects") public List<SubjectDto> subjects() { return service.subjects(); }
    @GetMapping("/subjects/{id}") public ResponseEntity<SubjectDto> subject(@PathVariable long id) { return ResponseEntity.of(service.subject(id)); }
    @GetMapping("/course-subjects") public List<CourseSubjectDto> relations(@RequestParam(required = false) Long courseId) {
        return courseId == null ? service.courseSubjects() : service.courseSubjectsByCourse(courseId);
    }
    @GetMapping("/monitoring-vacancies") public List<MonitoringVacancyDto> vacancies() { return service.vacancies(); }
    @GetMapping("/monitoring-vacancies/{id}") public ResponseEntity<MonitoringVacancyDto> vacancy(@PathVariable long id) { return ResponseEntity.of(service.vacancy(id)); }
}
