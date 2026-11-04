import React, { useState } from 'react';
import { 
  X, Save, MessageCircle, CheckCircle, ExternalLink, QrCode, KeyRound, 
  Shield, BarChart3, Users, Sparkles 
} from 'lucide-react';
import { DispatchSettings } from '../types';

interface OfficialsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DispatchSettings;
  onSave: (newSettings: DispatchSettings) => void;
  onOpenQrPoster: () => void;
}

export const OfficialsSettingsModal: React.FC<OfficialsSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onOpenQrPoster,
}) => {
  const [formData, setFormData] = useState<DispatchSettings>(settings);
  const [activeTab, setActiveTab] = useState<'group' | 'poster' | 'security'>('group');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handleTestGroupLink = () => {
    const link = formData.groupWhatsappNumberOrLink || 'https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN?s=cl&p=a&mlu=4&ilr=4&iam=2';
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-[#121720] border border-[#252d3d] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#212837] bg-[#161c27]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                لوحة تحكم مسؤولي ملتقى شباب بشتيل
              </h2>
              <p className="text-xs text-gray-400">
                إدارة رابط جروب الواتساب، ملصقات الحائط QR، وكلمة المرور
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#212837] bg-[#151b26] text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'group'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            1. رابط جروب الواتساب
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'poster'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            2. ملصق QR لتعليقه في الشوارع
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            3. كلمة المرور السرية
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: WHATSAPP GROUP */}
          {activeTab === 'group' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-200 leading-relaxed">
                <span className="font-bold text-emerald-300">التحويل المباشر لجروب الواتساب: </span>
                عند قيام أي مواطن بكتابة شكوى والضغط على إرسال، تُحفظ الشكوى في الموقع السحابي ويتم تحويله فوراً لجروب الواتساب لإرسال البلاغ في الجروب بنقرة زر.
              </div>

              <div className="bg-[#181f2c] border border-[#263143] rounded-xl p-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    اسم الجروب:
                  </label>
                  <input
                    type="text"
                    value={formData.groupTitle}
                    onChange={(e) => setFormData({ ...formData, groupTitle: e.target.value })}
                    className="w-full bg-[#121720] border border-[#293448] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-300">
                      رابط دعوة جروب الواتساب المعتمد:
                    </label>
                    <button
                      type="button"
                      onClick={handleTestGroupLink}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>تجربة فتح الجروب</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.groupWhatsappNumberOrLink}
                    onChange={(e) => setFormData({ ...formData, groupWhatsappNumberOrLink: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-[#121720] border border-[#293448] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-100 font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.autoOpenWhatsappOnSubmit}
                      onChange={(e) => setFormData({ ...formData, autoOpenWhatsappOnSubmit: e.target.checked })}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span>فتح الواتساب والتحويل المباشر للجروب تلقائياً عند ضغط المواطن على "إرسال البلاغ"</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR POSTERS */}
          {activeTab === 'poster' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-600/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">ملصق الحائط وطباعة كود QR لشباب وأهالي بشتيل</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQrPoster();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span>معاينة وطباعة الملصق الآن</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  يمكن لمسؤولي الملتقى طباعة ملصق رسمي A4 عليه كود QR كبير وواضح مع تعليمات مبسطة لأهالي بشتيل لطباعته ولصقه على الجدران وأعمدة الإنارة والمحلات، بمجرد مسح الكود بالموبايل يفتح نموذج كتابة الشكوى فوراً.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-[#181f2c] border border-[#263143] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>تغيير كلمة المرور السرية للوحة التحكم</span>
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  هذه كلمة السر التي تُطلب منك عند الضغط 6 مرات على «ملتقى شباب بشتيل» في أعلى الشاشة.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    كلمة السر الحالية أو الجديدة:
                  </label>
                  <input
                    type="text"
                    value={formData.adminPassword || '123456'}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full bg-[#121720] border border-[#293448] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-100 font-mono"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    الافتراضية: <span className="font-mono text-gray-400">123456</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Status & Action */}
          <div className="pt-2 border-t border-[#212837] flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>تم حفظ الإعدادات سحابياً بنجاح!</span>
              </span>
            ) : (
              <span className="text-[11px] text-gray-500">
                الحفظ يتم سحابياً ومحلياً
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
