export type Phase =
  | 'material_design'
  | 'teaching_research'
  | 'teaching_review'
  | 'art'
  | 'animation'
  | 'tech'
  | 'test'
  | 'test_optimize'
  | 'qa'
  | 'released'

export type Status = 'todo' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Feedback {
  id: string
  from: string
  to: string
  comment: string
  passed: boolean
  createdAt: string
}

export interface TimelineEntry {
  phase: Phase
  enterTime: string
  exitTime?: string
}

export interface DelayInfo {
  reason: string
  resolveNode: string
  resolvePlan: string
  reportedAt: string
}

export interface WorkItem {
  id: string
  title: string
  description: string
  phase: Phase
  status: Status
  assignee: string
  department: string
  creator: string
  priority: Priority
  tags: string[]
  createdAt: string
  updatedAt: string
  feedbacks: Feedback[]
  timeline: TimelineEntry[]
  estimatedHours?: number
  deadline?: string
  delayInfo?: DelayInfo
  isLocked?: boolean
  abandoned?: boolean
  level?: Level
  lesson?: number
  materialStatus?: string
}

export const MATERIAL_STATUS_OPTIONS = ['设计中', '打样', '定样', '签样', '已完成']

export interface MemberProfile {
  name: string
  department: string
  role: string
  skills: string[]
  avatarColor: string
  maxTasks: number
  active?: boolean
}

export interface PhaseConfig {
  key: Phase
  label: string
  color: string
  icon: string
}

export const PHASES: PhaseConfig[] = [
  { key: 'teaching_research', label: '教研制作', color: '#4f46e5', icon: '📝' },
  { key: 'material_design', label: '教材设计', color: '#0d9488', icon: '📐' },
  { key: 'teaching_review', label: '教研审核', color: '#7c3aed', icon: '🔍' },
  { key: 'art', label: '美术制作', color: '#0891b2', icon: '🎨' },
  { key: 'animation', label: '动画制作', color: '#059669', icon: '🎬' },
  { key: 'tech', label: '技术制作', color: '#d97706', icon: '⚙️' },
  { key: 'test', label: '测试制作', color: '#dc2626', icon: '🧪' },
  { key: 'test_optimize', label: '测试优化', color: '#ea580c', icon: '🔧' },
  { key: 'qa', label: '质检', color: '#ca8a04', icon: '✅' },
  { key: 'released', label: '上线', color: '#16a34a', icon: '🚀' },
]

export const STATUS_LABELS: Record<Status, string> = {
  todo: '待处理',
  in_progress: '进行中',
  pending_review: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
}

export interface CollaborationMessage {
  id: string
  type: 'meeting' | 'handoff' | 'alert' | 'info'
  title: string
  content: string
  sender: string
  senderDept: string
  recipients: string[]
  relatedItemId?: string
  status: 'unread' | 'read' | 'responded'
  response?: string
  createdAt: string
  readAt?: string
  respondedAt?: string
}

export const PHASE_DEPARTMENT: Record<Phase, string> = {
  teaching_research: '教研部',
  material_design: '设计部',
  teaching_review: '教研部',
  art: '美术部',
  animation: '动画部',
  tech: '技术部',
  test: '测试部',
  test_optimize: '测试部',
  qa: '测试部',
  released: '测试部',
}
export const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'] as const
export type Level = (typeof LEVELS)[number]

export interface LevelDetail {
  level: Level
  year: number
  lesson: number
  topic: string
  topicName: string
  courseName: string
  coursewareCode: string
  person: string
  教研制作: string
  美术制作: string
  动画制作: string
  开发制作: string
  测试制作: string
  质检上线: string
  随材: string
  备注: string
}

export const PHASE_STATUS_OPTIONS: Record<string, string[]> = {
  教研制作: ['教研中', '教研完成'],
  美术制作: ['美术中', '美术完成'],
  动画制作: ['动画中', '动画完成'],
  开发制作: ['开发中', '开发完成'],
  测试制作: ['测试中', '测试完成'],
  质检上线: ['质检中', '质检完成', '发布中', '已上线'],
  随材: ['设计中', '打样', '定样', '签样', '已完成'],
}

export const LESSONS_PER_LEVEL = 96

const CN_NUMS = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','二十一','二十二','二十三','二十四']
export const TOPIC_OPTIONS = Array.from({ length: 24 }, (_, i) => `专题${CN_NUMS[i]}`)

export const getPhaseByKey = (key: Phase): PhaseConfig =>
  PHASES.find((p) => p.key === key) ?? PHASES[0]

export const PHASE_TO_LEVEL_AUTO: Record<Phase, { field: string; working: string; done: string } | null> = {
  material_design: { field: '随材', working: '设计中', done: '已完成' },
  teaching_research: { field: '教研制作', working: '教研中', done: '教研完成' },
  teaching_review: { field: '教研制作', working: '教研中', done: '教研完成' },
  art: { field: '美术制作', working: '美术中', done: '美术完成' },
  animation: { field: '动画制作', working: '动画中', done: '动画完成' },
  tech: { field: '开发制作', working: '开发中', done: '开发完成' },
  test: { field: '测试制作', working: '测试中', done: '测试完成' },
  test_optimize: { field: '测试制作', working: '测试中', done: '测试完成' },
  qa: { field: '质检上线', working: '质检中', done: '质检完成' },
  released: { field: '质检上线', working: '质检中', done: '已上线' },
}

export const LEVEL_ALL_COMPLETED: Record<string, string> = {
  教研制作: '教研完成',
  美术制作: '美术完成',
  动画制作: '动画完成',
  开发制作: '开发完成',
  测试制作: '测试完成',
  质检上线: '已上线',
}

export const LEVEL_FIELD_ORDER = ['随材', '教研制作', '美术制作', '动画制作', '开发制作', '测试制作', '质检上线']
