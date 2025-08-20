// 使用者介面管理系統

class GameInterface {
    constructor(gameState, timeSystem) {
        this.gameState = gameState;
        this.timeSystem = timeSystem;
        this.uiContainer = document.getElementById('game-ui');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplayInterval = null;
        
        // 綁定狀態變更監聽
        this.gameState.addStateListener((oldState, newState) => {
            this.updateUI(newState);
        });
        
        // 初始化 UI
        this.updateUI(this.gameState.getCurrentState());
    }
    
    // 根據遊戲狀態更新 UI
    updateUI(state) {
        this.clearUI();
        this.clearCanvas();
        
        switch (state) {
            case GameState.STATES.MENU:
                this.stopTimeDisplayUpdate();
                this.renderMenuScreen();
                break;
            case GameState.STATES.PLAYING:
                this.renderGameScreen();
                this.startTimeDisplayUpdate();
                break;
            case GameState.STATES.PAUSED:
                this.renderPauseDialog();
                break;
            case GameState.STATES.CONFIRM_RESET:
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
    
    // 渲染待機畫面
    renderMenuScreen() {
        // Canvas 上的標題
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('電子雞遊戲', this.canvas.width / 2, 80);
        
        this.ctx.font = '12px monospace';
        this.ctx.fillText('Tamagotchi Game', this.canvas.width / 2, 100);
        
        // 簡單的像素圖案 (代表電子雞)
        this.drawPixelPet(this.canvas.width / 2 - 16, 120);
        
        // UI 按鈕
        const startButton = this.createButton('開始遊戲', () => {
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
        
        // 臨時顯示電子雞
        this.drawPixelPet(this.canvas.width / 2 - 16, 120);
        
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
        
        // 臨時的狀態顯示
        const stats = ['飢餓: 80', '快樂: 90', '健康: 85', '清潔: 75'];
        
        stats.forEach(stat => {
            const statusItem = document.createElement('div');
            statusItem.className = 'status-item';
            statusItem.innerHTML = `<span class="status-value">${stat}</span>`;
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
        const feedButton = this.createButton('餵食', () => {
            console.log('餵食');
        });
        
        const playButton = this.createButton('遊戲', () => {
            console.log('遊戲');
        });
        
        const cleanButton = this.createButton('清潔', () => {
            console.log('清潔');
        });
        
        [feedButton, playButton, cleanButton].forEach(button => {
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
    
    // 建立時間流速選擇器
    createTimeSpeedSelect() {
        const select = document.createElement('select');
        select.className = 'time-speed-select';
        
        // 時間流速選項
        const speedOptions = [1, 2, 4, 8, 16];
        
        speedOptions.forEach(speed => {
            const option = document.createElement('option');
            option.value = speed;
            option.textContent = `${speed}x`;
            
            // 設定預設選項
            if (speed === GAME_CONFIG.DEFAULT_TIME_SPEED) {
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
    
    // 繪製簡單的像素電子雞
    drawPixelPet(x, y) {
        const size = 2; // 像素大小
        this.ctx.fillStyle = '#ffff00'; // 黃色
        
        // 簡單的 8x8 像素圖案
        const pattern = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,0,1,1,0,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,0,0,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,0,0,1,0,0]
        ];
        
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    this.ctx.fillRect(
                        x + col * size * 2,
                        y + row * size * 2,
                        size * 2,
                        size * 2
                    );
                }
            }
        }
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
        // 重置時間系統
        if (this.timeSystem) {
            this.timeSystem.reset();
        }
        
        // 清除本地存檔
        if (GAME_CONFIG.SAVE_KEY) {
            localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
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
}