import type { Caregiver, ElderlyPerson, HealthInfo, Message, Review, CareRecord, FamilyMessage, SystemNotification, Certification } from '../store'

export const mockElderly: ElderlyPerson[] = [
  { id: 'e1', name: '张秀英', age: 78, gender: '女', relation: '母亲', careLevel: '半失能', address: '北京市海淀区中关村大街1号院3号楼', avatar: '', photos: [], birthday: '1948-03-15', healthStatus: '高血压、糖尿病史' },
  { id: 'e2', name: '李建国', age: 82, gender: '男', relation: '父亲', careLevel: '全失能', address: '北京市朝阳区建国路88号院5单元', avatar: '', photos: [], birthday: '1944-08-22', healthStatus: '脑梗后遗症、2型糖尿病' },
  { id: 'e3', name: '王淑芬', age: 75, gender: '女', relation: '岳母', careLevel: '完全自理', address: '北京市丰台区方庄路18号', avatar: '', photos: [], birthday: '1951-11-02', healthStatus: '良好' },
]

const mockCerts = (name: string, items: { name: string; issuer: string }[]): Certification[] =>
  items.map((item, i) => ({
    id: `${name}-cert-${i}`,
    name: item.name,
    issuer: item.issuer,
    issueDate: '2024-01',
    imageUrl: '',
    verified: true,
  }))

export const mockCaregivers: Caregiver[] = [
  {
    id: 'c1', name: '王芳', age: 42, gender: '女', yearsOfExp: 8, level: '高级护工',
    avatar: '', photos: [],
    certs: ['高级养老护理证', '健康管理师', '营养配餐员'],
    certifications: mockCerts('c1', [
      { name: '高级养老护理证', issuer: '人力资源与社会保障部' },
      { name: '健康管理师', issuer: '国家卫生健康委员会' },
      { name: '营养配餐员', issuer: '中国营养学会' },
    ]),
    skills: ['失能护理', '康复训练', '营养餐制作', '心理疏导'],
    rating: 4.8, serviceCount: 236, price: 45, tags: ['耐心细致', '经验丰富', '擅长失能护理', '好评如潮'],
    available: true, locked: false, onLeave: false, maxPatients: 5, currentPatients: 3,
    phone: '138****5678', serviceArea: '海淀区', completionRate: 99.5,
    introduction: '从事养老护理工作8年，服务过200多位老人，擅长失能老人护理和康复训练。性格温和耐心，深受老人和家属好评。',
    education: '护理专业大专',
  },
  {
    id: 'c2', name: '刘丽华', age: 38, gender: '女', yearsOfExp: 5, level: '中级护工',
    avatar: '', photos: [],
    certs: ['养老护理证', '急救证'],
    certifications: mockCerts('c2', [
      { name: '养老护理证', issuer: '北京市民政局' },
      { name: '急救证', issuer: '红十字会' },
    ]),
    skills: ['日常护理', '陪诊就医', '心理疏导'],
    rating: 4.6, serviceCount: 158, price: 38, tags: ['性格开朗', '沟通能力强', '陪诊专业'],
    available: true, locked: false, onLeave: false, maxPatients: 5, currentPatients: 5,
    phone: '139****2345', serviceArea: '朝阳区', completionRate: 98.2,
    introduction: '5年护理经验，擅长老年人心理疏导和陪诊服务。亲和力强，老人愿意沟通。',
    education: '社会工作专业本科',
  },
  {
    id: 'c3', name: '赵明霞', age: 45, gender: '女', yearsOfExp: 10, level: '高级护工',
    avatar: '', photos: [],
    certs: ['高级养老护理证', '营养师', '康复治疗师', '健康管理师'],
    certifications: mockCerts('c3', [
      { name: '高级养老护理证', issuer: '人力资源与社会保障部' },
      { name: '营养师', issuer: '中国营养学会' },
      { name: '康复治疗师', issuer: '国家卫生健康委员会' },
      { name: '健康管理师', issuer: '国家卫生健康委员会' },
    ]),
    skills: ['全失能护理', '鼻饲护理', '压疮护理', '气管切开护理'],
    rating: 4.9, serviceCount: 312, price: 55, tags: ['资深护工', '技能全面', '失能护理专家', '好评率100%'],
    available: true, locked: false, onLeave: true, leaveReason: '家中有事', leaveStart: '2026-05-20', leaveEnd: '2026-05-27',
    maxPatients: 5, currentPatients: 2,
    phone: '137****8901', serviceArea: '全北京', completionRate: 100,
    introduction: '10年资深护理专家，持有多项高级证书。擅长全失能老人护理、鼻饲护理和压疮护理。服务312单，好评率100%。',
    education: '护理学本科',
  },
  {
    id: 'c4', name: '陈小红', age: 35, gender: '女', yearsOfExp: 3, level: '初级护工',
    avatar: '', photos: [],
    certs: ['养老护理证'],
    certifications: mockCerts('c4', [
      { name: '养老护理证', issuer: '北京市民政局' },
    ]),
    skills: ['日常陪护', '家政服务'],
    rating: 4.3, serviceCount: 89, price: 30, tags: ['年轻有活力', '学习能力强'],
    available: false, locked: false, onLeave: false, maxPatients: 5, currentPatients: 1,
    phone: '136****4567', serviceArea: '丰台区', completionRate: 96.8,
    introduction: '年轻有活力，学习能力强。擅长日常陪护和家政服务。',
    education: '高中',
  },
  {
    id: 'c5', name: '孙志强', age: 50, gender: '男', yearsOfExp: 12, level: '高级护工',
    avatar: '', photos: [],
    certs: ['高级养老护理证', '康复治疗师', '急救证', '心理咨询师'],
    certifications: mockCerts('c5', [
      { name: '高级养老护理证', issuer: '人力资源与社会保障部' },
      { name: '康复治疗师', issuer: '国家卫生健康委员会' },
      { name: '急救证', issuer: '红十字会' },
      { name: '心理咨询师', issuer: '中国科学院心理研究所' },
    ]),
    skills: ['失能护理', '康复训练', '心理疏导', '夜间陪护'],
    rating: 4.7, serviceCount: 420, price: 50, tags: ['资深护理', '男性护工', '康复专家', '夜护首选'],
    available: true, locked: false, onLeave: false, maxPatients: 5, currentPatients: 4,
    phone: '135****6789', serviceArea: '朝阳区/海淀区', completionRate: 99.1,
    introduction: '12年护理经验，男性护工中的佼佼者。特别适合需要体力支持的男性老人护理，以及夜间陪护服务。',
    education: '康复治疗专业本科',
  },
]

