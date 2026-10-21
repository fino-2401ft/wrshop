import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { DueAccount, OrderRow, formatPrice } from '../../types';
import { SecretValue } from '../../components/SecretValue';

const ORDER_LABEL = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã bán',
  EXPIRED: 'Hết hạn',
  INSTALLMENT: 'Đang góp',
  ABANDONED: 'Bỏ góp',
} as const;

type ListResponse = {
  month: string;
  mailConfigured: boolean;
  dueSoon: DueAccount[];
  items: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    revenue: number;
    soldAccounts: number;
    installmentAccounts: number;
    remainingInstallment: number;
    received: number;
    profit: number;
  };
};

function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string) {
  const [year, mon] = month.split('-');
  return `tháng ${Number(mon)}/${year}`;
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
}

function dueText(daysLeft: number) {
  if (daysLeft < 0) return `Quá hạn ${-daysLeft} ngày`;
  if (daysLeft === 0) return 'Đến hạn hôm nay';
  return `Còn ${daysLeft} ngày`;
}

function mailText(item: DueAccount) {
  if (!item.hasEmail) return 'Không có email';
  if (item.daysLeft <= 0 && item.remindedDue) return 'Đã nhắc ngày hạn';
  if (item.daysLeft > 0 && item.remindedSoon) return 'Đã nhắc trước hạn';
  return 'Chờ gửi mail';
}

