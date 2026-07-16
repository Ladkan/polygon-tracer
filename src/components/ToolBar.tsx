
interface ToolBarProps{
  toolMode: any;
  setToolMode: (e: any) => void;
  resetViewport: (e: any) => void;
  scale: any;
}

export default function ToolBar({setToolMode, toolMode, resetViewport, scale}: ToolBarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-full border border-gray-800 shadow-2xl z-20">
                <button
                  onClick={() => setToolMode('draw')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    toolMode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Draw Tool
                </button>
                <button
                  onClick={() => setToolMode('pan')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    toolMode === 'pan' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Tip: Hold Spacebar to Pan instantly"
                >
                  Pan Tool
                </button>
                <div className="h-4 w-px bg-gray-800 mx-1"></div>
                <button
                  onClick={resetViewport}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white font-semibold cursor-pointer"
                >
                  Reset Fit ({Math.round(scale * 100)}%)
                </button>
              </div>
  )
}
