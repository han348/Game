// 遊戲主控制器

class TamagotchiGame {
    constructor() {
        this.gameState = null;
        this.gameInterface = null;
        this.timeSystem = null;
        this.localStorageService = null;
        this.isInitialized = false;
        this.gameData = null;
    }
    
    // 初始化遊戲
    init() {
        if (this.isInitialized) {
            console.warn('遊戲已經初始化');
            return;
        }
        
        try {
            // 檢查必要的 DOM 元素
            const canvas = document.getElementById('game-canvas');
            const uiContainer = document.getElementById('game-ui');
            
            if (!canvas || !uiContainer) {
                throw new Error('找不到必要的 DOM 元素');
            }
            
            // 初始化本地儲存服務
            this.localStorageService = new LocalStorageService();
            this.localStorageService.init();
            
            // 載入遊戲資料
            this.gameData = this.localStorageService.getData();
            
            // 初始化遊戲狀態管理
            this.gameState = new GameState();
            
            // 初始化時間系統
            this.timeSystem = new TimeSystem();
            
            // 從儲存的資料中恢復時間系統狀態
            this.restoreTimeSystemState();
            
            // 恢復遊戲狀態
            this.restoreGameState();
            
            // 初始化使用者介面
            this.gameInterface = new GameInterface(this.gameState, this.timeSystem);
            
            // 設定狀態變更監聽
            this.setupStateListeners();
            
            // 設定資料自動同步
            this.setupDataSync();
            
            // 設定鍵盤快捷鍵 (可選)
            this.setupKeyboardShortcuts();
            
            // 設定頁面關閉前保存
            this.setupBeforeUnload();
            
            this.isInitialized = true;
            console.log('電子雞遊戲初始化完成');
            
        } catch (error) {
            console.error('遊戲初始化失敗:', error);
        }
    }
    
    // 設定狀態監聽器
    setupStateListeners() {
        this.gameState.addStateListener((oldState, newState, data) => {
            console.log(`遊戲狀態變更: ${oldState} -> ${newState}`);
            
            // 根據狀態變更執行特定邏輯
            switch (newState) {
                case GameState.STATES.MENU:
                    this.handleMenuState();
                    break;
                case GameState.STATES.PLAYING:
                    this.handlePlayingState();
                    break;
                case GameState.STATES.PAUSED:
                    this.handlePausedState();
                    break;
                case GameState.STATES.CONFIRM_RESET:
                    this.handleConfirmResetState();
                    break;
            }
        });
    }
    
    // 處理選單狀態
    handleMenuState() {
        console.log('進入選單狀態');
        // 停止遊戲循環 (如果有的話)
        // 清除存檔資料 (如果是重置的話)
    }
    
    // 處理遊戲進行狀態
    handlePlayingState() {
        console.log('進入遊戲狀態');
        // 載入或建立新的電子雞
        // 開始時間系統和遊戲循環
        if (this.timeSystem.gameStartTime === 0) {
            // 首次開始遊戲
            this.timeSystem.start();
        } else {
            // 從暫停或頁面重整恢復
            if (this.timeSystem.isPaused) {
                this.timeSystem.resume();
            }
        }
        this.startGameLoop();
    }
    
    // 處理暫停狀態
    handlePausedState() {
        console.log('遊戲已暫停（時間已停止）');
        // UI 已經通過 gameInterface 處理時間暫停
    }
    
    // 處理重置確認狀態
    handleConfirmResetState() {
        console.log('顯示重置確認對話框（時間已暫停）');
        // UI 已經通過 gameInterface 處理，時間系統會自動暫停
    }
    
    // 開始遊戲循環 (基本版本)
    startGameLoop() {
        // 這裡之後會加入電子雞狀態更新邏輯
        console.log('遊戲循環已開始');
    }
    
    // 設定鍵盤快捷鍵
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // ESC 鍵處理
            if (event.key === 'Escape') {
                if (this.gameState.isState(GameState.STATES.CONFIRM_RESET)) {
                    // 在確認對話框中，ESC 取消重置
                    this.gameState.changeState(GameState.STATES.PLAYING);
                } else if (this.gameState.isState(GameState.STATES.PAUSED)) {
                    // 在暫停中，ESC 繼續遊戲
                    this.gameState.changeState(GameState.STATES.PLAYING);
                } else if (this.gameState.isState(GameState.STATES.PLAYING)) {
                    // 在遊戲中，ESC 暫停遊戲
                    this.gameState.changeState(GameState.STATES.PAUSED);
                }
            }
            
