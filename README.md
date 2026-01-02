# 🐍 Snake and Ladder 🪜 - Multiplayer Game

An interactive and visually appealing multiplayer Snake and Ladder game built with React JS and Tailwind CSS. Features bot players, smooth animations, personalized player customization, and a beautiful modern UI with theme support.

## ✨ Features

### 🎮 Core Gameplay
- **Multiplayer Support**: Play with 2-6 players
- **Bot Players**: Play against AI opponents with automatic turn management
- **Traditional Board Layout**: Position 1 starts at bottom-left, position 100 at top-left (classic zigzag pattern)
- **Win Condition**: First player to reach exactly position 100 wins
- **Extra Turn Rule**: Rolling a 6 grants an extra turn
- **Smart Movement**: Players must roll the exact number to reach 100 (no overshooting)

### 🎨 Visual Features
- **Interactive Game Board**: Beautiful HTML/CSS-based board with hover effects
- **Cartoon-Style Snakes**: Animated snakes with expressions, gradients, and body segments
- **Detailed Ladders**: Realistic ladders with rivets and rungs
- **Player Icons**: Interactive player icons with expressions and animations
- **Smooth Animations**: 
  - Step-by-step player movement across the board
  - Climbing animation when using ladders
  - Sliding animation when going down snakes
  - Dice rolling animation
- **Visual Indicators**: Clear markers for snakes, ladders, and player positions

### 👥 Player Customization
- **Custom Names**: Enter personalized names for each player
- **Color Selection**: Choose from 6 vibrant colors for each player
- **Sequential Naming**: Automatic sequential numbering for default names (Player 1, Player 2, Bot 1, Bot 2, etc.)
- **Bot Management**: 
  - Toggle bot mode for individual players
  - At least one human player required
  - Bot names auto-generated sequentially

### 🌓 Theme Support
- **Light Mode**: Bright, colorful theme
- **Dark Mode**: Easy on the eyes dark theme
- **System Theme**: Automatically matches your system preference
- **Smooth Transitions**: Seamless theme switching

### 📱 Responsive Design
- **Mobile Friendly**: Works perfectly on all screen sizes
- **Adaptive Layout**: Game board and controls adjust to screen size
- **Touch Optimized**: Great experience on tablets and mobile devices

## 🎯 Game Rules

1. **Starting Position**: All players start at position 1 (bottom-left of the board)

2. **Turn Order**: Players take turns rolling the dice in order

3. **Movement**: 
   - Roll the dice and move forward by the number shown
   - Players move step-by-step with smooth animations

4. **Ladders**: 
   - Landing on the bottom of a ladder automatically climbs you up
   - Visual climbing animation shows the ascent

5. **Snakes**: 
   - Landing on a snake's head automatically slides you down
   - Visual sliding animation shows the descent

6. **Extra Turn**: 
   - Rolling a 6 grants you an extra turn
   - You get to roll again immediately

7. **Winning**: 
   - Must roll the exact number to reach position 100
   - Can win by reaching 100 via dice roll or ladder
   - If you exceed 100, you stay in place

8. **Bot Players**: 
   - Bots automatically roll dice on their turn
   - 1.5 second delay for natural gameplay feel
   - At least one human player must be in the game

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snakes-and-ladder-multiplayer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎮 How to Play

### Setup Phase

1. **Choose Number of Players**: 
   - Use +/- buttons to select 2-6 players

2. **Enable Bot Players** (Optional):
   - Toggle "Enable Bot Players" checkbox
   - Individual bot toggles appear for each player
   - Mark players as bots using the toggle switch
   - **Note**: At least one human player is required

3. **Customize Players**:
   - Enter custom names (or use default sequential names)
   - Select colors for each player
   - Bot players have auto-generated names (Bot 1, Bot 2, etc.)

4. **Start Game**: 
   - Click "Start Game" button
   - Game begins with Player 1's turn

### Gameplay Phase

