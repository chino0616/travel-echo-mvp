# 貢獻指南

感謝您有興趣為 Travel Echo 專案做出貢獻！

## 開發流程

### 1. 環境設置
1. Fork 本倉庫
2. 克隆您的 Fork
```bash
git clone https://github.com/您的用戶名/travel-echo-mvp.git
```
3. 安裝依賴
```bash
npm install
```
4. 複製並設置環境變數
```bash
cp .env.example .env
```

### 2. 開發規範

#### 分支命名
- 功能開發：`feature/功能名稱`
- 錯誤修復：`fix/錯誤描述`
- 文檔更新：`docs/更新內容`

#### Commit 訊息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

類型（type）：
- feat: 新功能
- fix: 錯誤修復
- docs: 文檔更新
- style: 程式碼格式調整
- refactor: 重構
- test: 測試相關
- chore: 建置/工具相關

#### 程式碼風格
- 使用 TypeScript
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼

### 3. 測試
- 確保所有測試通過
- 添加新功能時需要添加對應的測試
- 運行測試：`npm test`

### 4. 提交 Pull Request
1. 推送到您的 Fork
2. 創建 Pull Request
3. 在描述中說明：
   - 變更內容
   - 解決的問題
   - 測試方法
   - 相關的 Issue

## 問題回報
- 使用 Issue 模板
- 提供詳細的重現步驟
- 附上錯誤訊息和日誌

## 開發指南

### 影片生成模組
```typescript
interface VideoGeneratorOptions {
    photos: string[];    // Base64 格式的照片數據
    text: string;        // 生成的文字內容
    duration: number;    // 影片時長（秒）
}
```

### 錯誤處理
```typescript
class VideoGenerationError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = 'VideoGenerationError';
    }
}
```

### 常見問題

#### 1. FFmpeg 相關
Q: FFmpeg 執行失敗？
A: 檢查：
   - FFmpeg 是否正確安裝
   - 系統 PATH 是否正確設置
   - 檢查錯誤日誌

#### 2. 照片處理
Q: 照片上傳失敗？
A: 確認：
   - 檔案大小是否超過限制
   - 檔案格式是否支援
   - 存儲目錄權限是否正確

#### 3. 影片生成
Q: 影片生成時間過長？
A: 考慮：
   - 減少照片數量
   - 優化照片大小
   - 調整影片品質參數

## 發布流程
1. 版本號更新
2. 更新 CHANGELOG.md
3. 創建發布標籤
4. 推送到主分支

## 聯絡方式
- Issue 追蹤器
- 開發者群組
- 技術支援郵件 