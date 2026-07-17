import React, { useEffect, useRef, useState } from "react";
import type { Point2D } from "../types/polygon.t";

interface ImageAreaProps{
  image: any;
  svgRef: any;
  polygons: any[];
  handleImageUpload: (e: any) => void;
  setCurrentPoints: React.Dispatch<React.SetStateAction<Point2D[]>>;
  naturalSize: any;
  formatPoints: (e: Point2D[]) => string | undefined;
  currentPoints: Point2D[];
  scale: any;
  toolMode: string;
  setToolMode: (e: any) => void;
  setScale: (e: any) => void;
  pan: any;
  setPan: (e: any) => void;
  setActivePoly: (e: number) => void;
}

export default function ImageArea({ setActivePoly, pan, setPan, setScale, image, svgRef, polygons, handleImageUpload, setCurrentPoints, naturalSize, formatPoints, currentPoints, scale, setToolMode, toolMode }: ImageAreaProps) {

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const lastToolRef = useRef<string | null>(null);
  const currentToolRef = useRef(toolMode);

  useEffect(() => {
      currentToolRef.current = toolMode;
    }, [toolMode]);

  useEffect(() => {
      const svgEl = svgRef.current;
      if (svgEl) {
        svgEl.addEventListener('wheel', handleWheel, { passive: false });
      }
      return () => {
        if (svgEl) svgEl.removeEventListener('wheel', handleWheel);
      };
    }, [image, scale, pan]);

  useEffect(() => {
      const handleKeyDown = (e:KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault();

          if (currentToolRef.current !== "pan") {
            lastToolRef.current = currentToolRef.current
            setToolMode("pan")
          }
        }
      };
      const handleKeyUp = (e:KeyboardEvent) => {
        if (e.code === 'Space') {
          if (lastToolRef.current !== null) {
            setToolMode(lastToolRef.current)
            lastToolRef.current = null
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [setToolMode]);

  const handleWheel = (e:any) => {
      if (!image || !svgRef.current) return;
      e.preventDefault();

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Translate screen coords to image coordinate space
      const imageX = (mouseX - pan.x) / scale;
      const imageY = (mouseY - pan.y) / scale;

      const zoomFactor = 1.1;
      const nextScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
      const boundedScale = Math.min(Math.max(nextScale, 0.05), 50); // Min 5%, Max 5000%

      // Re-pan so the cursor stays anchored to the same pixel point during zoom
      const nextPanX = mouseX - imageX * boundedScale;
      const nextPanY = mouseY - imageY * boundedScale;

      setScale(boundedScale);
      setPan({ x: nextPanX, y: nextPanY });
    };

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement>) => {
      if (!image) return;

      if (toolMode === 'pan' || e.button === 1 || e.button === 2) {
        // Pan with Left Click (in Pan Mode) OR Middle / Right Click anytime
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        e.preventDefault();
      }
    };

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        setIsDragging(false);
        return;
      }

      if (toolMode === 'draw' && e.button === 0) {
        // Only draw on clean left click
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Inverse calculations to map click to native pixel coordinates
        const x = Math.round((clientX - pan.x) / scale);
        const y = Math.round((clientY - pan.y) / scale);

        setCurrentPoints((prevPoints) => [...prevPoints, { x, y }]);
      }
    };

  return (
    <div className="relative w-screen h-screen imagearea-container overflow-hidden select-none">
      <div className="absolute inset-0 w-full h-full">
        {image ? (
          <svg
                      ref={svgRef}
                      className="w-full h-full block"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onContextMenu={(e) => e.preventDefault()} // Block browser context menu for panning
                      style={{ cursor: toolMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : toolMode === 'select' ? 'default' : 'crosshair' }}
                    >
                      {/* Inner group with calculated CSS translate and scale matrix */}
                      <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>

                        {/* Native Image */}
                        <image href={image} width={naturalSize.width} height={naturalSize.height} x="0" y="0" />

                        {/* Render Saved Polygons */}
                        {polygons.map((poly) => (
                          <g key={poly.id} style={{ cursor: toolMode === "select" ? 'pointer' : 'inherit' }}>
                            <polygon
                            onClick={() => toolMode === 'select' ? setActivePoly(poly.id) : ''}
                            className="pointer-events-auto polygon-overlay"
                              points={formatPoints(poly.points)}
                              fill={poly.color}
                              fillOpacity="20%"
                              stroke={poly.color}
                              strokeWidth={Math.max(1, 2 / scale)} // Dynamic stroke width so lines don't get super thick when zoomed in
                            />
                            <text
                              x={poly.points[0].x}
                              y={poly.points[0].y - 8 / scale}
                              fill={poly.color}
                              fontSize={Math.max(10, 12 / scale)}
                              className="font-bold drop-shadow-md select-none pointer-events-none"
                            >
                              {poly.name}
                            </text>
                          </g>
                        ))}

                        {/* Render Current In-Progress Lines */}
                        {currentPoints.length > 0 && (
                <polyline
                            points={formatPoints(currentPoints)}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={2 / scale}
                            strokeDasharray={`${4 / scale}, ${4 / scale}`}
                          />
                        )}

                        {/* Render Current In-Progress Anchor Points */}
                        {currentPoints.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={5 / scale}
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth={1 / scale}
                          />
                        ))}
                      </g>
                    </svg>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                      <div className="max-w-md bg-[#1b1b1c] border border-[#1b1b1c] p-8 rounded-2xl shadow-2xl">
                        <h1 className="text-2xl font-black mb-3 text-white tracking-wide">Image Polygon Annotator</h1>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                          Upload any high-res image. Drag to pan, scroll wheel to zoom, and click to draw pixel-perfect polygons.
                        </p>
                        <label className="block w-full bg-[#4ae176] hover:opacity-90 text-[#003915] font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors shadow-lg">
                          Choose Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
        )}
      </div>
    </div>
  )
}
