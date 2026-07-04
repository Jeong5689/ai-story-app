'use client';
// 회원가입 페이지 — 개인정보보호 동의서 팝업 포함
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '../../lib/authService';
import PrivacyModal from '../../components/PrivacyModal';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 가입하기 버튼 클릭 시 동의서 팝업 먼저 표시
  function handleSignupClick() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다');
      return;
    }
    setErrorMessage('');
    // 동의서 팝업 표시
    setShowPrivacyModal(true);
  }

  // 동의서 동의 후 실제 회원가입 진행
  async function handleAgreeAndSignup() {
    setShowPrivacyModal(false);
    setAgreedToTerms(true);
    setIsLoading(true);

    try {
      await signUp(email, password);
      router.push('/');
    } catch (error: unknown) {
      console.error('회원가입 오류:', error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setErrorMessage('이미 사용 중인 이메일입니다');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrorMessage('이메일 형식이 올바르지 않습니다');
      } else if (firebaseError.code === 'auth/weak-password') {
        setErrorMessage('비밀번호가 너무 약합니다. 6자 이상 입력해주세요');
      } else {
        setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-purple-50 to-white flex items-center justify-center px-4">

      {/* 개인정보보호 동의서 팝업 */}
      {showPrivacyModal && (
        <PrivacyModal
          onAgree={handleAgreeAndSignup}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-4xl font-bold text-purple-600 cursor-pointer">
              🌟 동화나라
            </div>
          </Link>
          <p className="text-gray-500 mt-2">가입하고 나만의 동화를 만들어보세요</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            회원가입
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
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              onKeyDown={(e) => e.key === 'Enter' && handleSignupClick()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* 동의 완료 표시 */}
          {agreedToTerms && (
            <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
              <span>✓</span> 이용약관 및 개인정보 수집에 동의하셨습니다
            </div>
          )}

          {/* 오류 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
              {errorMessage}
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSignupClick}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white text-lg py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <p className="text-center text-gray-500 mt-6 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login">
              <span className="text-purple-600 font-bold cursor-pointer hover:underline">
                로그인
              </span>
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}