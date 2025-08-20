// 遊戲狀態管理系統

class GameState {
    constructor() {
        this.currentState = 'MENU'; // 初始狀態為待機畫面
        this.previousState = null;
        this.stateData = {};
        this.listeners = [];
        
        // 定義有效的狀態轉換
        this.validTransitions = {
            'MENU': ['PLAYING'],
            'PLAYING': ['MENU', 'PAUSED', 'CONFIRM_RESET'],
            'PAUSED': ['PLAYING'],
            'CONFIRM_RESET': ['PLAYING', 'MENU']
        };
    }
    
    // 狀態常數
    static get STATES() {
        return {
            MENU: 'MENU',           // 待機畫面
            PLAYING: 'PLAYING',     // 遊戲中
            PAUSED: 'PAUSED',       // 遊戲暫停
            CONFIRM_RESET: 'CONFIRM_RESET'  // 重置確認彈窗
        };
    }
    
    // 獲取當前狀態
    getCurrentState() {
        return this.currentState;
    }
    
    // 狀態轉換
    changeState(newState, data = {}) {
        // 檢查是否為有效轉換
        if (!this.isValidTransition(newState)) {
            console.warn(`無效的狀態轉換: ${this.currentState} -> ${newState}`);
            return false;
        }
        
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        this.stateData = { ...data };
        
        console.log(`狀態轉換: ${oldState} -> ${newState}`);
        
        // 通知所有監聽器
        this.notifyListeners(oldState, newState, data);
        
        return true;
    }
    
    // 檢查狀態轉換是否有效
    isValidTransition(newState) {
        const validStates = this.validTransitions[this.currentState];
        return validStates && validStates.includes(newState);
    }
    
    // 回到上一個狀態
    goBack() {
        if (this.previousState) {
            return this.changeState(this.previousState);
        }
        return false;
    }
    
    // 註冊狀態變更監聽器
    addStateListener(callback) {
        this.listeners.push(callback);
    }
    
    // 移除狀態變更監聽器
    removeStateListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    // 通知所有監聽器
    notifyListeners(oldState, newState, data) {
        this.listeners.forEach(callback => {
            try {
                callback(oldState, newState, data);
            } catch (error) {
                console.error('狀態監聽器錯誤:', error);
            }
        });
    }
    
    // 獲取狀態相關資料
    getStateData() {
        return this.stateData;
    }
    
    // 檢查當前是否為特定狀態
    isState(state) {
        return this.currentState === state;
    }
    
    // 重置到初始狀態
    reset() {
        this.currentState = GameState.STATES.MENU;
        this.previousState = null;
        this.stateData = {};
        console.log('遊戲狀態已重置');
    }
}