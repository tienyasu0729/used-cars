import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerPaymentApi } from '@/api/customerPaymentApi'
import { usePaymentStore } from '@/stores/paymentStore'
import type { PaymentMethod } from '@/types/payment'
import type { PaymentResult } from '@/api/customerPaymentApi'

export function usePayment() {
  const navigate = useNavigate()
  const { status, carId, amount, method, setProcessing, setTransactionId, setStatus, reset } = usePaymentStore()

  const startPayment = useCallback(
    (params: { carId: string; amount: number; method: PaymentMethod }) => {
      setProcessing(params)
      navigate(`/payment/processing/${params.carId}?method=${params.method}`)
    },
    [navigate, setProcessing]
  )

  const verifyPaymentResult = useCallback(async (transactionId: string): Promise<PaymentResult> => {
    const result = await customerPaymentApi.verifyPayment(transactionId)
    setTransactionId(transactionId)
    setStatus(result.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED')
    return result
  }, [setTransactionId, setStatus])

  const getTransactionStatus = useCallback(() => {
    return { status, carId, amount, method }
  }, [status, carId, amount, method])

  return {
    startPayment,
    verifyPaymentResult,
    getTransactionStatus,
    isProcessing: status === 'PROCESSING',
    reset,
  }
}
