import { useRef, useState } from "react";
import ImageArea from "./components/ImageArea";
import ToolBar from "./components/ToolBar";
import SavedPolygons from "./components/SavedPolygons";
import { type Point2D } from "./types/polygon.t"
import EditPolygon from "./components/EditPolygon";
import { usePolygonTracer } from "./Context/PolygonContext";
import Modal from "./components/Modal";

export default function App() {

  const [modalState, setModalState] = useState<boolean>(false)

  const {
    naturalSize,
    polygons,
    activePolygonData,
    loadImage,
    addPolygon,
    setViewport,
    image
  } = usePolygonTracer()

  const svgRef = useRef(null);

  // Handle image upload and measure original dimensions
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {

          // Center and scale image to fit screen
          const vWidth = window.innerWidth;
          const vHeight = window.innerHeight;
          const scaleX = (vWidth * 0.8) / img.width;
          const scaleY = (vHeight * 0.8) / img.height;
          const initialScale = Math.min(scaleX, scaleY, 1);

          loadImage(
            event.target?.result as string,
            { width: img.width, height: img.height },
            {
              scale: initialScale,
              pan: {
                x: (vWidth - img.width * initialScale) / 2,
                y: (vHeight - img.height * initialScale) / 2,
              }
            }
          )

        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const createPolygon = () => {

    if (!image) {
      alert("Select image first")
      return
    }

    addPolygon(`Polygon ${polygons.length + 1}`)
  }

  const formatPoints = (points:Point2D[]) => points.map((p:Point2D) => `${p.x},${p.y}`).join(" ");

  const resetViewport = () => {
      const vWidth = window.innerWidth;
      const vHeight = window.innerHeight;
      const scaleX = (vWidth * 0.8) / naturalSize.width;
      const scaleY = (vHeight * 0.8) / naturalSize.height;
      const initialScale = Math.min(scaleX, scaleY, 1);
    setViewport({
      scale: initialScale,
      pan: {
        x: (vWidth - naturalSize.width * initialScale) / 2,
        y: (vHeight - naturalSize.height * initialScale) / 2,
      }
      })
    };

  return (
    <>
      <div className="absolute">
        <div className="flex gap-4">
          <SavedPolygons
            createPolygon={createPolygon}
            handleImageUpload={handleImageUpload} />
          <ToolBar
            resetViewport={resetViewport}
            setModal={setModalState}
          />
        </div>
      </div>
      <div className="absolute right-0 z-40">
        {activePolygonData && (
          <EditPolygon />
        )}
      </div>
      <ImageArea
        svgRef={svgRef}
        handleImageUpload={handleImageUpload}
        formatPoints={formatPoints}
      />
      <Modal isOpen={modalState} setState={setModalState} >
        <div className="space-y-6 text-[#c1c6d7]">
          <h2 className="text-xl font-bold text-white border-b border-[#414755] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4ae176]">tune</span>
            Polygon Controls Guide
          </h2>
          <section className="space-y-3">
                <h3 className="text-sm font-semibold text-[#4ae176] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">keyboard</span>
                  Quick Mode Switching
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-[#2a2a2a] p-2.5 rounded-lg border border-[#414755] flex items-center justify-between">
                    <span className="text-white">Select mode</span>
                    <kbd className="bg-[#393939] text-white px-2 py-0.5 rounded text-xs border border-[#414755]">V</kbd>
                  </div>
                  <div className="bg-[#2a2a2a] p-2.5 rounded-lg border border-[#414755] flex items-center justify-between">
                    <span className="text-white">Draw mode</span>
                    <kbd className="bg-[#393939] text-white px-2 py-0.5 rounded text-xs border border-[#414755]">P / D</kbd>
                  </div>
                </div>
              </section>
          <section className="space-y-3">
            <h3 className="text-md font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">adjust</span>
              Point Operations
            </h3>
            <ul className="space-y-2 text-sm pl-2">
              <li className="flex items-start gap-2">
                <span className="text-[#4ae176] font-bold">•</span>
                <span>
                  <strong className="text-white">Delete a Point:</strong> Hover over a point in <span className="bg-[#393939] px-1.5 py-0.5 rounded text-xs text-white">Draw</span> or <span className="bg-[#393939] px-1.5 py-0.5 rounded text-xs text-white">Select</span> mode and press <kbd className="bg-[#393939] text-white px-2 py-0.5 rounded text-xs border border-[#414755]">Delete</kbd>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ae176] font-bold">•</span>
                <span>
                  <strong className="text-white">Move a Point:</strong> Hover over a point in <span className="bg-[#393939] px-1.5 py-0.5 rounded text-xs text-white">Draw</span> or <span className="bg-[#393939] px-1.5 py-0.5 rounded text-xs text-white">Select</span> mode, then <strong className="text-white">right-click and drag</strong> it.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ae176] font-bold">•</span>
                <span>
                  <strong className="text-white">Add a Point:</strong> Switch to <span className="bg-[#393939] px-1.5 py-0.5 rounded text-xs text-white">Select</span> mode and <strong className="text-white">right-click on any line segment</strong> (finished or in-progress).
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-md font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">polyline</span>
              Polygon Operations
            </h3>
            <ul className="space-y-2 text-sm pl-2">
              <li className="flex items-start gap-2">
                <span className="text-[#4ae176] font-bold">•</span>
                <span>
                  <strong className="text-white">Close a Polygon:</strong> Click near the <strong className="text-white">first point</strong> of your path while drawing.
                </span>
              </li>
            </ul>
          </section>

          <div className="bg-[#2a2a2a] border border-[#414755] p-3 rounded-lg flex items-center gap-3 text-xs">
            <span className="material-symbols-outlined text-[#4ae176]">lightbulb</span>
            <span>
              <strong className="text-white">Pro-Tip:</strong> Hold <kbd className="bg-[#393939] text-white px-1.5 py-0.5 rounded border border-[#414755]">Spacebar</kbd> at any time to temporarily switch to Pan mode.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
