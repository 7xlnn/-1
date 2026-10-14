import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CbtModule } from './cbt/cbt.module';
import { HomeworkModule } from './homework/homework.module';

@Module({
  imports: [CbtModule, HomeworkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
