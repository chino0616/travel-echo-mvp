import OpenAI from 'openai';

interface EnhanceReviewTextParams {
  review: string;
  productName: string;
  rating: number;
}

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enhanceReviewText({
    review,
    productName,
    rating
  }: EnhanceReviewTextParams): Promise<string> {
    const prompt = `
作為一位專業的旅遊內容創作者，請根據以下評論內容，生成一段更有故事性和感染力的文字：

商品：${productName}
評分：${rating}星
原始評論：${review}

要求：
1. 保持原始評論的核心觀點和情感
2. 使用更生動的描述和細節
3. 加入感性的體驗描述
4. 字數限制在100-150字之間
5. 使用溫暖、正面的語氣
6. 適合放在影片字幕中展示

請直接輸出優化後的文字，不要加入任何額外的說明。
    `.trim();

    const completion = await this.client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "你是一位專業的旅遊內容創作者，擅長將普通的評論轉化為富有故事性和感染力的文字。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content?.trim() || review;
  }
} 