// 使用者介面管理系統

class GameInterface {
    constructor(gameState, timeSystem) {
        this.gameState = gameState;
        this.timeSystem = timeSystem;
        this.uiContainer = document.getElementById('game-ui');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplayInterval = null;

        // 寵物輪播系統
        this.petCarousel = {
            currentPetIndex: 0,
            pets: [
                { type: PET_EVOLUTION.STAGES.EGG, name: '神秘的蛋' },
                { type: PET_EVOLUTION.STAGES.BABY, name: '可愛小雞' },
                { type: PET_EVOLUTION.ADULT_TYPES.CHICKEN, name: '溫和雞' },
                { type: PET_EVOLUTION.ADULT_TYPES.PEACOCK, name: '華麗孔雀' },
                { type: PET_EVOLUTION.ADULT_TYPES.PHOENIX, name: '傳說鳳凰' }
            ],
            isAnimating: false,
            animationTimer: null,
            changeInterval: null,
            transitionDuration: 1000, // 1秒過渡時間
            displayDuration: 3000 // 每個寵物顯示3秒
        };

        // 綁定狀態變更監聽
        this.gameState.addStateListener((oldState, newState) => {
            // 延遲UI更新，確保遊戲邏輯先初始化 (特別是飽食度載入)
            setTimeout(() => {
                this.updateUI(newState);
            }, 0);
        });

        // 移除立即UI渲染，改為由TamagotchiGame.init()完成後觸發
    }
    
    // 根據遊戲狀態更新 UI
    updateUI(state) {
        switch (state) {
            case GameState.STATES.MENU:
                this.clearUI();
                this.clearCanvas();
                this.stopTimeDisplayUpdate();
                this.renderMenuScreen();
                break;
            case GameState.STATES.PLAYING:
                this.stopPetCarousel(); // 停止輪播
                this.clearUI();
                this.clearCanvas();
                this.renderGameScreen();
                this.startTimeDisplayUpdate();
                break;
            case GameState.STATES.PAUSED:
                this.stopPetCarousel(); // 停止輪播
                // 確保有遊戲背景，然後添加暫停對話框
                this.ensureGameBackground();
                this.renderPauseDialog();
                break;
            case GameState.STATES.CONFIRM_RESET:
                this.stopPetCarousel(); // 停止輪播
                // 確保有遊戲背景，然後添加重置確認對話框
                this.ensureGameBackground();
                this.renderConfirmDialog();
                break;
        }
    }
    
    // 清除 UI 容器
    clearUI() {
        this.uiContainer.innerHTML = '';
    }
    
    // 清除 Canvas
    clearCanvas() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 確保有遊戲背景（用於彈窗狀態）
    ensureGameBackground() {
        // 如果 UI 容器是空的，說明沒有遊戲背景，需要重新渲染
        if (this.uiContainer.children.length === 0) {
            this.renderGameScreen();
        }
    }
    
    // 渲染待機畫面
    renderMenuScreen() {
        // Canvas 上的標題
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('電子雞遊戲', this.canvas.width / 2, 80);

        this.ctx.font = '12px monospace';
        this.ctx.fillText('Tamagotchi Game', this.canvas.width / 2, 100);

        // 顯示當前輪播寵物和名稱
        this.drawCarouselPet();

        // 啟動寵物輪播
        this.startPetCarousel();

        // UI 按鈕
        const startButton = this.createButton('開始遊戲', () => {
            this.stopPetCarousel(); // 停止輪播
            this.gameState.changeState(GameState.STATES.PLAYING);
        });

        startButton.className = 'game-button';
        startButton.style.fontSize = '16px';
        startButton.style.padding = '12px 24px';

        this.uiContainer.appendChild(startButton);

        // 版本資訊
        const versionInfo = document.createElement('div');
        versionInfo.textContent = 'v1.0.0';
        versionInfo.style.marginTop = '20px';
        versionInfo.style.fontSize = '10px';
        versionInfo.style.color = '#666';
        this.uiContainer.appendChild(versionInfo);
    }
    
    // 渲染遊戲畫面
    renderGameScreen() {
        // Canvas 上顯示遊戲區域
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(10, 10, this.canvas.width - 20, this.canvas.height - 60);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('遊戲進行中...', this.canvas.width / 2, 30);
        
        // 顯示遊戲時間和時間狀態
        if (this.timeSystem) {
            const timeInfo = this.timeSystem.getTimeInfo();
            this.ctx.font = '10px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = timeInfo.isPaused ? '#ff6666' : '#66ff66';
            this.ctx.fillText(`時間: ${timeInfo.formattedTime}`, 15, 50);
            this.ctx.fillText(`流速: ${timeInfo.timeSpeed}x`, 15, 65);
            if (timeInfo.isPaused) {
                this.ctx.fillStyle = '#ff4444';
                this.ctx.fillText('⏸ 已暫停', 15, 80);
            }
        }
        
        // 顯示電子雞（根據當前外型和進化階段）
        this.drawCurrentPetWithEvolution();

        // 狀態列
        this.renderStatusBar();

        // 控制按鈕
        this.renderControlButtons();
    }
    
