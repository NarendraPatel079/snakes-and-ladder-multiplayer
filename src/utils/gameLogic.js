// Game board configuration - 10x10 grid (1-100)
export const BOARD_SIZE = 100

// Snakes configuration [top, bottom]
export const SNAKES = [
  [16, 6],
  [46, 25],
  [49, 11],
  [62, 19],
  [64, 60],
  [74, 53],
  [89, 68],
  [92, 88],
  [95, 75],
  [99, 80],
]

// Ladders configuration [bottom, top]
export const LADDERS = [
  [2, 38],
  [4, 14],
  [9, 31],
  [21, 42],
  [28, 84],
  [36, 44],
  [51, 67],
  [71, 91],
  [80, 100],
]

// Get position coordinates on board (x, y) where 1 is top-left, 100 is bottom-left
export const getPositionCoords = (position) => {
  const row = Math.floor((position - 1) / 10)
  const col = (position - 1) % 10
  
  // Zigzag pattern: odd rows go left to right, even rows go right to left
  const isOddRow = row % 2 === 0
  const x = isOddRow ? col : 9 - col
  const y = row
  
  return { x, y }
}

// Check if position has a snake or ladder
export const getSnakeOrLadder = (position) => {
  const snake = SNAKES.find(([top]) => top === position)
  if (snake) {
    return { type: 'snake', from: snake[0], to: snake[1] }
  }
  
  const ladder = LADDERS.find(([bottom]) => bottom === position)
  if (ladder) {
    return { type: 'ladder', from: ladder[0], to: ladder[1] }
  }
  
  return null
}

// Calculate new position after moving
export const movePlayer = (currentPosition, diceValue) => {
  let newPosition = currentPosition + diceValue
  
  // Check if player wins
  if (newPosition === BOARD_SIZE) {
    return { position: BOARD_SIZE, type: 'win', snakeOrLadder: null }
  }
  
  // If exceeds board, don't move
  if (newPosition > BOARD_SIZE) {
    return { position: currentPosition, type: 'exceed', snakeOrLadder: null }
  }
  
  // Check for snake or ladder
  const snakeOrLadder = getSnakeOrLadder(newPosition)
  if (snakeOrLadder) {
    newPosition = snakeOrLadder.to
    return { 
      position: newPosition, 
      type: snakeOrLadder.type, 
      snakeOrLadder 
    }
  }
  
  return { position: newPosition, type: 'move', snakeOrLadder: null }
}

// Roll dice
export const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1
}
