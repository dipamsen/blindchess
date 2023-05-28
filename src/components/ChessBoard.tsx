import React, { useEffect } from "react";
import { Chessground } from "chessground";
import { useStoreActions } from "../store";
import Business, { Status } from "../logic/Business";
import { Typography } from "@mui/material";
import { useStoreState } from "../store";

export default function ChessBoard() {
  const board = React.useRef<HTMLDivElement>(null);
  const setBusiness = useStoreActions((actions) => actions.setBusiness);
  const business = useStoreState((state) => state.business);
  const auth = useStoreState((state) => state.auth);
  const status = useStoreState((state) => state.status);
  const username = useStoreState((state) => state.username);

  useEffect(() => {
    if (board.current) {
      const cg = Chessground(board.current, {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        orientation: "white",
        draggable: {
          deleteOnDropOff: true,
          showGhost: false,
        },
        highlight: {
          lastMove: false,
          check: false,
        },
      });
      setBusiness(new Business(cg, auth));
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      {status === Status.Idle && <Typography>Board Editor</Typography>}{" "}
      {status !== Status.Idle && (
        <Typography>{business?.currGame.opponent.username}</Typography>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            aspectRatio: 1,
            width: "100%",
          }}
          ref={board}
        ></div>
      </div>{" "}
      {status !== Status.Idle && <Typography>{username}</Typography>}
    </div>
  );
}
