import { useState } from 'react'
import { View, Text, Image, Input, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockHealthInfo, mockElderly } from '../../utils/mockData'
import { HealthInfo, MedicalRecord } from '../../store'
import { generateId } from '../../utils'

export default function HealthRecordsPage() {
  const [healthInfo, setHealthInfo] = useState<HealthInfo>(mockHealthInfo)
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'plan' | 'voice'>('info')
  const [editingInfo, setEditingInfo] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [recordForm, setRecordForm] = useState({ diseaseName: '', diagnosisDate: '', treatment: '', recovery: '' })

  const [elderly] = useState(() => mockElderly[0])
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
    <View className='page'>
      <View className='page-header'>
        <Text className='page-title'>健康档案</Text>
        <Text className='page-subtitle'>{elderlyName} · {elderlyInfo}</Text>
      </View>

      <View style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#F5F5F5', borderRadius: '12px', padding: 3, flexWrap: 'wrap' }}>
        {[
          { key: 'info', label: '基本信息' },
          { key: 'history', label: '病史档案' },
          { key: 'plan', label: '养护计划' },
          { key: 'voice', label: '语音录入' },
        ].map((tab) => (
          <View key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 6,
            background: activeTab === tab.key ? '#2E7D32' : 'transparent',
            color: activeTab === tab.key ? 'white' : '#616161',
            fontWeight: 500, fontSize: 13, textAlign: 'center',
          }}>
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {activeTab === 'info' && (
        <>
          <View className='card'>
            <Text className='card-title'>建档信息</Text>
            <View style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 64, height: 64, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>
                <Text>{elderly.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={{ fontWeight: 600, fontSize: 16, display: 'block' }}>{elderly.name}</Text>
                <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>{elderlyInfo}</Text>
                <Text style={{ fontSize: 13, color: '#616161', display: 'block' }}>{elderly.address}</Text>
              </View>
            </View>
          </View>

          <View className='card'>
            <Text className='card-title'>身体基本数据</Text>
            {editingInfo ? (
              <>
                <View className='form-group'>
                  <Text className='form-label'>身高(cm)</Text>
                  <Input type='number' value={healthInfo.height} onInput={(e) => setHealthInfo({ ...healthInfo, height: Number(e.detail.value) })} style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48, boxSizing: 'border-box' }} />
                </View>
                <View className='form-group'>
                  <Text className='form-label'>体重(kg)</Text>
                  <Input type='number' value={healthInfo.weight} onInput={(e) => setHealthInfo({ ...healthInfo, weight: Number(e.detail.value) })} style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48, boxSizing: 'border-box' }} />
                </View>
                <View className='form-group'>
                  <Text className='form-label'>过敏史</Text>
                  <Input value={healthInfo.allergies.join('、')} onInput={(e) => setHealthInfo({ ...healthInfo, allergies: e.detail.value.split('、') })} style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #E0E0E0', borderRadius: '8px', minHeight: 48, boxSizing: 'border-box' }} />
                </View>
                <View className='form-group'>
                  <Text className='form-label'>饮食习惯</Text>
                  <Textarea value={healthInfo.dietHabits} onInput={(e) => setHealthInfo({ ...healthInfo, dietHabits: e.detail.value })} className='form-input' style={{ minHeight: 60 }} />
                </View>
                <View style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <View onClick={handleSaveInfo} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
                    <Text>💾 保存信息</Text>
                  </View>
                  <View onClick={() => setEditingInfo(false)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 36 }}>
                    <Text>取消</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <InfoRow label="身高" value={`${healthInfo.height}cm`} />
                <InfoRow label="体重" value={`${healthInfo.weight}kg`} />
                <InfoRow label="血型" value={`${healthInfo.bloodType}型`} />
                <InfoRow label="护理等级" value={healthInfo.careLevel} />
                <InfoRow label="过敏史" value={healthInfo.allergies.join('、') || '无'} />
                <InfoRow label="饮食习惯" value={healthInfo.dietHabits} />
                <View style={{ marginTop: 8, fontSize: 12, color: '#9E9E9E' }}>
                  <Text>最后更新：{healthInfo.updatedAt}</Text>
                </View>
                <View onClick={() => setEditingInfo(true)} style={{ marginTop: 8, padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', display: 'inline-flex' }}>
                  <Text>✏️ 编辑信息</Text>
                </View>
              </>
            )}
          </View>

          <View className='card'>
            <Text className='card-title'>自理能力评估</Text>
            {(healthInfo.capabilities || []).map((cap) => (
              <View key={cap.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ width: 64, fontSize: 13, color: '#616161' }}>{cap.name}</Text>
                <View style={{ flex: 1, height: 10, background: '#F5F5F5', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{
                    width: `${(cap.score / cap.maxScore) * 100}%`, height: '100%',
                    background: cap.score >= 2 ? '#2E7D32' : cap.score >= 1 ? '#FF8F00' : '#D32F2F',
                    borderRadius: 5,
                  }} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: 500, width: 28, textAlign: 'right' }}>{cap.score}/{cap.maxScore}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {activeTab === 'history' && (
        <>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text className='section-title' style={{ marginBottom: 0 }}>病史档案</Text>
            <View onClick={() => setShowAddRecord(true)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
              <Text>+ 新增记录</Text>
            </View>
          </View>

          {showAddRecord && (
            <View className='card'>
              <Text className='card-title'>新增病史记录</Text>
              <View className='form-group'>
                <Text className='form-label'>疾病名称</Text>
                <Input value={recordForm.diseaseName} onInput={(e) => setRecordForm({ ...recordForm, diseaseName: e.detail.value })} className='form-input' />
              </View>
              <View className='form-group'>
                <Text className='form-label'>确诊时间</Text>
                <Input type='text' placeholder='YYYY-MM-DD' value={recordForm.diagnosisDate} onInput={(e) => setRecordForm({ ...recordForm, diagnosisDate: e.detail.value })} className='form-input' />
              </View>
              <View className='form-group'>
                <Text className='form-label'>治疗方案</Text>
                <Textarea className='form-input' value={recordForm.treatment} onInput={(e) => setRecordForm({ ...recordForm, treatment: e.detail.value })} style={{ minHeight: 60 }} />
              </View>
              <View className='form-group'>
                <Text className='form-label'>康复情况</Text>
                <Textarea className='form-input' value={recordForm.recovery} onInput={(e) => setRecordForm({ ...recordForm, recovery: e.detail.value })} style={{ minHeight: 60 }} />
              </View>
              <View style={{ display: 'flex', gap: 8 }}>
                <View onClick={handleAddRecord} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
                  <Text>💾 保存</Text>
                </View>
                <View onClick={() => setShowAddRecord(false)} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 36 }}>
                  <Text>取消</Text>
                </View>
              </View>
            </View>
          )}

          {healthInfo.medicalHistory.map((record) => (
            <View className='card' key={record.id}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: '50%', background: '#D32F2F' }} />
                    <Text style={{ fontSize: 16, fontWeight: 600, color: '#1B5E20' }}>{record.diseaseName}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, marginLeft: 16, display: 'block' }}>
                    确诊时间：{record.diagnosisDate} · 记录时间：{record.createdAt}
                  </Text>
                  <View style={{ marginTop: 8, marginLeft: 16, fontSize: 14, lineHeight: 1.8 }}>
                    <Text style={{ display: 'block' }}><Text style={{ color: '#9E9E9E', fontSize: 13 }}>治疗方案：</Text>{record.treatment}</Text>
                    <Text style={{ display: 'block' }}><Text style={{ color: '#9E9E9E', fontSize: 13 }}>康复情况：</Text>{record.recovery}</Text>
                  </View>
                </View>
              </View>
              <View style={{ display: 'flex', gap: 6, marginTop: 10, marginLeft: 16 }}>
                <Text className='tag tag-info'>📎 附件</Text>
                <Text className='tag tag-primary'>✏️ 编辑</Text>
                <Text className='tag tag-danger' onClick={() => handleDeleteRecord(record.id)}>🗑️ 删除</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {activeTab === 'plan' && (
        <>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text className='section-title' style={{ marginBottom: 0 }}>养护计划</Text>
            <View style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
              <Text>+ 新增计划</Text>
            </View>
          </View>

          {(healthInfo.carePlan || []).map((plan) => (
            <View className='card' key={plan.id}>
              <View style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: plan.type === 'medication' ? '#E3F2FD' : plan.type === 'training' ? '#E8F5E9' : plan.type === 'diet' ? '#FFF3E0' : '#F3E5F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  <Text>{plan.type === 'medication' ? '💊' : plan.type === 'training' ? '🏃' : plan.type === 'diet' ? '🍚' : '😴'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 600, fontSize: 15 }}>{plan.title}</Text>
                    <Text className='tag tag-primary' style={{ fontSize: 11 }}>{plan.status === 'active' ? '执行中' : '已完成'}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#616161', marginTop: 4, display: 'block' }}>{plan.description}</Text>
                  <Text style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2, display: 'block' }}>⏰ 执行时间：{plan.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {activeTab === 'voice' && (
        <View className='card'>
          <Text className='card-title'>语音录入</Text>
          <View style={{ textAlign: 'center', padding: '16px 0' }}>
            <View onClick={() => setIsRecording(!isRecording)} style={{
              width: 80, height: 80, borderRadius: '50%',
              background: isRecording ? 'linear-gradient(135deg, #D32F2F, #C62828)' : 'linear-gradient(135deg, #2E7D32, #4CAF50)',
              color: 'white', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', boxShadow: isRecording ? '0 4px 16px rgba(211,47,47,0.4)' : '0 4px 12px rgba(46,125,50,0.3)',
            }}>
              <Text>🎤</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#616161', marginBottom: 8, display: 'block' }}>
              {isRecording ? '🎙️ 正在录音，请清晰说出养护信息...' : '点击麦克风开始语音录入'}
            </Text>
          </View>

          <View className='form-group'>
            <Text className='form-label'>识别结果</Text>
            <Textarea
              className='form-input'
              placeholder='语音识别结果将显示在这里，您也可以手动输入...'
              value={voiceText}
              onInput={(e) => setVoiceText(e.detail.value)}
              style={{ minHeight: 100 }}
            />
          </View>

          <View style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', background: '#2E7D32', color: 'white', minHeight: 36 }}>
              <Text>💾 保存到健康档案</Text>
            </View>
            <View style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '2px solid #2E7D32', color: '#2E7D32', minHeight: 36 }}>
              <Text>🎤 重新录音</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E0E0E0', fontSize: 14 }}>
    <Text style={{ color: '#616161' }}>{label}</Text>
    <Text style={{ fontWeight: 500 }}>{value}</Text>
  </View>
)
