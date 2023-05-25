import React from "react";
import useDropDown from "./DropDown";
import { Box } from "@mui/material";

export default function SettingsPanel() {
  const { DropDown } = useDropDown(
    "Level",
    new Array(8)
      .fill(0)
      .map((_, i) => ({ content: `Stockfish Level ${i + 1}`, value: i + 1 })),
    6
  );

  return (
    <Box sx={{ flexGrow: 0.8, mx: 3 }}>
      <DropDown />
    </Box>
  );
}
