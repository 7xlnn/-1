import { CbtService, ChatPayload, FeedbackPayload, MoodRecordPayload, SummaryPayload, SupervisorAskPayload } from './cbt.service';
export declare class CbtController {
    private readonly cbtService;
    constructor(cbtService: CbtService);
    chat(body: ChatPayload, headers: Record<string, string>): Promise<{
        reply: string;
    }>;
    summary(body: SummaryPayload, headers: Record<string, string>): Promise<{
        covered: string[];
        missed: string[];
    }>;
    feedback(body: FeedbackPayload, headers: Record<string, string>): Promise<{
        feedback: string;
        scores: Record<string, number> | null;
        sessionCheck?: import("./cbt.service").SessionCheckDto | null;
    }>;
    moodRecord(body: MoodRecordPayload, headers: Record<string, string>): Promise<{
        weekLabel: string;
        entries: import("./cbt.service").ThoughtRecordEntryDto[];
    }>;
    askSupervisor(body: SupervisorAskPayload, headers: Record<string, string>): Promise<{
        reply: string;
    }>;
}
