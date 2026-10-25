import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

const POINTS = [
  {
    title: 'Xem acc trước khi hẹn',
    text: 'Khách xem đủ ảnh và thông tin acc trên web. Số kỳ và số tiền thanh toán mỗi kỳ được chốt khi nhắn Zalo hoặc Facebook.',
  },
  {
    title: 'Giữ acc trong lúc trả',
    text: 'Sau khi thống nhất, shop giữ acc và không bán cho người khác.',
  },
  {
    title: 'Giao thông tin tài khoản',
    text: 'Tất cả thông tin được giao khi đã thanh toán đủ số tiền đã hẹn. Trước đó shop không gửi thông tin bảo mật game.',
  },
  {
    title: 'Khi ngừng trả',
    text: 'Nếu khách ngừng thanh toán theo lịch đã hẹn, shop giữ lại acc và có thể mở bán lại. Các khoản đã trả không được hoàn.',
  },
];

export function InstallmentPage() {
  return (
    <div>
      <Seo
        title="Trả góp acc tốc chiến"
        description="Trả góp acc tốc chiến Premium/VIP tại Wild Rift Store: cọc từ 50%, tất toán 30 ngày, không lãi."
        path="/chinh-sach-tra-gop"
      />
      <h1 className="text-2xl font-bold text-white">Trả góp acc tốc chiến</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        Shop acc tốc chiến nhận trả góp cho acc Wild Rift ở danh mục Premium và VIP. Khách chỉ cần cọc từ 50% giá trị
        account, shop cấp tài khoản và mật khẩu để vào chơi, tất toán sau 30 ngày (account lớn có thể 2 tháng) và không
        lấy thêm lãi.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {POINTS.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 p-5 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]"
          >
            <h2 className="text-base font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-300">
        Shop sẽ hỗ trợ lâu dài cho các bạn. Khi cần tư vấn về dịch vụ Tốc Chiến, hãy liên lạc qua thông tin ở phần{' '}
        <Link to="/lien-he" className="font-medium text-[#f9a8d4] hover:text-white">
          Liên hệ
        </Link>
        . Nhanh nhất qua Zalo:{' '}
        <a href="https://zalo.me/0968893228" className="font-medium text-[#f9a8d4] hover:text-white">
          0968.893.228
        </a>
        .
      </p>
    </div>
  );
}
