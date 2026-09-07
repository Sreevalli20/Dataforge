import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {children || (
        <button
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          aria-label="Show tooltip"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg shadow-xl max-w-xs z-50">
          <p className="text-[11px] text-slate-300 leading-relaxed">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
        </div>
      )}
    </div>
  );
};
