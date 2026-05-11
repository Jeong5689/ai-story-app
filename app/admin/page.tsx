'use client';
// 관리자 페이지 — 회원 및 콘텐츠 관리
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getPosts, deletePost } from '../../lib/communityService';
import { getUserStories, Story } from '../../lib/storyService';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// 관리자 이메일 설정 (본인 이메일로 변경)
const ADMIN_EMAIL = 'ojt7470.s@gmail.com';

interface UserData {
  uid: string;
  email: string;
  createdAt: string;
  storyCount: number;
  postCount: number;
}

export default function AdminPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stories' | 'posts'>('dashboard');
  const [users, setUsers] = useState<UserData[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      if (currentUser.email !== ADMIN_EMAIL) {
        router.push('/');
        return;
      }
      loadAllData();
    }
  }, [currentUser, isLoading]);

  async function loadAllData() {
    setIsLoadingData(true);
    try {
      // 전체 동화 조회
      const storiesSnapshot = await getDocs(
        collection(db, 'stories')
      );
      const stories = storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Story));
      setAllStories(stories);

      // 전체 게시글 조회
      const posts = await getPosts();
      setAllPosts(posts);

      // 사용자별 통계 집계
      const userMap = new Map<string, UserData>();
      stories.forEach(story => {
        if (!userMap.has(story.userId)) {
          userMap.set(story.userId, {
            uid: story.userId,
            email: story.userId,
            createdAt: story.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '',
            storyCount: 0,
            postCount: 0,
          });
        }
        userMap.get(story.userId)!.storyCount++;
      });
      posts.forEach(post => {
        if (!userMap.has(post.userId)) {
          userMap.set(post.userId, {
            uid: post.userId,
            email: post.userEmail || post.userId,
            createdAt: '',
            storyCount: 0,
            postCount: 0,
          });
        }
        const user = userMap.get(post.userId)!;
        user.email = post.userEmail || user.email;
        user.postCount++;
      });
      setUsers(Array.from(userMap.values()));

    } catch (error) {
      console.error('데이터 불러오기 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }

  // 게시글 삭제
  async function handleDeletePost(postId: string) {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePost(postId);
      setAllPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('삭제 오류:', error);
    }
  }

  // 검색 필터
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  const filteredStories = allStories.filter(s =>
    s.childName?.includes(searchKeyword) || s.theme?.includes(searchKeyword)
  );
  const filteredPosts = allPosts.filter(p =>
    p.title?.includes(searchKeyword) || p.userEmail?.includes(searchKeyword)
  );

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚙️</div>
          <p className="text-gray-400">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* 관리자 네비게이션 */}
      <nav className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <span className="font-bold text-lg">동화나라 관리자</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{currentUser?.email}</span>
          <Link href="/">
            <button className="border border-gray-600 text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-800 transition text-sm">
              사이트로 이동
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'dashboard', label: '📊 대시보드' },
            { key: 'users', label: '👥 회원 관리' },
            { key: 'stories', label: '📚 동화 관리' },
            { key: 'posts', label: '💬 게시글 관리' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        {activeTab !== 'dashboard' && (
          <div className="mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어 입력..."
              className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
            />
          </div>
        )}

        {/* 대시보드 */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: '총 회원', value: users.length, emoji: '👥', color: 'bg-purple-500' },
                { label: '총 동화', value: allStories.length, emoji: '📚', color: 'bg-blue-500' },
                { label: '총 게시글', value: allPosts.length, emoji: '💬', color: 'bg-green-500' },
                { label: '총 좋아요', value: allPosts.reduce((sum, p) => sum + (p.likeCount || 0), 0), emoji: '❤️', color: 'bg-red-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5 text-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-2xl mx-auto mb-3`}>
                    {stat.emoji}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 최근 가입 회원 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <h2 className="font-bold text-gray-800 mb-4">최근 활동 회원</h2>
              <div className="space-y-2">
                {users.slice(0, 5).map(user => (
                  <div key={user.uid} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>동화 {user.storyCount}개</span>
                      <span>게시글 {user.postCount}개</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 게시글 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">최근 게시글</h2>
              <div className="space-y-2">
                {allPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <span className="text-sm font-bold text-gray-700">{post.title}</span>
                      <span className="text-xs text-gray-400 ml-2">{post.userEmail?.split('@')[0]}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 회원 관리 */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <span className="font-bold text-gray-700">전체 회원 {filteredUsers.length}명</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">이메일</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">동화 수</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">게시글 수</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.uid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 text-center text-purple-600 font-bold">{user.storyCount}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-bold">{user.postCount}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{user.createdAt || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 동화 관리 */}
        {activeTab === 'stories' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <span className="font-bold text-gray-700">전체 동화 {filteredStories.length}개</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">주인공</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">테마</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">작성자</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map((story, index) => (
                    <tr key={story.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-bold text-gray-700">{story.childName}</td>
                      <td className="px-4 py-3 text-purple-600">{story.theme}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{story.userId?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {story.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 게시글 관리 */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <span className="font-bold text-gray-700">전체 게시글 {filteredPosts.length}개</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">제목</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-bold">작성자</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">좋아요</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">댓글</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">날짜</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-bold">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-bold text-gray-700 max-w-xs truncate">{post.title}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{post.userEmail?.split('@')[0]}</td>
                      <td className="px-4 py-3 text-center text-red-400">{post.likeCount}</td>
                      <td className="px-4 py-3 text-center text-blue-400">{post.commentCount}</td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {post.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeletePost(post.id!)}
                          className="text-red-400 hover:text-red-600 text-xs font-bold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}