export const mockHealthInfo: HealthInfo = {
  id: 'h1', elderlyId: 'e1', height: 158, weight: 55, bloodType: 'A',
  careLevel: '半失能', allergies: ['青霉素', '磺胺类药物'], dietHabits: '低盐低脂饮食，忌甜食、高糖水果',
  medicalHistory: [
    { id: 'm1', diseaseName: '高血压（3级 高危）', diagnosisDate: '2018-03-15', treatment: '口服硝苯地平控释片30mg 1次/日，定期监测血压', recovery: '控制良好，血压维持在130/85以下', attachments: [], createdAt: '2018-03-15' },
    { id: 'm2', diseaseName: '2型糖尿病', diagnosisDate: '2020-06-20', treatment: '口服二甲双胍0.5g 2次/日 + 饮食控制', recovery: '控制中等，空腹血糖7-8mmol/L', attachments: [], createdAt: '2020-06-20' },
    { id: 'm3', diseaseName: '左膝骨关节炎', diagnosisDate: '2022-01-10', treatment: '关节腔注射玻璃酸钠 1次/年，口服氨基葡萄糖', recovery: '行走疼痛明显减轻', attachments: [], createdAt: '2022-01-10' },
  ],
  createdAt: '2024-01-01', updatedAt: '2026-05-25',
  carePlan: [
    { id: 'cp1', type: 'medication', title: '降压药', description: '硝苯地平控释片 30mg 每日早8点口服', time: '08:00', status: 'active' },
    { id: 'cp2', type: 'medication', title: '降糖药', description: '二甲双胍 0.5g 早晚餐后口服', time: '08:00/18:00', status: 'active' },
    { id: 'cp3', type: 'training', title: '下肢康复训练', description: '被动关节活动 + 站立训练 30分钟', time: '15:00', status: 'active' },
    { id: 'cp4', type: 'diet', title: '低盐低脂饮食', description: '每日盐摄入<5g，限制高糖食物', time: '全天', status: 'active' },
  ],
  capabilities: [
    { name: '进食', score: 2, maxScore: 3 },
    { name: '穿衣', score: 1, maxScore: 3 },
    { name: '如厕', score: 2, maxScore: 3 },
    { name: '洗澡', score: 1, maxScore: 3 },
    { name: '行走', score: 1, maxScore: 3 },
    { name: '上下楼梯', score: 0, maxScore: 3 },
  ],
}

