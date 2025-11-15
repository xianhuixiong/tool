# Vercel Storage Application

这是一个基于 Next.js 的个人云储存应用示例，利用 **Vercel Blob** 持久存储文件。您可以通过上传文件、查看列表、下载和删除来管理个人文件。项目设计成适合部署到 Vercel，所以它不依赖服务器硬盘，而是使用 Vercel 提供的对象存储服务。

## 功能

- **上传文件**：通过表单选择任意文件并上传到 Vercel Blob 存储。文件名会自动添加随机后缀，避免重名冲突。
- **列出文件**：页面加载时会获取当前账号下的所有 Blob，并按照上传时间倒序显示。包括文件名、大小和上传时间。
- **下载文件**：点击下载链接可直接在浏览器中下载或打开文件。
- **删除文件**：可以删除列表中的任意文件，删除后会立即刷新列表。

## 使用方式

### 本地开发

1. 确保安装了 Node.js (18+) 和 pnpm/npm/yarn。
2. 克隆或解压此仓库，在项目根目录安装依赖：

   ```bash
   npm install
   # 或者使用 pnpm/yarn
   ```

3. 为了本地测试上传功能，需要在 `.env.local` 文件中设置 `BLOB_READ_WRITE_TOKEN`。这个 token 必须通过 Vercel 仪表盘创建 Blob 存储后获得。参考 [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob) 获取详细步骤。示例：

   ```env
   BLOB_READ_WRITE_TOKEN=YOUR_VERCE_BLOB_TOKEN
   ```

4. 启动开发服务器：

   ```bash
   npm run dev
   ```

5. 打开 [http://localhost:3000](http://localhost:3000) 即可访问界面。您可以上传文件并在列表中查看。

### 部署到 Vercel

1. 将此项目代码推送到 GitHub 或其他版本控制仓库。
2. 在 [Vercel](https://vercel.com/) 仪表盘点击 “New Project” 并选择该仓库导入。
3. 在 “Environment Variables” 部分添加 `BLOB_READ_WRITE_TOKEN`，值来自 Vercel 创建的 Blob Store。根据官方文档，上传文件时需要此 token 来授权写入【605338070722641†L28-L33】。
4. 部署完成后，您即可使用生成的 URL 访问应用，并享受持久文件存储功能。

## 注意事项

- **上传大小限制**：Vercel 的服务函数限制了单次上传的最大请求大小（目前约 4.5 MB）【605338070722641†L114-L115】。如果需要上传更大的文件，请在客户端直接上传到 Blob Store（可使用客户端 SDK），或者分片上传。
- **删除操作**：删除操作不可恢复，操作前会弹出确认提示。
- **公共访问**：上传的 Blob 默认设置为 `public`，任何拥有 URL 的人都可以访问。如果需要私有访问，可调整 `access` 参数。

## 技术说明

该项目采用 Next.js 14 的 `app` 目录结构，前端为 React 客户端组件，后端 API 使用 Next.js Edge/Serverless 路由。所有文件存储均通过 `@vercel/blob` 包完成：

- `app/api/upload/route.js`：使用 `put` 将上传的文件保存到 Blob，添加随机后缀防止重名。
- `app/api/files/route.js`：使用 `list` 列出当前所有 Blob。
- `app/api/delete/route.js`：使用 `del` 根据 pathname 删除指定文件。
- 客户端 `app/page.jsx`：提供上传表单、列表表格，并通过 `fetch` 调用上述接口。

通过这种方式，即使部署在 Vercel 这种无状态平台，也可以持久保存用户上传的数据，满足您需要的“永久储存空间”要求【669747003075547†L144-L161】。