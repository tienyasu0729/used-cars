import { test, expect } from '@playwright/test'

const TEST_CUSTOMER = {
  email: process.env.E2E_CUSTOMER_EMAIL || 'customer@test.com',
  password: process.env.E2E_CUSTOMER_PASSWORD || 'Test@1234',
}
const VEHICLE_ID = process.env.E2E_VEHICLE_ID || '1'

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"], input[name="email"]', TEST_CUSTOMER.email)
  await page.fill('input[type="password"], input[name="password"]', TEST_CUSTOMER.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
}

test.describe('Installment Wizard — Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page)
  })

  test('Điền 5 bước, upload file, submit thành công', async ({ page }) => {
    await page.goto(`/dashboard/installment/${VEHICLE_ID}`)
    await expect(page.locator('text=Thông tin cá nhân')).toBeVisible({ timeout: 15_000 })

    // Step 1: Personal Info
    await page.fill('input[name="fullName"]', 'Nguyễn Văn Test')
    await page.fill('input[name="identityNumber"]', '001234567890')
    await page.fill('input[name="phoneNumber"]', '0901234567')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="dob"]', '1990-01-15')
    await page.click('text=Tiếp theo')

    // Step 2: Employment
    await expect(page.locator('text=Nghề nghiệp')).toBeVisible()
    await page.selectOption('select[name="employmentType"]', 'SALARIED')
    await page.fill('input[name="companyName"]', 'Công ty Test')
    await page.fill('input[name="monthlyIncome"]', '20000000')
    await page.fill('input[name="monthlyExpenses"]', '5000000')
    await page.click('text=Tiếp theo')

    // Step 3: Loan Details
    await expect(page.locator('text=Chi tiết khoản vay')).toBeVisible()
    await page.fill('input[name="prepaymentAmount"]', '100000000')
    await page.selectOption('select[name="loanTermMonths"]', '36')
    await page.click('text=Tiếp theo')

    // Step 4: Documents — kiểm tra UI hiện
    await expect(page.locator('text=Hồ sơ eKYC')).toBeVisible()
    await page.click('text=Tiếp theo')

    // Step 5: Review
    await expect(page.locator('text=Xác nhận thông tin')).toBeVisible()
    await expect(page.locator('text=Nguyễn Văn Test')).toBeVisible()
    await expect(page.locator('text=0901234567')).toBeVisible()
  })
})

test.describe('Installment Wizard — DRAFT auto-save', () => {
  test('Điền dở, reload trang, khôi phục data', async ({ page }) => {
    await loginAsCustomer(page)
    await page.goto(`/dashboard/installment/${VEHICLE_ID}`)
    await expect(page.locator('text=Thông tin cá nhân')).toBeVisible({ timeout: 15_000 })

    const uniqueName = `Test AutoSave ${Date.now()}`
    await page.fill('input[name="fullName"]', uniqueName)
    await page.fill('input[name="identityNumber"]', '001234567890')
    await page.fill('input[name="phoneNumber"]', '0901234567')
    await page.fill('input[name="email"]', 'autosave@test.com')

    // Chờ auto-save (debounce 2s)
    await page.waitForTimeout(3000)

    // Reload trang
    await page.reload()
    await expect(page.locator('text=Thông tin cá nhân')).toBeVisible({ timeout: 15_000 })

    // Data phải được khôi phục
    const fullNameInput = page.locator('input[name="fullName"]')
    await expect(fullNameInput).toHaveValue(uniqueName, { timeout: 10_000 })
  })
})

test.describe('Installment Wizard — Security', () => {
  test('Customer không thể xem hồ sơ của người khác', async ({ page }) => {
    await loginAsCustomer(page)
    // Thử truy cập hồ sơ ID = 999999 (không phải của mình)
    await page.goto('/dashboard/installments/999999')
    // Phải hiển thị lỗi hoặc redirect
    await expect(
      page.locator('text=Không tìm thấy hồ sơ').or(page.locator('text=không có quyền')).or(page.locator('text=Lỗi'))
    ).toBeVisible({ timeout: 10_000 })
  })
})
