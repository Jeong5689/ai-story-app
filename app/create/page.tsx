'use client';
// 직접 만들기 페이지 — 텍스트 직접 입력 + 이미지 업로드
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { saveStory } from '../../lib/storyService';
import TTSPlayer from '../../components/TTSPlayer';

export default function CreatePage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // 입력 상태
  const [title, setTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 파일 선택 처리
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 이하)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('이미지 파일은 5MB 이하만 업로드 가능합니다');
      return;
    }

    setImageFile(file);
    setErrorMessage('');

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // 이미지 제거
  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // 동화 저장
  async function handleSave() {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('동화 제목을 입력해주세요');
      return;
    }
    if (!storyText.trim()) {
      setErrorMessage('동화 내용을 입력해주세요');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      // 이미지를 base64로 저장 (없으면 빈 문자열)
      const imageUrl = imagePreview || '';

      // Firestore에 저장
      await saveStory({
        userId: currentUser.uid,
        childName: title,
        theme: '직접 작성',
        ageGroup: '전체',
        moral: '',
        storyText: `## ${title}\n\n${storyText}`,
        imageUrl: imageUrl,
      });

      setIsSaved(true);
    } catch (error) {
      console.error('저장 오류:', error);
      setErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  // 글자 수
  const charCount = storyText.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">
            🌟 동화나라
          </div>
        </Link>
        <div className="flex gap-3">
          <Link href="/generate">
            <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition text-sm">
              AI 동화 만들기
            </button>
          </Link>
          <Link href="/library">
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
              내 동화함
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ✏️ 직접 동화 만들기
          </h1>
          <p className="text-gray-400 text-sm">
            동화 내용을 직접 쓰고 삽화를 업로드해보세요
          </p>
        </div>

        {/* 저장 완료 화면 */}
        {isSaved ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">

            {/* 미리보기 이미지 */}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="동화 삽화"
                className="w-full rounded-2xl mb-8 shadow-sm object-cover max-h-96"
              />
            )}

            {/* 동화 텍스트 */}
            <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">
              {title}
            </h2>
            <div className="prose max-w-none">
              {storyText.split('\n').map((line, index) => (
                <p
                  key={index}
                  className="mb-3 text-gray-700 leading-relaxed text-lg"
                >
                  {line}
                </p>
              ))}
            </div>

            {/* TTS 플레이어 */}
            <TTSPlayer text={`${title}. ${storyText}`} />

            {/* 버튼 */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setIsSaved(false);
                  setTitle('');
                  setStoryText('');
                  setImagePreview('');
                  setImageFile(null);
                }}
                className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition"
              >
                새 동화 쓰기
              </button>
              <Link href="/library" className="flex-1">
                <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition">
                  내 동화함 보기
                </button>
              </Link>
            </div>
          </div>

        ) : (

          <div className="space-y-6">

            {/* 삽화 업로드 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🎨 삽화 업로드
              </h2>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 rounded-2xl p-10 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
                >
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-gray-500 font-bold mb-1">
                    클릭해서 이미지 업로드
                  </p>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG, GIF 지원 · 최대 5MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="업로드된 삽화"
                    className="w-full rounded-2xl object-cover max-h-80"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition text-sm font-bold"
                  >
                    ✕
                  </button>
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-600 text-sm hover:underline"
                    >
                      다른 이미지로 교체
                    </button>
                  </div>
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

            {/* 동화 제목 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                📝 동화 제목
              </h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 토끼와 거북이의 새로운 모험"
                maxLength={50}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400"
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {title.length} / 50
              </p>
            </div>

            {/* 동화 내용 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                ✍️ 동화 내용
              </h2>
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder={`여기에 동화 내용을 직접 써주세요.\n\n예시:\n옛날 옛적에 작은 마을에 민준이라는 아이가 살았어요.\n민준이는 매일 아침 해가 뜨면 숲으로 산책을 나갔답니다.\n\n어느 날 민준이는 숲 속에서 길을 잃은 작은 토끼를 만났어요...`}
                rows={15}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base leading-relaxed focus:outline-none focus:border-purple-400 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  Enter 키로 문단을 나눌 수 있어요
                </p>
                <p className="text-xs text-gray-400">
                  {charCount.toLocaleString()} 자
                </p>
              </div>
            </div>

            {/* 미리보기 */}
            {(title || storyText) && (
              <div className="bg-purple-50 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-purple-600 mb-4 uppercase tracking-wide">
                  미리보기
                </h2>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full rounded-xl mb-4 object-cover max-h-48"
                  />
                )}
                {title && (
                  <h3 className="text-xl font-bold text-purple-700 text-center mb-3">
                    {title}
                  </h3>
                )}
                {storyText && (
                  <div>
                    {storyText.split('\n').slice(0, 3).map((line, i) => (
                      <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">
                        {line}
                      </p>
                    ))}
                    {storyText.split('\n').length > 3 && (
                      <p className="text-gray-400 text-xs">
                        ... 총 {storyText.split('\n').filter(l => l.trim()).length} 문단
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 오류 메시지 */}
            {errorMessage && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                {errorMessage}
              </div>
            )}

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-purple-600 text-white text-xl py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '📚 동화 저장하기'}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}