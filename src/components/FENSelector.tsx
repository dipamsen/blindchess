import React, { useEffect } from "react";
import useDropDown from "./DropDown";
import { Box, IconButton, Tooltip } from "@mui/material";
import ReloadIcon from "@mui/icons-material/AutoRenew";
import { Positions } from "../utils/createRandomPosition";
import { useStoreActions, useStoreState } from "../store";

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

  const randomizePosition = () => {
    business.randomize(Positions[type as keyof typeof Positions]);
    // setBusiness(business);
  };

  useEffect(() => {
    if (business) business.randomize(Positions[type as keyof typeof Positions]);
  }, [type, business]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <PositionSelect fullWidth />
      <Tooltip title="Randomize">
        <IconButton onClick={randomizePosition}>
          <ReloadIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
