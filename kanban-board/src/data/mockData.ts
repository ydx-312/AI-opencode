import { WorkItem, CollaborationMessage } from '../types'

export const mockItems: WorkItem[] = [
  {
    id: 'COURSE-001',
    title: '小学数学-分数加减法',
    description: '五年级分数加减法课件，包含基础概念讲解和练习题交互',
    phase: 'teaching_research',
    status: 'in_progress',
    assignee: '张教研',
    department: '教研部',
    creator: '张教研',
    priority: 'high',
    tags: ['新课件制作'],
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-18T09:00:00Z',
    estimatedHours: 16,
    deadline: '2026-05-22',
    feedbacks: [],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-15T08:00:00Z' },
    ],
  },
  {
    id: 'COURSE-002',
    title: '初中英语-时态语法',
    description: '一般现在时、一般过去时、现在进行时对比讲解课件',
    phase: 'material_design',
    status: 'in_progress',
    assignee: '孙设计',
    department: '设计部',
    creator: '张教研',
    priority: 'urgent',
    tags: ['新课件制作'],
    createdAt: '2026-05-14T10:00:00Z',
    updatedAt: '2026-05-17T16:00:00Z',
    estimatedHours: 24,
    deadline: '2026-05-20',
    delayInfo: {
      reason: '教研脚本修改次数较多，设计稿需同步调整',
      resolveNode: '教研审核阶段前完成',
      resolvePlan: '本周五前完成初稿，下周一前定稿',
      reportedAt: '2026-05-17T14:00:00Z',
    },
    feedbacks: [
      {
        id: 'FB-001',
        from: '张教研',
        to: '孙设计',
        comment: '已完成教案编写，请进行教材设计',
        passed: true,
        createdAt: '2026-05-17T16:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-14T10:00:00Z', exitTime: '2026-05-17T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-17T16:00:00Z' },
    ],
  },
  {
    id: 'COURSE-003',
    title: '高中物理-力学基础',
    description: '牛顿三定律交互课件，含模拟实验和受力分析动画',
    phase: 'art',
    status: 'in_progress',
    assignee: '王美术',
    department: '美术部',
    creator: '张教研',
    priority: 'medium',
    tags: ['新课件制作'],
    createdAt: '2026-05-13T09:00:00Z',
    updatedAt: '2026-05-18T10:30:00Z',
    estimatedHours: 32,
    deadline: '2026-05-23',
    feedbacks: [
      {
        id: 'FB-002',
        from: '李审核',
        to: '王美术',
        comment: '审核通过，请按照设计稿制作视觉素材',
        passed: true,
        createdAt: '2026-05-16T14:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-13T09:00:00Z', exitTime: '2026-05-15T11:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-15T11:00:00Z', exitTime: '2026-05-16T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-16T10:00:00Z', exitTime: '2026-05-16T14:00:00Z' },
      { phase: 'art', enterTime: '2026-05-16T14:00:00Z' },
    ],
  },
  {
    id: 'COURSE-004',
    title: '小学语文-古诗鉴赏',
    description: '三首唐诗的讲解动画与朗读配音课件',
    phase: 'animation',
    status: 'todo',
    assignee: '赵动画',
    department: '动画部',
    creator: '李审核',
    priority: 'low',
    tags: ['新课件制作'],
    createdAt: '2026-05-12T08:30:00Z',
    updatedAt: '2026-05-17T15:00:00Z',
    estimatedHours: 12,
    deadline: '2026-05-23',
    feedbacks: [
      {
        id: 'FB-008',
        from: '郑测试',
        to: '周质检',
        comment: '测试优化完成，已修复所有已知bug，提交质检',
        passed: true,
        createdAt: '2026-05-18T11:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-07T08:00:00Z', exitTime: '2026-05-08T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-08T16:00:00Z', exitTime: '2026-05-09T13:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-09T13:00:00Z', exitTime: '2026-05-09T14:00:00Z' },
      { phase: 'art', enterTime: '2026-05-09T14:00:00Z', exitTime: '2026-05-12T10:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-12T10:00:00Z', exitTime: '2026-05-14T15:00:00Z' },
      { phase: 'tech', enterTime: '2026-05-14T15:00:00Z', exitTime: '2026-05-16T17:00:00Z' },
      { phase: 'test', enterTime: '2026-05-16T17:00:00Z', exitTime: '2026-05-17T16:00:00Z' },
      { phase: 'test_optimize', enterTime: '2026-05-17T16:00:00Z', exitTime: '2026-05-18T11:00:00Z' },
      { phase: 'qa', enterTime: '2026-05-18T11:00:00Z' },
    ],
  },
  {
    id: 'COURSE-005',
    title: '初中化学-元素周期表',
    description: '化学元素周期表互动课件，含元素性质和周期律的动画展示',
    phase: 'animation',
    status: 'in_progress',
    assignee: '赵动画',
    department: '动画部',
    creator: '张教研',
    priority: 'high',
    tags: ['新课件制作'],
    createdAt: '2026-05-11T09:00:00Z',
    updatedAt: '2026-05-18T11:00:00Z',
    estimatedHours: 15,
    deadline: '2026-05-23',
    feedbacks: [
      {
        id: 'FB-004',
        from: '周设计',
        to: '赵动画',
        comment: '美术素材已交付，请开始动画制作',
        passed: true,
        createdAt: '2026-05-18T11:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-11T09:00:00Z', exitTime: '2026-05-12T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-12T16:00:00Z', exitTime: '2026-05-14T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-14T10:00:00Z', exitTime: '2026-05-14T11:00:00Z' },
      { phase: 'art', enterTime: '2026-05-14T11:00:00Z', exitTime: '2026-05-18T11:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-18T11:00:00Z' },
    ],
  },
  {
    id: 'COURSE-006',
    title: '高中数学-函数与导数',
    description: '函数图像变换与导数应用的高交互课件，含动态图形演示',
    phase: 'tech',
    status: 'in_progress',
    assignee: '陈技术',
    department: '技术部',
    creator: '张教研',
    priority: 'urgent',
    tags: ['新课件制作'],
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-18T09:30:00Z',
    estimatedHours: 30,
    deadline: '2026-05-28',
    feedbacks: [
      {
        id: 'FB-005',
        from: '刘动画',
        to: '陈技术',
        comment: '动画部分已交付，请进行技术集成',
        passed: true,
        createdAt: '2026-05-18T09:30:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-10T08:00:00Z', exitTime: '2026-05-11T15:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-11T15:00:00Z', exitTime: '2026-05-13T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-13T10:00:00Z', exitTime: '2026-05-13T11:00:00Z' },
      { phase: 'art', enterTime: '2026-05-13T11:00:00Z', exitTime: '2026-05-15T14:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-15T14:00:00Z', exitTime: '2026-05-18T09:30:00Z' },
      { phase: 'tech', enterTime: '2026-05-18T09:30:00Z' },
    ],
  },
  {
    id: 'COURSE-007',
    title: '初中生物-细胞结构',
    description: '动植物细胞三维结构交互课件，含细胞器功能讲解动画',
    phase: 'test',
    status: 'pending_review',
    assignee: '吴测试',
    department: '测试部',
    creator: '李审核',
    priority: 'high',
    tags: ['课件优化'],
    createdAt: '2026-05-09T09:00:00Z',
    updatedAt: '2026-05-18T08:00:00Z',
    estimatedHours: 18,
    deadline: '2026-05-24',
    feedbacks: [
      {
        id: 'FB-006',
        from: '陈技术',
        to: '吴测试',
        comment: '技术开发完成，提交测试',
        passed: true,
        createdAt: '2026-05-18T08:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-09T09:00:00Z', exitTime: '2026-05-10T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-10T16:00:00Z', exitTime: '2026-05-12T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-12T10:00:00Z', exitTime: '2026-05-12T11:00:00Z' },
      { phase: 'art', enterTime: '2026-05-12T11:00:00Z', exitTime: '2026-05-14T15:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-14T15:00:00Z', exitTime: '2026-05-16T14:00:00Z' },
      { phase: 'tech', enterTime: '2026-05-16T14:00:00Z', exitTime: '2026-05-18T08:00:00Z' },
      { phase: 'test', enterTime: '2026-05-18T08:00:00Z' },
    ],
  },
  {
    id: 'COURSE-008',
    title: '小学英语-字母发音',
    description: '26个字母标准发音及自然拼读入门课件',
    phase: 'test_optimize',
    status: 'in_progress',
    assignee: '郑测试',
    department: '测试部',
    creator: '李审核',
    priority: 'medium',
    tags: ['课件优化'],
    createdAt: '2026-05-08T10:00:00Z',
    updatedAt: '2026-05-18T10:00:00Z',
    estimatedHours: 10,
    deadline: '2026-05-22',
    feedbacks: [
      {
        id: 'FB-007',
        from: '陈技术',
        to: '郑测试',
        comment: '技术开发完成，提交测试验证',
        passed: true,
        createdAt: '2026-05-18T10:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-08T10:00:00Z', exitTime: '2026-05-09T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-09T16:00:00Z', exitTime: '2026-05-11T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-11T10:00:00Z', exitTime: '2026-05-11T11:00:00Z' },
      { phase: 'art', enterTime: '2026-05-11T11:00:00Z', exitTime: '2026-05-13T14:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-13T14:00:00Z', exitTime: '2026-05-15T15:00:00Z' },
      { phase: 'tech', enterTime: '2026-05-15T15:00:00Z', exitTime: '2026-05-18T10:00:00Z' },
      { phase: 'test_optimize', enterTime: '2026-05-18T10:00:00Z' },
    ],
  },
  {
    id: 'COURSE-009',
    title: '高中地理-气候类型',
    description: '世界主要气候类型分布与特征交互课件',
    phase: 'qa',
    status: 'pending_review',
    assignee: '周质检',
    department: '质检部',
    creator: '张教研',
    priority: 'high',
    tags: ['课件优化'],
    createdAt: '2026-05-07T08:00:00Z',
    updatedAt: '2026-05-18T11:00:00Z',
    estimatedHours: 22,
    deadline: '2026-05-25',
    feedbacks: [
      {
        id: 'FB-009',
        from: '郑测试',
        to: '周质检',
        comment: '测试优化完成，已修复所有已知bug，提交质检',
        passed: true,
        createdAt: '2026-05-18T11:00:00Z',
      },
    ],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-07T08:00:00Z', exitTime: '2026-05-08T16:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-08T16:00:00Z', exitTime: '2026-05-10T10:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-10T10:00:00Z', exitTime: '2026-05-10T11:00:00Z' },
      { phase: 'art', enterTime: '2026-05-10T11:00:00Z', exitTime: '2026-05-13T15:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-13T15:00:00Z', exitTime: '2026-05-16T14:00:00Z' },
      { phase: 'tech', enterTime: '2026-05-16T14:00:00Z', exitTime: '2026-05-17T16:00:00Z' },
      { phase: 'test', enterTime: '2026-05-17T16:00:00Z', exitTime: '2026-05-18T08:00:00Z' },
      { phase: 'test_optimize', enterTime: '2026-05-18T08:00:00Z', exitTime: '2026-05-18T11:00:00Z' },
      { phase: 'qa', enterTime: '2026-05-18T11:00:00Z' },
    ],
  },
  {
    id: 'COURSE-010',
    title: '初中历史-朝代更替',
    description: '中国主要朝代时间线交互课件，含重要事件和人物',
    phase: 'released',
    status: 'approved',
    assignee: '管理员',
    department: '项目管理',
    creator: '张教研',
    priority: 'medium',
    tags: ['教材制作'],
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-17T18:00:00Z',
    feedbacks: [],
    timeline: [
      { phase: 'teaching_research', enterTime: '2026-05-01T08:00:00Z', exitTime: '2026-05-03T15:00:00Z' },
      { phase: 'material_design', enterTime: '2026-05-03T15:00:00Z', exitTime: '2026-05-05T09:00:00Z' },
      { phase: 'teaching_review', enterTime: '2026-05-05T09:00:00Z', exitTime: '2026-05-05T10:00:00Z' },
      { phase: 'art', enterTime: '2026-05-05T10:00:00Z', exitTime: '2026-05-08T16:00:00Z' },
      { phase: 'animation', enterTime: '2026-05-08T16:00:00Z', exitTime: '2026-05-11T14:00:00Z' },
      { phase: 'tech', enterTime: '2026-05-11T14:00:00Z', exitTime: '2026-05-14T17:00:00Z' },
      { phase: 'test', enterTime: '2026-05-14T17:00:00Z', exitTime: '2026-05-16T11:00:00Z' },
      { phase: 'test_optimize', enterTime: '2026-05-16T11:00:00Z', exitTime: '2026-05-17T10:00:00Z' },
      { phase: 'qa', enterTime: '2026-05-17T10:00:00Z', exitTime: '2026-05-17T16:00:00Z' },
      { phase: 'released', enterTime: '2026-05-17T16:00:00Z', exitTime: '2026-05-17T18:00:00Z' },
    ],
  },
]

