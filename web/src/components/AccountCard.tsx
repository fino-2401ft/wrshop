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
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#f472b655] bg-[#1c1018]/95 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]">
      <p className={`px-3 pt-3 text-xs font-semibold tracking-wide ${LABEL[account.category] ?? 'text-[#f9a8d4]'}`}>
        {label} <span className="font-normal text-slate-400">· #{account.publicCode}</span>
      </p>
      <Link to={`/acc/${account.publicCode}`} className="mt-2 block bg-black/30">
        {account.coverUrl ? (
          <img src={account.coverUrl} alt="" className="block h-auto w-full" />
        ) : (
          <div className="grid aspect-video place-items-center text-sm text-slate-400">Chưa có ảnh</div>
        )}
      </Link>
      <div className="grid flex-1 grid-cols-2 gap-1.5 p-3 text-xs">
        <Stat label="Tướng" value={specText(account.specs.heroes)} />
        <Stat label="Skin" value={specText(account.specs.skins)} />
        <Stat label="Rank" value={specText(account.specs.rank)} />
        <Stat label="Khung" value={specText(account.specs.frame)} />
      </div>
      <p className="px-3 text-center text-sm font-semibold text-white">{formatPrice(account.price)}</p>
      <Link to={`/acc/${account.publicCode}`} className="mx-auto mb-3 mt-2 block w-fit">
        <img src="/xem-chi-tiet.png?v=2" alt="Xem chi tiết" className="h-9 w-auto" />
      </Link>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-12 flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 px-1 py-1.5 text-center leading-tight">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="whitespace-nowrap text-[12px] font-medium text-slate-100">{value}</span>
    </div>
  );
}
