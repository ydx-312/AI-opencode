import { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'
import { mockCaregivers } from '../../utils/mockData'

const ADMIN_PHONE = '13120505283'
const CAREGIVER_PHONE = '13100000000'
const ADMIN_PASSWORD = '#ydx1986312#'

function goHome() {
  setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 50)
}

export default function LoginPage() {
  const setUser = useAppStore((s) => s.setUser)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的11位手机号')
      return
    }
    if (phone === ADMIN_PHONE) {
      if (password !== ADMIN_PASSWORD) {
        setError('密码错误')
        return
      }
      setUser({ id: 'u_admin', phone, name: '管理员', role: 'admin', gender: '男', age: 45, address: '北京市' })
      goHome()
      return
    }
    if (phone === CAREGIVER_PHONE) {
      const cg = mockCaregivers[0]
      setUser({
        id: cg.id, phone, name: cg.name, role: 'caregiver',
        gender: cg.gender, age: cg.age, address: '北京市',
        caregiverLevel: cg.level, caregiverId: cg.id,
      })
      goHome()
      return
    }
    setError('手机号未注册，请联系管理员')
  }

  return (
    <View style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', background: 'linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%)' }}>
      <View style={{ textAlign: 'center', marginBottom: 40 }}>
        <View style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(46,125,50,0.25)' }}>
          <Text style={{ fontSize: 36 }}>🍃</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: 700, color: '#1B5E20', display: 'block' }}>银发安康</Text>
        <Text style={{ fontSize: 14, color: '#616161', marginTop: 6, display: 'block' }}>老年及残障人士养护追踪平台</Text>
      </View>

      {error && (
        <View style={{ color: '#D32F2F', fontSize: 14, marginBottom: 12, textAlign: 'center', background: '#FFEBEE', padding: '8px 12px', borderRadius: 8 }}>
          <Text>{error}</Text>
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: 500, color: '#212121', marginBottom: 8, display: 'block' }}>手机号</Text>
        <Input
          type='number' maxlength={11} placeholder='请输入手机号'
          value={phone}
          onInput={(e) => { setPhone(e.detail.value.replace(/\D/g, '').slice(0, 11)); setError('') }}
          style={{ width: '100%', padding: '14px 16px', fontSize: 18, border: '2px solid #E0E0E0', borderRadius: 10, background: '#fff', minHeight: 50, boxSizing: 'border-box' }}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 15, fontWeight: 500, color: '#212121', marginBottom: 8, display: 'block' }}>密码</Text>
        <Input
          password placeholder='请输入密码'
          value={password}
          onInput={(e) => { setPassword(e.detail.value); setError('') }}
          style={{ width: '100%', padding: '14px 16px', fontSize: 18, border: '2px solid #E0E0E0', borderRadius: 10, background: '#fff', minHeight: 50, boxSizing: 'border-box' }}
        />
      </View>

      <View onClick={handleLogin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px', fontSize: 20, fontWeight: 600, borderRadius: 10, background: '#2E7D32', color: 'white', minHeight: 54 }}>
        <Text>登 录</Text>
      </View>

      <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#9E9E9E', display: 'block' }}>
        登录即表示同意《服务协议》和《隐私政策》
      </Text>
    </View>
  )
}
