'use client';
// 단락 + 삽화 생성 버튼 컴포넌트
import { useState } from 'react';

interface ParagraphWithImageProps {
  text: string;
  index: number;
  childName?: string;
  theme?: string;
}

export default function ParagraphWithImage({
  text,
  index,
  childName,
  theme,
}: ParagraphWithImageProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // 단락 삽화 생성
  async function handleGenerateImage() {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraph: text,
          childName: childName || '',
          theme: theme || '',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.imageUrl);
        setIsGenerated(true);
      }
    } catch (error) {
      console.error('단락 삽화 생성 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  // 삽화 재생성
  function handleRegenerate() {
    setIsGenerated(false);
    setImageUrl('');
    handleGenerateImage();
  }

  const isTitleLine = text.startsWith('##');

  return (
    <div className="mb-6">
      {/* 제목 */}
      {isTitleLine ? (
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-4">
          {text.replace('## ', '')}
        </h2>
      ) : (
        <>
          {/* 본문 단락 */}
          <p className="text-gray-700 leading-relaxed text-lg mb-3">
            {text}
          </p>

          {/* 삽화 영역 */}
          {isGenerated && imageUrl ? (
            <div className="relative mb-3">
              <img
                src={imageUrl}
                alt={`${index + 1}번째 단락 삽화`}
                className="w-full rounded-2xl shadow-sm object-cover max-h-64"
              />
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-purple-600 px-3 py-1 rounded-xl text-xs font-bold hover:bg-white transition shadow-sm"
              >
                {isGenerating ? '생성 중...' : '🔄 재생성'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className={`w-full py-2 rounded-xl text-sm font-bold transition mb-3 ${
                isGenerating
                  ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎨</span> 삽화 생성 중...
                </span>
              ) : (
                `🎨 ${index + 1}번째 단락 삽화 생성`
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}