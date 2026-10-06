import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import {
  AccountImage,
  AccountSpecs,
  AccountStatus,
  AdminAccount,
  CATEGORIES,
  Category,
  categoryCodeForPrice,
  RANK_HT,
  RANKS,
  STATUS_LABEL,
  ShopCategory,
  formatPrice,
} from '../../types';

const EMPTY_SPECS: Required<AccountSpecs> = {
  heroes: '',
  skins: '',
  rank: '',
  frame: '',
  rankHt: '',
  frameHt: '',
};

type FormState = {
  category: Category;
  price: string;
  description: string;
  status: AccountStatus;
  gameUser: string;
  gamePass: string;
  contributed: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  cost: string;
  profit: string;
  consignment: boolean;
  dueAt: string;
  specs: Required<AccountSpecs>;
};

const EMPTY: FormState = {
  category: 'GIA_RE',
  price: '',
  description: '',
  status: 'AVAILABLE',
  gameUser: '',
  gamePass: '',
  contributed: '',
  buyerName: '',
  buyerEmail: '',
  buyerPhone: '',
  cost: '',
  profit: '',
  consignment: false,
  dueAt: '',
  specs: EMPTY_SPECS,
};

function plusDays(days: number) {
  const key = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function toInputDate(iso: string) {
  return new Date(new Date(iso).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function AccountFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const client = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const profitManual = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const categories = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => api<ShopCategory[]>('/api/accounts/categories'),
  });
  const categoryOptions =
    categories.data ?? CATEGORIES.map((item) => ({ id: item.key, code: item.key, slug: item.slug, title: item.title }));

  const account = useQuery({
    queryKey: ['admin-account', id],
    enabled: !isNew,
    queryFn: () => api<AdminAccount>(`/api/admin/accounts/${id}`, {}, true),
  });

  useEffect(() => {
    if (!account.data) return;
    const auto = account.data.price - (account.data.cost ?? 0);
    const stored = account.data.profit ?? auto;
    profitManual.current = stored !== auto;
    setForm({
      category: categoryCodeForPrice(account.data.price),
      price: String(account.data.price),
      description: account.data.description,
      status: account.data.status,
      gameUser: account.data.gameUser,
      gamePass: account.data.gamePass,
      contributed: String(account.data.contributed ?? 0),
      buyerName: account.data.buyerName ?? '',
      buyerEmail: account.data.buyerEmail ?? '',
      buyerPhone: account.data.buyerPhone ?? '',
      cost: String(account.data.cost ?? 0),
      profit: String(stored),
      consignment: account.data.consignment ?? false,
      dueAt: account.data.dueAt ? toInputDate(account.data.dueAt) : '',
      specs: { ...EMPTY_SPECS, ...account.data.specs },
    });
  }, [account.data]);

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        category: form.category,
        price: Number(form.price),
        description: form.description,
        status: form.status,
        gameUser: form.gameUser,
        gamePass: form.gamePass,
        contributed: Number(form.contributed || 0),
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone,
        cost: Number(form.cost || 0),
        profit: Number(form.profit || 0),
        consignment: form.consignment,
        dueAt: form.status === 'RESERVED' ? form.dueAt : undefined,
        specs: form.specs,
      };
      const saved = isNew
        ? await api<AdminAccount>('/api/admin/accounts', { method: 'POST', body: JSON.stringify(body) }, true)
        : await api<AdminAccount>(`/api/admin/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, true);
      if (isNew) {
        if (coverFile) await uploadFiles(saved.id, [coverFile], 'cover');
        if (galleryFiles.length) await uploadFiles(saved.id, galleryFiles, 'gallery');
      }
      return saved;
    },
    onSuccess: async (saved) => {
      setError('');
      setMessage('Đã lưu acc');
      await client.invalidateQueries({ queryKey: ['admin-accounts'] });
      await client.invalidateQueries({ queryKey: ['admin-orders'] });
      if (isNew) navigate(`/admin/accounts/${saved.id}`);
      else await client.invalidateQueries({ queryKey: ['admin-account', id] });
    },
    onError: (err: Error) => {
      setMessage('');
      setError(err.message);
    },
  });

  async function uploadFiles(accountId: string, files: File[], kind: 'cover' | 'gallery') {
    const data = new FormData();
    files.forEach((file) => data.append('files', file));
    await api(`/api/admin/accounts/${accountId}/images?kind=${kind}`, { method: 'POST', body: data }, true);
  }

  async function upload(files: FileList | null, kind: 'cover' | 'gallery') {
    if (!files?.length || !id || isNew) return;
    try {
      await uploadFiles(id, Array.from(files), kind);
      setError('');
      await client.invalidateQueries({ queryKey: ['admin-account', id] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải ảnh được');
    }
  }

  async function reorder(ids: string[]) {
    await api(`/api/admin/accounts/${id}/images/order`, { method: 'PATCH', body: JSON.stringify({ ids }) }, true);
    await client.invalidateQueries({ queryKey: ['admin-account', id] });
  }

  async function move(imageId: string, direction: -1 | 1) {
    const images = (account.data?.images ?? []).filter((image) => !image.isCover);
    const index = images.findIndex((image) => image.id === imageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= images.length) return;
    const ids = images.map((image) => image.id);
    const [item] = ids.splice(index, 1);
    ids.splice(target, 0, item);
    await reorder(ids);
  }

  async function removeImage(imageId: string) {
    await api(`/api/admin/accounts/${id}/images/${imageId}`, { method: 'DELETE' }, true);
    await client.invalidateQueries({ queryKey: ['admin-account', id] });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(Number(form.price))) {
      setError('Giá phải là số');
      return;
    }
    if (form.status === 'RESERVED') {
      const paid = Number(form.contributed);
      if (!Number.isInteger(paid) || paid < 0) {
        setError('Số tiền đã góp phải là số nguyên');
        return;
      }
      if (paid > Number(form.price)) {
        setError('Số tiền đã góp không được lớn hơn giá acc');
        return;
      }
    }
    const cost = Number(form.cost || 0);
    if (!Number.isInteger(cost) || cost < 0) {
      setError('Giá vốn phải là số nguyên');
      return;
    }
    const profit = Number(form.profit || 0);
    if (!Number.isInteger(profit)) {
      setError('Lợi nhuận phải là số nguyên');
      return;
    }
    if (form.status === 'RESERVED' && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueAt)) {
      setError('Chọn hạn tất toán');
      return;
    }
    save.mutate();
  }

  function setMoney(field: 'price' | 'cost' | 'profit', value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'profit') {
        profitManual.current = true;
        return next;
      }
      const price = Number(next.price || 0);
      if (field === 'price' && Number.isFinite(price)) next.category = categoryCodeForPrice(price);
      if (!profitManual.current) {
        const cost = Number(next.cost || 0);
        if (Number.isFinite(price) && Number.isFinite(cost)) next.profit = String(Math.trunc(price - cost));
      }
      return next;
    });
  }

  function setSpec(key: keyof AccountSpecs, value: string) {
    setForm((current) => ({ ...current, specs: { ...current.specs, [key]: value } }));
  }

  return (
    <div>
      <Link to="/admin" className="text-sm text-[#f9a8d4] hover:text-white">
        ← Danh sách
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-white">{isNew ? 'Thêm acc' : `Sửa acc #${account.data?.publicCode ?? ''}`}</h1>
      {account.isLoading && !isNew && <p className="mt-4 text-slate-400">Đang tải...</p>}
      <form
        onSubmit={submit}
        className="mt-4 grid gap-4 rounded-2xl border border-[#f472b644] bg-[#1c1018]/95 p-5 text-[#f8eef4] shadow-[0_18px_36px_rgba(0,0,0,0.45)] md:grid-cols-2"
      >
        {isNew ? (
          <>
            <PendingImages
              title="Ảnh bìa"
              hint="Một ảnh, hiện trên thẻ acc và đầu trang chi tiết."
              files={coverFile ? [coverFile] : []}
              multiple={false}
              buttonLabel={coverFile ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
              onPick={(files) => setCoverFile(files[0] ?? null)}
              onRemove={() => setCoverFile(null)}
              onMove={() => undefined}
            />
            <PendingImages
              title="Ảnh acc"
              hint="Các ảnh hồ sơ xếp dọc trong trang chi tiết. Có thể chọn nhiều ảnh. Tối đa 20 ảnh."
              files={galleryFiles}
              multiple
              buttonLabel="Thêm ảnh acc"
              onPick={(files) =>
                setGalleryFiles((current) => [...current, ...files].slice(0, 20))
              }
              onRemove={(index) => setGalleryFiles((current) => current.filter((_, item) => item !== index))}
              onMove={(index, direction) =>
                setGalleryFiles((current) => {
                  const target = index + direction;
                  if (target < 0 || target >= current.length) return current;
                  const next = [...current];
                  const [item] = next.splice(index, 1);
                  next.splice(target, 0, item);
                  return next;
                })
              }
            />
          </>
        ) : (
          account.data && (
            <>
              <ImagePanel
                title="Ảnh bìa"
                hint="Một ảnh, hiện trên thẻ acc và đầu trang chi tiết."
                images={account.data.images.filter((image) => image.isCover)}
                multiple={false}
                buttonLabel={account.data.images.some((image) => image.isCover) ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
                onUpload={(files) => upload(files, 'cover')}
                onDelete={removeImage}
              />
              <ImagePanel
                title="Ảnh acc"
                hint="Các ảnh hồ sơ xếp dọc trong trang chi tiết. Kéo hoặc dùng nút để đổi thứ tự. Tối đa 20 ảnh."
                images={account.data.images.filter((image) => !image.isCover)}
                multiple
                buttonLabel="Thêm ảnh acc"
                dragId={dragId}
                onDragStart={setDragId}
                onReorder={(ids) => {
                  setDragId(null);
                  void reorder(ids);
                }}
                onMove={move}
                onUpload={(files) => upload(files, 'gallery')}
                onDelete={removeImage}
              />
            </>
          )
        )}
        <label className="text-sm">
          Username
          <input
            value={form.gameUser}
            onChange={(event) => setForm({ ...form, gameUser: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
            required
          />
        </label>
        <label className="text-sm">
          Password
          <input
            value={form.gamePass}
            onChange={(event) => setForm({ ...form, gamePass: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
            required
          />
        </label>
        <label className="text-sm">
          Danh mục
          <select
            value={form.category}
            disabled
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2 disabled:opacity-100"
          >
            {(['GIA_RE', 'NGON', 'VIP'] as const).map((code) => {
              const item = categoryOptions.find((option) => option.code === code);
              return (
                <option key={code} value={code}>
                  {item?.title ?? code}
                </option>
              );
            })}
          </select>
          <span className="mt-1 block text-xs text-[#f9a8d4]">
            Dưới 1 triệu: Cheap. Từ 1 đến dưới 5 triệu: VIP. Từ 5 triệu: Premium.
          </span>
        </label>
        <label className="text-sm">
          Giá (đồng)
          <input
            value={form.price}
            onChange={(event) => setMoney('price', event.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
            required
          />
        </label>
        <label className="text-sm">
          Giá vốn (đồng)
          <input
            value={form.cost}
            onChange={(event) => setMoney('cost', event.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Lợi nhuận (đồng)
          <input
            value={form.profit}
            onChange={(event) => setMoney('profit', event.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-slate-400">Tự tính bằng giá bán trừ giá vốn. Có thể sửa tay.</span>
        </label>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={form.consignment}
            onChange={(event) => setForm({ ...form, consignment: event.target.checked })}
          />
          Bán hộ?
        </label>
        <label className="text-sm">
          Trạng thái
          <select
            value={form.status}
            onChange={(event) => {
              const status = event.target.value as AccountStatus;
              setForm({
                ...form,
                status,
                dueAt: status === 'RESERVED' && !form.dueAt ? plusDays(30) : form.dueAt,
              });
            }}
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          >
            {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        {form.status === 'RESERVED' && (
          <>
            <label className="text-sm">
              Số tiền đã góp
              <input
                value={form.contributed}
                onChange={(event) => setForm({ ...form, contributed: event.target.value })}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
                required
              />
            </label>
            <label className="text-sm">
              Hạn tất toán
              <input
                type="date"
                value={form.dueAt}
                onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
                required
              />
              <span className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, dueAt: plusDays(30) })}
                  className="rounded-full border border-[#f472b644] px-3 py-1 text-xs text-[#f9a8d4]"
                >
                  30 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, dueAt: plusDays(60) })}
                  className="rounded-full border border-[#f472b644] px-3 py-1 text-xs text-[#f9a8d4]"
                >
                  60 ngày
                </button>
              </span>
            </label>
          </>
        )}
        {(form.status === 'SOLD' || form.status === 'RESERVED') && (
          <>
            <label className="text-sm">
              Người mua
              <input
                value={form.buyerName}
                onChange={(event) => setForm({ ...form, buyerName: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Email
              <input
                type="email"
                value={form.buyerEmail}
                onChange={(event) => setForm({ ...form, buyerEmail: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              SĐT
              <input
                value={form.buyerPhone}
                onChange={(event) => setForm({ ...form, buyerPhone: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
              />
            </label>
            <p className="text-xs text-slate-400 md:col-span-2">
              Người mua, email và số điện thoại có thể để trống. Nếu acc đang góp có email, hệ thống gửi nhắc trước 3 ngày và đúng ngày đến hạn.
            </p>
          </>
        )}
        <label className="text-sm md:col-span-2">
          Mô tả
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
          />
        </label>
        {(
          [
            ['heroes', 'Tướng'],
            ['skins', 'Skin'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              value={form.specs[key]}
              onChange={(event) => setSpec(key, event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
            />
          </label>
        ))}
        <SpecSelect label="Rank" value={form.specs.rank} options={RANKS} onChange={(value) => setSpec('rank', value)} />
        <SpecSelect label="Khung" value={form.specs.frame} options={RANKS} onChange={(value) => setSpec('frame', value)} />
        <SpecSelect label="Rank HT" value={form.specs.rankHt} options={RANK_HT} onChange={(value) => setSpec('rankHt', value)} />
        <SpecSelect label="Khung HT" value={form.specs.frameHt} options={RANK_HT} onChange={(value) => setSpec('frameHt', value)} />
        {error && <p className="text-sm text-rose-300 md:col-span-2">{error}</p>}
        {message && <p className="text-sm text-emerald-300 md:col-span-2">{message}</p>}
        <div className="md:col-span-2">
          <button
            disabled={save.isPending}
            className="rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {save.isPending ? 'Đang lưu...' : 'Lưu acc'}
          </button>
          <p className="mt-2 text-xs text-slate-400">User và mật khẩu game chỉ trả cho khách sau khi thanh toán.</p>
        </div>
      </form>
      {!isNew && <AccountOrders orders={account.data?.orders ?? []} />}
    </div>
  );
}

const SALE_LABEL = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã bán',
  EXPIRED: 'Hết hạn',
  INSTALLMENT: 'Đang góp',
  ABANDONED: 'Bỏ góp',
} as const;

function AccountOrders({ orders }: { orders: AdminAccount['orders'] }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-white">Đơn hàng của acc này</h2>
      {orders.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-[#f472b644] px-4 py-8 text-center text-sm text-slate-400">
          Chưa có đơn. Đơn được tạo khi trạng thái là Đã bán hoặc Đang góp.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#f472b644] bg-[#1c1018]/95">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-3 py-2">Mã đơn</th>
                <th className="px-3 py-2">Người mua</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">SĐT</th>
                <th className="px-3 py-2">Số tiền</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="px-3 py-2 font-medium">{order.code}</td>
                  <td className="px-3 py-2">{order.buyerName || '—'}</td>
                  <td className="px-3 py-2">{order.email || '—'}</td>
                  <td className="px-3 py-2">{order.phone || '—'}</td>
                  <td className="px-3 py-2">{formatPrice(order.amount)}</td>
                  <td className="px-3 py-2">{SALE_LABEL[order.status]}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SpecSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const choices = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label className="text-sm">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 px-3 py-2"
      >
        <option value="">Chọn</option>
        {choices.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function useObjectUrls(files: File[]) {
  const filesRef = useRef(files);
  filesRef.current = files;
  const key = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join('|');
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = filesRef.current.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [key]);
  return urls;
}

function PendingImages({
  title,
  hint,
  files,
  multiple,
  buttonLabel,
  onPick,
  onRemove,
  onMove,
}: {
  title: string;
  hint: string;
  files: File[];
  multiple: boolean;
  buttonLabel: string;
  onPick: (files: File[]) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const previews = useObjectUrls(files);
  return (
    <div className="border-b border-white/10 pb-4 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <label className="cursor-pointer rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-4 py-2 text-sm font-semibold text-white">
          {buttonLabel}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            className="hidden"
            onChange={(event) => {
              onPick(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      <div className="mt-4 space-y-3">
        {previews.map((url, index) => (
          <div key={url} className="flex items-center gap-3 rounded-xl border border-white/10 p-2">
            <img src={url} alt="" className="h-16 w-28 rounded-lg object-cover" />
            <p className="text-sm font-medium">{multiple ? `Ảnh ${index + 1}` : 'Ảnh bìa'}</p>
            <div className="ml-auto flex gap-2 text-sm">
              {multiple && (
                <>
                  <button type="button" onClick={() => onMove(index, -1)} className="rounded-full border px-3 py-1">
                    Lên
                  </button>
                  <button type="button" onClick={() => onMove(index, 1)} className="rounded-full border px-3 py-1">
                    Xuống
                  </button>
                </>
              )}
              <button type="button" onClick={() => onRemove(index)} className="rounded-full border px-3 py-1 text-rose-300">
                Xóa
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p className="text-sm text-slate-400">Chưa có ảnh.</p>}
      </div>
    </div>
  );
}

function ImagePanel({
  title,
  hint,
  images,
  multiple,
  buttonLabel,
  dragId,
  onDragStart,
  onReorder,
  onMove,
  onUpload,
  onDelete,
}: {
  title: string;
  hint: string;
  images: AccountImage[];
  multiple: boolean;
  buttonLabel: string;
  dragId?: string | null;
  onDragStart?: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
  onUpload: (files: FileList | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="border-b border-white/10 pb-4 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <label className="cursor-pointer rounded-full bg-gradient-to-r from-[#9d174d] to-[#db2777] px-4 py-2 text-sm font-semibold text-white">
          {buttonLabel}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            className="hidden"
            onChange={(event) => {
              onUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      <div className="mt-4 space-y-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={Boolean(onReorder)}
            onDragStart={() => onDragStart?.(image.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!onReorder || !dragId || dragId === image.id) return;
              const ids = images.map((item) => item.id);
              const from = ids.indexOf(dragId);
              const to = ids.indexOf(image.id);
              if (from < 0) return;
              ids.splice(from, 1);
              ids.splice(to, 0, dragId);
              onReorder(ids);
            }}
            className="flex items-center gap-3 rounded-xl border border-white/10 p-2"
          >
            <img src={image.url} alt="" className="h-16 w-28 rounded-lg object-cover" />
            <p className="text-sm font-medium">{multiple ? `Ảnh ${index + 1}` : 'Ảnh bìa'}</p>
            <div className="ml-auto flex gap-2 text-sm">
              {onMove && (
                <>
                  <button type="button" onClick={() => onMove(image.id, -1)} className="rounded-full border px-3 py-1">
                    Lên
                  </button>
                  <button type="button" onClick={() => onMove(image.id, 1)} className="rounded-full border px-3 py-1">
                    Xuống
                  </button>
                </>
              )}
              <button type="button" onClick={() => onDelete(image.id)} className="rounded-full border px-3 py-1 text-rose-300">
                Xóa
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="text-sm text-slate-400">Chưa có ảnh.</p>}
      </div>
    </section>
  );
}
