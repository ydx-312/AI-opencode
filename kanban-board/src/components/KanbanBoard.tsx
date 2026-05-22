import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { WorkItem, Phase, PHASES, PRIORITY_ORDER, PHASE_DEPARTMENT, PHASE_TO_LEVEL_AUTO, LEVEL_ALL_COMPLETED, LEVEL_FIELD_ORDER, MemberProfile, CollaborationMessage, LevelDetail } from '../types'
import KanbanColumn from './KanbanColumn'
import WorkItemCard from './WorkItemCard'
import WorkItemDetail from './WorkItemDetail'
import CreateItemModal from './CreateItemModal'
import FlowConfirmModal from './FlowConfirmModal'
import AnalyticsPanel from './AnalyticsPanel'
import DeadlineWarning from './DeadlineWarning'
import SummaryReport from './SummaryReport'
import PersonnelPanel from './PersonnelPanel'
import CollaborationPanel from './CollaborationPanel'
import LevelProgressPanel from './LevelProgressPanel'
import { mockItems, DEFAULT_MEMBER_PROFILES, DEFAULT_COLLAB_MESSAGES, DEFAULT_TAG_OPTIONS, DEFAULT_LEVEL_PROGRESS } from '../data/mockData'
import { Level } from '../types'
import { getMondayOfWeek, getWeekLabel, isInWeek, isInYear, getCurrentYear } from '../utils/time'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function saveJSON(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota exceeded */ }
}

const STORAGE_KEYS = {
  items: 'kanban_items',
  levelProgress: 'kanban_levelProgress',
  memberProfiles: 'kanban_memberProfiles',
  collabMessages: 'kanban_collabMessages',
  tagOptions: 'kanban_tagOptions',
} as const

function normalizeLevelRow(row: LevelDetail, updatedField: string): LevelDetail {
  const fields = LEVEL_FIELD_ORDER
  const refIdx = fields.indexOf(updatedField)
  if (refIdx < 0) return row
  const result = { ...row }
  for (let i = 0; i < refIdx; i++) {
    const done = LEVEL_ALL_COMPLETED[fields[i]]
    if (done) (result as any)[fields[i]] = done
  }
  for (let i = refIdx + 1; i < fields.length; i++) {
    (result as any)[fields[i]] = '-'
  }
  return result
}

type ViewMode = 'all' | 'week'
type TaskFilter = 'all' | 'active' | 'completed' | 'abandoned' | '新课件制作' | '课件优化' | '新需求' | '教材制作'

