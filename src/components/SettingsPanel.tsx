import React, { useState } from "react";
import useDropDown from "./DropDown";
import {
  Box,
  Button,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FENSelector from "./FENSelector";
import { useStoreActions, useStoreState } from "../store";
import { Status } from "../logic/Business";
import MoveInput from "./MoveInput";

export default function SettingsPanel() {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));
  const [error, setError] = useState("");

  const business = useStoreState((state) => state.business)!;
  const status = useStoreState((state) => state.status);
  const setStatus = useStoreActions((state) => state.setStatus);
  const turn = useStoreState((state) => state.gameState?.turn);
  const moves = useStoreState((state) => state.gameState?.moves);

  const lastMoves = turn === "white" ? moves?.slice(-2) : moves?.slice(-1);
  const lastMoveTxt =
    turn === "white" && lastMoves?.length === 1
      ? "... "
      : "" + lastMoves?.map((m) => m.san).join(" ") || "";

  // 1. e4 e5
  // 2. Nf3 Nc6
  // ...
  const movesHtml = moves
    ?.map((m, i) => [m, moves[i + 1]])
    .filter((x) => (x[0] && x[0].color === "w") || (x[1] && x[1].color === "b"))
    ?.map((m, i) => (
      <Typography
        key={i}
        variant="body1"
        // sx={{
        //   color: m.color === "w" ? "primary.main" : "secondary.main",
        // }}
      >
        {i + 1}. {m[0].san} {m[1]?.san || ""}
      </Typography>
    ));

  const { DropDown: OpponentDropDown, selectedValue: lvl } = useDropDown(
    "Opponent",
    new Array(8)
      .fill(0)
      .map((_, i) => ({ content: `Stockfish Level ${i + 1}`, value: i + 1 })),
    6
  );
  console.log(error);
  return status === Status.Idle ? (
    <Box sx={{ width: small ? "100%" : "40vw", px: 3, mt: small ? 5 : 0 }}>
      <OpponentDropDown fullWidth />
      <Box sx={{ my: 2 }} />
      <FENSelector />

      <Divider sx={{ mt: 2, mb: 16 }} />
      <Button
        variant="contained"
        fullWidth
        color="secondary"
        onClick={() => {
          setError("");
          business.createChallenge(lvl).catch((e) => setError(e.message));
        }}
      >
        Start Game
      </Button>

      <Typography variant="body1" sx={{ mt: 2 }} color="error">
        {error}
      </Typography>
    </Box>
  ) : status === Status.Playing ? (
    <Box sx={{ width: small ? "100%" : "40vw", px: 3, mt: small ? 5 : 0 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Game in progress
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {turn === "white" ? "White" : "Black"} to move
      </Typography>

      <MoveInput />

      <Divider sx={{ mt: 2, mb: 2 }} />

      <Box sx={{ mx: 2, overflowY: "auto", height: "200px" }}>{movesHtml}</Box>

      <Divider sx={{ mt: 2, mb: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color="secondary"
        onClick={() => business.resignOrAbort()}
      >
        End Game (Abort / Resign)
      </Button>
    </Box>
  ) : (
    <Box sx={{ width: small ? "100%" : "40vw", px: 3, mt: small ? 5 : 0 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Game over
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {business.winner}
      </Typography>

      <Divider sx={{ mt: 2, mb: 2 }} />

      <Box sx={{ mx: 2, overflowY: "auto", height: "200px" }}>{movesHtml}</Box>

      <Divider sx={{ mt: 2, mb: 2 }} />
      <Button
        variant="contained"
        fullWidth
        color="secondary"
        onClick={() => setStatus(Status.Idle)}
      >
        Reset
      </Button>
    </Box>
  );
}
