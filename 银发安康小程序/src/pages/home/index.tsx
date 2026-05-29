import { useState } from 'react'
import { View, Text, Image, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'
import { mockElderly, mockCareRecords, mockFamilyMessages, mockReviews, mockNotifications } from '../../utils/mockData'
import { formatDate } from '../../utils'

export default function HomePage() {
  const { user, boundElderly } = useAppStore()
  const elderlyList = boundElderly.length > 0 ? boundElderly : mockElderly
  const activeRecords = mockCareRecords.filter((r) => r.status === 'ongoing')
  const todayRecords = mockCareRecords.filter((r) => r.startTime.startsWith('2026-05-26'))
  const recentReviews = mockReviews.slice(0, 2)
  const unreadNotifs = mockNotifications.filter((n) => !n.read).length
  const [showAllMessages, setShowAllMessages] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [familyMessages, setFamilyMessages] = useState(mockFamilyMessages)
  const [editingFmId, setEditingFmId] = useState<string | null>(null)
  const [editFmText, setEditFmText] = useState('')
  const [newMsgText, setNewMsgText] = useState('')
  const [showNewEmoji, setShowNewEmoji] = useState(false)
  const recentMessages = familyMessages.slice(0, 3)

  const EMOJIS = ['😊', '👍', '❤️', '🙏', '😄', '🎉', '💪', '🌸', '✨', '👌', '😘', '💕', '🥰', '😆', '🤗', '🙌', '😇', '👏', '🌟', '💖']

  const handleReply = (msgId: string) => {
    setReplyingTo(msgId)
    setReplyText('')
    setShowEmoji(false)
    setEditingFmId(null)
  }

  const handleSendReply = (msgId: string) => {
    if (!replyText.trim()) return
    setFamilyMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, replied: true, replyContent: replyText.trim(), replyTime: new Date().toISOString() }
          : m
      )
    )
    setReplyingTo(null)
    setReplyText('')
    setShowEmoji(false)
  }

  const handleEmojiClick = (emoji: string) => {
    setReplyText((prev) => prev + emoji)
    setShowEmoji(false)
  }

  const handleEditFm = (msgId: string) => {
    const msg = familyMessages.find((m) => m.id === msgId)
    if (!msg) return
    setEditingFmId(msgId)
    setEditFmText(msg.content)
    setReplyingTo(null)
  }

  const handleSaveEditFm = () => {
    if (!editFmText.trim() || !editingFmId) return
    setFamilyMessages((prev) =>
      prev.map((m) => m.id === editingFmId ? { ...m, content: editFmText.trim() } : m)
    )
    setEditingFmId(null)
    setEditFmText('')
  }

  const handleSendNewMsg = () => {
    if (!newMsgText.trim()) return
    const newMsg: any = {
      id: `fm_new_${Date.now()}`,
      elderlyId: 'e1',
      elderlyName: '张秀英',
      senderId: 'u1',
      senderName: user?.name || '我',
      role: '家属',
      content: newMsgText.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      replied: false,
    }
    setFamilyMessages((prev) => [newMsg, ...prev])
    setNewMsgText('')
    setShowNewEmoji(false)
  }

  const quickActions = [
    { icon: '📋', label: '健康档案', path: '/pages/healthRecords/index', color: '#E8F5E9' },
    { icon: '👨‍⚕️', label: '找护工', path: '/pages/caregivers/index', color: '#E3F2FD' },
    { icon: '📝', label: '护理记录', path: '/pages/careTracking/index', color: '#FFF3E0' },
    { icon: '💬', label: '消息', path: '/pages/messages/index', color: '#F3E5F5' },
    { icon: '⭐', label: '服务评价', path: '/pages/reviews/index', color: '#FFF8E1' },
    { icon: '🔔', label: '通知', path: '/pages/messages/index', color: '#FBE9E7' },
  ]

  return (
    <View className='page' style={{ paddingTop: 0, paddingBottom: 80 }}>
      <View style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #43A047 100%)',
        margin: '0 -24px', padding: '20px 24px 28px', color: 'white',
        borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <View style={{ position: 'relative', zIndex: 1 }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <View style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
              <Text>{user?.name?.charAt(0) || '用'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 600, color: 'white', display: 'block' }}>{user?.name || '用户'}，您好</Text>
              <Text style={{ fontSize: 13, opacity: 0.85, display: 'block' }}>今天是 {formatDate(new Date().toISOString())}</Text>
            </View>
          </View>
          <View style={{ display: 'flex', gap: 12 }}>
            {[
              { label: '绑定家人', value: elderlyList.length, color: 'rgba(255,255,255,0.15)' },
              { label: '进行中护理', value: activeRecords.length, color: 'rgba(255,255,255,0.15)' },
              { label: '未读消息', value: unreadNotifs, color: 'rgba(255,255,255,0.15)' },
            ].map((s) => (
              <View key={s.label} style={{
                flex: 1, textAlign: 'center', background: s.color,
                borderRadius: 12, padding: '8px 4px',
              }}>
                <Text style={{ fontSize: 22, fontWeight: 700, color: 'white', display: 'block' }}>{s.value}</Text>
                <Text style={{ fontSize: 11, opacity: 0.85, color: 'white', display: 'block' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className='section' style={{ marginTop: 20 }}>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quickActions.map((action) => (
            <View key={action.label} onClick={() => Taro.navigateTo({ url: action.path })} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 4px', background: action.color, borderRadius: '12px',
              width: '15%', minWidth: 50,
            }}>
              <Text style={{ fontSize: 24 }}>{action.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: 500, color: '#212121' }}>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='section'>
        <Text className='section-title' style={{ display: 'block' }}>今日护理动态</Text>
        {todayRecords.map((record) => (
          <View className='card' key={record.id}>
            <View style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
                <Text>{record.caregiverName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, fontSize: 15, display: 'block' }}>
                  {record.caregiverName}
                  <Text style={{ fontWeight: 400, color: '#616161', fontSize: 13 }}>
                    {' '}正在服务{' '}
                  </Text>
                  {record.elderlyName}
                </Text>
                <Text style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2, display: 'block' }}>
                  {record.startTime.slice(11, 16)}{record.endTime ? ` - ${record.endTime.slice(11, 16)}` : ' 进行中'}
                </Text>
              </View>
              <Text className='tag tag-primary' style={{ fontSize: 12 }}>进行中</Text>
            </View>
            <View style={{ fontSize: 14, color: '#616161', lineHeight: 1.8 }}>
              <RecordRow icon="💊" label="用药" value={record.medications || '无'} />
              <RecordRow icon="🍚" label="饮食" value={record.diet || '无'} />
              <RecordRow icon="🏃" label="训练" value={record.training || '无'} />
              <RecordRow icon="📝" label="备注" value={record.notes || '无'} />
            </View>
            <View style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <View onClick={() => Taro.navigateTo({ url: '/pages/careTracking/index' })} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32' }}>
                <Text>查看全部记录</Text>
              </View>
              <View onClick={() => Taro.navigateTo({ url: '/pages/messages/index' })} style={{ padding: '8px 12px', fontSize: '14px', minHeight: 36, borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32' }}>
                <Text>给护工留言</Text>
              </View>
            </View>
          </View>
        ))}
        {todayRecords.length === 0 && (
          <View className='card'>
            <View style={{ textAlign: 'center', padding: 16, color: '#9E9E9E' }}>
              <Text style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>📋</Text>
              <Text>今日暂无护理记录</Text>
            </View>
          </View>
        )}
      </View>

      <View className='section'>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text className='section-title' style={{ marginBottom: 0 }}>家人留言</Text>
          <View onClick={() => setShowAllMessages(!showAllMessages)} style={{ fontSize: 13, color: '#2E7D32' }}>
            <Text>{showAllMessages ? '收起' : '查看全部'}</Text>
          </View>
        </View>
        {familyMessages.map((msg) => {
          if (!showAllMessages && recentMessages.indexOf(msg) === -1) return null
          return (
          <View className='card' key={msg.id}>
            <View style={{ display: 'flex', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>
                <Text>{msg.senderName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontWeight: 600, fontSize: 14 }}>{msg.senderName}</Text>
                    <Text className='tag' style={{
                      fontSize: 11, padding: '1px 8px', marginLeft: 6,
                      background: msg.role === '护工' ? '#E8F5E9' : '#E3F2FD',
                      color: msg.role === '护工' ? '#2E7D32' : '#1976D2',
                    }}>{msg.role}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>
                    {msg.createdAt.slice(11, 16)}
                  </Text>
                </View>
                {editingFmId === msg.id ? (
                  <View style={{ marginTop: 4 }}>
                    <Textarea
                      value={editFmText}
                      onInput={(e) => setEditFmText(e.detail.value)}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 14,
                        border: '2px solid #2E7D32', borderRadius: 10,
                        minHeight: 50, boxSizing: 'border-box',
                      }}
                    />
                    <View style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <View onClick={handleSaveEditFm} style={{ fontSize: 12, color: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 6, padding: '2px 10px' }}><Text>💾 保存</Text></View>
                      <View onClick={() => { setEditingFmId(null); setEditFmText('') }} style={{ fontSize: 12, color: '#9E9E9E', border: '1px solid #E0E0E0', borderRadius: 6, padding: '2px 10px' }}><Text>取消</Text></View>
                    </View>
                  </View>
                ) : (
                  <View style={{ fontSize: 14, color: '#616161', marginTop: 4, lineHeight: 1.6 }}>
                    <Text>{msg.type === 'voice' ? '🎤 [语音留言]' : msg.content}</Text>
                  </View>
                )}
                {msg.replied && (
                  <View style={{
                    marginTop: 8, padding: '8px 12px', background: '#F5F5F5',
                    borderRadius: 8, fontSize: 13, color: '#616161',
                    borderLeft: '3px solid #2E7D32',
                  }}>
                    <Text><Text style={{ fontWeight: 500, color: '#2E7D32' }}>回复：</Text>{msg.replyContent}</Text>
                    <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4, display: 'block' }}>{msg.replyTime?.slice(11, 16)}</Text>
                  </View>
                )}
                {replyingTo === msg.id ? (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                      <Input
                        value={replyText}
                        onInput={(e) => setReplyText(e.detail.value)}
                        placeholder='输入回复内容...'
                        style={{
                          flex: 1, padding: '8px 12px', fontSize: 14,
                          border: '1px solid #E0E0E0', borderRadius: 20,
                          minHeight: 36, boxSizing: 'border-box',
                        }}
                      />
                      <View onClick={() => setShowEmoji(!showEmoji)} style={{ fontSize: 20, padding: '4px 6px' }}>
                        <Text>😊</Text>
                      </View>
                      <View onClick={() => handleSendReply(msg.id)} style={{
                        width: 36, height: 36, borderRadius: '50%', background: '#2E7D32',
                        color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text>➤</Text>
                      </View>
                    </View>
                    {showEmoji && (
                      <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, padding: 8, background: '#F5F5F5', borderRadius: 10 }}>
                        {EMOJIS.map((emoji) => (
                          <Text key={emoji} onClick={() => handleEmojiClick(emoji)} style={{ fontSize: 20, padding: 2, lineHeight: 1 }}>{emoji}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    {!msg.replied && msg.role === '家属' && (
                      <View style={{ marginTop: 8, padding: '4px 12px', fontSize: 12, background: '#2E7D32', color: 'white', borderRadius: '8px', minHeight: 32, display: 'inline-flex', alignItems: 'center', opacity: 0.5 }}>
                        <Text>等待回复...</Text>
                      </View>
                    )}
                    {!msg.replied && msg.role === '护工' && (
                      <View onClick={() => handleReply(msg.id)} style={{ marginTop: 8, padding: '4px 12px', fontSize: 12, background: '#2E7D32', color: 'white', borderRadius: '8px', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>
                        <Text>回复留言</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        )})}
        <View className='card'>
          <View style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Input
              value={newMsgText}
              onInput={(e) => setNewMsgText(e.detail.value)}
              placeholder='✏️ 给护工留言...'
              style={{
                flex: 1, padding: '9px 14px', fontSize: 14,
                border: '1px solid #E0E0E0', borderRadius: 20,
                minHeight: 36,
              }}
            />
            <View onClick={() => setShowNewEmoji(!showNewEmoji)} style={{ fontSize: 20, padding: '4px 6px' }}>
              <Text>😊</Text>
            </View>
            <View onClick={handleSendNewMsg} style={{
              width: 36, height: 36, borderRadius: '50%', background: '#2E7D32',
              color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text>➤</Text>
            </View>
          </View>
          {showNewEmoji && (
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, padding: 8, background: '#F5F5F5', borderRadius: 10 }}>
              {EMOJIS.map((emoji) => (
                <Text key={emoji} onClick={() => { setNewMsgText((prev) => prev + emoji); setShowNewEmoji(false) }} style={{ fontSize: 20, padding: 2, lineHeight: 1 }}>{emoji}</Text>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className='section'>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text className='section-title' style={{ marginBottom: 0 }}>最近评价</Text>
          <View onClick={() => Taro.navigateTo({ url: '/pages/reviews/index' })} style={{ fontSize: 13, color: '#2E7D32' }}>
            <Text>全部评价 {'>'}</Text>
          </View>
        </View>
        {recentReviews.map((review) => (
          <View className='card' key={review.id}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>
                  <Text>{review.caregiverName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>{review.caregiverName}</Text>
                  <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{review.elderlyName} · {review.createdAt}</Text>
                </View>
              </View>
              <StarDisplay value={review.rating} />
            </View>
            <Text style={{ fontSize: 13, color: '#616161', lineHeight: 1.6, display: 'block' }}>{review.content}</Text>
            <View style={{ display: 'flex', gap: 4, marginTop: 6, fontSize: 11, color: '#9E9E9E' }}>
              <DimTag label="态度" score={review.dimensions.attitude} />
              <DimTag label="专业" score={review.dimensions.professional} />
              <DimTag label="耐心" score={review.dimensions.patience} />
              <DimTag label="响应" score={review.dimensions.response} />
              <DimTag label="效果" score={review.dimensions.effectiveness} />
            </View>
          </View>
        ))}
      </View>

      <View className='section'>
        <Text className='section-title'>我的家人</Text>
        <View style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {elderlyList.map((elderly) => (
            <View key={elderly.id} onClick={() => Taro.navigateTo({ url: '/pages/healthRecords/index' })} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 20px', background: '#FFFFFF', borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)', minWidth: 100,
              border: '1px solid #E0E0E0',
            }}>
              <View style={{ width: 44, height: 44, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
                <Text>{elderly.name.charAt(0)}</Text>
              </View>
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>{elderly.name}</Text>
                <Text className='tag tag-warning' style={{ fontSize: 10, padding: '1px 6px', marginTop: 2 }}>
                  {elderly.careLevel}
                </Text>
              </View>
            </View>
          ))}
          <View onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '14px 20px', background: '#F5F5F5', borderRadius: '12px',
            minWidth: 100, border: '2px dashed #E0E0E0',
          }}>
            <Text style={{ fontSize: 28, color: '#9E9E9E' }}>+</Text>
            <Text style={{ fontSize: 12, color: '#9E9E9E' }}>绑定家人</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const RecordRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={{ display: 'flex', gap: 6, padding: '2px 0' }}>
    <Text>{icon}</Text>
    <Text style={{ color: '#9E9E9E', minWidth: 36, fontSize: 13 }}>{label}</Text>
    <Text>{value}</Text>
  </View>
)

const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
  <Text style={{ color: '#FF8F00', fontSize: 14, fontWeight: 600 }}>
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
  </Text>
)

const DimTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <Text style={{ background: score >= 4 ? '#E8F5E9' : '#FFF3E0', padding: '1px 6px', borderRadius: 4 }}>{label}{score}</Text>
)