export const mockMessages: Message[] = [
  { id: 'msg1', senderId: 'c1', senderName: '王芳', senderAvatar: '', content: '张阿姨今天血压正常，120/80，精神很好，早餐吃了一碗小米粥和一个鸡蛋', type: 'text', createdAt: '2026-05-26T10:30:00', read: true, receiverId: 'u1' },
  { id: 'msg2', senderId: 'u1', senderName: '我', content: '好的，谢谢王姐照顾！降压药按时吃了吗？', type: 'text', createdAt: '2026-05-26T10:35:00', read: true, receiverId: 'c1' },
  { id: 'msg3', senderId: 'c1', senderName: '王芳', content: '早上8点已经吃过了，放心。今天康复训练做了30分钟，走路比上周稳多了', type: 'text', createdAt: '2026-05-26T15:00:00', read: false, receiverId: 'u1' },
  { id: 'msg4', senderId: 'c2', senderName: '刘丽华', content: '李叔叔今天胃口不错，午饭吃了一碗米饭加红烧鱼', type: 'text', createdAt: '2026-05-25T12:30:00', read: true, receiverId: 'u1' },
  { id: 'msg5', senderId: 'c1', senderName: '王芳', content: '', type: 'image', createdAt: '2026-05-26T16:00:00', read: false, receiverId: 'u1', imageUrl: '' },
]

export const mockReviews: Review[] = [
  {
    id: 'r1', orderId: 'o1', caregiverId: 'c1', caregiverName: '王芳',
    elderlyId: 'e1', elderlyName: '张秀英',
    rating: 5, content: '王姐非常细心，每天按时给老人吃药，还会陪老人聊天解闷。老人心情好了很多，我们做子女的非常放心。感谢王姐的悉心照料！',
    images: [], dimensions: { attitude: 5, professional: 5, patience: 5, response: 5, effectiveness: 5 },
    createdAt: '2026-05-20',
  },
  {
    id: 'r2', orderId: 'o2', caregiverId: 'c3', caregiverName: '赵明霞',
    elderlyId: 'e2', elderlyName: '李建国',
    rating: 5, content: '赵护工专业能力很强，对失能老人的护理非常到位，压疮护理做得很好，还会定期给老人翻身拍背。我们全家都很感激。',
    images: [], dimensions: { attitude: 5, professional: 5, patience: 4, response: 5, effectiveness: 5 },
    createdAt: '2026-05-18',
  },
  {
    id: 'r3', orderId: 'o3', caregiverId: 'c1', caregiverName: '王芳',
    elderlyId: 'e1', elderlyName: '张秀英',
    rating: 4, content: '总体不错，偶尔会晚到几分钟，但服务态度很好，老人喜欢她。',
    images: [], dimensions: { attitude: 5, professional: 4, patience: 5, response: 3, effectiveness: 4 },
    createdAt: '2026-05-10',
  },
]

