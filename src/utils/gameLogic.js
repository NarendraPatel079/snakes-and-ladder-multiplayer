import { BOARD_SIZE } from "../constants/GameBoardConstants"

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

// Get position coordinates on board (x, y) where 1 is bottom-left, 100 is top-left
// Traditional snakes and ladders: start at bottom, zigzag up to top
export const getPositionCoords = (position) => {
  const row = Math.floor((position - 1) / 10)
  const col = (position - 1) % 10
  
  // Reverse row so position 1 is at bottom (row 9) and 100 is at top (row 0)
  const reversedRow = 9 - row
  
  // Zigzag pattern: 
  // Bottom row (row 9): left to right (1-10)
  // Next row (row 8): right to left (11-20)
  // And so on...
  // Top row (row 0): depends on whether it's even or odd
  const isOddRow = row % 2 === 0
  const x = isOddRow ? col : 9 - col
  const y = reversedRow
  
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
