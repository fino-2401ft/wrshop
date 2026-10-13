import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { AccountCard, AccountStatus, CATEGORIES, STATUS_LABEL, ShopCategory, categoryMeta, formatPrice } from '../../types';
import { SecretValue } from '../../components/SecretValue';

type Row = AccountCard & { gameUser: string; gamePass: string; imageCount: number };
type ListResponse = { items: Row[]; total: number; page: number; pageSize: number };

export function AccountsPage() {
  const client = useQueryClient();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [code, setCode] = useState('');
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({ category: '', status: '', code: '' });

  const params = new URLSearchParams({ page: String(page) });
  if (applied.category) params.set('category', applied.category);
  if (applied.status) params.set('status', applied.status);
  if (applied.code) params.set('code', applied.code);

  const categories = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api<ShopCategory[]>('/api/accounts/categories'),
  });
  const categoryOptions = categories.data ?? CATEGORIES.map((item) => ({ id: item.key, code: item.key, slug: item.slug, title: item.title }));

  const query = useQuery({
    queryKey: ['admin-accounts', applied, page],
    queryFn: () => api<ListResponse>(`/api/admin/accounts?${params.toString()}`, {}, true),
  });

  async function remove(id: string) {
    if (!confirm('Xóa acc này và toàn bộ ảnh?')) return;
    await api(`/api/admin/accounts/${id}`, { method: 'DELETE' }, true);
    await client.invalidateQueries({ queryKey: ['admin-accounts'] });
  }

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Danh sách acc</h1>
        <Link
          to="/admin/accounts/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-4 py-2 text-sm font-semibold text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Add Account
        </Link>
      </div>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied({ category, status, code });
        }}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Mã số hoặc username"
          className="rounded-lg border border-white/15 px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm"
        >
          <option value="">Mọi danh mục</option>
          {categoryOptions.map((item) => (
            <option key={item.code} value={item.code}>
              {item.title}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm"
        >
          <option value="">Mọi trạng thái</option>
          {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((item) => (
            <option key={item} value={item}>
              {STATUS_LABEL[item]}
            </option>
          ))}
        </select>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-4 py-2 text-sm font-semibold text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M20 20l-3.2-3.2" />
          </svg>
          Lọc
        </button>
      </form>

      {query.isLoading && <p className="mt-4 text-slate-400">Đang tải...</p>}
      {query.isError && <p className="mt-4 text-rose-300">Không tải được danh sách.</p>}

      {query.data && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Mật khẩu</th>
                <th className="px-3 py-2">Danh mục</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Ảnh</th>
                <th className="px-3 py-2">Đăng lúc</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-2 font-medium">
                    #{item.publicCode}
                    {item.isHot ? (
                      <span className="ml-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1a1200]">
                        Hot
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{item.gameUser}</td>
                  <td className="px-3 py-2">
                    <SecretValue value={item.gamePass} />
                  </td>
                  <td className="px-3 py-2">{item.categoryTitle ?? categoryMeta(item.category).title}</td>
                  <td className="px-3 py-2">{formatPrice(item.price)}</td>
                  <td className="px-3 py-2">{item.imageCount}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatPosted(item.createdAt)}</td>
                  <td className="px-3 py-2">{STATUS_LABEL[item.status]}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`/admin/accounts/${item.id}`}
                      aria-label="Sửa"
                      title="Sửa"
                      className="inline-grid h-8 w-8 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10 hover:text-white"
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      onClick={() => remove(item.id)}
                      aria-label="Xóa"
                      title="Xóa"
                      className="ml-1 inline-grid h-8 w-8 place-items-center rounded-full text-rose-300 hover:bg-white/10"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {query.data.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                    Chưa có acc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex justify-center gap-2 text-sm">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40">
          Trước
        </button>
        <span className="px-2 py-1">
          {page}/{totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

function formatPosted(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5h6v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l1 13h8l1-13" />
    </svg>
  );
}
