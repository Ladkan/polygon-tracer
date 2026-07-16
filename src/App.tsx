import React, { useState, useRef, useEffect } from "react";
import UploadControlls from "./components/UploadControlls";
import PolygonList from "./components/PolygonList";
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
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setNaturalSize({ width: img.width, height: img.height });
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
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

  // Handle click on the SVG element
  const handleSvgClick = (e) => {
    if (!svgRef.current || !naturalSize.width) return;

    const rect = svgRef.current.getBoundingClientRect();

    // Calculate click coordinates relative to the screen display
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Scale coordinates back to the image's original pixel dimensions
    const x = Math.round((clientX / rect.width) * naturalSize.width);
    const y = Math.round((clientY / rect.height) * naturalSize.height);

    setCurrentPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  // Save the current polygon
  const savePolygon = () => {
    if (currentPoints.length < 3) {
      alert("A polygon needs at least 3 points.");
      return;
    }
    setPolygons([
      ...polygons,
      { id: Date.now(), name: polyName, points: currentPoints },
    ]);
    setCurrentPoints([]);
    setPolyName(`Polygon ${polygons.length + 2}`);
  };

// Remove polygon

  const handleRemovePolygon = (id) => {
    setPolygons((prev) => prev.filter((poly) => poly.id !== id))
  }

  // --- Export Utilities ---

  // 1. Export as JSON Points
  const copyJSON = async (points) => {
    const jsonStr = JSON.stringify(points, null, 2);
    await copyText(jsonStr, "JSON coordinates");
  };

  // 2. Export as Responsive CSS clip-path
  const copyCSSClipPath = async (points) => {
    if (!naturalSize.width || !naturalSize.height) return;
    const pathStr = points
      .map((p) => {
        const xPercent = ((p.x / naturalSize.width) * 100).toFixed(1);
        const yPercent = ((p.y / naturalSize.height) * 100).toFixed(1);
        return `${xPercent}% ${yPercent}%`;
      })
      .join(", ");

    const cssString = `clip-path: polygon(${pathStr});`;
    await copyText(cssString, "CSS clip-path");
  };

  // 3. Export as pure SVG <polygon> element tag
  const copySVGTag = async (points) => {
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
    const svgString = `<polygon points="${pointsStr}" fill="rgba(59, 130, 246, 0.4)" stroke="#2563eb" stroke-width="2" />`;
    await copyText(svgString, "SVG polygon element");
  };

  // Generic Clipboard helper
  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatPoints = (points) => points.map((p) => `${p.x},${p.y}`).join(" ");

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
    // <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen min-w-screen bg-gray-50 font-sans">
    //   {/* Left Column: Drawing Workspace */}
    //   <div>
    //     {image && (
    //       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    //         <div className="flex flex-wrap items-center gap-4 mb-4">
    //           <input
    //             type="text"
    //             value={polyName}
    //             onChange={(e) => setPolyName(e.target.value)}
    //             placeholder="Polygon Name"
    //             className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           />
    //           <button
    //             onClick={savePolygon}
    //             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
    //           >
    //             Save Polygon
    //           </button>
    //           <button
    //             onClick={() => setCurrentPoints([])}
    //             className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm transition-colors"
    //           >
    //             Clear Points
    //           </button>
    //         </div>

    //         {/* SVG Workspace Container */}
    //         <div className="border border-gray-300 rounded overflow-hidden bg-gray-100 select-none">
    //           <svg
    //             ref={svgRef}
    //             viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
    //             width="100%"
    //             height="auto"
    //             onClick={handleSvgClick}
    //             className="cursor-crosshair block max-w-full"
    //           >
    //             {/* 1. The Image inside the SVG */}
    //             <image
    //               href={image}
    //               width={naturalSize.width}
    //               height={naturalSize.height}
    //               x="0"
    //               y="0"
    //             />

    //             {/* 2. Render Saved Polygons */}
    //             {polygons.map((poly) => (
    //               <g key={poly.id}>
    //                 <polygon
    //                   points={formatPoints(poly.points)}
    //                   fill="rgba(59, 130, 246, 0.4)"
    //                   stroke="#2563eb"
    //                   strokeWidth={Math.max(2, naturalSize.width / 400)}
    //                 />
    //                 <text
    //                   x={poly.points[0].x}
    //                   y={poly.points[0].y - naturalSize.height / 100}
    //                   fill="#1e3a8a"
    //                   fontSize={Math.max(12, naturalSize.width / 80)}
    //                   className="font-bold font-sans drop-shadow-lg"
    //                 >
    //                   {poly.name}
    //                 </text>
    //               </g>
    //             ))}

    //             {/* 3. Render Current Drawing Paths */}
    //             {currentPoints.length > 0 && (
    //               <polyline
    //                 points={formatPoints(currentPoints)}
    //                 fill="none"
    //                 stroke="#ef4444"
    //                 strokeWidth={Math.max(2, naturalSize.width / 300)}
    //                 strokeDasharray={`${naturalSize.width / 150}`}
    //               />
    //             )}

    //             {/* 4. Render Current Drawing Handle Points */}
    //             {currentPoints.map((pt, index) => (
    //               <circle
    //                 key={index}
    //                 cx={pt.x}
    //                 cy={pt.y}
    //                 r={Math.max(5, naturalSize.width / 150)}
    //                 fill="#ef4444"
    //                 stroke="white"
    //                 strokeWidth={Math.max(1, naturalSize.width / 600)}
    //               />
    //             ))}
    //           </svg>
    //         </div>
    //         <p className="text-sm text-gray-500 mt-2">
    //           Click on the image to add points. Coordinates map to native image
    //           resolutions.
    //         </p>
    //       </div>
    //     )}
    //   </div>

    //   {/* Right Column: List of Saved Polygons */}
    //   <div className="w-full lg:w-96 space-y-4">
    //     <UploadControlls handleImageUpload={handleImageUpload} />
    //     <PolygonList handleRemovePolygon={handleRemovePolygon} polygons={polygons} copyCSSClipPath={copyCSSClipPath} copyJSON={copyJSON} copySVGTag={copySVGTag} />
    //   </div>
    // </div>
    <>
      <ToolBar resetViewport={resetViewport} scale={scale} setToolMode={setToolMode} toolMode={toolMode} />
      <DrawControlls currentPoints={currentPoints} polyName={polyName} savePolygon={savePolygon} setCurrentPoints={setCurrentPoints} setPolyName={setPolyName} />
      <SavedPolygons copyCSS={copyCSSClipPath} copyJSON={copyJSON} copySVG={copySVGTag} deletePolygon={handleRemovePolygon} handleImageUpload={handleImageUpload} polygons={polygons} />
      <ImageArea pan={pan} setPan={setPan} setScale={setScale} scale={scale} setToolMode={setToolMode} toolMode={toolMode} image={image} polygons={polygons} svgRef={svgRef} handleImageUpload={handleImageUpload} setCurrentPoints={setCurrentPoints} currentPoints={currentPoints} formatPoints={formatPoints} naturalSize={naturalSize} />
    </>
  );
}
