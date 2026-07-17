import { useState, useRef } from "react";
import ImageArea from "./components/ImageArea";
import ToolBar from "./components/ToolBar";
import SavedPolygons from "./components/SavedPolygons";
import { getRandomHexColor } from "./utils";
import { type Point2D, type Polygon } from "./types/polygon.t"
import EditPolygon from "./components/EditPolygon";

export default function App() {
  const [image, setImage] = useState(null);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point2D[]>([]);
  const [polyName, setPolyName] = useState("Polygon 1");

  // Track the original, natural dimensions of the uploaded image
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

      const [toolMode, setToolMode] = useState('draw'); // 'draw' or 'pan' or 'select'
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  const [activePoly, setActivePoly] = useState<number>();

  // Handle image upload and measure original dimensions
  const handleImageUpload = (e:any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setNaturalSize({ width: img.width, height: img.height });
            //@ts-expect-error
            setImage(event.target.result);
            setPolygons([]);
            setCurrentPoints([]);

            // Center and scale image to fit screen
            const vWidth = window.innerWidth;
            const vHeight = window.innerHeight;
            const scaleX = (vWidth * 0.8) / img.width;
            const scaleY = (vHeight * 0.8) / img.height;
            const initialScale = Math.min(scaleX, scaleY, 1);

            setScale(initialScale);
            setPan({
              x: (vWidth - img.width * initialScale) / 2,
              y: (vHeight - img.height * initialScale) / 2
            });
          };
          //@ts-expect-error
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

  // Save the current polygon
  const savePolygon = () => {
    if (currentPoints.length < 3) {
      alert("A polygon needs at least 3 points.");
      return;
    }
    setPolygons([
      ...polygons,
      { id: Date.now(), name: polyName, points: currentPoints, color: getRandomHexColor() },
    ]);
    setCurrentPoints([]);
    setPolyName(`Polygon ${polygons.length + 2}`);
  };

// Remove polygon

  const handleRemovePolygon = (id: number) => {
    setPolygons((prev) => prev.filter((poly) => poly.id !== id))
  }

  // --- Export Utilities ---

  // 1. Export as JSON Points
  const copyJSON = async (points: Point2D[]) => {
    const jsonStr = JSON.stringify(points, null, 2);
    await copyText(jsonStr, "JSON coordinates");
  };

  // 2. Export as Responsive CSS clip-path
  const copyCSSClipPath = async (points: Point2D[], name: string) => {
    if (!naturalSize.width || !naturalSize.height) return;
    const pathStr = points
      .map((p:Point2D) => {
        const xPercent = ((p.x / naturalSize.width) * 100).toFixed(1);
        const yPercent = ((p.y / naturalSize.height) * 100).toFixed(1);
        return `${xPercent}% ${yPercent}%`;
      })
      .join(", ");

    const cssString = `clip-path: polygon(${pathStr}); //${name}`;
    await copyText(cssString, "CSS clip-path");
  };

  // 3. Export as pure SVG <polygon> element tag
  const copySVGTag = async (points:Point2D[], name: string) => {
    const pointsStr = points.map((p:Point2D) => `${p.x},${p.y}`).join(" ");
    const svgString = `<polygon points="${pointsStr}" fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" stroke-width="2" /> //${name}`;
    await copyText(svgString, "SVG polygon element");
  };

  // Generic Clipboard helper
  const copyText = async (text:string, label:string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatPoints = (points:Point2D[]) => points.map((p:Point2D) => `${p.x},${p.y}`).join(" ");

  const resetViewport = () => {
      const vWidth = window.innerWidth;
      const vHeight = window.innerHeight;
      const scaleX = (vWidth * 0.8) / naturalSize.width;
      const scaleY = (vHeight * 0.8) / naturalSize.height;
      const initialScale = Math.min(scaleX, scaleY, 1);
      setScale(initialScale);
      setPan({
        x: (vWidth - naturalSize.width * initialScale) / 2,
        y: (vHeight - naturalSize.height * initialScale) / 2
      });
    };

  const activePolygonData = polygons.find((poly: Polygon) => poly.id === activePoly);

  const updatePolygon = (updatedPoly: Polygon) => {
    setPolygons((prev) =>
      prev.map((poly: any) =>
        poly.id === updatedPoly.id ? updatedPoly : poly
      )
    );
  };

  return (
    <>
      <div className="absolute">
        <div className="flex gap-4">
          <SavedPolygons
            activePoly={activePoly}
            setActivePoly={setActivePoly}
            currentPoints={currentPoints}
            polyName={polyName}
            savePolygon={savePolygon}
            setCurrentPoints={setCurrentPoints}
            setPolyName={setPolyName}
            deletePolygon={handleRemovePolygon}
            handleImageUpload={handleImageUpload}
            polygons={polygons} />
          <ToolBar
            resetViewport={resetViewport}
            scale={scale}
            setToolMode={setToolMode}
            toolMode={toolMode} />
        </div>
      </div>
      <div className="absolute right-0 z-40">
        {activePolygonData && (
          <EditPolygon
            activePolygonData={activePolygonData}
            copyCSSClipPath={copyCSSClipPath}
            copyJSON={copyJSON}
            copySVGTag={copySVGTag}
            setActivePoly={setActivePoly}
            updatePolygon={updatePolygon}
            handleRemovePolygon={handleRemovePolygon}
          />
        )}
      </div>
      <ImageArea
        pan={pan}
        setPan={setPan}
        setScale={setScale}
        scale={scale}
        setToolMode={setToolMode}
        toolMode={toolMode}
        image={image}
        polygons={polygons}
        svgRef={svgRef}
        handleImageUpload={handleImageUpload}
        setCurrentPoints={setCurrentPoints}
        currentPoints={currentPoints}
        formatPoints={formatPoints}
        naturalSize={naturalSize}
        setActivePoly={setActivePoly}
      />
    </>
  );
}
