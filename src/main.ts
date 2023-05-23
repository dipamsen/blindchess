import "./style.css";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import { Chessground } from "chessground";
import { Config } from "chessground/config";
import { Chess } from "chess.js";
import {
  abortOrResignGame,
  challengeAI,
  playMove,
  startEventStream,
  startGameStream,
} from "./API";
const input = document.querySelector("input") as HTMLInputElement;
const fenSelect = document.querySelector<HTMLSelectElement>("#fen")!;
const levelSelect = document.querySelector<HTMLSelectElement>("#level")!;
const debug = document.querySelector("#debug") as HTMLInputElement;

let currentGame = "";

const movesDom = document.querySelector(".moves") as HTMLDivElement;
// on keyypress enter clear input
input.addEventListener("keypress", async (e) => {
  clearError();
  if (e.key === "Enter") {
    if (windowState === 1) {
      const move = input.value;
      try {
        const moveParsed = game.move(move);
        game.undo();
        if (moveParsed) {
          console.log("move", moveParsed);

          await playMove(currentGame, moveParsed.lan);
        }
      } catch (e) {
        console.log(e);
        displayError((e as any).message);
      }
    }

    input.value = "";
  }
});

const game = new Chess();

const LichessGames: string[] = [];

const cgConfig: Config = {
  fen: game.fen(),
  movable: {
    free: true,
  },
  highlight: {
    lastMove: false,
    check: false,
  },
};
const cg = Chessground(document.querySelector(".board")!, cgConfig);

// States:
// 0: initial state (select fen, start game)
// 1: game started
let windowState = 0;

document.addEventListener("stateChange", () => {
  // console.log("stateChange", e.detail);
  if (windowState === 0) {
    document.body.setAttribute("data-state", "0");

    game.reset();
    game.load(fenSelect.value);

    updateMovesDom();

    cg.set({
      fen: game.fen(),
      movable: {
        free: true,
        events: {
          after() {
            console.log("after");
            const fen = game.fen();
            game.load([cg.getFen(), fen.split(" ")[1]].join(" "));
          },
        },
      },
      viewOnly: false,
    });
  } else if (windowState === 1) {
    document.body.setAttribute("data-state", "1");

    if (!currentGame) {
      startGameStream(LichessGames[0]);
      currentGame = LichessGames[0];
    }

    cg.set({
      fen: game.fen(),
      movable: {
        free: false,
      },

      viewOnly: true,
    });
  }
});

document.addEventListener("lichessEvent", (e) => {
  // @ts-ignore
  const event = e.detail;
  switch (event.type) {
    case "challenge":
      console.log("challenge", event.challenge);
      break;
    case "gameStart":
      console.log("gameStart", event.game);
      const style =
        "background-color: darkblue; color: white; font-style: italic; border: 5px solid hotpink; font-size: 2em;";
      console.log(
        `%cOpen Game: https://lichess.org/${event.game.fullId}`,
        style
      );
      LichessGames.push(event.game.id);
      if (windowState === 0) {
        windowState = 1;
        document.dispatchEvent(
          new CustomEvent("stateChange", { detail: windowState })
        );
      }
      break;
    case "gameFinish":
      console.log("gameFinish", event.game);
      LichessGames.splice(LichessGames.indexOf(event.game.id), 1);
      if (currentGame === event.game.id) {
        currentGame = "";
        windowState = 0;
        document.dispatchEvent(
          new CustomEvent("stateChange", { detail: windowState })
        );
      }

      break;
  }
});

document.addEventListener("lichessGame", (e) => {
  // @ts-ignore
  const lgame = e.detail;
  console.log("game", lgame);
  if (lgame.type === "gameState") {
    if (lgame.id === currentGame) {
      const move = lgame.moves.split(" ").at(-1);
      if (!move) return;
      const parsed = game.move(move);
      console.log(parsed);
      cg.set({
        fen: game.fen(),
      });

      updateMovesDom();
    }
  } else if (lgame.type === "gameFull") {
    if (lgame.id === currentGame) {
      if (lgame.initialFen === "startpos") {
        lgame.initialFen =
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      }
      game.load(lgame.initialFen);
      lgame.state.moves.split(" ").forEach((move: string) => {
        if (move.trim()) game.move(move.trim());
      });
      cg.set({
        fen: game.fen(),
      });
      updateMovesDom();
    }
  }
});

fenSelect.addEventListener("change", function () {
  game.load(this.value);
  cg.set({ fen: game.fen() });
});

document.querySelector(".reset")?.addEventListener("click", async () => {
  // game.reset();
  // cg.set({ fen: game.fen() });

  for (const game of LichessGames) {
    await abortOrResignGame(game);
  }

  windowState = 0;
  document.dispatchEvent(
    new CustomEvent("stateChange", { detail: windowState })
  );
});

document.forms[0].addEventListener("submit", async function (e) {
  e.preventDefault();

  const level = +levelSelect.value;
  const fen = game.fen();

  const challenge = await challengeAI(level, fen);
  console.log("challenge", challenge);

  const id = challenge.id;
  startGameStream(id);
  currentGame = id;

  windowState = 1;
  document.dispatchEvent(
    new CustomEvent("stateChange", { detail: windowState })
  );
});

debug.addEventListener("change", () => {
  if (debug.checked) {
    document.body.classList.add("debug");
  } else {
    document.body.classList.remove("debug");
  }
});

document.dispatchEvent(new CustomEvent("stateChange", { detail: windowState }));

startEventStream();

function displayError(e: string) {
  const error = document.querySelector(".error")!;
  error.textContent = e;
  error.classList.add("show");
}

function clearError() {
  const error = document.querySelector(".error")!;
  error.textContent = "";
  error.classList.remove("show");
}

function updateMovesDom() {
  const history = game.history({
    verbose: true,
  });
  if (game.turn() === "w") {
    const lastBlackMove = history.at(-1);
    if (lastBlackMove) {
      const lastWhiteMove = history.at(-2);
      if (lastWhiteMove) {
        // update movesDom.textContent to show last move pgn of both white and black
        movesDom.textContent = `${lastWhiteMove.san} ${lastBlackMove.san}`;
      } else {
        // update movesDom.textContent to show last move pgn of black
        movesDom.textContent = `... ${lastBlackMove.san}`;
      }
    }
  } else {
    const lastWhiteMove = history.at(-1);
    if (lastWhiteMove) {
      // update movesDom.textContent to show last move pgn of white
      movesDom.textContent = lastWhiteMove.san;
    }
  }
}
