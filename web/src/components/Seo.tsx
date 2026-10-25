import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, absoluteUrl, pageTitle } from '../seo';

type SeoProps = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  noindex?: boolean;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function Seo({ title, description = DEFAULT_DESCRIPTION, path = '/', image, noindex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = pageTitle(title);
    const url = absoluteUrl(path);
    const ogImage = image?.startsWith('http') ? image : absoluteUrl(image || DEFAULT_OG_IMAGE);

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Wild Rift Store');
    upsertMeta('property', 'og:locale', 'vi_VN');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertLink('canonical', url);
  }, [title, description, path, image, noindex]);

  return null;
}
