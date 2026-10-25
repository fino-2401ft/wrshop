import { Link, useLocation } from 'react-router-dom';
import { Seo } from '../components/Seo';

const PAGES: Record<string, { title: string; description: string; paragraphs: string[] }> = {
  '/khuyen-mai': {
    title: 'Khuyến mãi',
    description: 'Ưu đãi mua acc tốc chiến tại Wild Rift Store. Theo dõi fanpage và Zalo để nhận deal shop acc tốc chiến.',
    paragraphs: [
      'Ưu đãi được đăng trên fanpage và Zalo. Trên web không niêm yết một mức giảm cố định.',
      'Khi có chương trình, shop ghi rõ acc áp dụng và thời gian trong tin nhắn xác nhận.',
    ],
  },
  '/don-hang': {
    title: 'Đơn hàng',
    description: 'Hướng dẫn đặt mua acc tốc chiến tại Wild Rift Store: chọn acc, quét QR và nhận thông tin qua email.',
    paragraphs: [
      'Bấm Mua ngay, nhập email và quét QR. Khi tiền vào, web hiện thông tin acc và gửi cùng nội dung về email đó.',
      'Sau khi nhận acc, hãy đổi thông tin liên hệ. Cần hỗ trợ thì nhắn Zalo.',
    ],
  },
  '/faq': {
    title: 'FAQ — Shop acc tốc chiến',
    description:
      'Câu hỏi thường gặp khi mua acc tốc chiến tại Wild Rift Store: xem ảnh, trả góp, thanh toán QR và hỗ trợ Zalo.',
    paragraphs: [
      'Shop acc tốc chiến Wild Rift Store bán acc nào? Acc Premium, VIP và giá rẻ — xem đầy đủ trên trang chủ và từng danh mục.',
      'Có xem ảnh acc trước khi mua không? Có. Mỗi acc có ảnh bìa và ảnh hồ sơ trên trang chi tiết.',
      'Mua acc tốc chiến thanh toán thế nào? Quét QR đúng số tiền và nội dung. Khi tiền vào, web hiện acc và gửi email.',
      'Acc nào được trả góp? Premium và VIP. Cọc từ 50%, tất toán sau 30 ngày, account lớn có thể 2 tháng, không lãi.',
      'Liên hệ nhanh nhất ở đâu? Zalo 0968.893.228.',
    ],
  },
  '/ho-tro': {
    title: 'Hỗ trợ khách hàng',
    description: 'Hỗ trợ tư vấn mua acc tốc chiến, giữ acc và hẹn thanh toán tại Wild Rift Store.',
    paragraphs: [
      'Shop hỗ trợ tư vấn acc tốc chiến, giữ acc và hẹn thanh toán.',
      'Nhắn Zalo 0968.893.228 hoặc mở trang Liên hệ để được trả lời.',
    ],
  },
  '/chinh-sach-mua-hang': {
    title: 'Chính sách mua hàng',
    description: 'Chính sách mua acc tốc chiến tại Wild Rift Store: xem ảnh, thanh toán QR và nhận acc qua email.',
    paragraphs: [
      'Khách xem đủ ảnh và thông tin acc trên web trước khi bấm Mua ngay.',
      'Thanh toán bằng QR. Thông tin đăng nhập hiện trên web và được gửi email sau khi shop đối soát được tiền.',
    ],
  },
  '/chinh-sach-thanh-toan': {
    title: 'Chính sách thanh toán',
    description: 'Chính sách thanh toán QR khi mua acc tốc chiến tại Wild Rift Store, gồm trả góp Premium/VIP.',
    paragraphs: [
      'Khách chuyển khoản đúng số tiền và đúng nội dung trên mã QR. Mã có hiệu lực 3 phút. Acc vẫn hiện cho người khác, ai thanh toán thành công trước sẽ nhận acc.',
      'Premium Account và VIP Account có thể trả góp: cọc từ 50%, tất toán sau 30 ngày hoặc 2 tháng với account lớn, không thêm lãi.',
    ],
  },
  '/chinh-sach-hoan-tien': {
    title: 'Chính sách hoàn tiền',
    description: 'Chính sách hoàn tiền khi mua hoặc trả góp acc tốc chiến tại Wild Rift Store.',
    paragraphs: [
      'Sau khi shop đã giao thông tin đăng nhập, khoản thanh toán không được hoàn.',
      'Nếu khách ngừng trả góp theo lịch đã hẹn, shop giữ acc và các khoản đã trả không được hoàn.',
    ],
  },
  '/dieu-khoan': {
    title: 'Điều khoản sử dụng',
    description: 'Điều khoản sử dụng website shop acc tốc chiến Wild Rift Store.',
    paragraphs: [
      'Thông tin acc trên web là mô tả tại thời điểm đăng bán. Khách nên xem đủ ảnh trước khi đặt.',
      'Tài khoản sau khi giao chỉ dùng cho người mua. Không đăng lại thông tin đăng nhập công khai.',
    ],
  },
};

export function InfoPage() {
  const pathname = useLocation().pathname;
  const page = PAGES[pathname];
  if (!page) return null;
  return (
    <div className="max-w-3xl">
      <Seo title={page.title} description={page.description} path={pathname} />
      <h1 className="text-2xl font-bold text-white">{page.title}</h1>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {page.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-300">
        Cần hỗ trợ thêm, xem trang{' '}
        <Link to="/lien-he" className="font-medium text-[#f9a8d4] hover:text-white">
          Liên hệ
        </Link>
        .
      </p>
    </div>
  );
}
