import { Chess, SQUARES } from "chess.js";
import { DARK_SQUARES, LIGHT_SQUARES, getSquareType } from "./getSquareType";

export enum Positions {
  // Starting = "Starting Position",
  TwoRooks = "Two Rooks",
  Queen = "One Queen",
  TwoBishops = "Two Bishops",
  BishopAndKnight = "Bishop and Knight",
  Custom = "Custom",
}

export const createRandomPosition = (pos: Positions): string => {
  let game = new Chess();
  game.clear();
  game.put({ type: "k", color: "w" }, random(SQUARES));
  game.put({ type: "k", color: "b" }, random(SQUARES));
  let numPieces = 2;
  switch (pos) {
    case Positions.TwoRooks: {
      const [s1, s2] = nRandom(SQUARES, 2);
      game.put({ type: "r", color: "w" }, s1);
      game.put({ type: "r", color: "w" }, s2);
      numPieces += 2;
      break;
    }
    case Positions.Queen: {
      game.put({ type: "q", color: "w" }, random(SQUARES));
      numPieces++;
      break;
    }
    case Positions.TwoBishops: {
      // special case: diff colored bishops
      const s1 = random(LIGHT_SQUARES);
      const s2 = random(DARK_SQUARES);
      game.put({ type: "b", color: "w" }, s1);
      game.put({ type: "b", color: "w" }, s2);
      numPieces += 2;
      break;
    }
    case Positions.BishopAndKnight: {
      const [s1, s2] = nRandom(SQUARES, 2);
      game.put({ type: "b", color: "w" }, s1);
      game.put({ type: "n", color: "w" }, s2);
      numPieces += 2;
      break;
    }
    default: {
      console.error("Invalid position", pos);
      break;
    }
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

function nRandom<T>(arr: T[], n: number): T[] {
  if (n === 0) {
    return [];
  }
  const a = random(arr);
  return [
    a,
    ...nRandom(
      arr.filter((x) => x !== a),
      n - 1
    ),
  ];
}
