import React, { useRef, useState, useCallback, useEffect } from 'react'
import { RefreshCw, X, Check, CameraIcon } from 'lucide-react'
import { Button } from '../../../shared/components'

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void
  onCancel: () => void
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    stopStream()

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }, [facingMode, stopStream])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera()
    return () => {
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(dataUrl)
      }
    }
  }

  const handleConfirm = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then(onCapture)
    }
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <CameraIcon size={48} />
        </div>
        <p className="text-gray-900 font-semibold">{error}</p>
        <Button onClick={onCancel} variant="outline">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <span className="font-semibold">Fotografar Recibo</span>
        <button
          onClick={toggleCamera}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Capture" className="max-h-full max-w-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-h-full max-w-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-8 flex justify-center items-center space-x-12">
        {capturedImage ? (
          <>
            <Button
              onClick={() => setCapturedImage(null)}
              variant="outline"
              className="w-16 h-16 rounded-full border-white text-white hover:bg-white/10"
            >
              <RefreshCw size={28} />
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 border-none shadow-xl"
            >
              <Check size={40} />
            </Button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-white rounded-full" />
          </button>
        )}
      </div>
    </div>
  )
}
