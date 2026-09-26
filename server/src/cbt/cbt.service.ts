import { Injectable } from '@nestjs/common';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { ClientProfile } from './dto';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatPayload {
  profile: ClientProfile;
  messages: ChatMessage[];
  /** 智能体行为侧重（片段练习） */
  agentFocus?: string;
  /** 本次会谈中来访者的状态（完整咨询） */
  clientState?: string;
  /** 本次会谈目标（完整咨询） */
  sessionGoal?: string;
}

export interface FeedbackPayload {
  profile: ClientProfile;
  messages: ChatMessage[];
  taskType: string;
  /** 咨询师在结束任务中的作答（概念化表单/选择/文本） */
  userWork?: string;
  /** 会谈信息（完整咨询用） */
  sessionGoal?: string;
  sessionTitle?: string;
}

/** AI 生成来访者一周情绪记录表的入参 */
export interface MoodRecordPayload {
  profile: ClientProfile;
  /** 会谈序号（从 1 开始） */
  sessionIndex: number;
  /** 总会谈数 */
  totalSessions: number;
  /** 本次会谈标题 */
  sessionTitle?: string;
  /** 本次会谈目标 */
  sessionGoal?: string;
}

/** 与前端 ThoughtRecordEntry 对应的单条记录 */
export interface ThoughtRecordEntryDto {
  date: string;
  situation: string;
  automaticThought: string;
  thoughtBelief: number;
  emotion: string;
  emotionIntensity: number;
  distortions: string[];
  adaptiveResponse: string;
  responseBelief: number | null;
  resultBelief: number | null;
  resultEmotion: string;
  resultAction: string;
}

@Injectable()
export class CbtService {
  private buildClient(forwardHeaders: Record<string, string>): LLMClient {
    return new LLMClient(new Config({ timeout: 60000 }), forwardHeaders);
  }

  /** 构造来访者系统提示词 */
  private buildClientSystemPrompt(p: ChatPayload): string {
    const c = p.profile;
    const stateLines = [
      p.agentFocus ? `【本次练习中你的行为侧重】${p.agentFocus}` : '',
      p.clientState ? `【你当前在咨询中的状态】${p.clientState}` : '',
      p.sessionGoal ? `【背景信息：咨询师本次的会谈目标是】${p.sessionGoal}（你不需要主动配合这个目标，只做你自己）` : ''
    ].filter(Boolean);

    return `你正在角色扮演，名字叫${c.name}，${c.gender}，${c.age}岁，职业是${c.occupation}。你正坐在心理咨询室里，与一位新手咨询师谈话。

【你的主诉】${c.chiefComplaint}
【你的背景故事】
${c.background}

【你内心真实的自动思维（不会轻易直接说出口，需通过对话逐渐流露）】
${c.automaticThoughts.map(t => `· ${t}`).join('\n')}
【你常有的情绪】${c.emotions.join('、')}
【你的行为与应对方式】${c.behaviors.join('、')}
【你的成长经历】
${c.childhood}
【你内心深处的核心信念】${c.coreBeliefs.join('；')}
【你的态度】${c.attitudes.join('；')}
【你的规则】${c.rules.join('；')}
【你的假设】${c.assumptions.join('；')}
【你的说话风格】${c.speechStyle}
${stateLines.length ? stateLines.join('\n') : ''}

【表演规则，必须严格遵守】
1. 始终完全沉浸在${c.name}的角色里，用第一人称说话，绝对不要跳出角色，不要承认自己是AI、程序或在模拟。
2. 说话像真实来访者：口语化、简短自然，一次只说一到三句话，可以有停顿、迟疑、回避、情绪波动；不要长篇大论、不要列条目、不要做总结。
3. 你不是来配合教学的，不会主动说出所有背景。信息要随着咨询师的共情与提问一点点透露；如果问题太宽泛或被评判、被说教，你会回避、敷衍或产生情绪。
4. 不要替咨询师做治疗分析，不要使用"自动思维""核心信念"等专业术语，你只是一个普通人。
5. 如果咨询师的回应让你感到被理解、被尊重，可以更深入；如果让你不舒服，按你的性格真实反应。
6. 直接输出你要说的话本身，不要加"来访者："等任何前缀、舞台说明或括号注释。`;
  }

