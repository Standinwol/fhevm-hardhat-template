import { FC } from "react";

interface GameState {
  board: number[][];
  score: number;
  maxTile: number;
  gameOver: boolean;
  won: boolean;
  milestones: Record<number, boolean>;
}

interface GameBoardProps {
  gameState: GameState;
}

const GameBoard = ({ gameState }: GameBoardProps) => {
  const getTileClass = (value: number): string => {
    if (value === 0) return "game-cell";
    return `game-tile tile-${value}`;
  };

  const getTilePosition = (row: number, col: number) => {
    return {
      transform: `translate(${col * 80}px, ${row * 80}px)`,
    };
  };

  return (
    <div className="game-container">
      <div className="game-grid" style={{ width: "320px", height: "320px" }}>
        {/* Background grid */}
        {Array(16)
          .fill(0)
          .map((_, index) => (
            <div key={`bg-${index}`} className="game-cell"></div>
          ))}

        {/* Game tiles */}
        {gameState.board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            if (value === 0) return null;

            return (
              <div
                key={`tile-${rowIndex}-${colIndex}-${value}`}
                className={getTileClass(value)}
                style={getTilePosition(rowIndex, colIndex)}
              >
                {value}
              </div>
            );
          }),
        )}
      </div>

      {/* Achievement notifications */}
      {Object.entries(gameState.milestones).map(([milestone, achieved]) => {
        if (!achieved) return null;

        return (
          <div
            key={`achievement-${milestone}`}
            className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce"
          >
            🎉 {milestone} Reached!
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
