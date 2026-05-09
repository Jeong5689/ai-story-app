'use client';
// 개인정보보호 동의서 팝업 컴포넌트
import { useState } from 'react';

interface PrivacyModalProps {
  onAgree: () => void;
  onClose: () => void;
}

export default function PrivacyModal({ onAgree, onClose }: PrivacyModalProps) {
  const [agreements, setAgreements] = useState({
    terms: false,        // 이용약관 동의 (필수)
    privacy: false,      // 개인정보 수집 및 이용 동의 (필수)
    marketing: false,    // 마케팅 정보 수신 동의 (선택)
    age: false,          // 만 14세 이상 확인 (필수)
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // 전체 동의
  function handleAllAgree() {
    const allChecked = Object.values(agreements).every(v => v);
    setAgreements({
      terms: !allChecked,
      privacy: !allChecked,
      marketing: !allChecked,
      age: !allChecked,
    });
  }

  // 필수 항목 모두 동의했는지 확인
  const canProceed = agreements.terms && agreements.privacy && agreements.age;
  const allAgreed = Object.values(agreements).every(v => v);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">

        {/* 헤더 */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-800">
              서비스 이용약관 동의
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400">
            동화나라 서비스 이용을 위해 아래 약관에 동의해 주세요
          </p>
        </div>

        <div className="px-6 py-4">

          {/* 전체 동의 */}
          <div
            onClick={handleAllAgree}
            className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer mb-4 transition ${
              allAgreed ? 'bg-purple-600' : 'bg-gray-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              allAgreed ? 'bg-white border-white' : 'border-gray-400'
            }`}>
              {allAgreed && <span className="text-purple-600 font-bold text-sm">✓</span>}
            </div>
            <span className={`font-bold text-lg ${allAgreed ? 'text-white' : 'text-gray-700'}`}>
              전체 동의하기
            </span>
          </div>

          <div className="text-xs text-gray-400 mb-4 px-1">
            선택 항목 포함 모든 약관에 동의합니다
          </div>

          {/* 개별 동의 항목 */}
          <div className="space-y-3">

            {/* 이용약관 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setAgreements(prev => ({ ...prev, terms: !prev.terms }))}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  agreements.terms ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  {agreements.terms && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  서비스 이용약관 동의
                </span>
                <span className="text-xs text-red-500 font-bold">필수</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(activeSection === 'terms' ? null : 'terms');
                  }}
                  className="text-gray-400 text-xs hover:text-gray-600"
                >
                  {activeSection === 'terms' ? '접기 ▲' : '보기 ▼'}
                </button>
              </div>
              {activeSection === 'terms' && (
                <div className="px-4 pb-4 text-xs text-gray-500 bg-gray-50 leading-relaxed">
                  <p className="font-bold text-gray-700 mb-2">제1조 (목적)</p>
                  <p className="mb-2">본 약관은 동화나라(이하 "서비스")가 제공하는 AI 동화 생성 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                  <p className="font-bold text-gray-700 mb-2">제2조 (서비스 이용)</p>
                  <p className="mb-2">① 서비스는 AI를 활용한 동화 생성, 저장, 공유 기능을 제공합니다.<br/>② 이용자는 서비스를 통해 생성된 콘텐츠에 대한 책임을 집니다.<br/>③ 타인의 권리를 침해하거나 불법적인 목적으로 서비스를 이용할 수 없습니다.</p>
                  <p className="font-bold text-gray-700 mb-2">제3조 (계정 관리)</p>
                  <p className="mb-2">① 이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.<br/>② 계정 도용 등의 문제 발생 시 즉시 서비스에 신고해야 합니다.</p>
                  <p className="font-bold text-gray-700 mb-2">제4조 (서비스 중단)</p>
                  <p>서비스는 시스템 점검, 장애, 천재지변 등의 사유로 서비스 제공이 일시 중단될 수 있습니다.</p>
                </div>
              )}
            </div>

            {/* 개인정보 수집 및 이용 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setAgreements(prev => ({ ...prev, privacy: !prev.privacy }))}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  agreements.privacy ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  {agreements.privacy && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  개인정보 수집 및 이용 동의
                </span>
                <span className="text-xs text-red-500 font-bold">필수</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(activeSection === 'privacy' ? null : 'privacy');
                  }}
                  className="text-gray-400 text-xs hover:text-gray-600"
                >
                  {activeSection === 'privacy' ? '접기 ▲' : '보기 ▼'}
                </button>
              </div>
              {activeSection === 'privacy' && (
                <div className="px-4 pb-4 text-xs text-gray-500 bg-gray-50 leading-relaxed">
                  <p className="font-bold text-gray-700 mb-2">1. 수집하는 개인정보 항목</p>
                  <p className="mb-2">• 필수항목: 이메일 주소, 비밀번호(암호화 저장)<br/>• 자동수집: 서비스 이용 기록, 접속 로그</p>
                  <p className="font-bold text-gray-700 mb-2">2. 개인정보 수집 및 이용 목적</p>
                  <p className="mb-2">• 회원 가입 및 서비스 제공<br/>• 동화 저장 및 관리 서비스<br/>• 고객 문의 및 불만 처리<br/>• 서비스 개선 및 신규 서비스 개발</p>
                  <p className="font-bold text-gray-700 mb-2">3. 개인정보 보유 및 이용 기간</p>
                  <p className="mb-2">• 회원 탈퇴 시까지 보관<br/>• 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관</p>
                  <p className="font-bold text-gray-700 mb-2">4. 개인정보 제3자 제공</p>
                  <p>동의 없이 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.</p>
                </div>
              )}
            </div>

            {/* 만 14세 이상 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setAgreements(prev => ({ ...prev, age: !prev.age }))}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  agreements.age ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  {agreements.age && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  만 14세 이상 확인
                </span>
                <span className="text-xs text-red-500 font-bold">필수</span>
              </div>
            </div>

            {/* 마케팅 수신 동의 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setAgreements(prev => ({ ...prev, marketing: !prev.marketing }))}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  agreements.marketing ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  {agreements.marketing && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  마케팅 정보 수신 동의
                </span>
                <span className="text-xs text-blue-500 font-bold">선택</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(activeSection === 'marketing' ? null : 'marketing');
                  }}
                  className="text-gray-400 text-xs hover:text-gray-600"
                >
                  {activeSection === 'marketing' ? '접기 ▲' : '보기 ▼'}
                </button>
              </div>
              {activeSection === 'marketing' && (
                <div className="px-4 pb-4 text-xs text-gray-500 bg-gray-50 leading-relaxed">
                  <p className="mb-2">동화나라의 새로운 기능, 이벤트, 프로모션 등의 마케팅 정보를 이메일로 수신합니다.</p>
                  <p>• 수신 동의 철회: 마이페이지 &gt; 알림 설정에서 언제든지 철회 가능</p>
                </div>
              )}
            </div>

          </div>

          {/* 동의 버튼 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={onAgree}
              disabled={!canProceed}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canProceed ? '동의하고 가입하기' : '필수 항목에 동의해 주세요'}
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm hover:bg-gray-50 transition"
            >
              취소
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}