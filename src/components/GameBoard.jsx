import { useState, useRef, useMemo, useEffect } from 'react'
import { getPositionCoords, SNAKES, LADDERS, BOARD_SIZE } from '../utils/gameLogic'

const GameBoard = ({ players, currentPlayerIndex, winner }) => {
  const [hoveredCell, setHoveredCell] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const boardRef = useRef(null)
  const cellSize = 50
  const padding = 15

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
      left: `${padding + x * cellSize}px`,
      top: `${padding + y * cellSize}px`,
      width: `${cellSize}px`,
      height: `${cellSize}px`,
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

  // Get players at a position
  const getPlayersAtPosition = (position) => {
    return players
      .map((player, index) => ({ ...player, index }))
      .filter((player) => player.position === position)
  }

  // Snake color schemes and styles
  const snakeStyles = [
    { body: '#fbbf24', spots: '#f59e0b', expression: 'happy' }, // Yellow - happy
    { body: '#a78bfa', spots: '#8b5cf6', expression: 'dizzy' }, // Purple - dizzy
    { body: '#34d399', spots: '#10b981', expression: 'happy' }, // Green - happy
    { body: '#ec4899', spots: '#db2777', expression: 'loving' }, // Pink - loving (darker, more vibrant)
    { body: '#fbbf24', spots: '#f59e0b', expression: 'angry' }, // Yellow - angry
    { body: '#f87171', spots: '#ef4444', expression: 'happy' }, // Red - happy
    { body: '#60a5fa', spots: '#3b82f6', expression: 'happy' }, // Blue - happy
    { body: '#fb923c', spots: '#f97316', expression: 'angry' }, // Orange - angry
    { body: '#64748b', spots: '#475569', expression: 'happy' }, // Gray - happy (darker, more visible)
    { body: '#fbbf24', spots: '#f59e0b', expression: 'happy' }, // Yellow - happy
  ]

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
    
    const startX = padding + fromCoords.x * cellSize + cellSize / 2
    const startY = padding + fromCoords.y * cellSize + cellSize / 2
    const endX = padding + toCoords.x * cellSize + cellSize / 2
    const endY = padding + toCoords.y * cellSize + cellSize / 2
    
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2 - 35
    
    // Create curved path for snake body
    const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
    
    const style = snakeStyles[index % snakeStyles.length]
    const expression = style.expression
    
    // Calculate angle for head
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
    
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
    { color: '#92400e', railWidth: 7, rungWidth: 4 }, // Brown
    { color: '#dc2626', railWidth: 7, rungWidth: 4 }, // Red
    { color: '#fbbf24', railWidth: 7, rungWidth: 4 }, // Yellow
    { color: '#16a34a', railWidth: 7, rungWidth: 4 }, // Green
    { color: '#92400e', railWidth: 7, rungWidth: 4 }, // Brown
    { color: '#dc2626', railWidth: 7, rungWidth: 4 }, // Red
    { color: '#16a34a', railWidth: 7, rungWidth: 4 }, // Green
    { color: '#fbbf24', railWidth: 7, rungWidth: 4 }, // Yellow
    { color: '#92400e', railWidth: 7, rungWidth: 4 }, // Brown
  ]

  // Draw ladder SVG path with proper perpendicular offset for diagonal ladders
  const getLadderLines = (from, to) => {
    const fromCoords = getPositionCoords(from)
    const toCoords = getPositionCoords(to)
    
    const startX = padding + fromCoords.x * cellSize + cellSize / 2
    const startY = padding + fromCoords.y * cellSize + cellSize / 2
    const endX = padding + toCoords.x * cellSize + cellSize / 2
    const endY = padding + toCoords.y * cellSize + cellSize / 2
    
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

  return (
    <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div 
        ref={boardRef}
        className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 shadow-inner"
        style={{
          width: `${10 * cellSize + padding * 2}px`,
          height: `${10 * cellSize + padding * 2}px`,
          position: 'relative'
        }}
      >
        {/* SVG Layer for Snakes and Ladders - rendered above cells so paths are visible */}
        <svg
          width={10 * cellSize + padding * 2}
          height={10 * cellSize + padding * 2}
          className="absolute pointer-events-none"
          style={{ 
            zIndex: 4,
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
              animation: 'bounce 1s ease-in-out infinite'
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
              title={
                snakeOrLadder
                  ? `${snakeOrLadder.type === 'snake' ? 'Snake' : 'Ladder'}: ${snakeOrLadder.from} → ${snakeOrLadder.to}`
                  : `Position ${position}`
              }
            >
              {/* Cell number */}
              <span className="relative z-0">{position}</span>

              {/* Players */}
              {playersHere.map((player, playerIndex) => {
                const offsetX = (playerIndex % 2 === 0 ? -1 : 1) * (cellSize * 0.2)
                const offsetY = Math.floor(playerIndex / 2) * (cellSize * 0.2)
                const isCurrentPlayer = player.index === currentPlayerIndex
                
                return (
                  <div
                    key={`${player.index}-${position}`}
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: player.color,
                      border: isCurrentPlayer 
                        ? '3px solid #fbbf24' 
                        : '2px solid white',
                      boxShadow: isCurrentPlayer
                        ? '0 0 8px rgba(251, 191, 36, 0.8), 0 0 16px rgba(251, 191, 36, 0.4)'
                        : '0 2px 4px rgba(0, 0, 0, 0.2)',
                      left: `${cellSize / 2 + offsetX - 8}px`,
                      top: `${cellSize / 2 + offsetY - 8}px`,
                      zIndex: 5,
                      animation: isCurrentPlayer 
                        ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
                        : 'none',
                    }}
                    title={player.name}
                  />
                )
              })}

              {/* Hover tooltip */}
              {hoveredCell === position && (
                <div
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none shadow-lg"
                  style={{ zIndex: 20 }}
                >
                  <div className="font-bold">Position {position}</div>
                  {snakeOrLadder && (
                    <div className="block text-yellow-300 mt-1">
                      {snakeOrLadder.type === 'snake' ? '🐍 ↓ Snake' : '🪜 ↑ Ladder'} → {snakeOrLadder.to}
                    </div>
                  )}
                  {playersHere.length > 0 && (
                    <div className="block text-blue-300 mt-1">
                      👥 {playersHere.map(p => p.name).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GameBoard
