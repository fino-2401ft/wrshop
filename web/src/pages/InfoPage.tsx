import { Link, useLocation } from 'react-router-dom';

const PAGES: Record<string, { title: string; paragraphs: string[] }> = {
  '/khuyen-mai': {
    title: 'Khuyến mãi',
    paragraphs: [
      'Ưu đãi được đăng trên fanpage và Zalo. Trên web không niêm yết một mức giảm cố định.',
      'Khi có chương trình, shop ghi rõ acc áp dụng và thời gian trong tin nhắn xác nhận.',
    ],
  },
  '/don-hang': {
    title: 'Đơn hàng',
    paragraphs: [
      'Bấm Mua ngay, nhập email và quét QR. Khi tiền vào, web hiện thông tin acc và gửi cùng nội dung về email đó.',
      'Sau khi nhận acc, hãy đổi thông tin liên hệ. Cần hỗ trợ thì nhắn Zalo.',
    ],
  },
  '/faq': {
    title: 'FAQ',
    paragraphs: [
      'Có xem ảnh acc trước khi mua không? Có. Mỗi acc có ảnh bìa và ảnh hồ sơ trên trang chi tiết.',
      'Acc nào được trả góp? Premium Account và VIP Account. Cọc từ 50%, tất toán sau 30 ngày, account lớn có thể 2 tháng, không lãi.',
      'Liên hệ nhanh nhất ở đâu? Zalo 0968.893.228.',
    ],
  },
  '/ho-tro': {
    title: 'Hỗ trợ khách hàng',
    paragraphs: [
      'Shop hỗ trợ tư vấn acc Tốc Chiến, giữ acc và hẹn thanh toán.',
      'Nhắn Zalo 0968.893.228 hoặc mở trang Liên hệ để được trả lời.',
    ],
  },
  '/chinh-sach-mua-hang': {
    title: 'Chính sách mua hàng',
    paragraphs: [
      'Khách xem đủ ảnh và thông tin acc trên web trước khi bấm Mua ngay.',
      'Thanh toán bằng QR. Thông tin đăng nhập hiện trên web và được gửi email sau khi shop đối soát được tiền.',
    ],
  },
  '/chinh-sach-thanh-toan': {
    title: 'Chính sách thanh toán',
    paragraphs: [
      'Khách chuyển khoản đúng số tiền và đúng nội dung trên mã QR. Mã có hiệu lực 3 phút. Acc vẫn hiện cho người khác, ai thanh toán thành công trước sẽ nhận acc.',
      'Premium Account và VIP Account có thể trả góp: cọc từ 50%, tất toán sau 30 ngày hoặc 2 tháng với account lớn, không thêm lãi.',
    ],
  },
  '/chinh-sach-hoan-tien': {
    title: 'Chính sách hoàn tiền',
    paragraphs: [
      'Sau khi shop đã giao thông tin đăng nhập, khoản thanh toán không được hoàn.',
      'Nếu khách ngừng trả góp theo lịch đã hẹn, shop giữ acc và các khoản đã trả không được hoàn.',
    ],
  },
  '/dieu-khoan': {
    title: 'Điều khoản sử dụng',
    paragraphs: [
      'Thông tin acc trên web là mô tả tại thời điểm đăng bán. Khách nên xem đủ ảnh trước khi đặt.',
      'Tài khoản sau khi giao chỉ dùng cho người mua. Không đăng lại thông tin đăng nhập công khai.',
    ],
  },
};

export function InfoPage() {
  const page = PAGES[useLocation().pathname];
  if (!page) return null;
  return (
    <div className="max-w-3xl">
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
