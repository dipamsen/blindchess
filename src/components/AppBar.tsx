import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useQuery } from "@tanstack/react-query";
import { useStoreState } from "../store";

export default function Header({ loggedIn }: { loggedIn: boolean }) {
  const auth = useStoreState((state) => state.auth);
  const { isLoading, error, data } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () =>
      auth
        .decorateFetchHTTPClient(fetch)("https://lichess.org/api/account")
        .then((res) => res.json()),
  });
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BlindChess
          </Typography>

          {!loggedIn && <Button color="inherit">Login</Button>}

          {/* user prof */}
          {loggedIn && (
            <Box sx={{ gap: 1, display: "flex" }}>
              <AccountCircle />
              <Typography>{data?.username}</Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
