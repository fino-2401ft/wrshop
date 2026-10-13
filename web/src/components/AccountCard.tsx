import { Link } from 'react-router-dom';
import { categoryListLabel } from './HomeSectionHeader';
import { AccountCard, formatPrice, specText } from '../types';

const LABEL: Record<string, string> = {
  VIP: 'text-[#fbcfe8]',
  NGON: 'text-[#f9a8d4]',
  GIA_RE: 'text-[#fda4af]',
};

export function AccountCardView({ account }: { account: AccountCard }) {
  const label = categoryListLabel(account.category);
  const hot = Boolean(account.isHot);
  return (
    <article
      className={
        hot
          ? 'account-card-hot relative flex flex-col overflow-hidden rounded-2xl border border-amber-300/80 bg-[#1a1408]/95 text-[#fff8e7] shadow-[0_18px_36px_rgba(0,0,0,0.62)]'
          : 'flex flex-col overflow-hidden rounded-2xl border border-[#f472b655] bg-[#1c1018]/95 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]'
      }
    >
      {hot && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.22),transparent_55%)]" />
      )}
      <div className="relative flex items-start justify-between gap-2 px-3 pt-3">
        <p className={`text-xs font-semibold tracking-wide ${hot ? 'text-amber-200' : LABEL[account.category] ?? 'text-[#f9a8d4]'}`}>
          {label} <span className={`font-normal ${hot ? 'text-amber-100/60' : 'text-slate-400'}`}>· #{account.publicCode}</span>
        </p>
        {hot && (
          <span className="hot-badge shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1200]">
            Hot
          </span>
        )}
      </div>
      <Link to={`/acc/${account.publicCode}`} className={`relative mt-2 block ${hot ? 'bg-amber-950/40' : 'bg-black/30'}`}>
        {account.coverUrl ? (
          <img src={account.coverUrl} alt="" className="block h-auto w-full" />
        ) : (
          <div className="grid aspect-video place-items-center text-sm text-slate-400">Chưa có ảnh</div>
        )}
        {hot && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-amber-500/25 to-transparent" />
        )}
      </Link>
      <div className="relative grid flex-1 grid-cols-2 gap-1.5 p-3 text-xs">
        <Stat label="Tướng" value={specText(account.specs.heroes)} hot={hot} />
        <Stat label="Skin" value={specText(account.specs.skins)} hot={hot} />
        <Stat label="Rank" value={specText(account.specs.rank)} hot={hot} />
        <Stat label="Khung" value={specText(account.specs.frame)} hot={hot} />
      </div>
      <p className={`relative px-3 text-center text-sm font-semibold ${hot ? 'text-amber-100' : 'text-white'}`}>
        {formatPrice(account.price)}
      </p>
      <Link to={`/acc/${account.publicCode}`} className="relative mx-auto mb-3 mt-2 block w-fit">
        <img src="/xem-chi-tiet.png?v=2" alt="Xem chi tiết" className="h-9 w-auto" />
      </Link>
    </article>
  );
}

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div
      className={
        hot
          ? 'flex min-h-12 flex-col items-center justify-center rounded-md border border-amber-300/25 bg-amber-400/10 px-1 py-1.5 text-center leading-tight'
          : 'flex min-h-12 flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 px-1 py-1.5 text-center leading-tight'
      }
    >
      <span className={`text-[11px] ${hot ? 'text-amber-200/70' : 'text-slate-400'}`}>{label}</span>
      <span className={`whitespace-nowrap text-[12px] font-medium ${hot ? 'text-amber-50' : 'text-slate-100'}`}>{value}</span>
    </div>
  );
}
