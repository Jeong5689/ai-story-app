'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { getUserStories, deleteStory, updateStory, Story } from '../../lib/storyService';
import TTSPlayer from '../../components/TTSPlayer';

export default function LibraryPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 수정 상태
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser) loadStories(currentUser.uid);
  }, [currentUser, authLoading]);

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

  // 동화 삭제
  async function handleDeleteStory(storyId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('이 동화를 삭제하시겠습니까?')) return;
    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
      if (selectedStory?.id === storyId) setSelectedStory(null);
    } catch (error) {
      console.error('삭제 오류:', error);
    }
  }

  // 수정 모드 시작
  function handleStartEdit(story: Story) {
    const titleLine = story.storyText
      .split('\n')
      .find(l => l.startsWith('##'))
      ?.replace('## ', '') || story.childName;
    const bodyText = story.storyText
      .split('\n')
      .filter(l => l.trim() && !l.startsWith('##'))
      .join('\n');

    setEditTitle(titleLine);
    setEditText(bodyText);
    setEditImageUrl(story.imageUrl || '');
    setEditImagePreview(story.imageUrl || '');
    setEditImageFile(null);
    setIsEditing(true);
    setSaveSuccess(false);
  }

  // 이미지 변경
  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드 가능합니다');
      return;
    }
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setEditImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // 수정 저장
  async function handleSaveEdit() {
    if (!selectedStory || !editTitle.trim() || !editText.trim()) {
      alert('제목과 내용을 입력해주세요');
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = editImageUrl;

      // 새 이미지 업로드
      if (editImageFile) {
        const formData = new FormData();
        formData.append('file', editImageFile);
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) imageUrl = uploadData.imageUrl;
      }

      const newStoryText = `## ${editTitle}\n\n${editText}`;

      await updateStory(selectedStory.id!, {
        childName: editTitle,
        storyText: newStoryText,
        imageUrl,
      });

      // 로컬 상태 업데이트
      const updatedStory = {
        ...selectedStory,
        childName: editTitle,
        storyText: newStoryText,
        imageUrl,
      };
      setStories(prev => prev.map(s =>
        s.id === selectedStory.id ? updatedStory : s
      ));
      setSelectedStory(updatedStory);
      setSaveSuccess(true);
      setIsEditing(false);

    } catch (error) {
      console.error('수정 오류:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">🌟 동화나라</div>
        </Link>
        <Link href="/generate">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
            동화 만들기
          </button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">📚 내 동화 보관함</h1>
        {currentUser && (
          <p className="text-center text-gray-400 text-sm mb-8">{currentUser.email}</p>
        )}

        {/* 로딩 */}
        {(isLoading || authLoading) && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-bounce">📖</div>
            <p className="text-gray-400">동화를 불러오고 있어요...</p>
          </div>
        )}

        {/* 동화 없을 때 */}
        {!isLoading && !authLoading && stories.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📭</div>
            <p className="text-xl text-gray-500 mb-6">아직 만든 동화가 없어요</p>
            <Link href="/generate">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition">
                첫 동화 만들러 가기 ✨
              </button>
            </Link>
          </div>
        )}

        {/* 동화 목록 */}
        {!isLoading && !authLoading && stories.length > 0 && !selectedStory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
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
                    className="font-bold text-gray-800 text-lg mb-1 cursor-pointer hover:text-purple-600 transition"
                  >
                    {story.childName}의 동화
                  </h3>
                  <p className="text-purple-600 text-sm mb-2">테마: {story.theme}</p>
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
                    <button
                      onClick={() => { setSelectedStory(story); handleStartEdit(story); }}
                      className="flex-1 border border-yellow-400 text-yellow-600 py-2 rounded-xl text-xs hover:bg-yellow-50 transition"
                    >
                      ✏️ 수정
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
        {selectedStory && !isEditing && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => { setSelectedStory(null); setSaveSuccess(false); }}
                className="text-purple-600 hover:underline text-sm"
              >
                ← 목록으로 돌아가기
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartEdit(selectedStory)}
                  className="bg-yellow-400 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-500 transition font-bold"
                >
                  ✏️ 수정하기
                </button>
                <Link href="/publish">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition font-bold">
                    📚 출판하기
                  </button>
                </Link>
                <button
                  onClick={(e) => handleDeleteStory(selectedStory.id!, e)}
                  className="border border-red-300 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>

            {/* 저장 완료 메시지 */}
            {saveSuccess && (
              <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">
                ✓ 수정이 저장되었습니다
              </div>
            )}

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
            <TTSPlayer text={selectedStory.storyText} />
          </div>
        )}

        {/* 수정 모드 */}
        {selectedStory && isEditing && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:underline text-sm"
              >
                ← 취소
              </button>
              <h2 className="text-xl font-bold text-gray-800">✏️ 동화 수정하기</h2>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-purple-700 transition disabled:opacity-50 font-bold"
              >
                {isSaving ? '저장 중...' : '💾 저장'}
              </button>
            </div>

            <div className="space-y-6">

              {/* 삽화 수정 */}
              <div>
                <label className="block text-gray-700 font-bold mb-3">🎨 삽화</label>
                {editImagePreview ? (
                  <div className="relative">
                    <img
                      src={editImagePreview}
                      alt="삽화 미리보기"
                      className="w-full rounded-2xl object-cover max-h-72 mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border border-purple-400 text-purple-600 py-2 rounded-xl text-sm hover:bg-purple-50 transition"
                      >
                        🖼️ 이미지 교체
                      </button>
                      <button
                        onClick={() => { setEditImagePreview(''); setEditImageUrl(''); setEditImageFile(null); }}
                        className="border border-red-300 text-red-400 py-2 px-4 rounded-xl text-sm hover:bg-red-50 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
                  >
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-gray-400 text-sm">클릭해서 이미지 업로드</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="hidden"
                />
              </div>

              {/* 제목 수정 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">📝 동화 제목</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="동화 제목 입력"
                  maxLength={50}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400"
                />
                <p className="text-right text-xs text-gray-400 mt-1">{editTitle.length} / 50</p>
              </div>

              {/* 본문 수정 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">✍️ 동화 내용</label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={15}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base leading-relaxed focus:outline-none focus:border-purple-400 resize-none"
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {editText.length.toLocaleString()} 자
                </p>
              </div>

              {/* 미리보기 */}
              <div className="bg-purple-50 rounded-2xl p-5">
                <p className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">미리보기</p>
                {editImagePreview && (
                  <img
                    src={editImagePreview}
                    alt="미리보기"
                    className="w-full rounded-xl mb-4 object-cover max-h-40"
                  />
                )}
                {editTitle && (
                  <h3 className="text-xl font-bold text-purple-700 text-center mb-3">{editTitle}</h3>
                )}
                {editText && (
                  <div>
                    {editText.split('\n').slice(0, 3).map((line, i) => (
                      <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{line}</p>
                    ))}
                    {editText.split('\n').length > 3 && (
                      <p className="text-gray-400 text-xs">... 총 {editText.split('\n').filter(l => l.trim()).length} 문단</p>
                    )}
                  </div>
                )}
              </div>

              {/* 하단 저장 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-2xl hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-purple-600 text-white text-lg py-3 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50 font-bold"
                >
                  {isSaving ? '저장 중...' : '💾 수정 저장하기'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}