export const DEPARTMENTS = ['教研部', '设计部', '美术部', '动画部', '技术部', '测试部', '质检部']

import { MemberProfile } from '../types'

export const DEFAULT_MEMBER_PROFILES: MemberProfile[] = [
  // 教研部
  { name: '张教研', department: '教研部', role: '教研主管', skills: ['课程设计', '教案编写', '知识点拆解'], avatarColor: '#6366f1', maxTasks: 5 },
  { name: '李审核', department: '教研部', role: '教研审核', skills: ['内容审核', '标准制定', '质量把控'], avatarColor: '#8b5cf6', maxTasks: 8 },
  // 设计部
  { name: '孙设计', department: '设计部', role: '教材设计师', skills: ['排版设计', '视觉呈现', '教材编排'], avatarColor: '#0d9488', maxTasks: 4 },
  { name: '周设计', department: '设计部', role: '高级设计师', skills: ['UI设计', '插画', '教材美化'], avatarColor: '#14b8a6', maxTasks: 3 },
  // 美术部
  { name: '王美术', department: '美术部', role: '美术主美', skills: ['角色设计', '场景绘制', '色彩搭配'], avatarColor: '#0891b2', maxTasks: 4 },
  { name: '赵美术', department: '美术部', role: '美术师', skills: ['插画绘制', '素材制作', '图标设计'], avatarColor: '#06b6d4', maxTasks: 5 },
  // 动画部
  { name: '赵动画', department: '动画部', role: '动画主管', skills: ['MG动画', '交互动画', '动效设计'], avatarColor: '#059669', maxTasks: 3 },
  { name: '刘动画', department: '动画部', role: '动画师', skills: ['逐帧动画', '骨骼动画', '特效制作'], avatarColor: '#10b981', maxTasks: 4 },
  // 技术部
  { name: '陈技术', department: '技术部', role: '技术主管', skills: ['前端开发', '交互实现', '性能优化'], avatarColor: '#d97706', maxTasks: 3 },
  // 测试部
  { name: '吴测试', department: '测试部', role: '测试主管', skills: ['功能测试', '回归测试', 'bug追踪'], avatarColor: '#dc2626', maxTasks: 5 },
  { name: '郑测试', department: '测试部', role: '测试工程师', skills: ['自动化测试', '性能测试', '兼容性测试'], avatarColor: '#ef4444', maxTasks: 6 },
  // 质检部
  { name: '周质检', department: '质检部', role: '质检主管', skills: ['质量标准', '终审', '上线把关'], avatarColor: '#ca8a04', maxTasks: 8 },
]

