# Travel Echo — AI 旅程記憶共鳴系統

## 專案概述
Travel Echo 是一個以 AI 為核心的個人化旅後內容生成體驗模組，能夠根據使用者的旅程資料、語氣風格與圖像素材，產出可回顧、可保存、可分享的故事式內容。

## 核心功能
- 🤖 **AI 語氣模擬**：從使用者評論學習語氣，生成個人化文字
- 📸 **照片處理**：自動處理和優化上傳的照片
- 🎬 **影片生成**：將照片和文字合成為精美的回憶影片
- 🌐 **社群分享**：支援多平台內容分享

## 技術棧
- **前端**：Next.js, React, Material-UI
- **後端**：Next.js API Routes
- **影片處理**：FFmpeg
- **AI 服務**：OpenAI API
- **存儲**：本地文件系統

## 快速開始

### 環境要求
- Node.js 18+
- FFmpeg
- OpenAI API Key

### 安裝步驟
1. 克隆專案
```bash
git clone https://github.com/chino0616/travel-echo-mvp.git
cd travel-echo-mvp
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變數
```bash
cp .env.example .env
# 編輯 .env 文件，填入必要的配置
```

4. 啟動開發服務器
```bash
npm run dev
```

## 文檔
- [產品需求文件 (PRD)](docs/PRD.md)
- [系統架構設計 (SASD)](docs/architecture/SASD.md)

## 開發進度
- [x] 基礎架構搭建
- [x] 照片上傳功能
- [x] 影片生成核心邏輯
- [ ] AI 文案生成
- [ ] 社交分享功能

## 貢獻指南
歡迎提交 Issue 和 Pull Request！

## 授權
本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件 