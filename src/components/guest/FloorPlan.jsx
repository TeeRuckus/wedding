import React, { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

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

/*TODO: Come back to this, and make sure that the tables are going to be the following 
 * - offset from each other
 *   - You try to make a gap in the middle for where we're going to be dancing in
 */
const TABLE_POSITIONS = {
  5:  { x: 260, y: 110 },
  8:  { x: 450, y: 110 },
  4:  { x: 640, y: 110 },
  3:  { x: 355, y: 200},
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

/**
 * Generate seat positions evenly around a circular table.
 * Seat 1 is at the top (12-o'clock), numbered clockwise.
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


/**
 * A single round table with labelled seats.
 */
function RoundTable({ cx, cy, tableNum, isHighlighted, highlightSeat }) {
  const seats = getSeatPositions(cx, cy);

  return (
    <g>
      {/* Table circle */}
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

      {/* Table number */}
      <text
        x={cx} y={cy - 3}
        textAnchor="middle" dominantBaseline="central"
        fill={isHighlighted ? '#ffffff' : '#6b6560'}
        fontSize="16" fontWeight="700"
        fontFamily="'Playfair Display', serif"
      >
        {tableNum}
      </text>

      {/* "Chairs: 10" label */}
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

      {/* Seats */}
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
            {/* Seat number */}
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


/**
 * Bridal table (Table 13) — vertical rectangle, 12 seats along the right side
 * (facing the dance floor). Seat 1 at the top, seat 12 at the bottom.
 */
function BridalTable({ x, y, isHighlighted, highlightSeat }) {
  const tableWidth = 22;
  const tableHeight = 200;
  const seatCount = 12;
  const seatSpacing = tableHeight / (seatCount + 1);

  return (
    <g>
      {/* Table rectangle (vertical) */}
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

      {/* Table label — rotated vertically */}
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

      {/* 12 seats along the right side (facing dance floor), top to bottom */}
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


/**
 * Vendor table (Table 14) — small table with 4 seats.
 */
function VendorTable({ x, y, isHighlighted, highlightSeat }) {
  const tableWidth = 65;
  const tableHeight = 18;
  // All 4 seats along the bottom edge (facing venue exterior)
  const seatPositions = [
    { num: 1, sx: x + tableWidth * 0.2, sy: y + tableHeight + 10 },
    { num: 2, sx: x + tableWidth * 0.4, sy: y + tableHeight + 10 },
    { num: 3, sx: x + tableWidth * 0.6, sy: y + tableHeight + 10 },
    { num: 4, sx: x + tableWidth * 0.8, sy: y + tableHeight + 10 },
  ];

  return (
    <g>
      {/* Table rectangle */}
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

      {/* Label */}
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

      {/* 4 seats */}
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


/**
 * Full venue floor plan — landscape orientation matching the real venue.
 */
export default function FloorPlan({ highlightTable = null, highlightSeat = null }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setIsFullscreen(false);
    }
    if (isFullscreen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isFullscreen]);

  const svgContent = (
    <svg
      viewBox="0 0 900 620"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Venue floor plan"
    >
      {/* ─── Background ─── */}
      <rect x="0" y="0" width="900" height="620" fill="#faf8f5" rx="3" />

      {/* ─── Venue Walls ─── */}
      <rect x="20" y="20" width="860" height="580" fill="none" stroke="#e0dbd4" strokeWidth="1.5" rx="2" />

      {/* ─── TOP WALL — Exits + Dessert ─── */}
      {/* Left exit */}
      <rect x="35" y="25" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="60" y="36" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      {/* Right exit */}
      <rect x="815" y="25" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="840" y="36" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      {/* Dessert table */}
      <rect x="370" y="28" width="65" height="18" fill="#fff0f0" stroke="#e0b0b0" strokeWidth="0.8" rx="8" />
      <text x="402" y="40" textAnchor="middle" fill="#c06060" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">DESSERT</text>

      {/* Furniture / equipment top-centre-right */}
      <rect x="520" y="30" width="30" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />
      <rect x="560" y="30" width="30" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />
      <rect x="600" y="30" width="20" height="14" fill="#f0ece8" stroke="#d4cfc8" strokeWidth="0.6" rx="1" />

      {/* ─── RIGHT WALL — Bar + Cocktails & Gift Table ─── */}
      <rect x="820" y="55" width="50" height="45" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" rx="2" />
      <text x="845" y="75" textAnchor="middle" fill="#8a8178" fontSize="5.5" fontFamily="'DM Sans',sans-serif" letterSpacing="0.05em">BAR +</text>
      <text x="845" y="84" textAnchor="middle" fill="#8a8178" fontSize="5.5" fontFamily="'DM Sans',sans-serif" letterSpacing="0.05em">COCKTAILS</text>

      {/* Gift table — vertical on right edge */}
      <rect x="862" y="300" width="14" height="70" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" rx="2" />
      <text x="869" y="340" textAnchor="middle" fill="#8a8178" fontSize="5" fontFamily="'DM Sans',sans-serif" transform="rotate(90 869 340)" letterSpacing="0.1em">GIFT TABLE</text>

      {/* ─── LEFT WALL — Camera, Ceremony Grid, DJ ─── */}
      {/* Camera / audio icon */}
      <circle cx="55" cy="100" r="8" fill="#f5f0eb" stroke="#d4cfc8" strokeWidth="0.8" />
      <circle cx="55" cy="100" r="3" fill="none" stroke="#a09a94" strokeWidth="0.6" />
      <circle cx="55" cy="100" r="1" fill="#a09a94" />

      {/* ─── Table 13: Bridal Table (vertical, left of dance floor) ─── */}
      <BridalTable
        x={40}
        y={130}
        isHighlighted={highlightTable === 13}
        highlightSeat={highlightTable === 13 ? highlightSeat : null}
      />

      {/* Ceremony / dance floor grid (shifted right to fit bridal table) */}
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

      {/* ─── ROUND GUEST TABLES ─── */}
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

      {/* ─── BOTTOM WALL — Vendors, Buffet, Entrance ─── */}
      {/* Table 14: Vendor table (with seats + highlighting) */}
      <VendorTable
        x={60}
        y={560}
        isHighlighted={highlightTable === 14}
        highlightSeat={highlightTable === 14 ? highlightSeat : null}
      />


      {/* Bottom exit left */}
      <rect x="190" y="555" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="215" y="566" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>

      {/* Buffet / serving tables — long bars along bottom */}
      <rect x="260" y="558" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      <rect x="260" y="575" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />

      <rect x="520" y="558" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />
      <rect x="520" y="575" width="200" height="10" fill="#e8e2db" stroke="#d4cfc8" strokeWidth="0.8" rx="1" />

      {/* Bottom exit right */}
      <rect x="740" y="555" width="50" height="16" fill="#e8f5e9" stroke="#66bb6a" strokeWidth="0.8" rx="2" />
      <text x="765" y="566" textAnchor="middle" fill="#388e3c" fontSize="6" fontWeight="600" fontFamily="'DM Sans',sans-serif">EXIT</text>


      {/* ─── Legend (only when highlighting) ─── */}
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

  /* ─── Fullscreen mode ─── */
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
           style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg
                     border border-stone-200 hover:bg-stone-50 transition-colors"
          aria-label="Close fullscreen"
        >
          <X className="w-5 h-5 text-stone-600" />
        </button>
        <div className="w-full max-w-4xl">
          {svgContent}
        </div>
      </div>
    );
  }

  /* ─── Inline mode ─── */
  return (
    <div className="relative">
      {svgContent}
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-sm shadow-sm
                   border border-stone-200 hover:bg-white transition-colors"
        aria-label="View fullscreen"
      >
        <Maximize2 className="w-4 h-4 text-stone-500" />
      </button>
    </div>
  );
}
