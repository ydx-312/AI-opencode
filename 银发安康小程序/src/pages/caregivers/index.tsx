import { useState, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore, Permissions } from '../../store'

export default function CaregiversPage() {
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

  const filterBtnStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 6, border: 'none',
    background: active ? '#2E7D32' : 'transparent',
    color: active ? 'white' : '#616161',
    fontWeight: 500, fontSize: 13, display: 'inline-flex', alignItems: 'center',
  })

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>找护工</Text>
        <Text className='page-subtitle'>为您筛选最合适的护理人员</Text>
      </View>

      <View style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <View style={{ display: 'flex', gap: 4, background: '#F5F5F5', borderRadius: '8px', padding: 4 }}>
          <View onClick={() => setFilter('all')} style={filterBtnStyle(filter === 'all')}><Text>全部</Text></View>
          <View onClick={() => setFilter('available')} style={filterBtnStyle(filter === 'available')}><Text>可接单</Text></View>
        </View>
        <View style={{ display: 'flex', gap: 4, background: '#F5F5F5', borderRadius: '8px', padding: 4 }}>
          <View onClick={() => setSortBy('rating')} style={filterBtnStyle(sortBy === 'rating')}><Text>评分优先</Text></View>
          <View onClick={() => setSortBy('price')} style={filterBtnStyle(sortBy === 'price')}><Text>价格从低</Text></View>
          <View onClick={() => setSortBy('exp')} style={filterBtnStyle(sortBy === 'exp')}><Text>经验丰富</Text></View>
        </View>
      </View>

      {isAdmin && (
        <View className='card' onClick={() => Taro.navigateTo({ url: '/pages/admin/caregivers/index' })} style={{ border: '2px dashed #2E7D32', background: '#F0F8FF' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 4 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>
              <Text>⚙️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 600, fontSize: 15, color: '#2E7D32', display: 'block' }}>护工管理后台</Text>
              <Text style={{ fontSize: 13, color: '#616161', marginTop: 2, display: 'block' }}>新增 / 编辑 / 删除护工 · 审核资质 · 管理请假与接单</Text>
            </View>
            <Text style={{ fontSize: 18, color: '#2E7D32' }}>›</Text>
          </View>
        </View>
      )}

      {filtered.map((cg) => (
        <View className='card' key={cg.id} onClick={() => Taro.navigateTo({ url: `/pages/caregiverDetail/index?id=${cg.id}` })}>
          <View style={{ display: 'flex', gap: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
              <Text>{cg.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 18, fontWeight: 600 }}>{cg.name}</Text>
                <Text style={{ fontSize: 13, color: '#616161' }}>{cg.age}岁 · {cg.gender}</Text>
                {!cg.available && <Text className='tag tag-danger'>休息中</Text>}
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: '#FF8F00', fontWeight: 600 }}>⭐ {cg.rating}</Text>
                <Text style={{ fontSize: 13, color: '#9E9E9E' }}>· {cg.serviceCount}单</Text>
                <Text style={{ fontSize: 13, color: '#9E9E9E' }}>· {cg.yearsOfExp}年经验</Text>
              </View>
              <View style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {cg.skills.slice(0, 3).map((skill) => (
                  <Text key={skill} className='tag tag-primary'>{skill}</Text>
                ))}
              </View>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 18, color: '#D32F2F', fontWeight: 700 }}>
                  ¥{cg.price}<Text style={{ fontSize: 13, fontWeight: 400, color: '#9E9E9E' }}>/小时</Text>
                </Text>
                <View style={{
                  padding: '8px 12px', fontSize: '14px',
                  fontWeight: 600, borderRadius: '8px',
                  background: cg.available ? '#2E7D32' : '#ccc', color: 'white', minHeight: 36,
                }}>
                  <Text>{cg.available ? '立即预约' : '暂不可约'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
