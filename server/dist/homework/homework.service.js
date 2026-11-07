"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let HomeworkService = class HomeworkService {
    client() {
        return (0, supabase_client_1.getSupabaseClient)();
    }
    async create(dto) {
        const studentName = (dto.studentName || '').trim();
        const studentId = (dto.studentId || '').trim();
        const type = (dto.type || '').trim();
        const title = (dto.title || '').trim();
        if (!studentName)
            throw new common_1.BadRequestException('缺少学生姓名');
        if (!studentId)
            throw new common_1.BadRequestException('缺少学生标识');
        if (!type || !['fragment', 'conceptualization', 'session', 'mood'].includes(type)) {
            throw new common_1.BadRequestException('作业类型不合法');
        }
        if (!title)
            throw new common_1.BadRequestException('缺少作业标题');
        if (dto.content === undefined || dto.content === null) {
            throw new common_1.BadRequestException('缺少作业内容');
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
            .single();
        if (error)
            throw new Error(`作业提交失败: ${error.message}`);
        return { id: data.id };
    }
    async listMine(studentId) {
        if (!studentId)
            throw new common_1.BadRequestException('缺少学生标识');
        const { data, error } = await this.client()
            .from('submissions')
            .select('id, student_name, type, title, group, sub, status, score, comment, graded_at, created_at')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(200);
        if (error)
            throw new Error(`查询失败: ${error.message}`);
        return { list: (data ?? []) };
    }
    async listTeacher(status) {
        let query = this.client()
            .from('submissions')
            .select('id, student_name, type, title, group, sub, status, score, created_at')
            .order('created_at', { ascending: false })
            .limit(300);
        if (status === 'pending') {
            query = query.eq('status', 'pending');
        }
        else if (status === 'graded') {
            query = query.in('status', ['graded', 'reviewed']);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(`查询失败: ${error.message}`);
        return { list: (data ?? []) };
    }
    async detail(id) {
        if (!Number.isFinite(id))
            throw new common_1.BadRequestException('id 不合法');
        const { data, error } = await this.client()
            .from('submissions')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error)
            throw new Error(`查询失败: ${error.message}`);
        if (!data)
            throw new common_1.NotFoundException('作业不存在');
        return { submission: data };
    }
    async remove(id) {
        if (!Number.isFinite(id))
            throw new common_1.BadRequestException('id 不合法');
        await this.detail(id);
        const { error } = await this.client().from('submissions').delete().eq('id', id);
        if (error)
            throw new Error(`删除失败: ${error.message}`);
        return { ok: true, id };
    }
    async markReviewed(id) {
        const row = await this.detail(id);
        if (row.submission.type !== 'mood') {
            throw new common_1.BadRequestException('仅情绪记录可标记为已查看');
        }
        const { data, error } = await this.client()
            .from('submissions')
            .update({ status: 'reviewed', graded_at: new Date().toISOString() })
            .eq('id', id)
            .select('id,status')
            .single();
        if (error)
            throw new Error(`操作失败: ${error.message}`);
        return { ok: true, id: data.id };
    }
    async stats() {
        const { data, error } = await this.client()
            .from('submissions')
            .select('id, student_name, student_id, type, title, group, sub, status, score, created_at')
            .order('created_at', { ascending: false })
            .limit(2000);
        if (error)
            throw new Error(`统计数据失败: ${error.message}`);
        const rows = (data ?? []);
        const TYPE_LABEL = {
            fragment: '片段练习',
            conceptualization: '概念化',
            session: '完整咨询',
            mood: '情绪周记',
        };
        const TYPES = ['fragment', 'conceptualization', 'session', 'mood'];
        const students = new Map();
        for (const r of rows) {
            const no = (r.student_id || '').trim();
            const name = (r.student_name || '').trim();
            const key = no || name || '（未署名）';
            if (!students.has(key)) {
                students.set(key, { no: no || '', name: name || '（未署名）', total: 0, pending: 0, graded: 0, byType: { fragment: 0, conceptualization: 0, session: 0, mood: 0 }, mood: 0 });
            }
            const s = students.get(key);
            s.total += 1;
            if (r.status === 'pending')
                s.pending += 1;
            else
                s.graded += 1;
            const t = (r.type || 'fragment');
            if (t in s.byType)
                s.byType[t] += 1;
            if (t === 'mood')
                s.mood += 1;
        }
        const byType = TYPES.map((t) => {
            const items = rows.filter((r) => r.type === t);
            return {
                type: t,
                label: TYPE_LABEL[t] || t,
                count: items.length,
                pending: items.filter((i) => i.status === 'pending').length,
                graded: items.filter((i) => i.status === 'graded').length,
            };
        });
        const scoredRows = rows.filter((r) => typeof r.score === 'number' && r.status === 'graded');
        const avgScore = scoredRows.length
            ? Math.round((scoredRows.reduce((acc, r) => acc + (r.score ?? 0), 0) / scoredRows.length) * 10) / 10
            : 0;
        const overview = {
            studentCount: students.size,
            total: rows.length,
            pending: rows.filter((r) => r.status === 'pending').length,
            graded: rows.filter((r) => r.status === 'graded').length,
            reviewed: rows.filter((r) => r.status === 'reviewed').length,
            avgScore,
        };
        const byStudent = Array.from(students.values())
            .map((s) => ({
            no: s.no,
            name: s.name,
            total: s.total,
            pending: s.pending,
            graded: s.graded,
            byType: s.byType,
        }))
            .sort((a, b) => b.total - a.total);
        return { updatedAt: new Date().toISOString(), overview, byType, byStudent };
    }
    async draftUpsert(studentId, key, data) {
        const sid = (studentId || '').trim();
        const k = (key || '').trim();
        if (!sid)
            throw new common_1.BadRequestException('缺少学生标识');
        if (!k)
            throw new common_1.BadRequestException('缺少草稿 key');
        if (!data)
            throw new common_1.BadRequestException('缺少草稿内容');
        const { error } = await this.client()
            .from('drafts')
            .upsert({ student_id: sid.slice(0, 128), key: k.slice(0, 200), data, updated_at: new Date().toISOString() }, { onConflict: 'student_id,key' });
        if (error)
            throw new Error(`草稿保存失败: ${error.message}`);
        return { ok: true };
    }
    async draftList(studentId) {
        const sid = (studentId || '').trim();
        if (!sid)
            throw new common_1.BadRequestException('缺少学生标识');
        const { data, error } = await this.client()
            .from('drafts')
            .select('key, data, updated_at')
            .eq('student_id', sid)
            .order('updated_at', { ascending: false })
            .limit(500);
        if (error)
            throw new Error(`草稿读取失败: ${error.message}`);
        return { list: (data ?? []) };
    }
    async listRecoveredDrafts() {
        const { data, error } = await this.client()
            .from('drafts')
            .select('key, data, updated_at')
            .eq('student_id', 'recovered-browser-20261107')
            .order('updated_at', { ascending: false })
            .limit(100);
        if (error)
            throw new Error(`恢复草稿读取失败: ${error.message}`);
        return { list: (data ?? []) };
    }
    async draftDelete(studentId, key) {
        const sid = (studentId || '').trim();
        const k = (key || '').trim();
        if (!sid || !k)
            throw new common_1.BadRequestException('缺少学生标识或草稿 key');
        const { error } = await this.client()
            .from('drafts')
            .delete()
            .eq('student_id', sid)
            .eq('key', k);
        if (error)
            throw new Error(`草稿删除失败: ${error.message}`);
        return { ok: true };
    }
    async grade(id, dto) {
        const row = await this.detail(id);
        if (row.submission.type === 'mood') {
            throw new common_1.BadRequestException('情绪记录不参与评分');
        }
        if (!Number.isFinite(id))
            throw new common_1.BadRequestException('id 不合法');
        const score = Math.round(Number(dto.score));
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            throw new common_1.BadRequestException('评分需为 0-100 的整数');
        }
        const comment = (dto.comment || '').trim().slice(0, 2000);
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
            .single();
        if (error)
            throw new Error(`批改失败: ${error.message}`);
        return { ok: true, id: data.id };
    }
};
exports.HomeworkService = HomeworkService;
exports.HomeworkService = HomeworkService = __decorate([
    (0, common_1.Injectable)()
], HomeworkService);
//# sourceMappingURL=homework.service.js.map