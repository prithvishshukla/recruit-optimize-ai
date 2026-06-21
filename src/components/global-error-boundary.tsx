import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by GlobalErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-foreground antialiased selection:bg-primary/30">
          {/* Background decorative gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[40%] left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(184,146,74,0.08),transparent_70%)]" />
            <div className="absolute -bottom-[30%] right-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(42,143,139,0.08),transparent_70%)]" />
          </div>

          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121214]/60 p-8 text-center shadow-2xl backdrop-blur-xl md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 text-destructive mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              An unexpected runtime error occurred. We have captured this error and are looking into
              it.
            </p>

            {this.state.error && (
              <div className="mt-6 rounded-xl border border-white/5 bg-[#18181b]/50 p-4 text-left font-mono text-[12px] leading-relaxed text-zinc-500 overflow-x-auto max-h-36">
                <span className="text-red-400 font-semibold">{this.state.error.name}:</span>{" "}
                {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] text-zinc-600 overflow-x-auto whitespace-pre">
                    {this.state.error.stack.split("\n").slice(0, 4).join("\n")}
                  </pre>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/95 active:scale-[0.98]"
              >
                Go to home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
