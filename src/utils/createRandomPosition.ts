import { Chess, SQUARES } from "chess.js";

export enum Positions {
  // Starting = "Starting Position",
  TwoRooks = "Two Rooks",
  Queen = "One Queen",
  TwoBishops = "Two Bishops",
  BishopAndKnight = "Bishop and Knight",
}

export const createRandomPosition = (pos: Positions): string => {
  let game = new Chess();
  game.clear();
  game.put({ type: "k", color: "w" }, random(SQUARES));
  game.put({ type: "k", color: "b" }, random(SQUARES));
  switch (pos) {
    case Positions.TwoRooks:
      game.put({ type: "r", color: "w" }, random(SQUARES));
      game.put({ type: "r", color: "w" }, random(SQUARES));
      break;
    case Positions.Queen:
      game.put({ type: "q", color: "w" }, random(SQUARES));
      break;
    case Positions.TwoBishops:
      game.put({ type: "b", color: "w" }, random(SQUARES));
      game.put({ type: "b", color: "w" }, random(SQUARES));
      break;
    case Positions.BishopAndKnight:
      game.put({ type: "b", color: "w" }, random(SQUARES));
      game.put({ type: "n", color: "w" }, random(SQUARES));
      break;
    default:
      console.error("Invalid position", pos);
      break;
  }
  let fen = game.fen();
  try {
    const g1 = new Chess(fen);
    const g2 = new Chess(fen.replace(" w ", " b "));
    if (g1.inCheck() || g2.inCheck()) {
      return createRandomPosition(pos);
    }
  } catch (e) {
    return createRandomPosition(pos);
  }
  return game.fen();
};

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