            // Enter 鍵處理
            if (event.key === 'Enter') {
                if (this.gameState.isState(GameState.STATES.MENU)) {
                    // 在選單中，Enter 開始遊戲
                    this.gameState.changeState(GameState.STATES.PLAYING);
                } else if (this.gameState.isState(GameState.STATES.PAUSED)) {
                    // 在暫停中，Enter 繼續遊戲
                    this.gameState.changeState(GameState.STATES.PLAYING);
                }
            }
            
            // 空白鍵處理（常見的暫停快捷鍵）
            if (event.code === 'Space') {
                event.preventDefault(); // 防止頁面滾動
                if (this.gameState.isState(GameState.STATES.PLAYING)) {
                    // 在遊戲中，空白鍵暫停
                    this.gameState.changeState(GameState.STATES.PAUSED);
                } else if (this.gameState.isState(GameState.STATES.PAUSED)) {
                    // 在暫停中，空白鍵繼續
                    this.gameState.changeState(GameState.STATES.PLAYING);
                }
            }
        });
    }
    
    // 設定頁面關閉前保存
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            // 最終保存所有資料
            this.syncAllGameData();
        });
        
        // 處理頁面可見性變更 (切換標籤頁等)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 頁面隱藏時保存資料
                this.syncAllGameData();
            } else {
                // 頁面顯示時恢復 (如果需要)
                if (this.gameState.isState('PLAYING') && this.timeSystem.isPaused) {
                    // 如果遊戲應該在進行中但時間被暫停，恢復時間
                    this.timeSystem.resume();
                }
            }
        });
    }
    
    // 從儲存資料恢復時間系統狀態
    restoreTimeSystemState() {
        if (!this.gameData || !this.gameData.time) {
            return;
        }
        
        const timeData = this.gameData.time;
        
        // 恢復時間系統的狀態
        if (timeData.gameStartTime > 0) {
            const now = Date.now();
            this.timeSystem.gameStartTime = timeData.gameStartTime;
            this.timeSystem.accumulatedGameTime = timeData.accumulatedGameTime || 0;
            this.timeSystem.timeSpeed = timeData.currentSpeed || GAME_CONFIG.DEFAULT_TIME_SPEED;
            this.timeSystem.lastUpdateTime = now;
            this.timeSystem.lastSpeedChangeTime = now;
            this.timeSystem.totalPausedDuration = timeData.totalPausedDuration || 0;
            
            // 如果遊戲之前是在遊玩狀態且不是暫停，恢復時間系統
            if (this.gameData.gameState.currentState === 'PLAYING' && !timeData.isPaused) {
                this.timeSystem.isPaused = false;
            } else {
                this.timeSystem.isPaused = true;
            }
            
            console.log('時間系統狀態已恢復，累積遊戲時間:', this.timeSystem.accumulatedGameTime);
        }
    }
    
    // 恢復遊戲狀態
    restoreGameState() {
        if (!this.gameData || !this.gameData.gameState) {
            return;
        }
        
        const gameStateData = this.gameData.gameState;
        
        // 如果之前有遊戲進度，恢復到相應狀態
        if (gameStateData.hasPlayedBefore && gameStateData.currentState) {
            // 對於確認重置狀態，重整後應該回到遊戲狀態而不是保持彈窗
            if (gameStateData.currentState === 'CONFIRM_RESET') {
                // 重整後取消確認彈窗，回到遊戲狀態
                this.gameState.currentState = 'PLAYING';
                console.log('重整後取消重置確認，恢復到遊戲狀態');
                
                // 延遲啟動，讓其他初始化完成
                setTimeout(() => {
                    this.handlePlayingState();
                }, 100);
            } else {
                // 其他狀態正常恢復
                this.gameState.currentState = gameStateData.currentState;
                console.log('遊戲狀態已恢復:', gameStateData.currentState);
                
                // 如果是遊戲中狀態，需要啟動遊戲循環
                if (gameStateData.currentState === 'PLAYING') {
                    // 延遲啟動，讓其他初始化完成
                    setTimeout(() => {
                        this.handlePlayingState();
                    }, 100);
                }
            }
        }
    }
    
    // 設定資料自動同步
    setupDataSync() {
        // 監聽遊戲狀態變更並自動保存
        this.gameState.addStateListener((oldState, newState, data) => {
            this.syncGameStateData(newState, data);
        });
        
        // 設定定時保存 (每30秒)
        this.autoSaveInterval = setInterval(() => {
            this.syncAllGameData();
        }, 30000);
        
        console.log('資料自動同步已設定');
    }
    
    // 同步遊戲狀態資料
    syncGameStateData(newState, data = null) {
        if (!this.localStorageService) return;
        
        const gameStateData = {
            currentState: newState,
            hasPlayedBefore: newState === 'PLAYING' || this.gameData.gameState.hasPlayedBefore,
            lastStateChange: Date.now()
        };
        
        this.localStorageService.updateData('gameState', gameStateData);
    }
    
    // 同步時間系統資料
    syncTimeSystemData() {
        if (!this.localStorageService || !this.timeSystem) return;
        
        // 在同步前更新累積時間
        if (!this.timeSystem.isPaused && this.timeSystem.gameStartTime > 0) {
            this.timeSystem.updateAccumulatedTime();
        }
        
        const timeData = {
            gameStartTime: this.timeSystem.gameStartTime,
            accumulatedGameTime: this.timeSystem.accumulatedGameTime,
            lastUpdateTime: this.timeSystem.lastUpdateTime,
            lastSpeedChangeTime: this.timeSystem.lastSpeedChangeTime,
            currentSpeed: this.timeSystem.timeSpeed,
            isPaused: this.timeSystem.isPaused,
            totalPausedDuration: this.timeSystem.totalPausedDuration
        };
        
        this.localStorageService.updateData('time', timeData);
    }
    
    // 同步所有遊戲資料
    syncAllGameData() {
        if (!this.localStorageService) return;
        
        // 同步時間系統資料
        this.syncTimeSystemData();
        
        // 更新統計資料
        const currentTime = Date.now();
        const statisticsUpdate = {
            totalPlayTime: this.gameData.statistics.totalPlayTime + (currentTime - (this.gameData.metadata.lastSavedAt || currentTime))
        };
        
        this.localStorageService.updateData('statistics', statisticsUpdate);
        
        console.log('遊戲資料已自動同步');
    }
    
    // 重置遊戲 (確認後執行)
    resetGame() {
        console.log('執行遊戲重置');
        
        // 使用 LocalStorageService 重置資料
        if (this.localStorageService) {
            this.localStorageService.resetGameData();
            this.gameData = this.localStorageService.getData();
        } else {
            // 備用方案：直接清除 localStorage
            if (GAME_CONFIG.SAVE_KEY) {
                localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
            }
        }
        
        // 重置時間系統
        this.timeSystem.reset();
        
        // 重置遊戲狀態
        this.gameState.reset();
        
        console.log('遊戲已重置');
    }
    
    // 更新電子雞資料
    updateTamagotchiData(updates) {
        if (!this.localStorageService) return false;
        
        return this.localStorageService.updateData('tamagotchi', updates);
    }
    
    // 更新統計資料
    updateStatistics(updates) {
        if (!this.localStorageService) return false;
        
        return this.localStorageService.updateData('statistics', updates);
    }
    
    // 獲取儲存服務
    getStorageService() {
        return this.localStorageService;
    }
    
    // 獲取遊戲狀態 (供外部使用)
    getGameState() {
        return this.gameState;
    }
    
    // 獲取遊戲介面 (供外部使用)
    getGameInterface() {
        return this.gameInterface;
    }
    
    // 清理遊戲資源
    cleanup() {
        // 清理自動保存定時器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // 最後一次保存資料
        if (this.localStorageService) {
            this.syncAllGameData();
        }
        
        console.log('遊戲資源已清理');
    }
}

// 全域遊戲實例
let gameInstance = null;

// DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new TamagotchiGame();
    gameInstance.init();
});

// 供外部存取遊戲實例
function getGameInstance() {
    return gameInstance;
}