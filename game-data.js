// ============================================
// GAME DATA - BALLS & ROADS
// ============================================

// Available Balls
const BALLS_DATA = [
    {
        id: 'ball_default',
        name: 'الكرة الافتراضية',
        icon: '🟢',
        color: 0x00ff88,
        price: 0,
        unlocked: true
    },
    {
        id: 'ball_fire',
        name: 'كرة النار',
        icon: '🔥',
        color: 0xff4400,
        price: 100,
        unlocked: false
    },
    {
        id: 'ball_ice',
        name: 'كرة الجليد',
        icon: '❄️',
        color: 0x00ddff,
        price: 150,
        unlocked: false
    },
    {
        id: 'ball_gold',
        name: 'الكرة الذهبية',
        icon: '🟡',
        color: 0xffd700,
        price: 200,
        unlocked: false
    },
    {
        id: 'ball_purple',
        name: 'الكرة البنفسجية',
        icon: '🟣',
        color: 0x9933ff,
        price: 250,
        unlocked: false
    },
    {
        id: 'ball_rainbow',
        name: 'كرة قوس القزح',
        icon: '🌈',
        color: 0xff00ff,
        price: 500,
        unlocked: false
    },
    {
        id: 'ball_metal',
        name: 'الكرة المعدنية',
        icon: '⚙️',
        color: 0xaaaaaa,
        price: 300,
        unlocked: false
    },
    {
        id: 'ball_plasma',
        name: 'كرة البلازما',
        icon: '⚡',
        color: 0xff00ff,
        price: 600,
        unlocked: false
    }
];

// Available Roads
const ROADS_DATA = [
    {
        id: 'road_default',
        name: 'الطريق الافتراضي',
        icon: '🛣️',
        color: 0x1a1a1a,
        pattern: 'default',
        price: 0,
        unlocked: true
    },
    {
        id: 'road_neon',
        name: 'طريق النيون',
        icon: '✨',
        color: 0x000033,
        pattern: 'neon',
        price: 100,
        unlocked: false
    },
    {
        id: 'road_space',
        name: 'طريق الفضاء',
        icon: '🌌',
        color: 0x0a0a1a,
        pattern: 'space',
        price: 200,
        unlocked: false
    },
    {
        id: 'road_desert',
        name: 'طريق الصحراء',
        icon: '🏜️',
        color: 0x8b7355,
        pattern: 'desert',
        price: 150,
        unlocked: false
    },
    {
        id: 'road_ocean',
        name: 'طريق المحيط',
        icon: '🌊',
        color: 0x004466,
        pattern: 'ocean',
        price: 250,
        unlocked: false
    },
    {
        id: 'road_lava',
        name: 'طريق الحمم',
        icon: '🌋',
        color: 0x330000,
        pattern: 'lava',
        price: 300,
        unlocked: false
    },
    {
        id: 'road_cyber',
        name: 'طريق السايبر',
        icon: '💻',
        color: 0x001a1a,
        pattern: 'cyber',
        price: 400,
        unlocked: false
    },
    {
        id: 'road_rainbow',
        name: 'طريق قوس القزح',
        icon: '🌈',
        color: 0x2a2a2a,
        pattern: 'rainbow',
        price: 500,
        unlocked: false
    }
];

// Current selections
let selectedBall = 'ball_default';
let selectedRoad = 'road_default';
let playerCoins = 0;

// Functions to manage data
function getBallData(id) {
    return BALLS_DATA.find(ball => ball.id === id);
}

function getRoadData(id) {
    return ROADS_DATA.find(road => road.id === id);
}

function unlockItem(itemId, itemsArray) {
    const item = itemsArray.find(i => i.id === itemId);
    if (item && !item.unlocked && playerCoins >= item.price) {
        item.unlocked = true;
        playerCoins -= item.price;
        saveGameData();
        return true;
    }
    return false;
}

function selectBall(ballId) {
    const ball = getBallData(ballId);
    if (ball && ball.unlocked) {
        selectedBall = ballId;
        saveGameData();
        return true;
    }
    return false;
}

function selectRoad(roadId) {
    const road = getRoadData(roadId);
    if (road && road.unlocked) {
        selectedRoad = roadId;
        saveGameData();
        return true;
    }
    return false;
}

function addCoins(amount) {
    playerCoins += amount;
    saveGameData();
}

function saveGameData() {
    try {
        const data = {
            balls: BALLS_DATA,
            roads: ROADS_DATA,
            selectedBall: selectedBall,
            selectedRoad: selectedRoad,
            coins: playerCoins
        };
        localStorage.setItem('rushGameData', JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save game data');
    }
}

function loadGameData() {
    try {
        const saved = localStorage.getItem('rushGameData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restore unlocked status
            if (data.balls) {
                data.balls.forEach((savedBall, index) => {
                    if (BALLS_DATA[index]) {
                        BALLS_DATA[index].unlocked = savedBall.unlocked;
                    }
                });
            }
            
            if (data.roads) {
                data.roads.forEach((savedRoad, index) => {
                    if (ROADS_DATA[index]) {
                        ROADS_DATA[index].unlocked = savedRoad.unlocked;
                    }
                });
            }
            
            selectedBall = data.selectedBall || 'ball_default';
            selectedRoad = data.selectedRoad || 'road_default';
            playerCoins = data.coins || 0;
            
            console.log('Game data loaded successfully');
        }
    } catch (e) {
        console.warn('Could not load game data');
    }
}

// Load data on startup
loadGameData();
