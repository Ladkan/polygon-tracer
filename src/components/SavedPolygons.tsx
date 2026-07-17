
interface SavedPolygonsProps{
  handleImageUpload: (e: any) => void;
  deletePolygon: (e: any) => void;
  savePolygon: (e: any) => void;
  setCurrentPoints: (e: any) => void;
  setPolyName: (e: any) => void;
  setActivePoly: React.Dispatch<React.SetStateAction<number | undefined>>;
  polygons: any[];
  currentPoints: any[];
  polyName: any;
  activePoly: any;
}

export default function SavedPolygons({setActivePoly,activePoly,deletePolygon,handleImageUpload,polygons,currentPoints,savePolygon,setCurrentPoints,setPolyName,polyName}: SavedPolygonsProps) {

  return (
    <div className="w-80 h-screen bg-[#1b1b1c] flex flex-col z-20 overflow-hidden border-r border-[#1b1b1c]">

      <div className="border-b border-[#414755] p-3">
        <label
          className="cursor-pointer w-full py-2 bg-[#353535] text-[#e5e2e1] border border-[#414755] rounded flex items-center justify-center gap-2 hover:bg-[#393939] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          <span className="font-semibold leading-4 tracking-wider text-[11px]">Upload image</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      <div className="flex flex-col overflow-y-auto">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7]">Polygons ({polygons.length})</span>
        </div>
        <div className="space-y-0.5">
          {polygons.length === 0 ? (
            <p className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] text-center">No polygons saved yet.</p>
          ): (
              polygons.map((poly) => (
                <div
                  onClick={() => setActivePoly(poly.id)}
                  key={poly.id}
                  className="px-3 py-2 border-l-4 flex items-center justify-between group cursor-pointer"
                  style={{
                    borderColor: poly.color,
                    backgroundColor: activePoly === poly.id ? `${poly.color}1a` : "transparent"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: poly.color}}></div>
                    <div>
                      <p className="text-[#e5e2e1]">{poly.name}</p>
                      <p className="font-normal leading-4 text-[12px] text-[#c1c6d7]">{poly.points.length} Points</p>
                    </div>
                  </div>
                  <button onClick={() => deletePolygon(poly.id)} className="flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 text-[#c1c6d7] p-1 hover:bg-[#93000a] hover:text-[#ffdad6] rounded transition-all">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[#414755] p-2 space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={polyName}
            onChange={(e) => setPolyName(e.target.value)}
            placeholder="Polygon Name"
            className="flex-1 w-full h-8 bg-[#202020] text-[#e5e2e1] border border-[#414755] rounded px-2 focus:ring-1 focus:ring-[#4ae176] focus:border-[#4ae176] outline-none transition-all"
          />
          <button
            onClick={savePolygon}
            className="bg-[#4ae176] hover:opacity-90 text-[#003915] font-bold px-4 rounded text-xs transition-colors shrink-0 cursor-pointer"
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
            className="text-xs text-[#ffb4ab] transition-colors cursor-pointer"
          >
            Clear Working Points
          </button>
        </div>
      </div>
  </div>
  )
}
