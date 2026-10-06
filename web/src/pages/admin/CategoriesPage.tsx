import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { ShopCategory } from '../../types';

export function CategoriesPage() {
  const client = useQueryClient();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const query = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api<ShopCategory[]>('/api/admin/categories', {}, true),
  });

  const create = useMutation({
    mutationFn: () => api<ShopCategory>('/api/admin/categories', { method: 'POST', body: JSON.stringify({ title }) }, true),
    onSuccess: async () => {
      setTitle('');
      setError('');
      await client.invalidateQueries({ queryKey: ['admin-categories'] });
      await client.invalidateQueries({ queryKey: ['shop-categories'] });
    },
    onError: (err: Error) => setError(err.message),
  });

  async function remove(item: ShopCategory) {
    if (!confirm(`Xóa danh mục ${item.title}?`)) return;
    try {
      await api(`/api/admin/categories/${item.id}`, { method: 'DELETE' }, true);
      setError('');
      await client.invalidateQueries({ queryKey: ['admin-categories'] });
      await client.invalidateQueries({ queryKey: ['shop-categories'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được danh mục');
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Danh mục</h1>
      <form onSubmit={submit} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tên danh mục"
          minLength={2}
          maxLength={40}
          required
          className="rounded-lg border border-white/15 px-3 py-2 text-sm"
        />
        <button
          disabled={create.isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Tạo danh mục
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {query.isLoading && <p className="mt-4 text-slate-400">Đang tải...</p>}
      {query.isError && <p className="mt-4 text-rose-300">Không tải được danh mục.</p>}
      {query.data && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Đường dẫn</th>
                <th className="px-3 py-2">Số acc</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-2 font-medium">{item.title}</td>
                  <td className="px-3 py-2 text-slate-300">/shop/{item.slug}</td>
                  <td className="px-3 py-2">{item.accountCount ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    {item.locked || (item.accountCount ?? 0) > 0 ? (
                      <span className="text-xs text-slate-500">{item.locked ? 'Mặc định' : 'Còn acc'}</span>
                    ) : (
                      <button onClick={() => remove(item)} className="text-rose-300 hover:text-white">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
