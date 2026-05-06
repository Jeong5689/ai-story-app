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
                <button className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
                  AI 동화
                </button>
              </Link>
              <Link href="/create">
                <button className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition text-sm">
                  ✏️ 직접 쓰기
                </button>
              </Link>
              <Link href="/community">
                <button className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                  💬 커뮤니티
                </button>
              </Link>
              <Link href="/library">
                <button className="border border-purple-600 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition text-sm">
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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto px-8 pb-20">
        <Link href="/generate">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">AI 동화 생성</h3>
            <p className="text-gray-500 text-sm">
              AI가 아이 맞춤형 동화와 삽화를 즉시 만들어드립니다
            </p>
          </div>
        </Link>
        <Link href="/create">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition border-2 border-pink-100">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">직접 동화 쓰기</h3>
            <p className="text-gray-500 text-sm">
              동화를 직접 쓰고 삽화도 직접 업로드할 수 있습니다
            </p>
          </div>
        </Link>
        <Link href="/library">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">동화 보관함</h3>
            <p className="text-gray-500 text-sm">
              만든 동화를 저장하고 언제든지 다시 읽을 수 있습니다
            </p>
          </div>
        </Link>
        <Link href="/publish">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">부크크 출판</h3>
            <p className="text-gray-500 text-sm">
              동화를 실제 종이책으로 출판해보세요
            </p>
          </div>
        </Link>

      </section>
<Link href="/community">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition border-2 border-blue-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">커뮤니티</h3>
            <p className="text-gray-500 text-sm">
              동화를 공유하고 이야기를 나눠보세요
            </p>
          </div>
        </Link>
    </main>
  );
}