import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore, Permissions } from '../../store'
import { mockReviews } from '../../utils/mockData'

export default function CaregiverDetailPage() {
  const { user } = useAppStore()
  const params = Taro.getCurrentInstance()?.router?.params
  const caregiverId = params?.id as string || 'c1'
  const caregivers = useAppStore((s) => s.caregivers)
  const cg = caregivers.find((c) => c.id === caregiverId)
  const isAdmin = Permissions.isAdmin(user?.role)
  const reviews = mockReviews.filter((r) => r.caregiverId === caregiverId)
  const [showAllReviews, setShowAllReviews] = useState(false)

  if (!cg) {
    return (
      <View className='page'>
        <View className='empty-state'>
          <Text className='empty-state-icon'>🔍</Text>
          <Text className='empty-state-text'>护工信息未找到</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='card' style={{ textAlign: 'center', padding: '24px 16px' }}>
        <View style={{ width: 72, height: 72, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', margin: '0 auto 12px' }}>
          <Text>{cg.name.charAt(0)}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 700, display: 'block' }}>{cg.name}</Text>
        <Text style={{ fontSize: 14, color: '#616161', marginTop: 4, display: 'block' }}>{cg.age}岁 · {cg.gender} · {cg.yearsOfExp}年经验</Text>
        <View style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Text className='tag' style={{
            background: cg.level === '高级护工' ? '#E8F5E9' : cg.level === '中级护工' ? '#FFF3E0' : '#E3F2FD',
            color: cg.level === '高级护工' ? '#1B5E20' : cg.level === '中级护工' ? '#E65100' : '#1565C0',
            fontWeight: 600,
          }}>{cg.level}</Text>
          <Text style={{ fontSize: 24, color: '#FF8F00', fontWeight: 700 }}>⭐ {cg.rating}</Text>
          <Text className='tag tag-info'>{cg.serviceCount}单</Text>
        </View>
        <Text style={{ fontSize: 28, color: '#D32F2F', fontWeight: 700, marginTop: 12, display: 'block' }}>
          ¥{cg.price}<Text style={{ fontSize: 16, fontWeight: 400, color: '#9E9E9E' }}>/小时</Text>
        </Text>
        {!cg.available && <Text className='tag tag-danger' style={{ marginTop: 8 }}>暂不可预约</Text>}
        {cg.available && (
          <View style={{ marginTop: 16, padding: '12px 24px', background: '#2E7D32', color: 'white', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}>
            <Text>立即预约</Text>
          </View>
        )}
      </View>

      {cg.introduction && (
        <View className='card'>
          <Text className='card-title'>个人介绍</Text>
          <Text style={{ fontSize: 14, color: '#616161', lineHeight: 1.8 }}>{cg.introduction}</Text>
        </View>
      )}

      <View className='card'>
        <Text className='card-title'>专业技能</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cg.skills.map((skill) => (
            <Text key={skill} className='tag tag-primary'>{skill}</Text>
          ))}
        </View>
      </View>

      <View className='card'>
        <Text className='card-title'>资质证书</Text>
        {(cg.certifications || []).map((cert) => (
          <View key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #E0E0E0' }}>
            <Text style={{ fontSize: 18 }}>📜</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 500, fontSize: 14, display: 'block' }}>{cert.name}</Text>
              <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{cert.issuer} · {cert.issueDate}</Text>
            </View>
            <Text className='tag tag-primary' style={{ fontSize: 11 }}>{cert.verified ? '已认证' : '待认证'}</Text>
          </View>
        ))}
      </View>

      <View className='card'>
        <Text className='card-title'>服务评价（{reviews.length}）</Text>
        {reviews.length === 0 ? (
          <Text style={{ textAlign: 'center', padding: 16, color: '#9E9E9E', display: 'block' }}>暂无评价</Text>
        ) : (
          reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
            <View key={review.id} style={{ padding: '10px 0', borderBottom: '1px solid #E0E0E0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: '#616161' }}>{review.elderlyName} · {review.createdAt}</Text>
                <Text style={{ color: '#FF8F00', fontWeight: 600 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#616161', lineHeight: 1.6 }}>{review.content}</Text>
            </View>
          ))
        )}
        {reviews.length > 2 && (
          <View onClick={() => setShowAllReviews(!showAllReviews)} style={{ textAlign: 'center', marginTop: 8, color: '#2E7D32', fontSize: 13 }}>
            <Text>{showAllReviews ? '收起' : `查看全部${reviews.length}条评价`}</Text>
          </View>
        )}
      </View>

      {isAdmin && (
        <>
          <View className='card'>
            <Text className='card-title'>⚙️ 管理员操作</Text>
            <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <View onClick={() => Taro.navigateTo({ url: `/pages/admin/caregivers/index?editId=${cg.id}` })} style={{ padding: '8px 16px', background: '#2E7D32', color: 'white', borderRadius: 8 }}>
                <Text>✏️ 编辑护工信息</Text>
              </View>
              <View style={{ padding: '8px 16px', background: '#FF8F00', color: 'white', borderRadius: 8 }}>
                <Text>📊 服务数据</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
