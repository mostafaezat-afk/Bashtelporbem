import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Copy, Check, ExternalLink, QrCode, Sparkles } from 'lucide-react';

interface QrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrPosterModal: React.FC<QrPosterModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The URL that will open when citizens scan the QR code on the wall
  const formUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?action=new_complaint`
    : '';

  useEffect(() => {
    if (isOpen && formUrl) {
      QRCode.toDataURL(
        formUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, formUrl]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'ملصق-حائط-ملتقى-شباب-بشتيل-QR.png';
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-[#121720] border border-[#252d3d] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-right"
        dir="rtl"
      >
        {/* Header (hidden in print) */}
        <div className="no-print flex items-center justify-between px-5 py-4 border-b border-[#212837] bg-[#161c27]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              ملصق الحائط وطباعة كود QR (لأهالي بشتيل)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Note for the User (hidden in print) */}
          <div className="no-print bg-blue-500/10 border border-blue-500/25 rounded-xl p-3.5 text-xs text-blue-200 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>فكرة الملصق للجدران وشوارع بشتيل:</span>
            </div>
            اطبع هذا الملصق وقم بتعليقه على أعمدة الإنارة، جدران المدارس، المحلات، والمواقف. بمجرد أن يمسح المواطن الكود بكاميرا الموبايل، يفتح له فوراً نموذج البلاغ لتصل شكواه للمسؤول على الواتساب والموقع!
          </div>

          {/* Printable Poster Container */}
          <div 
            id="printable-poster"
            className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border-4 border-blue-600 text-center relative overflow-hidden"
          >
            {/* Poster Header */}
            <div className="border-b-2 border-slate-200 pb-4 mb-4">
              <div className="inline-block bg-blue-600 text-white font-black text-xs sm:text-sm px-4 py-1 rounded-full mb-2 uppercase tracking-wide">
                خدمة أهالي وشباب بشتيل
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
                ملتقى شباب بشتيل
              </h1>
              <p className="text-sm sm:text-base font-bold text-blue-700">
                عندك شكوى في منطقتك؟ قمامة؟ حفرة؟ ماسورة مياه؟ عمود مطفي؟
              </p>
            </div>

            {/* Poster Middle: High Res QR Code */}
            <div className="my-4 flex flex-col items-center justify-center">
              <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl shadow-inner inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="كود البلاغات ملتقى شباب بشتيل"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
                    جاري توليد الكود...
                  </div>
                )}
              </div>

              <div className="mt-3 font-extrabold text-base sm:text-lg text-slate-900 bg-amber-300/60 px-4 py-1.5 rounded-xl border border-amber-400 inline-block">
                📱 وجّه كاميرا الموبايل نحو الكود وسجّل بلاغك فوراً
              </div>
            </div>

            {/* Poster Footer: Instructions */}
            <div className="border-t-2 border-slate-200 pt-3 text-xs sm:text-sm font-semibold text-slate-600 space-y-1">
              <p>✅ البلاغ يصل فوراً لمسؤول النظافة والمياه والوحدة المحلية ببشتيل</p>
              <p>✅ يتم نشر البلاغ على المنصة ومتابعته حتى تمام الحل</p>
              <p className="text-[11px] text-slate-400 pt-1 font-mono" dir="ltr">
                {formUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons (no-print) */}
          <div className="no-print pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الملصق الآن</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-center gap-2 bg-[#1e2533] hover:bg-[#283244] border border-[#2e3b50] text-gray-200 font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تحميل كود QR</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 bg-[#1e2533] hover:bg-[#283244] border border-[#2e3b50] text-gray-200 font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sky-400" />
                  <span>نسخ رابط الفورم</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer (hidden in print) */}
        <div className="no-print p-4 bg-[#161c27] border-t border-[#212837] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            جاهز للطباعة بحجم ملصق أو ورقة A4
          </span>
          <button
            onClick={onClose}
            className="bg-[#1e2533] hover:bg-[#283244] text-gray-300 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
