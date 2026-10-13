const ZALO = 'https://zalo.me/0968893228';
const FANPAGE = 'https://www.facebook.com/qatcs';

const CARDS = [
  {
    title: 'Zalo',
    text: 'Nhắn Zalo để hỏi acc, giữ acc và hẹn trả góp.',
    href: ZALO,
    action: 'Mở Zalo',
    className: 'from-[#0068FF] to-[#4da3ff]',
  },
  {
    title: 'Facebook',
    text: 'Vào fanpage để xem bài đăng và nhắn tin cho shop.',
    href: FANPAGE,
    action: 'Mở Facebook',
    className: 'from-[#1877F2] to-[#5aa7ff]',
  },
];

export function ContactPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Liên hệ</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        Chọn một kênh bên dưới. Shop trả lời để tư vấn acc và thống nhất cách thanh toán.
      </p>
      <p className="mt-4 text-lg font-bold text-white">
        Số điện thoại:{' '}
        <a href="tel:0968893228" className="hover:text-[#f9a8d4]">
          0968.893.228
        </a>
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <a
            key={card.title}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 p-6 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]"
          >
            <p className="text-xl font-bold text-white">{card.title}</p>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">{card.text}</p>
            <span
              className={`mt-5 inline-flex w-fit rounded-full bg-gradient-to-r ${card.className} px-4 py-2 text-sm font-semibold text-white`}
            >
              {card.action}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
