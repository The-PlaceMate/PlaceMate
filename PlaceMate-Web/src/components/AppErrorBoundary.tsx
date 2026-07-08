import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error?: Error;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PlaceMate render error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="pm-error-page">
          <section className="pm-error-card">
            <div className="pm-side-brand" style={{ height: "auto", padding: 0, borderBottom: 0 }}>
              <div className="pm-brand-mark">P</div>
              <div className="pm-brand-name">
                Place<span>Mate</span>
              </div>
            </div>
            <h1>PlaceMate could not open this page</h1>
            <p>{this.state.error.message || "A runtime error stopped the app from rendering."}</p>
            <button className="pm-btn primary" onClick={() => window.location.assign("/")}>
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
