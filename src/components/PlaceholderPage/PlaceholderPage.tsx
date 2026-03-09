interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">{title}</h1>
      <p className="text-gray-500">Trang đang được phát triển.</p>
    </div>
  )
}
