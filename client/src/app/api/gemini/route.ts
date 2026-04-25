import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt, data } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Generate content based on prompt and data
    // For now, let's keep the example response as per instructions but include the real logic skeleton
    /*
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    */

    return NextResponse.json({
      reply: "AI response working 🚀",
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
