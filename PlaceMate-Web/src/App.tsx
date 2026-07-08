import { useEffect } from "react";

import AppErrorBoundary from "./components/AppErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}

export default App;
