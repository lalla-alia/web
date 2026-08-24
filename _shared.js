// دوال مشتركة بين functions/p/[[path]].js و functions/sitemap.xml.js

export async function fetchPages(env) {
  const SUPABASE_URL = env.SUPABASE_URL || 'https://karftzjwbmknyditmuoc.supabase.co';
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcmZ0emp3Ym1rbnlkaXRtdW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDEwNzMsImV4cCI6MjEwMjQ3NzA3M30.qApKM6CBT-SFB-g6AZUhYwiOz-mw3mxKUBt8ujzOagY';

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

export function findPageById(list, id) {
  for (const p of list || []) {
    if (p.id === id) return p;
    if (p.children && p.children.length) {
      const found = findPageById(p.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function slugify(text) {
  return (text || '')
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export function pagePath(p) {
  return '/p/' + p.id + (slugify(p.title) ? '-' + slugify(p.title) : '');
}

export function qaPath(p, item) {
  return pagePath(p) + '/' + item.id + (slugify(item.q) ? '-' + slugify(item.q) : '');
}
