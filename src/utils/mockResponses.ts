export const mockMemoryTexts = {
  文青: [
    "在京都的小巷中，陽光灑落在古老的石板上，時光彷彿靜止。那一刻，我感受到了永恆的寧靜，彷彿整個世界都在低聲詠唱著古老和歌。",
    "漫步在威尼斯的彩色島嶼，布拉諾的色彩如同水彩暈染開來。每一扇窗，每一個轉角，都是一幅未完成的畫作。",
    "清晨的富士山，雲霧繞間若隱若現。手中的咖啡還在冒著熱氣，這一刻的寧靜，只屬於我和這座神聖的山。"
  ],
  幽默: [
    "誰說迷路不是旅行的樂趣？今天在巴黎繞了三個圈，發現了五家甜點店，結果晚餐吃了三個可頌。嘿，這才是真正的法式生活！",
    "在倫敦搭地鐵，一直喊著「左側站立」，結果發現自己走錯線了。不過，至少我的英式口音練得很道地！",
    "第一次吃墨西哥辣椒，我的表情一定很精彩，因為服務生遞來了一整壺水，還附贈同情的微笑。"
  ],
  感性: [
    "在聖托里尼的日落中，我想起了你。藍白相間的房子裡，裝著我們共同的夢想，那些未完成的約定，終將在某個明天實現。",
    "清邁的夜市裡，一盞盞燈籠照亮了異鄉的夜。在這裡，我找到了勇氣，也找到了自己。",
    "在馬丘比丘的晨霧中，我終於明白了旅行的意義。不是為了逃離，而是為了在遠方遇見更好的自己。"
  ]
};

export interface GenerationProgress {
  stage: '準備照片' | '生成影片' | '添加文字' | '完成';
  progress: number;
}

export interface GenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

// 開發環境標誌
export const isDevelopment = process.env.NODE_ENV === 'development';

// 模擬影片生成延遲時間（毫秒）
export const MOCK_VIDEO_DELAY = 2000;

// 模擬影片生成
export const mockVideoGeneration = async (
  photos: string[],
  text: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<string> => {
  // 模擬各階段進度
  const stages: GenerationProgress['stage'][] = ['準備照片', '生成影片', '添加文字', '完成'];
  
  for (const stage of stages) {
    onProgress?.({
      stage,
      progress: 0
    });
    await new Promise(resolve => setTimeout(resolve, MOCK_VIDEO_DELAY / 4));
    onProgress?.({
      stage,
      progress: 100
    });
  }

  // 使用本地生成的影片
  const timestamp = Date.now();
  return `/storage/videos/video-${timestamp}.mp4`;
};

export const useMockAPI = process.env.USE_MOCK_API === 'true'; 