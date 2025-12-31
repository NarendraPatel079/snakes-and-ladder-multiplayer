import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import PlayerSetup from './components/PlayerSetup'
import GameBoard from './components/GameBoard'
import Dice from './components/Dice'
import GameStatus from './components/GameStatus'
import { movePlayer, rollDice, generateMovementPath } from './utils/gameLogic'
import { ICONS_MAP, BOARD_SIZE } from './constants/GameBoardConstants'
import { GAME_STATE } from './constants/PlayerConstants'

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.setup)
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [winner, setWinner] = useState(null)
  const [extraTurn, setExtraTurn] = useState(false) // Track if player got a 6 and has extra turn
  const [animatingPlayer, setAnimatingPlayer] = useState(null) // Track player being animated
  const [animationPath, setAnimationPath] = useState([]) // Path for step-by-step animation
  const [isAnimating, setIsAnimating] = useState(false) // Track if animation is in progress

  const handleStartGame = (gamePlayers) => {
    setPlayers(gamePlayers)
    setGameState(GAME_STATE.playing)
    setCurrentPlayerIndex(0)
    setDiceValue(0)
    setLastMove(null)
    setWinner(null)
    setExtraTurn(false)
  }

  const handleRollDice = () => {
    if (isRolling || gameState !== GAME_STATE.playing || isAnimating) return

    setIsRolling(true)
    setDiceValue(0)

    // Simulate dice rolling animation
    const rollInterval = setInterval(() => {
      setDiceValue(rollDice())
    }, 100)

    setTimeout(() => {
      clearInterval(rollInterval)
      const finalValue = rollDice()
      setDiceValue(finalValue)
      setIsRolling(false)

      // Move player with animation
      const currentPlayer = players[currentPlayerIndex]
      const result = movePlayer(currentPlayer.position, finalValue)
      
      // Calculate movement path for animation
      const startPos = currentPlayer.position
      const intermediatePos = startPos + finalValue
      const endPos = result.position
      
      // Generate path: start -> intermediate (dice roll) -> end (after snake/ladder if any)
      const path = []
      
      // Step 1: Move from start to intermediate position (dice roll)
      if (intermediatePos <= BOARD_SIZE) {
        const stepPath = generateMovementPath(startPos, intermediatePos)
        path.push(...stepPath.slice(1)) // Exclude start position
      }
      
      // Step 2: If there's a snake or ladder, animate to final position
      if (result.snakeOrLadder && intermediatePos !== endPos) {
        path.push(endPos)
      }
      
      // If no path (exceeded board), just update state without animation
      if (path.length === 0) {
        setLastMove({
          player: currentPlayer,
          diceValue: finalValue,
          snakeOrLadder: result.snakeOrLadder,
          type: result.type,
        })
        setIsRolling(false)
        return
      }
      
      // Start animation
      setIsAnimating(true)
      setAnimatingPlayer(currentPlayerIndex)
      setAnimationPath([startPos]) // Start with current position
      
      // Animate step by step
      let pathIndex = 0
      const animateStep = () => {
        if (pathIndex < path.length) {
          // Update animation path to show current position
          const currentPath = path.slice(0, pathIndex + 1)
          setAnimationPath(currentPath)
          
          // Update player position
          const newPlayers = [...players]
          newPlayers[currentPlayerIndex] = {
            ...currentPlayer,
            position: path[pathIndex],
          }
          setPlayers(newPlayers)
          
          pathIndex++
          
          // Check if this is the last step
          if (pathIndex >= path.length) {
            // Final position reached - wait a bit for animation to complete
            setTimeout(() => {
              const finalPlayers = [...players]
              finalPlayers[currentPlayerIndex] = {
                ...currentPlayer,
                position: endPos,
              }
              setPlayers(finalPlayers)
              
              setLastMove({
                player: currentPlayer,
                diceValue: finalValue,
                snakeOrLadder: result.snakeOrLadder,
                type: result.type,
              })

              // Check for win
              if (result.type === 'win') {
                setWinner(currentPlayer)
                setGameState(GAME_STATE.finished)
                setExtraTurn(false)
              } else {
                // Check if player rolled a 6 - they get an extra turn
                if (finalValue === 6) {
                  setExtraTurn(true)
                  // Don't move to next player - same player gets another turn
                } else {
                  // Move to next player only if not a 6
                  setExtraTurn(false)
                  setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
                }
              }
              
              // Reset animation state
              setIsAnimating(false)
              setAnimatingPlayer(null)
              setAnimationPath([])
            }, 400) // Wait for animation to complete
          } else {
            // Continue animation
            setTimeout(animateStep, 300) // 300ms per step
          }
        }
      }
      
      // Start animation after a short delay
      setTimeout(animateStep, 200)
    }, 1500)
  }

  const handleNewGame = () => {
    setGameState(GAME_STATE.setup)
    setPlayers([])
    setCurrentPlayerIndex(0)
    setDiceValue(0)
    setLastMove(null)
    setWinner(null)
    setExtraTurn(false)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {`${ICONS_MAP.snake} Snake & Ladder ${ICONS_MAP.ladder}`}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Multiplayer Board Game
              </p>
            </div>
            <ThemeToggle />
          </header>

          {/* Main Content */}
          {gameState === GAME_STATE.setup ? (
            <PlayerSetup onStartGame={handleStartGame} />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Game Board - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <GameBoard
                  players={players}
                  currentPlayerIndex={currentPlayerIndex}
                  winner={winner}
                  animatingPlayer={animatingPlayer}
                  animationPath={animationPath}
                  isAnimating={isAnimating}
                />
              </div>

              {/* Game Controls - Takes 1 column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <Dice
                    value={diceValue}
                    isRolling={isRolling}
                    onRoll={handleRollDice}
                    winner={winner}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <GameStatus
                    players={players}
                    currentPlayerIndex={currentPlayerIndex}
                    lastDiceValue={lastMove?.diceValue || 0}
                    lastMove={lastMove}
                    winner={winner}
                    extraTurn={extraTurn}
                  />
                </div>

                <button
                  onClick={handleNewGame}
                  className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  New Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
