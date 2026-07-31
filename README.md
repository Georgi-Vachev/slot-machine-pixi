# Game Developer Assignment: 5x3 Slot Machine

## Objective
Create a simple 5x3 slot machine game using TypeScript/JavaScript ES6 and Pixi.js. This assignment will test your
ability to work with game development concepts, TypeScript/JavaScript, and the Pixi.js library.

*Good luck with creating your slot machine game!*

## Requirements

### Game Mechanics
1. Implement a 5x3 grid of symbols.
2. Use the provided symbol images for the slot machine.
3. Implement a "Spin" button that randomizes the symbols on the grid.
4. Implement win condition checking for 3+ OAKs (3+ consecutive symbols of the same kind).
5. Game should not have fixed paylines, but use "ways-to-win" system (exact position of the symbols on each reel doesn't matter as long as they appear consecutively from left to right).

**Example Winning Boards:**

(Non-winning symbols are grayed out solely to enhance the visibility of winning symbols. This feature is not required for implementation in your game)

![board1.png](readme%2Fboard1.png)
![board2.png](readme%2Fboard2.png)

### Visual Requirements
1. Use Pixi.js to render the game.
2. Create a basic, visually appealing layout for the slot machine.
3. Implement a spinning reels visualization during the spin action.
4. Implement a simple win animation (e.g., a "bump" or highlight effect on winning symbols).

### Technical Requirements
1. Use TypeScript or JavaScript ES6 for all game logic.
2. Use Pixi.js for rendering and animations.
3. Implement a basic state management system (e.g., idle, spinning, win checking).
4. Ensure the code is well-organized, following object-oriented programming principles.
6. Feel free to install any dependency you might find useful.
7. Feel free to modify any of boilerplate/template files if needed (files on root).
8. During machine spinning, display random symbols on the reels. 
9. Use the provided Outcome.ts class to determine the symbols to be displayed after the machine stops. 

## Build & Development

You will need node setup on your machine.

Then you can run the commands below in order to start the client:

```bash
npm install
npm run serve
```

That will build the game and start a client at http://localhost:8080/. The server has hot reload, so every time you 
update the code, it should rebuild the client and refresh the tab in your preferred web browser.

## Evaluation Criteria
- Code quality, organization, and readability
- Effective use of TypeScript/JavaScript ES6 and Pixi.js
- Correct implementation of required game mechanics
- Quality of spinning reels visualization and win animation
- Overall user experience and game feel

## Submission
Please submit your code as a GitHub repository link or a zip package via email to natalia.c@naileditgames.com.

## Disclaimer

This is a test assignment and no part of your work will be used for purposes other than recruitment
