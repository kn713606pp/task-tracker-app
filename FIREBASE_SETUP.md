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

## 6. 設定安全性規則

在 Firestore 中設定適當的安全性規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許已認證用戶存取自己的數據
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 允許已認證用戶讀取和寫入自己的用戶資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. 測試功能

1. 開啟您的網頁應用程式
2. 點擊 "使用 Google 登入" 按鈕
3. 選擇 Google 帳號並授權
4. 確認登入成功後能看到用戶資訊
5. 測試登出功能

## 🔧 整合功能

本專案包含以下 Firebase 功能：

### 認證功能（`auth.js`）
- ✅ Google 登入/登出
- ✅ 用戶狀態監聽
- ✅ 錯誤處理
- ✅ UI 自動更新

### 數據管理（`user-data-manager.js`）
- ✅ 任務數據雲端同步
- ✅ 麻將戰績雲端儲存
- ✅ 用戶設定管理
- ✅ 數據備份與恢復
- ✅ 離線支援

### 整合頁面
- ✅ `index.html` - 任務追蹤系統
- ✅ `mahjong-session-tracker.html` - 麻將戰績系統

## 📱 使用方式

### 登入流程
1. 用戶點擊 "使用 Google 登入"
2. 系統跳轉到 Google 認證頁面
3. 用戶授權後自動跳回應用程式
4. 系統自動載入用戶雲端數據
5. UI 更新顯示用戶資訊

### 數據同步
- **自動同步**：用戶登入時自動載入雲端數據
- **手動備份**：可以創建完整數據備份
- **衝突解決**：使用時間戳比較處理數據衝突

### 離線支援
- 未登入時使用本地儲存
- 登入後自動同步到雲端
- 網路恢復時自動上傳本地變更

## 🔒 隱私與安全

- 所有數據儲存在用戶專屬的 Firestore 空間
- 使用 Firebase 安全性規則保護數據
- 僅有已認證用戶可存取自己的數據
- Google 認證確保帳號安全性

## 🚨 故障排除

### 常見問題

**登入彈窗被阻擋**
- 檢查瀏覽器是否阻擋彈出視窗
- 暫時允許彈出視窗並重新嘗試

**配置錯誤**
- 確認 `firebase-config.js` 中的配置正確
- 檢查 Firebase 控制台中的應用程式設定

**數據未同步**
- 確認網路連線正常
- 檢查 Firestore 安全性規則是否正確
- 查看瀏覽器開發者工具的錯誤訊息

**權限問題**
- 確認在 Firebase Authentication 中啟用了 Google 登入
- 檢查 Firestore 安全性規則是否允許用戶存取

### 調試技巧
1. 打開瀏覽器開發者工具
2. 查看 Console 標籤的錯誤訊息
3. 檢查 Network 標籤的請求狀態
4. 驗證 Firebase 配置是否正確載入

## 📞 支援

如果遇到問題，請：
1. 檢查 Firebase 控制台的配置
2. 查看瀏覽器控制台的錯誤訊息
3. 參考 [Firebase 官方文檔](https://firebase.google.com/docs)
4. 確認網路連線和瀏覽器權限

## 🎯 進階功能

您還可以進一步擴展以下功能：
- 多因子認證 (MFA)
- 自定義用戶資料欄位
- 實時數據同步
- 離線數據快取
- 數據分析和報表

---

**注意**：請確保將實際的 Firebase 配置資訊保密，不要將包含敏感資訊的配置檔案提交到公共程式碼庫。