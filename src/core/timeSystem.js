// 遊戲時間系統

class TimeSystem {
    constructor() {
        this.gameStartTime = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isPaused = false;
        this.timeSpeed = GAME_CONFIG.DEFAULT_TIME_SPEED;
        this.lastUpdateTime = 0;
        this.callbacks = [];
        
        // 新的累積時間追蹤系統
        this.accumulatedGameTime = 0; // 累積的遊戲時間（秒）
        this.lastSpeedChangeTime = 0; // 上次變更流速的真實時間
        this.speedHistory = []; // 流速變更歷史
    }
    
    // 開始計時
    start() {
        const now = Date.now();
        this.gameStartTime = now;
        this.lastUpdateTime = now;
        this.lastSpeedChangeTime = now;
        this.accumulatedGameTime = 0;
        this.isPaused = false;
        
        // 記錄初始流速
        this.speedHistory = [{
            realTime: now,
            speed: this.timeSpeed,
            accumulatedGameTime: 0
        }];
        
        console.log('遊戲時間系統已啟動');
    }
    
    // 暫停遊戲時間
    pause() {
        if (!this.isPaused) {
            // 在暫停前更新累積時間
            this.updateAccumulatedTime();
            this.pausedTime = Date.now();
            this.isPaused = true;
            console.log('遊戲時間已暫停');
            this.notifyCallbacks('pause');
        }
    }
    
    // 恢復遊戲時間
    resume() {
        if (this.isPaused) {
            const now = Date.now();
            const pauseDuration = now - this.pausedTime;
            this.totalPausedDuration += pauseDuration;
            this.lastUpdateTime = now;
            this.lastSpeedChangeTime = now; // 重置流速變更時間
            this.isPaused = false;
            console.log(`遊戲時間已恢復 (暫停了 ${pauseDuration}ms)`);
            this.notifyCallbacks('resume');
        }
    }
    
    // 獲取遊戲運行時間（秒）
    getGameTime() {
        if (this.gameStartTime === 0) return 0;
        
        // 如果不是暫停狀態，先更新累積時間
        if (!this.isPaused) {
            this.updateAccumulatedTime();
        }
        
        return this.accumulatedGameTime;
    }
    
    // 更新累積遊戲時間
    updateAccumulatedTime() {
        if (this.isPaused || this.gameStartTime === 0) return;
        
        const now = Date.now();
        const realTimeSinceLastUpdate = (now - this.lastSpeedChangeTime) / 1000;
        const gameTimeDelta = realTimeSinceLastUpdate * this.timeSpeed;
        
        this.accumulatedGameTime += gameTimeDelta;
        this.lastSpeedChangeTime = now;
    }
    
    // 獲取自上次更新後的時間差（delta time）
    getDeltaTime() {
        if (this.isPaused) return 0;
        
        const now = Date.now();
        const deltaMs = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        return (deltaMs / 1000) * this.timeSpeed;
    }
    
    // 設定時間流速
    setTimeSpeed(speed) {
        const clampedSpeed = Helpers.clamp(speed, GAME_CONFIG.MIN_TIME_SPEED, GAME_CONFIG.MAX_TIME_SPEED);
        
        // 在變更流速前，先累積之前的時間
        if (!this.isPaused && this.gameStartTime !== 0) {
            this.updateAccumulatedTime();
        }
        
        // 記錄流速變更歷史
        const now = Date.now();
        this.speedHistory.push({
            realTime: now,
            speed: clampedSpeed,
            accumulatedGameTime: this.accumulatedGameTime
        });
        
        this.timeSpeed = clampedSpeed;
        this.lastSpeedChangeTime = now;
        
        console.log(`時間流速變更: ${this.timeSpeed}x -> ${clampedSpeed}x (累積時間: ${this.accumulatedGameTime.toFixed(1)}s)`);
        this.notifyCallbacks('speedChange', clampedSpeed);
    }
    
    // 獲取當前時間流速
    getTimeSpeed() {
        return this.timeSpeed;
    }
    
    // 檢查是否暫停
    isPausedState() {
        return this.isPaused;
    }
    
    // 重置時間系統
    reset() {
        this.gameStartTime = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isPaused = false;
        this.timeSpeed = GAME_CONFIG.DEFAULT_TIME_SPEED;
        this.lastUpdateTime = 0;
        this.accumulatedGameTime = 0;
        this.lastSpeedChangeTime = 0;
        this.speedHistory = [];
        console.log('時間系統已重置');
        this.notifyCallbacks('reset');
    }
    
    // 註冊時間事件回調
    addCallback(callback) {
        this.callbacks.push(callback);
    }
    
    // 移除時間事件回調
    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }
    
    // 通知所有回調
    notifyCallbacks(event, data = null) {
        this.callbacks.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('時間系統回調錯誤:', error);
            }
        });
    }
    
    // 格式化遊戲時間顯示
    getFormattedGameTime() {
        return Helpers.formatTime(this.getGameTime());
    }
    
    // 獲取時間狀態資訊
    getTimeInfo() {
        return {
            gameTime: this.getGameTime(),
            formattedTime: this.getFormattedGameTime(),
            isPaused: this.isPaused,
            timeSpeed: this.timeSpeed,
            totalPausedDuration: this.totalPausedDuration / 1000
        };
    }
}