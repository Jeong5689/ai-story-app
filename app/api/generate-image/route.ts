import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { theme, childName, paragraph } = await request.json();

    if (!theme && !paragraph) {
      return NextResponse.json(
        { error: '테마 또는 단락 내용을 입력해주세요' },
        { status: 400 }
      );
    }

    // 단락 내용이 있으면 단락 기반, 없으면 테마 기반
    const promptText = paragraph
      ? `children book illustration, ${paragraph.slice(0, 100)}, soft watercolor, pastel colors, cute, magical, no text, child friendly`
      : `children book illustration, ${childName || ''}, ${theme || ''}, soft watercolor, pastel colors, cute, magical, no text, child friendly`;

    const imagePrompt = encodeURIComponent(promptText);
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