import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AboutPage() {
  useDocumentTitle('Về chúng tôi')
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Về Chúng Tôi</h1>
        <p className="mt-4 text-gray-600">
          SCUDN là chợ xe ô tô đã qua sử dụng uy tín tại Đà Nẵng. Với hơn 10 năm kinh nghiệm,
          chúng tôi cam kết mang đến cho khách hàng những chiếc xe chất lượng với giá cả minh bạch.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800">Lịch Sử Phát Triển</h2>
        <div className="mt-6 space-y-4">
          {[
            { year: '2015', title: 'Thành lập', desc: 'Khởi đầu với 1 chi nhánh tại Đà Nẵng' },
            { year: '2018', title: 'Mở rộng', desc: 'Thêm 2 chi nhánh tại Thanh Khê và Sơn Trà' },
            { year: '2022', title: 'Chuyển đổi số', desc: 'Ra mắt nền tảng mua bán xe trực tuyến' },
            { year: '2025', title: 'Hiện tại', desc: '500+ xe, 3 chi nhánh, phục vụ hàng nghìn khách' },
          ].map((item) => (
            <div key={item.year} className="flex gap-4 rounded-xl border border-gray-200 p-4">
              <span className="font-bold text-[#1A3C6E]">{item.year}</span>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800">Đội Ngũ</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Nguyễn Văn A', role: 'Giám đốc' },
            { name: 'Trần Thị B', role: 'Quản lý kinh doanh' },
            { name: 'Lê Văn C', role: 'Trưởng phòng kỹ thuật' },
          ].map((person) => (
            <div key={person.name} className="rounded-xl border border-gray-200 p-4 text-center">
              <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-gray-200" />
              <h3 className="font-medium">{person.name}</h3>
              <p className="text-sm text-gray-500">{person.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
