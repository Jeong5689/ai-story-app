'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getUserStories, deleteStory, Story } from '../../lib/storyService';
import TTSPlayer from '../../components/TTSPlayer';

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // 동화 삭제 함수
  async function handleDeleteStory(storyId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('이 동화를 삭제하시겠습니까?')) return;
    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  useEffect(() => {
    // 임시 userId — 나중에 로그인 연동 시 교체
    const temporaryUserId = 'guest-user';
    loadStories(temporaryUserId);
  }, []);

  // 동화 목록 불러오기
  async function loadStories(userId: string) {
    try {
      const userStories = await getUserStories(userId);
      setStories(userStories);
    } catch (error) {
      console.error('동화 불러오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">
            🌟 동화나라
          </div>
        </Link>
        <Link href="/generate">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            동화 만들기
          </button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          📚 내 동화 보관함
        </h1>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-bounce">📖</div>
            <p className="text-gray-400">동화를 불러오고 있어요...</p>
          </div>
        )}

        {/* 동화 없을 때 */}
        {!isLoading && stories.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📭</div>
            <p className="text-xl text-gray-500 mb-6">
              아직 만든 동화가 없어요
            </p>
            <Link href="/generate">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition">
                첫 동화 만들러 가기 ✨
              </button>
            </Link>
          </div>
        )}

        {/* 동화 목록 */}
        {!isLoading && stories.length > 0 && !selectedStory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div
              key={story.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt="동화 표지"
                  onClick={() => setSelectedStory(story)}
                  className="w-full h-48 object-cover cursor-pointer"
                />
              )}
              <div className="p-4">
                <h3
                  onClick={() => setSelectedStory(story)}
                  className="font-bold text-gray-800 text-lg mb-1 cursor-pointer"
                >
                  {story.childName}의 동화
                </h3>
                <p className="text-purple-600 text-sm mb-2">
                  테마: {story.theme}
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  {story.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || ''}
                </p>
                <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStory(story)}
                      className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-xl text-xs hover:bg-purple-50 transition"
                    >
                      📖 읽기
                    </button>
                    <Link href="/publish" className="flex-1">
                      <button className="w-full bg-purple-600 text-white py-2 rounded-xl text-xs hover:bg-purple-700 transition">
                        📚 출판
                      </button>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteStory(story.id!, e)}
                      className="border border-red-300 text-red-400 py-2 px-3 rounded-xl text-xs hover:bg-red-50 transition"
                    >
                      🗑️
                    </button>
                  </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* 동화 상세 보기 */}
        {selectedStory && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <button
              onClick={() => setSelectedStory(null)}
              className="text-purple-600 mb-6 hover:underline"
            >
              ← 목록으로 돌아가기
            </button>

            {selectedStory.imageUrl && (
              <img
                src={selectedStory.imageUrl}
                alt="동화 삽화"
                className="w-full rounded-2xl mb-8 shadow-sm"
              />
            )}

<div className="prose max-w-none">
              {selectedStory.storyText.split('\n').map((line, index) => (
                <p
                  key={index}
                  className={`mb-3 ${
                    line.startsWith('##')
                      ? 'text-2xl font-bold text-purple-700'
                      : 'text-gray-700 leading-relaxed text-lg'
                  }`}
                >
                  {line.replace('## ', '')}
                </p>
              ))}
            </div>

            {/* TTS 플레이어 */}
            <TTSPlayer text={selectedStory.storyText} />
          </div>
        )}

      </div>
    </main>
  );
}