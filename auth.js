// 統一的 Firebase 認證模組
class AuthManager {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.authStateListeners = [];
        this.isInitialized = false;
    }

    // 初始化 Firebase 認證
    async initialize() {
        try {
            // 初始化 Firebase
            const app = firebase.initializeApp(window.firebaseConfig);
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // 設置認證狀態監聽器
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.notifyAuthStateListeners(user);
                
                // 更新 UI
                this.updateAuthUI(user);
                
                // 如果用戶已登入，保存用戶資訊
                if (user) {
                    this.saveUserInfo(user);
                }
            });
            
            this.isInitialized = true;
            console.log('Firebase 認證初始化成功');
        } catch (error) {
            console.error('Firebase 初始化失敗:', error);
            throw error;
        }
    }

    // Google 登入
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            
            console.log('Google 登入成功:', user);
            return user;
        } catch (error) {
            console.error('Google 登入失敗:', error);
            
            // 處理常見錯誤
            let errorMessage = '登入失敗，請稍後再試';
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = '登入視窗被關閉，請重新嘗試';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = '彈出視窗被阻擋，請允許彈出視窗並重新嘗試';
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = '登入請求被取消';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = '網路連線失敗，請檢查網路連線';
                    break;
            }
            
            this.showError(errorMessage);
            throw error;
        }
    }

    // 登出
    async signOut() {
        try {
            await this.auth.signOut();
            console.log('用戶已登出');
            this.currentUser = null;
        } catch (error) {
            console.error('登出失敗:', error);
            this.showError('登出失敗，請稍後再試');
            throw error;
        }
    }

    // 獲取當前用戶
    getCurrentUser() {
        return this.currentUser;
    }

    // 檢查用戶是否已登入
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 添加認證狀態監聽器
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        // 如果已經有用戶，立即調用回調
        if (this.currentUser) {
            callback(this.currentUser);
        }
    }

    // 通知所有認證狀態監聽器
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('認證狀態監聽器錯誤:', error);
            }
        });
    }

    // 保存用戶資訊到 Firestore
    async saveUserInfo(user) {
        try {
            const userRef = this.db.collection('users').doc(user.uid);
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 使用 merge: true 來避免覆蓋現有數據
            await userRef.set(userData, { merge: true });
            console.log('用戶資訊已保存');
        } catch (error) {
            console.error('保存用戶資訊失敗:', error);
        }
    }

    // 獲取用戶資訊
    async getUserInfo(uid = null) {
        try {
            const userId = uid || this.currentUser?.uid;
            if (!userId) return null;

            const userRef = this.db.collection('users').doc(userId);
            const doc = await userRef.get();
            
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('獲取用戶資訊失敗:', error);
            return null;
        }
    }

    // 更新認證 UI
    updateAuthUI(user) {
        // 更新登入按鈕
        const loginBtns = document.querySelectorAll('.google-login-btn');
        const logoutBtns = document.querySelectorAll('.logout-btn');
        const userInfos = document.querySelectorAll('.user-info');
        const authRequiredElements = document.querySelectorAll('.auth-required');
        const guestOnlyElements = document.querySelectorAll('.guest-only');

        if (user) {
            // 用戶已登入
            loginBtns.forEach(btn => btn.style.display = 'none');
            logoutBtns.forEach(btn => btn.style.display = 'block');
            authRequiredElements.forEach(el => el.style.display = 'block');
            guestOnlyElements.forEach(el => el.style.display = 'none');
            
            // 更新用戶資訊顯示
            userInfos.forEach(info => {
                info.innerHTML = `
                    <div class="flex items-center space-x-3">
                        ${user.photoURL ? `<img src="${user.photoURL}" alt="用戶頭像" class="w-8 h-8 rounded-full">` : ''}
                        <div>
                            <div class="text-sm font-medium text-gray-900">${user.displayName || '用戶'}</div>
                            <div class="text-xs text-gray-500">${user.email}</div>
                        </div>
                    </div>
                `;
                info.style.display = 'block';
            });
        } else {
            // 用戶未登入
            loginBtns.forEach(btn => btn.style.display = 'block');
            logoutBtns.forEach(btn => btn.style.display = 'none');
            userInfos.forEach(info => info.style.display = 'none');
            authRequiredElements.forEach(el => el.style.display = 'none');
            guestOnlyElements.forEach(el => el.style.display = 'block');
        }
    }

    // 顯示錯誤訊息
    showError(message) {
        // 可以自定義錯誤顯示方式
        console.error(message);
        
        // 如果頁面有錯誤顯示區域
        const errorElement = document.getElementById('auth-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // 3秒後自動隐藏
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        } else {
            // 否則使用 alert
            alert(message);
        }
    }

    // 顯示成功訊息
    showSuccess(message) {
        console.log(message);
        
        const successElement = document.getElementById('auth-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    }
}

// 創建全域認證管理器實例
const authManager = new AuthManager();

// 頁面載入後初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待 Firebase 載入完成
    if (typeof firebase !== 'undefined') {
        authManager.initialize();
    } else {
        // 如果 Firebase 還沒載入，等待一下
        setTimeout(() => {
            if (typeof firebase !== 'undefined') {
                authManager.initialize();
            } else {
                console.error('Firebase 未正確載入');
            }
        }, 1000);
    }
});

// 導出給全域使用
window.authManager = authManager;