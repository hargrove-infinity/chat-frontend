import { Router } from "./components/navigation/Router";
import { AuthSync } from "./components/misc/AuthSync";

function App() {
  return (
    <>
      <AuthSync />
      <Router />
    </>
  );
}

export default App;
