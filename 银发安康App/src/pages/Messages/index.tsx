import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Avatar } from '../../components/common/Avatar'
import { Button } from '../../components/common/Button'
import { mockMessages, mockNotifications, mockCaregivers } from '../../utils/mockData'
import { getRelativeTime, generateId, formatBeijingDateTime, getNowBeijingISO } from '../../utils'
import { useAppStore, SystemNotification, Permissions } from '../../store'

const EMOJIS = ['😊', '👍', '❤️', '🙏', '😄', '🎉', '💪', '🌸', '✨', '👌', '😘', '💕', '🥰', '😆', '🤗', '🙌', '😇', '👏', '🌟', '💖', '🔥', '⭐', '💤', '😎', '🥳', '🤩', '💯', '🎊', '🌈', '🌺']

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, addMessage, addNotification } = useAppStore()
  const userId = user?.id || 'u1'
  const isCaregiver = Permissions.isCaregiver(user?.role)
  const isFamily = Permissions.isFamily(user?.role)
  const isAdmin = Permissions.isAdmin(user?.role)

  const [activeTab, setActiveTab] = useState<'chat' | 'notification'>('chat')
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const savedMsgs = JSON.parse(localStorage.getItem('chat_messages') || 'null')
  const [messages, setMessages] = useState<any[]>(
    savedMsgs || mockMessages.map((m: any) => ({ ...m, status: 'read', edited: false }))
  )
  const [notifications, setNotifications] = useState(mockNotifications)
  const [inputText, setInputText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showMention, setShowMention] = useState(false)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const persistMessages = (msgs: any[]) => {
    setMessages(msgs)
    localStorage.setItem('chat_messages', JSON.stringify(msgs))
  }
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const updateMsgStatus = (msgId: string, updates: any) => {
    const stored = JSON.parse(localStorage.getItem('chat_messages') || '[]')
    const next = stored.map((m: any) => m.id === msgId ? { ...m, ...updates } : m)
    localStorage.setItem('chat_messages', JSON.stringify(next))
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
  const [composeTarget, setComposeTarget] = useState<string | null>(null)
  const [composeTargetSearch, setComposeTargetSearch] = useState('')
  const [showTargetList, setShowTargetList] = useState(false)
  const [composeText, setComposeText] = useState('')
  const [composeFiles, setComposeFiles] = useState<{ type: 'image' | 'video'; url: string }[]>([])
  const [showComposeEmoji, setShowComposeEmoji] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [msgDateFrom, setMsgDateFrom] = useState('')
  const [msgDateTo, setMsgDateTo] = useState('')

  const handleRecall = (msgId: string) => {
    persistMessages(messages.map((m: any) => m.id === msgId ? { ...m, recalled: true, recalledAt: getNowBeijingISO() } : m))
  }

  const handleComposeEmojiPick = (emoji: string) => {
    setComposeText((prev) => prev + emoji)
    setShowComposeEmoji(false)
  }

  const handleComposeImagePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      files.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setComposeFiles((prev) => [...prev, { type: 'image', url: e.target!.result as string }])
          }
        }
        reader.readAsDataURL(f)
      })
    }
    input.click()
  }

  const handleComposeVideoPick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files || [])
      files.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setComposeFiles((prev) => [...prev, { type: 'video', url: e.target!.result as string }])
          }
        }
        reader.readAsDataURL(f)
      })
    }
    input.click()
  }

  const handleAvatarClick = (conv: typeof conversations[0]) => {
    if (conv.id === 'c4') return
    if (conv.role === '护工' && conv.caregiverId) {
      const cg = mockCaregivers.find((c) => c.id === conv.caregiverId)
      if (cg) navigate(`/caregivers/${cg.id}`)
    } else {
      navigate('/profile')
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji)
    setShowEmoji(false)
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
    const partner = conversations.find((c) => c.id === activeChat)
    if (partner && isFamily) {
      addNotification({
        id: generateId(),
        type: 'message',
        title: '家属留言',
        content: `家属${user?.name || '张明'}留言: ${inputText.trim()}`,
        time: getNowBeijingISO(),
        read: false,
      })
    }
  }

  const handleEditMessage = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    setEditingMsgId(msgId)
    setEditText(msg.content)
    setShowEmoji(false)
    setShowMention(false)
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

  const handleQuickSend = () => {
    if ((!composeText.trim() && composeFiles.length === 0) || !composeTarget) return
    const hasText = composeText.trim().length > 0
    let allNew: any[] = []
    if (hasText) {
      allNew.push({
        id: generateId(), senderId: userId, senderName: user?.name || '我', receiverId: composeTarget,
        content: composeText.trim(), type: 'text', createdAt: getNowBeijingISO(),
        read: false, status: 'sent', edited: false,
      })
    }
    composeFiles.forEach((f) => {
      allNew.push({
        id: generateId(), senderId: userId, senderName: user?.name || '我', receiverId: composeTarget,
        content: f.type === 'image' ? '[图片]' : '[视频]', type: f.type,
        [f.type === 'image' ? 'imageUrl' : 'videoUrl']: f.url,
        createdAt: getNowBeijingISO(), read: false, status: 'sent', edited: false,
      })
    })
    const next = [...messages, ...allNew]
    localStorage.setItem('chat_messages', JSON.stringify(next))
    setMessages(next)
    setComposeText('')
    setComposeFiles([])
    setShowComposeEmoji(false)
    setActiveChat(composeTarget)
    allNew.forEach((m) => {
      setTimeout(() => { updateMsgStatus(m.id, { status: 'delivered' }) }, 800)
      setTimeout(() => { updateMsgStatus(m.id, { status: 'read', read: true }) }, 2300)
    })
  }

  const handleImagePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
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
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleMentionClick = (name: string) => {
    setInputText((prev) => prev + name + ' ')
    setShowMention(false)
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
        <div className="page" style={{ paddingBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
            <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 0 }}>‹</button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>系统通知</span>
          </div>
          {notifications.map((n) => {
            const t = notifTypes[n.type]
            return (
              <Card key={n.id} onClick={() => markRead(n.id)}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{n.time.slice(11, 16)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{n.content}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )
    }

    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 10, background: 'white',
          padding: '12px 0', borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button onClick={() => { setActiveChat(null); setShowEmoji(false) }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 0 }}>‹</button>
          <Avatar name={partner?.name || ''} size={40} onClick={() => partner && handleAvatarClick(partner)} style={{ cursor: 'pointer' }} />
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => partner && handleAvatarClick(partner)}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{partner?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{partner?.role} · {partner?.elderly}</div>
          </div>
          <button onClick={() => { setShowContactPicker(true); setShowEmoji(false) }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, cursor: 'pointer', marginRight: 4 }}>
            🔄 换联系人
          </button>
          <button onClick={() => partner && handleAvatarClick(partner)} style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', fontSize: 13, cursor: 'pointer' }}>
            📋 资料
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '8px 0', alignItems: 'center' }}>
          <input type="date" value={msgDateFrom} onChange={(e) => setMsgDateFrom(e.target.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>至</span>
          <input type="date" value={msgDateTo} onChange={(e) => setMsgDateTo(e.target.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)' }} />
          {(msgDateFrom || msgDateTo) && (
            <button onClick={() => { setMsgDateFrom(''); setMsgDateTo('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer', whiteSpace: 'nowrap', padding: '6px 8px' }}>清除</button>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          {chatMsgs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)', fontSize: 14 }}>
              暂无消息，发送第一条消息开始沟通
            </div>
          )}
          {chatMsgs.map((msg, idx) => {
            const isMe = msg.senderId === userId
            const showTime = idx === 0 || Math.abs(new Date(msg.createdAt).getTime() - new Date(chatMsgs[idx - 1].createdAt).getTime()) > 300000
            return (
            <React.Fragment key={msg.id}>
              {showTime && (
                <div style={{ textAlign: 'center', margin: '4px 0' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)', background: 'var(--color-bg)', padding: '2px 10px', borderRadius: 10 }}>
                    {msg.createdAt.slice(5, 10) === getNowBeijingISO().slice(5, 10) ? '' : formatBeijingDateTime(msg.createdAt) + ' '}
                    {formatBeijingDateTime(msg.createdAt)}
                  </span>
                </div>
              )}
              <div style={{
                display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
                gap: 6, alignItems: 'flex-end', padding: '0 4px',
              }}>
                  {!isMe && (
                  <Avatar name={msg.senderName} size={32} onClick={() => {
                    const cg = mockCaregivers.find((c) => c.id === msg.senderId)
                    if (cg) navigate(`/caregivers/${cg.id}`)
                    else navigate('/profile')
                  }} style={{ cursor: 'pointer', flexShrink: 0 }} />
                )}
                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {editingMsgId === msg.id ? (
                    <div style={{ width: '100%' }}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 12px', fontSize: 14,
                          border: '2px solid var(--color-primary)', borderRadius: 12,
                          outline: 'none', minHeight: 60, resize: 'none', boxSizing: 'border-box',
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <button onClick={handleSaveEdit} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>保存</button>
                        <button onClick={handleCancelEdit} style={{ fontSize: 12, color: 'var(--color-text-light)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <div className="msg-bubble" style={{
                      padding: msg.type === 'image' ? 4 : (msg.recalled ? '6px 14px' : '9px 14px'),
                      borderRadius: 16,
                      background: msg.recalled ? 'var(--color-bg)' : (isMe ? 'var(--color-primary)' : '#F5F5F5'),
                      color: msg.recalled ? 'var(--color-text-light)' : (isMe ? 'white' : 'var(--color-text)'),
                      fontSize: msg.recalled ? 13 : 15, lineHeight: 1.6, wordBreak: 'break-word',
                      borderBottomRightRadius: isMe ? 4 : 16,
                      borderBottomLeftRadius: !isMe ? 4 : 16,
                      boxShadow: msg.recalled ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                      position: 'relative',
                    }}
                      onDoubleClick={() => !msg.recalled && isMe && handleEditMessage(msg.id)}
                    >
                      {msg.recalled ? (
                        <span>该消息已被撤回</span>
                      ) : msg.type === 'image' ? (
                        msg.imageUrl ? (
                          <img src={msg.imageUrl} alt="图片" onClick={() => setPreviewImage(msg.imageUrl)} style={{ maxWidth: 200, maxHeight: 180, borderRadius: 10, display: 'block', cursor: 'pointer' }} />
                        ) : (
                          <div style={{ width: 160, height: 120, borderRadius: 10, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--color-text-light)' }}>[图片]</div>
                        )
                      ) : msg.type === 'video' && msg.videoUrl ? (
                        <div onClick={() => setPreviewVideo(msg.videoUrl)} style={{ position: 'relative', cursor: 'pointer' }}>
                          <video src={msg.videoUrl} muted style={{ maxWidth: 200, maxHeight: 180, borderRadius: 10, display: 'block', pointerEvents: 'none' }} />
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 40, opacity: 0.8, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>▶️</div>
                        </div>
                      ) : msg.type === 'voice' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 18 }}>🎤</span>
                          <div style={{ width: 70, height: 4, background: isMe ? 'rgba(255,255,255,0.4)' : '#ddd', borderRadius: 2 }} />
                          <span style={{ fontSize: 11, opacity: 0.7 }}>0:12</span>
                        </div>
                      ) : (
                        <span>
                          {(msg.content as string).split(/(@[\u4e00-\u9fa5\w]+)/g).map((part: string, i: number) =>
                            part.startsWith('@') ? (
                              <span key={i} style={{ color: isMe ? '#B9F6CA' : '#1976D2', fontWeight: 600, background: isMe ? 'rgba(255,255,255,0.15)' : '#E3F2FD', padding: '0 3px', borderRadius: 4 }}>{part}</span>
                            ) : part
                          )}
                        </span>
                      )}
                      {msg.edited && <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>已编辑</span>}
                      {isMe && msg.recalled && (
                        <div style={{ textAlign: 'center', padding: '4px 0' }}>
                          <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>你已撤回了一条消息</span>
                        </div>
                      )}
                      {isMe && !msg.recalled && (
                        <>
                          <button
                            onClick={() => handleEditMessage(msg.id)}
                            style={{
                              position: 'absolute', top: -18, right: 0, fontSize: 11,
                              color: 'var(--color-primary)', background: 'white',
                              border: '1px solid var(--color-border)', borderRadius: 4,
                              padding: '0 6px', cursor: 'pointer', display: 'none',
                              lineHeight: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                            className="edit-btn"
                            onMouseDown={(e) => e.stopPropagation()}
                          >✏️ 编辑</button>
                          {Date.now() - new Date(msg.createdAt).getTime() < 120000 && (
                            <button
                              onClick={() => handleRecall(msg.id)}
                              style={{
                                position: 'absolute', top: -18, left: 0, fontSize: 11,
                                color: 'var(--color-danger)', background: 'white',
                                border: '1px solid var(--color-danger)', borderRadius: 4,
                                padding: '0 6px', cursor: 'pointer', display: 'none',
                                lineHeight: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              }}
                              className="recall-btn"
                              onMouseDown={(e) => e.stopPropagation()}
                            >↩ 撤回</button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-light)' }}>
                      {formatBeijingDateTime(msg.createdAt)}
                    </span>
                    {isMe && msg.status && (
                      <span style={{ fontSize: 10, color: msg.status === 'read' ? 'var(--color-primary)' : 'var(--color-text-light)' }}>
                        {msg.status === 'sending' ? '⏳' : msg.status === 'sent' ? '✓' : msg.status === 'delivered' ? '✓✓' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )})}
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '8px 12px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          background: 'var(--color-bg-white)', borderTop: '1px solid var(--color-border)',
          maxWidth: 'var(--max-content-width)', margin: '0 auto', zIndex: 50,
        }}>
          {showEmoji && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8,
              padding: 10, background: '#F5F5F5', borderRadius: 12, maxHeight: 120, overflowY: 'auto',
            }}>
              {EMOJIS.map((emoji) => (
                <span
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  style={{ fontSize: 24, cursor: 'pointer', padding: 3, lineHeight: 1, transition: 'transform 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >{emoji}</span>
              ))}
            </div>
          )}
          {showMention && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8,
              padding: 8, background: '#F5F5F5', borderRadius: 12,
            }}>
              {mentionList.map((m) => (
                <span
                  key={m.id}
                  onClick={() => handleMentionClick(m.name)}
                  style={{
                    fontSize: 13, cursor: 'pointer', padding: '4px 10px', borderRadius: 16,
                    background: 'white', border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)', fontWeight: 500,
                  }}
                >{m.name} <span style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 400 }}>{m.role}</span></span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={handleImagePick} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, color: 'var(--color-text-light)' }}>📷</button>
            {isCaregiver && <button style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, color: 'var(--color-text-light)' }}>🎤</button>}
            <button
              onClick={() => { setShowEmoji(!showEmoji); setShowMention(false) }}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, color: showEmoji ? 'var(--color-primary)' : 'var(--color-text-light)' }}
            >
              😊
            </button>
            <button
              onClick={() => { setShowMention(!showMention); setShowEmoji(false) }}
              style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4, color: showMention ? 'var(--color-primary)' : 'var(--color-text-light)', fontWeight: 700 }}
            >
              @
            </button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isFamily ? '📝 留言... 用@提到护工' : '输入消息... 用@提到老人'}
              style={{
                flex: 1, padding: '9px 14px', fontSize: 15, border: '1px solid var(--color-border)',
                borderRadius: 24, outline: 'none', background: 'var(--color-bg)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage()
                if (e.key === '@') { setShowMention(true); setShowEmoji(false) }
              }}
            />
            <button onClick={handleSendMessage} style={{
              width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)',
              color: 'white', border: 'none', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(46,125,50,0.3)',
            }}>
              ➤
            </button>
          </div>
        </div>
        {previewImage && (
          <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <img src={previewImage} alt="预览" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          </div>
        )}
        {previewVideo && (
          <div onClick={() => setPreviewVideo(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <button onClick={() => setPreviewVideo(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <video src={previewVideo} controls autoPlay style={{ maxWidth: '95%', maxHeight: '80%', borderRadius: 12 }} onClick={(e) => e.stopPropagation()} onEnded={() => setTimeout(() => setPreviewVideo(null), 500)} />
          </div>
        )}
        {/* Contact Picker inside chat view */}
        {showContactPicker && (
          <div onClick={() => { setShowContactPicker(false); setContactSearch('') }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: 'var(--max-content-width)', maxHeight: '75vh', borderRadius: '20px 20px 0 0', padding: '20px 16px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>选择联系人</h3>
                <button onClick={() => { setShowContactPicker(false); setContactSearch('') }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-text-light)' }}>✕</button>
              </div>
              <input value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} placeholder="🔍 搜索联系人姓名..." autoFocus style={{ width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12, border: '1px solid var(--color-border)', outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: 'var(--color-bg)' }} />
              {allContacts.filter((c) => c.id !== 'c4' && (c.name.includes(contactSearch) || c.role.includes(contactSearch) || (c.elderly || '').includes(contactSearch))).map((contact) => (
                <div key={contact.id} onClick={() => { setActiveChat(contact.id); setShowContactPicker(false); setContactSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 12, cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}>
                  <Avatar name={contact.name} size={44} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600 }}>{contact.name}</div><div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{contact.role}{contact.elderly ? ` · ${contact.elderly}` : ''}</div></div>
                  <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>发消息 ➤</span>
                </div>
              ))}
              {allContacts.filter((c) => c.id !== 'c4' && (c.name.includes(contactSearch) || c.role.includes(contactSearch) || (c.elderly || '').includes(contactSearch))).length === 0 && <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-light)', fontSize: 14 }}>未找到匹配的联系人</div>}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">消息</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 3 }}>
        <button onClick={() => setActiveTab('chat')} style={tabStyle(activeTab === 'chat')}>
          💬 对话 {conversations.filter((c: any) => c.unread > 0 && c.id !== 'c4').length > 0 && `(${conversations.filter((c: any) => c.unread > 0 && c.id !== 'c4').length})`}
        </button>
        <button onClick={() => setActiveTab('notification')} style={tabStyle(activeTab === 'notification')}>
          🔔 通知 {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          <Button variant="secondary" size="sm" block onClick={() => { setShowContactPicker(true); setContactSearch('') }} style={{ marginBottom: 12 }}>
            👥 发起新对话
          </Button>
          {conversations.filter((c: any) => c.id !== 'c4').map((conv: any) => (
            <Card key={conv.id}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative' }} onClick={(e) => { e.stopPropagation(); handleAvatarClick(conv) }}>
                  <Avatar name={conv.name} size={48} style={{ cursor: 'pointer' }} />
                  {conv.unread > 0 && (
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--color-danger)', color: 'white',
                      fontSize: 11, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700,
                    }}>
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setActiveChat(conv.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{conv.name}</span>
                      <span className="tag" style={{
                        fontSize: 10, padding: '1px 6px', marginLeft: 6,
                        background: '#E8F5E9', color: 'var(--color-primary)',
                      }}>{conv.role}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{getRelativeTime(conv.time)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMsg}
                  </div>
                  {conv.elderly && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>
                      服务对象：{conv.elderly}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {/* Quick Compose Bar */}
          {!showContactPicker && conversations.filter((c: any) => c.id !== 'c4').length > 0 && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>📝 快速发送消息</div>
              {showComposeEmoji && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, padding: 10, background: 'white', borderRadius: 12, maxHeight: 100, overflowY: 'auto' }}>
                  {EMOJIS.map((emoji) => (
                    <span key={emoji} onClick={() => handleComposeEmojiPick(emoji)} style={{ fontSize: 22, cursor: 'pointer', padding: 2, lineHeight: 1 }}>{emoji}</span>
                  ))}
                </div>
              )}
              {composeFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, padding: 8, background: 'white', borderRadius: 10 }}>
                  {composeFiles.map((f, i) => (
                    <div key={i} style={{ position: 'relative', width: 48, height: 48 }}>
                      {f.type === 'image' ? (
                        <img src={f.url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎬</div>
                      )}
                      <button onClick={() => setComposeFiles(composeFiles.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-danger)', color: 'white', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', minWidth: 90 }}>
                  <input
                    value={composeTarget ? (allContacts.find((c) => c.id === composeTarget)?.name || '') : composeTargetSearch}
                    onChange={(e) => { setComposeTargetSearch(e.target.value); setComposeTarget(null) }}
                    onFocus={() => { setShowTargetList(true); setShowComposeEmoji(false) }}
                    onBlur={() => setTimeout(() => setShowTargetList(false), 200)}
                    placeholder="选联系人..."
                    style={{
                      width: 90, padding: '8px 10px', fontSize: 13, borderRadius: 10, boxSizing: 'border-box',
                      border: '1px solid var(--color-border)', outline: 'none', background: 'white',
                    }}
                  />
                  {showTargetList && (
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, right: -170, zIndex: 999, background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', marginTop: 4, padding: 4, maxHeight: 150, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                      {allContacts.filter((c) => c.id !== 'c4' && (!composeTargetSearch || c.name.toLowerCase().includes(composeTargetSearch.toLowerCase()) || c.role.toLowerCase().includes(composeTargetSearch.toLowerCase()))).map((c) => (
                        <div key={c.id} onMouseDown={() => { setComposeTarget(c.id); setComposeTargetSearch(c.name); setShowTargetList(false) }} style={{ padding: '8px 10px', fontSize: 13, cursor: 'pointer', borderRadius: 8, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{c.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{c.role}</span>
                        </div>
                      ))}
                      {allContacts.filter((c) => c.id !== 'c4' && (!composeTargetSearch || c.name.toLowerCase().includes(composeTargetSearch.toLowerCase()) || c.role.toLowerCase().includes(composeTargetSearch.toLowerCase()))).length === 0 && (
                        <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-light)', textAlign: 'center' }}>无匹配</div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="输入消息内容..."
                  style={{
                    flex: 1, padding: '8px 14px', fontSize: 14, borderRadius: 24,
                    border: '1px solid var(--color-border)', outline: 'none', background: 'white',
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSend() }}
                />
                <button onClick={handleComposeImagePick} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 2, color: 'var(--color-text-light)' }}>📷</button>
                <button onClick={handleComposeVideoPick} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 2, color: 'var(--color-text-light)' }}>🎥</button>
                <button
                  onClick={() => setShowComposeEmoji(!showComposeEmoji)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 2, color: showComposeEmoji ? 'var(--color-primary)' : 'var(--color-text-light)' }}
                >😊</button>
                <button onClick={handleQuickSend} disabled={!composeTarget || (!composeText.trim() && composeFiles.length === 0)} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: composeTarget && (composeText.trim() || composeFiles.length > 0) ? 'var(--color-primary)' : '#ccc',
                  color: 'white', border: 'none', fontSize: 15, cursor: composeTarget && (composeText.trim() || composeFiles.length > 0) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  ➤
                </button>
              </div>
            </div>
          )}
          {/* Contact Picker Modal */}
          {showContactPicker && (
            <div onClick={() => { setShowContactPicker(false); setContactSearch('') }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: 'var(--max-content-width)', maxHeight: '75vh', borderRadius: '20px 20px 0 0', padding: '20px 16px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>选择联系人</h3>
                  <button onClick={() => { setShowContactPicker(false); setContactSearch('') }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-text-light)' }}>✕</button>
                </div>
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="🔍 搜索联系人姓名..."
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 12,
                    border: '1px solid var(--color-border)', outline: 'none', marginBottom: 12,
                    boxSizing: 'border-box', background: 'var(--color-bg)',
                  }}
                  autoFocus
                />
                {allContacts.filter((c) => c.id !== 'c4' && (c.name.includes(contactSearch) || c.role.includes(contactSearch) || (c.elderly || '').includes(contactSearch))).map((contact) => (
                  <div key={contact.id} onClick={() => { setActiveChat(contact.id); setShowContactPicker(false); setContactSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 12, cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}>
                    <Avatar name={contact.name} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{contact.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{contact.role}{contact.elderly ? ` · ${contact.elderly}` : ''}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>发消息 ➤</span>
                  </div>
                ))}
                {allContacts.filter((c) => c.id !== 'c4' && (c.name.includes(contactSearch) || c.role.includes(contactSearch) || (c.elderly || '').includes(contactSearch))).length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-light)', fontSize: 14 }}>未找到匹配的联系人</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <div className="empty-state-text">暂无通知</div>
            </div>
          ) : (
            notifications.map((n) => {
              const t = notifTypes[n.type]
              return (
                <Card key={n.id} onClick={() => markRead(n.id)}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                          {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{getRelativeTime(n.time)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{n.content}</p>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </>
      )}
      <style>{msgsCss}</style>
    </div>
  )
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: active ? 'var(--color-primary)' : 'transparent',
  color: active ? 'white' : 'var(--color-text-secondary)',
  fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
})

const msgsCss = `
.msg-bubble:hover .edit-btn { display: flex !important; }
.msg-bubble:hover .recall-btn { display: flex !important; }
`
