import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../api';
import { WelcomePopup } from './WelcomePopup';

const FANPAGE = 'https://www.facebook.com/shoptocchienquocanh';
const DISCORD = 'https://discord.gg/PjjuCPpqm5';

const FOOTER_COLUMNS = [
  {
    title: 'Cửa hàng',
    links: [
      { label: 'Sản phẩm', to: '/' },
      { label: 'Khuyến mãi', to: '/khuyen-mai' },
      { label: 'Đơn hàng', to: '/don-hang' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Liên hệ', to: '/lien-he' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Hỗ trợ khách hàng', to: '/ho-tro' },
    ],
  },
  {
    title: 'Chính sách',
    links: [
      { label: 'Chính sách mua hàng', to: '/chinh-sach-mua-hang' },
      { label: 'Chính sách thanh toán', to: '/chinh-sach-thanh-toan' },
      { label: 'Chính sách hoàn tiền', to: '/chinh-sach-hoan-tien' },
      { label: 'Điều khoản sử dụng', to: '/dieu-khoan' },
    ],
  },
];

const ADMIN_TABS = [
  { label: 'List Account', to: '/admin' },
  { label: 'Đơn Hàng', to: '/admin/orders' },
  { label: 'Danh Mục', to: '/admin/categories' },
];

const TOP_TABS: { label: string; short?: string; to?: string; href?: string }[] = [
  { label: 'Homepage', short: 'Home', to: '/' },
  { label: 'Fanpage', href: FANPAGE },
  { label: 'Tiktok' },
  { label: 'Discord', href: DISCORD },
  { label: 'Liên hệ', to: '/lien-he' },
  { label: 'Chính sách trả góp', short: 'Trả góp', to: '/chinh-sach-tra-gop' },
];

const PETALS = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${-index * 0.9}s`,
  duration: `${13 + (index % 8)}s`,
  size: 8 + (index % 6) * 3,
  drift: `${index % 2 === 0 ? 48 : -56}px`,
  spin: `${index % 2 === 0 ? 320 : -280}deg`,
  color: ['#f9a8d4', '#f472b6', '#fda4af', '#e9d5ff', '#c4b5fd'][index % 5],
}));

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map((petal) => (
        <span
          key={petal.left + petal.delay}
          className="petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.45,
            background: petal.color,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            ['--drift' as string]: petal.drift,
            ['--spin' as string]: petal.spin,
          }}
        />
      ))}
    </div>
  );
}

function PublicTabs({
  shortLabels,
  onNavigate,
  itemClass,
}: {
  shortLabels?: boolean;
  onNavigate?: () => void;
  itemClass: (active: boolean) => string;
}) {
  return (
    <>
      {TOP_TABS.map((tab) => {
        const label = shortLabels && tab.short ? tab.short : tab.label;
        if (tab.to) {
          return (
            <NavLink key={tab.label} to={tab.to} end onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}>
              {label}
            </NavLink>
          );
        }
        if (tab.href) {
          return (
            <a
              key={tab.label}
              href={tab.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={itemClass(false)}
            >
              {label}
            </a>
          );
        }
        return (
          <span key={tab.label} className={`${itemClass(false)} cursor-default opacity-70`}>
            {label}
          </span>
        );
      })}
    </>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const showLogout = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logoutAdmin();
    client.removeQueries({ queryKey: ['admin-me'] });
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-transparent text-slate-100">
      <Petals />
      <WelcomePopup />
      <header className="sticky top-0 z-20 border-b border-[#f472b644] bg-[#1a0c14]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
          <Link to="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png?v=3" alt="Wild Rift Store" className="h-10 w-auto sm:h-[2.8rem]" />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1">
            {showLogout
              ? ADMIN_TABS.map((tab) => {
                  const active =
                    tab.to === '/admin'
                      ? location.pathname === '/admin' || location.pathname.startsWith('/admin/accounts')
                      : location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
                  return (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      end={tab.to === '/admin'}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${active ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'}`}
                    >
                      {tab.label}
                    </NavLink>
                  );
                })
              : (
                <PublicTabs
                  shortLabels
                  itemClass={(active) =>
                    `whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm lg:px-3 ${active ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'}`
                  }
                />
              )}
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 md:hidden">
            {!showLogout && (
              <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
                <a
                  href={FANPAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-slate-200 sm:px-2.5 sm:text-xs"
                >
                  Fanpage
                </a>
                <a
                  href={DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-slate-200 sm:px-2.5 sm:text-xs"
                >
                  Discord
                </a>
                <NavLink
                  to="/lien-he"
                  className={({ isActive }) =>
                    `rounded-full px-2 py-1 text-[11px] font-medium sm:px-2.5 sm:text-xs ${isActive ? 'bg-white/15 text-white' : 'text-slate-200'}`
                  }
                >
                  Liên hệ
                </NavLink>
                <NavLink
                  to="/chinh-sach-tra-gop"
                  className={({ isActive }) =>
                    `rounded-full px-2 py-1 text-[11px] font-medium sm:px-2.5 sm:text-xs ${isActive ? 'bg-white/15 text-white' : 'text-slate-200'}`
                  }
                >
                  Trả góp
                </NavLink>
              </nav>
            )}
            {showLogout && (
              <>
                <button
                  type="button"
                  aria-label="Đăng xuất"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10"
                  onClick={() => void handleLogout()}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 16l4-4-4-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                  aria-expanded={menuOpen}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-100 hover:bg-white/10"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {menuOpen ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="relative hidden shrink-0 md:block">
            <img src="/logo.png?v=3" alt="" aria-hidden="true" className="invisible h-[2.8rem] w-auto" />
            {showLogout && (
              <button
                type="button"
                aria-label="Đăng xuất"
                title="Đăng xuất"
                className="absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10 hover:text-white"
                onClick={() => void handleLogout()}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 16l4-4-4-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {menuOpen && showLogout && (
          <nav className="border-t border-[#f472b644] bg-[#1a0c14]/95 px-3 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {ADMIN_TABS.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === '/admin'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-white/15 text-white' : 'text-slate-200'}`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-[#f472b644] bg-[#10060c] text-[#f3cfe0]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-lg font-bold tracking-wide text-white">FURYWR</p>
          <p className="mt-1 text-sm text-white">Wild Rift Store</p>
          <p className="mt-3 max-w-md text-sm leading-6">
            Cửa hàng trực tuyến cung cấp sản phẩm và dịch vụ nhanh chóng, tiện lợi và an toàn.
          </p>
          <div className="my-8 border-t border-[#f472b644]" />
          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold tracking-[0.18em] text-white">{column.title.toUpperCase()}</p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {column.links.map((item) => (
                    <Link key={item.label} to={item.to} className="hover:text-white">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="my-8 border-t border-[#f472b644]" />
          <p className="text-center text-sm">© 2026 FURYWR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
