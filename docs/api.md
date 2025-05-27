# Travel Echo API 文檔

## API 端點

### 1. 生成影片

#### 請求
```http
POST /api/generate
Content-Type: application/json

{
    "photos": [
        "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ],
    "text": "在這個美麗的午後，陽光灑落在古老的街道上...",
    "duration": 15
}
```

#### 參數說明
| 參數 | 類型 | 必須 | 說明 |
|------|------|------|------|
| photos | string[] | 是 | Base64 格式的照片數據陣列 |
| text | string | 是 | 要在影片中顯示的文字 |
| duration | number | 否 | 影片時長（秒），預設 15 秒 |

#### 成功回應
```json
{
    "success": true,
    "videoUrl": "/storage/videos/video-1234567890.mp4"
}
```

#### 錯誤回應
```json
{
    "success": false,
    "error": "錯誤訊息",
    "details": {
        "code": "ERROR_CODE",
        "message": "詳細錯誤說明"
    }
}
```

### 2. 上傳照片（計劃中）

#### 請求
```http
POST /api/upload
Content-Type: multipart/form-data

file: <photo_file>
```

#### 參數說明
| 參數 | 類型 | 必須 | 說明 |
|------|------|------|------|
| file | File | 是 | 要上傳的照片檔案 |

#### 成功回應
```json
{
    "success": true,
    "url": "/storage/photos/photo-1234567890.jpg"
}
```

### 3. 生成文字（計劃中）

#### 請求
```http
POST /api/text
Content-Type: application/json

{
    "prompt": "描述這次旅程的感受",
    "style": "感性",
    "length": "medium"
}
```

## 錯誤代碼

| 錯誤代碼 | 說明 | 解決方案 |
|----------|------|----------|
| INVALID_PHOTO | 照片格式無效 | 確保照片為 JPEG 或 PNG 格式 |
| FILE_TOO_LARGE | 檔案過大 | 照片大小應小於 10MB |
| GENERATION_FAILED | 影片生成失敗 | 檢查 FFmpeg 設置和錯誤日誌 |
| INVALID_TEXT | 文字內容無效 | 文字長度應在 1-500 字之間 |

## 使用限制

- 最大照片數量：10 張
- 單張照片大小限制：10MB
- 支援的照片格式：JPEG, PNG
- 文字長度限制：500 字
- API 請求頻率限制：100 次/15分鐘

## 開發環境

### 本地測試
```bash
# 啟動開發服務器
npm run dev

# 測試 API
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "photos": ["..."],
    "text": "測試文字",
    "duration": 15
  }'
```

### 錯誤處理最佳實踐
1. 總是檢查回應的 `success` 欄位
2. 實作錯誤重試機制
3. 添加超時處理
4. 實作進度回調 