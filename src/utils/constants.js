// 遊戲常數定義

const GAME_CONFIG = {
    // 畫布設定
    CANVAS_WIDTH: 320,
    CANVAS_HEIGHT: 240,
    
    // 時間設定
    DEFAULT_TIME_SPEED: 1.0,
    MIN_TIME_SPEED: 0.1,
    MAX_TIME_SPEED: 16.0,
    
    // 更新頻率 (毫秒)
    UPDATE_INTERVAL: 1000, // 每秒更新一次狀態
    RENDER_FPS: 60,
    
    // 本地存檔鍵值
    SAVE_KEY: 'tamagotchi_save_data'
};

const TAMAGOTCHI_STATS = {
    // 屬性範圍
    MAX_HUNGER: 100,
    MAX_HAPPINESS: 100,
    MAX_HEALTH: 100,
    MAX_CLEANLINESS: 100,
    
    // 屬性衰減速度 (每分鐘)
    HUNGER_DECAY: 2,
    HAPPINESS_DECAY: 1,
    HEALTH_DECAY: 0.5,
    CLEANLINESS_DECAY: 1.5,
    
    // 危險閾值
    CRITICAL_THRESHOLD: 20,
    WARNING_THRESHOLD: 40
};

const SPRITE_CONFIG = {
    // 電子雞精靈圖設定
    SPRITE_SIZE: 32,
    ANIMATION_SPEED: 500, // 毫秒
    
    // 狀態精靈索引
    STATES: {
        IDLE: 0,
        HAPPY: 1,
        HUNGRY: 2,
        SICK: 3,
        DIRTY: 4,
        SLEEPING: 5
    }
};