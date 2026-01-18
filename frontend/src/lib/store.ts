"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, PlanResponse, StudyPlanResponse } from "@/lib/api";

// ==========================================
// DATA VALIDATION TYPES
// ==========================================
export type DataSource = "demo" | "uploaded" | "manual" | null;

export interface ValidationError {
    type: "duplicate_code" | "invalid_prereq" | "invalid_credits" | "circular_dep" | "missing_completed";
    message: string;
    courseCode?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
export function validateCourseData(
    courses: Course[],
    completedCourses: string[]
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const courseCodes = new Set<string>();

    // Check for duplicate course codes
    for (const course of courses) {
        if (courseCodes.has(course.code)) {
            errors.push({
                type: "duplicate_code",
                message: `Duplicate course code: ${course.code}`,
                courseCode: course.code,
            });
        }
        courseCodes.add(course.code);
    }

    // Check prerequisites reference existing courses
    for (const course of courses) {
        for (const prereq of course.prerequisites) {
            if (!courseCodes.has(prereq)) {
                errors.push({
                    type: "invalid_prereq",
                    message: `Course ${course.code} has unknown prerequisite: ${prereq}`,
                    courseCode: course.code,
                });
            }
        }
    }

    // Check credit values are numeric and positive
    for (const course of courses) {
        if (typeof course.credits !== "number" || course.credits <= 0) {
            errors.push({
                type: "invalid_credits",
                message: `Course ${course.code} has invalid credits: ${course.credits}`,
                courseCode: course.code,
            });
        }
    }

    // Check for circular dependencies
    const circularDeps = detectCircularDependencies(courses);
    if (circularDeps.length > 0) {
        errors.push({
            type: "circular_dep",
            message: `Circular dependency detected: ${circularDeps.join(" → ")}`,
        });
    }

    // Check completed courses exist in uploaded data
    for (const completed of completedCourses) {
        if (!courseCodes.has(completed)) {
            warnings.push(`Completed course "${completed}" not found in course data`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

function detectCircularDependencies(courses: Course[]): string[] {
    const courseMap = new Map<string, Course>();
    courses.forEach((c) => courseMap.set(c.code, c));

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(code: string, path: string[]): string[] | null {
        if (recursionStack.has(code)) {
            return [...path, code];
        }
        if (visited.has(code)) {
            return null;
        }

        visited.add(code);
        recursionStack.add(code);

        const course = courseMap.get(code);
        if (course) {
            for (const prereq of course.prerequisites) {
                const cycle = dfs(prereq, [...path, code]);
                if (cycle) return cycle;
            }
        }

        recursionStack.delete(code);
        return null;
    }

    for (const course of courses) {
        const cycle = dfs(course.code, []);
        if (cycle) return cycle;
    }

    return [];
}

// ==========================================
// STORE INTERFACE
// ==========================================
interface AppState {
    // Data Source & Validation
    dataSource: DataSource;
    setDataSource: (source: DataSource) => void;
    validationResult: ValidationResult | null;
    setValidationResult: (result: ValidationResult | null) => void;

    // Courses
    courses: Course[];
    setCourses: (courses: Course[]) => void;
    loadDemoData: () => void;
    loadUploadedData: (courses: Course[]) => void;
    clearData: () => void;

    // Plan Configuration
    completedCourses: string[];
    setCompletedCourses: (courses: string[]) => void;
    priorityCourses: string[];
    setPriorityCourses: (courses: string[]) => void;
    remainingSemesters: number;
    setRemainingSemesters: (n: number) => void;
    maxCoursesPerSemester: number;
    setMaxCoursesPerSemester: (n: number) => void;
    careerGoal: string;
    setCareerGoal: (goal: string) => void;

    // Generated Plan
    currentPlan: PlanResponse | null;
    setCurrentPlan: (plan: PlanResponse | null) => void;
    analysisResults: any | null;
    setAnalysisResults: (results: any | null) => void;

    // UI State
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;


    // Study Copilot State
    studySubjects: string[];
    setStudySubjects: (subjects: string[]) => void;
    studyAvailableHours: Record<string, number>;
    setStudyAvailableHours: (hours: Record<string, number>) => void;
    studyExams: { subject: string, date: string }[];
    setStudyExams: (exams: { subject: string, date: string }[]) => void;
    studyWeaknesses: string[];
    setStudyWeaknesses: (weaknesses: string[]) => void;
    studyPlan: StudyPlanResponse | null;
    setStudyPlan: (plan: StudyPlanResponse | null) => void;
    resetStudyData: () => void;

    // Complete reset for logout
    resetAllData: () => void;
}

// ==========================================
// DEMO COURSES DATA
// ==========================================
export const demoCourses: Course[] = [
    { code: "CS101", name: "Introduction to Programming", credits: 4, prerequisites: [] },
    { code: "CS102", name: "Data Structures", credits: 4, prerequisites: ["CS101"] },
    { code: "CS201", name: "Algorithms", credits: 4, prerequisites: ["CS102"] },
    { code: "CS202", name: "Computer Organization", credits: 3, prerequisites: ["CS101"] },
    { code: "CS301", name: "Operating Systems", credits: 4, prerequisites: ["CS201", "CS202"] },
    { code: "CS302", name: "Databases", credits: 3, prerequisites: ["CS102"] },
    { code: "CS303", name: "Computer Networks", credits: 3, prerequisites: ["CS202"] },
    { code: "CS401", name: "Machine Learning", credits: 4, prerequisites: ["CS201"] },
    { code: "CS402", name: "Software Engineering", credits: 3, prerequisites: ["CS201"] },
    { code: "CS403", name: "Capstone Project", credits: 6, prerequisites: ["CS301", "CS302", "CS402"] },
    { code: "MA101", name: "Calculus I", credits: 4, prerequisites: [] },
    { code: "MA102", name: "Discrete Mathematics", credits: 3, prerequisites: ["MA101"] },
    { code: "EL101", name: "Open Elective I", credits: 3, prerequisites: [] },
    { code: "EL102", name: "Open Elective II", credits: 3, prerequisites: [] },
];

// ==========================================
// STORE IMPLEMENTATION
// ==========================================
export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Data Source & Validation
            dataSource: null,
            setDataSource: (dataSource) => set({ dataSource }),
            validationResult: null,
            setValidationResult: (validationResult) => set({ validationResult }),

            // Courses
            courses: [],
            setCourses: (courses) => set({ courses }),

            // Load demo data with proper labeling
            loadDemoData: () => {
                const validation = validateCourseData(demoCourses, []);
                set({
                    courses: demoCourses,
                    dataSource: "demo",
                    validationResult: validation,
                    completedCourses: ["CS101", "CS102"], // Demo completed courses
                    priorityCourses: [],
                    currentPlan: null,
                });
            },

            // Load user-uploaded data with validation
            loadUploadedData: (courses) => {
                const validation = validateCourseData(courses, get().completedCourses);
                set({
                    courses,
                    dataSource: "uploaded",
                    validationResult: validation,
                    currentPlan: null,
                });
            },

            // Clear all data
            clearData: () =>
                set({
                    courses: [],
                    dataSource: null,
                    validationResult: null,
                    completedCourses: [],
                    priorityCourses: [],
                    currentPlan: null,
                }),

            // Plan Configuration
            completedCourses: [],
            setCompletedCourses: (completedCourses) => {
                set({ completedCourses });
                // Re-validate when completed courses change
                const courses = get().courses;
                if (courses.length > 0) {
                    const validation = validateCourseData(courses, completedCourses);
                    set({ validationResult: validation });
                }
            },
            priorityCourses: [],
            setPriorityCourses: (priorityCourses) => set({ priorityCourses }),
            remainingSemesters: 6,
            setRemainingSemesters: (remainingSemesters) => set({ remainingSemesters }),
            maxCoursesPerSemester: 5,
            setMaxCoursesPerSemester: (maxCoursesPerSemester) => set({ maxCoursesPerSemester }),
            careerGoal: "",
            setCareerGoal: (careerGoal) => set({ careerGoal }),

            // Generated Plan
            currentPlan: null,
            setCurrentPlan: (currentPlan) => set({ currentPlan }),
            analysisResults: null,
            setAnalysisResults: (analysisResults) => set({ analysisResults }),

            // UI State
            isLoading: false,
            setIsLoading: (isLoading) => set({ isLoading }),


            // Study Copilot State
            studySubjects: [],
            setStudySubjects: (studySubjects) => set({ studySubjects }),
            studyAvailableHours: {
                Monday: 4, Tuesday: 4, Wednesday: 4, Thursday: 4, Friday: 4, Saturday: 6, Sunday: 6
            },
            setStudyAvailableHours: (studyAvailableHours) => set({ studyAvailableHours }),
            studyExams: [],
            setStudyExams: (studyExams) => set({ studyExams }),
            studyWeaknesses: [],
            setStudyWeaknesses: (studyWeaknesses) => set({ studyWeaknesses }),
            studyPlan: null,
            setStudyPlan: (studyPlan) => set({ studyPlan }),
            resetStudyData: () => set({
                studySubjects: [],
                studyAvailableHours: {
                    Monday: 4, Tuesday: 4, Wednesday: 4, Thursday: 4, Friday: 4, Saturday: 6, Sunday: 6
                },
                studyExams: [],
                studyWeaknesses: [],
                studyPlan: null
            }),

            // Complete reset for logout
            resetAllData: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('degree-planner-storage');
                }
                set({
                    dataSource: null,
                    validationResult: null,
                    courses: [],
                    completedCourses: [],
                    priorityCourses: [],
                    remainingSemesters: 6,
                    maxCoursesPerSemester: 5,
                    careerGoal: "",
                    currentPlan: null,
                    analysisResults: null,
                    isLoading: false,
                    studySubjects: [],
                    studyAvailableHours: {
                        Monday: 4, Tuesday: 4, Wednesday: 4, Thursday: 4, Friday: 4, Saturday: 6, Sunday: 6
                    },
                    studyExams: [],
                    studyWeaknesses: [],
                    studyPlan: null
                });
            },
        }),
        {
            name: "degree-planner-storage",
            partialize: (state) => ({
                courses: state.courses,
                dataSource: state.dataSource,
                completedCourses: state.completedCourses,
                priorityCourses: state.priorityCourses,
                remainingSemesters: state.remainingSemesters,
                maxCoursesPerSemester: state.maxCoursesPerSemester,
                careerGoal: state.careerGoal,
                currentPlan: state.currentPlan,

                studySubjects: state.studySubjects,
                studyAvailableHours: state.studyAvailableHours,
                studyExams: state.studyExams,
                studyWeaknesses: state.studyWeaknesses,
                studyPlan: state.studyPlan,
            }),
        }
    )
);
