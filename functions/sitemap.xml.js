import { fetchPages, pagePath, qaPath } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pages = await fetchPages(env);
  const urls = [];

  function walk(list) {
    (list || []).forEach((p) => {
      urls.push(url.origin + pagePath(p));
      if (p.type === 'qa') {
        (p.qa || []).forEach((item) => {
          if (item.id) urls.push(url.origin + qaPath(p, item));
        });
      }
      if (p.children && p.children.length) walk(p.children);
    });
  }
  if (pages) walk(pages);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `<url><loc>${escXml(u)}</loc></url>`).join('\n') +
    `\n</urlset>`;

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}

function escXml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
