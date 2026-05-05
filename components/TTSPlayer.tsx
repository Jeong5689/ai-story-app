'use client';
// 브라우저 내장 TTS 플레이어 컴포넌트
import { useState, useEffect, useRef } from 'react';

interface TTSPlayerProps {
  text: string;
}

export default function TTSPlayer({ text }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 TTS 중지
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 동화 텍스트에서 ## 제거
  function cleanText(rawText: string): string {
    return rawText
      .split('\n')
      .map(line => line.replace('## ', ''))
      .filter(line => line.trim())
      .join(' ');
  }

  // 재생 시작
  function handlePlay() {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    setProgress(0);

    const cleanedText = cleanText(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);

    // 한국어 설정
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;   // 속도 (0.1 ~ 10)
    utterance.pitch = 1.1;  // 음높이 (0 ~ 2)
    utterance.volume = 1;   // 볼륨 (0 ~ 1)

    // 한국어 음성 찾기
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      voice => voice.lang === 'ko-KR' || voice.lang.startsWith('ko')
    );
    if (koreanVoice) utterance.voice = koreanVoice;

    // 재생 완료
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // 오류 처리
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);

    // 진행률 업데이트 (예상 시간 기반)
    const estimatedDuration = cleanedText.length * 80;
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / estimatedDuration) * 100, 95);
      setProgress(currentProgress);
    }, 500);
  }

  // 일시정지
  function handlePause() {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  // 정지
  function handleStop() {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return (
    <div className="bg-purple-50 rounded-2xl p-5 my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎧</span>
        <span className="font-bold text-purple-700 text-sm">동화 듣기</span>
      </div>

      {/* 진행바 */}
      <div className="bg-purple-100 rounded-full h-2 mb-4">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex gap-3">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition text-sm font-bold"
          >
            ▶ {isPaused ? '계속 듣기' : '재생'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-xl hover:bg-yellow-600 transition text-sm font-bold"
          >
            ⏸ 일시정지
          </button>
        )}
        <button
          onClick={handleStop}
          disabled={!isPlaying && !isPaused}
          className="flex items-center gap-2 border border-purple-300 text-purple-600 px-5 py-2 rounded-xl hover:bg-purple-100 transition text-sm font-bold disabled:opacity-30"
        >
          ⏹ 정지
        </button>
      </div>
    </div>
  );
}