export const BOARD_SIZE = 100; // Game board configuration - 10x10 grid (1-100)
export const BOARD_CELL_SIZE = 50;
export const BOARD_PADDING = 15;
export const ICONS_MAP = {
    'player': '👥',
    'bot': '🤖',
    'snake': '🐍',
    'ladder': '🪜',
    'dice': '🎲',
    'up': '↑',
    'down': '↓',
};

// Ladders configuration [bottom, top]
export const LADDERS = [
    [2, 38],
    [4, 14],
    [9, 31],
    [21, 42],
    [28, 66],
    [36, 44],
    [51, 73],
    [71, 91],
    [80, 84],
];

// Snakes configuration [top, bottom]
export const SNAKES = [
    [16, 6],
    [46, 25],
    [52, 11],
    [61, 24],
    [77, 58],
    [74, 53],
    [89, 70],
    [92, 88],
    [95, 65],
    [99, 78],
];

// Snake color schemes and styles
export const SNAKE_STYLES = [
    { body: '#fbbf24', spots: '#f59e0b', expression: 'happy' }, // Yellow - happy
    { body: '#a78bfa', spots: '#8b5cf6', expression: 'dizzy' }, // Purple - dizzy
    { body: '#636A44', spots: '#B1B5A2', expression: 'happy' }, // Finch - happy
    { body: '#2e4242', spots: '#6c8392', expression: 'angry' }, // Red - angry
    { body: '#fbbf24', spots: '#f59e0b', expression: 'angry' }, // Yellow - angry
    { body: '#ec4899', spots: '#db2777', expression: 'loving' }, // Pink - loving
    { body: '#a78bfa', spots: '#8b5cf6', expression: 'happy' }, // Blue - happy
    { body: '#fb923c', spots: '#f97316', expression: 'angry' }, // Orange - angry
    { body: '#636A44', spots: '#B1B5A2', expression: 'dizzy' }, // Finch - happy
    { body: '#f87171', spots: '#ef4444', expression: 'angry' }, // Red - angry
];