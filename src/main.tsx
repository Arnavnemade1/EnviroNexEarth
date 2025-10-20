import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react'

// Basic error boundary to prevent full white screen on render errors
class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, message: err?.message ?? 'Something went wrong' };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('RootErrorBoundary caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-space flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{this.state.message}</p>
          <button className="px-4 py-2 border rounded glass" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children as any;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
