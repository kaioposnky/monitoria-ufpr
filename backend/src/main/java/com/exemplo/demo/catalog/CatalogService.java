package com.exemplo.demo.catalog;

import com.exemplo.demo.config.CacheKeys;
import com.exemplo.demo.config.CacheService;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CatalogService {
    private final CourseRepository courses;
    private final SubjectRepository subjects;
    private final CourseSubjectRepository relations;
    private final MonitoringVacancyRepository vacancies;
    private final CacheService cache;

    public CatalogService(CourseRepository courses, SubjectRepository subjects, CourseSubjectRepository relations,
                          MonitoringVacancyRepository vacancies, CacheService cache) {
        this.courses = courses; this.subjects = subjects; this.relations = relations; this.vacancies = vacancies; this.cache = cache;
    }

    public List<CourseDto> courses() {
        return cache.get(CacheKeys.courses(), CourseDto[].class).map(java.util.Arrays::asList)
                .orElseGet(() -> { List<CourseDto> value = courses.findAll().stream().map(CourseDto::from).toList(); cache.put(CacheKeys.courses(), value); return value; });
    }
    public Optional<CourseDto> course(long id) {
        return cache.get(CacheKeys.course(id), CourseDto.class)
                .or(() -> courses.findById(id).map(CourseDto::from).map(x -> { cache.put(CacheKeys.course(id), x); return x; }));
    }
    public List<SubjectDto> subjects() {
        return cache.get(CacheKeys.subjects(), SubjectDto[].class).map(java.util.Arrays::asList)
                .orElseGet(() -> { List<SubjectDto> value = subjects.findAll().stream().map(SubjectDto::from).toList(); cache.put(CacheKeys.subjects(), value); return value; });
    }
    public Optional<SubjectDto> subject(long id) {
        return cache.get(CacheKeys.subject(id), SubjectDto.class)
                .or(() -> subjects.findById(id).map(SubjectDto::from).map(x -> { cache.put(CacheKeys.subject(id), x); return x; }));
    }
    public List<CourseSubjectDto> courseSubjects() {
        return cache.get(CacheKeys.courseSubjects(), CourseSubjectDto[].class).map(java.util.Arrays::asList)
                .orElseGet(() -> { List<CourseSubjectDto> value = relations.findAll().stream().map(CourseSubjectDto::from).toList(); cache.put(CacheKeys.courseSubjects(), value); return value; });
    }
    public List<CourseSubjectDto> courseSubjectsByCourse(long id) {
        return cache.get(CacheKeys.courseSubjectsByCourse(id), CourseSubjectDto[].class).map(java.util.Arrays::asList)
                .orElseGet(() -> { List<CourseSubjectDto> value = relations.findByIdCourseId(id).stream().map(CourseSubjectDto::from).toList(); cache.put(CacheKeys.courseSubjectsByCourse(id), value); return value; });
    }
    public List<MonitoringVacancyDto> vacancies() {
        return cache.get(CacheKeys.vacancies(), MonitoringVacancyDto[].class).map(java.util.Arrays::asList)
                .orElseGet(() -> { List<MonitoringVacancyDto> value = vacancies.findAll().stream().map(MonitoringVacancyDto::from).toList(); cache.put(CacheKeys.vacancies(), value); return value; });
    }
    public Optional<MonitoringVacancyDto> vacancy(long id) {
        return cache.get(CacheKeys.vacancy(id), MonitoringVacancyDto.class)
                .or(() -> vacancies.findById(id).map(MonitoringVacancyDto::from).map(x -> { cache.put(CacheKeys.vacancy(id), x); return x; }));
    }

    public void invalidateCourse(long id) { cache.evict(CacheKeys.courses()); cache.evict(CacheKeys.course(id)); }
    public void invalidateSubject(long id) { cache.evict(CacheKeys.subjects()); cache.evict(CacheKeys.subject(id)); cache.evict(CacheKeys.courseSubjects()); }
    public void invalidateRelation(long courseId, long subjectId) {
        cache.evict(CacheKeys.courseSubjects()); cache.evict(CacheKeys.courseSubjectsByCourse(courseId));
        cache.evict(CacheKeys.courseSubjectsBySubject(subjectId));
    }
    public void invalidateVacancy(long id) { cache.evict(CacheKeys.vacancies()); cache.evict(CacheKeys.vacancy(id)); }
}
