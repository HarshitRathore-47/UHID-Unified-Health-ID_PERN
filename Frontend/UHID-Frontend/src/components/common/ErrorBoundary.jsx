import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Crash:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong.
          </h2>

          <p className="text-slate-500 mb-6">
            This section failed to load. You can try again.
          </p>

          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-[#4a148c] text-white rounded-lg hover:bg-[#311b92] transition-all"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;