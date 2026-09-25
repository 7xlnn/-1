import { Body, Controller, Headers, Post, HttpCode } from '@nestjs/common';
import { CbtService, ChatPayload, FeedbackPayload } from './cbt.service';

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
}