export const MEMBERS: Record<string, string[]> = buildMembersFromProfiles(DEFAULT_MEMBER_PROFILES)

export const getProfile = (name: string, profiles: MemberProfile[] = DEFAULT_MEMBER_PROFILES): MemberProfile | undefined =>
  profiles.find((p) => p.name === name)

export function buildMembersFromProfiles(profiles: MemberProfile[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const p of profiles) {
    if (!map[p.department]) map[p.department] = []
    map[p.department].push(p.name)
  }
  return map
}

export const DEFAULT_COLLAB_MESSAGES: CollaborationMessage[] = [
  {
    id: 'COL-001',
    type: 'meeting',
    title: '教研部 × 设计部 课件评审会',
    content: '请教研部和设计部相关人员参加本周五的课件评审会，讨论初中英语时态语法课件的设计方案。时间: 5/22 14:00，地点: 3楼会议室',
    sender: '张教研',
    senderDept: '教研部',
    recipients: ['孙设计', '周设计', '李审核'],
    status: 'unread',
    createdAt: '2026-05-19T10:00:00Z',
  },
  {
    id: 'COL-002',
    type: 'handoff',
    title: '高中物理-力学基础 动画交付',
    content: '美术素材已完成，请动画部确认素材完整性和格式要求，预计本周三前交付动画文件',
    sender: '王美术',
    senderDept: '美术部',
    recipients: ['赵动画', '刘动画'],
    relatedItemId: 'COURSE-003',
    status: 'read',
    createdAt: '2026-05-18T14:00:00Z',
    readAt: '2026-05-18T15:30:00Z',
  },
  {
    id: 'COL-003',
    type: 'alert',
    title: '⏰ 初中化学-元素周期表 截止预警',
    content: '该任务截止日为5/20，当前仍在动画制作阶段，请动画部评估是否能按时完成。如无法完成请提交延迟报告。',
    sender: '系统',
    senderDept: '项目管理',
    recipients: ['赵动画', '刘动画', '陈技术'],
    relatedItemId: 'COURSE-005',
    status: 'responded',
    response: '已收到，动画部分本周二可完成，不影响后续技术开发。',
    createdAt: '2026-05-18T09:00:00Z',
    readAt: '2026-05-18T10:00:00Z',
    respondedAt: '2026-05-18T10:30:00Z',
  },
]

