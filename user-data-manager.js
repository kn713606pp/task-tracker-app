// 用戶數據管理模組
class UserDataManager {
    constructor() {
        this.db = null;
        this.currentUserId = null;
        this.isInitialized = false;
    }

    // 初始化用戶數據管理器
    async initialize() {
        try {
            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('用戶數據管理器初始化成功');
            
            // 監聽認證狀態變化
            if (window.authManager) {
                window.authManager.onAuthStateChanged((user) => {
                    this.currentUserId = user ? user.uid : null;
                    this.onUserChanged(user);
                });
            }
        } catch (error) {
            console.error('用戶數據管理器初始化失敗:', error);
            throw error;
        }
    }

    // 用戶狀態改變時的處理
    async onUserChanged(user) {
        if (user) {
            // 用戶登入，載入用戶數據
            await this.loadUserData(user.uid);
        } else {
            // 用戶登出，清除本地數據
            this.clearLocalData();
        }
    }

    // 獲取當前用戶 ID
    getCurrentUserId() {
        return this.currentUserId;
    }

    // 檢查是否有登入用戶
    hasLoggedInUser() {
        return this.currentUserId !== null;
    }

    // === 任務數據管理 ===
    
    // 保存任務到雲端
    async saveTasksToCloud(tasks, departmentName = 'default') {
        if (!this.hasLoggedInUser()) {
            throw new Error('用戶未登入，無法保存到雲端');
        }

        try {
            const userTasksRef = this.db.collection('users').doc(this.currentUserId)
                .collection('tasks').doc(departmentName);
                
            const taskData = {
                tasks: tasks,
                departmentName: departmentName,
                lastModified: firebase.firestore.FieldValue.serverTimestamp(),
                version: Date.now() // 用於衝突檢測
            };

            await userTasksRef.set(taskData, { merge: true });
            console.log(`任務數據已保存到雲端 (${departmentName})`);
            return true;
        } catch (error) {
            console.error('保存任務到雲端失敗:', error);
            throw error;
        }
    }

