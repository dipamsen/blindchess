import { useQuery } from "@tanstack/react-query";
import { useStoreActions, useStoreState } from "../store";
import Header from "../components/AppBar";
import { Box, CircularProgress, Container, Typography } from "@mui/material";

export default function Dashboard() {
  const logout = useStoreActions((actions) => actions.logout);
  const auth = useStoreState((state) => state.auth);
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
    <div>
      <Header loggedIn />

      {isLoading ? (
        <Box sx={{ width: "100%", display: "flex" }}>
          <CircularProgress sx={{ margin: "auto" }} />
        </Box>
      ) : error ? (
        <div>{(error as any).message}</div>
      ) : (
        <Container maxWidth="sm">
          <Typography variant="h4">Welcome, {data?.username}</Typography>
        </Container>
      )}
    </div>
  );
}
