'use client';
// 자가출판 플랫폼 선택 및 출판 가이드 페이지
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import { getUserStories, Story } from '../../lib/storyService';

// 자가출판 플랫폼 목록
const PUBLISH_PLATFORMS = [
  {
    id: 'bookk',
    name: '부크크',
    emoji: '📗',
    url: 'https://bookk.co.kr',
    description: '종이책 + 전자책 동시 출판 가능. 무료 ISBN 발급. 예스24·알라딘·교보문고 유통.',
    format: 'PDF (A5)',
    type: '종이책 + 전자책',
    distribution: '예스24, 알라딘, 교보문고',
    color: 'border-green-400 bg-green-50',
    badgeColor: 'bg-green-100 text-green-700',
    steps: [
      'bookk.co.kr 접속 후 회원가입',
      '"내 책 만들기" → 종이책 또는 전자책 선택',
      '판형: A5 (148x210mm) 선택',
      '출판용 PDF 업로드',
      '책 제목, 저자명, ISBN 무료 발급 신청',
      '유통 서점 선택 후 출판 신청 (심사 1~3일)',
    ],
  },
  {
    id: 'upaper',
    name: '유페이퍼',
    emoji: '📘',
    url: 'https://www.upaper.net',
    description: '전자책 전문 플랫폼. 다양한 전자책 포맷 지원. 빠른 심사.',
    format: 'PDF, ePub',
    type: '전자책',
    distribution: '교보문고, 리디북스, 네이버시리즈',
    color: 'border-blue-400 bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
    steps: [
      'upaper.net 접속 후 회원가입',
      '"전자책 등록" 메뉴 클릭',
      'PDF 또는 ePub 파일 업로드',
      '책 정보 (제목, 저자, 소개) 입력',
      '판매 가격 설정',
      '심사 후 유통 (심사 2~5일)',
    ],
  },
  {
    id: 'epurple',
    name: 'e퍼플',
    emoji: '📙',
    url: 'https://www.epublic.co.kr',
    description: '교보문고 직계열 전자책 플랫폼. 교보문고 직접 유통. 높은 신뢰도.',
    format: 'PDF, ePub',
    type: '전자책',
    distribution: '교보문고 직접 유통',
    color: 'border-purple-400 bg-purple-50',
    badgeColor: 'bg-purple-100 text-purple-700',
    steps: [
      'epublic.co.kr 접속 후 회원가입',
      '"출판 신청" 메뉴 클릭',
      'PDF 또는 ePub 원고 업로드',
      '표지 이미지 업로드',
      '책 정보 및 가격 설정',
      '교보문고 심사 후 유통 (심사 3~7일)',
    ],
  },
  {
    id: 'epage',
    name: '이페이지',
    emoji: '📕',
    url: 'https://www.epage.co.kr',
    description: '국내 최대 전자책 유통망 보유. 다양한 서점 동시 유통. 인세 정산 편리.',
    format: 'PDF, ePub',
    type: '전자책',
    distribution: '알라딘, 리디북스, 밀리의서재 등',
    color: 'border-red-400 bg-red-50',
    badgeColor: 'bg-red-100 text-red-700',
    steps: [
      'epage.co.kr 접속 후 회원가입',
      '"작가 등록" 후 출판사 설정',
      '"도서 등록" → 원고 파일 업로드',
      '표지 및 책 소개 입력',
      '유통 서점 선택 및 가격 설정',
      '심사 후 동시 유통 (심사 2~4일)',
    ],
  },
];

