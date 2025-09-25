// 遊戲常數定義

const GAME_CONFIG = {
    // 畫布設定
    CANVAS_WIDTH: 320,
    CANVAS_HEIGHT: 240,
    
    // 時間設定
    DEFAULT_TIME_SPEED: 1.0,
    MIN_TIME_SPEED: 0.1,
    MAX_TIME_SPEED: 300.0,
    
    // 更新頻率 (毫秒)
    UPDATE_INTERVAL: 1000, // 每秒更新一次狀態
    RENDER_FPS: 60,
    
    // 本地存檔鍵值
    SAVE_KEY: 'tamagotchi_save_data'
};

const TAMAGOTCHI_STATS = {
    // 屬性範圍
    MAX_HUNGER: 100,
    MAX_AFFECTION: 100,
    MAX_LIFE: 100,

    // 屬性衰減速度 (每分鐘)
    HUNGER_DECAY: 2,
    AFFECTION_DECAY: 5,    // 每分鐘減少5點
    LIFE_DECAY: 0.5,

    // 危險閾值
    CRITICAL_THRESHOLD: 20,
    WARNING_THRESHOLD: 40,

    // 飽食度懲罰機制
    HUNGER_PENALTY_THRESHOLD: 50,  // 飽食度低於此值時開始懲罰生命值
    LIFE_PENALTY_RATE: 1,          // 生命值懲罰速率 (每分鐘減少點數)

    // 離家出走機制
    AFFECTION_RUNAWAY_THRESHOLD: 0, // 好感度低於此值時離家出走

    // 金幣系統
    INITIAL_COINS: 100,
    MIN_COINS: 0,
    MAX_COINS: 9999
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
        SLEEPING: 5
    }
};

const PET_EVOLUTION = {
    // 進化階段
    STAGES: {
        EGG: 'EGG',           // 蛋階段
        BABY: 'BABY',         // 幼年體（小雞）
        ADULT: 'ADULT'        // 成年體
    },
    
    // 成年體類型
    ADULT_TYPES: {
        CHICKEN: 'CHICKEN',   // 雞
        PEACOCK: 'PEACOCK',   // 孔雀
        PHOENIX: 'PHOENIX'    // 鳳凰
    },
    
    // 進化條件 (基於遊戲時間，單位：毫秒)
    EVOLUTION_CONDITIONS: {
        EGG_TO_BABY: {
            minTime: 30 * 60 * 1000,    // 30分鐘 = 1,800,000毫秒
        },
        BABY_TO_ADULT: {
            minTime: 60 * 60 * 1000,    // 1小時 = 3,600,000毫秒
        }
    },

    // 成年體進化機率
    ADULT_EVOLUTION_RATES: {
        CHICKEN: 0.60,    // 60%
        PEACOCK: 0.30,    // 30%
        PHOENIX: 0.10     // 10%
    },
    
    // 各形態的基本屬性倍率
    STAGE_MULTIPLIERS: {
        EGG: {
            hungerDecay: 0.5,    // 蛋階段餓得較慢
            affectionDecay: 0.3,
            lifeDecay: 0.2
        },
        BABY: {
            hungerDecay: 1.5,    // 幼年體餓得較快
            affectionDecay: 1.2,
            lifeDecay: 0.8
        },
        ADULT: {
            hungerDecay: 1.0,    // 成年體標準速度
            affectionDecay: 1.0,
            lifeDecay: 1.0
        }
    }
};