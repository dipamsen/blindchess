import React, { useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Logout from "@mui/icons-material/PowerSettingsNew";
import { useQuery } from "@tanstack/react-query";
import { useStoreActions, useStoreState } from "../store";
import authenticate from "../store/authenticate";

export default function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));
  const auth = useStoreState((state) => state.auth);
  const authenticate = useStoreActions((state) => state.authenticate);
  const logout = useStoreActions((state) => state.logout);
  const setUsername = useStoreActions((state) => state.setUsername);
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () =>
      auth
        .decorateFetchHTTPClient(fetch)("https://lichess.org/api/account")
        .then((res) => res.json()),
  });

  useEffect(() => {
    refetch().then((val) => {
      setUsername(val.data.username);
    });
  }, []);

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
          ) : small ? (
            <IconButton
              size="large"
              edge="start"
              color="error"
              aria-label="menu"
              onClick={logOutAndReload}
            >
              <Logout />
            </IconButton>
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
