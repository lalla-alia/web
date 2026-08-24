import { fetchPages, findPageById, stripHtml, escHtml } from '../_shared.js';

// يطابق أي رابط يبدأ بـ /p/  (مثال: /p/p_ab12cd3-عن-الموقع/p_x9y8z7-كيف-اشترك)
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // ['p', 'pageId-slug', 'qaId-slug'?]

  const pageId = (parts[1] || '').split('-')[0];
  const qaId = parts[2] ? parts[2].split('-')[0] : null;

  // الصفحة الأساسية (index.html) كما هي، مع كل عناصر الواجهة (القائمة، النوافذ، السكربتات...)
  const shellRes = await env.ASSETS.fetch(new URL('/index.html', url.origin));
  let shellHtml = await shellRes.text();

  if (!pageId) {
    return new Response(shellHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const pages = await fetchPages(env);
  const page = pages ? findPageById(pages, pageId) : null;

  if (!page) {
    // رابط غير موجود: أعد الواجهة العادية بحالة 404 بدل كسر الموقع
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
    // نملأ main بالمحتوى الحقيقي؛ سكربت الموقع سيعيد رسمه بعد التحميل بدون أي فرق للزائر
    .replace('<main id="mainContent"></main>', `<main id="mainContent">${content}</main>`);

  return new Response(shellHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}