export const mockCareRecords: CareRecord[] = [
  {
    id: 'cr1', elderlyId: 'e1', elderlyName: '张秀英', caregiverId: 'c1', caregiverName: '王芳',
    startTime: '2026-05-26T08:00:00', endTime: '2026-05-26T17:00:00',
    content: '日常护理：测量血压、协助洗漱、准备早餐、康复训练、陪同散步',
    status: 'completed', medications: '硝苯地平控释片 30mg 1次/日（08:00已服）',
    diet: '早餐：小米粥+水煮蛋；午餐：清蒸鲈鱼+西兰花+杂粮饭；加餐：苹果半个',
    training: '下肢被动关节活动15分钟 + 站立训练15分钟', notes: '老人精神状态良好，血压120/80，血糖餐后8.2mmol/L',
    images: [], videos: [], voiceNotes: '',
  },
  {
    id: 'cr2', elderlyId: 'e1', elderlyName: '张秀英', caregiverId: 'c1', caregiverName: '王芳',
    startTime: '2026-05-25T08:00:00', endTime: '2026-05-25T17:00:00',
    content: '日常护理：测量血压、协助洗漱、准备三餐、康复训练、心理疏导',
    status: 'completed', medications: '硝苯地平控释片 30mg 1次/日',
    diet: '早餐：豆浆+包子；午餐：番茄炒蛋+青菜+米饭；晚餐：小米粥+蒸南瓜',
    training: '下肢康复训练30分钟 + 手指灵活性训练15分钟',
    notes: '老人情绪略低落，经沟通后好转。血压125/82，血糖餐后7.6mmol/L',
    images: [], videos: [], voiceNotes: '',
  },
  {
    id: 'cr3', elderlyId: 'e2', elderlyName: '李建国', caregiverId: 'c3', caregiverName: '赵明霞',
    startTime: '2026-05-26T08:00:00',
    content: '全失能护理：翻身拍背、鼻饲护理、口腔护理、被动关节活动',
    status: 'ongoing', medications: '降糖药 2次/日（08:00已服）', diet: '鼻饲营养液 500ml 4次/日',
    training: '被动关节活动20分钟（上下肢各10分钟）', notes: '生命体征平稳，压疮部位有好转',
    images: [], videos: [], voiceNotes: '',
  },
]

export const mockFamilyMessages: FamilyMessage[] = [
  { id: 'fm1', elderlyId: 'e1', elderlyName: '张秀英', senderId: 'u1', senderName: '张明', role: '家属', content: '王姐您好，我妈今天说膝盖有点疼，麻烦您帮她热敷一下，谢谢！', type: 'text', createdAt: '2026-05-26T08:30:00', replied: true, replyContent: '好的，已经帮阿姨热敷了15分钟，她说舒服多了', replyTime: '2026-05-26T09:00:00' },
  { id: 'fm2', elderlyId: 'e1', elderlyName: '张秀英', senderId: 'c1', senderName: '王芳', role: '护工', content: '张叔叔您好，阿姨今天的降压药我已经喂过了，血压正常。她中午想吃饺子，我准备包点韭菜鸡蛋馅的', type: 'text', createdAt: '2026-05-26T10:15:00', replied: false },
  { id: 'fm3', elderlyId: 'e1', elderlyName: '张秀英', senderId: 'u1', senderName: '张明', role: '家属', content: '好的，辛苦您了！韭菜鸡蛋馅我妈最爱吃 😊', type: 'text', createdAt: '2026-05-26T10:30:00', replied: true, replyContent: '不客气，阿姨开心我就高兴。饺子已经包好了，准备下锅', replyTime: '2026-05-26T11:00:00' },
  { id: 'fm4', elderlyId: 'e1', elderlyName: '张秀英', senderId: 'u1', senderName: '张明', role: '家属', content: '', type: 'voice', createdAt: '2026-05-25T20:00:00', replied: false, voiceUrl: '' },
]

export const mockNotifications: SystemNotification[] = [
  { id: 'n1', type: 'care_reminder', title: '用药提醒', content: '张秀英 - 硝苯地平控释片 今日08:00已服用', time: '2026-05-26T08:00:00', read: true },
  { id: 'n2', type: 'message', title: '新留言', content: '王芳给您的留言：阿姨今天康复训练效果很好', time: '2026-05-26T15:00:00', read: false },
  { id: 'n3', type: 'system', title: '服务提醒', content: '李建国的护理服务将于今日18:00结束，请及时查看护理报告', time: '2026-05-26T16:00:00', read: false },
  { id: 'n4', type: 'review', title: '评价提醒', content: '请对王芳5月25日的护理服务进行评价', time: '2026-05-25T18:00:00', read: true },
  { id: 'n5', type: 'care_reminder', title: '康复训练提醒', content: '张秀英 - 今日下肢康复训练已完成', time: '2026-05-26T15:30:00', read: false },
]
