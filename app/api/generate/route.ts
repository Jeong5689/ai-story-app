// 단순 주제(topic)만 받아 어린이 동화를 생성 — /generate 페이지용
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "서버에 OPENAI_API_KEY가 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const topic =
      typeof body?.topic === "string" ? body.topic.trim() : "";

    if (!topic) {
      return NextResponse.json(
        { error: "주제를 입력해주세요." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "너는 어린이를 위한 따뜻하고 짧은 동화를 만드는 작가다. 한국어로만 답한다.",
        },
        {
          role: "user",
          content: `주제: ${topic}\n\n위 주제로 어린이 동화를 써줘. 4~6문단, 문장은 쉽게.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const story = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!story) {
      return NextResponse.json(
        { error: "동화 텍스트를 받지 못했습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ story });
  } catch (e) {
    console.error("/api/generate:", e);
    return NextResponse.json(
      { error: "동화 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
