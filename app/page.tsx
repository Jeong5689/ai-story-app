'use client';
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
    <main className="h-screen flex flex-col overflow-hidden relative">

      {/* 판타스틱 배경 — SVG 그라데이션 + 동화 요소 */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg1" cx="30%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.3"/>
            </radialGradient>
            <radialGradient id="bg2" cx="80%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bg3" cx="60%" cy="20%" r="40%">
              <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#A5F3FC" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* 배경 */}
          <rect width="1440" height="900" fill="#F5F0FF"/>
          <rect width="1440" height="900" fill="url(#bg1)"/>
          <rect width="1440" height="900" fill="url(#bg2)"/>
          <rect width="1440" height="900" fill="url(#bg3)"/>

          {/* 달 */}
          <circle cx="1200" cy="120" r="80" fill="#FEF9C3" opacity="0.6"/>
          <circle cx="1200" cy="120" r="70" fill="#FEF08A" opacity="0.4"/>

          {/* 별들 */}
          {[
            [100,80,0.7],[200,150,0.8],[350,60,0.6],[500,120,0.9],[650,80,0.7],
            [800,100,0.8],[950,60,0.6],[1050,140,0.9],[1150,80,0.7],[1300,100,0.8],
            [1380,60,0.6],[150,200,0.9],[400,180,0.7],[700,160,0.8],[1000,190,0.6],
            [1250,170,0.9],[50,300,0.7],[300,280,0.8],[600,260,0.6],[900,280,0.9],
            [1200,260,0.7],[1400,300,0.8],
          ].map(([x,y,op], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i%3===0?4:i%3===1?3:2} fill="#FDE68A" opacity={op}/>
              <circle cx={x} cy={y} r={i%3===0?2:1} fill="white" opacity="0.9"/>
            </g>
          ))}

          {/* 구름들 */}
          <g opacity="0.25">
            <ellipse cx="200" cy="200" rx="120" ry="50" fill="white"/>
            <ellipse cx="160" cy="210" rx="80" ry="45" fill="white"/>
            <ellipse cx="240" cy="210" rx="80" ry="40" fill="white"/>
          </g>
          <g opacity="0.2">
            <ellipse cx="1100" cy="300" rx="150" ry="55" fill="white"/>
            <ellipse cx="1050" cy="315" rx="100" ry="50" fill="white"/>
            <ellipse cx="1150" cy="310" rx="100" ry="45" fill="white"/>
          </g>
          <g opacity="0.15">
            <ellipse cx="600" cy="150" rx="100" ry="40" fill="white"/>
            <ellipse cx="560" cy="160" rx="70" ry="35" fill="white"/>
            <ellipse cx="640" cy="158" rx="70" ry="32" fill="white"/>
          </g>

          {/* 성 (왼쪽) */}
          <g opacity="0.18" transform="translate(30, 400)">
            <rect x="0" y="100" width="160" height="200" fill="#7C3AED"/>
            <rect x="20" y="60" width="40" height="120" fill="#6D28D9"/>
            <rect x="100" y="70" width="40" height="110" fill="#6D28D9"/>
            <polygon points="20,60 40,10 60,60" fill="#5B21B6"/>
            <polygon points="100,70 120,15 140,70" fill="#5B21B6"/>
            <polygon points="-10,100 80,40 170,100" fill="#5B21B6"/>
            <rect x="55" y="200" width="50" height="100" fill="#5B21B6"/>
            <rect x="30" y="130" width="30" height="30" fill="#FDE68A" opacity="0.6"/>
            <rect x="100" y="130" width="30" height="30" fill="#FDE68A" opacity="0.6"/>
          </g>

          {/* 성 (오른쪽) */}
          <g opacity="0.15" transform="translate(1200, 350)">
            <rect x="0" y="120" width="200" height="250" fill="#7C3AED"/>
            <rect x="20" y="70" width="50" height="140" fill="#6D28D9"/>
            <rect x="130" y="80" width="50" height="130" fill="#6D28D9"/>
            <polygon points="20,70 45,10 70,70" fill="#5B21B6"/>
            <polygon points="130,80 155,15 180,80" fill="#5B21B6"/>
            <polygon points="-15,120 100,50 215,120" fill="#5B21B6"/>
            <rect x="70" y="230" width="60" height="140" fill="#5B21B6"/>
            <rect x="35" y="155" width="35" height="35" fill="#FDE68A" opacity="0.5"/>
            <rect x="130" y="155" width="35" height="35" fill="#FDE68A" opacity="0.5"/>
          </g>

          {/* 나무들 */}
          <g opacity="0.2">
            <rect x="370" y="650" width="20" height="100" fill="#92400E"/>
            <circle cx="380" cy="620" r="60" fill="#16A34A"/>
            <circle cx="355" cy="640" r="40" fill="#15803D"/>
            <circle cx="405" cy="640" r="40" fill="#15803D"/>
          </g>
          <g opacity="0.2">
            <rect x="1050" y="680" width="18" height="90" fill="#92400E"/>
            <circle cx="1059" cy="650" r="50" fill="#16A34A"/>
            <circle cx="1038" cy="668" r="35" fill="#15803D"/>
            <circle cx="1080" cy="668" r="35" fill="#15803D"/>
          </g>
          <g opacity="0.15">
            <rect x="180" y="700" width="15" height="80" fill="#92400E"/>
            <circle cx="188" cy="675" r="45" fill="#16A34A"/>
          </g>
          <g opacity="0.15">
            <rect x="1280" y="710" width="15" height="75" fill="#92400E"/>
            <circle cx="1288" cy="688" r="42" fill="#16A34A"/>
          </g>

          {/* 무지개 */}
          <g opacity="0.12" transform="translate(500, 500)">
            <path d="M 0 200 Q 200 -100 400 200" stroke="#EF4444" strokeWidth="18" fill="none"/>
            <path d="M 20 200 Q 200 -80 380 200" stroke="#F97316" strokeWidth="18" fill="none"/>
            <path d="M 40 200 Q 200 -60 360 200" stroke="#FDE047" strokeWidth="18" fill="none"/>
            <path d="M 60 200 Q 200 -40 340 200" stroke="#4ADE80" strokeWidth="18" fill="none"/>
            <path d="M 80 200 Q 200 -20 320 200" stroke="#60A5FA" strokeWidth="18" fill="none"/>
            <path d="M 100 200 Q 200 0 300 200" stroke="#A78BFA" strokeWidth="18" fill="none"/>
          </g>

          {/* 반딧불이 */}
          {[
            [400,500],[500,450],[700,480],[900,520],[1100,470],
            [300,600],[600,580],[800,550],[1000,600],[1200,560],
          ].map(([x,y], i) => (
            <g key={`firefly-${i}`}>
              <circle cx={x} cy={y} r="4" fill="#FDE68A" opacity="0.5"/>
              <circle cx={x} cy={y} r="2" fill="white" opacity="0.8"/>
            </g>
          ))}

          {/* 하단 풀밭 */}
          <ellipse cx="720" cy="900" rx="900" ry="200" fill="#86EFAC" opacity="0.2"/>
          <ellipse cx="720" cy="920" rx="800" ry="180" fill="#4ADE80" opacity="0.15"/>
        </svg>
      </div>

      {/* 네비게이션 */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-3 bg-white/75 backdrop-blur-md shadow-sm shrink-0">
        <div className="text-xl font-bold text-purple-600">🌟 동화나라</div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {isLoading ? (
            <div className="text-gray-400 text-xs">로딩 중...</div>
          ) : currentUser ? (
            <>
              <span className="text-gray-400 text-xs hidden lg:block">{currentUser.email}</span>
              <Link href="/generate"><button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition text-xs font-bold">AI 동화</button></Link>
              <Link href="/create"><button className="bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition text-xs font-bold">✏️ 직접 쓰기</button></Link>
              <Link href="/community"><button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition text-xs font-bold">💬 커뮤니티</button></Link>
              <Link href="/library"><button className="border border-purple-600 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition text-xs font-bold">내 동화함</button></Link>
              <Link href="/mypage"><button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-xs font-bold">👤 마이페이지</button></Link>
              <button onClick={handleLogout} className="text-gray-400 text-xs hover:text-gray-600 transition">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login"><button className="border border-purple-600 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition text-xs font-bold">로그인</button></Link>
              <Link href="/signup"><button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition text-xs font-bold">회원가입</button></Link>
            </>
          )}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-2 min-h-0">

        {/* 히어로 */}
        <div className="text-center mb-4">
          <div className="inline-block bg-white/75 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 leading-tight">
              AI로 만드는<br/>
              <span className="text-purple-600">우리 아이만의 동화</span>
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              아이의 이름과 좋아하는 테마를 입력하면<br/>세상에 하나뿐인 동화가 완성됩니다
            </p>
            {currentUser ? (
              <Link href="/generate">
                <button className="bg-purple-600 text-white text-base px-7 py-2.5 rounded-2xl hover:bg-purple-700 transition shadow-lg">지금 시작하기 ✨</button>
              </Link>
            ) : (
              <Link href="/signup">
                <button className="bg-purple-600 text-white text-base px-7 py-2.5 rounded-2xl hover:bg-purple-700 transition shadow-lg">무료로 시작하기 ✨</button>
              </Link>
            )}
          </div>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-5 gap-3 max-w-3xl w-full mx-auto mb-3">
          {[
            { href: '/generate', emoji: '✍️', title: 'AI 동화 생성', desc: 'AI가 맞춤 동화와 삽화를 즉시 생성', border: '' },
            { href: '/create', emoji: '✏️', title: '직접 쓰기', desc: '동화를 직접 쓰고 삽화 업로드', border: 'border-2 border-pink-100' },
            { href: '/library', emoji: '📚', title: '동화 보관함', desc: '만든 동화를 저장하고 다시 읽기', border: '' },
            { href: '/community', emoji: '💬', title: '커뮤니티', desc: '동화를 공유하고 이야기 나누기', border: 'border-2 border-blue-100' },
            { href: '/publish', emoji: '📖', title: '출판하기', desc: '부크크·유페이퍼 등 자가출판', border: '' },
          ].map(card => (
            <Link href={card.href} key={card.href}>
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all h-full ${card.border}`}>
                <div className="text-2xl mb-1">{card.emoji}</div>
                <h3 className="text-xs font-bold text-gray-800 mb-1">{card.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed hidden md:block">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 하단 통계 */}
        <div className="flex gap-4 justify-center">
          {[
            { label: 'AI 동화 생성', value: '무료' },
            { label: '삽화 자동 생성', value: '무료' },
            { label: '자가출판 연동', value: '4개 플랫폼' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
              <p className="text-purple-600 font-bold text-xs">{stat.value}</p>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* 푸터 */}
      <footer className="relative z-10 text-center py-2 bg-white/60 backdrop-blur-sm shrink-0">
        <p className="text-xs text-gray-400">
          © 2026 동화나라 · AI 창작동화 플랫폼 ·
          <Link href="/admin" className="ml-1 hover:text-purple-600 transition">관리자</Link>
        </p>
      </footer>

    </main>
  );
}