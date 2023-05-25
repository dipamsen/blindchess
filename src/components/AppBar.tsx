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
import { useStoreActions, useStoreState } from "../store";
import authenticate from "../store/authenticate";

export default function Header({ loggedIn }: { loggedIn: boolean }) {
  const auth = useStoreState((state) => state.auth);
  const authenticate = useStoreActions((state) => state.authenticate);
  const logout = useStoreActions((state) => state.logout);
  const { isLoading, error, data } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () =>
      auth
        .decorateFetchHTTPClient(fetch)("https://lichess.org/api/account")
        .then((res) => res.json()),
  });

  const logOutAndReload = () => {
    logout();
    location.href = "/";
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BlindChess
          </Typography>

          {loggedIn && (
            <Box sx={{ gap: 1, display: "flex", marginRight: 2 }}>
              <AccountCircle />
              <Typography>{data?.username}</Typography>
            </Box>
          )}

          {!loggedIn ? (
            <Button color="primary" onClick={() => authenticate()}>
              Login with Lichess
            </Button>
          ) : (
            <Button color="error" onClick={logOutAndReload}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