export default function PublishPage() {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof PUBLISH_PLATFORMS[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentUser) loadStories(currentUser.uid);
  }, [currentUser]);

  async function loadStories(userId: string) {
    try {
      const userStories = await getUserStories(userId);
      setStories(userStories);
    } catch (error) {
      console.error('동화 불러오기 오류:', error);
    }
  }

  // 출판용 PDF 생성
  async function handleGeneratePDF() {
    if (!selectedStory) return;
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const element = document.createElement('div');
      element.style.cssText = `
        width: 560px; min-height: 794px; padding: 60px 70px;
        background: white; font-family: 'Malgun Gothic', sans-serif;
        position: fixed; left: -9999px; top: 0; line-height: 1.9;
      `;

      const titleLine = selectedStory.storyText
        .split('\n').find(line => line.startsWith('##'))
        ?.replace('## ', '') || `${selectedStory.childName}의 동화`;

      element.innerHTML = `
        <div style="min-height:680px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-bottom:2px solid #7C3AED;margin-bottom:40px;">
          ${selectedStory.imageUrl ? `<img src="${selectedStory.imageUrl}" style="width:380px;border-radius:12px;margin-bottom:40px;" crossorigin="anonymous" />` : ''}
          <h1 style="font-size:32px;font-weight:bold;color:#7C3AED;margin-bottom:16px;">${titleLine}</h1>
          <p style="font-size:16px;color:#6B7280;">테마: ${selectedStory.theme}</p>
          <p style="font-size:14px;color:#9CA3AF;margin-top:8px;">주인공: ${selectedStory.childName}</p>
          <div style="margin-top:60px;padding-top:20px;border-top:1px solid #E5E7EB;width:100%;">
            <p style="font-size:13px;color:#9CA3AF;">🌟 동화나라 | AI 창작동화 | ${new Date().getFullYear()}</p>
          </div>
        </div>
        <div style="font-size:13px;line-height:2;color:#374151;">
          ${selectedStory.storyText.split('\n').filter(l => l.trim() && !l.startsWith('##'))
            .map(l => `<p style="margin-bottom:18px;text-indent:20px;">${l}</p>`).join('')}
        </div>
        <div style="margin-top:60px;padding-top:30px;border-top:2px solid #E5E7EB;text-align:center;">
          <p style="font-size:14px;color:#7C3AED;font-weight:bold;">🌟 동화나라</p>
          <p style="font-size:12px;color:#9CA3AF;margin-top:8px;">AI로 만드는 우리 아이만의 동화</p>
        </div>
      `;

      document.body.appendChild(element);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
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

      pdf.save(`${selectedStory.childName}의_동화_출판용.pdf`);
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
          <div className="text-2xl font-bold text-purple-600 cursor-pointer">🌟 동화나라</div>
        </Link>
        <div className="flex gap-3 items-center">

          {/* 출판하기 드롭다운 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm flex items-center gap-2"
            >
              📚 출판하기
              <span className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* 드롭다운 */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-64 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
                  <p className="text-xs font-bold text-purple-600">자가출판 플랫폼 선택</p>
                </div>
                {PUBLISH_PLATFORMS.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform);
                      setIsDropdownOpen(false);
                      setCurrentStep(1);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                      selectedPlatform?.id === platform.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <span className="text-2xl">{platform.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{platform.name}</p>
                      <p className="text-xs text-gray-400">{platform.type}</p>
                    </div>
                    {selectedPlatform?.id === platform.id && (
                      <span className="ml-auto text-purple-600 text-xs font-bold">선택됨</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/library">
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
              내 동화함
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* 제목 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 자가출판 플랫폼 출판하기
          </h1>
          <p className="text-gray-400 text-sm">
            동화를 전자책 또는 종이책으로 직접 출판해보세요
          </p>
        </div>

        {/* 안내 문구 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm text-yellow-800 leading-relaxed">
              자가출판 플랫폼을 활용하면 비용 없이 전자책(eBook)을 직접 제작하고 교보문고, 알라딘 등 주요 서점에 유통할 수 있으나,
              <span className="font-bold"> 출판에 따른 수수료 및 출판에 대한 모든 책임은 출판자에게 있습니다.</span>
            </p>
          </div>
        </div>

        {/* 플랫폼 선택 카드 */}
        {!selectedPlatform ? (
          <div>
            <p className="text-center text-gray-500 mb-6 font-bold">출판할 플랫폼을 선택해 주세요</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PUBLISH_PLATFORMS.map(platform => (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`border-2 rounded-2xl p-5 cursor-pointer hover:shadow-md transition ${platform.color}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{platform.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{platform.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${platform.badgeColor}`}>
                        {platform.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{platform.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>📄 지원 형식: {platform.format}</p>
                    <p>🏪 유통: {platform.distribution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (

          <div>
            {/* 선택된 플랫폼 헤더 */}
            <div className={`border-2 rounded-2xl p-5 mb-6 ${selectedPlatform.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPlatform.emoji}</span>
                  <div>
                    <h2 className="font-bold text-gray-800 text-xl">{selectedPlatform.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${selectedPlatform.badgeColor}`}>
                      {selectedPlatform.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedPlatform(null); setCurrentStep(1); }}
                  className="text-gray-400 hover:text-gray-600 text-sm hover:underline"
                >
                  플랫폼 변경
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p>📄 {selectedPlatform.format}</p>
                <p>🏪 {selectedPlatform.distribution}</p>
              </div>
            </div>

            {/* 단계 표시 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto">
              {['PDF 생성', '플랫폼 가입', '원고 업로드', '정보 설정', '출판 완료'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center min-w-fit">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      currentStep > index + 1
                        ? 'bg-green-500 text-white'
                        : currentStep === index + 1
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > index + 1 ? '✓' : index + 1}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{step}</span>
                  </div>
                  {index < 4 && (
                    <div className={`w-6 h-0.5 mb-4 mx-1 ${currentStep > index + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* 1단계: 동화 선택 및 PDF 생성 */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">1단계 — 출판할 동화 선택 및 PDF 생성</h3>
                <div className="mb-6">
                  {stories.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-400 mb-4">저장된 동화가 없습니다</p>
                      <Link href="/generate">
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition">
                          동화 만들러 가기
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {stories.map(story => (
                        <div
                          key={story.id}
                          onClick={() => setSelectedStory(story)}
                          className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition ${
                            selectedStory?.id === story.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {story.imageUrl && (
                            <img src={story.imageUrl} alt="표지" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{story.childName}의 동화</p>
                            <p className="text-purple-600 text-sm">테마: {story.theme}</p>
                          </div>
                          {selectedStory?.id === story.id && (
                            <span className="text-purple-600 font-bold text-sm">✓ 선택됨</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleGeneratePDF}
                  disabled={!selectedStory || isGenerating}
                  className="w-full bg-purple-600 text-white text-lg py-4 rounded-2xl hover:bg-purple-700 transition disabled:opacity-40"
                >
                  {isGenerating ? '📄 PDF 생성 중...' : '📄 출판용 PDF 생성'}
                </button>
                <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
                  💡 {selectedPlatform.name} 출판 규격({selectedPlatform.format})에 맞게 자동 생성됩니다
                </div>
              </div>
            )}

            {/* 2단계 이후: 플랫폼별 가이드 */}
            {currentStep >= 2 && (
              <div className="space-y-4">
                {selectedPlatform.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl shadow-sm p-5 ${currentStep === index + 2 ? 'ring-2 ring-purple-400' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep > index + 2
                          ? 'bg-green-500 text-white'
                          : currentStep === index + 2
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {currentStep > index + 2 ? '✓' : index + 2}
                      </span>
                      <p className="font-bold text-gray-800">{step}</p>
                    </div>
                    {index === 0 && currentStep === index + 2 && (
                      <div className="flex gap-3">
                        <a href={selectedPlatform.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <button className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm hover:bg-purple-700 transition font-bold">
                            {selectedPlatform.name} 사이트 열기 →
                          </button>
                        </a>
                        <button
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-xl text-sm hover:bg-purple-50 transition"
                        >
                          완료 →
                        </button>
                      </div>
                    )}
                    {index > 0 && currentStep === index + 2 && (
                      <button
                        onClick={() => setCurrentStep(prev =>
                          prev < selectedPlatform.steps.length + 1 ? prev + 1 : prev
                        )}
                        className="w-full border border-purple-600 text-purple-600 py-3 rounded-xl text-sm hover:bg-purple-50 transition"
                      >
                        {index === selectedPlatform.steps.length - 1 ? '출판 신청 완료 🎉' : '완료 →'}
                      </button>
                    )}
                  </div>
                ))}

                {/* 완료 화면 */}
                {currentStep > selectedPlatform.steps.length + 1 && (
                  <div className="bg-purple-600 rounded-2xl p-8 text-center text-white">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold mb-2">출판 신청 완료!</h3>
                    <p className="text-purple-200 mb-2">
                      {selectedPlatform.name} 검토 후 승인되면<br />
                      {selectedPlatform.distribution}에서 판매됩니다!
                    </p>
                    <p className="text-purple-300 text-xs mb-6">
                      ※ 출판에 따른 수수료 및 모든 책임은 출판자에게 있습니다
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => { setSelectedPlatform(null); setCurrentStep(1); setSelectedStory(null); }}
                        className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition text-sm"
                      >
                        다른 플랫폼 출판
                      </button>
                      <Link href="/">
                        <button className="border border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-500 transition text-sm">
                          홈으로
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}