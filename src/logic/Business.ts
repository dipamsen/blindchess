import { Api } from "chessground/api";
import { Chess } from "chess.js";
import { Positions, createRandomPosition } from "../utils/createRandomPosition";

export default class Business {
  cg: Api;
  game: Chess;
  constructor(cg: Api) {
    this.cg = cg;
    this.game = new Chess();
  }

  randomize(pos: Positions) {
    this.game.load(createRandomPosition(pos));
    this.cg.set({ fen: this.game.fen() });
  }
}
