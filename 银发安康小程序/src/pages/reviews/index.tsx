import { useState } from 'react'
import { View, Text, Image, Textarea, Picker } from '@tarojs/components'
import { mockReviews, mockCaregivers } from '../../utils/mockData'
import { generateId } from '../../utils'
import { chooseAndSaveImage } from '../../utils/fileStorage'

export default function ReviewsPage() {
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

  const handleSubmitReview = (data: {
    caregiverId: string; caregiverName: string; elderlyName: string;
    rating: number; content: string; images: string[];
    dimensions: typeof reviews[0]['dimensions']
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
      images: data.images,
      dimensions: data.dimensions,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setReviews([newReview, ...reviews])
    setShowForm(false)
  }

  if (showForm) {
    return <ReviewForm caregivers={mockCaregivers} onSubmit={handleSubmitReview} onCancel={() => setShowForm(false)} />
  }

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>服务评价</Text>
        <Text className='page-subtitle'>您的每一条评价都是对护工最大的鼓励</Text>
      </View>

      <View className='card'>
        <View style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 40, fontWeight: 700, color: '#FF8F00', display: 'block' }}>{avgRating.toFixed(1)}</Text>
            <Text style={{ fontSize: 14, color: '#FF8F00', fontWeight: 600, display: 'block' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</Text>
            <Text style={{ fontSize: 13, color: '#9E9E9E', marginTop: 4, display: 'block' }}>{reviews.length}条评价</Text>
          </View>
          <View style={{ flex: 1, minWidth: 150 }}>
            {ratingCounts.map((rc) => (
              <View key={rc.rating} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Text style={{ fontSize: 12, minWidth: 20 }}>{rc.rating}星</Text>
                <View style={{ flex: 1, height: 8, background: '#F5F5F5', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{
                    width: `${reviews.length > 0 ? (rc.count / reviews.length) * 100 : 0}%`,
                    height: '100%', background: '#FF8F00', borderRadius: 4,
                  }} />
                </View>
                <Text style={{ fontSize: 12, minWidth: 16, color: '#9E9E9E' }}>{rc.count}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, borderTop: '1px solid #E0E0E0', paddingTop: 12 }}>
          <DimBadge label="服务态度" score={avgDim('attitude')} />
          <DimBadge label="专业程度" score={avgDim('professional')} />
          <DimBadge label="耐心细致" score={avgDim('patience')} />
          <DimBadge label="响应速度" score={avgDim('response')} />
          <DimBadge label="护理效果" score={avgDim('effectiveness')} />
        </View>
      </View>

      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ display: 'flex', gap: 4, background: '#F5F5F5', borderRadius: 8, padding: 3 }}>
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <View key={String(r)} onClick={() => setFilterRating(r)} style={{
              padding: '4px 10px', borderRadius: 6,
              background: filterRating === r ? '#2E7D32' : 'transparent',
              color: filterRating === r ? 'white' : '#616161',
              fontWeight: 500, fontSize: 12,
            }}>
              <Text>{r === null ? '全部' : `${r}星`}</Text>
            </View>
          ))}
        </View>
        <View onClick={() => setShowForm(true)} style={{ padding: '12px 24px', background: '#2E7D32', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '18px' }}>
          <Text>✏️ 写评价</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state-icon'>📝</Text>
          <Text className='empty-state-text'>暂无评价，快去写第一条评价吧</Text>
        </View>
      ) : (
        filtered.map((review) => (
          <View className='card' key={review.id}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
                  <Text>{review.caregiverName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>{review.caregiverName}</Text>
                  <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>
                    {review.elderlyName} · {review.createdAt}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#FF8F00', fontSize: 14, fontWeight: 600 }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#616161', lineHeight: 1.7, marginBottom: 8, display: 'block' }}>
              {review.content}
            </Text>
            <View style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>
              <DimTag label="态度" score={review.dimensions.attitude} />
              <DimTag label="专业" score={review.dimensions.professional} />
              <DimTag label="耐心" score={review.dimensions.patience} />
              <DimTag label="响应" score={review.dimensions.response} />
              <DimTag label="效果" score={review.dimensions.effectiveness} />
            </View>
            {review.images.length > 0 && (
              <View style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {review.images.map((img, i) => (
                  <Image key={i} src={img} mode='aspectFill' style={{ width: 56, height: 56, borderRadius: 8, border: '1px solid #E0E0E0' }} />
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  )
}

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

  const handleReviewImageUpload = async () => {
    const files = await chooseAndSaveImage(6)
    setReviewImages((prev) => [...prev, ...files])
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
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>发表评价</Text>
      </View>

      <View className='card'>
        <View className='form-group'>
          <Text className='form-label'>选择护工</Text>
          <Picker mode='selector' range={caregivers.map((c) => c.name)} value={caregivers.findIndex((c) => c.id === selectedId)} onChange={(e) => setSelectedId(caregivers[e.detail.value].id)}>
            <View className='form-input'>{cg.name}</View>
          </Picker>
        </View>

        <View className='form-group'>
          <Text className='form-label'>服务对象</Text>
          <Picker mode='selector' range={['张秀英', '李建国']} value={elderlyName === '李建国' ? 1 : 0} onChange={(e) => setElderlyName(e.detail.value === 1 ? '李建国' : '张秀英')}>
            <View className='form-input'>{elderlyName}</View>
          </Picker>
        </View>

        <View style={{ textAlign: 'center', padding: '16px 0' }}>
          <View style={{ width: 56, height: 56, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', margin: '0 auto' }}>
            <Text>{cg.name.charAt(0)}</Text>
          </View>
          <Text style={{ marginTop: 8, fontSize: 17, fontWeight: 600, display: 'block' }}>{cg.name}</Text>
          <Text style={{ fontSize: 13, color: '#616161', marginBottom: 8, display: 'block' }}>综合评分</Text>
          <Text style={{ fontSize: 40, color: '#FF8F00', fontWeight: 700, display: 'block' }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</Text>
          <View style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((v) => (
              <Text key={v} onClick={() => setRating(v)} style={{ fontSize: 32, color: v <= rating ? '#FF8F00' : '#E0E0E0' }}>{v <= rating ? '★' : '☆'}</Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>维度评分</Text>
          {dimensions.map((dim) => (
            <View key={dim.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #E0E0E0',
            }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{dim.label}</Text>
                <Text style={{ fontSize: 11, color: '#9E9E9E', display: 'block' }}>{dim.desc}</Text>
              </View>
              <View style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Text key={v} onClick={() => setDims({ ...dims, [dim.key]: v })} style={{ fontSize: 22, color: v <= dims[dim.key] ? '#FF8F00' : '#E0E0E0' }}>{v <= dims[dim.key] ? '★' : '☆'}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View className='form-group' style={{ marginTop: 12 }}>
          <Text className='form-label'>文字评价 <Text style={{ color: '#9E9E9E', fontWeight: 400, fontSize: 13 }}>（分享您的真实体验）</Text></Text>
          <Textarea
            className='form-input'
            placeholder='请分享您的护理体验，帮助其他家属参考...'
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            style={{ minHeight: 100 }}
          />
        </View>

        <View className='form-group'>
          <Text className='form-label'>图片佐证 <Text style={{ color: '#9E9E9E', fontWeight: 400, fontSize: 13 }}>（选填，点击上传）</Text></Text>
          <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {reviewImages.map((img, i) => (
              <View key={i} style={{ width: 72, height: 72, borderRadius: 8, border: '1px solid #E0E0E0', position: 'relative', overflow: 'hidden' }}>
                <Image src={img} mode='aspectFill' style={{ width: '100%', height: '100%' }} />
                <View onClick={() => setReviewImages(reviewImages.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D32F2F', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {reviewImages.length < 6 && (
              <View onClick={handleReviewImageUpload} style={{ width: 72, height: 72, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#9E9E9E', border: '2px dashed #E0E0E0' }}>
                <Text>+</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <View onClick={() => { onSubmit({ caregiverId: selectedId, caregiverName: cg.name, elderlyName, rating, content, images: reviewImages, dimensions: dims }); setReviewImages([]) }} style={{ flex: 1, padding: '16px 32px', background: '#2E7D32', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>提交评价</Text>
          </View>
          <View onClick={onCancel} style={{ flex: 1, padding: '16px 32px', border: '2px solid #2E7D32', color: '#2E7D32', borderRadius: '8px', fontWeight: 600, fontSize: '20px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>取消</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const DimBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <View style={{
    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
    background: score >= 4 ? '#E8F5E9' : score >= 3 ? '#FFF3E0' : '#FFEBEE',
    padding: '4px 10px', borderRadius: 20, color: '#616161',
  }}>
    <Text>{label} <Text style={{ fontWeight: 600, color: score >= 4 ? '#2E7D32' : score >= 3 ? '#FF8F00' : '#D32F2F' }}>{score.toFixed(1)}</Text></Text>
  </View>
)

const DimTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <Text style={{
    background: score >= 4 ? '#E8F5E9' : score >= 3 ? '#FFF3E0' : '#FFEBEE',
    padding: '2px 8px', borderRadius: 4,
    color: score >= 4 ? '#2E7D32' : score >= 3 ? '#FF8F00' : '#D32F2F',
    fontWeight: 500,
  }}>{label}{score}</Text>
)
