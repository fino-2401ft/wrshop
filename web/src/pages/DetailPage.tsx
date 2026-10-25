import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, api } from '../api';
import { CategoryHeading, categoryPageTitle } from '../components/CategoryHeading';
import { Seo } from '../components/Seo';
import { AccountDetail, STATUS_LABEL, formatPrice, specText } from '../types';
import { ZALO_URL } from '../zalo';

export function DetailPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const query = useQuery({
    queryKey: ['account', code],
    queryFn: () => api<AccountDetail>(`/api/accounts/${code}`),
  });
  const checkout = useMutation({
    mutationFn: (input: { account: AccountDetail; buyerName: string; phone: string; email: string }) =>
      api<{ code: string }>('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          publicCode: input.account.publicCode,
          buyerName: input.buyerName,
          phone: input.phone,
          email: input.email,
        }),
      }),
    onSuccess: (payment) => navigate(`/thanh-toan/${payment.code}`),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Không tạo được đơn thanh toán'),
  });

  if (query.isLoading) return <p className="text-slate-500">Đang tải acc...</p>;
  if (query.isError || !query.data) {
    return (
      <div>
        <p className="text-rose-600">Không tìm thấy acc.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-[#f9a8d4]">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const account = query.data;
  const canBuy = account.status === 'AVAILABLE';
  const gallery = account.images.filter((image) => !image.isCover);
  const categoryLabel = categoryPageTitle(
    account.categorySlug ?? account.category,
    account.categoryTitle ?? account.category,
  );
  const cells: [string, string][] = [
    ['Tướng', specText(account.specs.heroes)],
    ['Skin', specText(account.specs.skins)],
    ['Rank', specText(account.specs.rank)],
    ['Khung', specText(account.specs.frame)],
    ['Rank HT', specText(account.specs.rankHt)],
    ['Khung HT', specText(account.specs.frameHt)],
  ];

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-6">
      <Seo
        title={`Acc tốc chiến #${account.publicCode} — ${categoryLabel}`}
        description={
          account.description?.trim() ||
          `Mua acc tốc chiến #${account.publicCode} (${categoryLabel}) tại Wild Rift Store. Giá ${formatPrice(account.price)}. Thanh toán QR, giao acc qua email.`
        }
        path={`/acc/${account.publicCode}`}
        image={account.coverUrl}
        noindex={account.status !== 'AVAILABLE'}
      />
      <aside className="lg:sticky lg:top-20">
        <CategoryHeading
          title={categoryLabel}
          to={`/shop/${account.categorySlug ?? account.category}`}
        />
        <section
          className={
            account.isHot
              ? 'detail-hot mt-3 rounded-2xl border border-amber-300/80 bg-[#1a1408] p-4 text-[#fff8e7]'
              : 'mt-3 rounded-2xl border border-[#f472b644] bg-[#1c1018] p-4 text-[#f8eef4]'
          }
        >
          <div
            className={
              account.isHot
                ? 'hot-image-frame overflow-hidden rounded-xl bg-amber-950/40'
                : 'overflow-hidden rounded-xl bg-black/30'
            }
          >
            {account.coverUrl ? (
              <img src={account.coverUrl} alt="" className="block h-auto w-full" />
            ) : (
              <div className="grid aspect-video place-items-center text-sm text-slate-400">Chưa có ảnh</div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className={`text-sm ${account.isHot ? 'text-amber-200/70' : 'text-slate-400'}`}>#{account.publicCode}</p>
            {account.isHot && (
              <span className="hot-badge rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1200]">
                Hot Account
              </span>
            )}
          </div>
          {account.description && <p className="mt-2 text-sm leading-6 text-slate-300">{account.description}</p>}
          <p className="mt-3 text-2xl font-bold">{formatPrice(account.price)}</p>
          <div className="mt-4 grid gap-2 text-sm">
            {cells.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
                <span className="text-slate-400">{label}</span>
                <span className="text-right font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {canBuy ? (
              <button
                onClick={() => {
                  setError('');
                  setOpen(true);
                }}
                className="rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-6 py-2.5 text-sm font-semibold text-white"
              >
                Mua ngay
              </button>
            ) : (
              <span className="rounded-full bg-white/10 px-4 py-2 text-center text-sm font-medium text-slate-200">
                {STATUS_LABEL[account.status]}
              </span>
            )}
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#0068FF] px-6 py-2.5 text-center text-sm font-semibold text-white"
            >
              Trả góp liên hệ Zalo
            </a>
          </div>
        </section>
      </aside>

      <section className="mt-6 lg:mt-0">
        <h2 className="text-center text-lg font-semibold tracking-wide text-white">HÌNH ẢNH TÀI KHOẢN</h2>
        <div className={`mx-auto mt-1 h-0.5 w-16 ${account.isHot ? 'bg-amber-400' : 'bg-[#f472b6]'}`} />
        <div className="mt-5 flex flex-col gap-4">
          {gallery.length === 0 && (
            <p className="text-center text-sm text-slate-400">Acc này chưa có ảnh chi tiết.</p>
          )}
          {gallery.map((image) =>
            account.isHot ? (
              <div key={image.id} className="hot-image-frame overflow-hidden rounded-xl bg-amber-950/30">
                <img src={image.url} alt="" className="w-full" />
              </div>
            ) : (
              <img key={image.id} src={image.url} alt="" className="w-full rounded-xl bg-white shadow-sm" />
            ),
          )}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              checkout.mutate({ account, buyerName, phone, email });
            }}
          >
            <h3 className="text-lg font-bold">Thanh toán {formatPrice(account.price)}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Điền thông tin liên hệ. Sau khi thanh toán, shop gửi acc về email và hiện trên trang.
            </p>
            <label className="mt-4 block text-sm font-medium" htmlFor="checkout-name">
              Họ tên
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              minLength={2}
              value={buyerName}
              onChange={(event) => setBuyerName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Nguyễn Văn A"
            />
            <label className="mt-3 block text-sm font-medium" htmlFor="checkout-phone">
              Zalo / Số điện thoại
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="09xxxxxxxx"
            />
            <label className="mt-3 block text-sm font-medium" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="ban@gmail.com"
            />
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={checkout.isPending}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {checkout.isPending ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white"
            >
              Đóng
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
