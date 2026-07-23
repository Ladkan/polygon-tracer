import React, { useEffect, useRef, useState } from "react";
import type { Point2D, Polygon, PolyIdIdx } from "../types/polygon";
import { distanceToSegment, getPoint, isInputFocused } from "../utils";
import { usePolygonTracer } from "../Context/PolygonContext";
import type { ToolMode } from "../Context/PolygonReducer";

interface ImageAreaProps{
  svgRef: any;
  handleImageUpload: (e: any) => void;
  formatPoints: (e: Point2D[]) => string | undefined;
}

export default function ImageArea({ svgRef,handleImageUpload, formatPoints }: ImageAreaProps) {

  const { activePolygonData, toolMode, setToolMode, image, viewport, setViewport, naturalSize, selectPolygon, polygons, activePoly, updatePolygon } = usePolygonTracer()

  const { scale, pan } = viewport

  const setPan = (nextPan: { x: number; y: number }) => setViewport({ scale, pan: nextPan })

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const lastToolRef = useRef<ToolMode | null>(null);
  const currentToolRef = useRef(toolMode);

  const [dragInfo, setDragInfo] = useState<PolyIdIdx | null>(null);
  const [hover, setHover] = useState<PolyIdIdx | null>(null);

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
    }, [image, viewport.scale, viewport.pan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      if (e.code === 'Space') {
        e.preventDefault()

        if (currentToolRef.current !== "pan") {
          lastToolRef.current = currentToolRef.current
          setToolMode("pan")
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (e.code === "KeyV" || key === "v") {
        setToolMode("select");
      } else if (e.code === "KeyP" || key === "p" || e.code === "KeyD" || key === "d") {
        setToolMode("draw");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isInputFocused()) return

      if (e.code === 'Space') {
        if (lastToolRef.current !== null){
          setToolMode(lastToolRef.current)
          lastToolRef.current = null
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    };
  }, [setToolMode]);

  useEffect(() => {
    if (!dragInfo) return

    const onMove = (e: any) => {
      if (!svgRef.current) return;
      if(!activePolygonData) return
      if(currentToolRef.current === "pan") return
      const point = getPoint(svgRef,e,viewport.scale,viewport.pan)

      updatePolygon({ ...activePolygonData, points: activePolygonData?.points.map((pt, i) => i === dragInfo.pointIndex ? point : pt) })

    }

    const onUp = () => setDragInfo(null)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  },[dragInfo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(isInputFocused()) return
      if(!activePolygonData) return
      if (hover?.polyId !== activePolygonData?.id) return
      if (e.code === "Delete") {
        e.preventDefault()
        if (currentToolRef.current === "draw" || currentToolRef.current === "select") {
          //@ts-ignore
          const nextPoints = activePolygonData.points.filter((p, i) => i !== hover.pointIndex)

          const shouldOpen = nextPoints.length < 3 && activePolygonData.closed

          updatePolygon({ ...activePolygonData, points: nextPoints, closed: shouldOpen ? false : activePolygonData.closed })
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if(!activePolygonData) return
      if (hover?.polyId !== activePolygonData?.id) return
      if (e.code === "Delete") {
        if (hover !== null) {
          setHover(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hover, activePolygonData])

  const handleWheel = (e:any) => {
      if (!image || !svgRef.current) return;
      e.preventDefault();

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Translate screen coords to image coordinate space
      const imageX = (mouseX - viewport.pan.x) / viewport.scale;
      const imageY = (mouseY - viewport.pan.y) / viewport.scale;

      const zoomFactor = 1.1;
      const nextScale = e.deltaY < 0 ? viewport.scale * zoomFactor : viewport.scale / zoomFactor;
      const boundedScale = Math.min(Math.max(nextScale, 0.05), 50); // Min 5%, Max 5000%

      // Re-pan so the cursor stays anchored to the same pixel point during zoom
      const nextPanX = mouseX - imageX * boundedScale;
      const nextPanY = mouseY - imageY * boundedScale;

      setViewport({ scale: boundedScale, pan: { x: nextPanX, y: nextPanY } })
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

  const distToPointPx = (imgPoint: Point2D, clientX: number, clientY: number) => {
    if (!svgRef.current) return Infinity;
    const rect = svgRef.current.getBoundingClientRect();
    const screenX = rect.left + pan.x + imgPoint.x * scale;
    const screenY = rect.top + pan.y + imgPoint.y * scale;
    return Math.hypot(screenX - clientX, screenY - clientY);
  };

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        setIsDragging(false);
        return;
      }

      if(dragInfo) return

      if(!activePolygonData || activePolygonData?.closed) return

      if (toolMode === 'draw' && e.button === 0) {
        // Only draw on clean left click
        if (!svgRef.current) return;
        const point = getPoint(svgRef,e,scale,pan)

        if (
          activePolygonData.points.length >= 3 &&
          distToPointPx(activePolygonData.points[0], e.clientX, e.clientY) < 15
        ) {
          updatePolygon({ ...activePolygonData, closed: true })
          return
        }

        updatePolygon({ ...activePolygonData, points: [...activePolygonData.points, point] })
      }
    };

  const handlePointMouseDown = (polyId: number, idx: number) => (e: any) => {
    e.stopPropagation()
    setDragInfo({ polyId, pointIndex: idx })
  }

  const handleEdgeClick = (poly: Polygon, e: React.MouseEvent) => {
    if(!activePolygonData) return
    if (currentToolRef.current !== "select") return
    e.stopPropagation()

    if(!svgRef.current) return
    const point = getPoint(svgRef,e,scale,pan)

    let bestIndex = -1;
    let minDistance = 15 / scale;
    const points = poly.points;

    for (let i = 0; i < points.length; i++){
      const a = points[i]

      const nextIdx = (i + 1) % points.length
      if (!poly.closed && i === points.length - 1) continue

      const b = points[nextIdx]
      const dist = distanceToSegment(point, a, b)

      if (dist < minDistance) {
        minDistance = dist
        bestIndex = i + 1
      }

    }

    if (bestIndex !== -1) {
      const nextPoints = [...poly.points]
      nextPoints.splice(bestIndex, 0, point)
      updatePolygon({...activePolygonData, points: nextPoints})
    }

  }

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
              {polygons.map((poly) => {
                if (poly.points.length === 0) return null;

                const isActive = poly.id === activePoly

                const Component = poly.closed ? 'polygon' : 'polyline';

                return (
                  <g key={poly.id} style={{ cursor: toolMode === "select" ? 'pointer' : 'inherit' }}>
                    <Component
                          onClick={() => toolMode === 'select' ? selectPolygon(poly.id) : ''}
                          className="pointer-events-auto polygon-overlay"
                          points={formatPoints(poly.points)}
                          fill={poly.closed ? `${poly.color}` : "none"}
                          fillOpacity={isActive ? 0.22 : 0.12}
                          strokeOpacity={isActive ? 1 : 0.55}
                          stroke={poly.color}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={Math.max(1, 2 / scale)}
                    />

                    {isActive && (
                      <Component
                                onClick={(e) => handleEdgeClick(poly, e)}
                                points={formatPoints(poly.points)}
                                fill="none"
                                stroke="transparent"
                                strokeWidth={Math.max(10, 15 / scale)}
                                style={{ cursor: toolMode === "select" ? "cell" : "inherit" }}
                              />
                    )}

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
                )
              })}


              {polygons.map((poly) => {
                const isActive = poly.id === activePoly
                if(activePolygonData?.points.length === undefined) return
                return poly.points.map((p: Point2D, i: number) => {
                  const isHover =
                    hover && hover.polyId === poly.id && hover.pointIndex === i;
                  const isDragging =
                    dragInfo && dragInfo.polyId === poly.id && dragInfo.pointIndex === i;
                  return (
                    <circle
                      key={`${poly.id}-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={
                        (isHover || isDragging
                          ? 8
                          : i === 0 && activePolygonData?.points.length >= 3 && !poly.closed
                          ? 10
                          : 5.5) *
                        (1 / scale) *
                        (isActive ? 1 : 0.8)
                      }
                      fill={poly.color}
                      stroke={poly.color}
                      strokeWidth={1 / scale}
                      strokeOpacity={isActive ? 1 : 0.55}
                      onMouseEnter={() => setHover({ polyId: poly.id, pointIndex: i })}
                      onMouseLeave={() => setHover(null)}
                      onMouseDown={handlePointMouseDown(poly.id, i)}
                      style={{ cursor: "grab", pointerEvents: "auto" }}
                    />
                  )
                })
              })}
                      </g>
                    </svg>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                      <div className="max-w-md bg-[#1b1b1c] border border-[#1b1b1c] p-8 rounded-2xl shadow-2xl">
                        <h1 className="text-2xl font-black mb-3 text-[#c1c6d7] tracking-wide">Image Polygon Tracer</h1>
                        <p className="text-[#e5e2e1]/80 text-sm mb-6 leading-relaxed">
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
