import { handleUpload } from '@vercel/blob/client';

// Issues short-lived tokens so the browser can upload straight to Vercel Blob
// (no 4.5 MB function body limit).
export async function POST(request) {
  const body = await request.json();
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('files/')) throw new Error('Invalid path');
        return { addRandomSuffix: false, maximumSizeInBytes: 500 * 1024 * 1024 };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
