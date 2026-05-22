import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Phase, PhaseConfig, WorkItem, getPhaseByKey } from '../types'
import WorkItemCard from './WorkItemCard'

interface Props {
  phase: Phase
  items: WorkItem[]
  onItemClick: (item: WorkItem) => void
  onCreateItem: (phase: Phase) => void
}

export default function KanbanColumn({ phase, items, onItemClick, onCreateItem }: Props) {
  const config: PhaseConfig = getPhaseByKey(phase)
  const { setNodeRef, isOver } = useDroppable({ id: phase })

  return (
    <div className={`kanban-column ${isOver ? 'drag-over' : ''}`} style={{ borderTopColor: config.color }}>
      <div className="column-header">
        <div className="column-title">
          <span className="column-icon">{config.icon}</span>
          <h3>{config.label}</h3>
          <span className="column-count">{items.length}</span>
          <button className="column-add-btn" title="新建任务" onClick={() => onCreateItem(phase)}>+</button>
        </div>
        <div className="column-color-bar" style={{ background: config.color }} />
      </div>

      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="column-body">
          {items.length === 0 ? (
            <div className="column-empty">
              <span>暂无任务</span>
              <span className="empty-hint">拖拽卡片到此处</span>
            </div>
          ) : (
            items.map((item) => (
              <WorkItemCard key={item.id} item={item} onClick={onItemClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
