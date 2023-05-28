import { Box, FormControl, Input, InputLabel, Typography } from "@mui/material";
import React, { useState } from "react";
import { useStoreState } from "../store";

export default function MoveInput() {
  const [move, setMove] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const business = useStoreState((state) => state.business)!;
  const playMove = () => {
    setPlaying(true);
    setError("");
    business
      .playMove(move)
      .then(() => {
        setMove("");
        setPlaying(false);
      })
      .catch((e) => {
        setMove("");
        setError(e.message);
        setPlaying(false);
      });
  };

  return (
    <Box>
      <input
        type="text"
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          fontSize: "1.5rem",
          margin: "0.5rem 0",
          textAlign: "center",
          caretColor: "transparent",
        }}
        value={move}
        autoFocus
        onBlur={(e) => e.target.focus()}
        onChange={(e) => setMove(e.target.value.trim())}
        onKeyDown={(e) => e.key === "Enter" && !playing && playMove()}
      />
      <Typography variant="caption">
        Type your move and press enter to play
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }} color={"error"}>
        {error}
      </Typography>
    </Box>
  );
}
