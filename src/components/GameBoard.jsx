import { useEffect, useRef } from 'react'
import { getPositionCoords, SNAKES, LADDERS, BOARD_SIZE } from '../utils/gameLogic'

const GameBoard = ({ players, currentPlayerIndex }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const cellSize = 40
    const boardWidth = 10 * cellSize
    const boardHeight = 10 * cellSize
    const padding = 20

    canvas.width = boardWidth + padding * 2
    canvas.height = boardHeight + padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw board background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(padding, padding, boardWidth, boardHeight)

    // Draw cells
    for (let pos = 1; pos <= BOARD_SIZE; pos++) {
      const { x, y } = getPositionCoords(pos)
      const cellX = padding + x * cellSize
      const cellY = padding + y * cellSize

      // Alternate cell colors
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#f1f5f9'
      ctx.fillRect(cellX, cellY, cellSize, cellSize)

      // Draw cell border
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.strokeRect(cellX, cellY, cellSize, cellSize)

      // Draw number
      ctx.fillStyle = '#64748b'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        pos.toString(),
        cellX + cellSize / 2,
        cellY + cellSize / 2
      )
    }

    // Draw snakes
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 3
    SNAKES.forEach(([top, bottom]) => {
      const topCoords = getPositionCoords(top)
      const bottomCoords = getPositionCoords(bottom)
      const startX = padding + topCoords.x * cellSize + cellSize / 2
      const startY = padding + topCoords.y * cellSize + cellSize / 2
      const endX = padding + bottomCoords.x * cellSize + cellSize / 2
      const endY = padding + bottomCoords.y * cellSize + cellSize / 2

      // Draw curved line
      ctx.beginPath()
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2 - 20
      ctx.moveTo(startX, startY)
      ctx.quadraticCurveTo(midX, midY, endX, endY)
      ctx.stroke()

      // Draw snake head
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(startX, startY, 5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw ladders
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 3
    LADDERS.forEach(([bottom, top]) => {
      const topCoords = getPositionCoords(top)
      const bottomCoords = getPositionCoords(bottom)
      const startX = padding + bottomCoords.x * cellSize + cellSize / 2
      const startY = padding + bottomCoords.y * cellSize + cellSize / 2
      const endX = padding + topCoords.x * cellSize + cellSize / 2
      const endY = padding + topCoords.y * cellSize + cellSize / 2

      // Draw ladder lines
      ctx.beginPath()
      ctx.moveTo(startX - 5, startY)
      ctx.lineTo(endX - 5, endY)
      ctx.moveTo(startX + 5, startY)
      ctx.lineTo(endX + 5, endY)
      ctx.stroke()

      // Draw rungs
      const steps = 5
      for (let i = 1; i < steps; i++) {
        const t = i / steps
        const x1 = startX - 5 + (endX - startX - 10) * t
        const y1 = startY + (endY - startY) * t
        const x2 = startX + 5 + (endX - startX + 10) * t
        const y2 = startY + (endY - startY) * t
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    })

    // Draw players
    players.forEach((player, index) => {
      const { x, y } = getPositionCoords(player.position)
      const cellX = padding + x * cellSize + cellSize / 2
      const cellY = padding + y * cellSize + cellSize / 2

      // Offset players so they don't overlap
      const offsetX = (index % 2 === 0 ? -1 : 1) * (cellSize * 0.15)
      const offsetY = Math.floor(index / 2) * (cellSize * 0.15)

      // Draw player circle
      ctx.fillStyle = player.color
      ctx.beginPath()
      ctx.arc(cellX + offsetX, cellY + offsetY, 12, 0, Math.PI * 2)
      ctx.fill()

      // Draw border for current player
      if (index === currentPlayerIndex) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(cellX + offsetX, cellY + offsetY, 14, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [players, currentPlayerIndex])

  return (
    <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg"
      />
    </div>
  )
}

export default GameBoard
