import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export interface CreateSubmissionDto {
  studentName: string
  studentId: string
  type: string
  title: string
  group?: string
  sub?: string
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
  group: string | null
  sub: string | null
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
        group: (dto.group || '').trim() || null,
        sub: (dto.sub || '').trim() || null,
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
      .select('id, student_name, type, title, group, sub, status, score, comment, graded_at, created_at')
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
      .select('id, student_name, type, title, group, sub, status, score, created_at')
      .order('created_at', { ascending: false })
      .limit(300)
    if (status === 'pending') {
      query = query.eq('status', 'pending')
    } else if (status === 'graded') {
      // “已处理”包含：已批改（有评分的作业）与已查看（情绪记录）
      query = query.in('status', ['graded', 'reviewed'])
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

  // 情绪记录：教师仅查看，标记为已查看（不评分）
  async markReviewed(id: number) {
    const row = await this.detail(id)
    if (row.submission.type !== 'mood') {
      throw new BadRequestException('仅情绪记录可标记为已查看')
    }
    const { data, error } = await this.client()
      .from('submissions')
      .update({ status: 'reviewed', graded_at: new Date().toISOString() })
      .eq('id', id)
      .select('id,status')
      .single()
    if (error) throw new Error(`操作失败: ${error.message}`)
    return { ok: true, id: (data as { id: number }).id }
  }

  // 班级完成数据统计（教师端）
  async stats() {
    // 拉取全部（含完整 content 之外的字段），供前端做完成统计与直观图
    const { data, error } = await this.client()
      .from('submissions')
      .select('id, student_name, student_id, type, title, group, sub, status, score, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)
    if (error) throw new Error(`统计数据失败: ${error.message}`)
    const rows = (data ?? []) as unknown as SubmissionRow[]

    const TYPE_LABEL: Record<string, string> = {
      fragment: '片段练习',
      conceptualization: '概念化',
      session: '完整咨询',
      mood: '情绪周记',
    }
    const TYPES = ['fragment', 'conceptualization', 'session', 'mood']

    // 参与学生（按姓名去重，缺姓名归入"未署名"）
    const students = new Map<string, { name: string; total: number; pending: number; graded: number; byType: Record<string, number>; mood: number }>()
    for (const r of rows) {
      const name = (r.student_name || '').trim()
      const key = name || '（未署名）'
      if (!students.has(key)) {
        students.set(key, { name: key, total: 0, pending: 0, graded: 0, byType: { fragment: 0, conceptualization: 0, session: 0, mood: 0 }, mood: 0 })
      }
      const s = students.get(key)!
      s.total += 1
      if (r.status === 'pending') s.pending += 1
      else s.graded += 1
      const t = (r.type || 'fragment') as string
      if (t in s.byType) s.byType[t] += 1
      if (t === 'mood') s.mood += 1
    }

    // 各类型统计
    const byType = TYPES.map((t) => {
      const items = rows.filter((r) => r.type === t)
      return {
        type: t,
        label: TYPE_LABEL[t] || t,
        count: items.length,
        pending: items.filter((i) => i.status === 'pending').length,
        graded: items.filter((i) => i.status === 'graded').length,
      }
    })

    // 汇总评分（排除未评分）
    const scoredRows = rows.filter((r) => typeof r.score === 'number' && r.status === 'graded')
    const avgScore = scoredRows.length
      ? Math.round((scoredRows.reduce((acc, r) => acc + (r.score ?? 0), 0) / scoredRows.length) * 10) / 10
      : 0

    const overview = {
      studentCount: students.size,
      total: rows.length,
      pending: rows.filter((r) => r.status === 'pending').length,
      graded: rows.filter((r) => r.status === 'graded').length,
      reviewed: rows.filter((r) => r.status === 'reviewed').length,
      avgScore,
    }

    // 学生完成榜（按提交数降序）
    const byStudent = Array.from(students.values())
      .map((s) => ({
        name: s.name,
        total: s.total,
        pending: s.pending,
        graded: s.graded,
        byType: s.byType,
      }))
      .sort((a, b) => b.total - a.total)

    return { updatedAt: new Date().toISOString(), overview, byType, byStudent }
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
