import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, X, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';

/*
 * ─── Venue Layout (Landscape) ───
 *
 * ViewBox: 0 0 900 620
 *
 * TOP WALL:    EXIT(L) — Dessert — Furniture — EXIT(R) — Bar+Cocktails
 * LEFT WALL:   Camera — [Bridal Table 13 | Dance Floor Grid] — DJ
 *
 * TABLES (4 rows × 3 cols):
 *   Row 1:  5    8    4
 *   Row 2:  3   10   12
 *   Row 3:  7   11    1
 *   Row 4:  6    2    9
 *
 * BOTTOM WALL: Vendors (Table 14) — Photo Backdrop — Buffet — Entrance(R)
 * RIGHT WALL:  Gift table
 */

const TABLE_POSITIONS = {
  5:  { x: 260, y: 110 },
  8:  { x: 450, y: 110 },
  4:  { x: 640, y: 110 },
  3:  { x: 355, y: 200 },
  10: { x: 545, y: 200 },
  12: { x: 735, y: 200 },
  7:  { x: 355, y: 380 },
  11: { x: 545, y: 380 },
  1:  { x: 735, y: 380 },
  6:  { x: 260, y: 470 },
  2:  { x: 450, y: 470 },
  9:  { x: 640, y: 470 },
};

const TABLE_RADIUS = 28;
const SEAT_RADIUS = 5.5;
const SEATS_PER_TABLE = 10;

const SVG_WIDTH = 900;
const SVG_HEIGHT = 620;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Generate seat positions evenly around a circular table.
 * Seat 1 at 12-o'clock, numbered clockwise.
 */
function getSeatPositions(cx, cy, count = SEATS_PER_TABLE, orbitRadius = TABLE_RADIUS + 13) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      num: i + 1,
      x: cx + orbitRadius * Math.cos(angle),
      y: cy + orbitRadius * Math.sin(angle),
    };
  });
}


