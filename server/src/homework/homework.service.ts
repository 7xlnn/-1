import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export interface CreateSubmissionDto {
  studentName: string
  studentId: string
  type: string
  title: string
  content: unknown
}

export interface GradeDto {
  score: number
  comment: string
}

export interface SubmissionRow {
  id: number
  student_name: string
  student_id: string
  type: string
  title: string
  content: unknown
  status: string
  score: number | null
  comment: string | null
  graded_at: string | null
  created_at: string
}

@Injectable()
export class HomeworkService {
  private client() {
    return getSupabaseClient()
  }

  // 学生提交作业
  async create(dto: CreateSubmissionDto) {
    const studentName = (dto.studentName || '').trim()
    const studentId = (dto.studentId || '').trim()
    const type = (dto.type || '').trim()
    const title = (dto.title || '').trim()
    if (!studentName) throw new BadRequestException('缺少学生姓名')
    if (!studentId) throw new BadRequestException('缺少学生标识')
    if (!type || !['fragment', 'conceptualization', 'session', 'mood'].includes(type)) {
      throw new BadRequestException('作业类型不合法')
    }
    if (!title) throw new BadRequestException('缺少作业标题')
    if (dto.content === undefined || dto.content === null) {
      throw new BadRequestException('缺少作业内容')
    }

    const { data, error } = await this.client()
      .from('submissions')
      .insert({
        student_name: studentName.slice(0, 64),
        student_id: studentId.slice(0, 128),
        type,
        title: title.slice(0, 255),
        content: dto.content,
        status: 'pending',
      })
      .select('id')
      .single()
    if (error) throw new Error(`作业提交失败: ${error.message}`)
    return { id: (data as { id: number }).id }
  }

  // 学生查看自己的提交
  async listMine(studentId: string) {
    if (!studentId) throw new BadRequestException('缺少学生标识')
    const { data, error } = await this.client()
      .from('submissions')
      .select('id, student_name, type, title, status, score, comment, graded_at, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw new Error(`查询失败: ${error.message}`)
    return { list: (data ?? []) as unknown[] }
  }

  // 教师查看全部（可按状态过滤）
  async listTeacher(status?: string) {
    let query = this.client()
      .from('submissions')
      .select('id, student_name, type, title, status, score, created_at')
      .order('created_at', { ascending: false })
      .limit(300)
    if (status === 'pending' || status === 'graded') {
      query = query.eq('status', status)
    }
    const { data, error } = await query
    if (error) throw new Error(`查询失败: ${error.message}`)
    return { list: (data ?? []) as unknown[] }
  }

  // 详情（学生本人或教师都可看完整内容）
  async detail(id: number) {
    if (!Number.isFinite(id)) throw new BadRequestException('id 不合法')
    const { data, error } = await this.client()
      .from('submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(`查询失败: ${error.message}`)
    if (!data) throw new NotFoundException('作业不存在')
    return { submission: data as SubmissionRow }
  }

  // 删除作业（教师用，删除后学生端也不再显示）
  async remove(id: number) {
    if (!Number.isFinite(id)) throw new BadRequestException('id 不合法')
    await this.detail(id) // 确保存在
    const { error } = await this.client().from('submissions').delete().eq('id', id)
    if (error) throw new Error(`删除失败: ${error.message}`)
    return { ok: true, id }
  }

  // 教师批改
  async grade(id: number, dto: GradeDto) {
    const row = await this.detail(id)
    if (row.submission.type === 'mood') {
      throw new BadRequestException('情绪记录不参与评分')
    }
    if (!Number.isFinite(id)) throw new BadRequestException('id 不合法')
    const score = Math.round(Number(dto.score))
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new BadRequestException('评分需为 0-100 的整数')
    }
    const comment = (dto.comment || '').trim().slice(0, 2000)

    const { data, error } = await this.client()
      .from('submissions')
      .update({
        score,
        comment,
        status: 'graded',
        graded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id,status')
      .single()
    if (error) throw new Error(`批改失败: ${error.message}`)
    return { ok: true, id: (data as { id: number }).id }
  }
}
