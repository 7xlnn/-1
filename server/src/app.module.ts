import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CbtModule } from './cbt/cbt.module';

@Module({
  imports: [CbtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
