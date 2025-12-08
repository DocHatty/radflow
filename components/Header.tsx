import React from "react";
import { useShallow } from "zustand/react/shallow";
import { SettingsIcon, NewCaseIcon, BugAntIcon } from "./Icons";
import SecondaryButton from "./SecondaryButton";
import IconButton from "./IconButton";
import { useWorkflowStore } from "../App";

const Header: React.FC = () => {
  // Use useShallow to prevent unnecessary re-renders
  const { activeProcess, resetWorkflow, toggleSettingsPanel, toggleDiagnosticsPanel } =
    useWorkflowStore(
      useShallow((state) => ({
        activeProcess: state.activeProcess,
        resetWorkflow: state.resetWorkflow,
        toggleSettingsPanel: state.toggleSettingsPanel,
        toggleDiagnosticsPanel: state.toggleDiagnosticsPanel,
      }))
    );

  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  const isBusy = activeProcess !== "idle";

  return (
    <header className="bg-(--color-base)/30 backdrop-blur-md p-3 sm:px-6 sticky top-0 z-50 flex items-center header-border transition-all duration-300 border-b border-white/5">
      {/* Empty spacer to balance the right side controls */}
      <div className="flex-1" />

      {/* Centered logo */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center cursor-pointer group" onClick={resetWorkflow}>
          <h1 className="text-3xl font-light tracking-[0.2em] text-white/90 font-header flex items-center drop-shadow-2xl transition-all duration-500 group-hover:text-white group-hover:scale-105">
            RAD<span className="text-indigo-400 ml-1 font-thin">FLOW</span>
          </h1>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mt-1 group-hover:w-24 transition-all duration-700"></div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-3">
        <div className="hidden xl:flex flex-col items-end mr-4 pr-4 border-r border-white/10">
          <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">
            Local Time
          </p>
          <p className="font-mono text-xs text-blue-200 font-semibold tracking-wider drop-shadow-md">
            {formattedTime}
          </p>
        </div>

        <SecondaryButton
          onClick={toggleSettingsPanel}
          disabled={isBusy}
          title="System Settings"
          className="hidden sm:flex !bg-white/5 !border-white/10 hover:!bg-white/10"
        >
          <SettingsIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Config</span>
        </SecondaryButton>

        <IconButton
          onClick={toggleSettingsPanel}
          disabled={isBusy}
          aria-label="Settings"
          title="Settings"
          className="sm:hidden !bg-white/5 !border-white/10"
        >
          <SettingsIcon className="h-5 w-5" />
        </IconButton>

        <IconButton
          onClick={toggleDiagnosticsPanel}
          disabled={isBusy}
          aria-label="Diagnostics"
          title="Diagnostics"
          className="!bg-white/5 !border-white/10"
        >
          <BugAntIcon className="h-5 w-5" />
        </IconButton>

        <button
          onClick={resetWorkflow}
          disabled={isBusy}
          title="New Case"
          className="flex items-center justify-center px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20 backdrop-blur-xl group relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shine_1s_infinite]"></span>
          <NewCaseIcon className="h-4 w-4 md:mr-2 relative z-10" />
          <span className="hidden md:inline relative z-10">New Case</span>
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);