    // 實作重置確認彈窗的 UI
    renderConfirmDialog() {
        // 創建半透明背景遮罩
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        // 創建確認對話框
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        // 對話框標題
        const title = document.createElement('h3');
        title.textContent = '⚠️ 重置遊戲';
        dialog.appendChild(title);
        
        // 警告訊息
        const message = document.createElement('p');
        message.innerHTML = '確定要重置遊戲嗎？<br><br>這將會：<br>• 刪除所有進度<br>• 重置電子雞狀態<br>• 無法復原';
        dialog.appendChild(message);
        
        // 按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'confirm-buttons';
        
        // 取消按鈕
        const cancelButton = document.createElement('button');
        cancelButton.className = 'confirm-button safe';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', () => {
            // 恢復遊戲時間並回到遊戲狀態
            this.resumeGameTime();
            this.gameState.changeState(GameState.STATES.PLAYING);
        });
        
        // 確認重置按鈕
        const confirmButton = document.createElement('button');
        confirmButton.className = 'confirm-button danger';
        confirmButton.textContent = '確認重置';
        confirmButton.addEventListener('click', () => {
            // 執行重置並回到選單
            this.performReset();
            this.gameState.changeState(GameState.STATES.MENU);
        });
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        this.uiContainer.appendChild(overlay);
        
        // 暫停遊戲時間
        this.pauseGameTime();
        
        // 點擊遮罩外部取消（可選功能）
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                // 恢復遊戲時間並回到遊戲狀態
                this.resumeGameTime();
                this.gameState.changeState(GameState.STATES.PLAYING);
            }
        });
        
        // 聚焦到取消按鈕（更安全的預設選項）
        setTimeout(() => cancelButton.focus(), 100);
    }
    
    // 實作暫停彈窗的 UI
    renderPauseDialog() {
        // 創建半透明背景遮罩
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        // 創建暫停對話框
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        // 對話框標題
        const title = document.createElement('h3');
        title.textContent = '⏸️ 遊戲暫停';
        title.style.color = '#aa8844'; // 使用暫停按鈕的顏色
        dialog.appendChild(title);
        
        // 暫停訊息
        const message = document.createElement('p');
        message.innerHTML = '遊戲已暫停<br><br>時間已停止流動<br>準備好時可以繼續遊戲';
        dialog.appendChild(message);
        
        // 按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'confirm-buttons';
        buttonContainer.style.justifyContent = 'center'; // 只有一個按鈕，置中顯示
        
        // 繼續遊戲按鈕
        const continueButton = document.createElement('button');
        continueButton.className = 'confirm-button safe';
        continueButton.textContent = '繼續遊戲';
        continueButton.addEventListener('click', () => {
            // 恢復遊戲時間並回到遊戲狀態
            this.resumeGameTime();
            this.gameState.changeState(GameState.STATES.PLAYING);
        });
        
        buttonContainer.appendChild(continueButton);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        this.uiContainer.appendChild(overlay);
        
        // 暫停遊戲時間
        this.pauseGameTime();
        
        // 點擊遮罩外部也繼續遊戲
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                // 恢復遊戲時間並回到遊戲狀態
                this.resumeGameTime();
                this.gameState.changeState(GameState.STATES.PLAYING);
            }
        });
        
        // 聚焦到繼續按鈕
        setTimeout(() => continueButton.focus(), 100);
    }
    
    // 渲染狀態列
    renderStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.className = 'status-bar';

        // 動態狀態顯示
        const currentHunger = this.getCurrentHunger();
        const currentCoins = this.getCurrentCoins();
        const stats = [
            `金幣: ${currentCoins}`,
            `飽食度: ${currentHunger}`,
            '好感度: 90',
            '生命值: 85'
        ];

        stats.forEach((stat, index) => {
            const statusItem = document.createElement('div');
            statusItem.className = 'status-item';

            // 為金幣添加特殊樣式
            if (index === 0) { // 金幣是第一個項目
                statusItem.innerHTML = `<span class="status-value" style="color: #FFD700; font-weight: bold;">${stat}</span>`;
            } else {
                statusItem.innerHTML = `<span class="status-value">${stat}</span>`;
            }

            statusBar.appendChild(statusItem);
        });

        this.uiContainer.appendChild(statusBar);
    }
    
    // 渲染控制按鈕
    renderControlButtons() {
        // 第一排：照顧按鈕
        const actionContainer = document.createElement('div');
        actionContainer.style.marginTop = '10px';
        
        // 照顧按鈕
        const feedButton = this.createFeedButton();
        
        const playButton = this.createButton('遊戲', () => {
            console.log('遊戲');
        });
        
        
        // 寵物圖鑑按鈕
        const encyclopediaButton = this.createButton('寵物圖鑑', () => {
            this.showPetEncyclopedia();
        });
        encyclopediaButton.style.backgroundColor = '#6644aa';
        
        // 儲存餵食按鈕引用供後續更新使用
        this.feedButton = feedButton;

        [feedButton, playButton, encyclopediaButton].forEach(button => {
            actionContainer.appendChild(button);
        });
        
        // 第二排：時間控制和重置
        const controlContainer = document.createElement('div');
        controlContainer.style.marginTop = '10px';
        controlContainer.style.display = 'flex';
        controlContainer.style.justifyContent = 'space-between';
        controlContainer.style.alignItems = 'center';
        
        // 時間流速控制區域
        const timeSpeedContainer = document.createElement('div');
        timeSpeedContainer.style.display = 'flex';
        timeSpeedContainer.style.alignItems = 'center';
        timeSpeedContainer.style.gap = '8px';
        
        const timeSpeedLabel = document.createElement('span');
        timeSpeedLabel.textContent = '時間流速:';
        timeSpeedLabel.style.fontSize = '11px';
        timeSpeedLabel.style.color = '#ccc';
        
        const timeSpeedSelect = this.createTimeSpeedSelect();
        
        timeSpeedContainer.appendChild(timeSpeedLabel);
        timeSpeedContainer.appendChild(timeSpeedSelect);
        
        // 按鈕容器（暫停和重置）
        const buttonGroup = document.createElement('div');
        buttonGroup.style.display = 'flex';
        buttonGroup.style.gap = '8px';
        
        // 暫停按鈕
        const pauseButton = this.createButton('暫停', () => {
            this.gameState.changeState(GameState.STATES.PAUSED);
        });
        pauseButton.style.backgroundColor = '#aa8844';
        
        // 重置按鈕
        const resetButton = this.createButton('重置', () => {
            this.gameState.changeState(GameState.STATES.CONFIRM_RESET);
        });
        resetButton.style.backgroundColor = '#aa4444';
        
        buttonGroup.appendChild(pauseButton);
        buttonGroup.appendChild(resetButton);
        
        controlContainer.appendChild(timeSpeedContainer);
        controlContainer.appendChild(buttonGroup);
        
        this.uiContainer.appendChild(actionContainer);
        this.uiContainer.appendChild(controlContainer);
    }
    
    // 建立按鈕元素
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'game-button';
        button.addEventListener('click', onClick);
        return button;
    }

    // 建立餵食按鈕（帶金幣檢查）
    createFeedButton() {
        const gameInstance = getGameInstance();
        const currentCoins = gameInstance ? gameInstance.currentCoins || 0 : 0;

        const button = document.createElement('button');
        button.className = 'game-button';

        // 設定按鈕文字和狀態
        this.updateFeedButtonAppearance(button, currentCoins);

        button.addEventListener('click', () => {
            const gameInstance = getGameInstance();
            if (gameInstance && gameInstance.feedPet) {
                const result = gameInstance.feedPet();
                console.log('餵食結果:', result);

                // 如果餵食失敗且是因為金幣不足，顯示提示
                if (!result.success && result.reason === 'insufficient_coins') {
                    // 可以在這裡添加視覺提示，例如按鈕閃爍等
                    console.warn(result.message);
                }
            } else {
                console.log('遊戲實例未找到');
            }
        });

        return button;
    }

    // 更新餵食按鈕外觀
    updateFeedButtonAppearance(button, coins) {
        if (coins >= 1) {
            button.textContent = '餵食 (1💰)';
            button.disabled = false;
            button.style.backgroundColor = '#4CAF50'; // 綠色表示可用
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        } else {
            button.textContent = '餵食 (無金幣)';
            button.disabled = true;
            button.style.backgroundColor = '#666666'; // 灰色表示禁用
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        }
    }

    // 更新餵食按鈕狀態（供遊戲實例調用）
    updateFeedButtonState(coins) {
        if (this.feedButton) {
            this.updateFeedButtonAppearance(this.feedButton, coins);
        }
    }
    
    // 建立時間流速選擇器
    createTimeSpeedSelect() {
        const select = document.createElement('select');
        select.className = 'time-speed-select';
        
        // 時間流速選項
        const speedOptions = [1, 2, 4, 8, 16, 300];
        
        speedOptions.forEach(speed => {
            const option = document.createElement('option');
            option.value = speed;
            option.textContent = `${speed}x`;
            
            // 設定當前選項
            const currentSpeed = this.timeSystem ? this.timeSystem.getTimeSpeed() : GAME_CONFIG.DEFAULT_TIME_SPEED;
            if (speed === currentSpeed) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });
        
        // 監聽變更事件
        select.addEventListener('change', (event) => {
            const newSpeed = parseFloat(event.target.value);
            this.handleTimeSpeedChange(newSpeed);
        });
        
        return select;
    }
    
    // 處理時間流速變更
    handleTimeSpeedChange(newSpeed) {
        if (this.timeSystem) {
            this.timeSystem.setTimeSpeed(newSpeed);
            console.log(`時間流速已變更為: ${newSpeed}x`);

            // 更新畫面顯示
            this.updateTimeDisplay();

            // 同步時間系統狀態到 localStorage
            const gameInstance = getGameInstance();
            if (gameInstance && gameInstance.syncTimeSystemData) {
                gameInstance.syncTimeSystemData();
            }
        }
    }
    
    // 更新時間顯示（重新渲染遊戲畫面的時間部分）
    updateTimeDisplay() {
        if (this.gameState.isState(GameState.STATES.PLAYING) && this.timeSystem) {
            // 只更新時間顯示區域，不重新渲染整個畫面
            this.renderTimeInfo();
        }
    }
    
    // 渲染時間資訊到 Canvas
    renderTimeInfo() {
        if (!this.timeSystem) return;
        
        const timeInfo = this.timeSystem.getTimeInfo();
        
        // 清除舊的時間顯示區域
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(10, 40, 150, 50);
        
        // 重新繪製時間資訊
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = timeInfo.isPaused ? '#ff6666' : '#66ff66';
        this.ctx.fillText(`時間: ${timeInfo.formattedTime}`, 15, 50);
        this.ctx.fillText(`流速: ${timeInfo.timeSpeed}x`, 15, 65);
        if (timeInfo.isPaused) {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillText('⏸ 已暫停', 15, 80);
        }
    }
    
    // 根據當前外型繪製寵物
    drawCurrentPet(x, y) {
        // 先清除寵物區域（包含可能的尾羽等延伸部分）
        this.clearPetArea(x - 15, y - 15, 70, 50);
        
        // 從遊戲實例獲取當前外型
        const gameInstance = getGameInstance();
        if (!gameInstance || !gameInstance.gameData) {
            // 如果沒有遊戲資料，顯示預設蛋形態
            this.drawEgg(x, y);
            return;
        }
        
        const currentAppearance = gameInstance.gameData.tamagotchi.currentAppearance;
        
        switch (currentAppearance) {
            case PET_EVOLUTION.STAGES.EGG:
                this.drawEgg(x, y);
                break;
            case PET_EVOLUTION.STAGES.BABY:
                this.drawBaby(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.CHICKEN:
                this.drawChicken(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PEACOCK:
                this.drawPeacock(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PHOENIX:
                this.drawPhoenix(x, y);
                break;
            default:
                this.drawEgg(x, y);
        }
    }
    
    // 清除寵物區域
    clearPetArea(x, y, width, height) {
        if (this.gameState.isState(GameState.STATES.PLAYING)) {
            // 遊戲中背景是灰色
            this.ctx.fillStyle = '#333333';
        } else {
            // 選單中背景是黑色
            this.ctx.fillStyle = '#000000';
        }
        this.ctx.fillRect(x, y, width, height);
    }
    
    // 繪製蛋形態
    drawEgg(x, y) {
        const size = 3;
        this.ctx.fillStyle = '#f0f0f0'; // 白色蛋殼
        
        const pattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0]
        ];
        
        this.drawPixelPattern(x, y, pattern, size, '#f0f0f0');
        
        // 蛋殼花紋
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(x + 6, y + 9, 6, 3);
        this.ctx.fillRect(x + 18, y + 15, 9, 3);
    }
    
    // 繪製幼年體（小雞）
    drawBaby(x, y) {
        const size = 3;
        
        // 身體
        const bodyPattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,0,0,1,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        
        this.drawPixelPattern(x, y, bodyPattern, size, '#ffdd00');
        
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6, y + 6, 3, 3);
        this.ctx.fillRect(x + 15, y + 6, 3, 3);
        
        // 嘴巴
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(x + 9, y + 12, 6, 3);
    }
    
    // 繪製成年雞
    drawChicken(x, y) {
        const size = 3;
        
        // 身體
        const bodyPattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,0,0,1,1,0],
            [0,0,1,0,0,1,0,0]
        ];
        
        this.drawPixelPattern(x, y, bodyPattern, size, '#ffffff');
        
        // 雞冠
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 6, y - 3, 3, 6);
        this.ctx.fillRect(x + 12, y - 6, 3, 9);
        this.ctx.fillRect(x + 18, y - 3, 3, 6);
        
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6, y + 6, 3, 3);
        this.ctx.fillRect(x + 15, y + 6, 3, 3);
        
        // 嘴巴
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(x + 9, y + 12, 6, 3);
    }
    
    // 繪製孔雀
    drawPeacock(x, y) {
        const size = 3;
        
        // 身體
        const bodyPattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,0,0,1,1,0],
            [0,0,1,0,0,1,0,0]
        ];
        
        this.drawPixelPattern(x, y, bodyPattern, size, '#0080ff');
        
        // 孔雀尾羽（背景）
        this.ctx.fillStyle = '#00ff80';
        this.ctx.fillRect(x - 9, y - 6, 3, 6);
        this.ctx.fillRect(x - 6, y - 9, 3, 9);
        this.ctx.fillRect(x - 3, y - 6, 3, 6);
        this.ctx.fillRect(x + 27, y - 6, 3, 6);
        this.ctx.fillRect(x + 30, y - 9, 3, 9);
        this.ctx.fillRect(x + 33, y - 6, 3, 6);
        
        // 眼睛斑點
        this.ctx.fillStyle = '#8800ff';
        this.ctx.fillRect(x - 6, y - 6, 3, 3);
        this.ctx.fillRect(x + 30, y - 6, 3, 3);
        
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6, y + 6, 3, 3);
        this.ctx.fillRect(x + 15, y + 6, 3, 3);
        
        // 嘴巴
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(x + 9, y + 12, 6, 3);
    }
    
    // 繪製鳳凰
    drawPhoenix(x, y) {
        const size = 3;
        
        // 身體
        const bodyPattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,0,0,1,1,0],
            [0,0,1,0,0,1,0,0]
        ];
        
        this.drawPixelPattern(x, y, bodyPattern, size, '#ff8800');
        
        // 鳳凰火焰尾羽
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x - 9, y - 3, 3, 12);
        this.ctx.fillRect(x + 30, y - 3, 3, 12);
        
        this.ctx.fillStyle = '#ff4400';
        this.ctx.fillRect(x - 6, y - 6, 3, 15);
        this.ctx.fillRect(x + 27, y - 6, 3, 15);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x - 3, y - 9, 3, 18);
        this.ctx.fillRect(x + 24, y - 9, 3, 18);
        
        // 鳳凰冠羽
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 6, y - 9, 3, 9);
        this.ctx.fillRect(x + 15, y - 12, 3, 12);
        this.ctx.fillRect(x + 12, y - 6, 3, 6);
        
        // 眼睛（發光效果）
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x + 6, y + 6, 3, 3);
        this.ctx.fillRect(x + 15, y + 6, 3, 3);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 7, y + 7, 1, 1);
        this.ctx.fillRect(x + 16, y + 7, 1, 1);
        
        // 嘴巴
        this.ctx.fillStyle = '#ff8800';
        this.ctx.fillRect(x + 9, y + 12, 6, 3);
    }
    
    // 通用像素圖案繪製方法
    drawPixelPattern(x, y, pattern, size, color) {
        this.ctx.fillStyle = color;
        
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    this.ctx.fillRect(
                        x + col * size,
                        y + row * size,
                        size,
                        size
                    );
                }
            }
        }
    }
    
    // 顯示寵物圖鑑
    showPetEncyclopedia() {
        // 創建圖鑑覆蓋層
        const overlay = document.createElement('div');
        overlay.className = 'encyclopedia-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // 創建圖鑑容器
        const encyclopediaContainer = document.createElement('div');
        encyclopediaContainer.className = 'encyclopedia-container';
        encyclopediaContainer.style.cssText = `
            background: #2a2a2a;
            border: 2px solid #666;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            font-family: monospace;
        `;
        
        // 標題
        const title = document.createElement('h2');
        title.textContent = '🐣 寵物圖鑑 🐣';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            color: #ffdd00;
            font-size: 18px;
        `;
        encyclopediaContainer.appendChild(title);
        
        // 創建寵物展示區域
        this.createPetGallery(encyclopediaContainer);
        
        // 關閉按鈕
        const closeButton = document.createElement('button');
        closeButton.textContent = '關閉';
        closeButton.className = 'game-button';
        closeButton.style.cssText = `
            display: block;
            margin: 20px auto 0;
            background: #aa4444;
            padding: 8px 16px;
        `;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        encyclopediaContainer.appendChild(closeButton);
        
        overlay.appendChild(encyclopediaContainer);
        document.body.appendChild(overlay);
        
        // 點擊覆蓋層外部關閉
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // 創建寵物圖鑑展示
    createPetGallery(container) {
        const petData = [
            {
                stage: PET_EVOLUTION.STAGES.EGG,
                name: '蛋',
                description: '這是一個神秘的蛋，裡面蘊藏著無限的可能性。需要耐心等待它孵化。',
                color: '#f0f0f0'
            },
            {
                stage: PET_EVOLUTION.STAGES.BABY,
                name: '小雞',
                description: '剛孵化的小雞，充滿活力但需要細心照顧。牠會很快成長。',
                color: '#ffdd00'
            },
            {
                stage: PET_EVOLUTION.ADULT_TYPES.CHICKEN,
                name: '雞',
                description: '普通但可靠的成年雞，性格溫和，容易照顧。適合新手飼養者。',
                color: '#ffffff'
            },
            {
                stage: PET_EVOLUTION.ADULT_TYPES.PEACOCK,
                name: '孔雀',
                description: '華麗的孔雀，擁有美麗的尾羽。需要高品質的照顧才能進化成此形態。',
                color: '#0080ff'
            },
            {
                stage: PET_EVOLUTION.ADULT_TYPES.PHOENIX,
                name: '鳳凰',
                description: '傳說中的神鳥，擁有火焰般的羽毛和神秘的力量。極其罕見的最高進化形態。',
                color: '#ff8800'
            }
        ];
        
        petData.forEach((pet) => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding: 15px;
                background: #3a3a3a;
                border-radius: 8px;
                border-left: 4px solid ${pet.color};
            `;
            
            // 寵物圖像容器
            const petImageContainer = document.createElement('div');
            petImageContainer.style.cssText = `
                width: 80px;
                height: 60px;
                margin-right: 15px;
                position: relative;
            `;
            
            // 創建小畫布來繪製寵物
            const petCanvas = document.createElement('canvas');
            petCanvas.width = 80;
            petCanvas.height = 60;
            petCanvas.style.cssText = `
                background: #1a1a1a;
                border-radius: 4px;
                image-rendering: pixelated;
            `;
            
            const petCtx = petCanvas.getContext('2d');
            petCtx.imageSmoothingEnabled = false;
            
            // 繪製寵物
            this.drawPetInCanvas(petCtx, pet.stage, 16, 8);
            
            petImageContainer.appendChild(petCanvas);
            
            // 寵物資訊
            const petInfo = document.createElement('div');
            petInfo.style.cssText = `
                flex: 1;
            `;
            
            const petName = document.createElement('h3');
            petName.textContent = pet.name;
            petName.style.cssText = `
                margin: 0 0 8px 0;
                color: ${pet.color};
                font-size: 16px;
            `;
            
            const petDescription = document.createElement('p');
            petDescription.textContent = pet.description;
            petDescription.style.cssText = `
                margin: 0;
                font-size: 12px;
                line-height: 1.4;
                color: #ccc;
            `;
            
            petInfo.appendChild(petName);
            petInfo.appendChild(petDescription);
            
            petCard.appendChild(petImageContainer);
            petCard.appendChild(petInfo);
            
            container.appendChild(petCard);
        });
    }
    
    // 在小畫布中繪製寵物
    drawPetInCanvas(ctx, petType, x, y) {
        const originalCtx = this.ctx;
        this.ctx = ctx;
        
        // 清除背景
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // 根據類型繪製寵物
        switch (petType) {
            case PET_EVOLUTION.STAGES.EGG:
                this.drawEgg(x, y);
                break;
            case PET_EVOLUTION.STAGES.BABY:
                this.drawBaby(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.CHICKEN:
                this.drawChicken(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PEACOCK:
                this.drawPeacock(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PHOENIX:
                this.drawPhoenix(x, y);
                break;
        }
        
        this.ctx = originalCtx;
    }
    
    // 時間管理相關方法
    pauseGameTime() {
        if (this.timeSystem) {
            this.timeSystem.pause();
        }
    }
    
    resumeGameTime() {
        if (this.timeSystem) {
            this.timeSystem.resume();
        }
    }
    
    performReset() {
        // 調用遊戲實例的重置函數
        const gameInstance = getGameInstance();
        if (gameInstance && gameInstance.resetGame) {
            gameInstance.resetGame();
        } else {
            // 備用方案：直接重置
            if (this.timeSystem) {
                this.timeSystem.reset();
            }

            if (GAME_CONFIG.SAVE_KEY) {
                localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
            }
        }

        console.log('遊戲已完全重置');
    }
    
    // 開始時間顯示更新
    startTimeDisplayUpdate() {
        this.stopTimeDisplayUpdate(); // 確保沒有重複的定時器
        
        this.timeDisplayInterval = setInterval(() => {
            if (this.gameState.isState(GameState.STATES.PLAYING)) {
                this.renderTimeInfo();
            }
        }, 100); // 每 100ms 更新一次時間顯示
    }
    
    // 停止時間顯示更新
    stopTimeDisplayUpdate() {
        if (this.timeDisplayInterval) {
            clearInterval(this.timeDisplayInterval);
            this.timeDisplayInterval = null;
        }
    }

    // 寵物輪播系統方法

    // 繪製輪播寵物
    drawCarouselPet() {
        const currentPet = this.petCarousel.pets[this.petCarousel.currentPetIndex];
        const centerX = this.canvas.width / 2;
        const petY = 120;
        const nameY = 180;

        // 完全清除整個寵物顯示區域（包括名稱）
        this.clearPetArea(0, petY - 30, this.canvas.width, 100);

        // 繪製當前寵物
        this.drawPetByType(currentPet.type, centerX - 16, petY);

        // 繪製寵物名稱
        this.ctx.fillStyle = '#ffdd00';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(currentPet.name, centerX, nameY);
    }

    // 啟動寵物輪播
    startPetCarousel() {
        // 如果已經在運行，先停止
        this.stopPetCarousel();

        // 立即顯示第一個寵物
        this.drawCarouselPet();

        // 設置自動切換計時器
        this.petCarousel.changeInterval = setInterval(() => {
            this.nextPet();
        }, this.petCarousel.displayDuration);
    }

    // 停止寵物輪播
    stopPetCarousel() {
        // 清除自動切換計時器
        if (this.petCarousel.changeInterval) {
            clearInterval(this.petCarousel.changeInterval);
            this.petCarousel.changeInterval = null;
        }

        // 清除動畫計時器
        if (this.petCarousel.animationTimer) {
            clearTimeout(this.petCarousel.animationTimer);
            this.petCarousel.animationTimer = null;
        }

        this.petCarousel.isAnimating = false;
    }

    // 切換到下一個寵物
    nextPet() {
        if (this.petCarousel.isAnimating) return;

        // 更新索引
        this.petCarousel.currentPetIndex =
            (this.petCarousel.currentPetIndex + 1) % this.petCarousel.pets.length;

        // 執行動畫
        this.animatePetTransition();
    }

    // 執行寵物切換動畫
    animatePetTransition() {
        this.petCarousel.isAnimating = true;

        const centerX = this.canvas.width / 2;
        const petY = 120;
        const nameY = 180;
        const currentPet = this.petCarousel.pets[this.petCarousel.currentPetIndex];
        const previousPet = this.petCarousel.pets[
            (this.petCarousel.currentPetIndex - 1 + this.petCarousel.pets.length) % this.petCarousel.pets.length
        ];

        // 動畫參數
        const animationSteps = 30;
        const stepDuration = this.petCarousel.transitionDuration / animationSteps;
        let currentStep = 0;

        const animateStep = () => {
            // 計算動畫進度 (0 到 1)
            const progress = currentStep / animationSteps;

            // 使用緩動函數 (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // 完全清除寵物和名稱顯示區域
            this.clearPetArea(0, petY - 30, this.canvas.width, 100);

            // 計算新寵物位置 (從右側滑入到中央)
            const newPetStartX = this.canvas.width + 50;
            const newPetEndX = centerX - 16;
            const newPetCurrentX = newPetStartX + (newPetEndX - newPetStartX) * easeProgress;

            // 計算舊寵物位置 (從中央滑出到左側)
            const oldPetStartX = centerX - 16;
            const oldPetEndX = -100; // 確保完全滑出左側
            const oldPetCurrentX = oldPetStartX + (oldPetEndX - oldPetStartX) * easeProgress;

            // 繪製滑出的舊寵物
            if (oldPetCurrentX > -100 && progress < 0.8) {
                this.drawPetByType(previousPet.type, oldPetCurrentX, petY);
                // 繪製舊寵物名稱
                this.ctx.fillStyle = '#ffdd00';
                this.ctx.font = '14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(previousPet.name, oldPetCurrentX + 16, nameY);
            }

            // 繪製滑入的新寵物
            if (newPetCurrentX < this.canvas.width + 50) {
                this.drawPetByType(currentPet.type, newPetCurrentX, petY);
                // 繪製新寵物名稱
                this.ctx.fillStyle = '#ffdd00';
                this.ctx.font = '14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(currentPet.name, newPetCurrentX + 16, nameY);
            }

            currentStep++;

            if (currentStep <= animationSteps) {
                // 繼續動畫
                this.petCarousel.animationTimer = setTimeout(animateStep, stepDuration);
            } else {
                // 動畫完成，完全清除並重新繪製
                this.petCarousel.isAnimating = false;
                this.clearPetArea(0, petY - 30, this.canvas.width, 100);
                this.drawCarouselPet();
            }
        };

        // 開始動畫
        animateStep();
    }

    // 根據類型繪製寵物
    drawPetByType(petType, x, y) {
        switch (petType) {
            case PET_EVOLUTION.STAGES.EGG:
                this.drawEgg(x, y);
                break;
            case PET_EVOLUTION.STAGES.BABY:
                this.drawBaby(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.CHICKEN:
                this.drawChicken(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PEACOCK:
                this.drawPeacock(x, y);
                break;
            case PET_EVOLUTION.ADULT_TYPES.PHOENIX:
                this.drawPhoenix(x, y);
                break;
            default:
                this.drawEgg(x, y);
        }
    }

    // 更新飽食度顯示
    updateHungerDisplay(hungerValue) {
        const statusItems = document.querySelectorAll('.status-item');
        if (statusItems && statusItems[1]) { // 飽食度現在是第二個項目
            statusItems[1].innerHTML = `<span class="status-value">飽食度: ${hungerValue}</span>`;
        }
    }

    // 更新金幣顯示
    updateCoinsDisplay(coinsValue) {
        const statusItems = document.querySelectorAll('.status-item');
        if (statusItems && statusItems[0]) { // 金幣是第一個項目
            statusItems[0].innerHTML = `<span class="status-value" style="color: #FFD700; font-weight: bold;">金幣: ${coinsValue}</span>`;
        }

        // 同時更新餵食按鈕狀態
        this.updateFeedButtonState(coinsValue);
    }

    // 獲取當前飽食度 (供UI初始化使用)
    getCurrentHunger() {
        const gameInstance = getGameInstance();
        if (gameInstance && gameInstance.currentHunger !== null && gameInstance.currentHunger !== undefined) {
            return Math.floor(gameInstance.currentHunger);
        }

        // 如果飽食度尚未初始化，檢查是否有儲存資料
        if (gameInstance && gameInstance.gameData && gameInstance.gameData.tamagotchi && gameInstance.gameData.tamagotchi.hunger !== undefined) {
            return Math.floor(gameInstance.gameData.tamagotchi.hunger);
        }

        return TAMAGOTCHI_STATS.MAX_HUNGER; // 最後的預設值
    }

    // 獲取當前金幣 (供UI初始化使用)
    getCurrentCoins() {
        const gameInstance = getGameInstance();
        if (gameInstance && gameInstance.currentCoins !== null && gameInstance.currentCoins !== undefined) {
            return Math.floor(gameInstance.currentCoins);
        }

        // 如果金幣尚未初始化，檢查是否有儲存資料
        if (gameInstance && gameInstance.gameData && gameInstance.gameData.tamagotchi && gameInstance.gameData.tamagotchi.coins !== undefined) {
            return Math.floor(gameInstance.gameData.tamagotchi.coins);
        }

        return TAMAGOTCHI_STATS.INITIAL_COINS; // 最後的預設值
    }

    // 更新進化階段顯示 (僅更新寵物外觀，不顯示文字)
    updateEvolutionDisplay(newStage, adultType = null) {
        // 僅更新畫布上的寵物外觀
        this.updatePetAppearance(newStage, adultType);
    }


    // 更新畫布上的寵物外觀 (使用點陣圖風格)
    updatePetAppearance(stage, adultType = null) {
        // 計算寵物繪製位置 (與現有的 drawCurrentPet 方法保持一致)
        const petX = this.canvas.width / 2 - 16;
        const petY = 120;

        // 先清除寵物區域，確保進化時不會有殘影
        this.clearPetArea(petX - 15, petY - 15, 70, 50);

        // 根據進化階段繪製對應的點陣圖寵物
        switch (stage) {
            case PET_EVOLUTION.STAGES.EGG:
                this.drawPetByType(PET_EVOLUTION.STAGES.EGG, petX, petY);
                break;
            case PET_EVOLUTION.STAGES.BABY:
                this.drawPetByType(PET_EVOLUTION.STAGES.BABY, petX, petY);
                break;
            case PET_EVOLUTION.STAGES.ADULT:
                if (adultType === PET_EVOLUTION.ADULT_TYPES.CHICKEN) {
                    this.drawPetByType(PET_EVOLUTION.ADULT_TYPES.CHICKEN, petX, petY);
                } else if (adultType === PET_EVOLUTION.ADULT_TYPES.PEACOCK) {
                    this.drawPetByType(PET_EVOLUTION.ADULT_TYPES.PEACOCK, petX, petY);
                } else if (adultType === PET_EVOLUTION.ADULT_TYPES.PHOENIX) {
                    this.drawPetByType(PET_EVOLUTION.ADULT_TYPES.PHOENIX, petX, petY);
                }
                break;
        }
    }


    // 獲取當前寵物的進化資訊 (供UI顯示使用)
    getCurrentEvolutionInfo() {
        const gameInstance = getGameInstance();
        if (gameInstance && gameInstance.gameData && gameInstance.gameData.tamagotchi) {
            const tamagotchi = gameInstance.gameData.tamagotchi;
            return {
                stage: tamagotchi.evolutionStage,
                adultType: tamagotchi.adultType,
                lastEvolutionTime: tamagotchi.lastEvolutionTime,
                birthTime: tamagotchi.birthTime
            };
        }
        return null;
    }

    // 根據進化階段繪製當前寵物
    drawCurrentPetWithEvolution() {
        const evolutionInfo = this.getCurrentEvolutionInfo();
        if (evolutionInfo) {
            // 使用進化階段來繪製寵物 (僅點陣圖，無文字)
            this.updatePetAppearance(evolutionInfo.stage, evolutionInfo.adultType);
        } else {
            // 如果沒有進化資訊，顯示預設的蛋階段
            this.updatePetAppearance(PET_EVOLUTION.STAGES.EGG);
        }
    }
}