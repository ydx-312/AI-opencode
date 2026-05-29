import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Card } from '../../components/common/Card'
import { Avatar } from '../../components/common/Avatar'
import { mockElderly, mockCareRecords, mockFamilyMessages, mockReviews, mockNotifications } from '../../utils/mockData'
import { formatDate } from '../../utils'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
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
    { icon: '📋', label: '健康档案', path: '/health', color: '#E8F5E9' },
    { icon: '👨‍⚕️', label: '找护工', path: '/caregivers', color: '#E3F2FD' },
    { icon: '📝', label: '护理记录', path: '/care-tracking', color: '#FFF3E0' },
    { icon: '💬', label: '消息', path: '/messages', color: '#F3E5F5' },
    { icon: '⭐', label: '服务评价', path: '/reviews', color: '#FFF8E1' },
    { icon: '🔔', label: '通知', path: '/messages', color: '#FBE9E7' },
  ]

  return (
    <div className="page" style={{ paddingTop: 0, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #43A047 100%)',
        margin: '0 -24px', padding: '20px 24px 28px', color: 'white',
        borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar name={user?.name || '用户'} size={52} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>{user?.name || '用户'}，您好</h2>
              <p style={{ fontSize: 13, opacity: 0.85 }}>今天是 {formatDate(new Date().toISOString())}</p>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/messages')}>
              <span style={{ fontSize: 24 }}>🔔</span>
              {unreadNotifs > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#FF1744', color: 'white',
                  fontSize: 11, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(255,23,68,0.4)',
                }}>
                  {unreadNotifs}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: '绑定家人', value: elderlyList.length, color: 'rgba(255,255,255,0.15)' },
              { label: '进行中护理', value: activeRecords.length, color: 'rgba(255,255,255,0.15)' },
              { label: '未读消息', value: unreadNotifs, color: 'rgba(255,255,255,0.15)' },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', background: s.color,
                borderRadius: 12, padding: '8px 4px', backdropFilter: 'blur(4px)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section" style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 4px', background: action.color, borderRadius: 'var(--radius-md)',
              border: 'none', cursor: 'pointer', transition: 'transform 0.15s',
            }}>
              <span style={{ fontSize: 24 }}>{action.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text)' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Care Status */}
      <div className="section">
        <h3 className="section-title">今日护理动态</h3>
        {todayRecords.map((record) => (
          <Card key={record.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar name={record.caregiverName} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {record.caregiverName}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    {' '}正在服务{' '}
                  </span>
                  {record.elderlyName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
                  {record.startTime.slice(11, 16)}{record.endTime ? ` - ${record.endTime.slice(11, 16)}` : ' 进行中'}
                </div>
              </div>
              <span className="tag tag-primary" style={{ fontSize: 12 }}>进行中</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              <RecordRow icon="💊" label="用药" value={record.medications || '无'} />
              <RecordRow icon="🍚" label="饮食" value={record.diet || '无'} />
              <RecordRow icon="🏃" label="训练" value={record.training || '无'} />
              <RecordRow icon="📝" label="备注" value={record.notes || '无'} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => navigate('/care-tracking')} className="btn btn-secondary btn-sm">
                查看全部记录
              </button>
              <button onClick={() => navigate('/messages')} className="btn btn-secondary btn-sm">
                给护工留言
              </button>
            </div>
          </Card>
        ))}
        {todayRecords.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-light)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div>今日暂无护理记录</div>
            </div>
          </Card>
        )}
      </div>

      {/* Family Messages Section */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>家人留言</h3>
          <button onClick={() => setShowAllMessages(!showAllMessages)} style={{ fontSize: 13, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            {showAllMessages ? '收起' : '查看全部'}
          </button>
        </div>
        {familyMessages.map((msg) => {
          if (!showAllMessages && recentMessages.indexOf(msg) === -1) return null
          return (
          <Card key={msg.id}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Avatar name={msg.senderName} size={36} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{msg.senderName}</span>
                    <span className="tag" style={{
                      fontSize: 11, padding: '1px 8px', marginLeft: 6,
                      background: msg.role === '护工' ? '#E8F5E9' : '#E3F2FD',
                      color: msg.role === '护工' ? 'var(--color-primary)' : 'var(--color-info)',
                    }}>{msg.role}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                    {msg.createdAt.slice(11, 16)}
                  </span>
                </div>
                {editingFmId === msg.id ? (
                  <div style={{ marginTop: 4 }}>
                    <textarea
                      value={editFmText}
                      onChange={(e) => setEditFmText(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 14,
                        border: '2px solid var(--color-primary)', borderRadius: 10,
                        outline: 'none', minHeight: 50, resize: 'none', boxSizing: 'border-box',
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button onClick={handleSaveEditFm} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}>💾 保存</button>
                      <button onClick={() => { setEditingFmId(null); setEditFmText('') }} style={{ fontSize: 12, color: 'var(--color-text-light)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6, cursor: msg.role === '家属' ? 'pointer' : undefined }}
                    onDoubleClick={() => msg.role === '家属' && handleEditFm(msg.id)}
                    title={msg.role === '家属' ? '双击编辑' : ''}
                  >
                    {msg.type === 'voice' ? '🎤 [语音留言]' : msg.content}
                  </div>
                )}
                {msg.replied && (
                  <div style={{
                    marginTop: 8, padding: '8px 12px', background: '#F5F5F5',
                    borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)',
                    borderLeft: '3px solid var(--color-primary)',
                  }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>回复：</span>
                    {msg.replyContent}
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4 }}>{msg.replyTime?.slice(11, 16)}</div>
                  </div>
                )}
                {replyingTo === msg.id ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="输入回复内容..."
                          style={{
                            width: '100%', padding: '8px 12px', fontSize: 14,
                            border: '1px solid var(--color-border)', borderRadius: 20,
                            outline: 'none', minHeight: 36, boxSizing: 'border-box',
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply(msg.id)}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '4px 6px' }}
                      >
                        😊
                      </button>
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)',
                          color: 'white', border: 'none', fontSize: 14, cursor: 'pointer',
                        }}
                      >
                        ➤
                      </button>
                    </div>
                    {showEmoji && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6,
                        padding: 8, background: '#F5F5F5', borderRadius: 10,
                      }}>
                        {EMOJIS.map((emoji) => (
                          <span
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            style={{ fontSize: 20, cursor: 'pointer', padding: 2, lineHeight: 1 }}
                          >{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {!msg.replied && msg.role === '家属' && (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 8, fontSize: 12, padding: '4px 12px', minHeight: 32 }} disabled>
                        等待回复...
                      </button>
                    )}
                    {!msg.replied && msg.role === '护工' && (
                      <button
                        onClick={() => handleReply(msg.id)}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: 8, fontSize: 12, padding: '4px 12px', minHeight: 32, cursor: 'pointer' }}
                      >
                        回复留言
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        )})}
        <Card>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder="✏️ 给护工留言..."
              style={{
                flex: 1, padding: '9px 14px', fontSize: 14,
                border: '1px solid var(--color-border)', borderRadius: 20,
                outline: 'none', minHeight: 36,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendNewMsg()}
            />
            <button
              onClick={() => setShowNewEmoji(!showNewEmoji)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '4px 6px' }}
            >
              😊
            </button>
            <button
              onClick={handleSendNewMsg}
              style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)',
                color: 'white', border: 'none', fontSize: 14, cursor: 'pointer',
              }}
            >
              ➤
            </button>
          </div>
          {showNewEmoji && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6,
              padding: 8, background: '#F5F5F5', borderRadius: 10,
            }}>
              {EMOJIS.map((emoji) => (
                <span
                  key={emoji}
                  onClick={() => { setNewMsgText((prev) => prev + emoji); setShowNewEmoji(false) }}
                  style={{ fontSize: 20, cursor: 'pointer', padding: 2, lineHeight: 1 }}
                >{emoji}</span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Reviews */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>最近评价</h3>
          <button onClick={() => navigate('/reviews')} style={{ fontSize: 13, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            全部评价 {'>'}
          </button>
        </div>
        {recentReviews.map((review) => (
          <Card key={review.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={review.caregiverName} size={36} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{review.caregiverName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{review.elderlyName} · {review.createdAt}</div>
                </div>
              </div>
              <StarDisplay value={review.rating} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{review.content}</p>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, fontSize: 11, color: 'var(--color-text-light)' }}>
              <DimTag label="态度" score={review.dimensions.attitude} />
              <DimTag label="专业" score={review.dimensions.professional} />
              <DimTag label="耐心" score={review.dimensions.patience} />
              <DimTag label="响应" score={review.dimensions.response} />
              <DimTag label="效果" score={review.dimensions.effectiveness} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Family Access */}
      <div className="section">
        <h3 className="section-title">我的家人</h3>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {elderlyList.map((elderly) => (
            <div key={elderly.id} onClick={() => navigate('/health')} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 20px', background: 'var(--color-bg-white)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer', minWidth: 100,
              border: '1px solid var(--color-border)',
            }}>
              <Avatar name={elderly.name} size={44} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{elderly.name}</div>
                <span className="tag tag-warning" style={{ fontSize: 10, padding: '1px 6px', marginTop: 2 }}>
                  {elderly.careLevel}
                </span>
              </div>
            </div>
          ))}
          <div onClick={() => navigate('/profile')} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '14px 20px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', minWidth: 100, border: '2px dashed var(--color-border)',
          }}>
            <span style={{ fontSize: 28, color: 'var(--color-text-light)' }}>+</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>绑定家人</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const RecordRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 6, padding: '2px 0' }}>
    <span style={{ minWidth: 16 }}>{icon}</span>
    <span style={{ color: 'var(--color-text-light)', minWidth: 36, fontSize: 13 }}>{label}</span>
    <span>{value}</span>
  </div>
)

const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
  <span style={{ color: '#FF8F00', fontSize: 14, fontWeight: 600 }}>
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
  </span>
)

const DimTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <span style={{ background: score >= 4 ? '#E8F5E9' : '#FFF3E0', padding: '1px 6px', borderRadius: 4 }}>{label}{score}</span>
)
