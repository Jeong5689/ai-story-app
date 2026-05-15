'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import { saveStory } from '../../lib/storyService';
import TTSPlayer from '../../components/TTSPlayer';

interface StoryResult {
  storyText: string;
  imageUrl: string;
}

export default function GeneratePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [theme, setTheme] = useState('');
  const [ageGroup, setAgeGroup] = useState('5');
  const [moral, setMoral] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<StoryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // PDF 다운로드 함수 (한글 지원)
  async function handleDownloadPDF() {
    if (!result) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const element = document.createElement('div');
      element.style.cssText = `
        width: 800px;
        padding: 60px;
        background: white;
        font-family: 'Malgun Gothic', sans-serif;
        position: fixed;
        left: -9999px;
        top: 0;
      `;

      element.innerHTML = `
        <div style="background:#7C3AED;padding:24px;border-radius:12px;margin-bottom:32px;text-align:center;">
          <div style="color:white;font-size:22px;font-weight:bold;margin-bottom:6px;">🌟 동화나라</div>
          <div style="color:#E9D5FF;font-size:14px;">AI로 만드는 우리 아이만의 동화</div>
        </div>
        ${result.imageUrl
          ? `<img src="${result.imageUrl}" style="width:100%;border-radius:12px;margin-bottom:32px;" crossorigin="anonymous" />`
          : ''}
        <div style="font-size:16px;line-height:2;color:#374151;">
          ${result.storyText
            .split('\n')
            .filter(line => line.trim())
            .map(line =>
              line.startsWith('##')
                ? `<h2 style="color:#7C3AED;font-size:26px;font-weight:bold;text-align:center;margin:24px 0 16px;">${line.replace('## ', '')}</h2>`
                : `<p style="margin-bottom:14px;">${line}</p>`
            )
            .join('')}
        </div>
        <div style="text-align:center;color:#9CA3AF;font-size:13px;margin-top:40px;border-top:1px solid #E5E7EB;padding-top:20px;">
          만든 날: ${new Date().toLocaleDateString('ko-KR')} | 동화나라
        </div>
      `;

      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(element);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${childName}의_동화.pdf`);

    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  }

  // 동화 생성 함수
  async function handleGenerate() {
    // 로그인 확인
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!childName.trim() || !theme.trim()) {
      setErrorMessage('이름과 테마를 모두 입력해주세요');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      setLoadingStep('✍️ 동화를 쓰고 있어요...');
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, theme, ageGroup, moral }),
      });
      const storyData = await storyResponse.json();

      if (!storyResponse.ok) {
        throw new Error(storyData.error || '동화 생성 실패');
      }

      setLoadingStep('🎨 삽화를 그리고 있어요...');
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, theme }),
      });
      const imageData = await imageResponse.json();

      if (!imageResponse.ok) {
        throw new Error(imageData.error || '이미지 생성 실패');
      }

      const storyResult = {
        storyText: storyData.story,
        imageUrl: imageData.imageUrl,
      };

      await saveStory({
        userId: currentUser.uid,
        childName,
        theme,
        ageGroup,
        moral,
        storyText: storyData.story,
        imageUrl: imageData.imageUrl,
      });

      setResult(storyResult);

    } catch (error) {
      console.error('생성 오류:', error);
      setErrorMessage('동화 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">
            🌟 동화나라
          </div>
        </Link>
        <Link href="/library">
          <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
            내 동화함
          </button>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          ✨ 동화 만들기
        </h1>

        {!result && !isLoading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">

            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                주인공 이름 *
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="예: 민준, 서연, 지호"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                동화 테마 *
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {['우주 탐험', '마법 숲', '바닷속 모험', '공룡 친구', '동물 왕국', '직접 입력'].map((t) => (
                  <button
                    key={t}
                    onClick={() => t !== '직접 입력' && setTheme(t)}
                    className={`py-2 px-3 rounded-xl border text-sm transition ${
                      theme === t
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-200 text-gray-600 hover:border-purple-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="또는 직접 입력: 예) 로봇과 친구"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">나이</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
              >
                <option value="3">3~4세</option>
                <option value="5">5~6세</option>
                <option value="7">7~8세</option>
                <option value="9">9~10세</option>
                <option value="11">11~12세</option>
                <option value="13">13~14세</option>
                <option value="15">15~16세</option>
                <option value="17">17~18세</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-2">
                담고 싶은 교훈 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={moral}
                onChange={(e) => setMoral(e.target.value)}
                placeholder="예: 용기, 우정, 나눔, 정직"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white text-xl py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50"
            >
              🪄 동화 만들기
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 animate-bounce">📖</div>
            <p className="text-xl text-purple-600 font-bold">{loadingStep}</p>
            <p className="text-gray-400 mt-2">약 30초 정도 걸려요. 잠시만 기다려주세요!</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt="동화 삽화"
                className="w-full rounded-2xl mb-8 shadow-sm"
              />
            )}
            <div className="prose max-w-none">
              {result.storyText.split('\n').map((line, index) => (
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
            <TTSPlayer text={result.storyText} />
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-green-500 text-white text-lg py-4 rounded-2xl hover:bg-green-600 transition"
              >
                📄 PDF로 저장하기
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition"
                >
                  새 동화 만들기
                </button>
                <Link href="/library" className="flex-1">
                  <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition">
                    내 동화함 보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}