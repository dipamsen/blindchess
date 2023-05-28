import { Api } from "chessground/api";
import { Chess, Move } from "chess.js";
import { Positions, createRandomPosition } from "../utils/createRandomPosition";
import { OAuth2AuthCodePKCE } from "@bity/oauth2-auth-code-pkce";
import store from "../store";
export enum Status {
  Idle,
  Playing,
  GameOver,
}

export default class Business {
  cg: Api;
  token: string | null = null;
  game: Chess;
  currGame: any = null;
  winner: string | null = null;

  constructor(cg: Api, auth: OAuth2AuthCodePKCE) {
    this.cg = cg;
    this.game = new Chess();
    auth.getAccessToken().then((token) => {
      this.token = token.token?.value || null;

      this.startEventStream();
    });

    const unsubscribe = store.subscribe(() => {
      const status = store.getState().status;
      if (status === Status.Idle) {
        this.currGame = null;
        console.log("idle");
        this.cg.set({
          movable: { free: true },
          draggable: {
            deleteOnDropOff: true,
            showGhost: false,
          },
          viewOnly: false,
          highlight: {
            lastMove: false,
            check: false,
          },
        });
      } else if (status === Status.Playing) {
        this.cg.set({
          viewOnly: true,
          drawable: {
            enabled: true,
            visible: true,
            eraseOnClick: true,
          },
        });
      } else if (status === Status.GameOver) {
        this.cg.set({
          viewOnly: true,
          highlight: {
            check: true,
          },
          check:
            this.game.isCheckmate() &&
            (this.game.turn() === "w" ? "white" : "black"),
        });
      }
    });

    // @ts-ignore
    window.business = this;
  }

  randomize(pos: Positions) {
    this.game.load(createRandomPosition(pos));
    this.cg.set({ fen: this.game.fen() });
  }

  async createStream(url: string, handle: (data: any) => void) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    const matcher = /\r?\n/;

    let buf = "";

    const loop = (): Promise<void> =>
      reader.read().then(({ done, value }) => {
        if (done) {
          if (buf.length > 0) handle(JSON.parse(buf));
        } else {
          const chunk = decoder.decode(value, {
            stream: true,
          });
          buf += chunk;

          const parts = buf.split(matcher);
          buf = parts.pop() || "";
          for (const i of parts.filter((p) => p)) handle(JSON.parse(i));
          return loop();
        }
      });

    return loop();
  }

  async startEventStream() {
    const url = "https://lichess.org/api/stream/event";
    const handle = (data: any) => {
      console.log(data);
      if (data.type === "gameStart") {
        this.currGame = data.game;
        this.game.load(data.game.fen);
        this.cg.set({ fen: this.game.fen() });
        store.getActions().setStatus(Status.Playing);
        this.startGameStream();
      } else if (
        data.type === "gameFinish" &&
        this.currGame?.id === data.game.id
      ) {
        this.winner =
          data.game.winner === "white"
            ? "White won"
            : data.game.winner === "black"
            ? "Black won"
            : data.game.status?.name === "draw"
            ? "Draw"
            : data.game.status?.name === "stalemate"
            ? "Draw by Stalemate"
            : data.game.status?.name === "aborted"
            ? "Game Aborted"
            : null;
        store.getActions().setStatus(Status.GameOver);
      }
    };
    await this.createStream(url, handle);
  }

  async startGameStream() {
    const id = this.currGame.id;
    const url = `https://lichess.org/api/board/game/stream/${id}`;
    const handle = (data: any) => {
      console.log(data);
      if (data.type === "gameFull") {
        this.game.load(data.initialFen);
        const moves = data.state.moves
          .split(" ")
          .filter((m: string) => m.length > 0);
        for (const move of moves) {
          this.game.move(move);
        }
        this.cg.set({ fen: this.game.fen() });
        store.getActions().setMoves(this.game.history({ verbose: true }));
        store
          .getActions()
          .setTurn(this.game.turn() === "w" ? "white" : "black");
      } else if (data.type === "gameState") {
        if (["aborted", "resign"].includes(data.status)) {
          return;
        }

        const moves = data.moves.split(" ").filter((m: string) => m.length > 0);
        if (moves.length === 0) return;
        this.game.move(moves[moves.length - 1]);
        this.cg.set({ fen: this.game.fen() });
        store.getActions().setMoves(this.game.history({ verbose: true }));
        store
          .getActions()
          .setTurn(this.game.turn() === "w" ? "white" : "black");
      }
    };
    await this.createStream(url, handle);
  }

  async createChallenge(level: number) {
    const fen = this.cg.getFen();
    const c = new Chess();
    c.load(fen + " w");
    const color = c.turn() === "w" ? "white" : "black";
    const fd = new FormData();
    fd.append("level", level.toString());
    fd.append("color", color);
    fd.append("variant", "standard");
    fd.append("fen", fen);
    try {
      const res = await fetch("https://lichess.org/api/challenge/ai", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          typeof data.error === "string" ? data.error : data.error.global[0]
        );
      console.log(data);
    } catch (e) {
      const err = e as Error;
      throw new Error(
        err.message === "Invalid FEN" ? "Invalid start position" : err.message
      );
    }
  }

  async resignOrAbort() {
    if (this.currGame) {
      const res = await fetch(
        `https://lichess.org/api/board/game/${this.currGame.id}/abort`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      if (!res.ok) {
        const res = await fetch(
          `https://lichess.org/api/board/game/${this.currGame.id}/resign`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );
      }
    }
  }

  async playMove(move: string) {
    let moveP: Move;
    try {
      moveP = this.game.move(move);
      this.game.undo();
    } catch (e) {
      throw e;
    }
    const res = await fetch(
      `https://lichess.org/api/board/game/${this.currGame.id}/move/${moveP.lan}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }
}
