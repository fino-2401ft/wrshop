import { useState } from 'react';

export function SecretValue({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="font-mono">{open ? value || '—' : '••••'}</span>
      <button
        type="button"
        aria-label={open ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        title={open ? 'Ẩn' : 'Hiện'}
        className="grid h-7 w-7 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10 hover:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M3 3l18 18" />
      <path strokeLinecap="round" d="M10.5 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-4 4.2" />
      <path strokeLinecap="round" d="M6.1 6.1C3.5 7.8 2 12 2 12a18 18 0 0 0 6.2 5.4" />
      <path strokeLinecap="round" d="M9.9 9.9a2.5 2.5 0 0 0 3.5 3.5" />
    </svg>
  );
}