export function OrdersPage() {
  const client = useQueryClient();
  const [month, setMonth] = useState(thisMonth);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [notice, setNotice] = useState('');
  const query = useQuery({
    queryKey: ['admin-orders', month, appliedQ],
    queryFn: () => api<ListResponse>(`/api/admin/orders?month=${month}&q=${encodeURIComponent(appliedQ)}`, {}, true),
  });
  const reclaim = useMutation({
    mutationFn: (orderId: string) => api<{ publicCode: number }>(`/api/admin/orders/${orderId}/reclaim`, { method: 'POST' }, true),
    onSuccess: async (saved) => {
      setNotice(`Đã thu lại. Acc mới #${saved.publicCode} nằm đầu danh sách để bạn cập nhật.`);
      await client.invalidateQueries({ queryKey: ['admin-orders'] });
      await client.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const settle = useMutation({
    mutationFn: (orderId: string) => api(`/api/admin/orders/${orderId}/settle`, { method: 'POST' }, true),
    onSuccess: async () => {
      setNotice('Đã tất toán. Doanh thu thực nhận tháng này được cộng số tiền còn thiếu.');
      await client.invalidateQueries({ queryKey: ['admin-orders'] });
      await client.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const remove = useMutation({
    mutationFn: (orderId: string) => api<{ ok: boolean; code: string }>(`/api/admin/orders/${orderId}`, { method: 'DELETE' }, true),
    onSuccess: async (saved) => {
      setNotice(`Đã xóa đơn ${saved.code}.`);
      await client.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const stats = query.data?.stats;
  const label = monthLabel(month);
  const dueSoon = query.data?.dueSoon ?? [];
  const overdue = dueSoon.filter((item) => item.daysLeft < 0).length;

  function reclaimAccount(order: OrderRow) {
    const installment = order.status === 'INSTALLMENT';
    const message = installment
      ? `Thu lại acc #${order.accountCode}? Đơn cũ thành Bỏ góp. Doanh thu và lợi nhuận của tháng bán acc ghi bằng số tiền đã góp, không theo giá bán. Acc mới được tạo để bạn cập nhật.`
      : `Thu lại acc #${order.accountCode}? Đơn của người mua được giữ nguyên. Acc mới được tạo ở đầu danh sách để bạn cập nhật.`;
    if (!confirm(message)) return;
    setNotice('');
    reclaim.mutate(order.id);
  }

  function reclaimInstallment(item: { orderId: string; accountCode: number }) {
    if (!item.orderId) return;
    const message = `Thu lại acc #${item.accountCode}? Đơn cũ thành Bỏ góp. Doanh thu và lợi nhuận của tháng bán acc ghi bằng số tiền đã góp, không theo giá bán. Acc mới được tạo để bạn cập nhật.`;
    if (!confirm(message)) return;
    setNotice('');
    reclaim.mutate(item.orderId);
  }

  function settleAccount(item: { orderId: string; accountCode: number }) {
    if (!item.orderId) return;
    if (!confirm(`Tất toán acc #${item.accountCode} và chuyển sang Đã bán?`)) return;
    setNotice('');
    settle.mutate(item.orderId);
  }

  function removeOrder(order: OrderRow) {
    if (!confirm(`Xóa đơn ${order.code} (acc #${order.accountCode}) khỏi danh sách? Acc liên quan vẫn giữ nguyên.`)) return;
    setNotice('');
    remove.mutate(order.id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedQ(q.trim());
          }}
        >
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Mã đơn, acc, username, người mua..."
            className="rounded-lg border border-white/15 px-3 py-2 text-sm"
          />
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-[#f472b644] px-4 py-2 text-sm text-[#f9a8d4]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
            </svg>
            Tìm
          </button>
          <label className="text-sm text-slate-300">
            Tháng
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value || thisMonth())}
              className="ml-2 rounded-lg border border-white/15 px-3 py-2"
            />
          </label>
        </form>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Doanh thu</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatPrice(stats?.revenue ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-400">Acc đã bán, đang góp và tiền đã góp khi thu lại trong {label}</p>
        </article>
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Doanh thu thực nhận</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatPrice(stats?.received ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-400">Tiền bán, tiền đã góp và lợi nhuận acc bán hộ trong {label}</p>
        </article>
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Tổng góp còn lại</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatPrice(stats?.remainingInstallment ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-400">Phần còn lại của mọi acc đang góp</p>
        </article>
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Lợi nhuận</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatPrice(stats?.profit ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-400">Lãi acc đã bán và số tiền đã góp khi thu lại trong {label}</p>
        </article>
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Acc đã bán</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats?.soldAccounts ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Số acc chuyển sang đã bán trong {label}</p>
        </article>
        <article className="rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-[#f9a8d4]">Acc đang góp</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats?.installmentAccounts ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Số acc đang góp trên hệ thống</p>
        </article>
      </div>
      {notice && <p className="mt-3 text-sm text-[#f9a8d4]">{notice}</p>}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-white">
          Danh sách đơn tháng này{query.data ? `: ${query.data.total}` : ''}
        </h2>
        {query.isLoading && <p className="mt-4 text-slate-400">Đang tải...</p>}
        {query.isError && <p className="mt-4 text-rose-300">Không tải được đơn hàng.</p>}
        {query.data && query.data.items.length === 0 && (
          <p className="mt-3 rounded-2xl border border-dashed border-[#f472b644] px-4 py-10 text-center text-sm text-slate-400">
            {appliedQ ? `Không có đơn khớp “${appliedQ}” trong ${label}.` : `Chưa có đơn trong ${label}.`}
          </p>
        )}
        {query.data && query.data.items.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 shadow-[0_18px_36px_rgba(0,0,0,0.45)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Mã đơn</th>
                  <th className="px-3 py-2">Acc</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Mật khẩu</th>
                  <th className="px-3 py-2">Người mua</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">SĐT</th>
                  <th className="px-3 py-2">Số tiền</th>
                  <th className="px-3 py-2">Còn thiếu</th>
                  <th className="px-3 py-2">Ngày mua</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Thu lại</th>
                  <th className="px-3 py-2">Sửa</th>
                  <th className="px-3 py-2">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((order) => (
                  <tr key={order.id} className="border-t border-white/10">
                    <td className="px-3 py-2 font-medium">{order.code}</td>
                    <td className="px-3 py-2">#{order.accountCode}</td>
                    <td className="px-3 py-2">{order.gameUser}</td>
                    <td className="px-3 py-2">
                      <SecretValue value={order.gamePass} />
                    </td>
                    <td className="px-3 py-2">{order.buyerName || '—'}</td>
                    <td className="px-3 py-2">{order.email || '—'}</td>
                    <td className="px-3 py-2">{order.phone || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatPrice(order.amount)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{order.remaining === null ? '—' : formatPrice(order.remaining)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatWhen(order.createdAt)}</td>
                    <td className="px-3 py-2">{ORDER_LABEL[order.status]}</td>
                    <td className="px-3 py-2">
                      {order.reclaimed || order.status === 'ABANDONED' ? (
                        <span className="text-xs font-semibold text-emerald-300">Done</span>
                      ) : order.status === 'PAID' || order.status === 'INSTALLMENT' ? (
                        <button
                          type="button"
                          aria-label="Thu lại"
                          disabled={reclaim.isPending}
                          onClick={() => reclaimAccount(order)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-300 disabled:opacity-60"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/admin/accounts/${order.accountId}`}
                        aria-label="Sửa"
                        title="Sửa"
                        className="inline-grid h-8 w-8 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10 hover:text-white"
                      >
                        <PencilIcon />
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-label="Xóa"
                        title="Xóa"
                        disabled={remove.isPending}
                        onClick={() => removeOrder(order)}
                        className="inline-grid h-8 w-8 place-items-center rounded-full text-rose-300 hover:bg-white/10 disabled:opacity-60"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Acc đang góp</h2>
        <p className="mt-1 text-sm text-slate-400">
          {`Mail nhắc gửi cho khách 3 ngày trước hạn và đúng ngày đến hạn${
            query.data && !query.data.mailConfigured ? '. Chưa cấu hình hộp thư SMTP nên mail chưa gửi được.' : '.'
          }`}
        </p>
        {overdue > 0 && (
          <p className="mt-3 rounded-xl border border-rose-500 bg-rose-950 px-4 py-3 text-sm font-semibold text-rose-100">
            Có {overdue} acc quá hạn tất toán. Dòng màu đỏ là acc cần kiểm tra và đổi thông tin.
          </p>
        )}
        {dueSoon.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#f472b644] px-4 py-8 text-center text-sm text-slate-400">
            Chưa có acc đang góp.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[#f472b644] bg-[#1c1018]/95">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Acc</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Mật khẩu</th>
                  <th className="px-3 py-2">Người mua</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">SĐT</th>
                  <th className="px-3 py-2">Còn thiếu</th>
                  <th className="px-3 py-2">Hạn</th>
                  <th className="px-3 py-2">Tình trạng</th>
                  <th className="px-3 py-2">Mail</th>
                  <th className="px-3 py-2">Thu lại</th>
                  <th className="px-3 py-2">Tất toán?</th>
                  <th className="px-3 py-2">Sửa</th>
                </tr>
              </thead>
              <tbody>
                {dueSoon.map((item) => (
                  <tr key={item.accountId} className={item.daysLeft < 0 ? 'border-t border-rose-500/40 bg-rose-950/80 text-rose-50' : 'border-t border-white/10'}>
                    <td className="px-3 py-2 font-medium">#{item.accountCode}</td>
                    <td className="px-3 py-2">{item.gameUser}</td>
                    <td className="px-3 py-2">
                      <SecretValue value={item.gamePass} />
                    </td>
                    <td className="px-3 py-2">{item.buyerName || '—'}</td>
                    <td className="px-3 py-2">{item.email || '—'}</td>
                    <td className="px-3 py-2">{item.phone || '—'}</td>
                    <td className="px-3 py-2 font-semibold">{formatPrice(item.remaining)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDay(item.dueAt)}</td>
                    <td className="px-3 py-2 font-semibold">{dueText(item.daysLeft)}</td>
                    <td className="px-3 py-2">{mailText(item)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-label="Thu lại"
                        title="Thu lại"
                        disabled={reclaim.isPending || !item.orderId}
                        onClick={() => reclaimInstallment(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-300 disabled:opacity-60"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-label="Tất toán"
                        disabled={settle.isPending || !item.orderId}
                        onClick={() => settleAccount(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-300 disabled:opacity-60"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/admin/accounts/${item.accountId}`}
                        aria-label="Sửa"
                        title="Sửa"
                        className="inline-grid h-8 w-8 place-items-center rounded-full text-[#f9a8d4] hover:bg-white/10 hover:text-white"
                      >
                        <PencilIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    </svg>
  );
}
