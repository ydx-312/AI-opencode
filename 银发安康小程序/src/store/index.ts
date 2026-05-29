import { create } from 'zustand'

export type UserRole = 'elderly' | 'family' | 'caregiver' | 'admin'

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  imageUrl?: string
  verified: boolean
}

export type CaregiverLevel = '初级护工' | '中级护工' | '高级护工'

export interface User {
  id: string
  phone: string
  name: string
  avatar?: string
  role: UserRole
  gender?: string
  age?: number
  address?: string
  caregiverLevel?: CaregiverLevel
  caregiverId?: string
}

export interface ElderlyPerson {
  id: string
  name: string
  age: number
  gender: string
  relation: string
  avatar?: string
  photos?: string[]
  careLevel: string
  address: string
  healthStatus?: string
  birthday?: string
}

export interface Caregiver {
  id: string
  name: string
  avatar?: string
  photos?: string[]
  age: number
  gender: string
  yearsOfExp: number
  level: CaregiverLevel
  certs: string[]
  certifications?: Certification[]
  skills: string[]
  rating: number
  serviceCount: number
  price: number
  tags: string[]
  available: boolean
  locked?: boolean
  onLeave?: boolean
  leaveReason?: string
  leaveStart?: string
  leaveEnd?: string
  substituteId?: string
  maxPatients?: number
  currentPatients?: number
  phone?: string
  serviceArea?: string
  completionRate?: number
  introduction?: string
  education?: string
  idNumber?: string
  emergencyContact?: string
}

export interface CarePlan {
  id: string
  type: 'medication' | 'training' | 'diet' | 'rest'
  title: string
  description: string
  time: string
  status: 'active' | 'completed'
}

export interface CapabilityItem {
  name: string
  score: number
  maxScore: number
}

export interface CareRecord {
  id: string
  elderlyId: string
  elderlyName: string
  caregiverId: string
  caregiverName: string
  substituteId?: string
  substituteName?: string
  startTime: string
  endTime?: string
  content: string
  status: 'ongoing' | 'completed'
  medications?: string
  diet?: string
  training?: string
  notes?: string
  images: string[]
  videos: string[]
  voiceNotes?: string
}

export interface CaregiverEditLog {
  id: string
  caregiverId: string
  caregiverName: string
  editorId: string
  editorName: string
  changes: Partial<Caregiver>
  timestamp: string
}

export interface MedicalRecord {
  id: string
  diseaseName: string
  diagnosisDate: string
  treatment: string
  recovery: string
  attachments: string[]
  createdAt: string
}

export interface HealthInfo {
  id: string
  elderlyId: string
  height: number
  weight: number
  bloodType: string
  careLevel: string
  allergies: string[]
  dietHabits: string
  medicalHistory: MedicalRecord[]
  carePlan?: CarePlan[]
  capabilities?: CapabilityItem[]
  createdAt: string
  updatedAt: string
}

export interface FamilyMessage {
  id: string
  elderlyId: string
  elderlyName: string
  senderId: string
  senderName: string
  role: '家属' | '护工'
  content: string
  type: 'text' | 'voice' | 'image'
  createdAt: string
  replied: boolean
  replyContent?: string
  replyTime?: string
  voiceUrl?: string
}

export interface CareEndRequest {
  id: string
  caregiverId: string
  caregiverName: string
  elderlyId: string
  elderlyName: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
}

export interface CaregiverChangeRequest {
  id: string
  elderlyId: string
  elderlyName: string
  currentCaregiverId: string
  currentCaregiverName: string
  requestedCaregiverId?: string
  requestedCaregiverName?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
}

export interface SystemNotification {
  id: string
  type: 'message' | 'care_reminder' | 'system' | 'review'
  title: string
  content: string
  time: string
  read: boolean
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'voice'
  createdAt: string
  read: boolean
  imageUrl?: string
  edited?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  mentions?: string[]
}

export interface Review {
  id: string
  orderId: string
  caregiverId: string
  caregiverName: string
  elderlyId: string
  elderlyName: string
  rating: number
  content: string
  images: string[]
  dimensions: {
    attitude: number
    professional: number
    patience: number
    response: number
    effectiveness: number
  }
  createdAt: string
}

export const Permissions = {
  isAdmin: (role?: UserRole) => role === 'admin',
  isCaregiver: (role?: UserRole) => role === 'caregiver',
  isFamily: (role?: UserRole) => role === 'family',
  canManageCaregivers: (role?: UserRole) => role === 'admin',
  canEditCareRecord: (role?: UserRole) => role === 'caregiver' || role === 'admin',
  canEditHealthInfo: (role?: UserRole) => role === 'family' || role === 'admin',
  canViewAdminPanel: (role?: UserRole) => role === 'admin',
  canSendMessages: (role?: UserRole) => role === 'caregiver' || role === 'admin' || role === 'family',
  canReplyMessages: (role?: UserRole) => role === 'caregiver' || role === 'admin',
  getLevelLabel: (level?: CaregiverLevel) => level || '未定级',
  getLevelColor: (level?: CaregiverLevel) =>
    level === '高级护工' ? '#1B5E20' : level === '中级护工' ? '#F57C00' : level === '初级护工' ? '#1976D2' : '#9E9E9E',
}

