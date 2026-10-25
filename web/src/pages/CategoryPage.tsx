import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { AccountCardView } from '../components/AccountCard';
import { CategoryHeading, categoryPageTitle } from '../components/CategoryHeading';
import { Seo } from '../components/Seo';
import { AccountCard, RANKS, ShopCategory, categoryBySlug } from '../types';

type ListResponse = {
  items: AccountCard[];
  total: number;
  page: number;
  pageSize: number;
};

const PRICE_BANDS = [
  { id: '', label: 'Mọi mức giá', min: '', max: '' },
  { id: 'lt1', label: 'Dưới 1 triệu', min: '', max: '999999' },
  { id: '1-5', label: '1 – 5 triệu', min: '1000000', max: '5000000' },
  { id: '5-10', label: '5 – 10 triệu', min: '5000000', max: '10000000' },
  { id: 'gt10', label: 'Trên 10 triệu', min: '10000000', max: '' },
];

export function CategoryPage() {
  const { slug = '' } = useParams();
  const catalog = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api<ShopCategory[]>('/api/accounts/categories'),
  });
  const known = categoryBySlug(slug);
  const remote = catalog.data?.find((item) => item.slug === slug);
  const title = categoryPageTitle(slug, remote?.title ?? known?.title ?? slug);
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || '1');
  const [code, setCode] = useState(params.get('code') ?? '');
  const [rank, setRank] = useState(params.get('rank') ?? '');
  const [band, setBand] = useState(params.get('band') ?? '');
  const [sort, setSort] = useState(params.get('sort') ?? 'newest');

  const activeBand = PRICE_BANDS.find((item) => item.id === (params.get('band') ?? '')) ?? PRICE_BANDS[0];
  const queryString = new URLSearchParams({
    category: slug,
    page: String(page),
    sort: params.get('sort') || 'newest',
  });
  if (params.get('code')) queryString.set('code', params.get('code') ?? '');
  if (params.get('rank')) queryString.set('rank', params.get('rank') ?? '');
  if (activeBand.min) queryString.set('minPrice', activeBand.min);
  if (activeBand.max) queryString.set('maxPrice', activeBand.max);

  const exists = Boolean(known || remote);
  const query = useQuery({
    queryKey: ['accounts', slug, params.toString()],
    enabled: exists,
    queryFn: () => api<ListResponse>(`/api/accounts?${queryString.toString()}`),
  });

  function apply(event: FormEvent, nextPage = 1) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (code.trim()) next.set('code', code.trim());
    if (rank) next.set('rank', rank);
    if (band) next.set('band', band);
    if (sort !== 'newest') next.set('sort', sort);
    if (nextPage > 1) next.set('page', String(nextPage));
    setParams(next);
  }

  function reset() {
    setCode('');
    setRank('');
    setBand('');
    setSort('newest');
    setParams(new URLSearchParams());
  }

  if (!known && catalog.isLoading) return <p className="text-slate-400">Đang tải danh mục...</p>;
  if (!exists) {
    return <p className="text-slate-300">Danh mục không tồn tại.</p>;
  }

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1;

  return (
    <div>
      <Seo
        title={`${title} | Shop acc tốc chiến`}
        description={`${title} đang bán tại Wild Rift Store — shop acc tốc chiến uy tín. Xem ảnh, lọc giá và mua acc Wild Rift nhanh chóng.`}
        path={`/shop/${slug}`}
      />
      <CategoryHeading title={title} to="/" />
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        Danh mục {title.toLowerCase()} tại shop acc tốc chiến Wild Rift Store. Chọn acc phù hợp, thanh toán QR và nhận
        thông tin qua email.
      </p>
      <form
        onSubmit={(event) => apply(event)}
        className="mt-4 grid gap-3 rounded-xl border border-[#f472b644] bg-[#1c1018] p-4 text-[#f8eef4] md:grid-cols-6"
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Mã số"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-1"
        />
        <select
          value={rank}
          onChange={(event) => setRank(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-1"
        >
          <option value="">Mọi rank</option>
          {RANKS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={band}
          onChange={(event) => setBand(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
        >
          {PRICE_BANDS.map((item) => (
            <option key={item.id || 'all'} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-1"
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
        <div className="flex gap-2 md:col-span-1">
          <button className="flex-1 rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-3 py-2 text-sm font-semibold text-white">
            Tìm
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-3 py-2 text-sm text-slate-100"
          >
            Xóa
          </button>
        </div>
      </form>

      {query.isLoading && <p className="mt-6 text-slate-500">Đang tải...</p>}
      {query.isError && <p className="mt-6 text-rose-600">Không tải được danh sách.</p>}

      {query.data && (
        <>
          <p className="mt-4 text-sm font-bold text-white">Total Account: {query.data.total}</p>
          {query.data.items.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#f472b644] px-4 py-10 text-center text-sm text-slate-400">
              Không có acc phù hợp
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {query.data.items.map((account) => (
                <AccountCardView key={account.id} account={account} />
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(page - 1));
                setParams(next);
              }}
              className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-slate-100 disabled:opacity-40"
            >
              Trước
            </button>
            <span className="px-2 py-1.5 text-sm text-slate-500">
              {page}/{totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(page + 1));
                setParams(next);
              }}
              className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-slate-100 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
