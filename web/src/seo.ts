export const SITE_URL = 'https://furywr.com';
export const SITE_NAME = 'Wild Rift Store';
export const DEFAULT_DESCRIPTION =
  'Shop acc tốc chiến uy tín tại Wild Rift Store. Mua acc Wild Rift / tốc chiến giá rẻ, VIP, Premium — thanh toán QR, giao acc nhanh qua email.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero.jpg?v=4`;

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageTitle(title: string) {
  if (!title.trim()) return `${SITE_NAME} — Shop acc tốc chiến`;
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}
