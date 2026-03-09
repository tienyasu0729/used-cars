import type { Transaction } from '@/types'
import { mockTransactions } from '@/mock/mockTransactions'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const transactionsApi = {
  async getTransactions(): Promise<Transaction[]> {
    await delay(300)
    return [...mockTransactions]
  },
}
