
interface DrawControllsProps{
  polyName: any;
  currentPoints: any[];
  setPolyName: (e: any) => void;
  savePolygon: (e: any) => void;
  setCurrentPoints: (e: any) => void;
}

export default function DrawControlls({currentPoints,polyName,savePolygon,setCurrentPoints,setPolyName}:DrawControllsProps) {
  return (
    <div className="absolute bottom-6 left-6 bg-gray-900/95 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-2xl space-y-3 z-20 w-80">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={polyName}
                    onChange={(e) => setPolyName(e.target.value)}
                    placeholder="Polygon Name"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={savePolygon}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 rounded text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Current Points: <strong className="text-white">{currentPoints.length}</strong>
                  </span>
                  <button
                    onClick={() => setCurrentPoints([])}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Clear Working Points
                  </button>
                </div>
              </div>
  )
}
