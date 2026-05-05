import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { theme, childName } = await request.json();

    if (!theme || !childName) {
      return NextResponse.json(
        { error: '테마와 이름을 입력해주세요' },
        { status: 400 }
      );
    }

    // 영문으로만 프롬프트 구성 (한글 인코딩 문제 방지)
    const imagePrompt = encodeURIComponent(
      `children book illustration, soft watercolor, pastel colors, cute character, magical forest, no text, child friendly`
    );

    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return NextResponse.json(
      { error: '이미지 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}