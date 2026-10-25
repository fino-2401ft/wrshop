import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ApiError, api } from '../api';
import { Seo } from '../components/Seo';
import { formatPrice } from '../types';
import { ZALO_URL } from '../zalo';

type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'TAKEN';

type PaymentView = {
  code: string;
  accountCode: number;
  amount: number;
  status: PaymentStatus;
  expiresAt: string;
  email: string;
  qrUrl: string;
  bankCode: string;
  bankAccount: string;
  accountName: string;
  transferContent: string;
  emailSent: boolean;
  credentials: { username: string; password: string } | null;
};

export function PaymentPage() {
  const { code = '' } = useParams();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['payment', code],
    queryFn: () => api<PaymentView>(`/api/payments/${code}`),
    enabled: Boolean(code),
    refetchInterval: (current) => {
      const status = current.state.data?.status;
      return status === 'PENDING' || status === 'EXPIRED' ? 4000 : false;
    },
  });
  const complete = useMutation({
    mutationFn: () => api<PaymentView>(`/api/payments/${code}/complete`, { method: 'POST' }),
    onSuccess: (payment) => client.setQueryData(['payment', code], payment),
  });
  const completeError = complete.error instanceof ApiError ? complete.error.message : complete.error ? 'Không kiểm tra được giao dịch' : '';

  if (query.isLoading) return <p className="text-slate-400">Đang tải thanh toán...</p>;
  if (query.isError || !query.data) {
    return (
      <div>
        <p className="text-rose-300">Không tìm thấy đơn thanh toán.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-[#f9a8d4]">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const payment = query.data;
  return (
    <div className="mx-auto w-full max-w-lg">
      <Seo
        title={`Thanh toán acc #${payment.accountCode}`}
        description="Trang thanh toán đơn hàng acc tốc chiến. Không công khai trên công cụ tìm kiếm."
        path={`/thanh-toan/${payment.code}`}
        noindex
      />
      <h1 className="text-center text-2xl font-bold text-white">Thanh toán acc #{payment.accountCode}</h1>
      <p className="mt-2 text-center text-sm text-slate-400">{formatPrice(payment.amount)}</p>
      {payment.status === 'PAID' && payment.credentials ? (
        <PaidCard payment={payment} />
      ) : payment.status === 'TAKEN' ? (
        <TakenCard accountCode={payment.accountCode} />
      ) : payment.status === 'EXPIRED' ? (
        <ExpiredCard
          accountCode={payment.accountCode}
          email={payment.email}
          checking={complete.isPending}
          error={completeError}
          onComplete={() => complete.mutate()}
        />
      ) : (
        <PendingCard
          payment={payment}
          checking={complete.isPending}
          error={completeError}
          onComplete={() => complete.mutate()}
        />
      )}
    </div>
  );
}

function PendingCard({
  payment,
  checking,
  error,
  onComplete,
}: {
  payment: PaymentView;
  checking: boolean;
  error: string;
  onComplete: () => void;
}) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(payment.expiresAt).getTime() - Date.now()));
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft(Math.max(0, new Date(payment.expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [payment.expiresAt]);
  const minutes = String(Math.floor(left / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');

  return (
    <section className="mt-5 rounded-2xl border border-[#f472b644] bg-[#1c1018] p-5 text-[#f8eef4]">
      <p className="text-center text-sm text-slate-300">
        Quét QR và chuyển khoản đúng số tiền, giữ nguyên nội dung. Acc vẫn đang bán. Ai chuyển khoản thành công trước sẽ nhận acc.
      </p>
      <img src={payment.qrUrl} alt="Mã QR thanh toán" className="mx-auto mt-4 w-56 rounded-xl bg-white p-2" />
      <p className="mt-4 text-center text-sm font-semibold text-amber-200">
        {left > 0 ? `Còn ${minutes}:${seconds}` : 'Đang hết hạn...'}
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <Row label="Ngân hàng" value={payment.bankCode} />
        <Row label="Số tài khoản" value={payment.bankAccount} copy />
        {payment.accountName && <Row label="Chủ tài khoản" value={payment.accountName} />}
        <Row label="Số tiền" value={formatPrice(payment.amount)} />
        <Row label="Nội dung CK" value={payment.transferContent} copy />
      </dl>
      <p className="mt-4 text-center text-sm leading-6 text-slate-300">
        Hệ thống đang tự kiểm tra giao dịch. Khi tiền vào, thông tin acc hiện tại đây và gửi tới {payment.email}. Nhớ kiểm tra cả mục Spam.
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">Nếu trang chưa cập nhật, bấm Kiểm tra lại.</p>
      <CompleteButton checking={checking} error={error} onComplete={onComplete} />
    </section>
  );
}

function PaidCard({ payment }: { payment: PaymentView }) {
  const credentials = payment.credentials;
  if (!credentials) return null;
  return (
    <section className="mt-5 rounded-2xl border border-emerald-400/40 bg-[#102018] p-5 text-[#f8eef4]">
      <h2 className="text-lg font-bold text-emerald-200">Thanh toán thành công</h2>
      <p className="mt-2 text-sm leading-6 text-slate-200">
        {payment.emailSent
          ? `Đã gửi thông tin acc tới ${payment.email}. Hãy kiểm tra Gmail, kể cả mục Spam / Thư rác.`
          : `Chưa gửi được email tới ${payment.email}. Hãy lưu thông tin bên dưới và kiểm tra Gmail (kể cả Spam) sau.`}
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <Row label="Tài khoản" value={credentials.username} copy />
        <Row label="Mật khẩu" value={credentials.password} copy />
      </dl>
      <p className="mt-4 text-sm leading-6 text-amber-100">
        Bạn cần đổi thông tin liên hệ của acc. Cần hỗ trợ thì nhắn Zalo.
      </p>
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0068FF] py-2.5 text-sm font-semibold text-white"
      >
        Nhắn Zalo
      </a>
    </section>
  );
}

function TakenCard({ accountCode }: { accountCode: number }) {
  return (
    <section className="mt-5 rounded-2xl border border-[#f472b644] bg-[#1c1018] p-5 text-[#f8eef4]">
      <h2 className="text-lg font-bold">Acc đã được thanh toán bởi người khác</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Người khác đã chuyển khoản thành công trước. Nếu bạn đã chuyển khoản, nhắn Zalo để shop kiểm tra.
      </p>
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0068FF] py-2.5 text-sm font-semibold text-white"
      >
        Nhắn Zalo
      </a>
      <Link
        to={`/acc/${accountCode}`}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-white/10 py-2.5 text-sm font-semibold text-white"
      >
        Về trang acc
      </Link>
    </section>
  );
}

function ExpiredCard({
  accountCode,
  email,
  checking,
  error,
  onComplete,
}: {
  accountCode: number;
  email: string;
  checking: boolean;
  error: string;
  onComplete: () => void;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-[#f472b644] bg-[#1c1018] p-5 text-[#f8eef4]">
      <h2 className="text-lg font-bold">Đơn đã hết hạn</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Hệ thống vẫn đang tự kiểm tra. Nếu bạn đã chuyển khoản, thông tin acc sẽ hiện khi tiền được xác nhận và gửi tới {email}.
      </p>
      <CompleteButton checking={checking} error={error} onComplete={onComplete} />
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-full bg-[#0068FF] py-2.5 text-sm font-semibold text-white"
      >
        Nhắn Zalo
      </a>
      <Link
        to={`/acc/${accountCode}`}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-white/10 py-2.5 text-sm font-semibold text-white"
      >
        Về trang acc
      </Link>
    </section>
  );
}

function CompleteButton({
  checking,
  error,
  onComplete,
}: {
  checking: boolean;
  error: string;
  onComplete: () => void;
}) {
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={checking}
        onClick={onComplete}
        className="w-full rounded-full border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
      >
        {checking ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-300">{error}</p>}
    </div>
  );
}

function Row({ label, value, copy = false }: { label: string; value: string; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-right font-semibold">
        <span className="break-all font-mono">{value}</span>
        {copy && (
          <button
            type="button"
            className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white"
            onClick={() => {
              void navigator.clipboard.writeText(value).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? 'Đã chép' : 'Chép'}
          </button>
        )}
      </span>
    </div>
  );
}
