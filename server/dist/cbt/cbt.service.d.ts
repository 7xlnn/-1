import type { ClientProfile } from './dto';
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface SummaryPayload {
    profile: ClientProfile;
    messages: ChatMessage[];
    taskType?: string;
    sessionTitle?: string;
}
export interface ChatPayload {
    profile: ClientProfile;
    messages: ChatMessage[];
    agentFocus?: string;
    clientState?: string;
    sessionGoal?: string;
}
export interface FeedbackPayload {
    profile: ClientProfile;
    messages: ChatMessage[];
    taskType: string;
    userWork?: string;
    sessionGoal?: string;
    sessionTitle?: string;
}
export interface MoodRecordPayload {
    profile: ClientProfile;
    sessionIndex: number;
    totalSessions: number;
    sessionTitle?: string;
    sessionGoal?: string;
}
export interface SessionCheckDto {
    metGoals: string[];
    unmetGoals: string[];
    homework: string;
}
export interface SupervisorAskPayload {
    title: string;
    clientName: string;
    report: string;
    question: string;
    excerpt?: string;
}
export interface ThoughtRecordEntryDto {
    date: string;
    situation: string;
    automaticThought: string;
    thoughtBelief: number;
    emotion: string;
    emotionIntensity: number;
    distortions: string[];
    usedQuestion: number | null;
    adaptiveResponse: string;
    responseBelief: number | null;
    resultBelief: number | null;
    resultEmotion: string;
    resultEmotionIntensity: number | null;
    resultAction: string;
}
export declare class CbtService {
    private buildClient;
    private buildClientSystemPrompt;
    chat(payload: ChatPayload, headers: Record<string, string>): Promise<{
        reply: string;
    }>;
    private buildSummarySystemPrompt;
    summary(payload: SummaryPayload, headers: Record<string, string>): Promise<{
        covered: string[];
        missed: string[];
    }>;
    private taskRubric;
    static readonly SCORE_DIMENSIONS: {
        key: string;
        label: string;
    }[];
    private parseScoredOutput;
    private parseSessionCheck;
    feedback(payload: FeedbackPayload, headers: Record<string, string>): Promise<{
        feedback: string;
        scores: Record<string, number> | null;
        sessionCheck?: SessionCheckDto | null;
    }>;
    askSupervisor(payload: SupervisorAskPayload, headers: Record<string, string>): Promise<{
        reply: string;
    }>;
    private parseUsedQuestion;
    private clamp100;
    private parseMoodRecord;
    generateMoodRecord(payload: MoodRecordPayload, headers: Record<string, string>): Promise<{
        weekLabel: string;
        entries: ThoughtRecordEntryDto[];
    }>;
}
