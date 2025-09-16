// Firebase 配置文件
// 請將以下配置替換為您的 Firebase 項目配置

const firebaseConfig = {
    // 請在 Firebase Console 中獲取您的配置
    // 範例配置 - 請替換為您的實際配置
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789"
};

// 初始化 Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 如果使用模組化導入 (推薦)
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 如果使用傳統方式 (在 HTML 中直接引用)
window.firebaseConfig = firebaseConfig;