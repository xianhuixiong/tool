"use client";

import { useState, useEffect } from 'react';

/**
 * Main page component providing a simple UI for uploading files, listing
 * existing blobs and deleting them. The table displays the name, size,
 * upload time and actions for each file. Uploads are handled via a
 * standard HTML file input and submitted to the `/api/upload` endpoint.
 */
export default function Home() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch the list of files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  /**
   * Fetch the list of blobs from the API and update local state. If the
   * request fails, an empty list is used to avoid breaking the UI.
   */
  async function fetchFiles() {
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      // Sort by upload time descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setFiles(sorted);
    } catch (error) {
      console.error(error);
      setFiles([]);
    }
  }

  /**
   * Handle file upload. Uses FormData to send the selected file to the API.
   * After a successful upload, refresh the file list and reset the input.
   *
   * @param {Event} e Form submit event
   */
  async function handleUpload(e) {
    e.preventDefault();
    const input = e.target.elements.file;
    const file = input.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      await res.json();
      input.value = '';
      await fetchFiles();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Delete a blob by its pathname via the API. Afterwards, refresh the file list.
   *
   * @param {string} pathname The blob pathname to delete
   */
  async function handleDelete(pathname) {
    if (!confirm('确定要删除这个文件吗？')) return;
    try {
      const res = await fetch(`/api/delete?pathname=${encodeURIComponent(pathname)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await res.json();
      await fetchFiles();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container">
      <h1>我的云储存空间</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="file" accept="*" required disabled={isUploading} />
        <button type="submit" disabled={isUploading}>
          {isUploading ? '上传中...' : '上传文件'}
        </button>
      </form>
      <table>
        <thead>
          <tr>
            <th>文件名</th>
            <th>大小</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.pathname}>
              <td>{f.pathname.split('/').pop()}</td>
              <td>{(f.size / 1024).toFixed(2)} KB</td>
              <td>{new Date(f.uploadedAt).toLocaleString()}</td>
              <td>
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  下载
                </a>
                {" | "}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#d00', cursor: 'pointer' }}
                  onClick={() => handleDelete(f.pathname)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                暂无文件
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}