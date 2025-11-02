import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import PlayerSetup from './components/PlayerSetup'
import GameBoard from './components/GameBoard'
import Dice from './components/Dice'
import GameStatus from './components/GameStatus'
import { movePlayer, rollDice } from './utils/gameLogic'

function App() {
  const [gameState, setGameState] = useState('setup') // 'setup', 'playing', 'finished'
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [winner, setWinner] = useState(null)

  const handleStartGame = (gamePlayers) => {
    setPlayers(gamePlayers)
    setGameState('playing')
    setCurrentPlayerIndex(0)
    setDiceValue(0)
    setLastMove(null)
    setWinner(null)
  }

  const handleRollDice = () => {
    if (isRolling || gameState !== 'playing') return

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

      // Move player
      const currentPlayer = players[currentPlayerIndex]
      const result = movePlayer(currentPlayer.position, finalValue)

      const newPlayers = [...players]
      newPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        position: result.position,
      }
      setPlayers(newPlayers)

      setLastMove({
        player: currentPlayer,
        diceValue: finalValue,
        snakeOrLadder: result.snakeOrLadder,
        type: result.type,
      })

      // Check for win
      if (result.type === 'win') {
        setWinner(currentPlayer)
        setGameState('finished')
      } else {
        // Move to next player
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
      }
    }, 1500)
  }

  const handleNewGame = () => {
    setGameState('setup')
    setPlayers([])
    setCurrentPlayerIndex(0)
    setDiceValue(0)
    setLastMove(null)
    setWinner(null)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🐍 Snake & Ladder 🪜
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Multiplayer Board Game
              </p>
            </div>
            <ThemeToggle />
          </header>

          {/* Main Content */}
          {gameState === 'setup' ? (
            <PlayerSetup onStartGame={handleStartGame} />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Game Board - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <GameBoard
                  players={players}
                  currentPlayerIndex={currentPlayerIndex}
                />
              </div>

              {/* Game Controls - Takes 1 column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <Dice
                    value={diceValue}
                    isRolling={isRolling}
                    onRoll={handleRollDice}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <GameStatus
                    players={players}
                    currentPlayerIndex={currentPlayerIndex}
                    lastDiceValue={lastMove?.diceValue || 0}
                    lastMove={lastMove}
                    winner={winner}
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
