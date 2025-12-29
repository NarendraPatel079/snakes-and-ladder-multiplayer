import { useState } from 'react'
import { PLAYER_COLORS } from '../constants/PlayerConstants'

const PlayerSetup = ({ onStartGame }) => {
  const [numPlayers, setNumPlayers] = useState(2)
  const [players, setPlayers] = useState([
    { name: 'Player 1', color: PLAYER_COLORS[0] },
    { name: 'Player 2', color: PLAYER_COLORS[1] },
  ])

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const handleNumPlayersChange = (count) => {
    if (count < 2 || count > 6) return
    setNumPlayers(count)
    const newPlayers = []
    for (let i = 0; i < count; i++) {
      newPlayers.push({
        name: players[i]?.name || `Player ${i + 1}`,
        color: players[i]?.color || PLAYER_COLORS[i],
      })
    }
    setPlayers(newPlayers)
  }

  const handleColorChange = (index, color) => {
    // Check if color is already taken
    const isTaken = players.some((p, i) => i !== index && p.color === color)
    if (isTaken) {
      // Swap colors
      const otherIndex = players.findIndex((p, i) => i !== index && p.color === color)
      const newPlayers = [...players]
      const tempColor = newPlayers[index].color
      newPlayers[index].color = color
      newPlayers[otherIndex].color = tempColor
      setPlayers(newPlayers)
    } else {
      updatePlayer(index, 'color', color)
    }
  }

  const handleStart = () => {
    const validPlayers = players.slice(0, numPlayers).map((p) => ({
      ...p,
      position: 1,
    }))
    onStartGame(validPlayers)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Setup Players
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Number of Players (2-6)
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNumPlayersChange(numPlayers - 1)}
            disabled={numPlayers <= 2}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            −
          </button>
          <span className="text-xl font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">
            {numPlayers}
          </span>
          <button
            onClick={() => handleNumPlayersChange(numPlayers + 1)}
            disabled={numPlayers >= 6}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {players.slice(0, numPlayers).map((player, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: player.color }}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Player ${index + 1}`}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(index, color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      player.color === color
                        ? 'border-gray-900 dark:border-gray-100 scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Game
      </button>
    </div>
  )
}

export default PlayerSetup
