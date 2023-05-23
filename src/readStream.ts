type Handler = (line: any) => void;

export interface Stream {
  closePromise: Promise<void>;
  close(): Promise<void>;
}

export const readStream = (
  name: string,
  response: Response,
  handler: Handler
): Stream => {
  const stream = response.body!.getReader();
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = "";

  const process = (json: string) => {
    const msg = JSON.parse(json);
    console.log(name, msg);
    handler(msg);
  };

  const loop: () => Promise<void> = () =>
    stream.read().then(({ done, value }) => {
      if (done) {
        if (buf.length > 0) process(buf);
        return;
      } else {
        const chunk = decoder.decode(value, {
          stream: true,
        });
        buf += chunk;

        const parts = buf.split(matcher);
        buf = parts.pop() || "";
        for (const i of parts.filter((p) => p)) process(i);
        return loop();
      }
    });

  return {
    closePromise: loop(),
    close: () => stream.cancel(),
  };
};

// const stream = fetch("https://lichess.org/api/tv/feed");
// or any other ND-JSON endpoint such as:
// const stream = fetch('https://lichess.org/api/games/user/neio',{headers:{Accept:'application/x-ndjson'}});

// const onMessage = (obj: any) => console.log(obj);
// const onComplete = () => console.log("The stream has completed");

// stream.then((res) => readStream("Stream", res, onMessage).closePromise).then(onComplete);
