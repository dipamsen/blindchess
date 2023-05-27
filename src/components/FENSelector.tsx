import React, { useEffect, useState } from "react";
import useDropDown from "./DropDown";
import {
  Box,
  Divider,
  IconButton,
  Input,
  Link,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ReloadIcon from "@mui/icons-material/Autorenew";
import { Positions } from "../utils/createRandomPosition";
import { useStoreActions, useStoreState } from "../store";
import { Chess } from "chess.js";

export default function FENSelector() {
  const { DropDown: PositionSelect, selectedValue: type } = useDropDown(
    "Position",
    Object.entries(Positions).map(([k, v]) => ({
      content: v,
      value: k,
    }))
  );
  const business = useStoreState((state) => state.business)!;
  const setBusiness = useStoreActions((actions) => actions.setBusiness);
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [error, setError] = useState(false);
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));

  const randomizePosition = () => {
    business.randomize(Positions[type as keyof typeof Positions]);
    // setBusiness(business);
  };

  useEffect(() => {
    if (!business) return;
    if (type !== Positions.Custom)
      business.randomize(Positions[type as keyof typeof Positions]);
    if (type === Positions.Custom) {
      try {
        const c = new Chess(fen);
        business.cg.set({
          fen: fen,
          events: {
            change() {
              setFen(business.cg.getFen());
            },
          },
        });
        setError(false);
      } catch (e) {
        console.log(e);
        setError(true);
      }
    }
    return () => {
      business.cg.set({ events: {} });
    };
  }, [type, business, fen]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <PositionSelect fullWidth />
        <Tooltip title="Randomize">
          <IconButton
            onClick={randomizePosition}
            disabled={type === Positions.Custom}
          >
            <ReloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {type === Positions.Custom && (
        <>
          <TextField
            label="FEN"
            value={fen}
            error={error}
            variant={small ? "standard" : "outlined"}
            fullWidth
            sx={{ mt: small ? 4 : 2 }}
            onChange={(e) => setFen(e.target.value)}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {/* Use the board editor to set the position, or use{" "}
            <Link target="_blank" href="https://lichess.org/editor">
              lichess.org/editor
            </Link>{" "}
            and copy and paste FEN here. */}
            Set the position using the board editor; or use{" "}
            <Link href="https://lichess.org/editor" target="_blank">
              lichess.org/editor
            </Link>{" "}
            and copy and paste the FEN below.
          </Typography>
        </>
      )}
    </Box>
  );
}
