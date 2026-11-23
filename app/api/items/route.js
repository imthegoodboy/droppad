import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

// Returns every stored item, newest first. Text messages are inlined.
export async function GET() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const items = await Promise.all(
    blobs.map(async (b) => {
      const isText = b.pathname.startsWith('texts/');
      const item = {
        kind: isText ? 'text' : 'file',
        name: b.pathname.split('/').pop(),
        url: b.url,
        downloadUrl: b.downloadUrl,
        size: b.size,
        time: b.uploadedAt,
      };
      if (isText) item.text = await fetch(b.url).then((r) => r.text()).catch(() => '');
      return item;
    })
  );

  // uploadedAt is only second-precise; paths carry a ms timestamp, so prefer that.
  const ms = (it) => Number(it.url.match(/\/(\d{13})-/)?.[1]) || new Date(it.time).getTime();
  items.sort((a, b) => ms(b) - ms(a));
  return Response.json(items);
}
