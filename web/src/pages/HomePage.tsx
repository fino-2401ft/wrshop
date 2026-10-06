import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AccountCardView } from '../components/AccountCard';
import { HomeSectionDivider, HomeSectionHeader } from '../components/HomeSectionHeader';
import { AccountCard, CATEGORIES, Category } from '../types';

type HomeGroup = { category: Category; slug: string; title: string; accounts: AccountCard[] };

type HomeResponse = {
  categories: HomeGroup[];
};

const TILE_IMAGE: Record<string, string> = {
  VIP: '/category-vip.jpg',
  NGON: '/category-ngon.jpg?v=2',
  GIA_RE: '/category-cheap.jpg',
};

const FALLBACK_TILES: HomeGroup[] = CATEGORIES.map((item) => ({
  category: item.key,
  slug: item.slug,
  title: item.title,
  accounts: [],
}));

export function HomePage() {
  const query = useQuery({
    queryKey: ['home'],
    queryFn: () => api<HomeResponse>('/api/accounts/home'),
  });

  const groups = query.data?.categories ?? [];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-[#f472b644] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]">
        <h1 className="sr-only">Wild Rift Store</h1>
        <img
          src="/hero.jpg?v=4"
          alt="Wild Rift Store — Uy tín, chất lượng, nhanh chóng"
          className="block h-auto w-full"
        />
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(query.data?.categories ?? FALLBACK_TILES).map((item) => (
          <Link key={item.slug} to={`/shop/${item.slug}`} className="block">
            {TILE_IMAGE[item.category] ? (
              <div className="aspect-[1024/428] overflow-hidden rounded-2xl border border-[#f472b644] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)] sm:aspect-[1024/571]">
                <img
                  src={TILE_IMAGE[item.category]}
                  alt={item.title}
                  className="block h-full w-full object-cover object-top"
                />
              </div>
            ) : (
              <div className="grid aspect-[1024/428] place-items-center rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-4 text-center text-lg font-bold tracking-wide text-white shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)] sm:aspect-[1024/571]">
                {item.title}
              </div>
            )}
            <img src="/xem-ngay.png" alt="Xem ngay" className="mx-auto mt-2 h-9 w-auto" />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 py-1" aria-hidden="true">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f472b6]/70 to-[#f9a8d4]/40" />
        <span className="shrink-0 rounded-full border border-[#f472b644] bg-[#1c1018]/80 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-[#f9a8d4]">
          ACC ĐANG BÁN
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#f472b6]/70 to-[#f9a8d4]/40" />
      </div>

      {query.isLoading && <p className="text-slate-400">Đang tải acc...</p>}
      {query.isError && <p className="text-rose-300">Không tải được danh sách. Hãy chạy API và thử lại.</p>}

      {groups.map((group, index) => (
        <div key={group.slug} className="space-y-8">
          {index > 0 && <HomeSectionDivider />}
          <section>
            <HomeSectionHeader category={group.category} slug={group.slug} />
            {group.accounts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#f472b644] px-4 py-8 text-center text-sm text-slate-400">
                Chưa có acc trong danh mục này
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.accounts.map((account) => (
                  <AccountCardView key={account.id} account={account} />
                ))}
              </div>
            )}
          </section>
        </div>
      ))}
    </div>
  );
}
