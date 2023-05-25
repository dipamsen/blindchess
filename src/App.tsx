import { useStoreState } from "./store";
import Dashboard from "./pages/Dashboard";
import Intro from "./pages/Intro";

function App() {
  const auth = useStoreState((state) => state.auth);

  return auth.isAuthorized() ? <Dashboard /> : <Intro />;
}

export default App;
