import React, { useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Avatar } from '../../components/common/Avatar'
import { StarRating } from '../../components/common/StarRating'
import { mockReviews, mockCaregivers } from '../../utils/mockData'
import { generateId } from '../../utils'

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState(mockReviews)
  const [showForm, setShowForm] = useState(false)
  const [selectedCaregiver, setSelectedCaregiver] = useState(mockCaregivers[0])
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const filtered = filterRating ? reviews.filter((r) => r.rating === filterRating) : reviews
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    rating: n,
    count: reviews.filter((r) => Math.round(r.rating) === n).length,
  }))
  const avgDim = (dim: keyof typeof reviews[0]['dimensions']) =>
    Math.round((reviews.reduce((s, r) => s + r.dimensions[dim], 0) / reviews.length) * 10) / 10

  const [reviewImages, setReviewImages] = useState<string[]>([])

  const handleSubmitReview = (data: {
    caregiverId: string; caregiverName: string; elderlyName: string;
    rating: number; content: string; dimensions: typeof reviews[0]['dimensions']
  }) => {
    const newReview = {
      id: generateId(),
      orderId: `o${Date.now()}`,
      caregiverId: data.caregiverId,
      caregiverName: data.caregiverName,
      elderlyId: 'e1',
      elderlyName: data.elderlyName,
      rating: data.rating,
      content: data.content,
      images: reviewImages,
      dimensions: data.dimensions,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setReviewImages([])
    setReviews([newReview, ...reviews])
    setShowForm(false)
  }

  if (showForm) {
    return <ReviewForm caregivers={mockCaregivers} onSubmit={handleSubmitReview} onCancel={() => setShowForm(false)} />
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">服务评价</h1>
        <p className="page-subtitle">您的每一条评价都是对护工最大的鼓励</p>
      </div>

      {/* Overall Rating Summary */}
      <Card>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-secondary)' }}>{avgRating.toFixed(1)}</div>
            <StarRating value={Math.round(avgRating)} readonly size={18} />
            <div style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 4 }}>{reviews.length}条评价</div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            {ratingCounts.map((rc) => (
              <div key={rc.rating} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 12, minWidth: 20 }}>{rc.rating}星</span>
                <div style={{ flex: 1, height: 8, background: 'var(--color-bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${reviews.length > 0 ? (rc.count / reviews.length) * 100 : 0}%`,
                    height: '100%', background: 'var(--color-secondary)', borderRadius: 4,
                  }} />
                </div>
                <span style={{ fontSize: 12, minWidth: 16, color: 'var(--color-text-light)' }}>{rc.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          <DimBadge label="服务态度" score={avgDim('attitude')} />
          <DimBadge label="专业程度" score={avgDim('professional')} />
          <DimBadge label="耐心细致" score={avgDim('patience')} />
          <DimBadge label="响应速度" score={avgDim('response')} />
          <DimBadge label="护理效果" score={avgDim('effectiveness')} />
        </div>
      </Card>

      {/* Filter & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 8, padding: 3 }}>
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button key={String(r)} onClick={() => setFilterRating(r)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: filterRating === r ? 'var(--color-primary)' : 'transparent',
              color: filterRating === r ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 500, fontSize: 12, transition: 'all 0.2s',
            }}>
              {r === null ? '全部' : `${r}星`}
            </button>
          ))}
        </div>
        <Button variant="primary" size="md" onClick={() => setShowForm(true)}>✏️ 写评价</Button>
      </div>

      {/* Reviews */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">暂无评价，快去写第一条评价吧</div>
        </div>
      ) : (
        filtered.map((review) => (
          <Card key={review.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={review.caregiverName} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{review.caregiverName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                    {review.elderlyName} · {review.createdAt}
                  </div>
                </div>
              </div>
              <StarRating value={review.rating} readonly size={18} />
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
              {review.content}
            </p>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-text-light)', marginBottom: 8 }}>
              <DimTag label="态度" score={review.dimensions.attitude} />
              <DimTag label="专业" score={review.dimensions.professional} />
              <DimTag label="耐心" score={review.dimensions.patience} />
              <DimTag label="响应" score={review.dimensions.response} />
              <DimTag label="效果" score={review.dimensions.effectiveness} />
            </div>

            {review.images.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {review.images.map((img, i) => (
                  <div key={i} style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--color-bg)' }} />
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )
}

/* ─── Review Form ─── */
const ReviewForm: React.FC<{
  caregivers: typeof mockCaregivers
  onSubmit: (data: any) => void
  onCancel: () => void
}> = ({ caregivers, onSubmit, onCancel }) => {
  const [selectedId, setSelectedId] = useState(caregivers[0].id)
  const [elderlyName, setElderlyName] = useState('张秀英')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [dims, setDims] = useState({ attitude: 5, professional: 5, patience: 5, response: 5, effectiveness: 5 })
  const [reviewImages, setReviewImages] = useState<string[]>([])

  const handleReviewImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      files.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) setReviewImages((prev) => [...prev, e.target!.result as string])
        }
        reader.readAsDataURL(f)
      })
    }
    input.click()
  }

  const cg = caregivers.find((c) => c.id === selectedId)!

  const dimensions = [
    { key: 'attitude', label: '服务态度', desc: '是否热情友好、尊重老人' },
    { key: 'professional', label: '专业程度', desc: '护理技能是否专业规范' },
    { key: 'patience', label: '耐心细致', desc: '是否有耐心、细心周到' },
    { key: 'response', label: '响应速度', desc: '对需求响应是否及时' },
    { key: 'effectiveness', label: '护理效果', desc: '服务是否达到预期效果' },
  ] as const

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">发表评价</h1>
      </div>

      <Card>
        {/* Select caregiver */}
        <div className="form-group">
          <label className="form-label">选择护工</label>
          <select className="form-input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {caregivers.map((cg) => (
              <option key={cg.id} value={cg.id}>{cg.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">服务对象</label>
          <select className="form-input" value={elderlyName} onChange={(e) => setElderlyName(e.target.value)}>
            <option>张秀英</option>
            <option>李建国</option>
          </select>
        </div>

        {/* Overall rating */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Avatar name={cg.name} size={56} />
          <h3 style={{ marginTop: 8, fontSize: 17 }}>{cg.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>综合评分</p>
          <StarRating value={rating} onChange={setRating} size={40} />
        </div>

        {/* Dimension ratings */}
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>维度评分</p>
          {dimensions.map((dim) => (
            <div key={dim.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{dim.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{dim.desc}</div>
              </div>
              <StarRating
                value={dims[dim.key]}
                onChange={(v) => setDims({ ...dims, [dim.key]: v })}
                size={22}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">文字评价 <span style={{ color: 'var(--color-text-light)', fontWeight: 400, fontSize: 13 }}>（分享您的真实体验）</span></label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="请分享您的护理体验，帮助其他家属参考..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image upload */}
        <div className="form-group">
          <label className="form-label">图片佐证 <span style={{ color: 'var(--color-text-light)', fontWeight: 400, fontSize: 13 }}>（选填，点击上传）</span></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {reviewImages.map((img, i) => (
              <div key={i} style={{
                width: 72, height: 72, borderRadius: 8,
                background: `url(${img}) center/cover no-repeat`,
                border: '1px solid var(--color-border)', position: 'relative',
              }}>
                <button onClick={() => setReviewImages(reviewImages.filter((_, j) => j !== i))} style={{
                  position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                  borderRadius: '50%', background: 'var(--color-danger)', color: 'white',
                  border: 'none', fontSize: 11, cursor: 'pointer', lineHeight: '18px',
                  padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>
            ))}
            {reviewImages.length < 6 && (
              <div onClick={handleReviewImageUpload} style={{
                width: 72, height: 72, borderRadius: 8,
                background: 'var(--color-bg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22, color: 'var(--color-text-light)',
                border: '2px dashed var(--color-border)', cursor: 'pointer',
              }}>
                +
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="primary" block size="lg" onClick={() => {
            onSubmit({
              caregiverId: selectedId, caregiverName: cg.name, elderlyName,
              rating, content, dimensions: dims,
            })
            setReviewImages([])
          }}>
            提交评价
          </Button>
          <Button variant="secondary" block size="lg" onClick={onCancel}>
            取消
          </Button>
        </div>

        <div style={{ marginTop: 12, padding: 12, background: '#FFF8E1', borderRadius: 8, fontSize: 13, color: '#F57C00' }}>
          ⚖️ 您的真实评价将展示在护工个人主页，供其他家属参考。如有服务纠纷，可申请平台仲裁。
        </div>
      </Card>
    </div>
  )
}

const DimBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
    background: score >= 4 ? '#E8F5E9' : score >= 3 ? '#FFF3E0' : '#FFEBEE',
    padding: '4px 10px', borderRadius: 20, color: 'var(--color-text-secondary)',
  }}>
    {label}
    <span style={{ fontWeight: 600, color: score >= 4 ? 'var(--color-primary)' : score >= 3 ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
      {score.toFixed(1)}
    </span>
  </div>
)

const DimTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <span style={{
    background: score >= 4 ? '#E8F5E9' : score >= 3 ? '#FFF3E0' : '#FFEBEE',
    padding: '2px 8px', borderRadius: 4,
    color: score >= 4 ? 'var(--color-primary)' : score >= 3 ? 'var(--color-secondary)' : 'var(--color-danger)',
    fontWeight: 500,
  }}>
    {label}{score}
  </span>
)