  /** 来访者对话 */
  async chat(payload: ChatPayload, headers: Record<string, string>): Promise<{ reply: string }> {
    const client = this.buildClient(HeaderUtils.extractForwardHeaders(headers));
    const system = this.buildClientSystemPrompt(payload);
    const messages: ChatMessage[] = [
      { role: 'system', content: system },
      ...payload.messages
    ];
    const res = await client.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.9
    });
    return { reply: res.content };
  }

  /** 选择任务的督导评语侧重 */
  private taskRubric(taskType: string): string {
    const map: Record<string, string> = {
      empathy: '重点评估：咨询师是否准确反映了来访者的情绪（而非安慰、说教或给建议），是否进入了对方的内部参照框架，回应后来访者是否感到被理解。',
      upr: '重点评估：咨询师是否把"人的价值"与"行为对错"分开，在不认同行为时依然接纳来访者本人，是否避免了道德评判、指责与说教。',
      genuineness: '重点评估：咨询师是否真实一致、不躲在专业面具后，面对质疑是否不防御，自我暴露是否节制且为来访者利益服务。',
      conceptualization: '重点评估：横向概念化（情境、自动思维、情绪、行为）是否准确、是否有对话证据支持；纵向概念化（童年经历、核心信念、中间信念之态度规则假设、应对策略）是否符合材料、各层级逻辑是否连贯；是否把概念化当作可与来访者核对的假设。',
      automatic: '重点评估：咨询师是否帮助来访者区分了情境、自动思维与情绪，是否使用苏格拉底式提问和证据检验（而非直接反驳），替代思维是否平衡可信。',
      intermediate: '重点评估：是否准确识别了中间信念的态度、规则、假设三种形式，向下箭头与利弊分析是否恰当，新规则是否更灵活、有无行为实验支持。',
      core: '重点评估：是否以"想法而非事实"的方式谨慎呈现核心信念，是否使用证据检验与积极经验，矫正过程是否温和渐进而非空洞鼓励。'
    };
    return map[taskType] ?? '请依据 CBT 专业标准评估咨询师本次的整体表现。';
  }

  /** 评分维度定义（固定 6 项，0-10 分） */
  static readonly SCORE_DIMENSIONS: { key: string; label: string }[] = [
    { key: 'empathy', label: '共情与关系' },
    { key: 'socratic', label: '苏格拉底式提问' },
    { key: 'collaboration', label: '合作与引导' },
    { key: 'agenda', label: '结构化与议程' },
    { key: 'technique', label: '技术运用准确' },
    { key: 'homework', label: '作业与巩固' }
  ];

  /** 从模型输出中解析评分 JSON 块与正文反馈 */
  private parseScoredOutput(raw: string): { scores: Record<string, number> | null; feedback: string } {
    const match = raw.match(/<SCORES>([\s\S]*?)<\/SCORES>/);
    let scores: Record<string, number> | null = null;
    if (match) {
      try {
        const parsed = JSON.parse(match[1].trim()) as Record<string, unknown>;
        const clean: Record<string, number> = {};
        for (const d of CbtService.SCORE_DIMENSIONS) {
          const v = Number(parsed[d.key]);
          if (Number.isFinite(v)) clean[d.key] = Math.max(0, Math.min(10, Math.round(v)));
        }
        if (Object.keys(clean).length === CbtService.SCORE_DIMENSIONS.length) scores = clean;
      } catch {
        scores = null;
      }
    }
    const feedback = raw.replace(/<SCORES>[\s\S]*?<\/SCORES>/, '').trim();
    return { scores, feedback };
  }

  /** 督导反馈 */
  async feedback(
    payload: FeedbackPayload,
    headers: Record<string, string>
  ): Promise<{ feedback: string; scores: Record<string, number> | null }> {
    const client = this.buildClient(HeaderUtils.extractForwardHeaders(headers));
    const c = payload.profile;
    const transcript = payload.messages
      .map(m => `${m.role === 'user' ? '咨询师' : '来访者'}：${m.content}`)
      .join('\n');

    const sessionInfo = payload.sessionTitle
      ? `这是完整咨询中的第${payload.sessionTitle}`
      : '这是一次片段练习';

    const system = `你是一位资深的认知行为疗法（CBT）督导师，拥有丰富的教学经验，正在督导一位新手咨询师学生。你温暖但要求专业，反馈具体、可操作，依据 Judith Beck《认知疗法：基础与应用》及 CBT 通用胜任力标准。`;

    const userPrompt = `${sessionInfo}。
来访者${c.name}的完整档案如下：
- 主诉：${c.chiefComplaint}
- 典型自动思维：${c.automaticThoughts.join('；')}
- 情绪：${c.emotions.join('；')}
- 行为/应对：${c.behaviors.join('；')}
- 成长经历：${c.childhood}
- 核心信念：${c.coreBeliefs.join('；')}
- 态度：${c.attitudes.join('；')}
- 规则：${c.rules.join('；')}
- 假设：${c.assumptions.join('；')}
${payload.sessionGoal ? `- 本次会谈目标：${payload.sessionGoal}` : ''}

以下是完整对话记录：
${transcript}

${payload.userWork ? `咨询师在结束后提交的作答如下：\n${payload.userWork}` : ''}

请你完成督导反馈。${this.taskRubric(payload.taskType)}

首先，依据以下 6 个维度为学生本次表现打分（每项 0-10 的整数，可含半分向上取整，严格依据对话证据，避免普遍给高分）：
${CbtService.SCORE_DIMENSIONS.map((d, i) => `${i + 1}. ${d.key}（${d.label}）`).join('\n')}

把评分放在输出最开头，严格使用如下标签包裹一段 JSON，不要添加任何额外说明：
<SCORES>
{"empathy":0,"socratic":0,"collaboration":0,"agenda":0,"technique":0,"homework":0}
</SCORES>

随后再严格按以下结构输出文字反馈，使用 Markdown，不要使用表格：
## 做得好的地方
（2-3条具体表现，引用对话中的原话或做法）
## 需要改进的地方
（2-3条，指出具体问题）
## 专业示范
（给出1-2句"如果这样回应会更好"的具体改写示范）
## 本次要点
（一句话总结学生本次最该记住的内容）`;

    const res = await client.invoke(
      [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt }
      ],
      { model: 'doubao-seed-2-0-pro-260215', temperature: 0.6 }
    );
    return this.parseScoredOutput(res.content);
  }

  /** 把数值收敛为 0-100 的整数 */
  private clamp100(v: unknown): number {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  /** 解析情绪记录表 JSON 输出 */
  private parseMoodRecord(raw: string): ThoughtRecordEntryDto[] {
    const match = raw.match(/<RECORDS>([\s\S]*?)<\/RECORDS>/);
    if (!match) return [];
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, 7).map((item: Record<string, unknown>) => ({
        date: String(item.date ?? '').slice(0, 20),
        situation: String(item.situation ?? ''),
        automaticThought: String(item.automaticThought ?? ''),
        thoughtBelief: this.clamp100(item.thoughtBelief),
        emotion: String(item.emotion ?? ''),
        emotionIntensity: this.clamp100(item.emotionIntensity),
        distortions: Array.isArray(item.distortions)
          ? item.distortions.map(d => String(d)).slice(0, 6)
          : [],
        adaptiveResponse: String(item.adaptiveResponse ?? ''),
        responseBelief:
          item.responseBelief === null || item.responseBelief === undefined || item.responseBelief === ''
            ? null
            : this.clamp100(item.responseBelief),
        resultBelief:
          item.resultBelief === null || item.resultBelief === undefined || item.resultBelief === ''
            ? null
            : this.clamp100(item.resultBelief),
        resultEmotion: String(item.resultEmotion ?? ''),
        resultAction: String(item.resultAction ?? '')
      }));
    } catch {
      return [];
    }
  }

  /** 依据个案背景，由 AI 扮演来访者填写一份一周情绪记录表 */
  async generateMoodRecord(
    payload: MoodRecordPayload,
    headers: Record<string, string>
  ): Promise<{ weekLabel: string; entries: ThoughtRecordEntryDto[] }> {
    const llm = this.buildClient(HeaderUtils.extractForwardHeaders(headers));
    const c = payload.profile;
    const progress = payload.sessionIndex / Math.max(1, payload.totalSessions);

    // 治疗越早期，来访者越不会做"适合的反应"；中后期逐渐能完成后半部分
    const responseStage =
      progress < 0.34
        ? '这是治疗很早期，来访者还没学会检验想法，绝大多数条目只填写到「自动思维、情绪」，「适合的反应」与「结果」相关字段留空（adaptiveResponse 为空字符串，responseBelief、resultBelief 为 null，resultEmotion/resultAction 也可留空）。'
        : progress < 0.67
          ? '治疗进入中期，来访者开始尝试在一两条记录里用新学到的方法做「适合的反应」，但相信程度不高、并不稳定；其余条目仍只填到情绪。'
          : '治疗到了后期，来访者能在多数条目里较完整地完成「适合的反应」与「结果」，反应较平衡、情绪强度较前下降，但仍可能有个别反复。';

    const system = `你正在角色扮演，名字叫${c.name}，${c.gender}，${c.age}岁，职业是${c.occupation}。你正依据自己这一周的真实生活，填写一份认知行为疗法的情绪记录表（思维记录表）。

【主诉】${c.chiefComplaint}
【背景】
${c.background}
【你常有的自动思维】
${c.automaticThoughts.map(t => `· ${t}`).join('\n')}
【你常有的情绪】${c.emotions.join('、')}
【你的行为与应对】${c.behaviors.join('、')}
【说话/表达风格】${c.speechStyle}

【填写规则，必须严格遵守】
1. 完全以${c.name}第一人称、普通人的口吻填写，使用口语化、具体的生活细节，不要使用"自动思维""认知歪曲"等专业术语（认知歪曲标签除外，那是给咨询师看的）。
2. 每条记录的情境、自动思维、情绪必须真实合理，且彼此符合 CBT 的"情境—自动思维—情绪—行为"逻辑；情绪与相信程度用 0-100 的数字。
3. 情境要写出具体事件与令人痛苦的生理感觉；自动思维写出脑中闪过的念头或画面。
4. 记录之间要有变化，不要雷同；情绪强度、相信程度要符合该障碍的真实波动。
5. 生成 5 到 7 条，覆盖最近一周（可包含工作日与周末、白天与夜晚）。
6. ${responseStage}
7. 「认知歪曲」distortions 只在来访者已做适合反应、或明显可标注时填写，使用简短中文标签（如 灾难化、非黑即白、以偏概全、读心术、应该陈述、情绪推理），早期可留空数组。
8. 只输出规定的 JSON，不要输出任何解释或多余文字。`;

    const userPrompt = `这是你第 ${payload.sessionIndex}/${payload.totalSessions} 次咨询${
      payload.sessionTitle ? `（${payload.sessionTitle}）` : ''
    }前的一周。本次会谈咨询师的目标是：${payload.sessionGoal ?? '（未指定）'}。

请回顾这一周，把情绪记录表填好。严格使用如下标签包裹一段 JSON 数组：
<RECORDS>
[
  {
    "date": "周一 10/12",
    "situation": "具体事件 + 生理感觉",
    "automaticThought": "脑中闪过的念头/画面",
    "thoughtBelief": 85,
    "emotion": "焦虑",
    "emotionIntensity": 80,
    "distortions": ["灾难化"],
    "adaptiveResponse": "平衡后的想法，没有则空字符串",
    "responseBelief": null,
    "resultBelief": null,
    "resultEmotion": "如 焦虑 40%，没有则空字符串",
    "resultAction": "做了什么，没有则空字符串"
  }
]
</RECORDS>`;

    const res = await llm.invoke(
      [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt }
      ],
      { model: 'doubao-seed-2-0-pro-260215', temperature: 0.85 }
    );

    const entries = this.parseMoodRecord(res.content);
    return {
      weekLabel: `第 ${payload.sessionIndex} 次会谈前一周`,
      entries
    };
  }
}
