import { BOARD_SIZE, LADDERS, SNAKES } from "../constants/GameBoardConstants"

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
  
  // Check if player wins (exact roll to 100)
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
    
    // Check if the final position after ladder/snake is 100 (win condition)
    if (newPosition === BOARD_SIZE) {
      return { 
        position: BOARD_SIZE, 
        type: 'win', 
        snakeOrLadder 
      }
    }
    
    return { 
      position: newPosition, 
      type: snakeOrLadder.type, 
      snakeOrLadder 
    }
  }
  
  return { position: newPosition, type: 'move', snakeOrLadder: null }
}

// Generate path of positions from start to end (for animation)
export const generateMovementPath = (startPosition, endPosition) => {
  const path = []
  if (startPosition === endPosition) return [startPosition]
  
  // Generate step-by-step path
  for (let pos = startPosition; pos <= endPosition; pos++) {
    path.push(pos)
  }
  
  return path
}

// Roll dice
export const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1
}