export function findCaregiverByPhone(phone: string, caregivers: Caregiver[]): Caregiver | undefined {
  const clean = phone.replace(/\D/g, '')
  return caregivers.find((c) => {
    const cPhone = (c.phone || '').replace(/\D/g, '')
    return cPhone.includes(clean.slice(-4)) || clean.includes(cPhone)
  })
}

export function getCaregiverLevel(yearsOfExp: number): CaregiverLevel {
  if (yearsOfExp >= 8) return '高级护工'
  if (yearsOfExp >= 3) return '中级护工'
  return '初级护工'
}

interface AppState {
  user: User | null
  isLoggedIn: boolean
  boundElderly: ElderlyPerson[]
  caregivers: Caregiver[]
  careRecords: CareRecord[]
  healthInfo: HealthInfo | null
  messages: Message[]
  familyMessages: FamilyMessage[]
  notifications: SystemNotification[]
  reviews: Review[]
  careEndRequests: CareEndRequest[]
  caregiverChangeRequests: CaregiverChangeRequest[]
  caregiverEditLogs: CaregiverEditLog[]
  fontSizeScale: number
  unreadNotifications: number

  setUser: (user: User) => void
  logout: () => void
  setBoundElderly: (list: ElderlyPerson[]) => void
  setCaregivers: (list: Caregiver[]) => void
  updateCaregiver: (id: string, data: Partial<Caregiver>) => void
  addCareRecord: (record: CareRecord) => void
  setCareRecords: (records: CareRecord[]) => void
  updateCareRecord: (id: string, data: Partial<CareRecord>) => void
  setHealthInfo: (info: HealthInfo) => void
  addMessage: (message: Message) => void
  addReview: (review: Review) => void
  addFamilyMessage: (msg: FamilyMessage) => void
  replyFamilyMessage: (id: string, content: string) => void
  markNotificationRead: (id: string) => void
  addNotification: (notification: SystemNotification) => void
  addCareEndRequest: (req: CareEndRequest) => void
  updateCareEndRequest: (id: string, data: Partial<CareEndRequest>) => void
  addCaregiverChangeRequest: (req: CaregiverChangeRequest) => void
  updateCaregiverChangeRequest: (id: string, data: Partial<CaregiverChangeRequest>) => void
  addCaregiverEditLog: (log: CaregiverEditLog) => void
  setFontSizeScale: (scale: number) => void
  loadMockData: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  (set) => ({
    user: null,
    isLoggedIn: false,
    boundElderly: [],
    caregivers: [],
    careRecords: [],
    healthInfo: null,
    messages: [],
    familyMessages: [],
    notifications: [],
    reviews: [],
    careEndRequests: [],
    caregiverChangeRequests: [],
    caregiverEditLogs: [],
    fontSizeScale: 1,
    unreadNotifications: 0,

    setUser: (user) => set({ user, isLoggedIn: true }),
    logout: () => set({ user: null, isLoggedIn: false }),

    setBoundElderly: (list) => set({ boundElderly: list }),
    setCaregivers: (list) => set({ caregivers: list }),

    updateCaregiver: (id, data) =>
      set((state) => ({
        caregivers: state.caregivers.map((c) =>
          c.id === id ? { ...c, ...data } : c
        ),
      })),

    addCareRecord: (record) =>
      set((state) => ({ careRecords: [...state.careRecords, record] })),

    setCareRecords: (records) => set({ careRecords: records }),

    updateCareRecord: (id, data) =>
      set((state) => ({
        careRecords: state.careRecords.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      })),

    setHealthInfo: (info) => set({ healthInfo: info }),

    addMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),

    addReview: (review) =>
      set((state) => ({ reviews: [...state.reviews, review] })),

    addFamilyMessage: (msg) =>
      set((state) => ({
        familyMessages: [...state.familyMessages, msg],
        unreadNotifications: state.unreadNotifications + 1,
      })),

    replyFamilyMessage: (id, content) =>
      set((state) => ({
        familyMessages: state.familyMessages.map((m) =>
          m.id === id
            ? { ...m, replied: true, replyContent: content, replyTime: new Date().toISOString() }
            : m
        ),
      })),

    markNotificationRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadNotifications: Math.max(
          0,
          state.notifications.filter((n) => n.id !== id && !n.read).length
        ),
      })),

    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification],
        unreadNotifications: state.unreadNotifications + 1,
      })),

    addCareEndRequest: (req) =>
      set((state) => ({ careEndRequests: [...state.careEndRequests, req] })),

    updateCareEndRequest: (id, data) =>
      set((state) => ({
        careEndRequests: state.careEndRequests.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      })),

    addCaregiverChangeRequest: (req) =>
      set((state) => ({ caregiverChangeRequests: [...state.caregiverChangeRequests, req] })),

    updateCaregiverChangeRequest: (id, data) =>
      set((state) => ({
        caregiverChangeRequests: state.caregiverChangeRequests.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
      })),

    addCaregiverEditLog: (log) =>
      set((state) => ({ caregiverEditLogs: [...state.caregiverEditLogs, log] })),

    setFontSizeScale: (scale) => set({ fontSizeScale: scale }),

    loadMockData: async () => {
      const m = await import('../utils/mockData')
      set({
        caregivers: m.mockCaregivers,
        careRecords: m.mockCareRecords,
        healthInfo: m.mockHealthInfo,
        messages: m.mockMessages,
        familyMessages: m.mockFamilyMessages,
        notifications: m.mockNotifications,
        reviews: m.mockReviews,
      })
    },
  })
)