export const DEFAULT_TAG_OPTIONS: string[] = [
  '新课件制作', '课件优化', '新需求', '教材制作',
]

import { LevelDetail } from '../types'

export const DEFAULT_LEVEL_PROGRESS: LevelDetail[] = [
  // 2026年 - 完整 S1-S9
  { level: 'S1', year: 2026, lesson: 1, topic: '专题一', topicName: '有理数认识', courseName: '有理数的认识与运算', coursewareCode: 'M-S1-001', person: '张教研', 教研制作: '教研完成', 美术制作: '美术完成', 动画制作: '动画完成', 开发制作: '开发完成', 测试制作: '测试完成', 质检上线: '已上线', 随材: '定样', 备注: '' },
  { level: 'S1', year: 2026, lesson: 2, topic: '专题一', topicName: '有理数运算', courseName: '有理数的加减乘除', coursewareCode: 'M-S1-002', person: '张教研', 教研制作: '教研完成', 美术制作: '美术完成', 动画制作: '动画完成', 开发制作: '开发完成', 测试制作: '测试完成', 质检上线: '已上线', 随材: '定样', 备注: '' },
  { level: 'S1', year: 2026, lesson: 3, topic: '专题二', topicName: '数轴与相反数', courseName: '数轴与绝对值', coursewareCode: 'M-S1-003', person: '李审核', 教研制作: '教研完成', 美术制作: '美术完成', 动画制作: '动画中', 开发制作: '开发完成', 测试制作: '测试完成', 质检上线: '质检中', 随材: '打样', 备注: '' },
  { level: 'S2', year: 2026, lesson: 1, topic: '专题二', topicName: '整式的加减', courseName: '整式的加减运算', coursewareCode: 'M-S2-001', person: '张教研', 教研制作: '教研完成', 美术制作: '美术完成', 动画制作: '动画完成', 开发制作: '开发完成', 测试制作: '测试中', 质检上线: '-', 随材: '打样', 备注: '' },
  { level: 'S2', year: 2026, lesson: 2, topic: '专题三', topicName: '整式的乘除', courseName: '整式的乘法与因式分解', coursewareCode: 'M-S2-002', person: '李审核', 教研制作: '教研完成', 美术制作: '美术中', 动画制作: '动画中', 开发制作: '开发中', 测试制作: '-', 质检上线: '-', 随材: '设计中', 备注: '' },
  { level: 'S3', year: 2026, lesson: 1, topic: '专题三', topicName: '一元一次方程', courseName: '一元一次方程解法与应用', coursewareCode: 'M-S3-001', person: '李审核', 教研制作: '教研完成', 美术制作: '美术完成', 动画制作: '动画中', 开发制作: '开发中', 测试制作: '-', 质检上线: '-', 随材: '设计中', 备注: '' },
  { level: 'S4', year: 2026, lesson: 1, topic: '专题四', topicName: '线段与角', courseName: '线段与角的初步认识', coursewareCode: 'M-S4-001', person: '张教研', 教研制作: '教研完成', 美术制作: '美术中', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S4', year: 2026, lesson: 2, topic: '专题五', topicName: '平行与垂直', courseName: '平行线的判定与性质', coursewareCode: 'M-S4-002', person: '王美术', 教研制作: '教研中', 美术制作: '美术中', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S5', year: 2026, lesson: 1, topic: '专题五', topicName: '数据收集', courseName: '数据的收集与整理', coursewareCode: 'M-S5-001', person: '李审核', 教研制作: '教研完成', 美术制作: '美术中', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S6', year: 2026, lesson: 1, topic: '专题六', topicName: '概率基础', courseName: '简单概率计算', coursewareCode: 'M-S6-001', person: '张教研', 教研制作: '教研中', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S7', year: 2026, lesson: 1, topic: '专题七', topicName: '平移与旋转', courseName: '平移与旋转综合', coursewareCode: 'M-S7-001', person: '张教研', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S8', year: 2026, lesson: 1, topic: '专题八', topicName: '数学活动', courseName: '综合实践活动', coursewareCode: 'M-S8-001', person: '李审核', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S9', year: 2026, lesson: 1, topic: '专题九', topicName: '思维训练', courseName: '数学思维拓展', coursewareCode: 'M-S9-001', person: '张教研', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  // 2027年 - 部分 S2-S9
  { level: 'S2', year: 2027, lesson: 1, topic: '专题二', topicName: '整式进阶', courseName: '整式综合运算', coursewareCode: 'M-S2-101', person: '张教研', 教研制作: '教研完成', 美术制作: '美术中', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S3', year: 2027, lesson: 1, topic: '专题三', topicName: '方程与不等式', courseName: '一元一次不等式', coursewareCode: 'M-S3-101', person: '李审核', 教研制作: '教研完成', 美术制作: '美术中', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S4', year: 2027, lesson: 1, topic: '专题四', topicName: '几何证明', courseName: '平行线与相交线', coursewareCode: 'M-S4-101', person: '王美术', 教研制作: '教研中', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S5', year: 2027, lesson: 1, topic: '专题五', topicName: '数据分析', courseName: '数据的集中趋势', coursewareCode: 'M-S5-101', person: '张教研', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S6', year: 2027, lesson: 1, topic: '专题六', topicName: '概率计算', courseName: '概率的简单计算', coursewareCode: 'M-S6-101', person: '李审核', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S7', year: 2027, lesson: 1, topic: '专题七', topicName: '轴对称', courseName: '轴对称与中心对称', coursewareCode: 'M-S7-101', person: '张教研', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S8', year: 2027, lesson: 1, topic: '专题八', topicName: '课题学习', courseName: '数学建模初步', coursewareCode: 'M-S8-101', person: '李审核', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
  { level: 'S9', year: 2027, lesson: 1, topic: '专题九', topicName: '总复习', courseName: '小升初总复习', coursewareCode: 'M-S9-101', person: '张教研', 教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '' },
]

export function generateId(): string {
  return `COURSE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

export function generateCollabId(): string {
  return `COL-${Date.now().toString(36).toUpperCase()}`
}