function RoundTable({ cx, cy, tableNum, isHighlighted, highlightSeat }) {
  const seats = getSeatPositions(cx, cy);

  return (
    <g>
      <circle
        cx={cx} cy={cy} r={TABLE_RADIUS}
        fill={isHighlighted ? '#1a1a1a' : '#f5f0eb'}
        stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
        strokeWidth={isHighlighted ? 2 : 1}
      >
        {isHighlighted && (
          <animate attributeName="opacity" values="1;0.75;1" dur="2s" repeatCount="indefinite" />
        )}
      </circle>

      <text
        x={cx} y={cy - 3}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#ffffff' : '#6b6560'}
        fontSize="16" fontWeight="700"
        fontFamily="'Playfair Display', serif"
      >
        {tableNum}
      </text>

      <text
        x={cx} y={cy + 11}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#cccccc' : '#a09a94'}
        fontSize="5"
        fontFamily="'DM Sans', sans-serif"
        letterSpacing="0.05em"
      >
        Chairs: {SEATS_PER_TABLE}
      </text>

      {seats.map((seat) => {
        const isSeatHL = isHighlighted && highlightSeat === seat.num;
        return (
          <g key={seat.num}>
            <circle
              cx={seat.x} cy={seat.y} r={SEAT_RADIUS}
              fill={isSeatHL ? '#1a1a1a' : '#ffffff'}
              stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
              strokeWidth={isSeatHL ? 2 : 0.8}
            >
              {isSeatHL && (
                <animate attributeName="r" values="5.5;7;5.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <text
              x={seat.x} y={seat.y}
              textAnchor="middle" dominantBaseline="central"
              fill={isSeatHL ? '#ffffff' : '#9a9490'}
              fontSize="4.5"
              fontFamily="'DM Sans', sans-serif"
            >
              {seat.num}
            </text>
          </g>
        );
      })}
    </g>
  );
}


function BridalTable({ x, y, isHighlighted, highlightSeat }) {
  const tableWidth = 22;
  const tableHeight = 200;
  const seatCount = 12;
  const seatSpacing = tableHeight / (seatCount + 1);

  return (
    <g>
      <rect
        x={x} y={y}
        width={tableWidth} height={tableHeight}
        fill={isHighlighted ? '#1a1a1a' : '#f5f0eb'}
        stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
        strokeWidth={isHighlighted ? 2 : 1}
        rx="3"
      >
        {isHighlighted && (
          <animate attributeName="opacity" values="1;0.75;1" dur="2s" repeatCount="indefinite" />
        )}
      </rect>

      <text
        x={x + tableWidth / 2} y={y + tableHeight / 2 - 10}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#ffffff' : '#6b6560'}
        fontSize="11" fontWeight="700"
        fontFamily="'Playfair Display', serif"
        transform={`rotate(-90 ${x + tableWidth / 2} ${y + tableHeight / 2 - 10})`}
      >
        13
      </text>
      <text
        x={x + tableWidth / 2} y={y + tableHeight / 2 + 10}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#cccccc' : '#a09a94'}
        fontSize="4"
        fontFamily="'DM Sans', sans-serif"
        letterSpacing="0.05em"
        transform={`rotate(-90 ${x + tableWidth / 2} ${y + tableHeight / 2 + 10})`}
      >
        BRIDAL TABLE
      </text>

      {Array.from({ length: seatCount }, (_, i) => {
        const seatNum = i + 1;
        const sx = x - 11;
        const sy = y + seatSpacing * (i + 1);
        const isSeatHL = isHighlighted && highlightSeat === seatNum;
        return (
          <g key={seatNum}>
            <circle
              cx={sx} cy={sy} r={SEAT_RADIUS}
              fill={isSeatHL ? '#1a1a1a' : '#ffffff'}
              stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
              strokeWidth={isSeatHL ? 2 : 0.8}
            >
              {isSeatHL && (
                <animate attributeName="r" values="5.5;7;5.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <text
              x={sx} y={sy}
              textAnchor="middle" dominantBaseline="central"
              fill={isSeatHL ? '#ffffff' : '#9a9490'}
              fontSize="4.5"
              fontFamily="'DM Sans', sans-serif"
            >
              {seatNum}
            </text>
          </g>
        );
      })}
    </g>
  );
}


function VendorTable({ x, y, isHighlighted, highlightSeat }) {
  const tableWidth = 65;
  const tableHeight = 18;
  const seatPositions = [
    { num: 1, sx: x + tableWidth * 0.2, sy: y + tableHeight + 10 },
    { num: 2, sx: x + tableWidth * 0.4, sy: y + tableHeight + 10 },
    { num: 3, sx: x + tableWidth * 0.6, sy: y + tableHeight + 10 },
    { num: 4, sx: x + tableWidth * 0.8, sy: y + tableHeight + 10 },
  ];

  return (
    <g>
      <rect
        x={x} y={y}
        width={tableWidth} height={tableHeight}
        fill={isHighlighted ? '#1a1a1a' : '#f5f0eb'}
        stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
        strokeWidth={isHighlighted ? 2 : 1}
        rx="2"
      >
        {isHighlighted && (
          <animate attributeName="opacity" values="1;0.75;1" dur="2s" repeatCount="indefinite" />
        )}
      </rect>

      <text
        x={x + tableWidth / 2} y={y + tableHeight / 2 - 2}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#ffffff' : '#6b6560'}
        fontSize="8" fontWeight="700"
        fontFamily="'Playfair Display', serif"
      >
        14
      </text>
      <text
        x={x + tableWidth / 2} y={y + tableHeight / 2 + 6}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#cccccc' : '#a09a94'}
        fontSize="3.5"
        fontFamily="'DM Sans', sans-serif"
        letterSpacing="0.05em"
      >
        VENDORS
      </text>

      {seatPositions.map((seat) => {
        const isSeatHL = isHighlighted && highlightSeat === seat.num;
        return (
          <g key={seat.num}>
            <circle
              cx={seat.sx} cy={seat.sy} r={SEAT_RADIUS}
              fill={isSeatHL ? '#1a1a1a' : '#ffffff'}
              stroke={isHighlighted ? '#1a1a1a' : '#ccc5bb'}
              strokeWidth={isSeatHL ? 2 : 0.8}
            >
              {isSeatHL && (
                <animate attributeName="r" values="5.5;7;5.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <text
              x={seat.sx} y={seat.sy}
              textAnchor="middle" dominantBaseline="central"
              fill={isSeatHL ? '#ffffff' : '#9a9490'}
              fontSize="4.5"
              fontFamily="'DM Sans', sans-serif"
            >
              {seat.num}
            </text>
          </g>
        );
      })}
    </g>
  );
}


/* ════════════════════════════════════════════════════════
 * Zoom & Pan hooks
 * ════════════════════════════════════════════════════════ */

/**
 * Returns the SVG-space coordinates for a highlighted table,
 * so we can auto-zoom to it on mount.
 */
function getTableCenter(tableNum) {
  if (tableNum === 13) return { x: 40, y: 230 }; // bridal table center
  if (tableNum === 14) return { x: 92, y: 570 }; // vendor table center
  const pos = TABLE_POSITIONS[tableNum];
  if (pos) return { x: pos.x, y: pos.y };
  return null;
}

/**
 * Custom hook encapsulating all zoom/pan state and gesture handlers.
 */
function useZoomPan(containerRef, highlightTable) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Drag state
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Pinch state
  const lastPinchDist = useRef(null);

  const clampTranslate = useCallback((tx, ty, s) => {
    if (s <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return { x: tx, y: ty };
    const rect = el.getBoundingClientRect();
    const maxX = (rect.width * s) / 2;
    const maxY = (rect.height * s) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }, [containerRef]);

  function zoomTo(newScale, centerX, centerY) {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
    setScale(clamped);
    if (clamped <= 1) {
      setTranslate({ x: 0, y: 0 });
    } else {
      setTranslate((prev) => clampTranslate(prev.x, prev.y, clamped));
    }
  }

  function zoomIn() { zoomTo(scale * 1.5); }
  function zoomOut() { zoomTo(scale / 1.5); }
  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  /** Zoom to a specific table */
  function focusTable(tableNum) {
    const center = getTableCenter(tableNum);
    if (!center) return;

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const focusScale = 2.5;
    const ratioX = rect.width / SVG_WIDTH;
    const ratioY = rect.height / SVG_HEIGHT;

    // With transform-origin: center, scaling anchors at the container's midpoint.
    // To bring SVG point (cx, cy) to the container centre:
    //   tx = (containerMid - svgPixel) * scale
    const tx = (rect.width / 2 - center.x * ratioX) * focusScale;
    const ty = (rect.height / 2 - center.y * ratioY) * focusScale;

    setScale(focusScale);
    setTranslate(clampTranslate(tx, ty, focusScale));
  }

  // ── Mouse wheel zoom ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoomTo(scale * delta);
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [scale]);

  // ── Touch pinch zoom + pan ──
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      zoomTo(scale * ratio);
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTranslate((prev) => clampTranslate(prev.x + dx, prev.y + dy, scale));
    }
  }

  function handleTouchEnd() {
    isDragging.current = false;
    lastPinchDist.current = null;
  }

  // ── Mouse drag (desktop) ──
  function handleMouseDown(e) {
    if (scale <= 1) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e) {
    if (!isDragging.current || scale <= 1) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTranslate((prev) => clampTranslate(prev.x + dx, prev.y + dy, scale));
  }

  function handleMouseUp() {
    isDragging.current = false;
  }

  // Auto-focus on highlighted table on first render
  useEffect(() => {
    if (highlightTable != null) {
      // Small delay so the container has mounted and measured
      const timer = setTimeout(() => focusTable(highlightTable), 300);
      return () => clearTimeout(timer);
    }
  }, [highlightTable]);

  const transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;

  return {
    scale,
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
    focusTable,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}


/* ════════════════════════════════════════════════════════
 * SVG Content (pure structure, no interaction logic)
 * ════════════════════════════════════════════════════════ */

function VenueSVG({ highlightTable, highlightSeat }) {
  return (
    <svg
      viewBox="0 0 900 620"
      className="w-full h-auto block select-none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Venue floor plan"
    >
      {/* Background */}
      <rect x="0" y="0" width="900" height="620" fill="#faf8f5" rx="3" />

      {/* Venue Walls */}
      <rect x="20" y="20" width="860" height="580" fill="none" stroke="#e0dbd4" strokeWidth="1.5" rx="2" />

      {/* ─── TOP WALL ─── */}
      <rect x="35" y="25" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="60" y="36" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      <rect x="815" y="25" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="840" y="36" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      <rect x="370" y="28" width="65" height="18" fill="#fff0f0" stroke="#e0b0b0" strokeWidth="0.8" rx="8" />
      <text x="402" y="40" textAnchor="middle" fill="#c06060" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">DESSERT</text>

      <rect x="520" y="30" width="30" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />
      <rect x="560" y="30" width="30" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />
      <rect x="600" y="30" width="20" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />

      {/* ─── RIGHT WALL ─── */}
      <rect x="820" y="55" width="50" height="45" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" rx="2" />
      <text x="845" y="75" textAnchor="middle" fill="#8a8178" fontSize="5.5" fontFamily="'DM Sans',sans-serif" letterSpacing="0.05em">BAR +</text>
      <text x="845" y="84" textAnchor="middle" fill="#8a8178" fontSize="5.5" fontFamily="'DM Sans',sans-serif" letterSpacing="0.05em">COCKTAILS</text>

      <rect x="862" y="300" width="14" height="70" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" rx="2" />
      <text x="869" y="340" textAnchor="middle" fill="#8a8178" fontSize="5" fontFamily="'DM Sans',sans-serif" transform="rotate(90 869 340)" letterSpacing="0.1em">GIFT TABLE</text>

      {/* ─── LEFT WALL ─── */}
      <circle cx="55" cy="100" r="8" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" />
      <circle cx="55" cy="100" r="3" fill="none" stroke="#a09a94" strokeWidth="0.6" />
      <circle cx="55" cy="100" r="1" fill="#a09a94" />

      {/* Table 13: Bridal Table */}
      <BridalTable
        x={40}
        y={130}
        isHighlighted={highlightTable === 13}
        highlightSeat={highlightTable === 13 ? highlightSeat : null}
      />

      {/* Dance floor grid */}
      <rect x="68" y="130" width="140" height="200" fill="none" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      {Array.from({ length: 10 }, (_, row) => (
        <g key={`row-${row}`}>
          {Array.from({ length: 8 }, (_, col) => (
            <rect
              key={`cell-${row}-${col}`}
              x={72 + col * 16.5}
              y={135 + row * 19}
              width="14" height="16"
              fill="none" stroke="#e0dbd4" strokeWidth="0.4" rx="0.5"
            />
          ))}
        </g>
      ))}

      {/* DJ booth */}
      <rect x="40" y="430" width="55" height="30" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" rx="8" />
      <text x="67" y="449" textAnchor="middle" fill="#8a8178" fontSize="8" fontWeight="600" fontFamily="'DM Sans',sans-serif">DJ</text>

      {/* ─── ROUND TABLES ─── */}
      {Object.entries(TABLE_POSITIONS).map(([num, pos]) => (
        <RoundTable
          key={num}
          cx={pos.x}
          cy={pos.y}
          tableNum={parseInt(num)}
          isHighlighted={highlightTable === parseInt(num)}
          highlightSeat={highlightTable === parseInt(num) ? highlightSeat : null}
        />
      ))}

      {/* ─── BOTTOM WALL ─── */}
      <VendorTable
        x={60}
        y={560}
        isHighlighted={highlightTable === 14}
        highlightSeat={highlightTable === 14 ? highlightSeat : null}
      />

      <rect x="190" y="555" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="215" y="566" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      <rect x="260" y="558" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      <rect x="260" y="575" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      <rect x="520" y="558" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      <rect x="520" y="575" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />

      <rect x="740" y="555" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="765" y="566" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      {/* ─── Legend ─── */}
      {highlightTable && (
        <g>
          <rect x="30" y="475" width="100" height="30" fill="white" stroke="#e0dbd4" strokeWidth="0.6" rx="2" />
          <circle cx="44" cy="485" r="4" fill="#1a1a1a">
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="54" y="487" fill="#6b6560" fontSize="5" fontFamily="'DM Sans',sans-serif">Your table</text>
          <circle cx="44" cy="497" r="4" fill="#1a1a1a" />
          <circle cx="44" cy="497" r="2.5" fill="white" />
          <text x="54" y="499" fill="#6b6560" fontSize="5" fontFamily="'DM Sans',sans-serif">Your seat</text>
        </g>
      )}
    </svg>
  );
}


/* ════════════════════════════════════════════════════════
 * Main FloorPlan export — wraps SVG in zoomable container
 * ════════════════════════════════════════════════════════ */

export default function FloorPlan({ highlightTable = null, highlightSeat = null }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);

  const activeRef = isFullscreen ? fullscreenContainerRef : containerRef;
  const {
    scale, transform, zoomIn, zoomOut, resetZoom, focusTable, handlers,
  } = useZoomPan(activeRef, highlightTable);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setIsFullscreen(false);
    }
    if (isFullscreen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isFullscreen]);

  const zoomControls = (
    <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
      <button
        onClick={zoomIn}
        className="p-2 bg-white rounded-sm shadow-md border border-stone-200
                   hover:bg-stone-50 active:scale-95 transition-all"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4 text-stone-600" />
      </button>
      <button
        onClick={zoomOut}
        className="p-2 bg-white rounded-sm shadow-md border border-stone-200
                   hover:bg-stone-50 active:scale-95 transition-all"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4 text-stone-600" />
      </button>
      {highlightTable && (
        <button
          onClick={() => focusTable(highlightTable)}
          className="p-2 bg-wedding-black rounded-sm shadow-md border border-black
                     hover:bg-black active:scale-95 transition-all"
          aria-label="Focus on your table"
        >
          <LocateFixed className="w-4 h-4 text-white" />
        </button>
      )}
      {scale > 1 && (
        <button
          onClick={resetZoom}
          className="px-2 py-1 bg-white rounded-sm shadow-md border border-stone-200
                     text-[9px] tracking-wider text-stone-500 font-medium
                     hover:bg-stone-50 active:scale-95 transition-all"
        >
          RESET
        </button>
      )}
    </div>
  );

  const zoomHint = scale <= 1 && (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20
                    bg-black/60 text-white text-[10px] tracking-wider px-3 py-1.5 rounded-full
                    pointer-events-none animate-fade-in"
         style={{ animationDelay: '500ms', opacity: 0 }}>
      Pinch or scroll to zoom
    </div>
  );

  /* ─── Fullscreen ─── */
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 font-medium">
            Venue Map
            {scale > 1 && (
              <span className="ml-2 text-stone-300">{Math.round(scale * 100)}%</span>
            )}
          </p>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 hover:bg-stone-50 rounded-sm transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Map container */}
        <div
          ref={fullscreenContainerRef}
          className="flex-1 overflow-hidden relative touch-none"
          {...handlers}
        >
          <div
            style={{
              transform,
              transformOrigin: 'center center',
              transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
              cursor: scale > 1 ? 'grab' : 'default',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="w-full max-w-4xl px-4">
              <VenueSVG highlightTable={highlightTable} highlightSeat={highlightSeat} />
            </div>
          </div>
          {zoomControls}
          {zoomHint}
        </div>
      </div>
    );
  }

  /* ─── Inline ─── */
  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-hidden rounded-sm touch-none"
        {...handlers}
      >
        <div
          style={{
            transform,
            transformOrigin: 'center center',
            transition: scale === 1 ? 'transform 0.3s ease-out' : 'none',
            cursor: scale > 1 ? 'grab' : 'default',
          }}
        >
          <VenueSVG highlightTable={highlightTable} highlightSeat={highlightSeat} />
        </div>
      </div>

      {/* Fullscreen button */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur rounded-sm shadow-sm
                   border border-stone-200 hover:bg-white transition-colors z-20"
        aria-label="View fullscreen"
      >
        <Maximize2 className="w-4 h-4 text-stone-500" />
      </button>

      {zoomControls}
      {zoomHint}
    </div>
  );
}
