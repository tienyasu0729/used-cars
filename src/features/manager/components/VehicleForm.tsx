/**
 * VehicleForm — Form tạo/sửa xe cho Manager/Admin
 *
 * Props: vehicleId? (undefined = create mode, number = edit mode)
 * Cascade select: hãng → dòng xe
 * Validate: required fields, price > 0, year hợp lệ
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '@/hooks/useCatalog'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import { useManagerVehicle } from '@/hooks/useManagerVehicles'
import { vehicleService } from '@/services/vehicle.service'
import type { CreateVehicleRequest, UpdateVehicleRequest, VehicleStatus } from '@/types/vehicle.types'

interface VehicleFormProps {
  vehicleId?: number
}

export function VehicleForm({ vehicleId }: VehicleFormProps) {
  const navigate = useNavigate()
  const isEditMode = vehicleId !== undefined
  const { categories, subcategories, fetchSubcategories } = useCatalog()
  const { fuelOptions, transmissionOptions } = useVehicleRegistryLabels()
  const { createVehicle, updateVehicle, isSubmitting, error } = useManagerVehicle()

  // Form state
  const [form, setForm] = useState({
    categoryId: 0,
    subcategoryId: 0,
    branchId: 1, // Mặc định chi nhánh 1, có thể lấy từ authStore
    title: '',
    price: '',
    year: String(new Date().getFullYear()),
    mileage: '0',
    fuel: 'Xăng',
    transmission: 'Số tự động',
    imageUrl: '',
    status: 'Available' as VehicleStatus,
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const fuelSelectOptions = useMemo(() => {
    const base = [...fuelOptions]
    const v = form.fuel.trim()
    if (v && !base.includes(v)) return [v, ...base]
    return base
  }, [fuelOptions, form.fuel])

  const transmissionSelectOptions = useMemo(() => {
    const base = [...transmissionOptions]
    const v = form.transmission.trim()
    if (v && !base.includes(v)) return [v, ...base]
    return base
  }, [transmissionOptions, form.transmission])

  // Load xe hiện tại nếu edit mode
  useEffect(() => {
    if (!isEditMode || !vehicleId) return

    vehicleService.getVehicleById(vehicleId).then((vehicle) => {
      setForm({
        categoryId: vehicle.category_id,
        subcategoryId: vehicle.subcategory_id,
        branchId: vehicle.branch_id,
        title: vehicle.title,
        price: String(vehicle.price),
        year: String(vehicle.year),
        mileage: String(vehicle.mileage ?? ''),
        fuel: vehicle.fuel || 'Xăng',
        transmission: vehicle.transmission || 'Số tự động',
        imageUrl: vehicle.images?.[0]?.url || '',
        status: (vehicle.status as VehicleStatus) || 'Available',
      })
      // Fetch subcategories cho hãng hiện tại
      if (vehicle.category_id) {
        fetchSubcategories(vehicle.category_id)
      }
    }).catch(console.error)
  }, [vehicleId, isEditMode, fetchSubcategories])

  // Cascade: khi đổi hãng → fetch dòng xe
  useEffect(() => {
    if (form.categoryId > 0) {
      fetchSubcategories(form.categoryId)
    }
  }, [form.categoryId, fetchSubcategories])

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.categoryId) errors.categoryId = 'Chọn hãng xe'
    if (!form.subcategoryId) errors.subcategoryId = 'Chọn dòng xe'
    if (!form.title.trim()) errors.title = 'Nhập tiêu đề xe'
    const price = parseInt(form.price, 10)
    if (!price || price <= 0) errors.price = 'Giá phải lớn hơn 0'
    const year = parseInt(form.year, 10)
    if (!year || year < 1990 || year > new Date().getFullYear() + 1) {
      errors.year = `Năm sản xuất từ 1990 đến ${new Date().getFullYear()}`
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: CreateVehicleRequest = {
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      branchId: form.branchId,
      title: form.title.trim(),
      price: parseInt(form.price, 10),
      year: parseInt(form.year, 10),
      mileage: parseInt(form.mileage, 10) || 0,
      fuel: form.fuel,
      transmission: form.transmission,
      images: form.imageUrl
        ? [{ url: form.imageUrl, sortOrder: 0, primaryImage: true }]
        : [],
    }

    if (isEditMode && vehicleId) {
      const updatePayload: UpdateVehicleRequest = { ...data, status: form.status }
      const result = await updateVehicle(vehicleId, updatePayload)
      if (result) navigate('/manager/vehicles')
    } else {
      const result = await createVehicle(data)
      if (result) navigate('/manager/vehicles')
    }
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Xóa lỗi khi user sửa
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border ${
      validationErrors[field] ? 'border-red-400' : 'border-slate-200'
    } bg-slate-50 px-4 py-2.5 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20`

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        {isEditMode ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
      </h2>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Hãng xe + Dòng xe */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Hãng xe *</label>
          <select
            value={form.categoryId}
            onChange={(e) => {
              updateField('categoryId', Number(e.target.value))
              updateField('subcategoryId', 0) // Reset dòng xe
            }}
            className={inputClass('categoryId')}
          >
            <option value={0}>— Chọn hãng —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {validationErrors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.categoryId}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Dòng xe *</label>
          <select
            value={form.subcategoryId}
            onChange={(e) => updateField('subcategoryId', Number(e.target.value))}
            className={inputClass('subcategoryId')}
            disabled={!form.categoryId}
          >
            <option value={0}>— Chọn dòng xe —</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {validationErrors.subcategoryId && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.subcategoryId}</p>
          )}
        </div>
      </div>

      {/* Tiêu đề */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Tiêu đề xe *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="VD: Toyota Camry 2.5Q 2021 - Xe lướt"
          className={inputClass('title')}
        />
        {validationErrors.title && (
          <p className="mt-1 text-xs text-red-500">{validationErrors.title}</p>
        )}
      </div>

      {/* Giá + Năm + Km */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Giá bán (VNĐ) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="500000000"
            className={inputClass('price')}
          />
          {validationErrors.price && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.price}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Năm SX *</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => updateField('year', e.target.value)}
            min={1990}
            max={new Date().getFullYear() + 1}
            className={inputClass('year')}
          />
          {validationErrors.year && (
            <p className="mt-1 text-xs text-red-500">{validationErrors.year}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Số km</label>
          <input
            type="number"
            value={form.mileage}
            onChange={(e) => updateField('mileage', e.target.value)}
            min={0}
            className={inputClass('mileage')}
          />
        </div>
      </div>

      {/* Nhiên liệu + Hộp số */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Nhiên liệu</label>
          <select
            value={form.fuel}
            onChange={(e) => updateField('fuel', e.target.value)}
            className={inputClass('fuel')}
          >
            {fuelSelectOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Hộp số</label>
          <select
            value={form.transmission}
            onChange={(e) => updateField('transmission', e.target.value)}
            className={inputClass('transmission')}
          >
            {transmissionSelectOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ảnh URL */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">URL ảnh xe</label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder="https://..."
          className={inputClass('imageUrl')}
        />
        {form.imageUrl && (
          <div className="mt-2 h-32 w-48 overflow-hidden rounded-lg border border-slate-200">
            <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#1A3C6E] px-8 py-3 font-bold text-white transition-colors hover:bg-[#15325A] disabled:opacity-50"
        >
          {isSubmitting ? 'Đang xử lý...' : isEditMode ? 'Lưu thay đổi' : 'Thêm xe'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/manager/vehicles')}
          className="rounded-lg border border-slate-200 px-8 py-3 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}
