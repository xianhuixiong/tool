import { del } from '@vercel/blob';

/**
 * API route to delete a file from Vercel Blob storage. Expects a query
 * parameter named "pathname" identifying the blob to remove. The client
 * should pass the exact pathname returned from the upload or listing APIs.
 *
 * When deletion is successful, a JSON message is returned. If the
 * pathname is missing or invalid, an error response is sent.
 *
 * @param {Request} request Incoming HTTP request from Next.js
 * @returns {Response} JSON response confirming deletion or an error
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return new Response(JSON.stringify({ message: 'Missing pathname' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await del(pathname);

    return new Response(JSON.stringify({ message: 'File deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return new Response(JSON.stringify({ message: 'Delete failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}