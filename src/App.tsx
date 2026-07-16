import { useState, useRef } from "react";
import ImageArea from "./components/ImageArea";
import ToolBar from "./components/ToolBar";
import DrawControlls from "./components/DrawControlls";
import SavedPolygons from "./components/SavedPolygons";

export default function App() {
  const [image, setImage] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [polyName, setPolyName] = useState("Polygon 1");

  // Track the original, natural dimensions of the uploaded image
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

      const [toolMode, setToolMode] = useState('draw'); // 'draw' or 'pan'
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

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
      //@ts-expect-error
      ...polygons,
      //@ts-expect-error
      { id: Date.now(), name: polyName, points: currentPoints },
    ]);
    setCurrentPoints([]);
    setPolyName(`Polygon ${polygons.length + 2}`);
  };

// Remove polygon

  const handleRemovePolygon = (id: any) => {
    //@ts-expect-error
    setPolygons((prev) => prev.filter((poly) => poly.id !== id))
  }

  // --- Export Utilities ---

  // 1. Export as JSON Points
  const copyJSON = async (points: any) => {
    const jsonStr = JSON.stringify(points, null, 2);
    await copyText(jsonStr, "JSON coordinates");
  };

  // 2. Export as Responsive CSS clip-path
  const copyCSSClipPath = async (points: any) => {
    if (!naturalSize.width || !naturalSize.height) return;
    const pathStr = points
      .map((p:any) => {
        const xPercent = ((p.x / naturalSize.width) * 100).toFixed(1);
        const yPercent = ((p.y / naturalSize.height) * 100).toFixed(1);
        return `${xPercent}% ${yPercent}%`;
      })
      .join(", ");

    const cssString = `clip-path: polygon(${pathStr});`;
    await copyText(cssString, "CSS clip-path");
  };

  // 3. Export as pure SVG <polygon> element tag
  const copySVGTag = async (points:any) => {
    const pointsStr = points.map((p:any) => `${p.x},${p.y}`).join(" ");
    const svgString = `<polygon points="${pointsStr}" fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" stroke-width="2" />`;
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

  const formatPoints = (points:any) => points.map((p:any) => `${p.x},${p.y}`).join(" ");

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

  return (
    <>
      <ToolBar resetViewport={resetViewport} scale={scale} setToolMode={setToolMode} toolMode={toolMode} />
      <DrawControlls currentPoints={currentPoints} polyName={polyName} savePolygon={savePolygon} setCurrentPoints={setCurrentPoints} setPolyName={setPolyName} />
      <SavedPolygons copyCSS={copyCSSClipPath} copyJSON={copyJSON} copySVG={copySVGTag} deletePolygon={handleRemovePolygon} handleImageUpload={handleImageUpload} polygons={polygons} />
      <ImageArea pan={pan} setPan={setPan} setScale={setScale} scale={scale} setToolMode={setToolMode} toolMode={toolMode} image={image} polygons={polygons} svgRef={svgRef} handleImageUpload={handleImageUpload} setCurrentPoints={setCurrentPoints} currentPoints={currentPoints} formatPoints={formatPoints} naturalSize={naturalSize} />
    </>
  );
}
