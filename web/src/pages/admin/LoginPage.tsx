import { FormEvent, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function LoginPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await api<{ username: string }>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      await client.invalidateQueries({ queryKey: ['admin-me'] });
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đăng nhập được');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-sm place-items-center">
      <form
        onSubmit={submit}
        className="w-full rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 p-6 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.62),0_0_28px_rgba(244,114,182,0.38)]"
      >
        <p className="text-sm text-[#f9a8d4]">Wild Rift Store</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Đăng nhập quản trị</h1>
        <label className="mt-5 block text-sm">
          Tên đăng nhập
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          />
        </label>
        <label className="mt-3 block text-sm">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          />
        </label>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <button
          disabled={pending}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Đang vào...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
