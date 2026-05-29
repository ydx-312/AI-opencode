import React, { useState } from 'react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Avatar } from '../../components/common/Avatar'
import { ImageUpload } from '../../components/common/ImageUpload'
import { mockHealthInfo, mockElderly } from '../../utils/mockData'
import { HealthInfo, MedicalRecord } from '../../store'
import { generateId } from '../../utils'

export const HealthRecordsPage: React.FC = () => {
  const [healthInfo, setHealthInfo] = useState<HealthInfo>(mockHealthInfo)
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'plan' | 'voice'>('info')
  const [editingInfo, setEditingInfo] = useState(false)
  const [editingRecord, setEditingRecord] = useState<string | null>(null)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordForm, setRecordForm] = useState({ diseaseName: '', diagnosisDate: '', treatment: '', recovery: '' })

  const [elderly] = useState(() => mockElderly[0])
  const [elderlyPhotos, setElderlyPhotos] = useState<string[]>([])
  const elderlyName = elderly.name
  const elderlyInfo = `${elderly.age}岁 · ${elderly.gender} · ${elderly.careLevel}`

  const handleSaveInfo = () => {
    setEditingInfo(false)
    setHealthInfo({ ...healthInfo, updatedAt: new Date().toISOString().slice(0, 10) })
  }

  const handleAddRecord = () => {
    const newRecord: MedicalRecord = {
      id: generateId(),
      ...recordForm,
      attachments: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setHealthInfo({
      ...healthInfo,
      medicalHistory: [...healthInfo.medicalHistory, newRecord],
    })
    setShowAddRecord(false)
    setRecordForm({ diseaseName: '', diagnosisDate: '', treatment: '', recovery: '' })
  }

  const handleDeleteRecord = (id: string) => {
    setHealthInfo({
      ...healthInfo,
      medicalHistory: healthInfo.medicalHistory.filter((r) => r.id !== id),
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">健康档案</h1>
        <p className="page-subtitle">{elderlyName} · {elderlyInfo}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 3, flexWrap: 'wrap' }}>
        {[
          { key: 'info', label: '基本信息' },
          { key: 'history', label: '病史档案' },
          { key: 'plan', label: '养护计划' },
          { key: 'voice', label: '语音录入' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
            color: activeTab === tab.key ? 'white' : 'var(--color-text-secondary)',
            fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Basic Info */}
      {activeTab === 'info' && (
        <>
          <Card title="建档信息">
            {/* Avatar & Photos */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <Avatar name={elderly.name} size={64} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{elderly.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{elderlyInfo}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{elderly.address}</div>
              </div>
            </div>
            {editingInfo && (
              <div style={{ marginBottom: 16 }}>
                <ImageUpload images={elderlyPhotos} onImagesChange={setElderlyPhotos} max={6} label="生活照片/场景照片" shape="square" size={72} />
              </div>
            )}
          </Card>

          <Card title="身体基本数据">
            {editingInfo ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input label="身高(cm)" type="number" value={healthInfo.height} onChange={(e) => setHealthInfo({ ...healthInfo, height: Number(e.target.value) })} />
                  <Input label="体重(kg)" type="number" value={healthInfo.weight} onChange={(e) => setHealthInfo({ ...healthInfo, weight: Number(e.target.value) })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">年龄</label>
                    <input className="form-input" type="number" value={elderly.age} readOnly style={{ background: '#F5F5F5' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">性别</label>
                    <select className="form-input" value={elderly.gender} style={{ background: '#F5F5F5' }}>
                      <option>男</option>
                      <option>女</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">血型</label>
                    <select className="form-input" value={healthInfo.bloodType} onChange={(e) => setHealthInfo({ ...healthInfo, bloodType: e.target.value })}>
                      <option value="A">A型</option>
                      <option value="B">B型</option>
                      <option value="AB">AB型</option>
                      <option value="O">O型</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">护理等级</label>
                    <select className="form-input" value={healthInfo.careLevel} onChange={(e) => setHealthInfo({ ...healthInfo, careLevel: e.target.value })}>
                      <option value="完全自理">完全自理</option>
                      <option value="半失能">半失能</option>
                      <option value="全失能">全失能</option>
                    </select>
                  </div>
                </div>
                <Input label="过敏史" value={healthInfo.allergies.join('、')} onChange={(e) => setHealthInfo({ ...healthInfo, allergies: e.target.value.split('、') })} />
                <textarea className="form-input" rows={2} value={healthInfo.dietHabits} onChange={(e) => setHealthInfo({ ...healthInfo, dietHabits: e.target.value })} style={{ marginTop: 12 }} placeholder="饮食习惯" />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button variant="primary" size="sm" onClick={handleSaveInfo}>💾 保存信息</Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingInfo(false)}>取消</Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <InfoRow label="年龄" value={`${elderly.age}岁`} />
                  <InfoRow label="性别" value={elderly.gender} />
                  <InfoRow label="身高" value={`${healthInfo.height}cm`} />
                  <InfoRow label="体重" value={`${healthInfo.weight}kg`} />
                  <InfoRow label="血型" value={`${healthInfo.bloodType}型`} />
                  <InfoRow label="护理等级" value={healthInfo.careLevel} />
                </div>
                <InfoRow label="过敏史" value={healthInfo.allergies.join('、') || '无'} />
                <InfoRow label="饮食习惯" value={healthInfo.dietHabits} />
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-light)' }}>
                  最后更新：{healthInfo.updatedAt}
                </div>
                <Button variant="secondary" size="sm" onClick={() => setEditingInfo(true)} style={{ marginTop: 8 }}>
                  ✏️ 编辑信息
                </Button>
              </>
            )}
          </Card>

          <Card title="自理能力评估">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(healthInfo.capabilities || []).map((cap) => (
                <div key={cap.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 64, fontSize: 13, color: 'var(--color-text-secondary)' }}>{cap.name}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--color-bg)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(cap.score / cap.maxScore) * 100}%`, height: '100%',
                      background: cap.score >= 2 ? 'var(--color-primary)' : cap.score >= 1 ? 'var(--color-secondary)' : 'var(--color-danger)',
                      borderRadius: 5, transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, width: 28, textAlign: 'right' }}>{cap.score}/{cap.maxScore}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Tab: Medical History */}
      {activeTab === 'history' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>病史档案</h3>
            <Button variant="primary" size="sm" onClick={() => setShowAddRecord(true)}>+ 新增记录</Button>
          </div>

          {showAddRecord && (
            <Card>
              <div className="card-title">新增病史记录</div>
              <Input label="疾病名称" value={recordForm.diseaseName} onChange={(e) => setRecordForm({ ...recordForm, diseaseName: e.target.value })} />
              <Input label="确诊时间" type="date" value={recordForm.diagnosisDate} onChange={(e) => setRecordForm({ ...recordForm, diagnosisDate: e.target.value })} />
              <div className="form-group">
                <label className="form-label">治疗方案</label>
                <textarea className="form-input" rows={2} value={recordForm.treatment} onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">康复情况</label>
                <textarea className="form-input" rows={2} value={recordForm.recovery} onChange={(e) => setRecordForm({ ...recordForm, recovery: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">附件上传</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2px dashed var(--color-border)', cursor: 'pointer' }}>📎</div>
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2px dashed var(--color-border)', cursor: 'pointer' }}>📷</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="sm" onClick={handleAddRecord}>💾 保存</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAddRecord(false)}>取消</Button>
              </div>
            </Card>
          )}

          {healthInfo.medicalHistory.map((record) => (
            <Card key={record.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary-dark)' }}>{record.diseaseName}</h4>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, marginLeft: 16 }}>
                    确诊时间：{record.diagnosisDate} · 记录时间：{record.createdAt}
                  </div>
                  <div style={{ marginTop: 8, marginLeft: 16, fontSize: 14, lineHeight: 1.8 }}>
                    <div><span style={{ color: 'var(--color-text-light)', fontSize: 13 }}>治疗方案：</span>{record.treatment}</div>
                    <div><span style={{ color: 'var(--color-text-light)', fontSize: 13 }}>康复情况：</span>{record.recovery}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, marginLeft: 16 }}>
                <span className="tag tag-info" style={{ cursor: 'pointer' }}>📎 附件</span>
                <span className="tag tag-primary" style={{ cursor: 'pointer' }}>✏️ 编辑</span>
                <span className="tag tag-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteRecord(record.id)}>🗑️ 删除</span>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Tab: Care Plan */}
      {activeTab === 'plan' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>养护计划</h3>
            <Button variant="primary" size="sm">+ 新增计划</Button>
          </div>

          {(healthInfo.carePlan || []).map((plan) => (
            <Card key={plan.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: plan.type === 'medication' ? '#E3F2FD' : plan.type === 'training' ? '#E8F5E9' : plan.type === 'diet' ? '#FFF3E0' : '#F3E5F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {plan.type === 'medication' ? '💊' : plan.type === 'training' ? '🏃' : plan.type === 'diet' ? '🍚' : '😴'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{plan.title}</span>
                    <span className="tag tag-primary" style={{ fontSize: 11 }}>{plan.status === 'active' ? '执行中' : '已完成'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{plan.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>⏰ 执行时间：{plan.time}</div>
                </div>
              </div>
            </Card>
          ))}

          <Card title="日常记录">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DailyRecordItem date="2026-05-26" items={[
                { label: '早餐', value: '小米粥+水煮蛋 ✓', done: true },
                { label: '用药', value: '硝苯地平 30mg 08:00 ✓', done: true },
                { label: '训练', value: '下肢康复训练30分钟 ✓', done: true },
              ]} />
              <DailyRecordItem date="2026-05-25" items={[
                { label: '早餐', value: '豆浆+包子 ✓', done: true },
                { label: '用药', value: '硝苯地平 30mg 08:00 ✓', done: true },
                { label: '训练', value: '下肢康复训练30分钟 ✓', done: true },
              ]} />
            </div>
          </Card>
        </>
      )}

      {/* Tab: Voice Input */}
      {activeTab === 'voice' && (
        <Card title="语音录入">
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button
              onClick={() => setIsRecording(!isRecording)}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: isRecording ? 'linear-gradient(135deg, #D32F2F, #C62828)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                color: 'white', fontSize: 32, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', boxShadow: isRecording ? '0 4px 16px rgba(211,47,47,0.4)' : '0 4px 12px rgba(46,125,50,0.3)',
                transition: 'all 0.3s',
              }}
            >
              🎤
            </button>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              {isRecording ? '🎙️ 正在录音，请清晰说出养护信息...' : '点击麦克风开始语音录入'}
            </p>
            {isRecording && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 8 }}>
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} style={{
                    width: 4, height: `${12 + Math.random() * 20}px`,
                    background: 'var(--color-primary)', borderRadius: 3,
                    animation: `waveAnim ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                  }} />
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">识别结果</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="语音识别结果将显示在这里，您也可以手动输入..."
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm">💾 保存到健康档案</Button>
            <Button variant="secondary" size="sm">🎤 重新录音</Button>
            <Button variant="secondary" size="sm">📋 转为病史记录</Button>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: '#FFF3E0', borderRadius: 10, fontSize: 13, color: 'var(--color-secondary)' }}>
            <strong>💡 使用提示：</strong><br />
            · 支持普通话及多种方言识别<br />
            · 录音内容将转为文字保存至健康档案<br />
            · 原始语音同步留存，可回放查看<br />
            · 适合老年用户及操作不便者使用
          </div>
        </Card>
      )}

      <style>{`
        @keyframes waveAnim {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
    <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
)

const DailyRecordItem: React.FC<{ date: string; items: { label: string; value: string; done: boolean }[] }> = ({ date, items }) => (
  <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 12 }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: 6 }}>{date}</div>
    {items.map((item, i) => (
      <div key={i} style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
        {item.done ? '✅' : '⬜'} {item.label}：{item.value}
      </div>
    ))}
  </div>
)
