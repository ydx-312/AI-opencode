import { View, Text, Input, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'

export default function SettingsPage() {
  const { fontSizeScale, setFontSizeScale } = useAppStore()

  return (
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>系统设置</Text>
      </View>

      <View className='card'>
        <Text className='card-title'>显示设置</Text>
        <View style={{ marginBottom: 12 }}>
          <Text className='form-label'>字体大小</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 14 }}>小</Text>
            <Input
              type='number'
              value={String(fontSizeScale)}
              onInput={(e) => setFontSizeScale(parseFloat(e.detail.value) || 1)}
              style={{ flex: 1, height: 40, padding: '0 10px', border: '1px solid #E0E0E0', borderRadius: 8, textAlign: 'center' }}
            />
            <Text style={{ fontSize: 20 }}>大</Text>
          </View>
          <View style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#9E9E9E' }}>
            <Text>当前：{Math.round(fontSizeScale * 100)}%</Text>
          </View>
        </View>
      </View>

      <View className='card'>
        <Text className='card-title'>通知设置</Text>
        <SettingRow label='消息通知' defaultChecked />
        <SettingRow label='护理提醒' defaultChecked />
        <SettingRow label='系统公告' defaultChecked />
        <SettingRow label='声音提醒' defaultChecked />
      </View>

      <View className='card'>
        <Text className='card-title'>安全设置</Text>
        <SettingRow label='修改密码' />
        <SettingRow label='手机号绑定' rightText='138****8000' />
        <SettingRow label='登录设备管理' />
      </View>

      <View className='card'>
        <Text className='card-title'>关于</Text>
        <SettingRow label='版本号' rightText='v1.0.0' />
        <SettingRow label='用户协议' />
        <SettingRow label='隐私政策' />
      </View>
    </View>
  )
}

const SettingRow: React.FC<{ label: string; defaultChecked?: boolean; rightText?: string | number }> = ({ label, defaultChecked, rightText }) => (
  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E0E0E0' }}>
    <Text style={{ fontSize: 15 }}>{label}</Text>
    {rightText !== undefined ? (
      <Text style={{ fontSize: 14, color: '#616161' }}>{rightText}</Text>
    ) : defaultChecked !== undefined ? (
      <Switch checked={defaultChecked} color='#2E7D32' />
    ) : (
      <Text style={{ fontSize: 18, color: '#9E9E9E' }}>›</Text>
    )}
  </View>
)
