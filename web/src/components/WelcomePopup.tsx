import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const DISCORD = 'https://discord.gg/PjjuCPpqm5';
const STORAGE_KEY = 'wr_welcome_seen';

export function WelcomePopup() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setOpen(true);
  }, [location.pathname]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#f472b655] bg-[#1c1018] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(244,114,182,0.35)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f472b6]/20 to-transparent" />
        <button
          type="button"
          aria-label="Đóng"
          onClick={dismiss}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="relative text-xs font-semibold tracking-[0.2em] text-[#f9a8d4]">WILD RIFT STORE</p>
        <h2 id="welcome-title" className="relative mt-3 text-xl font-bold text-white">
          Chào mừng khách hàng
        </h2>
        <p className="relative mt-3 text-sm leading-6 text-slate-300">
          Chào mừng khách hàng đến với Wild Rift Store. Các bạn có thể tham gia kênh Discord sau để săn acc ngon mỗi
          ngày nhé!
        </p>
        <a
          href={DISCORD}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(88,101,242,0.45)] transition hover:bg-[#4752c4]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Tham gia Discord
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="relative mt-3 w-full py-2 text-xs text-slate-400 hover:text-slate-200"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
