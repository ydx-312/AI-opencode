import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAppStore, findCaregiverByPhone, getCaregiverLevel } from '../../store'
import { mockCaregivers } from '../../utils/mockData'

const ADMIN_PHONES = ['13120205283', '13120505283']
const SPECIAL_PASSWORD = '#ydx1986312#'

const DEMO_CAREGIVER_PHONE_MAP: Record<string, string> = {
  '13800138001': 'c1',
  '13800138002': 'c2',
  '13800138003': 'c3',
  '13800138004': 'c4',
  '13800138005': 'c5',
}

type PhoneStep = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'success'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setUser } = useAppStore()
  const [mode, setMode] = useState<'phone' | 'password'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [showWeChat, setShowWeChat] = useState(false)
  const [qrScanned, setQrScanned] = useState(false)
  const [loginRole, setLoginRole] = useState<'family' | 'caregiver' | 'admin'>('family')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('idle')
  const [sentCode, setSentCode] = useState('')
  const [detectedLevel, setDetectedLevel] = useState<string>('')
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (phoneStep === 'sent') {
      codeRefs.current[0]?.focus()
    }
  }, [phoneStep])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const validatePhone = (p: string): boolean => /^1\d{10}$/.test(p)

  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      setError('请输入正确的11位手机号')
      return
    }
    setError('')
    setPhoneStep('sending')
    const mockCode = '123456'
    await new Promise((r) => setTimeout(r, 1200))
    setSentCode(mockCode)
    setPhoneStep('sent')
    setCountdown(60)
  }

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(0, 1)
    setCode(newCode)
    setError('')
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text')
    if (/^\d{6}$/.test(text)) {
      const digits = text.split('')
      setCode(digits as typeof code)
      codeRefs.current[5]?.focus()
    }
  }

  const findCaregiverDemo = (p: string) => {
    const clean = p.replace(/\D/g, '')
    const cId = DEMO_CAREGIVER_PHONE_MAP[clean]
    if (cId) return mockCaregivers.find((c) => c.id === cId)
    return findCaregiverByPhone(clean, mockCaregivers)
  }

  const doLogin = (overrides?: Partial<{ id: string; phone: string; role: 'admin' | 'family' | 'caregiver' }>) => {
    const role = overrides?.role || loginRole
    const loginPhone = overrides?.phone || phone || '13800138000'
    const nameMap: Record<string, string> = { admin: '管理员', family: '张明', caregiver: '王芳' }
    let userName = nameMap[role]
    let userGender = role === 'caregiver' ? '女' : '男'
    let userAge = role === 'caregiver' ? 42 : 45
    let caregiverLevel: string | undefined
    let caregiverId: string | undefined

    const caregiver = findCaregiverDemo(loginPhone)
    if (caregiver) {
      userName = caregiver.name
      userGender = caregiver.gender
      userAge = caregiver.age
      caregiverLevel = caregiver.level
      caregiverId = caregiver.id
    }

    setUser({
      id: overrides?.id || caregiverId || 'u1',
      phone: loginPhone,
      name: userName,
      role,
      gender: userGender,
      age: userAge,
      address: '北京市海淀区',
      caregiverLevel: caregiverLevel as any,
      caregiverId,
    })
    navigate('/welcome')
  }

  const handlePhoneLogin = async () => {
    if (!validatePhone(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (ADMIN_PHONES.includes(phone)) {
      doLogin({ id: 'u_admin', phone, role: 'admin' })
      return
    }
    const caregiver = findCaregiverDemo(phone)
    if (caregiver) {
      setDetectedLevel(caregiver.level)
    }
    const codeStr = code.join('')
    if (codeStr.length !== 6) {
      setError('请输入完整的6位验证码')
      return
    }
    if (codeStr !== sentCode) {
      setError('验证码错误，请重新输入')
      return
    }
    setError('')
    setPhoneStep('verifying')
    await new Promise((r) => setTimeout(r, 1500))
    setPhoneStep('success')
    await new Promise((r) => setTimeout(r, 600))
    doLogin()
  }

  const handlePasswordLogin = () => {
    if (ADMIN_PHONES.includes(account) && password === SPECIAL_PASSWORD) {
      doLogin({ id: 'u_admin', phone: account, role: 'admin' })
      return
    }
    const caregiver = findCaregiverDemo(account)
    if (caregiver) {
      doLogin({ id: caregiver.id, phone: account, role: 'caregiver' })
      return
    }
    if (!account || !password) {
      setError('请输入账号和密码')
      return
    }
    doLogin({ phone: account })
  }

  const handleWeChatScan = () => {
    setQrScanned(false)
    setShowWeChat(true)
    setTimeout(() => setQrScanned(true), 2500)
  }

  const handleWeChatConfirm = () => {
    setShowWeChat(false)
    doLogin({ id: 'u_wechat', phone: '13800138001' })
  }

  const handleResend = () => {
    if (countdown > 0) return
    handleSendCode()
  }

  const handleResetPhone = () => {
    setPhone('')
    setCode(['', '', '', '', '', ''])
    setSentCode('')
    setPhoneStep('idle')
    setCountdown(0)
    setError('')
    setDetectedLevel('')
  }

  return (
    <>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(46,125,50,0.06)' }} />
        <div style={{ position: 'absolute', bottom: 80, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(76,175,80,0.06)' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', maxWidth: 400, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(46,125,50,0.25)',
            }}>
              <span style={{ fontSize: 36 }}>🍃</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 6, letterSpacing: 2 }}>银发安康</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>老年及残障人士养护追踪平台</p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 3 }}>
            {(['phone', 'password'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); if (m === 'phone') handleResetPhone() }} style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--color-primary)' : 'transparent',
                color: mode === m ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 600, fontSize: 14, transition: 'all 0.25s',
              }}>
                {m === 'phone' ? '📱 手机验证码' : '🔑 账号密码'}
              </button>
            ))}
          </div>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--color-bg)', borderRadius: 8, padding: 3 }}>
            {(['family', 'caregiver', 'admin'] as const).map((r) => (
              <button key={r} onClick={() => setLoginRole(r)} style={{
                flex: 1, padding: '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: loginRole === r ? 'var(--color-primary)' : 'transparent',
                color: loginRole === r ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 500, fontSize: 12, transition: 'all 0.2s',
              }}>
                {r === 'family' ? '👤 家属' : r === 'caregiver' ? '👩‍⚕️ 护工' : '🔧 管理员'}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              color: 'var(--color-danger)', fontSize: 14, marginBottom: 12,
              textAlign: 'center', background: '#FFEBEE', padding: '8px 12px',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* ─── Phone Login ─── */}
          {mode === 'phone' && (
            <>
              {/* Phone Input */}
              {phoneStep !== 'success' && (
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">手机号</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      padding: '11px 8px', background: 'var(--color-bg)',
                      borderRadius: 8, fontSize: 14, color: 'var(--color-text-secondary)',
                      fontWeight: 500, whiteSpace: 'nowrap',
                    }}>
                      +86
                    </div>
                    <input
                      className="form-input"
                      type="tel"
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 11); setPhone(v); setError('') }}
                      maxLength={11}
                      disabled={phoneStep === 'sending' || phoneStep === 'verifying'}
                      style={{ flex: 1, minHeight: 48 }}
                    />
                  </div>
                </div>
              )}

              {/* Step: Send Code Button */}
              {(phoneStep === 'idle' || phoneStep === 'sending') && (
                <Button
                  variant="primary"
                  size="lg"
                  block
                  loading={phoneStep === 'sending'}
                  disabled={phoneStep === 'sending' || !validatePhone(phone)}
                  onClick={handleSendCode}
                >
                  {phoneStep === 'sending' ? '发送中...' : '获取验证码'}
                </Button>
              )}

              {/* Step: Code Input */}
              {(phoneStep === 'sent' || phoneStep === 'verifying' || phoneStep === 'success' || detectedLevel) && (
                <>
                  {/* Code Input Grid */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>验证码</label>
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        验证码已发送至 {phone.slice(0, 3)}****{phone.slice(7)}
                      </span>
                    </div>
                    {detectedLevel && (
                      <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 13, color: 'var(--color-primary-dark)', background: '#E8F5E9', padding: '4px 10px', borderRadius: 6, display: 'inline-block', width: '100%' }}>
                        🏅 检测到护工账号：{detectedLevel}
                      </div>
                    )}
                    <div
                      style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
                      onPaste={handleCodePaste}
                    >
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { codeRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeInput(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          disabled={phoneStep === 'verifying' || phoneStep === 'success'}
                          style={{
                            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 600,
                            border: `2px solid ${digit ? 'var(--color-primary)' : error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                            borderRadius: 10, outline: 'none', background: digit ? '#E8F5E9' : 'white',
                            transition: 'all 0.15s', caretColor: 'var(--color-primary)',
                            color: 'var(--color-text)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend & Edit Phone */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                    <button onClick={handleResetPhone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                      ← 更换手机号
                    </button>
                    <div>
                      {countdown > 0 ? (
                        <span style={{ color: 'var(--color-text-light)' }}>{countdown}s 后重新发送</span>
                      ) : (
                        <button onClick={handleResend} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 500 }}>
                          重新发送
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    block
                    loading={phoneStep === 'verifying'}
                    disabled={code.some((d) => d === '') || phoneStep === 'verifying' || phoneStep === 'success'}
                    onClick={handlePhoneLogin}
                    style={{
                      background: phoneStep === 'success' ? 'var(--color-success)' : undefined,
                      transition: 'all 0.3s',
                    }}
                  >
                    {phoneStep === 'verifying' ? '验证中...' : phoneStep === 'success' ? '✅ 登录成功' : '登录'}
                  </Button>
                </>
              )}
            </>
          )}

          {/* ─── Password Login ─── */}
          {mode === 'password' && (
            <>
              <Input label="账号" type="text" placeholder="请输入账号/手机号" value={account} onChange={(e) => { setAccount(e.target.value); setError('') }} />
              <Input label="密码" type="password" placeholder="请输入密码" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input type="checkbox" defaultChecked /> 记住密码
                </label>
                <a href="#" style={{ color: 'var(--color-primary)' }}>忘记密码？</a>
              </div>
              <Button variant="primary" size="lg" block onClick={handlePasswordLogin}>
                登录
              </Button>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#E8F5E9', borderRadius: 8, fontSize: 12, color: 'var(--color-primary-dark)', lineHeight: 1.6 }}>
                  <strong>💡 测试账号：</strong><br />
                 管理员：13120205283 / 13120505283<br />
                 密码统一：#ydx1986312#<br />
                 护工：13800138001~13800138005<br />
                 任意角色：输入任意账号密码即可
              </div>
            </>
          )}

          {/* ─── Social Login ─── */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>其他登录方式</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
              <button onClick={handleWeChatScan} style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #07C160, #06AD56)',
                color: 'white', fontSize: 22, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(7,193,96,0.3)',
              }}>
                信
              </button>
              <button onClick={() => { setMode('phone'); handleResetPhone() }} style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1976D2, #1565C0)',
                color: 'white', fontSize: 22, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
              }}>
                📞
              </button>
            </div>
          </div>

          {/* Agreement */}
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--color-text-light)' }}>
            登录即表示同意 <a href="#" style={{ color: 'var(--color-primary)' }}>《服务协议》</a>
            {' '}和{' '}
            <a href="#" style={{ color: 'var(--color-primary)' }}>《隐私政策》</a>
          </p>
        </div>
      </div>

      {/* WeChat QR Modal */}
      {showWeChat && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.25s ease',
        }} onClick={() => setShowWeChat(false)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            maxWidth: 340, width: '100%', textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>微信扫码登录</div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              请使用微信扫一扫登录
            </p>
            <div style={{
              width: 200, height: 200, margin: '0 auto 16px',
              background: qrScanned ? 'var(--color-bg)' : '#F5F5F5',
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative',
              border: '2px solid var(--color-border)',
            }}>
              {qrScanned ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)' }}>扫描成功</div>
                  <Button variant="primary" size="sm" onClick={handleWeChatConfirm} style={{ marginTop: 12 }}>
                    确认登录
                  </Button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                  <div>模拟二维码加载中...</div>
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
              {qrScanned ? '请在手机上点击确认' : '二维码加载中...'}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
