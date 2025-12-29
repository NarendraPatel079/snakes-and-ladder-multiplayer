export const BOARD_SIZE = 100; // Game board configuration - 10x10 grid (1-100)
export const BOARD_CELL_SIZE = 50;
export const BOARD_PADDING = 15;
export const ICONS_MAP = {
    'player': '👥',
    'snake': '🐍',
    'ladder': '🪜',
    'dice': '🎲',
    'up': '↑',
    'down': '↓',
};

// Snakes configuration [top, bottom]
export const SNAKES = [
    [16, 6],
    [46, 25],
    [49, 11],
    [78, 19],
    [64, 60],
    [74, 53],
    [89, 68],
    [92, 88],
    [95, 75],
    [99, 80],
];

// Ladders configuration [bottom, top]
export const LADDERS = [
    [2, 38],
    [4, 14],
    [9, 31],
    [21, 42],
    [28, 76],
    [36, 44],
    [51, 67],
    [72, 91],
    [80, 100],
];