import { SQUARES, Square } from "chess.js";

export function getSquareType(square: Square) {
  const [file, rank] = square.split("");
  const fileNum = file.charCodeAt(0) - 97;
  const rankNum = parseInt(rank) - 1;
  const isLightSquare = (fileNum + rankNum) % 2 === 1;
  return isLightSquare ? "light" : "dark";
}

export const LIGHT_SQUARES = SQUARES.filter(
  (s) => getSquareType(s) === "light"
);

export const DARK_SQUARES = SQUARES.filter((s) => getSquareType(s) === "dark");
