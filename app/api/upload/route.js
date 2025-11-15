import { put } from '@vercel/blob';

/**
 * API route to handle file uploads. This route expects a POST request with
 * multipart form data containing a file field named "file". It leverages
 * Vercel's Blob storage via the `@vercel/blob` package to persist files.
 *
 * If successful, the response includes the blob's pathname and a public
 * URL. You must configure the environment variable `BLOB_READ_WRITE_TOKEN`
 * in your Vercel project for uploads to work. See the README for details.
 *
 * @param {Request} request Incoming HTTP request from Next.js
 * @returns {Response} JSON response with details about the uploaded blob
 */
export async function POST(request) {
  try {
    // Parse the incoming multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate that a file was provided
    if (!file || typeof file.name !== 'string') {
      return new Response(JSON.stringify({ message: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload the file to Vercel Blob storage. The addRandomSuffix option
    // prevents name collisions by appending a unique suffix to the file name.
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return new Response(
      JSON.stringify({ pathname: blob.pathname, url: blob.url }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ message: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}