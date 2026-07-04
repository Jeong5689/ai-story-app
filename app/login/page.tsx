'use client';
// 로그인 페이지
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '../../lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await signIn(email, password);
      // 로그인 성공 시 홈으로 이동
      router.push('/');
    } catch (error: unknown) {
      console.error('로그인 오류:', error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        setErrorMessage('존재하지 않는 이메일입니다');
      } else if (firebaseError.code === 'auth/wrong-password') {
        setErrorMessage('비밀번호가 올바르지 않습니다');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrorMessage('이메일 형식이 올바르지 않습니다');
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다');
      } else {
        setErrorMessage('로그인에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-4xl font-bold text-purple-600 cursor-pointer">
              🌟 동화나라
            </div>
          </Link>
          <p className="text-gray-500 mt-2">로그인하고 동화를 만들어보세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            로그인
          </h1>

          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* 오류 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
              {errorMessage}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white text-lg py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          {/* 회원가입 링크 */}
          <p className="text-center text-gray-500 mt-6 text-sm">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup">
              <span className="text-purple-600 font-bold cursor-pointer hover:underline">
                회원가입
              </span>
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}