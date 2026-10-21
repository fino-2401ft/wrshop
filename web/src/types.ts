export type Category = string;
export type AccountStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';
export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'INSTALLMENT' | 'ABANDONED';

export type AccountSpecs = {
  heroes?: string;
  skins?: string;
  rank?: string;
  frame?: string;
  rankHt?: string;
  frameHt?: string;
};

export type AccountCard = {
  id: string;
  publicCode: number;
  category: Category;
  categoryTitle?: string;
  categorySlug?: string;
  price: number;
  description: string;
  specs: AccountSpecs;
  status: AccountStatus;
  isHot?: boolean;
  coverUrl: string | null;
  createdAt: string;
};

export type AccountImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

export type AccountDetail = AccountCard & {
  images: AccountImage[];
  forSale?: boolean;
};

export type AdminAccount = AccountDetail & {
  gameUser: string;
  gamePass: string;
  contributed: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  cost: number;
  profit: number;
  consignment: boolean;
  isHot: boolean;
  dueAt: string | null;
  orders: {
    id: string;
    code: string;
    buyerName: string;
    phone: string;
    email: string | null;
    amount: number;
    status: OrderStatus;
    createdAt: string;
  }[];
  images: (AccountImage & { key: string })[];
};

export type OrderRow = {
  id: string;
  code: string;
  buyerName: string;
  phone: string;
  email: string | null;
  amount: number;
  remaining: number | null;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  dueAt: string | null;
  daysLeft: number | null;
  reclaimed: boolean;
  accountId: string;
  accountCode: number;
  gameUser: string;
  gamePass: string;
  category: Category;
  categoryTitle?: string;
};

export type DueAccount = {
  orderId: string;
  accountId: string;
  code: string;
  accountCode: number;
  gameUser: string;
  gamePass: string;
  categoryTitle: string;
  buyerName: string;
  email: string | null;
  phone: string;
  remaining: number;
  dueAt: string;
  daysLeft: number;
  remindedSoon: boolean;
  remindedDue: boolean;
  hasEmail: boolean;
};

export type ShopCategory = {
  id: string;
  code: string;
  slug: string;
  title: string;
  accountCount?: number;
  locked?: boolean;
};

export function categoryCodeForPrice(price: number) {
  if (price >= 5_000_000) return 'VIP';
  if (price >= 1_000_000) return 'NGON';
  return 'GIA_RE';
}

export const CATEGORIES: { key: Category; slug: string; title: string; blurb: string }[] = [
  { key: 'VIP', slug: 'vip', title: 'PREMIUM ACCOUNT', blurb: 'Nhiều tướng, nhiều skin, rank cao' },
  { key: 'NGON', slug: 'ngon', title: 'VIP ACCOUNT', blurb: 'Đồ ổn, giá dễ chịu' },
  { key: 'GIA_RE', slug: 'gia-re', title: 'CHEAP ACCOUNT', blurb: 'Nhẹ túi, vào game là chơi' },
];

export const RANKS = [
  'Sắt',
  'Đồng',
  'Bạc',
  'Vàng',
  'Bạch Kim',
  'Lục Bảo',
  'Kim Cương',
  'Cao Thủ',
  'Đại Cao Thủ',
  'Thách Đấu',
  'Tối cao',
];

export const RANK_HT = ['Chiến Binh', 'Tướng Soái', 'Vệ Binh', 'Chinh Phục', 'Bất Tử', 'Huyền Thoại'];

export const STATUS_LABEL: Record<AccountStatus, string> = {
  AVAILABLE: 'Đang bán',
  RESERVED: 'Đang góp',
  SOLD: 'Đã bán',
  HIDDEN: 'Đã ẩn',
};

export function categoryMeta(key: Category) {
  return (
    CATEGORIES.find((item) => item.key === key) ?? {
      key,
      slug: key,
      title: key,
      blurb: '',
    }
  );
}

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((item) => item.slug === slug);
}

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

export function specText(value?: string) {
  const text = value?.trim();
  return text ? text : 'Không có';
}
