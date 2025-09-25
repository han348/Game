// 遊戲主控制器

class TamagotchiGame {
    constructor() {
        this.gameState = null;
        this.gameInterface = null;
        this.timeSystem = null;
        this.localStorageService = null;
        this.isInitialized = false;
        this.gameData = null;

        // 飽食度相關屬性
        this.currentHunger = null; // 稍後從 localStorage 載入或設為預設值
        this.lastHungerUpdate = 0;
        this.gameLoopInterval = null;

        // 金幣相關屬性
        this.currentCoins = null; // 稍後從 localStorage 載入或設為預設值

        // 生命值相關屬性
        this.currentLife = null; // 稍後從 localStorage 載入或設為預設值
        this.lastLifeUpdate = 0;
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

            // 所有初始化完成後，觸發UI初始渲染
            if (this.gameInterface) {
                this.gameInterface.updateUI(this.gameState.getCurrentState());
            }

            console.log('電子雞遊戲初始化完成');

        } catch (error) {
            console.error('遊戲初始化失敗:', error);
        }
    }
    
    // 設定狀態監聽器
    setupStateListeners() {
        this.gameState.addStateListener((oldState, newState) => {
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

        // 初始化飽食度 (從 localStorage 載入或設預設值)
        this.initializeHungerFromSave();

        // 初始化金幣 (從 localStorage 載入或設預設值)
        this.initializeCoinsFromSave();

        // 初始化生命值 (從 localStorage 載入或設預設值)
        this.initializeLifeFromSave();

        // 檢查是否需要初始化新的電子雞 (僅在首次遊戲時)
        if (!this.gameData.gameState.hasPlayedBefore) {
            this.initializeTamagotchi();
        }

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

    // 從儲存資料初始化飽食度
    initializeHungerFromSave() {
        if (this.currentHunger !== null) {
            // 已經初始化過了
            return;
        }

        // 嘗試從 localStorage 載入飽食度
        if (this.gameData && this.gameData.tamagotchi && this.gameData.tamagotchi.hunger !== undefined) {
            this.currentHunger = this.gameData.tamagotchi.hunger;
            console.log(`從儲存載入飽食度: ${this.currentHunger}`);
        } else {
            // 沒有儲存資料，使用預設值
            this.currentHunger = TAMAGOTCHI_STATS.MAX_HUNGER;
            console.log(`使用預設飽食度: ${this.currentHunger}`);
        }
    }

    // 從儲存資料初始化生命值
    initializeLifeFromSave() {
        if (this.currentLife !== null) {
            // 已經初始化過了
            return;
        }

        // 嘗試從 localStorage 載入生命值
        if (this.gameData && this.gameData.tamagotchi && this.gameData.tamagotchi.life !== undefined) {
            this.currentLife = this.gameData.tamagotchi.life;
            console.log(`從儲存載入生命值: ${this.currentLife}`);
        } else {
            // 沒有儲存資料，使用預設值
            this.currentLife = TAMAGOTCHI_STATS.MAX_LIFE;
            console.log(`使用預設生命值: ${this.currentLife}`);
        }
    }
    
    // 初始化電子雞狀態
    initializeTamagotchi() {
        console.log('初始化電子雞狀態');

        // 每次開始遊戲都重新初始化電子雞狀態
        const currentTime = Date.now();
        const freshTamagotchiData = {
            name: '',
            level: 1,
            experience: 0,
            age: 0,
            hunger: TAMAGOTCHI_STATS.MAX_HUNGER,
            affection: TAMAGOTCHI_STATS.MAX_AFFECTION,
            life: TAMAGOTCHI_STATS.MAX_LIFE,
            coins: TAMAGOTCHI_STATS.INITIAL_COINS,
            isAlive: true,
            isSleeping: false,

            // 進化系統 - 重新開始
            evolutionStage: PET_EVOLUTION.STAGES.EGG,
            adultType: null,
            birthTime: currentTime,
            lastEvolutionTime: currentTime,
            lastEvolutionGameTime: 0, // 遊戲時間從0開始

            // 當前顯示的外型
            currentAppearance: PET_EVOLUTION.STAGES.EGG
        };

        // 重置時間系統狀態
        const freshTimeData = {
            gameStartTime: 0, // 稍後會在 timeSystem.start() 中設定
            accumulatedGameTime: 0,
            lastUpdateTime: 0,
            lastSpeedChangeTime: 0,
            currentSpeed: GAME_CONFIG.DEFAULT_TIME_SPEED,
            isPaused: false,
            totalPausedDuration: 0
        };

        // 重置統計資料
        const freshStatistics = {
            totalPlayTime: 0,
            feedCount: 0,
            playCount: 0,
            medicineCount: 0,
            gamesPlayed: 0,
            maxLevel: 1
        };

        // 更新遊戲資料
        this.updateTamagotchiData(freshTamagotchiData);
        this.localStorageService.updateData('time', freshTimeData);
        this.updateStatistics(freshStatistics);

        // 立即同步保存到 localStorage
        this.syncAllGameData();

        // 重新載入資料到記憶體中
        this.gameData = this.localStorageService.getData();

        console.log('電子雞狀態已重新初始化並保存:', this.gameData.tamagotchi);
    }

    // 從儲存資料初始化金幣
    initializeCoinsFromSave() {
        if (this.currentCoins !== null) {
            // 已經初始化過了
            return;
        }

        // 嘗試從 localStorage 載入金幣
        if (this.gameData && this.gameData.tamagotchi && this.gameData.tamagotchi.coins !== undefined) {
            this.currentCoins = this.gameData.tamagotchi.coins;
            console.log(`從儲存載入金幣: ${this.currentCoins}`);
        } else {
            // 沒有儲存資料，使用預設值
            this.currentCoins = TAMAGOTCHI_STATS.INITIAL_COINS;
            console.log(`使用預設金幣: ${this.currentCoins}`);
        }
    }

    // 增加金幣
    addCoins(amount) {
        if (amount <= 0) {
            console.warn('金幣增加數量必須大於0');
            return false;
        }

        const oldCoins = this.currentCoins;
        this.currentCoins = Math.min(TAMAGOTCHI_STATS.MAX_COINS, this.currentCoins + amount);
        const actualIncrease = this.currentCoins - oldCoins;

        console.log(`金幣增加: ${oldCoins} → ${this.currentCoins} (+${actualIncrease})`);

        // 立即同步到 localStorage
        this.updateTamagotchiData({ coins: this.currentCoins });

        // 立即更新 UI
        this.updateCoinsDisplay();

        // 更新餵食按鈕狀態
        if (this.gameInterface && this.gameInterface.updateFeedButtonState) {
            this.gameInterface.updateFeedButtonState(this.currentCoins);
        }

        return {
            success: true,
            oldValue: oldCoins,
            newValue: this.currentCoins,
            increase: actualIncrease
        };
    }

    // 消費金幣
    spendCoins(amount) {
        if (amount <= 0) {
            console.warn('金幣消費數量必須大於0');
            return false;
        }

        if (this.currentCoins < amount) {
            console.warn(`金幣不足: 需要${amount}，目前${this.currentCoins}`);
            return false;
        }

        const oldCoins = this.currentCoins;
        this.currentCoins = Math.max(TAMAGOTCHI_STATS.MIN_COINS, this.currentCoins - amount);
        const actualDecrease = oldCoins - this.currentCoins;

        console.log(`金幣消費: ${oldCoins} → ${this.currentCoins} (-${actualDecrease})`);

        // 立即同步到 localStorage
        this.updateTamagotchiData({ coins: this.currentCoins });

        // 立即更新 UI
        this.updateCoinsDisplay();

        // 更新餵食按鈕狀態
        if (this.gameInterface && this.gameInterface.updateFeedButtonState) {
            this.gameInterface.updateFeedButtonState(this.currentCoins);
        }

        return {
            success: true,
            oldValue: oldCoins,
            newValue: this.currentCoins,
            decrease: actualDecrease
        };
    }

    // 更新金幣顯示
    updateCoinsDisplay() {
        if (this.gameInterface && this.gameInterface.updateCoinsDisplay) {
            this.gameInterface.updateCoinsDisplay(Math.floor(this.currentCoins));
        }
    }

    // 更新飽食度
    updateHunger() {
        if (this.timeSystem.isPaused) return;

        const currentTime = Date.now();
        if (this.lastHungerUpdate === 0) {
            this.lastHungerUpdate = currentTime;
            return;
        }

        const timeDiff = currentTime - this.lastHungerUpdate;
        const minutes = timeDiff / (1000 * 60);

        // 衰減 = 每分鐘2點 × 時間流速 × 經過分鐘
        const decay = TAMAGOTCHI_STATS.HUNGER_DECAY * this.timeSystem.timeSpeed * minutes;

        this.currentHunger = Math.max(0, this.currentHunger - decay);
        this.lastHungerUpdate = currentTime;

        console.log(`飽食度更新: ${Math.floor(this.currentHunger)} (衰減: ${decay.toFixed(2)})`);
    }

    // 更新生命值 (飽食度懲罰機制)
    updateLife() {
        if (this.timeSystem.isPaused) return;
        if (this.currentLife === null || this.currentHunger === null) return;

        const currentTime = Date.now();
        if (this.lastLifeUpdate === 0) {
            this.lastLifeUpdate = currentTime;
            return;
        }

        // 只有當飽食度低於閾值時才減少生命值
        if (this.currentHunger < TAMAGOTCHI_STATS.HUNGER_PENALTY_THRESHOLD) {
            const timeDiff = currentTime - this.lastLifeUpdate;
            const minutes = timeDiff / (1000 * 60);

            // 生命值懲罰 = 每分鐘1點 × 時間流速 × 經過分鐘
            const penalty = TAMAGOTCHI_STATS.LIFE_PENALTY_RATE * this.timeSystem.timeSpeed * minutes;

            const oldLife = this.currentLife;
            this.currentLife = Math.max(0, this.currentLife - penalty);

            if (penalty > 0) {
                console.log(`生命值懲罰: ${Math.floor(oldLife)} → ${Math.floor(this.currentLife)} (飽食度: ${Math.floor(this.currentHunger)} < ${TAMAGOTCHI_STATS.HUNGER_PENALTY_THRESHOLD})`);
            }
        }

        this.lastLifeUpdate = currentTime;
    }

    // 檢查死亡狀態
    checkDeath() {
        if (this.currentLife === null || this.currentHunger === null) return false;

        // 檢查生命值或飽食度是否為0
        if (this.currentLife <= 0 || this.currentHunger <= 0) {
            // 寵物死亡，直接將生命值歸零
            this.currentLife = 0;

            this.updateTamagotchiData({
                isAlive: false,
                life: 0,  // 死亡時生命值直接歸0
                hunger: Math.max(0, this.currentHunger)
            });

            const deathReason = this.currentLife <= 0 ? '生命值歸零' : '飽食度歸零';
            console.log(`寵物已死亡！原因：${deathReason}`);
            return true;
        }

        return false;
    }

    // 檢查進化條件
    checkEvolutionConditions() {
        if (!this.gameData || !this.gameData.tamagotchi || this.timeSystem.isPaused) {
            return false;
        }

        const tamagotchi = this.gameData.tamagotchi;
        const currentStage = tamagotchi.evolutionStage;

        // 計算自上次進化後的遊戲時間（以秒為單位）
        const currentGameTime = this.timeSystem.getGameTime();
        const timeSinceLastEvolutionSeconds = currentGameTime - (tamagotchi.lastEvolutionGameTime || 0);
        const timeSinceLastEvolutionMs = timeSinceLastEvolutionSeconds * 1000;

        // 檢查蛋 → 小雞的進化條件
        if (currentStage === PET_EVOLUTION.STAGES.EGG) {
            if (timeSinceLastEvolutionMs >= PET_EVOLUTION.EVOLUTION_CONDITIONS.EGG_TO_BABY.minTime) {
                console.log(`進化條件達成：蛋 → 小雞 (遊戲時間: ${Math.floor(timeSinceLastEvolutionSeconds / 60)}分鐘)`);
                this.evolveToNextStage(PET_EVOLUTION.STAGES.BABY);
                return true;
            }
        }
        // 檢查小雞 → 成年體的進化條件
        else if (currentStage === PET_EVOLUTION.STAGES.BABY) {
            if (timeSinceLastEvolutionMs >= PET_EVOLUTION.EVOLUTION_CONDITIONS.BABY_TO_ADULT.minTime) {
                console.log(`進化條件達成：小雞 → 成年體 (遊戲時間: ${Math.floor(timeSinceLastEvolutionSeconds / 60)}分鐘)`);
                const adultType = this.determineAdultType();
                this.evolveToNextStage(PET_EVOLUTION.STAGES.ADULT, adultType);
                return true;
            }
        }

        return false;
    }

    // 決定成年體類型 (根據機率)
    determineAdultType() {
        const random = Math.random();
        const rates = PET_EVOLUTION.ADULT_EVOLUTION_RATES;

        if (random < rates.PHOENIX) {
            // 0-10%: 鳳凰
            return PET_EVOLUTION.ADULT_TYPES.PHOENIX;
        } else if (random < rates.PHOENIX + rates.PEACOCK) {
            // 10-40%: 孔雀
            return PET_EVOLUTION.ADULT_TYPES.PEACOCK;
        } else {
            // 40-100%: 雞
            return PET_EVOLUTION.ADULT_TYPES.CHICKEN;
        }
    }

    // 執行進化到下一階段
    evolveToNextStage(newStage, adultType = null) {
        const currentGameTime = this.timeSystem.getGameTime();

        const evolutionUpdate = {
            evolutionStage: newStage,
            lastEvolutionTime: Date.now(), // 保留真實時間作為參考
            lastEvolutionGameTime: currentGameTime, // 新增遊戲時間記錄
            currentAppearance: adultType || newStage
        };

        // 如果是進化到成年體，設定成年體類型
        if (newStage === PET_EVOLUTION.STAGES.ADULT && adultType) {
            evolutionUpdate.adultType = adultType;
        }

        // 更新電子雞資料
        this.updateTamagotchiData(evolutionUpdate);

        // 重新載入遊戲資料
        this.gameData = this.localStorageService.getData();

        // 觸發進化事件
        this.onPetEvolved(newStage, adultType);

        console.log(`進化完成：${newStage}${adultType ? ` (${adultType})` : ''}`);
    }

    // 進化事件處理 (可以在這裡添加進化動畫、音效等)
    onPetEvolved(newStage, adultType = null) {
        // 更新 UI 顯示
        if (this.gameInterface && this.gameInterface.updateEvolutionDisplay) {
            this.gameInterface.updateEvolutionDisplay(newStage, adultType);
        }

        // 可以在這裡添加進化慶祝效果
        console.log(`🎉 進化成功！現在是 ${newStage}${adultType ? ` (${adultType})` : ''}`);
    }

    // 餵食功能
    feedPet() {
        // 檢查金幣是否足夠
        if (this.currentCoins < 1) {
            console.warn('金幣不足，無法餵食');
            return {
                success: false,
                reason: 'insufficient_coins',
                message: '金幣不足，無法餵食',
                currentCoins: this.currentCoins
            };
        }

        const feedAmount = 5; // 每次餵食增加5點
        const oldHunger = this.currentHunger;
        const oldCoins = this.currentCoins;

        // 增加飽食度，但不超過最大值
        this.currentHunger = Math.min(TAMAGOTCHI_STATS.MAX_HUNGER, this.currentHunger + feedAmount);

        // 扣除1枚金幣
        this.currentCoins = Math.max(TAMAGOTCHI_STATS.MIN_COINS, this.currentCoins - 1);

        const actualHungerIncrease = this.currentHunger - oldHunger;
        const coinsSpent = oldCoins - this.currentCoins;

        console.log(`餵食完成: 飽食度 ${Math.floor(oldHunger)} → ${Math.floor(this.currentHunger)} (+${actualHungerIncrease.toFixed(1)}), 金幣 ${oldCoins} → ${this.currentCoins} (-${coinsSpent})`);

        // 立即同步到 localStorage
        this.updateTamagotchiData({
            hunger: this.currentHunger,
            coins: this.currentCoins
        });

        // 立即更新 UI
        if (this.gameInterface && this.gameInterface.updateHungerDisplay) {
            this.gameInterface.updateHungerDisplay(Math.floor(this.currentHunger));
        }
        if (this.gameInterface && this.gameInterface.updateCoinsDisplay) {
            this.gameInterface.updateCoinsDisplay(Math.floor(this.currentCoins));
        }

        // 更新餵食按鈕狀態
        if (this.gameInterface && this.gameInterface.updateFeedButtonState) {
            this.gameInterface.updateFeedButtonState(this.currentCoins);
        }

        return {
            success: true,
            oldHungerValue: Math.floor(oldHunger),
            newHungerValue: Math.floor(this.currentHunger),
            hungerIncrease: actualHungerIncrease,
            oldCoinsValue: oldCoins,
            newCoinsValue: this.currentCoins,
            coinsSpent: coinsSpent
        };
    }

    // 開始遊戲循環
    startGameLoop() {
        // 初始化更新時間
        this.lastHungerUpdate = Date.now();
        this.lastLifeUpdate = Date.now();

        // 清除舊的定時器
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }

        // 設定定時器每秒更新
        this.gameLoopInterval = setInterval(() => {
            if (this.gameState.isState(GameState.STATES.PLAYING)) {
                // 更新飽食度
                this.updateHunger();

                // 更新生命值 (飽食度懲罰機制)
                this.updateLife();

                // 檢查死亡狀態
                const isDead = this.checkDeath();
                if (isDead) {
                    // 寵物死亡，通知UI更新死亡狀態
                    if (this.gameInterface && this.gameInterface.updateDeathStatus) {
                        this.gameInterface.updateDeathStatus();
                    }
                    console.log('遊戲循環：寵物已死亡');
                }

                // 檢查進化條件 (只有活著時才能進化)
                if (!isDead) {
                    this.checkEvolutionConditions();
                }

                // 同步到 localStorage
                this.updateTamagotchiData({
                    hunger: this.currentHunger,
                    life: this.currentLife,
                    coins: this.currentCoins
                });

                // 更新 UI 顯示
                if (this.gameInterface && this.gameInterface.updateHungerDisplay) {
                    this.gameInterface.updateHungerDisplay(Math.floor(this.currentHunger));
                }
                if (this.gameInterface && this.gameInterface.updateCoinsDisplay) {
                    this.gameInterface.updateCoinsDisplay(Math.floor(this.currentCoins));
                }
                if (this.gameInterface && this.gameInterface.updateLifeDisplay) {
                    this.gameInterface.updateLifeDisplay(Math.floor(this.currentLife));
                }
            }
        }, 1000); // 每秒更新

        console.log('遊戲循環已開始 - 飽食度追蹤啟動');
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
        this.gameState.addStateListener((oldState, newState) => {
            this.syncGameStateData(newState);
        });
        
        // 設定定時保存 (每30秒)
        this.autoSaveInterval = setInterval(() => {
            this.syncAllGameData();
        }, 30000);
        
        console.log('資料自動同步已設定');
    }
    
    // 同步遊戲狀態資料
    syncGameStateData(newState) {
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

        // 清除遊戲循環定時器
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }

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

        // 重置記憶體中的遊戲變數
        this.currentHunger = TAMAGOTCHI_STATS.MAX_HUNGER;
        this.currentLife = TAMAGOTCHI_STATS.MAX_LIFE;
        this.currentCoins = TAMAGOTCHI_STATS.INITIAL_COINS;
        this.lastHungerUpdate = 0;
        this.lastLifeUpdate = 0;

        // 重置時間系統
        this.timeSystem.reset();

        // 重置遊戲狀態
        this.gameState.reset();

        // 立即更新 UI 顯示
        if (this.gameInterface) {
            // 延遲更新 UI 以確保狀態變更完成
            setTimeout(() => {
                if (this.gameInterface.updateHungerDisplay) {
                    this.gameInterface.updateHungerDisplay(Math.floor(this.currentHunger));
                }
                if (this.gameInterface.updateCoinsDisplay) {
                    this.gameInterface.updateCoinsDisplay(Math.floor(this.currentCoins));
                }
                if (this.gameInterface.updateFeedButtonState) {
                    this.gameInterface.updateFeedButtonState(this.currentCoins);
                }
                // 觸發完整 UI 更新
                this.gameInterface.updateUI(this.gameState.getCurrentState());
            }, 0);
        }

        console.log(`遊戲已重置 - 金錢: ${this.currentCoins}, 飽食度: ${Math.floor(this.currentHunger)}, 生命值: ${Math.floor(this.currentLife)}`);
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

        // 清理遊戲循環定時器
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
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

// 測試金幣系統的輔助函數 (用於驗證功能)
function testCoinSystem() {
    const game = getGameInstance();
    if (!game) {
        console.error('遊戲實例不存在');
        return false;
    }

    console.log('=== 金幣系統測試開始 ===');

    // 測試初始金幣
    console.log(`當前金幣: ${game.currentCoins}`);

    // 測試增加金幣
    const addResult = game.addCoins(50);
    console.log('增加50金幣結果:', addResult);

    // 測試消費金幣
    const spendResult = game.spendCoins(25);
    console.log('消費25金幣結果:', spendResult);

    // 測試消費超額金幣
    const overspendResult = game.spendCoins(999999);
    console.log('嘗試消費過多金幣結果:', overspendResult);

    console.log(`測試後金幣: ${game.currentCoins}`);
    console.log('=== 金幣系統測試完成 ===');

    return true;
}

// 測試餵食成本系統的輔助函數
function testFeedingCost() {
    const game = getGameInstance();
    if (!game) {
        console.error('遊戲實例不存在');
        return false;
    }

    console.log('=== 餵食成本系統測試開始 ===');

    // 顯示初始狀態
    console.log(`初始狀態 - 金幣: ${game.currentCoins}, 飽食度: ${Math.floor(game.currentHunger)}`);

    // 測試正常餵食
    let feedResult = game.feedPet();
    console.log('第一次餵食結果:', feedResult);

    // 清空金幣來測試無法餵食
    game.currentCoins = 0;
    game.updateCoinsDisplay();
    console.log('金幣清空後嘗試餵食...');

    feedResult = game.feedPet();
    console.log('金幣不足時餵食結果:', feedResult);

    // 恢復一些金幣繼續測試
    game.addCoins(5);
    console.log('恢復5金幣後再次嘗試餵食...');

    feedResult = game.feedPet();
    console.log('恢復金幣後餵食結果:', feedResult);

    console.log(`最終狀態 - 金幣: ${game.currentCoins}, 飽食度: ${Math.floor(game.currentHunger)}`);
    console.log('=== 餵食成本系統測試完成 ===');

    return true;
}

// 測試進化系統的輔助函數
function testEvolutionSystem() {
    const game = getGameInstance();
    if (!game) {
        console.error('遊戲實例不存在');
        return false;
    }

    console.log('=== 進化系統測試開始 ===');

    // 顯示目前狀態
    const currentData = game.gameData.tamagotchi;
    console.log(`目前狀態:`, {
        進化階段: currentData.evolutionStage,
        成年體類型: currentData.adultType,
        出生時間: new Date(currentData.birthTime).toLocaleString(),
        上次進化時間: new Date(currentData.lastEvolutionTime).toLocaleString(),
        時間倍速: game.timeSystem.timeSpeed
    });

    // 計算進化倒數
    const currentGameTime = game.timeSystem.getGameTime();
    const timeSinceLastEvolutionSeconds = currentGameTime - (currentData.lastEvolutionGameTime || 0);
    const timeSinceLastEvolution = timeSinceLastEvolutionSeconds * 1000;

    if (currentData.evolutionStage === PET_EVOLUTION.STAGES.EGG) {
        const timeRemaining = PET_EVOLUTION.EVOLUTION_CONDITIONS.EGG_TO_BABY.minTime - timeSinceLastEvolution;
        console.log(`蛋 → 小雞進化倒數: ${Math.max(0, Math.floor(timeRemaining / 1000 / 60))}分${Math.max(0, Math.floor((timeRemaining / 1000) % 60))}秒`);
    } else if (currentData.evolutionStage === PET_EVOLUTION.STAGES.BABY) {
        const timeRemaining = PET_EVOLUTION.EVOLUTION_CONDITIONS.BABY_TO_ADULT.minTime - timeSinceLastEvolution;
        console.log(`小雞 → 成年體進化倒數: ${Math.max(0, Math.floor(timeRemaining / 1000 / 60))}分${Math.max(0, Math.floor((timeRemaining / 1000) % 60))}秒`);
    } else {
        console.log('已經是成年體，無法再進化');
    }

    // 手動觸發進化檢查
    console.log('手動觸發進化檢查...');
    const evolutionResult = game.checkEvolutionConditions();
    console.log('進化檢查結果:', evolutionResult);

    console.log('=== 進化系統測試完成 ===');
    return true;
}

// 強制進化測試 (僅用於開發測試)
function forceEvolution(targetStage = null) {
    const game = getGameInstance();
    if (!game) {
        console.error('遊戲實例不存在');
        return false;
    }

    console.log('=== 強制進化測試 ===');

    const currentData = game.gameData.tamagotchi;
    console.log(`目前階段: ${currentData.evolutionStage}`);

    if (!targetStage) {
        // 自動決定下一個階段
        if (currentData.evolutionStage === PET_EVOLUTION.STAGES.EGG) {
            targetStage = PET_EVOLUTION.STAGES.BABY;
        } else if (currentData.evolutionStage === PET_EVOLUTION.STAGES.BABY) {
            targetStage = PET_EVOLUTION.STAGES.ADULT;
        } else {
            console.log('已經是成年體，無法進化');
            return false;
        }
    }

    // 強制設定進化時間為已達成
    const forceEvolutionTime = Date.now() - (100 * 60 * 1000); // 100分鐘前
    const forceGameTime = game.timeSystem.getGameTime() - (100 * 60); // 遊戲時間100分鐘前
    game.updateTamagotchiData({
        lastEvolutionTime: forceEvolutionTime,
        lastEvolutionGameTime: forceGameTime
    });
    game.gameData = game.localStorageService.getData();

    console.log('強制設定進化時間為已達成，觸發進化檢查...');
    const result = game.checkEvolutionConditions();

    console.log('強制進化結果:', result);
    console.log('=== 強制進化測試完成 ===');

    return result;
}