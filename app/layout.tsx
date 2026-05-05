import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/AuthContext';

export const metadata: Metadata = {
  title: '동화나라 — AI로 만드는 우리 아이만의 동화',
  description: '아이의 이름과 테마를 입력하면 세상에 하나뿐인 동화가 완성됩니다',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* 앱 전체에 로그인 상태 공유 */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}