1. **Roll Dice**:
   - Human players: Click "Roll Dice" button
   - Bot players: Automatically roll after 1.5 seconds

2. **Watch Movement**:
   - Player moves step-by-step across the board
   - Special animations for ladders (climbing) and snakes (sliding)

3. **Track Progress**:
   - View current player's turn in the status panel
   - See all player positions
   - Check last move details

4. **Win the Game**:
   - Be the first to reach position 100
   - Celebration animation when you win!

### Theme Selection

- Click the theme toggle in the top-right corner
- Choose between:
  - ☀️ Light Mode
  - 🌙 Dark Mode
  - 💻 System Theme (matches your OS)

## 📁 Project Structure

```
snakes-and-ladder-multiplayer/
├── src/
│   ├── components/              # React components
│   │   ├── GameBoard.jsx       # Interactive game board with snakes, ladders, and players
│   │   ├── Dice.jsx            # Dice component with rolling animation
│   │   ├── GameStatus.jsx      # Game status, current turn, and player info
│   │   ├── PlayerSetup.jsx      # Player configuration and bot setup
│   │   └── ThemeToggle.jsx      # Theme switcher component
│   ├── contexts/                # React contexts
│   │   └── ThemeContext.jsx     # Theme management context
│   ├── constants/               # Game constants
│   │   ├── GameBoardConstants.ts # Board configuration, snakes, ladders, icons
│   │   └── PlayerConstants.ts   # Player colors and game states
│   ├── utils/                   # Utility functions
│   │   └── gameLogic.js         # Game logic, movement, path generation
│   ├── App.jsx                  # Main app component with game state management
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles and animations
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Technologies Used

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **SVG** - Vector graphics for snakes, ladders, and player icons
- **CSS Animations** - Smooth transitions and keyframe animations

## 🎨 Game Board Details

### Snakes
- 10 snakes with different colors and expressions
- Cartoon-style design with gradients and body segments
- Smooth sliding animation when players land on snake heads

### Ladders
- 9 ladders connecting different board positions
- Detailed design with rails and rungs
- Smooth climbing animation when players use ladders

### Board Layout
- 10x10 grid (100 positions)
- Traditional layout: Position 1 at bottom-left, 100 at top-left
- Zigzag pattern: Alternating left-to-right and right-to-left rows
- Visual indicators for snake heads/tails and ladder bottoms/tops

## 🤖 Bot Players

### Features
- Automatic dice rolling on bot turns
- 1.5 second delay for natural gameplay
- Visual indicators (🤖 emoji) throughout the UI
- Sequential naming (Bot 1, Bot 2, etc.)

### Limitations
- At least one human player must be in the game
- Bot toggle is disabled if it would result in all bots
- Bot names and colors are auto-managed

## 🎯 Game Features in Detail

### Player Movement Animations
- **Walking**: Step-by-step movement with bounce animation
- **Climbing**: Upward motion with scale animation when using ladders
- **Sliding**: Downward motion with rotation when going down snakes
- **Smooth Transitions**: CSS transitions for position changes

### Visual Feedback
- Current player highlighted with golden glow
- Hover effects on cells and player icons
- Tooltips showing position information
- Status messages for extra turns and wins

### Game States
- **Setup**: Player configuration phase
- **Playing**: Active gameplay
- **Finished**: Game over with winner announcement

## 📝 Development Notes

### Key Implementation Details
- Player positions tracked in state
- Animation path generated for smooth movement
- Bot logic uses useEffect to auto-roll
- Theme context manages light/dark mode
- Sequential naming logic for players and bots

### Animation System
- Step-by-step path generation
- CSS keyframe animations for special movements
- Smooth position transitions
- Animation state management to prevent conflicts

## 📄 License

MIT

## 🙏 Acknowledgments

- Traditional Snakes and Ladders game rules
- Modern UI/UX design principles
- React best practices

---

Enjoy playing! 🎉 Have fun climbing ladders and avoiding those sneaky snakes! 🐍🪜
