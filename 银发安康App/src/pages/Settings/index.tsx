import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useAppStore } from '../../store'

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { fontSizeScale, setFontSizeScale } = useAppStore()

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: '8px 0', color: 'var(--color-text)' }}>
        ‹ 返回
      </button>

      <div className="page-header">
        <h1 className="page-title">系统设置</h1>
      </div>

      <Card title="显示设置">
        <div style={{ marginBottom: 12 }}>
          <div className="form-label">字体大小</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14 }}>小</span>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={fontSizeScale}
              onChange={(e) => setFontSizeScale(parseFloat(e.target.value))}
              style={{ flex: 1, height: 6, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: 20 }}>大</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--color-text-light)' }}>
            当前：{Math.round(fontSizeScale * 100)}%
          </div>
        </div>
      </Card>

      <Card title="通知设置">
        <SettingRow label="消息通知" defaultChecked />
        <SettingRow label="护理提醒" defaultChecked />
        <SettingRow label="系统公告" defaultChecked />
        <SettingRow label="声音提醒" defaultChecked />
      </Card>

      <Card title="安全设置">
        <SettingRow label="修改密码" />
        <SettingRow label="手机号绑定" rightText="138****8000" />
        <SettingRow label="登录设备管理" />
      </Card>

      <Card title="关于">
        <SettingRow label="版本号" rightText="v1.0.0" />
        <SettingRow label="用户协议" />
        <SettingRow label="隐私政策" />
      </Card>
    </div>
  )
}

const SettingRow: React.FC<{ label: string; defaultChecked?: boolean; rightText?: string | number }> = ({ label, defaultChecked, rightText }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
    <span style={{ fontSize: 15 }}>{label}</span>
    {rightText !== undefined ? (
      <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{rightText}</span>
    ) : defaultChecked !== undefined ? (
      <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 28, cursor: 'pointer' }}>
        <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: 'absolute', inset: 0, backgroundColor: defaultChecked ? 'var(--color-primary)' : '#ccc',
          borderRadius: 28, transition: '0.3s',
        }}>
          <span style={{
            position: 'absolute', left: defaultChecked ? 22 : 3, top: 3,
            width: 22, height: 22, borderRadius: '50%', background: 'white',
            transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </span>
      </label>
    ) : (
      <span style={{ fontSize: 18, color: 'var(--color-text-light)' }}>›</span>
    )}
  </div>
)
