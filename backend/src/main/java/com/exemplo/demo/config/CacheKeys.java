package com.exemplo.demo.config;

public final class CacheKeys {
    private static final String PREFIX = "monitoria:public:v1:";

    private CacheKeys() {}

    public static String courses() { return PREFIX + "courses:list"; }
    public static String course(long id) { return PREFIX + "courses:detail:" + id; }
    public static String subjects() { return PREFIX + "subjects:list"; }
    public static String subject(long id) { return PREFIX + "subjects:detail:" + id; }
    public static String courseSubjects() { return PREFIX + "course-subjects:list"; }
    public static String courseSubjectsByCourse(long courseId) {
        return PREFIX + "course-subjects:course:" + courseId;
    }
    public static String courseSubjectsBySubject(long subjectId) {
        return PREFIX + "course-subjects:subject:" + subjectId;
    }
    public static String vacancies() { return PREFIX + "vacancies:list"; }
    public static String vacancy(long id) { return PREFIX + "vacancies:detail:" + id; }
}
