// 遊戲主控制器

class TamagotchiGame {
    constructor() {
        this.gameState = null;
        this.gameInterface = null;
        this.timeSystem = null;
        this.isInitialized = false;
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
            
            // 初始化遊戲狀態管理
            this.gameState = new GameState();
            
            // 初始化時間系統
            this.timeSystem = new TimeSystem();
            
            // 初始化使用者介面
            this.gameInterface = new GameInterface(this.gameState, this.timeSystem);
            
            // 設定狀態變更監聽
            this.setupStateListeners();
            
            // 設定鍵盤快捷鍵 (可選)
            this.setupKeyboardShortcuts();
            
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
            // 從暫停恢復
            this.timeSystem.resume();
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
    
    // 重置遊戲 (確認後執行)
    resetGame() {
        console.log('執行遊戲重置');
        
        // 清除本地存檔
        if (GAME_CONFIG.SAVE_KEY) {
            localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
        }
        
        // 重置遊戲狀態
        this.gameState.reset();
        
        console.log('遊戲已重置');
    }
    
    // 獲取遊戲狀態 (供外部使用)
    getGameState() {
        return this.gameState;
    }
    
    // 獲取遊戲介面 (供外部使用)
    getGameInterface() {
        return this.gameInterface;
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