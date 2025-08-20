// 通用工具函數

class Helpers {
    // 數值限制在範圍內
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // 線性插值
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // 隨機整數
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 隨機浮點數
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // 格式化時間顯示
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // localStorage 操作
    static saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('存檔失敗:', error);
            return false;
        }
    }
    
    static loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('讀檔失敗:', error);
            return null;
        }
    }
    
    // 狀態等級判定
    static getStatusLevel(value, max) {
        const percentage = (value / max) * 100;
        if (percentage <= TAMAGOTCHI_STATS.CRITICAL_THRESHOLD) return 'critical';
        if (percentage <= TAMAGOTCHI_STATS.WARNING_THRESHOLD) return 'warning';
        return 'good';
    }
    
    // 顏色根據狀態等級
    static getStatusColor(level) {
        switch (level) {
            case 'critical': return '#ff4444';
            case 'warning': return '#ffaa44';
            case 'good': return '#44ff44';
            default: return '#ffffff';
        }
    }
}