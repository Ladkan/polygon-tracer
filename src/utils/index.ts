import type { Point2D } from "../types/polygon";

export const getRandomHexColor = (): string => {
  const randomHex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomHex.padStart(6, '0')}`;
};

export const getPoint = (svgRef: any, e: any, scale: number, pan: any) => {
  const rect = svgRef.current.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const clientY = e.clientY - rect.top;

  // Inverse calculations to map click to native pixel coordinates
  const x = Math.round((clientX - pan.x) / scale);
  const y = Math.round((clientY - pan.y) / scale);
  return { x, y } as Point2D
}

export const distanceToSegment = (p: Point2D, a: Point2D, b: Point2D) => {
  const A = p.x - a.x
  const B = p.y - a.y
  const C = b.x - a.x
  const D = b.y - a.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx = undefined
  let yy = undefined

  if (param < 0) {
    xx = a.x
    yy = a.y
  } else if (param > 1) {
    xx = b.x
    yy = b.y
  } else {
    xx = a.x + param * C
    yy = a.y + param * D
  }

  const dx = p.x - xx
  const dy = p.y - yy

  return Math.hypot(dx,dy)
}


// Generic Clipboard helper
const copyText = async (text:string, label:string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

  // --- Export Utilities ---
  //
  // 1. Export as JSON Points
  export const copyJSON = async (points: Point2D[]) => {
    const jsonStr = JSON.stringify(points, null, 2);
    await copyText(jsonStr, "JSON coordinates");
  };

  // 2. Export as Responsive CSS clip-path
export const copyCSSClipPath = async (points: Point2D[], name: string, naturalSize: { width: number; height: number }) => {
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
  export const copySVGTag = async (points:Point2D[], name: string, color: string) => {
    const pointsStr = points.map((p:Point2D) => `${p.x},${p.y}`).join(" ");
    const svgString = `<polygon points="${pointsStr}" fill="${color}" stroke="${color}" stroke-width="2" /> //${name}`;
    await copyText(svgString, "SVG polygon element");
  };

export const isInputFocused = () => {
  const activeEl = document.activeElement as HTMLElement | null

  if(!activeEl) return false

  const tagName = activeEl.tagName.toUpperCase()

  return (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      activeEl.isContentEditable
    )
  }
