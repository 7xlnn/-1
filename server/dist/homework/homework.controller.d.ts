import { HomeworkService, CreateSubmissionDto, GradeDto } from './homework.service';
export declare class HomeworkController {
    private readonly homework;
    constructor(homework: HomeworkService);
    submit(dto: CreateSubmissionDto): Promise<{
        id: number;
    }>;
    mine(studentId: string): Promise<{
        list: unknown[];
    }>;
    teacherList(status?: string): Promise<{
        list: unknown[];
    }>;
    teacherStats(): Promise<{
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
    detail(id: number): Promise<{
        submission: import("./homework.service").SubmissionRow;
    }>;
    remove(id: number): Promise<{
        ok: boolean;
        id: number;
    }>;
    review(id: number): Promise<{
        ok: boolean;
        id: number;
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
