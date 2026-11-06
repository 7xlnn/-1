export interface CreateSubmissionDto {
    studentName: string;
    studentId: string;
    type: string;
    title: string;
    group?: string;
    sub?: string;
    content: unknown;
}
export interface GradeDto {
    score: number;
    comment: string;
}
export interface SubmissionRow {
    id: number;
    student_name: string;
    student_id: string;
    type: string;
    title: string;
    group: string | null;
    sub: string | null;
    content: unknown;
    status: string;
    score: number | null;
    comment: string | null;
    graded_at: string | null;
    created_at: string;
}
export declare class HomeworkService {
    private client;
    create(dto: CreateSubmissionDto): Promise<{
        id: number;
    }>;
    listMine(studentId: string): Promise<{
        list: unknown[];
    }>;
    listTeacher(status?: string): Promise<{
        list: unknown[];
    }>;
    detail(id: number): Promise<{
        submission: SubmissionRow;
    }>;
    remove(id: number): Promise<{
        ok: boolean;
        id: number;
    }>;
    markReviewed(id: number): Promise<{
        ok: boolean;
        id: number;
    }>;
    stats(): Promise<{
        updatedAt: string;
        overview: {
            studentCount: number;
            total: number;
            pending: number;
            graded: number;
            reviewed: number;
            avgScore: number;
        };
        byType: {
            type: string;
            label: string;
            count: number;
            pending: number;
            graded: number;
        }[];
        byStudent: {
            no: string;
            name: string;
            total: number;
            pending: number;
            graded: number;
            byType: Record<string, number>;
        }[];
    }>;
    draftUpsert(studentId: string, key: string, data: string): Promise<{
        ok: boolean;
    }>;
    draftList(studentId: string): Promise<{
        list: unknown[];
    }>;
    draftDelete(studentId: string, key: string): Promise<{
        ok: boolean;
    }>;
    grade(id: number, dto: GradeDto): Promise<{
        ok: boolean;
        id: number;
    }>;
}
