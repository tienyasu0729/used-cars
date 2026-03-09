import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Card, Button } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { CheckCircle, Camera } from 'lucide-react'

export function QrScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'qr-reader'

  const startScan = async () => {
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const appointmentId = decodedText.split('/').pop() || decodedText
        verifyQr(appointmentId)
        scanner.stop().then(() => {
          setScanning(false)
          scannerRef.current = null
        })
      },
      () => {}
    )
    setScanning(true)
  }

  const stopScan = () => {
    scannerRef.current?.stop().then(() => {
      setScanning(false)
      scannerRef.current = null
    })
  }

  const verifyQr = async (appointmentId: string) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await showroomApi.verifyQrCode(appointmentId)
      setResult({ success: res.success, message: res.message })
    } catch {
      setResult({ success: false, message: 'Lỗi xác minh' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quét QR</h1>

      <Card className="p-6">
        <div id={containerId} className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden" />
        {!scanning && (
          <div className="mt-4">
            <Button variant="primary" className="w-full" onClick={startScan} disabled={loading}>
              <Camera className="w-5 h-5 mr-2 inline" />
              Mở Camera Quét QR
            </Button>
          </div>
        )}
        {scanning && (
          <Button variant="outline" className="w-full mt-4" onClick={stopScan}>
            Dừng quét
          </Button>
        )}
      </Card>

      {result && (
        <Card className={`p-6 mt-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <span className="text-red-500">!</span>
            )}
            <div>
              <p className="font-medium">{result.success ? 'Xác minh thành công' : 'Lỗi'}</p>
              <p className="text-sm text-gray-600">{result.message}</p>
              {result.success && (
                <ul className="mt-2 text-sm text-gray-700">
                  <li>• Customer verified</li>
                  <li>• SCUDN lead recorded</li>
                  <li>• Customer rescue package activated</li>
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
