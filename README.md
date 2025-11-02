# 🐍 Snake and Ladder - Multiplayer Game

An attractive multiplayer Snake and Ladder game built with React JS and Tailwind CSS, featuring personalized player names, custom colors, and theme support (light, dark, and system).

## Features

✨ **Key Features:**
- 🎮 Multiplayer support (2-6 players)
- 👤 Personalized player names and colors
- 🎨 Beautiful, modern UI with Tailwind CSS
- 🌓 Theme support: Light, Dark, and System theme
- 🎲 Interactive dice rolling animation
- 🐍 Visual snakes and ladders on the board
- 📱 Responsive design
- ⚡ Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Play

1. **Setup Players:**
   - Choose the number of players (2-6)
   - Enter player names
   - Select colors for each player

2. **Gameplay:**
   - Click "Roll Dice" to roll the die
   - Your player will move automatically based on the dice value
   - Land on a ladder to climb up!
   - Land on a snake's head to slide down!
   - First player to reach position 100 wins!

3. **Theme Selection:**
   - Click the theme buttons in the top-right corner
   - Choose between Light (☀️), Dark (🌙), or System (💻) theme

## Project Structure

```
snake_and_ladder/
├── src/
│   ├── components/          # React components
│   │   ├── GameBoard.jsx    # Game board visualization
│   │   ├── Dice.jsx         # Dice component
│   │   ├── GameStatus.jsx   # Game status and player info
│   │   ├── PlayerSetup.jsx  # Player configuration
│   │   └── ThemeToggle.jsx  # Theme switcher
│   ├── contexts/            # React contexts
│   │   └── ThemeContext.jsx # Theme management
│   ├── utils/               # Utility functions
│   │   └── gameLogic.js     # Game logic and rules
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Technologies Used

- **React** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Canvas API** - Game board rendering

## License

MIT

Enjoy playing! 🎉
