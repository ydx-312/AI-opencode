import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { StarRating } from '../../components/common/StarRating'
import { useAppStore, Permissions } from '../../store'

export const CaregiversPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const caregivers = useAppStore((s) => s.caregivers)
  const isAdmin = Permissions.isAdmin(user?.role)
  const [filter, setFilter] = useState<'all' | 'available'>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'exp'>('rating')

  const filtered = useMemo(() =>
    caregivers.filter((c) => filter === 'all' || c.available)
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating
        if (sortBy === 'price') return a.price - b.price
        return b.yearsOfExp - a.yearsOfExp
      }), [caregivers, filter, sortBy])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">找护工</h1>
        <p className="page-subtitle">为您筛选最合适的护理人员</p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          <button onClick={() => setFilter('all')} style={filterBtnStyle(filter === 'all')}>全部</button>
          <button onClick={() => setFilter('available')} style={filterBtnStyle(filter === 'available')}>可接单</button>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          <button onClick={() => setSortBy('rating')} style={filterBtnStyle(sortBy === 'rating')}>评分优先</button>
          <button onClick={() => setSortBy('price')} style={filterBtnStyle(sortBy === 'price')}>价格从低</button>
          <button onClick={() => setSortBy('exp')} style={filterBtnStyle(sortBy === 'exp')}>经验丰富</button>
        </div>
      </div>

      {/* Admin Management */}
      {isAdmin && (
        <Card onClick={() => navigate('/admin/caregivers')} style={{ cursor: 'pointer', border: '2px dashed var(--color-primary)', background: '#F0F8FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 4 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>⚙️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-primary)' }}>护工管理后台</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>新增 / 编辑 / 删除护工 · 审核资质 · 管理请假与接单</div>
            </div>
            <span style={{ fontSize: 18, color: 'var(--color-primary)' }}>›</span>
          </div>
        </Card>
      )}

      {/* Caregiver List */}
      {filtered.map((cg) => (
        <Card key={cg.id} onClick={() => navigate(`/caregivers/${cg.id}`)}>
          <div style={{ display: 'flex', gap: 14 }}>
            <Avatar name={cg.name} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{cg.name}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{cg.age}岁 · {cg.gender}</span>
                {!cg.available && <span className="tag tag-danger">休息中</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <StarRating value={Math.round(cg.rating)} readonly size={16} />
                <span style={{ fontSize: 14, color: 'var(--color-secondary)', fontWeight: 600 }}>{cg.rating}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>· {cg.serviceCount}单</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>· {cg.yearsOfExp}年经验</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {cg.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="tag tag-primary">{skill}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {cg.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 12, color: 'var(--color-text-light)' }}>#{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 18, color: 'var(--color-danger)', fontWeight: 700 }}>
                  ¥{cg.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-light)' }}>/小时</span>
                </span>
                <Button variant="primary" size="sm" disabled={!cg.available}>
                  {cg.available ? '立即预约' : '暂不可约'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

const filterBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
  background: active ? 'var(--color-primary)' : 'transparent',
  color: active ? 'white' : 'var(--color-text-secondary)',
  fontWeight: 500, fontSize: 13,
})
