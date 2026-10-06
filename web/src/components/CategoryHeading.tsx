import { Link } from 'react-router-dom';

const PAGE_TITLE: Record<string, string> = {
  vip: 'Premium Account',
  VIP: 'Premium Account',
  ngon: 'VIP Account',
  NGON: 'VIP Account',
  'gia-re': 'Cheap Account',
  GIA_RE: 'Cheap Account',
};

export function categoryPageTitle(key: string | undefined, fallback: string) {
  if (key && PAGE_TITLE[key]) return PAGE_TITLE[key];
  return fallback;
}

export function CategoryHeading({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to={to}
        aria-label="Quay lại"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#f472b6] text-lg leading-none text-[#f9a8d4] shadow-[0_0_14px_rgba(244,114,182,0.35)] hover:bg-[#f472b6]/15"
      >
        ‹
      </Link>
      <h1 className="text-xl font-semibold tracking-wide text-white">{title}</h1>
    </div>
  );
}
