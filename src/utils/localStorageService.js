// 本地儲存服務 - 管理遊戲資料持久化

class LocalStorageService {
    constructor() {
        this.saveKey = GAME_CONFIG.SAVE_KEY;
        this.gameData = null;
        this.autoSaveEnabled = true;
        this.listeners = [];
    }

    // 初始化服務，載入現有資料
    init() {
        this.loadGameData();
        console.log('LocalStorageService 初始化完成');
    }

    // 從 localStorage 載入遊戲資料
    loadGameData() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                this.gameData = JSON.parse(savedData);
                console.log('已載入遊戲存檔資料');
            } else {
                this.gameData = this.getDefaultGameData();
                console.log('建立新的遊戲資料');
            }
        } catch (error) {
            console.error('載入遊戲資料失敗:', error);
            this.gameData = this.getDefaultGameData();
        }
    }

    // 獲取預設遊戲資料結構
    getDefaultGameData() {
        return {
            // 電子雞基本資料
            tamagotchi: {
                name: '',
                level: 1,
                experience: 0,
                age: 0,
                hunger: TAMAGOTCHI_STATS.MAX_HUNGER,
                affection: TAMAGOTCHI_STATS.MAX_AFFECTION,
                health: TAMAGOTCHI_STATS.MAX_HEALTH,
                cleanliness: TAMAGOTCHI_STATS.MAX_CLEANLINESS,
                coins: TAMAGOTCHI_STATS.INITIAL_COINS,
                isAlive: true,
                isSleeping: false,

                // 進化系統
                evolutionStage: PET_EVOLUTION.STAGES.EGG,
                adultType: null, // 成年後的類型 (CHICKEN/PEACOCK/PHOENIX)
                birthTime: Date.now(), // 出生時間
                evolutionTime: 0, // 進化時間

                // 當前顯示的外型（用於測試按鈕）
                currentAppearance: PET_EVOLUTION.STAGES.EGG
            },
            
            // 時間系統資料
            time: {
                gameStartTime: 0,
                accumulatedGameTime: 0,
                lastUpdateTime: 0,
                lastSpeedChangeTime: 0,
                currentSpeed: GAME_CONFIG.DEFAULT_TIME_SPEED,
                isPaused: false,
                totalPausedDuration: 0
            },
            
            // 遊戲狀態
            gameState: {
                currentState: 'MENU',
                hasPlayedBefore: false
            },
            
            // 遊戲設定
            settings: {
                soundEnabled: true,
                animationEnabled: true,
                language: 'zh-TW'
            },
            
            // 統計資料
            statistics: {
                totalPlayTime: 0,
                feedCount: 0,
                playCount: 0,
                cleanCount: 0,
                medicineCount: 0,
                gamesPlayed: 0,
                maxLevel: 1
            },
            
            // 存檔元資料
            metadata: {
                version: '1.0.0',
                createdAt: Date.now(),
                lastSavedAt: Date.now()
            }
        };
    }

    // 保存遊戲資料到 localStorage
    saveGameData(data = null) {
        try {
            const dataToSave = data || this.gameData;
            if (!dataToSave) {
                console.warn('沒有資料可以保存');
                return false;
            }

            // 更新存檔時間
            dataToSave.metadata.lastSavedAt = Date.now();
            
            // 保存到 localStorage
            localStorage.setItem(this.saveKey, JSON.stringify(dataToSave));
            
            // 如果傳入了新資料，更新內存中的資料
            if (data) {
                this.gameData = { ...dataToSave };
            }
            
            // 通知監聽器
            this.notifyDataChanged();
            
            console.log('遊戲資料已保存');
            return true;
            
        } catch (error) {
            console.error('保存遊戲資料失敗:', error);
            return false;
        }
    }

    // 更新特定資料分類
    updateData(category, data) {
        if (!this.gameData || !this.gameData[category]) {
            console.error(`無效的資料分類: ${category}`);
            return false;
        }

        // 深度合併資料
        this.gameData[category] = { ...this.gameData[category], ...data };
        
        // 如果啟用自動保存，立即保存
        if (this.autoSaveEnabled) {
            this.saveGameData();
        }
        
        return true;
    }

    // 獲取特定分類的資料
    getData(category = null) {
        if (!this.gameData) {
            return null;
        }
        
        return category ? this.gameData[category] : this.gameData;
    }

    // 重置遊戲資料
    resetGameData() {
        this.gameData = this.getDefaultGameData();
        this.saveGameData();
        console.log('遊戲資料已重置');
    }

    // 清除所有儲存的資料
    clearAllData() {
        try {
            localStorage.removeItem(this.saveKey);
            this.gameData = null;
            this.notifyDataChanged();
            console.log('所有遊戲資料已清除');
            return true;
        } catch (error) {
            console.error('清除資料失敗:', error);
            return false;
        }
    }

    // 檢查是否有現有存檔
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // 獲取存檔大小 (KB)
    getSaveDataSize() {
        try {
            const data = localStorage.getItem(this.saveKey);
            return data ? (new Blob([data]).size / 1024).toFixed(2) : 0;
        } catch (error) {
            console.error('獲取存檔大小失敗:', error);
            return 0;
        }
    }

    // 設定自動保存開關
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        console.log(`自動保存已${enabled ? '啟用' : '停用'}`);
    }

    // 添加資料變更監聽器
    addDataListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    // 移除資料變更監聽器
    removeDataListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // 通知所有監聽器資料已變更
    notifyDataChanged() {
        this.listeners.forEach(callback => {
            try {
                callback(this.gameData);
            } catch (error) {
                console.error('資料監聽器執行失敗:', error);
            }
        });
    }

    // 匯出遊戲資料 (用於備份)
    exportGameData() {
        try {
            const dataStr = JSON.stringify(this.gameData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `tamagotchi_backup_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('遊戲資料已匯出');
            return true;
        } catch (error) {
            console.error('匯出資料失敗:', error);
            return false;
        }
    }

    // 匯入遊戲資料 (用於還原備份)
    importGameData(file) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                reject(new Error('無效的檔案格式'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // 基本驗證匯入的資料結構
                    if (!importedData.tamagotchi || !importedData.metadata) {
                        throw new Error('無效的遊戲資料格式');
                    }
                    
                    this.gameData = importedData;
                    this.saveGameData();
                    console.log('遊戲資料已匯入');
                    resolve(true);
                    
                } catch (error) {
                    console.error('匯入資料失敗:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('檔案讀取失敗'));
            };
            
            reader.readAsText(file);
        });
    }

    // 獲取儲存服務狀態
    getServiceStatus() {
        return {
            isInitialized: this.gameData !== null,
            hasData: this.hasSaveData(),
            autoSaveEnabled: this.autoSaveEnabled,
            dataSize: this.getSaveDataSize(),
            lastSaved: this.gameData?.metadata?.lastSavedAt,
            listenersCount: this.listeners.length
        };
    }
}