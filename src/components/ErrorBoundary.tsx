import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "20px", 
          fontFamily: "Arial", 
          background: "#000", 
          color: "#fff", 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h1>❌ Something went wrong</h1>
          <p style={{ color: "#ff6b6b", marginTop: "10px" }}>
            {this.state.error?.message || "Unknown error"}
          </p>
          <pre style={{ 
            background: "#1a1a1a", 
            padding: "15px", 
            borderRadius: "5px", 
            marginTop: "20px",
            overflow: "auto",
            maxWidth: "80%"
          }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: "10px 20px", 
              marginTop: "20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;






