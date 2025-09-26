'use client'

import { useState, useRef, useCallback } from 'react'

export interface CameraStatus {
  status: 'idle' | 'requesting' | 'active' | 'error'
  error: string | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => Promise<string>
}

export const useCamera = (): CameraStatus => {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setStatus('requesting')
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setStatus('active')
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera')
      setStatus('error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setStatus('idle')
  }, [])

  const capturePhoto = useCallback(async (): Promise<string> => {
    if (!videoRef.current) {
      throw new Error('Câmera não está ativa')
    }

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Não foi possível obter contexto do canvas')
    }

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg')
  }, [])

  return {
    status,
    error,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto
  }
}