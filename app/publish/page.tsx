'use client';
// 부크크 출판 가이드 페이지
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import { getUserStories, Story } from '../../lib/storyService';
import { useEffect } from 'react';

export default function PublishPage() {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentUser) {
      loadStories(currentUser.uid);
    }
  }, [currentUser]);

  async function loadStories(userId: string) {
    try {
      const userStories = await getUserStories(userId);
      setStories(userStories);
    } catch (error) {
      console.error('동화 불러오기 오류:', error);
    }
  }

  // 부크크 출판용 PDF 생성 (A5 규격)
  async function handleGenerateBookkPDF() {
    if (!selectedStory) return;
    setIsGenerating(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // A5 규격 (148mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      const element = document.createElement('div');
      element.style.cssText = `
        width: 560px;
        min-height: 794px;
        padding: 60px 70px;
        background: white;
        font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
        position: fixed;
        left: -9999px;
        top: 0;
        line-height: 1.9;
      `;

      // 표지 페이지 HTML
      const titleLine = selectedStory.storyText
        .split('\n')
        .find(line => line.startsWith('##'))
        ?.replace('## ', '') || `${selectedStory.childName}의 동화`;

      element.innerHTML = `
        <!-- 표지 -->
        <div style="min-height:680px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-bottom:2px solid #7C3AED;margin-bottom:40px;">
          ${selectedStory.imageUrl
            ? `<img src="${selectedStory.imageUrl}" style="width:380px;border-radius:12px;margin-bottom:40px;" crossorigin="anonymous" />`
            : ''}
          <h1 style="font-size:32px;font-weight:bold;color:#7C3AED;margin-bottom:16px;line-height:1.4;">${titleLine}</h1>
          <p style="font-size:16px;color:#6B7280;margin-bottom:8px;">테마: ${selectedStory.theme}</p>
          <p style="font-size:14px;color:#9CA3AF;">주인공: ${selectedStory.childName}</p>
          <div style="margin-top:60px;padding-top:20px;border-top:1px solid #E5E7EB;width:100%;">
            <p style="font-size:13px;color:#9CA3AF;">🌟 동화나라 | AI 창작동화</p>
            <p style="font-size:12px;color:#D1D5DB;">${new Date().getFullYear()}</p>
          </div>
        </div>

        <!-- 본문 -->
        <div style="font-size:13px;line-height:2;color:#374151;">
          ${selectedStory.storyText
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('##'))
            .map(line => `<p style="margin-bottom:18px;text-indent:20px;">${line}</p>`)
            .join('')}
        </div>

        <!-- 마지막 페이지 -->
        <div style="margin-top:60px;padding-top:30px;border-top:2px solid #E5E7EB;text-align:center;">
          <p style="font-size:14px;color:#7C3AED;font-weight:bold;">🌟 동화나라</p>
          <p style="font-size:12px;color:#9CA3AF;margin-top:8px;">AI로 만드는 우리 아이만의 동화</p>
          <p style="font-size:11px;color:#D1D5DB;margin-top:4px;">ai-story-app-ebon.vercel.app</p>
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

      pdf.save(`${selectedStory.childName}의_동화_부크크출판용.pdf`);
      setCurrentStep(2);

    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
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
        <Link href="/library">
          <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
            내 동화함
          </button>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          📚 부크크 출판하기
        </h1>
        <p className="text-center text-gray-400 text-sm mb-10">
          동화를 실제 종이책으로 출판해보세요 — 무료 자가출판 플랫폼 부크크 이용
        </p>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { num: 1, label: 'PDF 생성' },
            { num: 2, label: '부크크 가입' },
            { num: 3, label: '원고 업로드' },
            { num: 4, label: '표지 설정' },
            { num: 5, label: '출판 완료' },
          ].map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex flex-col items-center ${index > 0 ? 'ml-1' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  currentStep >= step.num
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{step.label}</span>
              </div>
              {index < 4 && (
                <div className={`w-8 h-0.5 mb-4 mx-1 ${
                  currentStep > step.num ? 'bg-purple-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* 1단계: 동화 선택 및 PDF 생성 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              1단계 — 출판할 동화를 선택하고 PDF를 생성하세요
            </h2>

            {/* 동화 선택 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-3">
                출판할 동화 선택
              </label>
              {stories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 mb-4">저장된 동화가 없습니다</p>
                  <Link href="/generate">
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition text-sm">
                      동화 만들러 가기
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                        selectedStory?.id === story.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {story.imageUrl && (
                        <img
                          src={story.imageUrl}
                          alt="표지"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{story.childName}의 동화</p>
                        <p className="text-purple-600 text-sm">테마: {story.theme}</p>
                        <p className="text-gray-400 text-xs">
                          {story.createdAt?.toDate?.()?.toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {selectedStory?.id === story.id && (
                        <span className="ml-auto text-purple-600 font-bold">✓ 선택됨</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF 생성 버튼 */}
            <button
              onClick={handleGenerateBookkPDF}
              disabled={!selectedStory || isGenerating}
              className="w-full bg-purple-600 text-white text-lg py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-40"
            >
              {isGenerating ? '📄 PDF 생성 중...' : '📄 부크크 출판용 PDF 생성'}
            </button>

            <div className="mt-4 bg-yellow-50 rounded-xl p-4 text-sm text-yellow-700">
              💡 부크크 출판 규격에 맞게 A5 사이즈로 자동 생성됩니다
            </div>
          </div>
        )}

        {/* 2단계 이후: 부크크 가이드 */}
        {currentStep >= 2 && (
          <div className="space-y-4">

            {/* 2단계 */}
            <div className={`bg-white rounded-2xl shadow-sm p-6 ${currentStep === 2 ? 'ring-2 ring-purple-400' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="font-bold text-gray-800 text-lg">부크크 회원가입</h3>
              </div>
              <div className="text-gray-600 text-sm space-y-2 mb-4">
                <p>① <span className="text-purple-600 font-bold">bookk.co.kr</span> 접속</p>
                <p>② 우측 상단 "회원가입" 클릭</p>
                <p>③ 이메일로 가입 완료</p>
                <p>④ 작가 페이지에서 정산 계좌 등록 (수익 받을 계좌)</p>
              </div>
              <div className="flex gap-3">
                <a href="https://bookk.co.kr" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition text-sm">
                    부크크 사이트 열기 →
                  </button>
                </a>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition text-sm"
                >
                  가입 완료 →
                </button>
              </div>
            </div>

            {/* 3단계 */}
            {currentStep >= 3 && (
              <div className={`bg-white rounded-2xl shadow-sm p-6 ${currentStep === 3 ? 'ring-2 ring-purple-400' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <h3 className="font-bold text-gray-800 text-lg">원고 업로드</h3>
                </div>
                <div className="text-gray-600 text-sm space-y-2 mb-4">
                  <p>① 부크크 로그인 후 "내 책 만들기" 클릭</p>
                  <p>② 책 종류: <span className="font-bold">종이책</span> 선택</p>
                  <p>③ 판형: <span className="font-bold">A5 (148x210mm)</span> 선택</p>
                  <p>④ 인쇄: <span className="font-bold">컬러</span> 선택 (삽화 있음)</p>
                  <p>⑤ 방금 다운받은 <span className="text-purple-600 font-bold">PDF 파일 업로드</span></p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 mb-4">
                  💡 파일명: <span className="font-mono">{selectedStory?.childName}의_동화_부크크출판용.pdf</span>
                </div>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="w-full border border-purple-600 text-purple-600 py-3 rounded-xl hover:bg-purple-50 transition text-sm"
                >
                  업로드 완료 →
                </button>
              </div>
            )}

            {/* 4단계 */}
            {currentStep >= 4 && (
              <div className={`bg-white rounded-2xl shadow-sm p-6 ${currentStep === 4 ? 'ring-2 ring-purple-400' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <h3 className="font-bold text-gray-800 text-lg">표지 및 출판 정보 설정</h3>
                </div>
                <div className="text-gray-600 text-sm space-y-2 mb-4">
                  <p>① 책 제목: <span className="font-bold">{selectedStory?.childName}의 동화 — {selectedStory?.theme}</span></p>
                  <p>② 저자명: 본인 이름 입력</p>
                  <p>③ 표지: PDF에 포함된 이미지를 표지로 활용하거나 부크크 무료 템플릿 사용</p>
                  <p>④ 가격 설정: 최소 가격으로 설정 가능</p>
                  <p>⑤ ISBN 발급: <span className="font-bold">부크크 대행 (무료)</span> 선택</p>
                  <p>⑥ 유통: 예스24, 알라딘, 교보문고 유통 선택 가능</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-xs text-green-600 mb-4">
                  🎉 승인까지 보통 1~3일 소요됩니다. 승인 후 실제 서점에서 판매됩니다!
                </div>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition text-sm"
                >
                  출판 신청 완료 →
                </button>
              </div>
            )}

            {/* 5단계 완료 */}
            {currentStep >= 5 && (
              <div className="bg-purple-600 rounded-2xl p-8 text-center text-white">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">출판 신청 완료!</h3>
                <p className="text-purple-200 mb-6">
                  부크크 검토 후 1~3일 내에 승인됩니다.<br />
                  승인되면 예스24, 알라딘, 교보문고에서 판매됩니다!
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/">
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition">
                      홈으로 가기
                    </button>
                  </Link>
                  <Link href="/generate">
                    <button className="border border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-500 transition">
                      새 동화 만들기
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}