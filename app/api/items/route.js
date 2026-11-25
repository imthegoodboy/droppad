import { head } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { addCacheTag, dangerouslyDeleteByTag } from '@vercel/functions';

export const dynamic = 'force-dynamic';

// Messages live in Postgres (Neon). Files themselves live in Vercel Blob.
let client;
const sql = () => (client ??= neon(process.env.DATABASE_URL));
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const TAG = 'items';

// GET: the whole list, newest first. Vercel's CDN keeps a copy until something
// new is saved, so the page can check for new messages every few seconds for free.
export async function GET() {
  const items = await sql()`
    select id, kind, text, name, url, download_url as "downloadUrl", time
    from items order by time desc`;
  await addCacheTag(TAG);
  return Response.json(items, {
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Vercel-CDN-Cache-Control': 'max-age=31536000',
    },
  });
}

// POST { text } or { url } (url = a file just uploaded to our Blob store)
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (typeof body.text === 'string') {
    if (!body.text.trim() || body.text.length > 50000) return Response.json({ error: 'Bad text' }, { status: 400 });
    await sql()`insert into items (id, kind, text) values (${id()}, 'text', ${body.text})`;
  } else if (typeof body.url === 'string') {
    // head() only succeeds for blobs in our own store, so nobody can inject outside links
    const blob = await head(body.url).catch(() => null);
    if (!blob || !blob.pathname.startsWith('files/')) return Response.json({ error: 'Bad file' }, { status: 400 });
    await sql()`
      insert into items (id, kind, name, url, download_url)
      values (${id()}, 'file', ${blob.pathname.split('/').pop()}, ${blob.url}, ${blob.downloadUrl})`;
  } else {
    return Response.json({ error: 'Nothing to save' }, { status: 400 });
  }

  await dangerouslyDeleteByTag(TAG); // drop the cached list so everyone sees the new message
  return Response.json({ ok: true });
}
