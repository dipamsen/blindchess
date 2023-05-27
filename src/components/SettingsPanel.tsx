import React from "react";
import useDropDown from "./DropDown";
import { Box, Divider, useMediaQuery, useTheme } from "@mui/material";
import FENSelector from "./FENSelector";

export default function SettingsPanel() {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));

  const { DropDown: OpponentDropDown } = useDropDown(
    "Opponent",
    new Array(8)
      .fill(0)
      .map((_, i) => ({ content: `Stockfish Level ${i + 1}`, value: i + 1 })),
    6
  );

  return (
    <Box sx={{ width: small ? "100%" : "40vw", px: 3, mt: small ? 5 : 0 }}>
      <OpponentDropDown fullWidth />
      <Box sx={{ my: 2 }} />
      <FENSelector />
    </Box>
  );
}
