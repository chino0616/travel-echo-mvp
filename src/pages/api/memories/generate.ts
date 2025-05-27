import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { mockMemoryTexts, isDevelopment, useMockAPI } from '@/utils/mockResponses';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  try {
    const { tripData, mood } = req.body;

    if (!tripData || !mood) {
      return res.status(400).json({ message: '缺少必要參數' });
    }

    // 在開發環境且啟用模擬模式時，使用預設回應
    if (isDevelopment) {
      const moodTexts = mockMemoryTexts[mood as keyof typeof mockMemoryTexts] || mockMemoryTexts['文青'];
      const randomIndex = Math.floor(Math.random() * moodTexts.length);
      return res.status(200).json({ content: moodTexts[randomIndex] });
    }

    // 使用較便宜的 GPT-3.5-turbo 模型進行開發
    const model = isDevelopment ? "gpt-3.5-turbo" : "gpt-4";

    // 根據心情生成不同的提示詞
    const moodPrompts = {
      文青: '以文藝優雅的方式描述這段旅程',
      幽默: '用輕鬆幽默的語氣描述這段旅程',
      感性: '以感性溫暖的方式描述這段旅程'
    };

    const prompt = `
      旅程資訊：${JSON.stringify(tripData)}
      要求：${moodPrompts[mood as keyof typeof moodPrompts]}
      請用100字以內生成一段富有情感的旅行回憶描述。
    `;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "你是一個專業的旅行文案撰寫者，擅長將旅行經歷轉化為動人的故事。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('無法生成內容');
    }

    return res.status(200).json({ content: generatedContent });
  } catch (error) {
    console.error('記憶生成錯誤:', error);
    return res.status(500).json({ message: '內部服務器錯誤' });
  }
} 