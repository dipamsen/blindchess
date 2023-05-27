import { useQuery } from "@tanstack/react-query";
import { useStoreActions, useStoreState } from "../store";
import Header from "../components/AppBar";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChessBoard from "../components/ChessBoard";
import SettingsPanel from "../components/SettingsPanel";
import InfoPanel from "../components/InfoPanel";
import { useEffect } from "react";

export default function Dashboard() {
  const logout = useStoreActions((actions) => actions.logout);
  const auth = useStoreState((state) => state.auth);
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () =>
      auth
        .decorateFetchHTTPClient(fetch)("https://lichess.org/api/account")
        .then((res) => res.json()),
  });
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    refetch();
  }, []);

  return (
    <div>
      <Header loggedIn />

      {isLoading ? (
        <Box sx={{ width: "100%", display: "flex" }}>
          <CircularProgress sx={{ margin: "auto" }} />
        </Box>
      ) : error ? (
        <div>{(error as any).message}</div>
      ) : (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            width: "100%",
            flexDirection: small ? "column" : "row",
          }}
        >
          <InfoPanel />
          <ChessBoard />
          <SettingsPanel />
        </Box>
      )}
    </div>
  );
}
