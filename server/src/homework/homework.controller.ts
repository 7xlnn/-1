import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common'
import { HomeworkService, CreateSubmissionDto, GradeDto } from './homework.service'

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homework: HomeworkService) {}

  // 学生提交作业
  @Post('submit')
  submit(@Body() dto: CreateSubmissionDto) {
    return this.homework.create(dto)
  }

  // 学生查看自己的提交
  @Get('mine')
  mine(@Query('studentId') studentId: string) {
    return this.homework.listMine(studentId || '')
  }

  // 教师查看全部（可带 status）
  @Get('teacher/list')
  teacherList(@Query('status') status?: string) {
    return this.homework.listTeacher(status)
  }

  // 教师端：班级完成数据统计
  @Get('teacher/stats')
  teacherStats() {
    return this.homework.stats()
  }

  // 详情（学生/教师共用）
  @Get('detail/:id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.homework.detail(id)
  }

  // 删除作业（教师用）
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homework.remove(id)
  }

  // 情绪记录：标记为已查看（不评分）
  @Post('review/:id')
  review(@Param('id', ParseIntPipe) id: number) {
    return this.homework.markReviewed(id)
  }

  // 学生草稿云备份：保存/更新
  @Post('draft')
  draftUpsert(@Body('studentId') studentId: string, @Body('key') key: string, @Body('data') data: string) {
    return this.homework.draftUpsert(studentId, key, data)
  }

  // 学生草稿云备份：读取某学生全部
  @Get('draft')
  draftList(@Query('studentId') studentId: string) {
    return this.homework.draftList(studentId || '')
  }

  // 学生草稿云备份：删除单个（key 走路径避免与 :id 冲突）
  @Delete('draft/:studentId/:key')
  draftDelete(@Param('studentId') studentId: string, @Param('key') key: string) {
    return this.homework.draftDelete(studentId || '', key || '')
  }

  // 教师批改
  @Post('grade/:id')
  grade(@Param('id', ParseIntPipe) id: number, @Body() dto: GradeDto) {
    return this.homework.grade(id, dto)
  }
}
