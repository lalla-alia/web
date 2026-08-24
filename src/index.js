const SUPABASE_URL_DEFAULT = 'https://karftzjwbmknyditmuoc.supabase.co';
const SUPABASE_ANON_KEY_DEFAULT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcmZ0emp3Ym1rbnlkaXRtdW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDEwNzMsImV4cCI6MjEwMjQ3NzA3M30.qApKM6CBT-SFB-g6AZUhYwiOz-mw3mxKUBt8ujzOagY';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
      return handleSitemap(url, env);
    }

    if (request.method === 'GET' && url.pathname.startsWith('/p/')) {
      return handlePageSSR(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function fetchPages(env) {
  const SUPABASE_URL = env.SUPABASE_URL || SUPABASE_URL_DEFAULT;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_DEFAULT;
  try {
    const res = await fetch(SUPABASE_URL + '/functions/v1/site-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'getSiteData', payload: {} }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json && json.data && json.data.pages) || null;
  } catch (e) {
    return null;
  }
}

function findPageById(list, id) {
  for (const p of list || []) {
    if (p.id === id) return p;
    if (p.children && p.children.length) {
      const found = findPageById(p.children, id);
      if (found) return found;
    }
  }
  return null;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function slugify(text) {
  return (text || '')
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function pagePath(p) {
  return '/p/' + p.id + (slugify(p.title) ? '-' + slugify(p.title) : '');
}

function qaPath(p, item) {
  return pagePath(p) + '/' + item.id + (slugify(item.q) ? '-' + slugify(item.q) : '');
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

async function handlePageSSR(request, url, env) {
  const parts = url.pathname.split('/').filter(Boolean); // ['p', 'pageId-slug', 'qaId-slug'?]
  const pageId = (parts[1] || '').split('-')[0];
  const qaId = parts[2] ? parts[2].split('-')[0] : null;

  const shellRes = await env.ASSETS.fetch(new URL('/index.html', url.origin));
  let shellHtml = await shellRes.text();

  if (!pageId) {
    return new Response(shellHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const pages = await fetchPages(env);
  const page = pages ? findPageById(pages, pageId) : null;

  if (!page) {
    return new Response(shellHtml, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const qaItem = qaId && page.qa ? page.qa.find((x) => x.id === qaId) : null;

  const title = qaItem ? `${qaItem.q} | ${page.title}` : page.title;
  const description = qaItem
    ? stripHtml(qaItem.a).slice(0, 160)
    : stripHtml(page.content || page.subtitle || page.title).slice(0, 160);
  const canonical = url.origin + url.pathname;

  let content;
  if (qaItem) {
    content = `<h1>${escHtml(qaItem.q)}</h1><div>${qaItem.a || ''}</div>`;
  } else if (page.type === 'qa') {
    content =
      `<h1>${escHtml(page.title)}</h1>` +
      (page.qa || []).map((i) => `<h2>${escHtml(i.q)}</h2><div>${i.a || ''}</div>`).join('');
  } else if (page.type === 'content') {
    content = `<h1>${escHtml(page.title)}</h1><div>${page.content || ''}</div>`;
  } else {
    content = `<h1>${escHtml(page.title)}</h1>`;
  }

  let schema = '';
  if (qaItem) {
    schema = jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: qaItem.q, acceptedAnswer: { '@type': 'Answer', text: stripHtml(qaItem.a || '') } },
      ],
    });
  } else if (page.type === 'qa' && page.qa && page.qa.length) {
    schema = jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.qa.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: stripHtml(i.a || '') },
      })),
    });
  }

  shellHtml = shellHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escHtml(title)}</title>`)
    .replace(
      '</head>',
      `<meta name="description" content="${escHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(description)}">
<meta property="og:type" content="website">
${schema}
</head>`
    )
    .replace('<main id="mainContent"></main>', `<main id="mainContent">${content}</main>`);

  return new Response(shellHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function handleSitemap(url, env) {
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
