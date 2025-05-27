import React, { useState } from 'react';
import { PhotoUploader } from '../PhotoUploader';

interface ProductData {
  name: string;
  location: string;
  description: string[];
  images: string[];
}

interface ReviewData {
  title: string;
  content: string;
  images: string[];
}

interface ProductReviewGroup {
  product: ProductData;
  reviews: ReviewData[];
}

export const ProductReviewForm: React.FC = () => {
  const [productReviewGroups, setProductReviewGroups] = useState<ProductReviewGroup[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductData>({
    name: '',
    location: '',
    description: ['', '', ''], // 預設三行描述
    images: [],
  });

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: ProductReviewGroup = {
      product: currentProduct,
      reviews: [],
    };
    setProductReviewGroups([...productReviewGroups, newGroup]);
    // 重置商品表單
    setCurrentProduct({
      name: '',
      location: '',
      description: ['', '', ''],
      images: [],
    });
  };

  const handleReviewSubmit = (productIndex: number) => (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newReview: ReviewData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      images: [],
    };

    const updatedGroups = [...productReviewGroups];
    updatedGroups[productIndex].reviews.push(newReview);
    setProductReviewGroups(updatedGroups);
    
    // 重置表單
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* 商品表單 */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">新增商品</h2>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">商品名稱</label>
            <input
              type="text"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">商品所在地</label>
            <input
              type="text"
              value={currentProduct.location}
              onChange={(e) => setCurrentProduct({...currentProduct, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：日本 - 甲信越, 關東, 新潟..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">商品說明（每行一個重點）</label>
            {currentProduct.description.map((desc, index) => (
              <input
                key={index}
                type="text"
                value={desc}
                onChange={(e) => {
                  const newDesc = [...currentProduct.description];
                  newDesc[index] = e.target.value;
                  setCurrentProduct({...currentProduct, description: newDesc});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder={`重點 ${index + 1}`}
                required
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">商品圖片</label>
            <PhotoUploader
              onPhotosSelected={(photos) => setCurrentProduct({...currentProduct, images: photos})}
              maxPhotos={10}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新增商品
          </button>
        </form>
      </div>

      {/* 已新增的商品和評論列表 */}
      {productReviewGroups.map((group, productIndex) => (
        <div key={productIndex} className="bg-white p-6 rounded-lg shadow-lg">
          {/* 商品資訊 */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-xl font-bold">{group.product.name}</h3>
            <p className="text-gray-600 mt-2">{group.product.location}</p>
            <ul className="list-disc list-inside mt-2">
              {group.product.description.map((desc, i) => (
                <li key={i} className="text-gray-700">{desc}</li>
              ))}
            </ul>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
              {group.product.images.map((img, i) => (
                <img key={i} src={img} alt={`商品圖 ${i+1}`} className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          </div>

          {/* 評論列表 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">評論列表</h4>
            {group.reviews.map((review, reviewIndex) => (
              <div key={reviewIndex} className="border-t pt-4">
                <h5 className="font-medium">{review.title}</h5>
                <p className="text-gray-600 mt-2">{review.content}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {review.images.map((img, i) => (
                    <img key={i} src={img} alt={`評論圖 ${i+1}`} className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 新增評論表單 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-4">新增評論</h4>
            <form onSubmit={handleReviewSubmit(productIndex)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">評論標題</label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">評論內容</label>
                <textarea
                  name="content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">評論圖片</label>
                <PhotoUploader
                  onPhotosSelected={(photos) => {
                    const form = document.forms[productIndex + 1];
                    const imagesInput = form.querySelector('input[name="images"]') as HTMLInputElement;
                    if (imagesInput) {
                      imagesInput.value = JSON.stringify(photos);
                    }
                  }}
                  maxPhotos={10}
                />
                <input type="hidden" name="images" />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                新增評論
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}; 