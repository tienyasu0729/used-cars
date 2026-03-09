import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentStatus, PaymentMethod } from '@/types/payment'

interface PaymentState {
  transactionId: string | null
  carId: string | null
  amount: number | null
  status: PaymentStatus
  method: PaymentMethod | null
  setProcessing: (params: { carId: string; amount: number; method: PaymentMethod }) => void
  setTransactionId: (id: string) => void
  setStatus: (status: PaymentStatus) => void
  reset: () => void
}

const initialState = {
  transactionId: null,
  carId: null,
  amount: null,
  status: 'INIT' as PaymentStatus,
  method: null,
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      ...initialState,
      setProcessing: ({ carId, amount, method }) =>
        set({ carId, amount, method, status: 'PROCESSING' }),
      setTransactionId: (transactionId) => set({ transactionId }),
      setStatus: (status) => set({ status }),
      reset: () => set(initialState),
    }),
    { name: 'scudn-payment', partialize: (s) => ({ ...s }) }
  )
)
