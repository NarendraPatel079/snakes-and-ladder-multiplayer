import { ICONS_MAP } from "../constants/GameBoardConstants"

const Dice = ({ value, isRolling, onRoll, winner, isBotTurn }) => {
  const getDiceFace = (value) => {
    const dots = {
      1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
      2: [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
      3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      4: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
      5: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
      6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]],
    }
    return dots[value] || dots[1]
  }

  const face = getDiceFace(value)

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-24 h-24 bg-white dark:bg-gray-700 border-4 border-gray-800 dark:border-gray-200 rounded-xl shadow-xl p-2 ${
          isRolling ? 'animate-spin' : ''
        }`}
      >
        <div className="grid grid-cols-3 h-full w-full gap-1">
          {face.map((row, rowIndex) =>
            row.map((dot, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`rounded-full ${
                  dot ? 'bg-gray-800 dark:bg-gray-200' : 'bg-transparent'
                }`}
              />
            ))
          )}
        </div>
      </div>
      
      <div className={`text-2xl font-bold text-gray-900 text-center dark:text-white ${isRolling ? 'min-w-8 min-h-8 p-1 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' : ''}`}>
        {`${!isRolling && value > 0 ? value : ''}`}
      </div>
      
      {isBotTurn ? (
        <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg animate-pulse">
          {`${ICONS_MAP.bot} Bot's Turn...`}
        </div>
      ) : (
        <button
          onClick={onRoll}
          disabled={winner || isRolling}
          className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isRolling ? 'animate-pulse' : ''
          }`}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      )}
    </div>
  )
}

export default Dice
