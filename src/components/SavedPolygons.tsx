
interface SavedPolygonsProps{
  handleImageUpload: (e: any) => void;
  deletePolygon: (e: any) => void;
  copyJSON: (e: any) => void;
  copyCSS: (e: any) => void;
  copySVG: (e: any) => void;
  polygons: any[];
}

export default function SavedPolygons({copyCSS,copyJSON,copySVG,deletePolygon,handleImageUpload,polygons}: SavedPolygonsProps) {
  return (
  <div className="absolute top-6 right-6 bottom-6 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-800 shadow-2xl flex flex-col z-20 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-sm tracking-widest uppercase text-gray-300">Saved Polygons</h2>
                <label className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded cursor-pointer transition-colors">
                  New Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {polygons.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center mt-8">No polygons saved yet.</p>
                ) : (
                  polygons.map((poly) => (
                    <div key={poly.id} className="p-3 bg-gray-950 rounded-lg border border-gray-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-white truncate max-w-[150px]">
                          {poly.name}
                        </span>
                        <button
                          onClick={() => deletePolygon(poly.id)}
                          className="text-xs text-red-500 hover:text-red-400 font-bold px-2 py-0.5 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => copyJSON(poly.points)}
                          className="text-[10px] py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded font-bold cursor-pointer"
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => copyCSS(poly.points)}
                          className="text-[10px] py-1 bg-blue-950/40 hover:bg-blue-950/80 border border-blue-900/50 text-blue-300 rounded font-bold cursor-pointer"
                        >
                          CSS
                        </button>
                        <button
                          onClick={() => copySVG(poly.points)}
                          className="text-[10px] py-1 bg-green-950/40 hover:bg-green-950/80 border border-green-900/50 text-green-300 rounded font-bold cursor-pointer"
                        >
                          SVG
                        </button>
                      </div>
                    </div>
                  ))
                )}
      </div>
  </div>
  )
}
