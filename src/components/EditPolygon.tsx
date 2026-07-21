import { usePolygonTracer } from "../Context/PolygonContext";
import type { Point2D } from "../types/polygon.t";
import { copyCSSClipPath, copyJSON, copySVGTag } from "../utils";

export default function EditPolygon() {

  const { activePolygonData, updatePolygon, removePolygon, selectPolygon, naturalSize } = usePolygonTracer();

  if(!activePolygonData) return

  return (
    <div className="h-screen bg-[#1b1b1c] flex flex-col z-20 overflow-hidden border-l border-[#1b1b1c] w-80">

      <div className="absolute top-0 right-0 p-3">
        <button
          onClick={() => selectPolygon(undefined)}
          className="text-[#c1c6d7] cursor-pointer hover:text-[#4ae176] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="p-3 border-b border-[#414755]">
        <div className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] mb-4">Properties</div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] px-1">Name</label>
            <input
              value={activePolygonData.name}
              onChange={(e) => {
                updatePolygon({
                  ...activePolygonData,
                  name: e.target.value
                });
              }}
              className="w-full h-8 bg-[#202020] text-[#e5e2e1] border border-[#414755] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary transition-all" type="text" />
          </div>
          <div className="space-y-1.5">
          <label className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] px-1">Stroke</label>
            <div className="flex items-center gap-2 bg-[#202020] border border-[#414755] rounded p-1">
              <input
                type="color"
                value={activePolygonData.color}
                onChange={(e) => {
                  updatePolygon({
                    ...activePolygonData,
                    color: e.target.value
                  });
                }}
                className="w-8 h-8 rounded border-0 cursor-pointer"
              />
              <span className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7]">{activePolygonData.color}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        <div className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] mb-4">Polygon Data</div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[#c1c6d7] border-b border-[#414755]">
              <th className="py-2 font-normal">Point</th>
              <th className="py-2 font-normal">X</th>
              <th className="py-2 font-normal">Y</th>
            </tr>
          </thead>
          <tbody className="text-[#e5e2e1]/80">
            {activePolygonData.points.map((p: Point2D, index: number) => (
              <tr key={index} className="border-b border-[#414755]/30 hover:bg-[#2a2a2a] transition-colors">
                <td className="py-1.5" >{index}</td>
                <td className="py-1.5" >{p.x}</td>
                <td className="py-1.5" >{p.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-[#414755]">
        <div className="font-semibold leading-4 tracking-wider text-[11px] text-[#c1c6d7] mb-4">Copy</div>
        <div className="flex gap-2">
          <button onClick={() => copySVGTag(activePolygonData.points, activePolygonData.name, activePolygonData.color)} className="cursor-pointer flex-1 py-2 bg-[#4ae176] hover:opacity-90 text-[#003915] rounded flex items-center justify-center gap-2  transition-all">
            <span className="font-semibold leading-4 tracking-wider text-[11px]">SVG Tag</span>
          </button>
          <button onClick={() => copyCSSClipPath(activePolygonData.points, activePolygonData.name, naturalSize)} className="cursor-pointer flex-1 py-2 bg-[#4ae176] hover:opacity-90 text-[#003915] rounded flex items-center justify-center gap-2  transition-all">
            <span className="font-semibold leading-4 tracking-wider text-[11px]">CSS ClipPath</span>
          </button>
          <button onClick={() => copyJSON(activePolygonData.points)} className="cursor-pointer flex-1 py-2 bg-[#4ae176] hover:opacity-90 text-[#003915] rounded flex items-center justify-center gap-2  transition-all">
            <span className="font-semibold leading-4 tracking-wider text-[11px]">JSON</span>
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[#414755] flex gap-2">
        <button onClick={() => removePolygon(activePolygonData.id)} className="cursor-pointer flex-1 py-2 bg-[#ffdad6] text-[#690005] border border-[#ffb4ab]/50 rounded flex items-center justify-center gap-2 hover:bg-[#ffb4ab] transition-all hover:text-[#690005]">
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span className="font-semibold leading-4 tracking-wider text-[11px]">Delete</span>
        </button>
      </div>
    </div>
  )
}
