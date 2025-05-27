import { useState } from 'react';
import { PhotoUploader } from '@/components/PhotoUploader';
import { ProgressBar } from '@/components/ProgressBar';
import { VideoGenerationResult } from '@/services/videoGenerator';
import Head from 'next/head';

export default function Home() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VideoGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (photos.length === 0) {
      setError('請至少上傳一張照片');
      return;
    }

    if (!text.trim()) {
      setError('請輸入文字內容');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(0);

    try {
      // 模擬進度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos,
          text,
          duration: 15
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '生成失敗');
      }

      setProgress(100);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Travel Echo - 旅人記憶共鳴系統</title>
        <meta name="description" content="將您的旅行回憶轉化為獨特的視覺記憶" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Travel Echo — AI 旅程記憶共鳴系統
        </h1>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. 上傳照片</h2>
            <PhotoUploader
              onPhotosSelected={setPhotos}
              maxPhotos={10}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. 輸入文字</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="描述您的旅程感受..."
              className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 text-right">
              {text.length}/500 字
            </p>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium
              ${isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {isGenerating ? '生成中...' : '開始生成'}
          </button>

          {isGenerating && (
            <ProgressBar
              progress={progress}
              status="正在生成您的回憶影片..."
            />
          )}

          {result?.success && result.videoUrl && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. 您的回憶影片</h2>
              <video
                src={result.videoUrl}
                controls
                className="w-full rounded-lg shadow-lg"
              />
              <div className="flex justify-end space-x-4">
                <a
                  href={result.videoUrl}
                  download
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  下載影片
                </a>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  重新生成
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
} 