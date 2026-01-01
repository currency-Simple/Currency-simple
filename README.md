# 🎮 Rolling Ball 3D Game

A modern 3D rolling ball game built with React, featuring dynamic paths, progressive speed increases, and multiple gameplay modes.

## ✨ Features

- 🎯 10 unique path types with different patterns
- 🏐 5 customizable ball colors
- 🚀 Progressive speed system (starts at 300%, increases 20% every 10 triangles)
- 📱 Touch controls for mobile devices
- 🎨 Neon visual effects with smooth animations
- 🏆 Score tracking system
- ⚙️ Real-time game controls

## 🎮 Game Modes

1. **Straight Path** - Classic straight corridor
2. **Curved Path** - Smooth sinusoidal curves
3. **Zigzag Path** - Sharp alternating turns
4. **Wavy Path** - Flowing wave patterns
5. **Spiral Path** - Circular spiral motion
6. **Jump Path** - Platforms with gaps
7. **Narrow Path** - Progressively narrowing corridor
8. **Split Path** - Branching paths
9. **Circular Path** - Full circular loops
10. **Random Path** - Unpredictable dynamic paths

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rolling-ball-3d.git

# Navigate to project directory
cd rolling-ball-3d

# Install dependencies
npm install

# Start development server
npm start
```

The game will open at `http://localhost:3000`

## 🎯 How to Play

1. **Choose Your Ball**: Select from 5 different colored balls
2. **Select Path Type**: Pick one of 10 unique path patterns
3. **Control the Ball**: 
   - 🖱️ Desktop: Click and drag
   - 📱 Mobile: Touch and swipe
4. **Avoid Falling**: Stay on the path to survive
5. **Score Points**: Pass through triangles to increase your score

## 🎛️ Controls

- **Home Button**: Return to main menu
- **Play/Pause**: Toggle game state
- **Restart**: Reset the game
- **Change Path**: Switch to next path type
- **Speed Up**: Increase game speed by 50%

## 📊 Speed System

- **Initial Speed**: 300% of base speed
- **Progression**: +20% every 10 triangles passed
- **Formula**: `speed = baseSpeed × (3 + 0.2 × floor(score / 10))`

## 🏗️ Project Structure

```
src/
├── components/        # React components
├── game/             # Game logic
│   ├── config/       # Configuration files
│   ├── managers/     # Game state managers
│   ├── generators/   # Path generation
│   ├── physics/      # Collision detection
│   └── constants/    # Game constants
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
└── styles/           # CSS styles
```

## 🛠️ Technologies

- **React 18** - UI framework
- **JavaScript ES6+** - Core logic
- **CSS3** - Styling and animations
- **HTML5** - Canvas and touch events

## 📝 Development

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Inspired by classic endless runner games
- Built with modern React practices
- Optimized for mobile performance

## 📸 Screenshots

[Add screenshots of your game here]

## 🎯 Future Enhancements

- [ ] Add sound effects and music
- [ ] Implement leaderboard system
- [ ] Add power-ups and obstacles
- [ ] Create multiplayer mode
- [ ] Add more path patterns
- [ ] Implement difficulty levels

---

Made with ❤️ and React
