import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface PhotoUploaderProps {
  onPhotosSelected: (photos: string[]) => void;
  maxPhotos?: number;
  acceptedTypes?: string[];
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotosSelected,
  maxPhotos = 10,
  acceptedTypes = ['image/jpeg', 'image/png']
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length + previews.length > maxPhotos) {
      alert(`最多只能上傳 ${maxPhotos} 張照片`);
      return;
    }

    const newPreviews = await Promise.all(
      acceptedFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onPhotosSelected(updatedPreviews);
  }, [maxPhotos, previews, onPhotosSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxPhotos,
    noClick: false,
    noKeyboard: false,
    preventDropOnDocument: true
  });

  const removePhoto = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onPhotosSelected(updatedPreviews);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">放開以上傳照片...</p>
        ) : (
          <div>
            <p className="text-gray-600">拖放照片到此處，或點擊上傳</p>
            <p className="text-sm text-gray-500 mt-2">
              支援的格式：JPG, PNG（最多 {maxPhotos} 張）
            </p>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`上傳的照片 ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg select-none"
                  style={{ pointerEvents: 'none' }}
                />
                <div 
                  className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                    opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="移除照片"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 