# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a classic pixel-style Tamagotchi web game built with vanilla JavaScript, HTML5 Canvas, and CSS. The game features real-time time system with adjustable speed, localStorage save system, and pixel art graphics.

## Key Development Commands

Since this is a vanilla JavaScript project, there are no build or test commands. Simply open `index.html` in a web browser to run the game.

To run the game locally:
```bash
# Use a local server for better development experience
python -m http.server 8000
# or
npx serve .
```

## Architecture Overview

The codebase follows a modular class-based architecture with clear separation of concerns:

### Core Classes

- **`TamagotchiGame`** (`src/core/game.js`) - Main game controller that orchestrates all systems
- **`GameState`** (`src/core/gameState.js`) - State management with valid transitions (MENU → PLAYING → PAUSED/CONFIRM_RESET)
- **`TimeSystem`** (`src/core/timeSystem.js`) - Handles game time flow, pause/resume, and speed adjustments
- **`GameInterface`** (`src/ui/interface.js`) - UI controller that renders different game states and handles user interactions
- **`LocalStorageService`** (`src/utils/localStorageService.js`) - Manages localStorage operations and data persistence

### Key Systems

1. **State Management**: Uses finite state machine pattern with valid transitions
2. **Time System**: Real-time progression with pause/resume and speed multipliers (0.1x to 16x)
3. **Canvas Rendering**: 320x240 pixel-perfect rendering with pixelated styling
4. **Save System**: localStorage-based persistence using `GAME_CONFIG.SAVE_KEY`

### File Structure
```
src/
├── core/           # Game logic and systems
│   ├── game.js     # Main game controller
│   ├── gameState.js # State management
│   └── timeSystem.js # Time flow system
├── ui/
│   └── interface.js # UI rendering and event handling
└── utils/
    ├── constants.js # Game configuration constants
    ├── helpers.js   # Utility functions
    └── localStorageService.js # localStorage management
```

## Important Implementation Details

### Game States
The game uses a finite state machine with these states:
- `MENU`: Initial game screen
- `PLAYING`: Active game state  
- `PAUSED`: Game temporarily stopped
- `CONFIRM_RESET`: Reset confirmation dialog

### Time System
- Game time progresses based on real time multiplied by speed factor
- Time can be paused/resumed without losing progress
- Speed can be adjusted from 0.1x to 16x during gameplay
- Uses accumulated time tracking for precise calculations

### Canvas Rendering
- Fixed 320x240 resolution for classic retro feel
- Pixel-perfect rendering with `image-rendering: pixelated`
- Simple pixel art patterns drawn programmatically

### Event Handling
- Keyboard shortcuts: ESC (pause/unpause), Enter (continue), Space (pause/unpause)  
- Click-based UI interactions through GameInterface class
- State changes trigger UI updates automatically

## Configuration Constants

All game constants are defined in `src/utils/constants.js`:
- Canvas dimensions (320x240)
- Time system settings (speed limits, update intervals)
- Tamagotchi stats (hunger decay rates, thresholds, coin limits)
- Pet evolution system configuration
- Save key for localStorage

## Code Style Notes

- Uses ES6 classes with static constants
- Chinese comments and UI text
- Monospace font family throughout
- Error handling with try-catch and console logging
- Event listener cleanup in state transitions

## Current Implementation Status

### Functional Features
- **Hunger System**: Fully implemented with time-based decay (2 points/minute)
- **Feeding Mechanism**: Players can feed pet to increase hunger by 5 points (costs 1 coin)
- **Coin System**: Complete economy system with earning/spending mechanics (100 initial coins, max 9999)
- **Time Management**: Adjustable speed (0.1x to 16x) with pause/resume functionality
- **Save/Load System**: Complete localStorage integration with automatic sync
- **UI State Management**: Proper initialization order prevents display issues

### Game Loop Architecture
The game uses a 1-second update cycle that:
1. Updates hunger based on elapsed time and speed multiplier
2. Updates coin display and feeding button state
3. Syncs data to localStorage
4. Updates UI displays in real-time
5. Handles state transitions properly

### Critical Implementation Details
- **Initialization Order**: UI rendering is delayed until after localStorage data is loaded to prevent displaying incorrect default values
- **State Restoration**: Game correctly restores hunger values, coin amounts, and time system state after page refresh
- **Event Handling**: Uses setTimeout(0) for state change UI updates to ensure proper execution order
- **Economy System**: Feeding requires coins (1 per feeding), with proper validation and UI feedback for insufficient funds
- **Test Functions**: Built-in test functions (`testCoinSystem()`, `testFeedingCost()`) available in browser console for debugging

### Planned Features (from requirements.md)
- Life/Health system with death mechanics
- Affection system affecting evolution
- Cleaning and hygiene mechanics
- Sleep cycle with day/night interactions
- Mini-games for earning coins and increasing affection
- Equipment and room decoration systems
- Sickness and medical care mechanics