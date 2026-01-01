import { useState, useRef, useMemo, useEffect } from 'react'
import { getPositionCoords } from '../utils/gameLogic'
import { BOARD_SIZE, BOARD_CELL_SIZE, BOARD_PADDING, ICONS_MAP, SNAKES, LADDERS, SNAKE_STYLES } from '../constants/GameBoardConstants'

const GameBoard = ({ players, currentPlayerIndex, winner, animatingPlayer, animationPath, isAnimating }) => {
  const [hoveredCell, setHoveredCell] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const boardRef = useRef(null)
  
  // Get animated position for player being animated
  const getAnimatedPosition = (player, playerIndex) => {
    if (animatingPlayer === playerIndex && animationPath.length > 0) {
      // Return the current position in the animation path
      return animationPath[animationPath.length - 1]
    }
    return player.position
  }
  
  // Check if player is on a ladder or snake during animation
  const getAnimationType = (player, playerIndex) => {
    if (animatingPlayer === playerIndex && animationPath.length > 1) {
      const currentPos = animationPath[animationPath.length - 1]
      const previousPos = animationPath[animationPath.length - 2]
      
      // Check if we're moving from a snake head (sliding down)
      const snake = SNAKES.find(([top]) => top === previousPos)
      if (snake && currentPos === snake[1]) return 'sliding'
      
      // Check if we're moving from a ladder bottom (climbing up)
      const ladder = LADDERS.find(([bottom]) => bottom === previousPos)
      if (ladder && currentPos === ladder[1]) return 'climbing'
      
      return 'walking'
    }
    return null
  }
  

  // Track dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  // Create board grid (10x10)
  const boardGrid = useMemo(() => {
    const grid = []
    for (let pos = 1; pos <= BOARD_SIZE; pos++) {
      const { x, y } = getPositionCoords(pos)
      grid.push({ position: pos, x, y })
    }
    return grid
  }, [])

  // Get cell style for a position
  const getCellStyle = (position, x, y) => {
    const isEvenCell = (x + y) % 2 === 0
    let backgroundColor
    
    // Determine background color
    if (position === 1) {
      backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    } else if (position === 100) {
      backgroundColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    } else if (isEvenCell) {
      backgroundColor = isDarkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    } else {
      backgroundColor = isDarkMode
        ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
    }
    
    const baseStyle = {
      position: 'absolute',
      left: `${BOARD_PADDING + x * BOARD_CELL_SIZE}px`,
      top: `${BOARD_PADDING + y * BOARD_CELL_SIZE}px`,
      width: `${BOARD_CELL_SIZE}px`,
      height: `${BOARD_CELL_SIZE}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '600',
      fontSize: '12px',
      zIndex: 1,
      background: backgroundColor,
      color: isEvenCell 
        ? (isDarkMode ? '#cbd5e1' : '#475569')
        : (isDarkMode ? '#94a3b8' : '#64748b'),
    }

    // Special styling for start and end
    if (position === 1 || position === 100) {
      baseStyle.color = 'white'
      baseStyle.fontWeight = 'bold'
      if (position === 100) {
        baseStyle.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)'
      }
    }

    // Hover effect
    if (hoveredCell === position) {
      baseStyle.transform = 'scale(1.1)'
      baseStyle.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)'
      baseStyle.zIndex = 15
    }

    return baseStyle
  }

  // Check if position has snake or ladder (both start and end)
  const getSnakeOrLadderForPosition = (position) => {
    // Check if position is start of snake
    const snakeStart = SNAKES.find(([top]) => top === position)
    if (snakeStart) return { type: 'snake', from: snakeStart[0], to: snakeStart[1], isStart: true }
    
    // Check if position is end of snake
    const snakeEnd = SNAKES.find(([, bottom]) => bottom === position)
    if (snakeEnd) return { type: 'snake', from: snakeEnd[0], to: snakeEnd[1], isStart: false }
    
    // Check if position is start of ladder
    const ladderStart = LADDERS.find(([bottom]) => bottom === position)
    if (ladderStart) return { type: 'ladder', from: ladderStart[0], to: ladderStart[1], isStart: true }
    
    // Check if position is end of ladder
    const ladderEnd = LADDERS.find(([, top]) => top === position)
    if (ladderEnd) return { type: 'ladder', from: ladderEnd[0], to: ladderEnd[1], isStart: false }
    
    return null
  }

  // Get players at a position (including animated position)
  const getPlayersAtPosition = (position) => {
    return players
      .map((player, index) => ({ ...player, index }))
      .filter((player) => {
        const displayPosition = getAnimatedPosition(player, player.index)
        return displayPosition === position
      })
  }

  // Calculate point on quadratic Bezier curve at parameter t (0 to 1)
  const getPointOnQuadraticCurve = (t, x0, y0, cx, cy, x1, y1) => {
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1
    const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1
    return { x, y }
  }

  // Calculate tangent vector on quadratic Bezier curve at parameter t
  const getTangentOnQuadraticCurve = (t, x0, y0, cx, cy, x1, y1) => {
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx)
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
    const length = Math.sqrt(dx * dx + dy * dy)
    return { dx: length > 0 ? dx / length : 0, dy: length > 0 ? dy / length : 1 }
  }

  // Draw cartoon snake with expression
  const renderCartoonSnake = (from, to, index) => {
    const fromCoords = getPositionCoords(from)
    const toCoords = getPositionCoords(to)
    
    const startX = BOARD_PADDING + fromCoords.x * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const startY = BOARD_PADDING + fromCoords.y * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const endX = BOARD_PADDING + toCoords.x * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const endY = BOARD_PADDING + toCoords.y * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2 - 35
    
    // Create curved path for snake body
    const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
    
    const style = SNAKE_STYLES[index % SNAKE_STYLES.length]
    const expression = style.expression
    
    // Calculate angle for head
    const angle = Math.atan2(endY - startY, endX - startX) * 45 / Math.PI
    
    return { 
      path, 
      startX, 
      startY, 
      endX, 
      endY, 
      midX, 
      midY,
      style, 
      expression, 
      angle 
    }
  }

  // Ladder color schemes
  const ladderStyles = [
    { color: '#896047', railWidth: 7, rungWidth: 4 }, // Dark Oak
    { color: '#8396BC', railWidth: 7, rungWidth: 4 }, // Serene Blue
    { color: '#78746A', railWidth: 7, rungWidth: 4 }, // Romantic Grey
    { color: '#838D9A', railWidth: 7, rungWidth: 4 }, // Mountain
    { color: '#896047', railWidth: 7, rungWidth: 4 }, // Dark Oak
    { color: '#8396BC', railWidth: 7, rungWidth: 4 }, // Serene Blue
    { color: '#838D9A', railWidth: 7, rungWidth: 4 }, // Mountain
    { color: '#78746A', railWidth: 7, rungWidth: 4 }, // Romantic Grey
    { color: '#896047', railWidth: 7, rungWidth: 4 }, // Dark Oak
  ]

  // Draw ladder SVG path with proper perpendicular offset for diagonal ladders
  const getLadderLines = (from, to) => {
    const fromCoords = getPositionCoords(from)
    const toCoords = getPositionCoords(to)
    
    const startX = BOARD_PADDING + fromCoords.x * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const startY = BOARD_PADDING + fromCoords.y * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const endX = BOARD_PADDING + toCoords.x * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    const endY = BOARD_PADDING + toCoords.y * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2
    
    // Calculate the direction vector
    const dx = endX - startX
    const dy = endY - startY
    const length = Math.sqrt(dx * dx + dy * dy)
    
    // Calculate perpendicular offset (90 degrees rotation)
    // For a vector (dx, dy), the perpendicular is (-dy, dx) or (dy, -dx)
    // Normalize and scale by offset distance
    const offset = 8
    const perpX = length > 0 ? (-dy / length) * offset : 0
    const perpY = length > 0 ? (dx / length) * offset : offset
    
    return {
      left: { 
        x1: startX + perpX, 
        y1: startY + perpY, 
        x2: endX + perpX, 
        y2: endY + perpY 
      },
      right: { 
        x1: startX - perpX, 
        y1: startY - perpY, 
        x2: endX - perpX, 
        y2: endY - perpY 
      },
      startX,
      startY,
      endX,
      endY
    }
  }

  // Get the hover tooltip message for the cell
  const getHoverTooltipMessage = ({ position, snakeOrLadder, playersHere }) => {
    let direction = ICONS_MAP.down;
    let toPosition = snakeOrLadder?.to;
    if (snakeOrLadder?.type !== 'snake') {
      if (position === snakeOrLadder?.to) {
        toPosition = snakeOrLadder?.from;
      } else {
        direction = ICONS_MAP.up;
      }
    } else if (snakeOrLadder?.type === 'snake') {
      if (position === snakeOrLadder?.to) {
        direction = ICONS_MAP.up;
        toPosition = snakeOrLadder?.from;
      }
    }
    let topStyle = '-top-8';
    if (snakeOrLadder && playersHere.length > 0) {
      topStyle = '-top-16';
    } else if (snakeOrLadder || playersHere.length > 0) {
      topStyle = '-top-12';
    }
    return hoveredCell === position ? (
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none shadow-lg ${topStyle}`}
        style={{ zIndex: 20 }}
      >
        <div className="font-bold">Position {position}</div>
        {snakeOrLadder && (
          <div className="block text-yellow-300 mt-1">
            {snakeOrLadder.type === 'snake' ? `${ICONS_MAP.snake} ${direction} Snake` : `${ICONS_MAP.ladder} ${direction} Ladder`} → {toPosition}
          </div>
        )}
        {playersHere.length > 0 && (
          <div className="block text-blue-300 mt-1">
            {ICONS_MAP.player} {playersHere.map(p => p.name).join(', ')}
          </div>
        )}
      </div>
    ) : '';
  }

  return (
    <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div 
        ref={boardRef}
        className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 shadow-inner"
        style={{
          width: `${((10 * BOARD_CELL_SIZE + BOARD_PADDING * 2) + 90)}px`,
          height: `${((10 * BOARD_CELL_SIZE + BOARD_PADDING * 2) + 90)}px`,
          position: 'relative'
        }}
      >
        <div style={{
          width: `${((10 * BOARD_CELL_SIZE + BOARD_PADDING * 2) + 90)}px`,
          position: 'relative',
          top: '45px',
          left: '45px',
        }}>
            {/* SVG Layer for Snakes and Ladders - rendered above cells so paths are visible */}
            <svg
              width={10 * BOARD_CELL_SIZE + BOARD_PADDING * 2}
              height={10 * BOARD_CELL_SIZE + BOARD_PADDING * 2}
              className="absolute pointer-events-none"
              style={{ 
                zIndex: 2,
                top: 0,
                left: 0
              }}
            >
            {/* Draw Enhanced Cartoon Snakes */}
            {SNAKES.map(([top, bottom], index) => {
              const snake = renderCartoonSnake(top, bottom, index)
              const { path, startX, startY, endX, endY, midX, midY, style, expression, angle } = snake
              
              // Create gradient ID for each snake
              const gradientId = `snakeGradient-${index}`
              
              return (
                <g key={`snake-${index}`}>
                  <defs>
                    {/* Snake body gradient - using gradientUnits for proper scaling */}
                    <linearGradient 
                      id={gradientId} 
                      x1="0%" 
                      y1="0%" 
                      x2="100%" 
                      y2="100%"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor={style.body} stopOpacity="1" />
                      <stop offset="50%" stopColor={style.spots} stopOpacity="1" />
                      <stop offset="100%" stopColor={style.body} stopOpacity="1" />
                    </linearGradient>
                    
                    {/* Snake pattern/stripes gradient */}
                    <linearGradient id={`snakePattern-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={style.body} stopOpacity="0.3" />
                      <stop offset="50%" stopColor={style.body} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={style.body} stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  
                  {/* Main snake body - solid color base layer for visibility */}
                  <path
                    d={path}
                    fill="none"
                    stroke={style.body}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))'
                    }}
                  />
                  {/* Gradient overlay for depth */}
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Body segments/rings for texture - positioned on the curved path */}
                  {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t, i) => {
                    // Get point on the actual curved path
                    const point = getPointOnQuadraticCurve(t, startX, startY, midX, midY, endX, endY)
                    
                    // Get tangent vector to calculate rotation angle
                    const tangent = getTangentOnQuadraticCurve(t, startX, startY, midX, midY, endX, endY)
                    const segmentAngle = Math.atan2(tangent.dy, tangent.dx) * 180 / Math.PI
                    
                    return (
                      <ellipse
                        key={`segment-${i}`}
                        id={`segment-${i}`}
                        cx={point.x}
                        cy={point.y}
                        rx="5"
                        ry="7"
                        fill={style.spots}
                        fillOpacity="0.6"
                        stroke={style.body}
                        strokeWidth="1.5"
                        transform={`rotate(${segmentAngle} ${point.x} ${point.y})`}
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                        }}
                      />
                    )
                  })}
                  
                  {/* Enhanced snake head with gradient and details */}
                  <g transform={`translate(${startX}, ${startY}) rotate(${angle})`}>
                    <defs>
                      <linearGradient id={`headGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={style.body} stopOpacity="1" />
                        <stop offset="100%" stopColor={style.spots} stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    
                    {/* Head shadow/back layer */}
                    <ellipse
                      cx="1"
                      cy="1"
                      rx="13"
                      ry="11"
                      fill="#1f2937"
                      fillOpacity="0.2"
                    />
                    
                    {/* Head base with gradient */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="14"
                      ry="12"
                      fill={`url(#headGradient-${index})`}
                      stroke="#1f2937"
                      strokeWidth="2.5"
                      style={{
                        filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.6))'
                      }}
                    />
                    
                    {/* Head highlight */}
                    <ellipse
                      cx="-4"
                      cy="-4"
                      rx="6"
                      ry="5"
                      fill="white"
                      fillOpacity="0.3"
                    />
                    
                    {/* Expression eyes with more detail */}
                    {expression === 'happy' && (
                      <>
                        {/* Eye whites */}
                        <ellipse cx="-7" cy="-3" rx="4" ry="3" fill="white" stroke="#1f2937" strokeWidth="1.5" />
                        <ellipse cx="7" cy="-3" rx="4" ry="3" fill="white" stroke="#1f2937" strokeWidth="1.5" />
                        {/* Eye pupils */}
                        <circle cx="-7" cy="-3" r="2" fill="#1f2937" />
                        <circle cx="7" cy="-3" r="2" fill="#1f2937" />
                        {/* Eye shine */}
                        <circle cx="-6.5" cy="-3.5" r="0.8" fill="white" />
                        <circle cx="7.5" cy="-3.5" r="0.8" fill="white" />
                        {/* Happy eyebrows */}
                        <path d="M -9 -6 Q -7 -8 -5 -6" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 5 -6 Q 7 -8 9 -6" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Smile */}
                        <path d="M -5 3 Q 0 6 5 3" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      </>
                    )}
                    
                    {expression === 'angry' && (
                      <>
                        {/* Angry eyebrows */}
                        <line x1="-8" y1="-7" x2="-5" y2="-5" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="8" y1="-7" x2="5" y2="-5" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Angry eyes */}
                        <ellipse cx="-7" cy="-3" rx="3.5" ry="2.5" fill="#dc2626" stroke="#1f2937" strokeWidth="1.5" />
                        <ellipse cx="7" cy="-3" rx="3.5" ry="2.5" fill="#dc2626" stroke="#1f2937" strokeWidth="1.5" />
                        <line x1="-9" y1="-3" x2="-5" y2="-3" stroke="#1f2937" strokeWidth="2" />
                        <line x1="9" y1="-3" x2="5" y2="-3" stroke="#1f2937" strokeWidth="2" />
                        {/* Frown */}
                        <path d="M -4 4 Q 0 2 4 4" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      </>
                    )}
                    
                    {expression === 'dizzy' && (
                      <>
                        {/* Dizzy eye circles */}
                        <circle cx="-6" cy="-3" r="4" fill="white" stroke="#1f2937" strokeWidth="2" />
                        <circle cx="6" cy="-3" r="4" fill="white" stroke="#1f2937" strokeWidth="2" />
                        {/* Spiral eyes */}
                        <path d="M -6 -3 Q -6 -5 -4 -5 Q -2 -5 -2 -3 Q -2 -1 -4 -1 Q -6 -1 -6 -3" 
                              stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 6 -3 Q 6 -5 4 -5 Q 2 -5 2 -3 Q 2 -1 4 -1 Q 6 -1 6 -3" 
                              stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Confused mouth */}
                        <path d="M -3 3 Q 0 5 3 3" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </>
                    )}
                    
                    {expression === 'loving' && (
                      <>
                        {/* Heart eyes - left */}
                        <path d="M -6 -5 Q -6 -7 -4 -7 Q -2 -7 -2 -5 Q -2 -3 -4 -1 Q -6 -3 -6 -5" 
                              fill="#ec4899" stroke="#1f2937" strokeWidth="1.5" />
                        {/* Heart eyes - right */}
                        <path d="M 6 -5 Q 6 -7 4 -7 Q 2 -7 2 -5 Q 2 -3 4 -1 Q 6 -3 6 -5" 
                              fill="#ec4899" stroke="#1f2937" strokeWidth="1.5" />
                        {/* Heart shine */}
                        <circle cx="-5" cy="-5" r="1.5" fill="white" fillOpacity="0.7" />
                        <circle cx="5" cy="-5" r="1.5" fill="white" fillOpacity="0.7" />
                        {/* Smile */}
                        <path d="M -4 3 Q 0 6 4 3" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </>
                    )}
                    
                    {/* Forked tongue */}
                    {expression !== 'angry' && (
                      <g>
                        <path d="M 0 8 L -3 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                        <path d="M 0 8 L 3 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                      </g>
                    )}
                    
                    {/* Angry tongue */}
                    {expression === 'angry' && (
                      <path d="M 0 8 Q -2 10 0 12 Q 2 10 0 8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
                    )}
                  </g>
                  
                  {/* Enhanced snake tail with segments */}
                  <g transform={`translate(${endX}, ${endY})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="8"
                      fill={style.spots}
                      stroke="#1f2937"
                      strokeWidth="2.5"
                      style={{
                        filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))'
                      }}
                    />
                    {/* Tail tip */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="5"
                      ry="8"
                      fill={style.body}
                      fillOpacity="0.7"
                    />
                    {/* Tail rings */}
                    <circle
                      cx="0"
                      cy="0"
                      r="4"
                      fill="none"
                      stroke={style.body}
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />
                  </g>
                </g>
              )
            })}

            {/* Draw Detailed Ladders */}
            {LADDERS.map(([bottom, top], index) => {
              const ladder = getLadderLines(bottom, top)
              const steps = Math.max(6, Math.floor(Math.sqrt((ladder.endX - ladder.startX) ** 2 + (ladder.endY - ladder.startY) ** 2) / 8))
              const ladderStyle = ladderStyles[index % ladderStyles.length]
              
              return (
                <g key={`ladder-${index}`}>
                  {/* Left rail */}
                  <line
                    x1={ladder.left.x1}
                    y1={ladder.left.y1}
                    x2={ladder.left.x2}
                    y2={ladder.left.y2}
                    stroke={ladderStyle.color}
                    strokeWidth={ladderStyle.railWidth}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))'
                    }}
                  />
                  
                  {/* Right rail */}
                  <line
                    x1={ladder.right.x1}
                    y1={ladder.right.y1}
                    x2={ladder.right.x2}
                    y2={ladder.right.y2}
                    stroke={ladderStyle.color}
                    strokeWidth={ladderStyle.railWidth}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))'
                    }}
                  />
                  
                  {/* Rungs with rivets */}
                  {Array.from({ length: steps }, (_, i) => {
                    const t = (i + 1) / (steps + 1)
                    const x1 = ladder.left.x1 + (ladder.left.x2 - ladder.left.x1) * t
                    const y1 = ladder.left.y1 + (ladder.left.y2 - ladder.left.y1) * t
                    const x2 = ladder.right.x1 + (ladder.right.x2 - ladder.right.x1) * t
                    const y2 = ladder.right.y1 + (ladder.right.y2 - ladder.right.y1) * t
                    
                    // Slight angle variation for some rungs (deterministic based on index)
                    const angleVariation = index % 3 === 0 ? ((i % 3) - 1) * 0.8 : 0
                    const offsetY1 = angleVariation
                    const offsetY2 = -angleVariation
                    
                    return (
                      <g key={`rung-${i}`}>
                        {/* Rung */}
                        <line
                          x1={x1}
                          y1={y1 + offsetY1}
                          x2={x2}
                          y2={y2 + offsetY2}
                          stroke={ladderStyle.color}
                          strokeWidth={ladderStyle.rungWidth}
                          strokeLinecap="round"
                          style={{
                            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))'
                          }}
                        />
                        
                        {/* Rivets/Nails */}
                        <circle
                          cx={x1}
                          cy={y1 + offsetY1}
                          r="2"
                          fill="#9ca3af"
                          stroke="#4b5563"
                          strokeWidth="0.5"
                          style={{
                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                          }}
                        />
                        <circle
                          cx={x2}
                          cy={y2 + offsetY2}
                          r="2"
                          fill="#9ca3af"
                          stroke="#4b5563"
                          strokeWidth="0.5"
                          style={{
                            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                          }}
                        />
                      </g>
                    )
                  })}
                  
                  {/* Top and bottom rivets */}
                  <circle
                    cx={ladder.left.x1}
                    cy={ladder.left.y1}
                    r="2.5"
                    fill="#9ca3af"
                    stroke="#4b5563"
                    strokeWidth="0.5"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
                  />
                  <circle
                    cx={ladder.right.x1}
                    cy={ladder.right.y1}
                    r="2.5"
                    fill="#9ca3af"
                    stroke="#4b5563"
                    strokeWidth="0.5"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
                  />
                  <circle
                    cx={ladder.left.x2}
                    cy={ladder.left.y2}
                    r="2.5"
                    fill="#9ca3af"
                    stroke="#4b5563"
                    strokeWidth="0.5"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
                  />
                  <circle
                    cx={ladder.right.x2}
                    cy={ladder.right.y2}
                    r="2.5"
                    fill="#9ca3af"
                    stroke="#4b5563"
                    strokeWidth="0.5"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
                  />
                </g>
              )
            })}
          </svg>

          {/* Winner Badge */}
          {winner && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              style={{
                animation: 'bounce 1s ease-in-out infinite',
                top: '45px',
              }}
            >
              <svg width="180" height="200" viewBox="0 0 180 200" className="drop-shadow-2xl">
                {/* Badge circle with serrated edge */}
                <defs>
                  <linearGradient id="winnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Serrated circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="65"
                  fill="url(#winnerGradient)"
                  stroke="#92400e"
                  strokeWidth="4"
                  filter="url(#glow)"
                />
                
                {/* Serrated edge pattern */}
                {Array.from({ length: 20 }, (_, i) => {
                  const angle = (i * 18) * Math.PI / 180
                  const x1 = 90 + Math.cos(angle) * 65
                  const y1 = 90 + Math.sin(angle) * 65
                  const x2 = 90 + Math.cos(angle) * 70
                  const y2 = 90 + Math.sin(angle) * 70
                  return (
                    <line
                      key={`serration-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#92400e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )
                })}
                
                {/* WINNER! text */}
                <text
                  x="90"
                  y="105"
                  textAnchor="middle"
                  fill="white"
                  fontSize="28"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  transform="rotate(-5 90 105)"
                  style={{
                    filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  WINNER!
                </text>
                
                {/* Ribbons */}
                <path
                  d="M 70 150 Q 70 160 60 165 Q 50 170 50 180 L 90 180 L 90 150 Z"
                  fill="#fbbf24"
                  stroke="#92400e"
                  strokeWidth="2"
                />
                <path
                  d="M 110 150 Q 110 160 120 165 Q 130 170 130 180 L 90 180 L 90 150 Z"
                  fill="#fbbf24"
                  stroke="#92400e"
                  strokeWidth="2"
                />
                
                {/* Ribbon highlights */}
                <path
                  d="M 70 155 Q 75 160 65 162"
                  fill="#fcd34d"
                  opacity="0.6"
                />
                <path
                  d="M 110 155 Q 105 160 115 162"
                  fill="#fcd34d"
                  opacity="0.6"
                />
              </svg>
            </div>
          )}

          {/* Board Cells */}
          {boardGrid.map(({ position, x, y }) => {
            const playersHere = getPlayersAtPosition(position)
            const snakeOrLadder = getSnakeOrLadderForPosition(position)
            
            return (
              <div
                key={position}
                style={getCellStyle(position, x, y)}
                onMouseEnter={() => setHoveredCell(position)}
                onMouseLeave={() => setHoveredCell(null)}
                className="group game-cell"
              >
                {/* Cell number */}
                <span className="relative z-0">{position}</span>

                {/* Hover tooltip */}
                {getHoverTooltipMessage({ position, snakeOrLadder, playersHere })}
              </div>
            )
          })}

          {/* Player Icons Layer - rendered separately above everything with animation support */}
          {players.map((player, playerIndex) => {
            const displayPosition = getAnimatedPosition(player, playerIndex)
            const { x, y } = getPositionCoords(displayPosition)
            const animationType = getAnimationType(player, playerIndex)
            const isAnimatingThisPlayer = animatingPlayer === playerIndex && isAnimating
            
            // Get other players at the same position for offset calculation
            const playersAtSamePos = players.filter((p, idx) => {
              const pPos = getAnimatedPosition(p, idx)
              return pPos === displayPosition && idx < playerIndex
            })
            
            const offsetX = (playersAtSamePos.length % 2 === 0 ? -1 : 1) * (BOARD_CELL_SIZE * 0.2)
            const offsetY = Math.floor(playersAtSamePos.length / 2) * (BOARD_CELL_SIZE * 0.2)
            const isCurrentPlayer = playerIndex === currentPlayerIndex
            const playerSize = isCurrentPlayer ? 24 : 20
            
            // Calculate absolute position on board
            const absoluteX = BOARD_PADDING + x * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2 + offsetX
            const absoluteY = BOARD_PADDING + y * BOARD_CELL_SIZE + BOARD_CELL_SIZE / 2 + offsetY
            
            // Animation styles
            let animationStyle = {}
            let animationClass = ''
            if (isAnimatingThisPlayer) {
              if (animationType === 'climbing') {
                animationClass = 'climb-ladder'
                animationStyle = {
                  animation: 'climb-ladder 0.8s ease-in-out',
                }
              } else if (animationType === 'sliding') {
                animationClass = 'slide-snake'
                animationStyle = {
                  animation: 'slide-snake 0.8s ease-in-out',
                }
              } else {
                animationClass = 'walk-step'
                animationStyle = {
                  animation: 'walk-step 0.3s ease-in-out',
                }
              }
            }
            
            return (
              <svg
                key={`player-${playerIndex}`}
                className={`absolute transition-all duration-300 cursor-pointer player-icon ${animationClass}`}
                style={{
                  left: `${absoluteX - playerSize / 2}px`,
                  top: `${absoluteY - playerSize / 2}px`,
                  width: `${playerSize}px`,
                  height: `${playerSize}px`,
                  zIndex: 50,
                  pointerEvents: 'auto',
                  transition: isAnimatingThisPlayer ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease',
                  ...animationStyle,
                  filter: isCurrentPlayer
                    ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.5)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))'
                    : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))',
                  animation: isAnimatingThisPlayer 
                    ? undefined 
                    : (isCurrentPlayer 
                      ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
                      : 'player-bounce 2s ease-in-out infinite'),
                  transform: isAnimatingThisPlayer 
                    ? animationStyle.transform 
                    : (isCurrentPlayer ? 'scale(1.1)' : 'scale(1)'),
                }}
                title={`${player.name}${player.isBot ? ' (Bot)' : ''}`}
                onMouseEnter={(e) => {
                  if (!isCurrentPlayer && !isAnimatingThisPlayer) {
                    e.currentTarget.style.animation = 'player-hover 0.5s ease-in-out infinite'
                    e.currentTarget.style.transform = 'scale(1.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPlayer && !isAnimatingThisPlayer) {
                    e.currentTarget.style.animation = 'player-bounce 2s ease-in-out infinite'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {(() => {
                  const expression = isCurrentPlayer ? 'happy' : 'neutral'
                  
                  return (
                    <>
                      <defs>
                        {/* Player gradient */}
                        <radialGradient id={`playerGradient-${playerIndex}`}>
                          <stop offset="0%" stopColor={player.color} stopOpacity="1" />
                          <stop offset="70%" stopColor={player.color} stopOpacity="0.9" />
                          <stop offset="100%" stopColor={player.color} stopOpacity="0.7" />
                        </radialGradient>
                      </defs>
                      
                      {/* Player body circle with gradient */}
                      <circle
                        cx={playerSize / 2}
                        cy={playerSize / 2}
                        r={playerSize / 2 - 2}
                        fill={`url(#playerGradient-${playerIndex})`}
                        stroke={isCurrentPlayer ? '#fbbf24' : '#ffffff'}
                        strokeWidth={isCurrentPlayer ? '3' : '2'}
                      />
                      
                      {/* Highlight shine */}
                      <ellipse
                        cx={playerSize / 2 - 3}
                        cy={playerSize / 2 - 3}
                        rx={playerSize / 4}
                        ry={playerSize / 5}
                        fill="white"
                        fillOpacity="0.4"
                      />
                      
                      {/* Face expression */}
                      {expression === 'happy' && (
                        <>
                          {/* Happy eyes */}
                          <ellipse
                            cx={playerSize / 2 - 4}
                            cy={playerSize / 2 - 2}
                            rx="2"
                            ry="2.5"
                            fill="white"
                            stroke="#1f2937"
                            strokeWidth="0.8"
                          />
                          <ellipse
                            cx={playerSize / 2 + 4}
                            cy={playerSize / 2 - 2}
                            rx="2"
                            ry="2.5"
                            fill="white"
                            stroke="#1f2937"
                            strokeWidth="0.8"
                          />
                          {/* Eye pupils */}
                          <circle
                            cx={playerSize / 2 - 4}
                            cy={playerSize / 2 - 2}
                            r="1.2"
                            fill="#1f2937"
                          />
                          <circle
                            cx={playerSize / 2 + 4}
                            cy={playerSize / 2 - 2}
                            r="1.2"
                            fill="#1f2937"
                          />
                          {/* Eye shine */}
                          <circle
                            cx={playerSize / 2 - 3.5}
                            cy={playerSize / 2 - 2.5}
                            r="0.5"
                            fill="white"
                          />
                          <circle
                            cx={playerSize / 2 + 4.5}
                            cy={playerSize / 2 - 2.5}
                            r="0.5"
                            fill="white"
                          />
                          {/* Happy smile */}
                          <path
                            d={`M ${playerSize / 2 - 4} ${playerSize / 2 + 3} Q ${playerSize / 2} ${playerSize / 2 + 6} ${playerSize / 2 + 4} ${playerSize / 2 + 3}`}
                            stroke="#1f2937"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </>
                      )}
                      
                      {expression === 'neutral' && (
                        <>
                          {/* Neutral eyes */}
                          <ellipse
                            cx={playerSize / 2 - 4}
                            cy={playerSize / 2 - 1}
                            rx="2"
                            ry="2"
                            fill="white"
                            stroke="#1f2937"
                            strokeWidth="0.8"
                          />
                          <ellipse
                            cx={playerSize / 2 + 4}
                            cy={playerSize / 2 - 1}
                            rx="2"
                            ry="2"
                            fill="white"
                            stroke="#1f2937"
                            strokeWidth="0.8"
                          />
                          {/* Eye pupils */}
                          <circle
                            cx={playerSize / 2 - 4}
                            cy={playerSize / 2 - 1}
                            r="1"
                            fill="#1f2937"
                          />
                          <circle
                            cx={playerSize / 2 + 4}
                            cy={playerSize / 2 - 1}
                            r="1"
                            fill="#1f2937"
                          />
                          {/* Eye shine */}
                          <circle
                            cx={playerSize / 2 - 3.5}
                            cy={playerSize / 2 - 1.5}
                            r="0.4"
                            fill="white"
                          />
                          <circle
                            cx={playerSize / 2 + 4.5}
                            cy={playerSize / 2 - 1.5}
                            r="0.4"
                            fill="white"
                          />
                          {/* Neutral mouth */}
                          <line
                            x1={playerSize / 2 - 3}
                            y1={playerSize / 2 + 4}
                            x2={playerSize / 2 + 3}
                            y2={playerSize / 2 + 4}
                            stroke="#1f2937"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </>
                      )}
                      
                      {/* Current player indicator ring */}
                      {isCurrentPlayer && (
                        <circle
                          cx={playerSize / 2}
                          cy={playerSize / 2}
                          r={playerSize / 2 + 2}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2"
                          strokeDasharray="3,3"
                          opacity="0.8"
                        />
                      )}
                    </>
                  )
                })()}
              </svg>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GameBoard