    // 從雲端載入任務
    async loadTasksFromCloud(departmentName = 'default') {
        if (!this.hasLoggedInUser()) {
            return null;
        }

        try {
            const userTasksRef = this.db.collection('users').doc(this.currentUserId)
                .collection('tasks').doc(departmentName);
                
            const doc = await userTasksRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log(`從雲端載入任務數據 (${departmentName})`);
                return data.tasks || [];
            }
            return null;
        } catch (error) {
            console.error('從雲端載入任務失敗:', error);
            throw error;
        }
    }

    // 同步所有部門的任務數據
    async syncAllTaskData() {
        if (!this.hasLoggedInUser()) return;

        try {
            const userTasksRef = this.db.collection('users').doc(this.currentUserId)
                .collection('tasks');
                
            const snapshot = await userTasksRef.get();
            const allDepartmentData = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                allDepartmentData[doc.id] = {
                    tasks: data.tasks || [],
                    lastModified: data.lastModified,
                    departmentName: data.departmentName || doc.id
                };
            });
            
            console.log('所有任務數據同步完成');
            return allDepartmentData;
        } catch (error) {
            console.error('同步任務數據失敗:', error);
            throw error;
        }
    }

    // === 麻將數據管理 ===
    
    // 保存麻將戰績到雲端
    async saveMahjongDataToCloud(sessions) {
        if (!this.hasLoggedInUser()) {
            throw new Error('用戶未登入，無法保存到雲端');
        }

        try {
            const userMahjongRef = this.db.collection('users').doc(this.currentUserId)
                .collection('mahjong').doc('sessions');
                
            const mahjongData = {
                sessions: sessions,
                lastModified: firebase.firestore.FieldValue.serverTimestamp(),
                version: Date.now()
            };

            await userMahjongRef.set(mahjongData, { merge: true });
            console.log('麻將戰績已保存到雲端');
            return true;
        } catch (error) {
            console.error('保存麻將戰績到雲端失敗:', error);
            throw error;
        }
    }

    // 從雲端載入麻將戰績
    async loadMahjongDataFromCloud() {
        if (!this.hasLoggedInUser()) {
            return null;
        }

        try {
            const userMahjongRef = this.db.collection('users').doc(this.currentUserId)
                .collection('mahjong').doc('sessions');
                
            const doc = await userMahjongRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('從雲端載入麻將戰績');
                return data.sessions || [];
            }
            return null;
        } catch (error) {
            console.error('從雲端載入麻將戰績失敗:', error);
            throw error;
        }
    }

    // === 用戶設定管理 ===
    
    // 保存用戶設定
    async saveUserSettings(settings) {
        if (!this.hasLoggedInUser()) {
            throw new Error('用戶未登入，無法保存設定');
        }

        try {
            const userSettingsRef = this.db.collection('users').doc(this.currentUserId)
                .collection('settings').doc('general');
                
            const settingsData = {
                ...settings,
                lastModified: firebase.firestore.FieldValue.serverTimestamp()
            };

            await userSettingsRef.set(settingsData, { merge: true });
            console.log('用戶設定已保存');
            return true;
        } catch (error) {
            console.error('保存用戶設定失敗:', error);
            throw error;
        }
    }

    // 載入用戶設定
    async loadUserSettings() {
        if (!this.hasLoggedInUser()) {
            return null;
        }

        try {
            const userSettingsRef = this.db.collection('users').doc(this.currentUserId)
                .collection('settings').doc('general');
                
            const doc = await userSettingsRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('用戶設定已載入');
                return data;
            }
            return null;
        } catch (error) {
            console.error('載入用戶設定失敗:', error);
            throw error;
        }
    }

    // === 數據備份與恢復 ===
    
    // 創建完整數據備份
    async createFullBackup() {
        if (!this.hasLoggedInUser()) {
            throw new Error('用戶未登入，無法創建備份');
        }

        try {
            const userRef = this.db.collection('users').doc(this.currentUserId);
            
            // 獲取所有子集合數據
            const [tasksSnapshot, mahjongSnapshot, settingsSnapshot] = await Promise.all([
                userRef.collection('tasks').get(),
                userRef.collection('mahjong').get(),
                userRef.collection('settings').get()
            ]);

            const backup = {
                userId: this.currentUserId,
                createdAt: new Date().toISOString(),
                version: '1.0',
                data: {
                    tasks: {},
                    mahjong: {},
                    settings: {}
                }
            };

            // 整理任務數據
            tasksSnapshot.forEach(doc => {
                backup.data.tasks[doc.id] = doc.data();
            });

            // 整理麻將數據
            mahjongSnapshot.forEach(doc => {
                backup.data.mahjong[doc.id] = doc.data();
            });

            // 整理設定數據
            settingsSnapshot.forEach(doc => {
                backup.data.settings[doc.id] = doc.data();
            });

            console.log('數據備份創建完成');
            return backup;
        } catch (error) {
            console.error('創建數據備份失敗:', error);
            throw error;
        }
    }

    // 從備份恢復數據
    async restoreFromBackup(backupData) {
        if (!this.hasLoggedInUser()) {
            throw new Error('用戶未登入，無法恢復數據');
        }

        try {
            const userRef = this.db.collection('users').doc(this.currentUserId);
            const batch = this.db.batch();

            // 恢復任務數據
            if (backupData.data.tasks) {
                Object.keys(backupData.data.tasks).forEach(taskId => {
                    const taskRef = userRef.collection('tasks').doc(taskId);
                    batch.set(taskRef, backupData.data.tasks[taskId]);
                });
            }

            // 恢復麻將數據
            if (backupData.data.mahjong) {
                Object.keys(backupData.data.mahjong).forEach(mahjongId => {
                    const mahjongRef = userRef.collection('mahjong').doc(mahjongId);
                    batch.set(mahjongRef, backupData.data.mahjong[mahjongId]);
                });
            }

            // 恢復設定數據
            if (backupData.data.settings) {
                Object.keys(backupData.data.settings).forEach(settingId => {
                    const settingRef = userRef.collection('settings').doc(settingId);
                    batch.set(settingRef, backupData.data.settings[settingId]);
                });
            }

            await batch.commit();
            console.log('數據恢復完成');
            return true;
        } catch (error) {
            console.error('數據恢復失敗:', error);
            throw error;
        }
    }

    // === 本地數據管理 ===
    
    // 載入用戶數據（合併本地和雲端）
    async loadUserData(userId) {
        try {
            console.log(`載入用戶數據: ${userId}`);
            
            // 這裡可以實現本地和雲端數據的同步邏輯
            // 例如：比較時間戳，選擇最新的數據
            
            return true;
        } catch (error) {
            console.error('載入用戶數據失敗:', error);
            throw error;
        }
    }

    // 清除本地數據
    clearLocalData() {
        try {
            // 這裡可以清除本地存儲的數據
            console.log('本地數據已清除');
        } catch (error) {
            console.error('清除本地數據失敗:', error);
        }
    }

    // === 工具方法 ===
    
    // 檢查網路連線狀態
    isOnline() {
        return navigator.onLine;
    }

    // 顯示數據操作狀態
    showDataStatus(message, isError = false) {
        console.log(`數據操作: ${message}`);
        
        // 可以在頁面上顯示狀態訊息
        const statusElement = document.getElementById('data-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = isError ? 'error' : 'success';
            
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = '';
            }, 3000);
        }
    }
}

// 創建全域用戶數據管理器實例
const userDataManager = new UserDataManager();

// 頁面載入後初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        userDataManager.initialize();
    } else {
        setTimeout(() => {
            if (typeof firebase !== 'undefined') {
                userDataManager.initialize();
            } else {
                console.error('Firebase 未正確載入，用戶數據管理器無法初始化');
            }
        }, 1000);
    }
});

// 導出給全域使用
window.userDataManager = userDataManager;