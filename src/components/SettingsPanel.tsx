import React from "react";
import useDropDown from "./DropDown";
import { Box, Divider } from "@mui/material";
import FENSelector from "./FENSelector";

export default function SettingsPanel() {
  const { DropDown: OpponentDropDown } = useDropDown(
    "Opponent",
    new Array(8)
      .fill(0)
      .map((_, i) => ({ content: `Stockfish Level ${i + 1}`, value: i + 1 })),
    6
  );

  return (
    <Box sx={{ width: "40vw", mx: 3 }}>
      <OpponentDropDown fullWidth />
      <Box sx={{ my: 2 }} />
      <FENSelector />
    </Box>
  );
}
