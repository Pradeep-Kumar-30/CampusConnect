import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ margin: "2rem", borderColor: "#dc2626" }}>
          <h2 style={{ color: "#fca5a5", marginTop: 0 }}>Something went wrong</h2>
          <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
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
