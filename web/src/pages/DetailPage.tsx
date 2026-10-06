import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { CategoryHeading, categoryPageTitle } from '../components/CategoryHeading';
import { AccountDetail, STATUS_LABEL, formatPrice, specText } from '../types';

export function DetailPage() {
  const { code = '' } = useParams();
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ['account', code],
    queryFn: () => api<AccountDetail>(`/api/accounts/${code}`),
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
      <aside className="lg:sticky lg:top-20">
        <CategoryHeading
          title={categoryPageTitle(account.categorySlug ?? account.category, account.categoryTitle ?? account.category)}
          to={`/shop/${account.categorySlug ?? account.category}`}
        />
        <section className="mt-3 rounded-2xl border border-[#f472b644] bg-[#1c1018] p-4 text-[#f8eef4]">
          <div className="overflow-hidden rounded-xl bg-black/30">
            {account.coverUrl ? (
              <img src={account.coverUrl} alt="" className="block h-auto w-full" />
            ) : (
              <div className="grid aspect-video place-items-center text-sm text-slate-400">Chưa có ảnh</div>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-400">#{account.publicCode}</p>
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
                onClick={() => setOpen(true)}
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
              href="https://zalo.me/0968893228"
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
        <div className="mx-auto mt-1 h-0.5 w-16 bg-[#f472b6]" />
        <div className="mt-5 flex flex-col gap-4">
          {gallery.length === 0 && (
            <p className="text-center text-sm text-slate-400">Acc này chưa có ảnh chi tiết.</p>
          )}
          {gallery.map((image) => (
            <img key={image.id} src={image.url} alt="" className="w-full rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
            <h3 className="text-lg font-bold">Thanh toán</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bạn vui lòng liên hệ zalo bên dưới để mua acc nhé!
            </p>
            <a
              href="https://zalo.me/0968893228"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center rounded-full bg-[#0068FF] py-2.5 text-sm font-semibold text-white"
            >
              Liên hệ Zalo
            </a>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
