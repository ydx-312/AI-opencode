import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'

const QUOTES = [
  '老吾老以及人之老',
  '岁月不败温情，陪伴是最长情的告白',
  '每一份守护，都值得被看见',
  '用心守护，让爱传递',
  '银发安康，与您同行',
]

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
  size: 14 + Math.random() * 20,
  opacity: 0.15 + Math.random() * 0.25,
}))

const EMOJIS = ['🍃', '🌿', '☘️', '🍀', '🌱', '💚', '✨', '🌸']

export default function WelcomePage() {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)
  const loadMockData = useAppStore((s) => s.loadMockData)

  useEffect(() => {
    loadMockData()
  }, [loadMockData])

  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 50)
      return
    }
    const timer = setTimeout(() => {
      if (useAppStore.getState().isLoggedIn) {
        Taro.switchTab({ url: '/pages/home/index' })
      } else {
        Taro.redirectTo({ url: '/pages/login/index' })
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [isLoggedIn])

  return (
    <View style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #4CAF50 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {PARTICLES.map((p) => (
        <View key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: -40,
          fontSize: p.size,
          opacity: 0,
          color: 'rgba(255,255,255,0.3)',
        }}>
          <Text>{EMOJIS[p.id % 8]}</Text>
        </View>
      ))}
    </View>
  )
}
