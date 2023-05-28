import Header from "../components/AppBar";
import { Container, Typography } from "@mui/material";

function App() {
  return (
    <div>
      <Header />

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Typography variant="h3">Welcome to BlindChess!</Typography>
        <Typography variant="body1">
          Login with your Lichess account to get started.
        </Typography>
      </Container>
    </div>
  );
}

export default App;
