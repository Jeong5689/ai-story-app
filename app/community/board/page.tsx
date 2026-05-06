'use client';
// 커뮤니티 글쓰기 페이지
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import { getUserStories, Story } from '../../../lib/storyService';
import { createPost } from '../../../lib/communityService';
import { useEffect } from 'react';

export default function BoardWritePage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [postType, setPostType] = useState<'story' | 'free'>('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (postType === 'story') {
      loadMyStories();
    }
  }, [currentUser, postType]);

  async function loadMyStories() {
    try {
      const stories = await getUserStories(currentUser!.uid);
      setMyStories(stories);
    } catch (error) {
      console.error('동화 불러오기 오류:', error);
    }
  }

  // 동화 선택 시 제목/내용 자동 입력
  function handleSelectStory(story: Story) {
    setSelectedStory(story);
    setTitle(`${story.childName}의 동화 — ${story.theme}`);
    setContent(story.storyText.replace(/## /g, '').trim());
    setImagePreview(story.imageUrl || '');
  }

  // 이미지 선택
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('이미지는 5MB 이하만 업로드 가능합니다');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // 게시글 등록
  async function handleSubmit() {
    if (!currentUser) return;
    if (!title.trim()) {
      setErrorMessage('제목을 입력해주세요');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let imageUrl = '';

      // 이미지 업로드
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) imageUrl = uploadData.imageUrl;
      } else if (imagePreview && imagePreview.startsWith('http')) {
        // 동화에서 가져온 이미지 URL 그대로 사용
        imageUrl = imagePreview;
      }

      await createPost({
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        type: postType,
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        storyId: selectedStory?.id || '',
      });

      router.push('/community');

    } catch (error) {
      console.error('게시글 등록 오류:', error);
      setErrorMessage('게시글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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
        <Link href="/community">
          <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition text-sm">
            ← 커뮤니티
          </button>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          ✏️ 글쓰기
        </h1>

        <div className="space-y-6">

          {/* 게시판 타입 선택 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              게시판 선택
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPostType('free')}
                className={`py-4 rounded-2xl border-2 text-center transition ${
                  postType === 'free'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">💭</div>
                <div className="font-bold text-gray-800">자유 게시판</div>
                <div className="text-xs text-gray-400 mt-1">자유롭게 이야기해요</div>
              </button>
              <button
                onClick={() => setPostType('story')}
                className={`py-4 rounded-2xl border-2 text-center transition ${
                  postType === 'story'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">📖</div>
                <div className="font-bold text-gray-800">동화 공유</div>
                <div className="text-xs text-gray-400 mt-1">내 동화를 공유해요</div>
              </button>
            </div>
          </div>

          {/* 동화 선택 (동화 공유일 때) */}
          {postType === 'story' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                📚 공유할 동화 선택
              </h2>
              {myStories.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 mb-3">저장된 동화가 없습니다</p>
                  <Link href="/generate">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition">
                      동화 만들러 가기
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {myStories.map(story => (
                    <div
                      key={story.id}
                      onClick={() => handleSelectStory(story)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedStory?.id === story.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {story.imageUrl && (
                        <img
                          src={story.imageUrl}
                          alt="표지"
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {story.childName}의 동화
                        </p>
                        <p className="text-purple-600 text-xs">
                          테마: {story.theme}
                        </p>
                      </div>
                      {selectedStory?.id === story.id && (
                        <span className="ml-auto text-purple-600 font-bold text-sm">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 이미지 업로드 (자유 게시판일 때) */}
          {postType === 'free' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🖼️ 이미지 첨부 (선택)
              </h2>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-gray-400 text-sm">클릭해서 이미지 추가</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full rounded-xl object-cover max-h-48"
                  />
                  <button
                    onClick={() => { setImagePreview(''); setImageFile(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm font-bold hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}

          {/* 제목 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">제목</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {title.length} / 100
            </p>
          </div>

          {/* 내용 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">내용</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={10}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base leading-relaxed focus:outline-none focus:border-purple-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {content.length.toLocaleString()} 자
            </p>
          </div>

          {/* 오류 메시지 */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          {/* 등록 버튼 */}
          <div className="flex gap-4">
            <Link href="/community" className="flex-1">
              <button className="w-full border border-gray-300 text-gray-600 py-4 rounded-2xl hover:bg-gray-50 transition">
                취소
              </button>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 text-white text-lg py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '📝 게시글 등록'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}