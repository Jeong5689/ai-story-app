import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Groq 클라이언트 초기화
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// catch문 외부 또는 상단에 정의하여 전역에서 참조 가능하도록 배치
interface ApiError {
  message?: string;
  status?: number;
  code?: string;
  stack?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { childName, theme, ageGroup, moral } = await request.json();

    // 입력값 유효성 검사
    if (!childName || !theme) {
      return NextResponse.json(
        { error: '이름과 테마를 입력해주세요' },
        { status: 400 }
      );
    }

    // 동화 생성 프롬프트
    const prompt = `
      ${ageGroup}세 어린이를 위한 한국어 창작 동화를 써주세요.
      주인공 이름: ${childName}
      테마: ${theme}
      교훈: ${moral || '친구와 협력하는 것의 중요성'}
      
      형식:
      ## 제목 (첫 줄)
      
      본문 4~5 단락 (각 3~4문장)
      
      맺음말 (교훈 포함)
      
      문체: 따뜻하고 쉬운 동화체로 작성해주세요.
    `;

    const completion = await groqClient.chat.completions.create({
      model: "llama3-70b-8192", // 혹은 "openai/gpt-oss-120b"
      messages: [ { role: 'user', content: prompt } ]
    });

    const storyText = completion.choices[0].message.content || '';
    return NextResponse.json({ story: storyText });

  } catch (error: unknown) {
    // 💡 핵심 해결책: unknown 타입의 error를 미리 정의해둔 ApiError 타입으로 단언(as)합니다.
    const err = error as ApiError;

    console.error('동화 생성 오류 상세:', {
      message: err.message,
      status: err.status,
      code: err.code,
      stack: err.stack,
    });

    return NextResponse.json(
      { error: err.message || '동화 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
