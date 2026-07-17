interface ToolBarProps {
  toolMode: any;
  setToolMode: (e: any) => void;
  resetViewport: (e: any) => void;
  scale: any;
}

export default function ToolBar({
  setToolMode,
  toolMode,
  resetViewport,
  scale,
}: ToolBarProps) {
  return (
    <div className="my-4 h-fit flex flex-col items-center gap-1 bg-[#2a2a2a] backdrop-blur-md p-1 border border-[#414755] shadow-lg rounded-lg z-20">
      <button
        title="Select"
        onClick={() => setToolMode("select")}
        className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${
          toolMode === "select"
            ? "bg-[#4ae176] text-[#003915] hover:opacity-90"
            : "text-[#c1c6d7] hover:bg-[#393939]"
        }`}
      >
        <span className="material-symbols-outlined">near_me</span>
      </button>
      <button
        title="Draw"
        onClick={() => setToolMode("draw")}
        className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${
          toolMode === "draw"
            ? "bg-[#4ae176] text-[#003915] hover:opacity-90"
            : "text-[#c1c6d7] hover:bg-[#393939]"
        }`}
      >
        <span className="material-symbols-outlined">polyline</span>
      </button>
      <button
        onClick={() => setToolMode("pan")}
        className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${
          toolMode === "pan"
            ? "bg-[#4ae176] text-[#003915] hover:opacity-90"
            : "text-[#c1c6d7] hover:bg-[#393939]"
        }`}
        title="Tip: Hold Spacebar to Pan instantly"
      >
        <span className="material-symbols-outlined">pan_tool</span>
      </button>
      <button
        onClick={resetViewport}
        title="Reset Viewport"
        className="w-10 h-10 flex items-center justify-center rounded text-[#c1c6d7] hover:bg-[#393939] cursor-pointer"
      >
        ({Math.round(scale * 100)}%)
      </button>
    </div>
  );
}
