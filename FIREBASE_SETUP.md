# Firebase Google 登入設定指南

## 🚀 快速開始

本專案已經整合了 Firebase Google 認證功能。請按照以下步驟完成設定：

## 1. 創建 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊 "新增專案"
3. 輸入專案名稱（例如：`task-tracker-app`）
4. 選擇是否啟用 Google Analytics（可選）
5. 點擊 "建立專案"

## 2. 設定 Authentication

1. 在 Firebase 控制台中，選擇您的專案
2. 點擊左側選單的 "Authentication"
3. 點擊 "開始使用"
4. 選擇 "Sign-in method" 標籤
5. 點擊 "Google" 登入提供者
6. 啟用 Google 登入
7. 輸入專案的公用名稱
8. 選擇專案支援電子郵件
9. 點擊 "儲存"

## 3. 設定 Firestore Database

1. 在 Firebase 控制台中，點擊 "Firestore Database"
2. 點擊 "建立資料庫"
3. 選擇 "以測試模式開始"（之後可以修改安全性規則）
4. 選擇資料庫位置（建議選擇 asia-east1）
5. 點擊 "完成"

## 4. 獲取 Firebase 配置

1. 在 Firebase 控制台中，點擊專案設定（齒輪圖示）
2. 選擇 "一般" 標籤
3. 在 "您的應用程式" 區域，點擊 "網頁應用程式" 圖示（</>）
4. 輸入應用程式暱稱（例如：`Task Tracker Web`）
5. 選擇 "同時為此應用程式設定 Firebase 代管功能"（可選）
6. 點擊 "註冊應用程式"
7. 複製顯示的 Firebase 配置物件

## 5. 更新配置檔案

將複製的配置資訊填入 `firebase-config.js` 檔案：

```javascript
const firebaseConfig = {
    apiKey: "你的-API-KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789"
};
```