import { list } from '@vercel/blob';

/**
 * API route to list all files stored in the Vercel Blob storage for this project.
 * Responds to GET requests with a JSON array of blob metadata including
 * pathname, size, content type and upload timestamp. The blobs are listed
 * newest first by default.
 *
 * @returns {Response} JSON response containing an array of blobs
 */
export async function GET() {
  try {
    const { blobs } = await list();
    return new Response(JSON.stringify(blobs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return new Response(JSON.stringify({ message: 'Failed to list files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}