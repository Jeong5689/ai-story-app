'use client';
// 메인 홈페이지 — 로그인 상태에 따라 네비게이션 변경
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { logOut } from '../lib/authService';

export default function Home() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logOut();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* 상단 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-purple-600">
          🌟 동화나라
        </div>
        <div className="flex gap-4 items-center">
          {isLoading ? (
            <div className="text-gray-400 text-sm">로딩 중...</div>
          ) : currentUser ? (
            <>
              <span className="text-gray-500 text-sm hidden md:block">
                {currentUser.email}
              </span>
              <Link href="/generate">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  동화 만들기
                </button>
              </Link>
              <Link href="/library">
                <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
                  내 동화함
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 text-sm hover:text-gray-600 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
                  로그인
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  회원가입
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          AI로 만드는<br />
          <span className="text-purple-600">우리 아이만의 동화</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          아이의 이름과 좋아하는 테마를 입력하면<br />
          세상에 하나뿐인 동화가 완성됩니다
        </p>
        {currentUser ? (
          <Link href="/generate">
            <button className="bg-purple-600 text-white text-xl px-10 py-4 rounded-2xl hover:bg-purple-700 transition shadow-lg">
              지금 시작하기 ✨
            </button>
          </Link>
        ) : (
          <Link href="/signup">
            <button className="bg-purple-600 text-white text-xl px-10 py-4 rounded-2xl hover:bg-purple-700 transition shadow-lg">
              무료로 시작하기 ✨
            </button>
          </Link>
        )}
      </section>

      {/* 기능 소개 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-8 pb-20">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">✍️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">AI 동화 생성</h3>
          <p className="text-gray-500 text-sm">
            GPT가 아이 맞춤형 동화를 즉시 작성해드립니다
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">삽화 자동 생성</h3>
          <p className="text-gray-500 text-sm">
            AI가 동화에 어울리는 아름다운 삽화를 그려줍니다
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">동화 보관함</h3>
          <p className="text-gray-500 text-sm">
            만든 동화를 저장하고 언제든지 다시 읽을 수 있습니다
          </p>
        </div>
      </section>

    </main>
  );
}