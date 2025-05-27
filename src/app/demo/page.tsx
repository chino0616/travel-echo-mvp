'use client';

import { ProductReviewForm } from '@/components/ProductReviewForm';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 px-4">
          旅遊評論模擬器
        </h1>
        <ProductReviewForm />
      </div>
    </div>
  );
} 