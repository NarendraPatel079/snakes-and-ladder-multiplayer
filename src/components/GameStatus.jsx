import { ICONS_MAP } from "../constants/GameBoardConstants"

const GameStatus = ({ players, currentPlayerIndex, lastDiceValue, lastMove, winner, extraTurn }) => {
  if (winner) {
    return (
      <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg text-center animate-pulse">
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Winner! 🎉</h2>
        <p className="text-xl text-white">
          <span
            className="font-bold px-3 py-1 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            {winner.name}
          </span>{' '}
          has won the game!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg shadow-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-none dark:shadow-lg">
        <p className="text-gray-900 dark:text-white font-semibold text-lg">
          Current Turn:{' '}
          <span
            className="px-3 py-1 rounded-lg inline-flex items-center gap-2 bg-gray-50 border-2 border-gray-200 dark:border-none dark:bg-white dark:bg-opacity-10"
            style={{ color: players[currentPlayerIndex]?.color }}
          >
            {players[currentPlayerIndex]?.isBot && <span>{`${ICONS_MAP.bot}`}</span>}
            {players[currentPlayerIndex]?.name}
          </span>
        </p>
        {extraTurn && (
          <div className="mt-2 p-2 bg-yellow-400 bg-opacity-80 rounded-lg animate-pulse">
            <p className="text-sm font-bold text-gray-900">
              {`${ICONS_MAP.dice} Rolled a 6! Extra turn! ${ICONS_MAP.dice}`}
            </p>
          </div>
        )}
      </div>

      {lastMove && lastDiceValue > 0 && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{lastMove.player.name}</span> rolled
            <span className="font-bold text-blue-600 dark:text-blue-400 px-1">
              {lastDiceValue}
            </span>
            {lastMove.snakeOrLadder && (
              <span>
                and{' '}
                {lastMove.snakeOrLadder.type === 'snake' ? ICONS_MAP.snake : ICONS_MAP.ladder}{' '}
                {lastMove.snakeOrLadder.type === 'snake'
                  ? 'slid down'
                  : 'climbed up'}{' '}
                to position{' '}
                <span className="font-bold">
                  {lastMove.snakeOrLadder.to}
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {players.map((player, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 ${
              index === currentPlayerIndex
                ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                {player.isBot && <span className="text-xs">{`${ICONS_MAP.bot}`}</span>}
                {player.name}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Position: <span className="font-bold">{player.position}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameStatus
