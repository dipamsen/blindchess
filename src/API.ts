import { readStream } from "./readStream";

const headers = {
  Authorization: "Bearer " + import.meta.env.VITE_APP_LICHESS_TOKEN,
};

export function startEventStream() {
  const stream = fetch("https://lichess.org/api/stream/event", {
    headers,
  });

  const onMessage = (obj: any) => {
    document.dispatchEvent(new CustomEvent("lichessEvent", { detail: obj }));
  };
  const onComplete = () => console.log("The stream has completed");

  stream
    .then((res) => readStream("Event Stream", res, onMessage).closePromise)
    .then(onComplete);
}

export async function challengeAI(level: number = 6, fen?: string) {
  const url = "https://lichess.org/api/challenge/ai";
  const body = new URLSearchParams();
  body.append("level", level.toString());
  if (fen) body.append("fen", fen);
  body.append("color", "white");
  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

export function startGameStream(id: string) {
  const stream = fetch(`https://lichess.org/api/board/game/stream/${id}`, {
    headers,
  });

  const onMessage = (obj: any) => {
    document.dispatchEvent(
      new CustomEvent("lichessGame", { detail: { ...obj, id } })
    );
  };
  const onComplete = () => console.log("The game stream has completed");

  stream
    .then((res) => readStream("Game Stream " + id, res, onMessage).closePromise)
    .then(onComplete);
}

export async function abortOrResignGame(id: string) {
  const url = `https://lichess.org/api/board/game/${id}/abort`;
  const res = await fetch(url, {
    method: "POST",
    headers,
  }).then((res) => res.json());
  if (res.error) {
    const url = `https://lichess.org/api/board/game/${id}/resign`;
    const res = await fetch(url, {
      method: "POST",

      headers,
    }).then((res) => res.json());
    if (res.error) throw new Error(res.error.message);
  }
}

export async function playMove(gameId: string, move: string) {
  const url = `https://lichess.org/api/board/game/${gameId}/move/${move}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
  }).then((res) => res.json());
  if (res.error) throw new Error(res.error.message);
}
