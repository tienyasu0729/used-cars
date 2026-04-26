import { useEffect, useState } from 'react'
import { Button, Modal } from '@/components/ui'

type BannerForm = {
  title: string
  imageUrl: string
  link: string
  sortOrder: string
  status: 'published' | 'draft'
}

type ArticleForm = {
  title: string
  content: string
  imageUrl: string
  author: string
  status: 'published' | 'draft'
}

export function CmsBannerModal(props: {
  open: boolean
  onClose: () => void
  initial?: Partial<BannerForm> | null
  title: string
  onSubmit: (v: BannerForm) => Promise<void>
  pending?: boolean
}) {
  const [f, setF] = useState<BannerForm>({
    title: '',
    imageUrl: '',
    link: '',
    sortOrder: '',
    status: 'published',
  })
  useEffect(() => {
    if (props.open) {
      setF({
        title: props.initial?.title ?? '',
        imageUrl: props.initial?.imageUrl ?? '',
        link: props.initial?.link ?? '',
        sortOrder: props.initial?.sortOrder ?? '',
        status: props.initial?.status ?? 'published',
      })
    }
  }, [props.open, props.initial])
  return (
    <Modal
      isOpen={props.open}
      onClose={props.onClose}
      title={props.title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={props.onClose}>Hủy</Button>
          <Button
            variant="primary"
            loading={props.pending}
            onClick={async () => {
              await props.onSubmit(f)
            }}
          >
            Lưu
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label="Tiêu đề" value={f.title} onChange={(v) => setF((x) => ({ ...x, title: v }))} />
        <Field label="URL ảnh" value={f.imageUrl} onChange={(v) => setF((x) => ({ ...x, imageUrl: v }))} />
        <Field label="Link" value={f.link} onChange={(v) => setF((x) => ({ ...x, link: v }))} />
        <Field label="Thứ tự (tuỳ chọn)" value={f.sortOrder} onChange={(v) => setF((x) => ({ ...x, sortOrder: v }))} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select
            value={f.status}
            onChange={(e) => setF((x) => ({ ...x, status: e.target.value as 'published' | 'draft' }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="published">Hiển thị</option>
            <option value="draft">Ẩn</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}

export function CmsArticleModal(props: {
  open: boolean
  onClose: () => void
  initial?: Partial<ArticleForm> | null
  title: string
  onSubmit: (v: ArticleForm) => Promise<void>
  pending?: boolean
}) {
  const [f, setF] = useState<ArticleForm>({
    title: '',
    content: '',
    imageUrl: '',
    author: '',
    status: 'draft',
  })
  useEffect(() => {
    if (props.open) {
      setF({
        title: props.initial?.title ?? '',
        content: props.initial?.content ?? '',
        imageUrl: props.initial?.imageUrl ?? '',
        author: props.initial?.author ?? '',
        status: props.initial?.status ?? 'draft',
      })
    }
  }, [props.open, props.initial])
  return (
    <Modal
      isOpen={props.open}
      onClose={props.onClose}
      title={props.title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={props.onClose}>Hủy</Button>
          <Button
            variant="primary"
            loading={props.pending}
            onClick={async () => {
              await props.onSubmit(f)
            }}
          >
            Lưu
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label="Tiêu đề" value={f.title} onChange={(v) => setF((x) => ({ ...x, title: v }))} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nội dung</label>
          <textarea
            value={f.content}
            onChange={(e) => setF((x) => ({ ...x, content: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <Field label="URL ảnh" value={f.imageUrl} onChange={(v) => setF((x) => ({ ...x, imageUrl: v }))} />
        <Field label="Tác giả" value={f.author} onChange={(v) => setF((x) => ({ ...x, author: v }))} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select
            value={f.status}
            onChange={(e) => setF((x) => ({ ...x, status: e.target.value as 'published' | 'draft' }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}