export default function KanbanBoard() {
  const [items, setItems] = useState<WorkItem[]>(() => loadJSON(STORAGE_KEYS.items, mockItems))
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null)
  const [notifications, setNotifications] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [createPhase, setCreatePhase] = useState<Phase | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showPersonnel, setShowPersonnel] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showLevelProgress, setShowLevelProgress] = useState(false)
  const [levelProgress, setLevelProgress] = useState<LevelDetail[]>(() => loadJSON(STORAGE_KEYS.levelProgress, DEFAULT_LEVEL_PROGRESS))
  const [memberProfiles, setMemberProfiles] = useState<MemberProfile[]>(() => loadJSON(STORAGE_KEYS.memberProfiles, DEFAULT_MEMBER_PROFILES))
  const [collabMessages, setCollabMessages] = useState<CollaborationMessage[]>(() => loadJSON(STORAGE_KEYS.collabMessages, DEFAULT_COLLAB_MESSAGES))
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all')
  const [tagOptions, setTagOptions] = useState<string[]>(() => loadJSON(STORAGE_KEYS.tagOptions, DEFAULT_TAG_OPTIONS))
  const [pendingFlow, setPendingFlow] = useState<{ item: WorkItem; targetPhase: Phase } | null>(null)
  const [personFilter, setPersonFilter] = useState('')

  // Persist all mutable data to localStorage on change
  useEffect(() => { saveJSON(STORAGE_KEYS.items, items) }, [items])
  useEffect(() => { saveJSON(STORAGE_KEYS.levelProgress, levelProgress) }, [levelProgress])
  useEffect(() => { saveJSON(STORAGE_KEYS.memberProfiles, memberProfiles) }, [memberProfiles])
  useEffect(() => { saveJSON(STORAGE_KEYS.collabMessages, collabMessages) }, [collabMessages])
  useEffect(() => { saveJSON(STORAGE_KEYS.tagOptions, tagOptions) }, [tagOptions])

  // Time filter state
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()))
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const item of items) years.add(new Date(item.createdAt).getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [items])

  const assigneeOptions = useMemo(() => {
    const names = new Set<string>()
    for (const item of items) if (item.assignee) names.add(item.assignee)
    return Array.from(names).sort()
  }, [items])

  const timeFilteredItems = useMemo(() => {
    if (viewMode === 'all') return items
    return items.filter((item) => {
      const yearMatch = isInYear(item.createdAt, selectedYear)
      if (!yearMatch) return false
      if (viewMode === 'week') return isInWeek(item.createdAt, currentMonday)
      return true
    })
  }, [items, viewMode, currentMonday, selectedYear])

  const filteredItems = useMemo(() => {
    let result = timeFilteredItems
    if (taskFilter === 'active') {
      result = result.filter((i) => i.phase !== 'released' && i.abandoned !== true)
    } else if (taskFilter === 'completed') {
      result = result.filter((i) => i.phase === 'released')
    } else if (taskFilter === 'abandoned') {
      result = result.filter((i) => i.abandoned === true)
    } else if (taskFilter === '新课件制作' || taskFilter === '课件优化' || taskFilter === '新需求' || taskFilter === '教材制作') {
      result = result.filter((i) => i.tags.includes(taskFilter))
    }
    if (personFilter) {
      result = result.filter((i) => i.assignee === personFilter)
    }
    return result
  }, [timeFilteredItems, taskFilter, personFilter])

  const filterCounts = useMemo(() => {
    const all = timeFilteredItems.length
    const active = timeFilteredItems.filter((i) => i.phase !== 'released' && i.abandoned !== true).length
    const completed = timeFilteredItems.filter((i) => i.phase === 'released').length
    const abandoned = timeFilteredItems.filter((i) => i.abandoned === true).length
    const newCourse = timeFilteredItems.filter((i) => i.tags.includes('新课件制作')).length
    const optimize = timeFilteredItems.filter((i) => i.tags.includes('课件优化')).length
    const newReq = timeFilteredItems.filter((i) => i.tags.includes('新需求')).length
    const material = timeFilteredItems.filter((i) => i.tags.includes('教材制作')).length
    return { all, active, completed, abandoned, newCourse, optimize, newReq, material }
  }, [timeFilteredItems])

  const addNotification = useCallback((msg: string) => {
    setNotifications((prev) => [msg, ...prev].slice(0, 50))
  }, [])

  const getItemsByPhase = useCallback(
    (phase: Phase) =>
      filteredItems
        .filter((item) => item.phase === phase)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [filteredItems]
  )

  const goToPrevWeek = useCallback(() => {
    setCurrentMonday((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setCurrentMonday((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }, [])

  const goToCurrentWeek = useCallback(() => {
    setCurrentMonday(getMondayOfWeek(new Date()))
    setViewMode('week')
  }, [])

  const handleCreateItem = useCallback(
    (newItem: WorkItem) => {
      setItems((prev) => [...prev, newItem])
      setCreatePhase(null)
      addNotification(`📦 ${newItem.title} 已创建「${PHASES.find((p) => p.key === newItem.phase)?.label}」`)
      if (newItem.level && newItem.lesson) {
        const { level, lesson, creator } = newItem
        setLevelProgress((prev) => {
          const exists = prev.find((r) => r.level === level && r.lesson === lesson)
          if (exists) return prev
          const empty: LevelDetail = {
            level: level as Level,
            year: new Date().getFullYear(),
            lesson,
            topic: '', topicName: '', courseName: '', coursewareCode: '',
            person: creator,
            教研制作: '-', 美术制作: '-', 动画制作: '-', 开发制作: '-', 测试制作: '-', 质检上线: '-', 随材: '-', 备注: '',
          }
          return [...prev, empty]
        })
      }
    },
    [addNotification]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = items.find((i) => i.id === event.active.id)
      if (!item || item.isLocked || item.abandoned) return
      setActiveItem(item)
    },
    [items]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null)
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const item = items.find((i) => i.id === activeId)
      if (!item || item.isLocked || item.abandoned) return

      let targetPhase: Phase | null = null

      const overPhase = PHASES.find((p) => p.key === over.id)
      if (overPhase) {
        targetPhase = overPhase.key
      } else {
        const overItem = items.find((i) => i.id === over.id)
        if (overItem) targetPhase = overItem.phase
      }

      if (!targetPhase || targetPhase === item.phase) return

      // Restrict drag: material_design ↔ teaching_review only
      if (item.phase === 'material_design' && targetPhase !== 'teaching_review') return
      if (item.phase === 'teaching_review' && targetPhase !== 'material_design') return

      setPendingFlow({ item, targetPhase })
    },
    [items]
  )

  const handleFlowConfirm = useCallback(
    (updatedItem: WorkItem) => {
      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
      setPendingFlow(null)
      const phaseLabel = PHASES.find((p) => p.key === updatedItem.phase)?.label ?? updatedItem.phase
      addNotification(`📦 ${updatedItem.title} 已流转至「${phaseLabel}」(${updatedItem.department} - ${updatedItem.assignee})`)

      // On phase change, set the LevelDetail field to working status and normalize
      if (updatedItem.level && updatedItem.lesson) {
        setLevelProgress((prev) =>
          prev.map((r) => {
            if (r.level !== updatedItem.level || r.lesson !== updatedItem.lesson) return r
            const auto = PHASE_TO_LEVEL_AUTO[updatedItem.phase]
            if (auto) {
              return normalizeLevelRow({ ...r, [auto.field]: auto.working }, auto.field)
            }
            return r
          })
        )
      }
    },
    [addNotification]
  )

  const handleFlowCancel = useCallback(() => {
    setPendingFlow(null)
  }, [])

  const handleUpdateItem = useCallback(
    (updatedItem: WorkItem) => {
      const prevItem = items.find((i) => i.id === updatedItem.id)

      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
      setSelectedItem(updatedItem)

      if (prevItem && prevItem.phase !== updatedItem.phase) {
        const phaseLabel = PHASES.find((p) => p.key === updatedItem.phase)?.label ?? updatedItem.phase
        addNotification(`📦 ${updatedItem.title} 已流入「${phaseLabel}」`)
        // Sync level progress when phase changes via manual buttons
        if (updatedItem.level && updatedItem.lesson) {
          setLevelProgress((prev) =>
            prev.map((r) => {
              if (r.level !== updatedItem.level || r.lesson !== updatedItem.lesson) return r
              const auto = PHASE_TO_LEVEL_AUTO[updatedItem.phase]
              if (auto) {
                return normalizeLevelRow({ ...r, [auto.field]: auto.working }, auto.field)
              }
              return r
            })
          )
        }
      }

      // When materialStatus changes, sync 随材 and normalize
      if (updatedItem.phase === 'material_design' && updatedItem.materialStatus && updatedItem.level && updatedItem.lesson) {
        setLevelProgress((prev) =>
          prev.map((r) => {
            if (r.level !== updatedItem.level || r.lesson !== updatedItem.lesson) return r
            return normalizeLevelRow({ ...r, 随材: updatedItem.materialStatus! }, '随材')
          })
        )
      }

      // When status changes to approved, set field to done + normalize
      if (prevItem && prevItem.status !== 'approved' && updatedItem.status === 'approved' && updatedItem.level && updatedItem.lesson) {
        const auto = PHASE_TO_LEVEL_AUTO[updatedItem.phase]
        if (auto) {
          setLevelProgress((prev) =>
            prev.map((r) => {
              if (r.level !== updatedItem.level || r.lesson !== updatedItem.lesson) return r
              return normalizeLevelRow({ ...r, [auto.field]: auto.done }, auto.field)
            })
          )
        }
      }

      // When status changes FROM approved (undo), set field back to working + normalize
      if (prevItem && prevItem.status === 'approved' && updatedItem.status !== 'approved' && updatedItem.level && updatedItem.lesson) {
        const auto = PHASE_TO_LEVEL_AUTO[updatedItem.phase]
        if (auto) {
          setLevelProgress((prev) =>
            prev.map((r) => {
              if (r.level !== updatedItem.level || r.lesson !== updatedItem.lesson) return r
              return normalizeLevelRow({ ...r, [auto.field]: auto.working }, auto.field)
            })
          )
        }
      }
    },
    [items, addNotification]
  )

  const handleUpdateProfiles = useCallback((profiles: MemberProfile[]) => {
    setMemberProfiles(profiles)
  }, [])

  const handleUpdateTagOptions = useCallback((tags: string[]) => {
    setTagOptions(tags)
  }, [])

  const handleUpdateLevelProgress = useCallback((progress: LevelDetail[]) => {
    setLevelProgress(progress)
  }, [])

  // ---- Collaboration handlers ----
  const handleMarkCollabRead = useCallback((id: string) => {
    setCollabMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.status === 'unread'
          ? { ...m, status: 'read' as const, readAt: new Date().toISOString() }
          : m
      )
    )
    addNotification('📖 协作通知已标记为已读')
  }, [addNotification])

  const handleRespondCollab = useCallback((id: string, response: string) => {
    setCollabMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: 'responded' as const, response, respondedAt: new Date().toISOString() }
          : m
      )
    )
    addNotification('💬 已回复协作通知')
  }, [addNotification])

  const handleSendCollab = useCallback((msg: CollaborationMessage) => {
    setCollabMessages((prev) => [msg, ...prev])
    addNotification(`📨 协作通知已发送: ${msg.title}`)
  }, [addNotification])

  const unreadCollabCount = collabMessages.filter((m) => m.status === 'unread').length

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setShowNotifications(false)
  }, [])

  const isCurrentWeek = getMondayOfWeek(new Date()).getTime() === currentMonday.getTime()

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        <header className="board-header">
          <div className="header-left">
            <h1>课件研发工作流看板</h1>
            <span className="header-subtitle">在线项目课件研发全流程管理</span>
          </div>
          <div className="header-right">
            <button
              className="notif-btn"
              onClick={() => setShowCollaboration(true)}
            >
              📢 协作
              {unreadCollabCount > 0 && (
                <span className="notif-badge">{unreadCollabCount}</span>
              )}
            </button>
            <button
              className="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔 通知
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notif-panel">
                <div className="notif-header">
                  <span>实时通知</span>
                  <button onClick={clearNotifications}>清空</button>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">暂无通知</div>
                  ) : (
                    notifications.map((msg, i) => (
                      <div key={i} className="notif-item">{msg}</div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Deadline Warning Bar */}
        <DeadlineWarning items={items} onItemClick={setSelectedItem} />

        {/* Time Filter Bar */}
        <div className="filter-bar">
          <div className="filter-left">
            <button
              className={`filter-tab ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >📋 全部任务</button>
            <button
              className={`filter-tab ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => { setViewMode('week'); goToCurrentWeek() }}
            >📅 本周任务</button>

            {viewMode === 'week' && (
              <div className="week-nav">
                <button className="week-nav-btn" onClick={goToPrevWeek}>◀</button>
                <span className="week-label">{getWeekLabel(currentMonday)}</span>
                <button className="week-nav-btn" onClick={goToNextWeek} disabled={isCurrentWeek}>▶</button>
                {!isCurrentWeek && (
                  <button className="week-today-btn" onClick={goToCurrentWeek}>回到本周</button>
                )}
              </div>
            )}

            <select className="year-select" value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>

            <select className="person-select" value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}>
              <option value="">👤 全部负责人</option>
              {assigneeOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="filter-right">
            <span className="filter-count">显示 {filteredItems.length} / {items.length} 个任务</span>
            <button className="analytics-toggle" onClick={() => setShowSummary(true)}>📋 总结报表</button>
            <button className="analytics-toggle" onClick={() => setShowPersonnel(true)}>👤 人物画像</button>
            <button className="analytics-toggle" onClick={() => setShowLevelProgress(true)}>📊 课程进度</button>
            <button className="analytics-toggle" onClick={() => setShowAnalytics(true)}>📊 人效分析</button>
          </div>
        </div>

        {/* Task Status Filter Tabs */}
        <div className="task-filter-bar">
          <button
            className={`task-filter-tab ${taskFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTaskFilter('all')}
          >📋 全部 ({filterCounts.all})</button>
          <button
            className={`task-filter-tab ${taskFilter === 'active' ? 'active' : ''}`}
            onClick={() => setTaskFilter('active')}
          >🔄 进行中 ({filterCounts.active})</button>
          <button
            className={`task-filter-tab ${taskFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setTaskFilter('completed')}
          >✅ 已完成 ({filterCounts.completed})</button>
          <button
            className={`task-filter-tab ${taskFilter === 'abandoned' ? 'active' : ''}`}
            onClick={() => setTaskFilter('abandoned')}
          >🗑️ 已废弃 ({filterCounts.abandoned})</button>
          <span className="task-filter-divider"></span>
          <button
            className={`task-filter-tab ${taskFilter === '新课件制作' ? 'active' : ''}`}
            onClick={() => setTaskFilter('新课件制作')}
          >🆕 新课件制作 ({filterCounts.newCourse})</button>
          <button
            className={`task-filter-tab ${taskFilter === '课件优化' ? 'active' : ''}`}
            onClick={() => setTaskFilter('课件优化')}
          >🔧 课件优化 ({filterCounts.optimize})</button>
          <button
            className={`task-filter-tab ${taskFilter === '新需求' ? 'active' : ''}`}
            onClick={() => setTaskFilter('新需求')}
          >📋 新需求 ({filterCounts.newReq})</button>
          <button
            className={`task-filter-tab ${taskFilter === '教材制作' ? 'active' : ''}`}
            onClick={() => setTaskFilter('教材制作')}
          >📖 教材制作 ({filterCounts.material})</button>
        </div>

        <div className="board-columns">
          {PHASES.map((phase) => (
            <KanbanColumn
              key={phase.key}
              phase={phase.key}
              items={getItemsByPhase(phase.key)}
              onItemClick={setSelectedItem}
              onCreateItem={setCreatePhase}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="drag-overlay">
            <WorkItemCard item={activeItem} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>

      {selectedItem && (
        <WorkItemDetail
          item={selectedItem}
          memberProfiles={memberProfiles}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}

      {createPhase && (
        <CreateItemModal
          defaultPhase={createPhase}
          memberProfiles={memberProfiles}
          tagOptions={tagOptions}
          onUpdateTagOptions={handleUpdateTagOptions}
          onClose={() => setCreatePhase(null)}
          onCreated={handleCreateItem}
          levelProgress={levelProgress}
          onUpdateLevelProgress={handleUpdateLevelProgress}
        />
      )}

      {showAnalytics && (
        <AnalyticsPanel items={items} onClose={() => setShowAnalytics(false)} />
      )}

      {showSummary && (
        <SummaryReport items={items} tagOptions={tagOptions} onClose={() => setShowSummary(false)} />
      )}

      {showPersonnel && (
        <PersonnelPanel items={items} profiles={memberProfiles} onUpdate={handleUpdateProfiles} onClose={() => setShowPersonnel(false)} />
      )}

      {showCollaboration && (
        <CollaborationPanel
          messages={collabMessages}
          onClose={() => setShowCollaboration(false)}
          onMarkRead={handleMarkCollabRead}
          onRespond={handleRespondCollab}
          onSend={handleSendCollab}
          memberProfiles={memberProfiles}
          items={items}
          onItemClick={setSelectedItem}
        />
      )}

      {showLevelProgress && (
        <LevelProgressPanel
          progress={levelProgress}
          memberProfiles={memberProfiles}
          onUpdate={handleUpdateLevelProgress}
          onClose={() => setShowLevelProgress(false)}
        />
      )}

      {pendingFlow && (
        <FlowConfirmModal
          item={pendingFlow.item}
          targetPhase={pendingFlow.targetPhase}
          memberProfiles={memberProfiles}
          onConfirm={handleFlowConfirm}
          onCancel={handleFlowCancel}
        />
      )}
    </DndContext>
  )
}
