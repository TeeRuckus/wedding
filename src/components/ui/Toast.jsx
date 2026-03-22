import React, { useEffect, useState } from 'react';

/**
 * Lightweight toast notification.
 * Appears at the bottom of the screen and auto-dismisses after 3 seconds.
 *
 * @param {Object} props
 * @param {string} props.message - Text to display
 * @param {function} props.onDismiss - Called when toast disappears
 */
export default function Toast({ message, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast">
      <div className="bg-wedding-black text-white px-6 py-3 rounded-sm shadow-xl
                      text-sm tracking-wide font-sans">
        {message}
      </div>
    </div>
  );
}
