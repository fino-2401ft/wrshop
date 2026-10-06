import { Link } from 'react-router-dom';
import { Category } from '../types';

const TILE_IMAGE: Record<string, string> = {
  VIP: '/category-vip.jpg',
  NGON: '/category-ngon.jpg?v=2',
  GIA_RE: '/category-cheap.jpg',
};

const META: Record<string, { heading: string; blurb: string; glow: string }> = {
  VIP: {
    heading: 'Acc Premium',
    blurb: 'Nhiều tướng, skin, rank cao — từ 5 triệu',
    glow: 'rgba(251, 207, 232, 0.35)',
  },
  NGON: {
    heading: 'Acc VIP',
    blurb: 'Đồ ổn, giá dễ chịu — từ 1 triệu',
    glow: 'rgba(249, 168, 212, 0.35)',
  },
  GIA_RE: {
    heading: 'Acc giá rẻ',
    blurb: 'Nhẹ túi, vào game là chơi — dưới 1 triệu',
    glow: 'rgba(253, 164, 175, 0.35)',
  },
};

export function categoryListLabel(category: Category): string {
  if (category === 'VIP') return 'Premium';
  if (category === 'NGON') return 'VIP';
  if (category === 'GIA_RE') return 'Giá rẻ';
  return category;
}

export function HomeSectionDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-2" aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#f472b6]/60 sm:w-20" />
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1 w-1 rounded-full bg-[#f9a8d4]/80 shadow-[0_0_6px_rgba(244,114,182,0.8)]"
          />
        ))}
      </span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#f472b6]/60 sm:w-20" />
    </div>
  );
}

export function HomeSectionHeader({ category, slug }: { category: Category; slug: string }) {
  const meta = META[category] ?? {
    heading: category,
    blurb: '',
    glow: 'rgba(249, 168, 212, 0.35)',
  };
  const thumb = TILE_IMAGE[category];

  return (
    <div
      className="relative mb-4 overflow-hidden rounded-2xl border border-[#f472b644]/90 shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_28px_var(--section-glow)]"
      style={{ ['--section-glow' as string]: meta.glow }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#120810]/88" />
      {thumb && (
        <img
          src={thumb}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-[0.22] blur-[2px]"
        />
      )}
      <div className="relative flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {thumb && (
          <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:h-16 sm:w-24">
            <img src={thumb} alt="" className="h-full w-full object-cover object-top" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-snug sm:text-xl">
            <span className="bg-gradient-to-r from-white via-[#fce7f3] to-[#f472b6] bg-clip-text text-transparent">
              {meta.heading}
            </span>
          </h2>
          {meta.blurb && <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400 sm:text-xs">{meta.blurb}</p>}
        </div>
        <Link
          to={`/shop/${slug}`}
          className="shrink-0 rounded-full border border-[#f472b6]/55 bg-[#f472b6]/15 px-3 py-2 text-[11px] font-semibold text-[#fbcfe8] shadow-[0_0_14px_rgba(244,114,182,0.2)] transition hover:border-[#f9a8d4] hover:bg-[#f472b6]/25 hover:text-white sm:px-4 sm:text-xs"
        >
          Xem tất cả
        </Link>
      </div>
    </div>
  );
}
