import { useState, useRef } from 'react'
import { View, Text, Image, Input, Textarea, ScrollView, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockMessages, mockNotifications, mockCaregivers } from '../../utils/mockData'
import { getRelativeTime, generateId, formatBeijingDateTime, getNowBeijingISO } from '../../utils'
import { useAppStore, SystemNotification, Permissions } from '../../store'
import { saveTempFile } from '../../utils/fileStorage'

const EMOJIS = ['😊', '👍', '❤️', '🙏', '😄', '🎉', '💪', '🌸', '✨', '👌', '😘', '💕', '🥰', '😆', '🤗', '🙌', '😇', '👏', '🌟', '💖', '🔥', '⭐', '💤', '😎', '🥳', '🤩', '💯', '🎊', '🌈', '🌺']

export default function MessagesPage() {
  const { user, addNotification } = useAppStore()
  const userId = user?.id || 'u1'
  const isCaregiver = Permissions.isCaregiver(user?.role)
  const isFamily = Permissions.isFamily(user?.role)
  const isAdmin = Permissions.isAdmin(user?.role)

  const [activeTab, setActiveTab] = useState<'chat' | 'notification'>('chat')
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>(
    mockMessages.map((m: any) => ({ ...m, status: 'read', edited: false }))
  )
  const [notifications, setNotifications] = useState(mockNotifications)
  const [inputText, setInputText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMention, setShowMention] = useState(false)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const persistMessages = (msgs: any[]) => {
    setMessages(msgs)
    Taro.setStorageSync('chat_messages', JSON.stringify(msgs))
  }

  const updateMsgStatus = (msgId: string, updates: any) => {
    const stored = JSON.parse(Taro.getStorageSync('chat_messages') || '[]')
    const next = stored.map((m: any) => m.id === msgId ? { ...m, ...updates } : m)
    Taro.setStorageSync('chat_messages', JSON.stringify(next))
    setMessages(next)
  }

  const [mentionList] = useState([
    { id: 'cg1', name: '@王芳', role: '护工' },
    { id: 'cg2', name: '@刘丽华', role: '护工' },
    { id: 'cg3', name: '@赵明霞', role: '护工' },
    { id: 'family', name: '@家属', role: '家属' },
    { id: 'e1', name: '@张秀英', role: '老人' },
    { id: 'e2', name: '@李建国', role: '老人' },
  ])

  const markRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const allContacts = [
    { id: 'c1', name: '王芳', role: '护工', caregiverId: 'c1', avatar: '', elderly: '张秀英' },
    { id: 'c2', name: '刘丽华', role: '护工', caregiverId: 'c2', avatar: '', elderly: '李建国' },
    { id: 'c3', name: '赵明霞', role: '护工', caregiverId: 'c3', avatar: '', elderly: '李建国' },
    { id: 'c4', name: '系统通知', role: 'system', caregiverId: '', avatar: '', elderly: '' },
    ...(isCaregiver ? [{ id: 'family-1', name: '家属', role: '家属', caregiverId: '', avatar: '', elderly: '张秀英' }] : []),
    ...(isFamily || isAdmin ? [
      { id: 'cg-all', name: '护工组', role: '群聊', caregiverId: '', avatar: '', elderly: '' },
    ] : []),
  ]

  const convMsgs = (contactId: string) => messages.filter((m: any) =>
    (m.senderId === contactId && m.receiverId === userId) || (m.senderId === userId && m.receiverId === contactId)
  )
  const conversations = allContacts.map((c) => ({
    ...c,
    lastMsg: c.id === 'c4' ? '有3条未读通知' : convMsgs(c.id).slice(-1)[0]?.content || '暂无消息',
    unread: c.id === 'c4' ? 3 : 0,
    time: c.id === 'c4' ? '2026-05-26T16:00:00' : convMsgs(c.id).slice(-1)[0]?.createdAt || '2026-05-26T10:00:00',
  }))

  const [showContactPicker, setShowContactPicker] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [msgDateFrom, setMsgDateFrom] = useState('')
  const [msgDateTo, setMsgDateTo] = useState('')

  const handleRecall = (msgId: string) => {
    persistMessages(messages.map((m: any) => m.id === msgId ? { ...m, recalled: true, recalledAt: getNowBeijingISO() } : m))
  }

  const extractMentions = (text: string): string[] => {
    const matches = text.match(/@[\u4e00-\u9fa5\w]+/g)
    return matches || []
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return
    const mentions = extractMentions(inputText)
    const newMsg: any = {
      id: generateId(),
      senderId: userId,
      senderName: user?.name || '我',
      receiverId: activeChat,
      content: inputText.trim(),
      type: 'text' as const,
      createdAt: getNowBeijingISO(),
      read: false,
      status: 'sent' as const,
      edited: false,
      mentions: mentions.length > 0 ? mentions : undefined,
    }
    persistMessages([...messages, newMsg])
    setInputText('')
    setShowEmoji(false)
    setShowMention(false)
    setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'delivered' }) }, 800)
    setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'read', read: true }) }, 2300)
  }

  const handleEditMessage = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    setEditingMsgId(msgId)
    setEditText(msg.content)
  }

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMsgId) return
    persistMessages(messages.map((m: any) => m.id === editingMsgId ? { ...m, content: editText.trim(), edited: true } : m))
    setEditingMsgId(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingMsgId(null)
    setEditText('')
  }

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji)
    setShowEmoji(false)
  }

  const handleMentionClick = (name: string) => {
    setInputText((prev) => prev + name + ' ')
    setShowMention(false)
  }

  const handleImagePick = () => {
    Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] }).then((res) => {
      const url = saveTempFile(res.tempFilePaths[0])
      const newMsg: any = {
        id: generateId(),
        senderId: userId,
        senderName: user?.name || '我',
        receiverId: activeChat,
        content: '[图片]',
        type: 'image' as const,
        imageUrl: url,
        createdAt: getNowBeijingISO(),
        read: false,
        status: 'sent' as const,
        edited: false,
      }
      persistMessages([...messages, newMsg])
      setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'delivered' }) }, 800)
      setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'read', read: true }) }, 2300)
    })
  }

  const handleVideoPick = () => {
    Taro.chooseVideo({ sourceType: ['album', 'camera'] }).then((res) => {
      const url = saveTempFile(res.tempFilePath)
      const newMsg: any = {
        id: generateId(),
        senderId: userId,
        senderName: user?.name || '我',
        receiverId: activeChat,
        content: '[视频]',
        type: 'video' as const,
        imageUrl: url,
        createdAt: getNowBeijingISO(),
        read: false,
        status: 'sent' as const,
        edited: false,
      }
      persistMessages([...messages, newMsg])
      setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'delivered' }) }, 800)
      setTimeout(() => { updateMsgStatus(newMsg.id, { status: 'read', read: true }) }, 2300)
    })
  }

  const handleAvatarClick = (conv: typeof conversations[0]) => {
    if (conv.id === 'c4') return
    if (conv.role === '护工' && conv.caregiverId) {
      Taro.navigateTo({ url: `/pages/caregiverDetail/index?id=${conv.caregiverId}` })
    } else {
      Taro.navigateTo({ url: '/pages/profile/index' })
    }
  }

  const notifTypes: Record<SystemNotification['type'], { icon: string; color: string }> = {
    message: { icon: '💬', color: '#E3F2FD' },
    care_reminder: { icon: '💊', color: '#E8F5E9' },
    system: { icon: '🔔', color: '#FFF3E0' },
    review: { icon: '⭐', color: '#F3E5F5' },
  }

  if (activeChat) {
    const partner = conversations.find((c) => c.id === activeChat)
    const chatMsgs = messages.filter((m) => {
      if (!((m.senderId === activeChat && m.receiverId === userId) || (m.senderId === userId && m.receiverId === activeChat))) return false
      if (msgDateFrom && m.createdAt.slice(0, 10) < msgDateFrom) return false
      if (msgDateTo && m.createdAt.slice(0, 10) > msgDateTo) return false
      return true
    })

    if (activeChat === 'c4') {
      return (
        <View className='page' style={{ paddingBottom: 80 }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
            <View onClick={() => setActiveChat(null)} style={{ fontSize: 24 }}><Text>‹</Text></View>
            <Text style={{ fontSize: 18, fontWeight: 600 }}>系统通知</Text>
          </View>
          {notifications.map((n) => {
            const t = notifTypes[n.type]
            return (
              <View className='card' key={n.id} onClick={() => markRead(n.id)}>
                <View style={{ display: 'flex', gap: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><Text>{t.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</Text>
                        {!n.read && <View style={{ width: 8, height: 8, borderRadius: '50%', background: '#D32F2F' }} />}
                      </View>
                      <Text style={{ fontSize: 11, color: '#9E9E9E' }}>{n.time.slice(11, 16)}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, display: 'block' }}>{n.content}</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )
    }

    return (
      <View className='page' style={{ display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
        <View style={{ padding: '12px 0', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <View onClick={() => { setActiveChat(null); setShowEmoji(false) }} style={{ fontSize: 24 }}><Text>‹</Text></View>
          <View style={{ width: 40, height: 40, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
            <Text>{partner?.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 600, display: 'block' }}>{partner?.name}</Text>
            <Text style={{ fontSize: 12, color: '#9E9E9E', display: 'block' }}>{partner?.role} · {partner?.elderly}</Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: 6, padding: '8px 0', alignItems: 'center' }}>
          <Input type='text' placeholder='从' value={msgDateFrom} onInput={(e) => setMsgDateFrom(e.detail.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #E0E0E0', background: '#F5F5F5', minHeight: 32 }} />
          <Text style={{ fontSize: 12, color: '#9E9E9E' }}>至</Text>
          <Input type='text' placeholder='到' value={msgDateTo} onInput={(e) => setMsgDateTo(e.detail.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #E0E0E0', background: '#F5F5F5', minHeight: 32 }} />
        </View>

        <ScrollView style={{ flex: 1 }} scrollY>
          {chatMsgs.length === 0 && (
            <View style={{ textAlign: 'center', padding: 40, color: '#9E9E9E', fontSize: 14 }}>
              <Text>暂无消息，发送第一条消息开始沟通</Text>
            </View>
          )}
          {chatMsgs.map((msg) => {
            const isMe = msg.senderId === userId
            return (
              <View key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 6, alignItems: 'flex-end', padding: '4px', marginBottom: 6 }}>
                {editingMsgId === msg.id ? (
                  <View style={{ width: '100%' }}>
                    <Textarea
                      value={editText}
                      onInput={(e) => setEditText(e.detail.value)}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 14,
                        border: '2px solid #2E7D32', borderRadius: 12,
                        minHeight: 60, boxSizing: 'border-box',
                      }}
                    />
                    <View style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <View onClick={handleSaveEdit} style={{ fontSize: 12, color: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 6, padding: '2px 8px' }}><Text>保存</Text></View>
                      <View onClick={handleCancelEdit} style={{ fontSize: 12, color: '#9E9E9E', border: '1px solid #E0E0E0', borderRadius: 6, padding: '2px 8px' }}><Text>取消</Text></View>
                    </View>
                  </View>
                ) : (
                  <View style={{
                    padding: msg.type === 'image' ? 4 : (msg.recalled ? '6px 14px' : '9px 14px'),
                    borderRadius: 16,
                    background: msg.recalled ? '#F5F5F5' : (isMe ? '#2E7D32' : '#F5F5F5'),
                    color: msg.recalled ? '#9E9E9E' : (isMe ? 'white' : '#212121'),
                    fontSize: msg.recalled ? 13 : 15, lineHeight: 1.6, wordBreak: 'break-word',
                    maxWidth: '75%',
                  }}>
                    {msg.recalled ? (
                      <Text>该消息已被撤回</Text>
                    ) : msg.type === 'image' ? (
                      msg.imageUrl ? (
                        <Image src={msg.imageUrl} mode='aspectFit' onClick={() => setPreviewImage(msg.imageUrl)} style={{ maxWidth: 200, maxHeight: 180, borderRadius: 10 }} />
                      ) : (
                        <View style={{ width: 160, height: 120, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#9E9E9E' }}>
                          <Text>[图片]</Text>
                        </View>
                      )
                    ) : msg.type === 'video' ? (
                      msg.imageUrl ? (
                        <View style={{ position: 'relative', width: 200, height: 150, borderRadius: 10, overflow: 'hidden' }}>
                          <Video src={msg.imageUrl} style={{ width: '100%', height: '100%' }} />
                        </View>
                      ) : (
                        <View style={{ width: 160, height: 120, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 36 }}>▶️</Text>
                        </View>
                      )
                    ) : (
                      <Text>{msg.content}</Text>
                    )}
                    {msg.edited && <Text style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>已编辑</Text>}
                    {isMe && !msg.recalled && (
                      <View style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        <View onClick={() => handleEditMessage(msg.id)} style={{ fontSize: 11, color: isMe ? '#B9F6CA' : '#2E7D32' }}><Text>✏️</Text></View>
                        <View onClick={() => handleRecall(msg.id)} style={{ fontSize: 11, color: '#FF8A80' }}><Text>↩</Text></View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>

        <View style={{
          padding: '8px 12px', paddingBottom: '8px',
          background: '#FFFFFF', borderTop: '1px solid #E0E0E0',
        }}>
          {showEmoji && (
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, padding: 10, background: '#F5F5F5', borderRadius: 12, maxHeight: 120, overflowY: 'auto' }}>
              {EMOJIS.map((emoji) => (
                <Text key={emoji} onClick={() => handleEmojiClick(emoji)} style={{ fontSize: 24, padding: 3, lineHeight: 1 }}>{emoji}</Text>
              ))}
            </View>
          )}
          {showMention && (
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, padding: 8, background: '#F5F5F5', borderRadius: 12 }}>
              {mentionList.map((m) => (
                <View key={m.id} onClick={() => handleMentionClick(m.name)} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 16, background: 'white', border: '1px solid #E0E0E0', color: '#2E7D32', fontWeight: 500, margin: 2 }}>
                  <Text>{m.name} <Text style={{ fontSize: 11, color: '#9E9E9E', fontWeight: 400 }}>{m.role}</Text></Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <View onClick={handleImagePick} style={{ fontSize: 22, padding: 4 }}><Text>📷</Text></View>
            <View onClick={handleVideoPick} style={{ fontSize: 20, padding: 4 }}><Text>🎬</Text></View>
            <View onClick={() => { setShowEmoji(!showEmoji); setShowMention(false) }} style={{ fontSize: 22, padding: 4 }}><Text>😊</Text></View>
            <View onClick={() => { setShowMention(!showMention); setShowEmoji(false) }} style={{ fontSize: 18, padding: 4, fontWeight: 700 }}><Text>@</Text></View>
            <Input
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              placeholder={isFamily ? '📝 留言...' : '输入消息...'}
              style={{
                flex: 1, padding: '9px 14px', fontSize: 15, border: '1px solid #E0E0E0',
                borderRadius: 24, background: '#F5F5F5', minHeight: 36,
              }}
            />
            <View onClick={handleSendMessage} style={{
              width: 40, height: 40, borderRadius: '50%', background: '#2E7D32',
              color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text>➤</Text>
            </View>
          </View>
        </View>

        {previewImage && (
          <View onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={previewImage} mode='aspectFit' style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: 8 }} />
          </View>
        )}
        {previewVideo && (
          <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: '#000' }}>
            <View onClick={() => setPreviewVideo(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
              <Text>✕</Text>
            </View>
            <Video src={previewVideo} autoplay controls style={{ width: '100%', height: '100%' }} />
          </View>
        )}
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>消息</Text>
      </View>

      <View style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#F5F5F5', borderRadius: '12px', padding: 3 }}>
        <View onClick={() => setActiveTab('chat')} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: activeTab === 'chat' ? '#2E7D32' : 'transparent', color: activeTab === 'chat' ? 'white' : '#616161', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>
          <Text>💬 对话</Text>
        </View>
        <View onClick={() => setActiveTab('notification')} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: activeTab === 'notification' ? '#2E7D32' : 'transparent', color: activeTab === 'notification' ? 'white' : '#616161', fontWeight: 500, fontSize: 13, textAlign: 'center' }}>
          <Text>🔔 通知 {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}</Text>
        </View>
      </View>

      {activeTab === 'chat' ? (
        <>
          {conversations.filter((c: any) => c.id !== 'c4').map((conv: any) => (
            <View className='card' key={conv.id}>
              <View style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={() => setActiveChat(conv.id)}>
                <View style={{ width: 48, height: 48, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>
                  <Text>{conv.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: 600 }}>{conv.name}</Text>
                      <Text className='tag' style={{ fontSize: 10, padding: '1px 6px', marginLeft: 6, background: '#E8F5E9', color: '#2E7D32' }}>{conv.role}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#9E9E9E' }}>{getRelativeTime(conv.time)}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#616161', marginTop: 4 }}>{conv.lastMsg}</Text>
                  {conv.elderly && (
                    <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2, display: 'block' }}>服务对象：{conv.elderly}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          {notifications.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-state-icon'>🔔</Text>
              <Text className='empty-state-text'>暂无通知</Text>
            </View>
          ) : (
            notifications.map((n) => {
              const t = notifTypes[n.type]
              return (
                <View className='card' key={n.id} onClick={() => markRead(n.id)}>
                  <View style={{ display: 'flex', gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><Text>{t.icon}</Text></View>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Text style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</Text>
                          {!n.read && <View style={{ width: 8, height: 8, borderRadius: '50%', background: '#D32F2F' }} />}
                        </View>
                        <Text style={{ fontSize: 11, color: '#9E9E9E' }}>{getRelativeTime(n.time)}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, display: 'block' }}>{n.content}</Text>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </>
      )}
    </View>
  )
}
