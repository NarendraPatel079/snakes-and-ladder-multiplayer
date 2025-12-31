import { useState } from 'react'
import { PLAYER_COLORS } from '../constants/PlayerConstants'
import { ICONS_MAP } from '../constants/GameBoardConstants'

const PlayerSetup = ({ onStartGame }) => {
  const [numPlayers, setNumPlayers] = useState(2)
  const [enableBots, setEnableBots] = useState(false)
  const [players, setPlayers] = useState([
    { name: 'Player 1', color: PLAYER_COLORS[0], isBot: false },
    { name: 'Player 2', color: PLAYER_COLORS[1], isBot: false },
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
        isBot: players[i]?.isBot || false,
      })
    }
    setPlayers(newPlayers)
  }

  const handleToggleBot = (index) => {
    const newPlayers = [...players]
    newPlayers[index] = {
      ...newPlayers[index],
      isBot: !newPlayers[index].isBot,
      // Auto-generate bot name if switching to bot
      name: !newPlayers[index].isBot 
        ? `Bot ${index + 1}` 
        : `Player ${index + 1}`
    }
    setPlayers(newPlayers)
  }

  const handleEnableBotsToggle = () => {
    const newEnableBots = !enableBots
    setEnableBots(newEnableBots)
    
    // If disabling bots, remove bot flags from all players
    if (!newEnableBots) {
      const newPlayers = players.map((p, i) => ({
        ...p,
        isBot: false,
        name: p.isBot ? `Player ${i + 1}` : p.name
      }))
      setPlayers(newPlayers)
    }
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

      {/* Bot Players Toggle */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBots}
                onChange={handleEnableBotsToggle}
                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {`${ICONS_MAP.bot} Enable Bot Players`}
              </span>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-7">
              Play against AI opponents. Bots will automatically take their turns.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {players.slice(0, numPlayers).map((player, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all ${
              player.isBot
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-gray-300 dark:border-gray-700'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 relative">
                <div
                  className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: player.color }}
                />
                {player.isBot && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-300 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-100 dark:border-gray-400">
                    <span className="text-xs">{`${ICONS_MAP.bot}`}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  disabled={player.isBot}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    player.isBot ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  placeholder={player.isBot ? `Bot ${index + 1}` : `Player ${index + 1}`}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(index, color)}
                    disabled={player.isBot}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      player.color === color
                        ? 'border-gray-900 dark:border-gray-100 scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    } ${player.isBot ? 'opacity-60' : ''}`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
              {enableBots && (
                <div className="flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={player.isBot}
                      onChange={() => handleToggleBot(index)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bot
                    </span>
                  </label>
                </div>
              )}
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
