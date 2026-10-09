import { Body, Controller, Headers, Post, HttpCode } from '@nestjs/common';
import { CbtService, ChatPayload, FeedbackPayload, MoodRecordPayload, SupervisorAskPayload } from './cbt.service';

@Controller('cbt')
export class CbtController {
  constructor(private readonly cbtService: CbtService) {}

  @Post('chat')
  @HttpCode(200)
  chat(
    @Body() body: ChatPayload,
    @Headers() headers: Record<string, string>
  ) {
    console.log('[CBT CHAT] profile:', body.profile?.name, 'messages:', body.messages?.length);
    return this.cbtService.chat(body, headers);
  }

  @Post('feedback')
  @HttpCode(200)
  feedback(
    @Body() body: FeedbackPayload,
    @Headers() headers: Record<string, string>
  ) {
    console.log('[CBT FEEDBACK] profile:', body.profile?.name, 'task:', body.taskType);
    return this.cbtService.feedback(body, headers);
  }

  @Post('mood-record')
  @HttpCode(200)
  moodRecord(
    @Body() body: MoodRecordPayload,
    @Headers() headers: Record<string, string>
  ) {
    console.log(
      '[CBT MOOD-RECORD] profile:',
      body.profile?.name,
      'session:',
      body.sessionIndex,
      '/',
      body.totalSessions
    );
    return this.cbtService.generateMoodRecord(body, headers);
  }

  @Post('ask-supervisor')
  @HttpCode(200)
  askSupervisor(
    @Body() body: SupervisorAskPayload,
    @Headers() headers: Record<string, string>
  ) {
    console.log('[CBT ASK-SUPERVISOR] title:', body.title, 'question:', body.question?.slice(0, 30));
    return this.cbtService.askSupervisor(body, headers);
  }
}
