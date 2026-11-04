import React, { useState, useRef } from 'react';
import { MapPin, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenNewComplaint: () => void;
  onTriggerAdminAuth: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewComplaint,
  onTriggerAdminAuth,
  activeCount,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    if (nextCount >= 6) {
      setTapCount(0);
      onTriggerAdminAuth();
      return;
    }

    // Reset after 3 seconds of inactivity
    resetTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0f131a]/95 backdrop-blur-md border-b border-[#252d3d]/80 px-4 py-3 sm:py-3.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left side in RTL: Quick "+ إضافة" button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewComplaint}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-blue-900/40 transition-all cursor-pointer"
            title="إضافة بلاغ جديد"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة</span>
          </button>
        </div>

        {/* Right side in RTL: Secret-clickable Title "ملتقى شباب بشتيل" */}
        <div className="flex items-center gap-2 text-right relative">
          <div
            onClick={handleTitleClick}
            className="cursor-pointer select-none group"
            title="ملتقى شباب بشتيل (انقر 6 مرات للدخول السري للوحة التحكم)"
          >
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                ملتقى شباب بشتيل
              </span>
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 fill-blue-500/20" />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              صوت أهالي بشتيل • إرسال فوري للمسؤولين
            </p>
          </div>

          {/* Feedback indicator for secret clicks when > 2 */}
          {tapCount > 2 && (
            <div className="absolute -bottom-5 right-0 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
              نقرة المسؤول: {tapCount}/6
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
