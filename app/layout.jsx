import './globals.css';

export const metadata = {
  title: '我的云储存空间',
  description: '一个使用 Vercel Blob 实现的个人云储存应用',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}