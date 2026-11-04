import React, { useState } from 'react';
import { X, Send, Camera, Image as ImageIcon, Video, MapPin, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    complaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>,
    mediaFile?: File
  ) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('garbage');
  const [title, setTitle] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Compress and read image as base64 data URL
  const processImageFile = (file: File) => {
    setIsProcessingMedia(true);
    setMediaError(null);
    setVideoPreview(null);
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImagePreview(compressedDataUrl);
        setIsProcessingMedia(false);
      };
      img.onerror = () => {
        setIsProcessingMedia(false);
        setMediaError('حدث خطأ أثناء قراءة الصورة');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 25MB for WhatsApp and mobile friendliness
    if (file.size > 25 * 1024 * 1024) {
      setMediaError('حجم الفيديو كبير جداً. يرجى اختيار فيديو مدته قصيرة بحجم أقل من 25 ميجابايت.');
      return;
    }

    setIsProcessingMedia(true);
    setMediaError(null);
    setImagePreview(null);
    setMediaFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideoPreview(event.target.result as string);
      }
      setIsProcessingMedia(false);
    };
    reader.onerror = () => {
      setIsProcessingMedia(false);
      setMediaError('فشل تحميل الفيديو. يرجى تجربة مقطع آخر.');
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocationCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (!detailedAddress.includes('إحداثيات')) {
          setDetailedAddress((prev) => 
            prev ? `${prev} (تم التقاط الموقع عبر GPS)` : `بشتيل (إحداثيات: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          );
        }
      },
      (err) => {
        setIsLocating(false);
        alert('تعذر الوصول للموقع الجغرافي. يرجى كتابة العنوان والعلامة المميزة يدوياً.');
      },
      { timeout: 8000 }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!authorName.trim()) newErrors.authorName = 'يرجى كتابة اسمك أو اسم صاحب الشكوى';
    if (!title.trim()) newErrors.title = 'يرجى كتابة عنوان مختصر للشكوى';
    if (!detailedAddress.trim()) newErrors.detailedAddress = 'يرجى توضيح العنوان بالتفصيل والعلامة المميزة';
    if (!details.trim()) newErrors.details = 'يرجى كتابة نص الشكوى بالتفصيل';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(
      {
        authorName: authorName.trim(),
        category,
        title: title.trim(),
        detailedAddress: detailedAddress.trim(),
        details: details.trim(),
        phone: phone.trim() || undefined,
        imageUrl: imagePreview || undefined,
        videoUrl: videoPreview || undefined,
        locationCoords: locationCoords || undefined,
      },
      mediaFile || undefined
    );

    // Reset
    setAuthorName('');
    setTitle('');
    setDetailedAddress('');
    setDetails('');
    setPhone('');
    setImagePreview(null);
    setVideoPreview(null);
    setMediaFile(null);
    setLocationCoords(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#121720] border border-[#252d3d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#212837] bg-[#161c27]">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            إبلاغ عن مشكلة جديدة
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 1. الاسم (اسم صاحب الشكوى) * */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1.5">
              الاسم (اسم صاحب الشكوى) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="اسمك"
              className={`w-full bg-[#181f2c] border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all ${
                errors.authorName
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-[#293448] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.authorName && (
              <p className="text-xs text-rose-400 mt-1">{errors.authorName}</p>
            )}
          </div>

          {/* 2. نوع الشكوى * */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1.5">
              نوع الشكوى <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full bg-[#181f2c] border border-[#293448] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="garbage">تراكم قمامة ونظافة</option>
              <option value="roads">طرق ورصف وحفر</option>
              <option value="water">مياه وصرف صحي</option>
              <option value="electricity">أعمدة إنارة وكهرباء</option>
              <option value="encroachments">إشغالات وباعة ومخالفات</option>
              <option value="other">شكوى عامة أخرى</option>
            </select>
          </div>

          {/* 3. عنوان الشكوى * */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1.5">
              عنوان الشكوى <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تراكم قمامة أمام المدرسة"
              className={`w-full bg-[#181f2c] border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all ${
                errors.title
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-[#293448] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1">{errors.title}</p>
            )}
          </div>

          {/* 4. العنوان بالتفصيل (علامة مميزة) * */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-200">
                العنوان بالتفصيل (علامة مميزة) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>{isLocating ? 'جاري التحديد...' : 'موقعي الآن (GPS)'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="مثال: أمام كشك أشرف، أمام الوحدة المحلية، بجانب نقطة البشتيل"
              className={`w-full bg-[#181f2c] border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all ${
                errors.detailedAddress
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-[#293448] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.detailedAddress && (
              <p className="text-xs text-rose-400 mt-1">{errors.detailedAddress}</p>
            )}
          </div>

          {/* 5. الشكوى بالتفصيل * */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1.5">
              الشكوى بالتفصيل <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل، ما الأضرار الناتجة عنها؟ ومنذ متى بدأت؟"
              className={`w-full bg-[#181f2c] border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all ${
                errors.details
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-[#293448] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.details && (
              <p className="text-xs text-rose-400 mt-1">{errors.details}</p>
            )}
          </div>

          {/* 6. رقم هاتف صاحب الشكوى (اختياري) */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1.5">
              رقم الهاتف للتواصل <span className="text-gray-400 text-xs font-normal">(اختياري لمتابعة المشكلة)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 01012345678"
              className="w-full bg-[#181f2c] border border-[#293448] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* 7. إرفاق صورة أو فيديو للمشكلة: 3 خيارات (كاميرا، معرض الصور، فيديو) */}
          <div className="bg-[#181f2c] border border-[#263143] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-gray-200">
                إرفاق صورة أو فيديو للمشكلة <span className="text-gray-400 text-xs font-normal">(اختياري لتوثيق البلاغ)</span>
              </label>
              {(imagePreview || videoPreview) && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{videoPreview ? 'تم اختيار الفيديو' : 'تم اختيار الصورة'}</span>
                </span>
              )}
            </div>

            {/* 3 Distinct Buttons: Camera, Gallery, Video */}
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Camera */}
              <label className="flex flex-col items-center justify-center gap-1.5 bg-[#121720] hover:bg-[#1f2838] border border-[#334257] hover:border-emerald-500/60 rounded-xl py-2.5 px-2 text-center text-xs font-bold text-gray-200 cursor-pointer transition-all active:scale-95 shadow-sm">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px]">التقاط صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Option 2: Photo Gallery */}
              <label className="flex flex-col items-center justify-center gap-1.5 bg-[#121720] hover:bg-[#1f2838] border border-[#334257] hover:border-sky-500/60 rounded-xl py-2.5 px-2 text-center text-xs font-bold text-gray-200 cursor-pointer transition-all active:scale-95 shadow-sm">
                <ImageIcon className="w-5 h-5 text-sky-400" />
                <span className="text-[11px]">معرض الصور</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Option 3: Video (Record or upload) */}
              <label className="flex flex-col items-center justify-center gap-1.5 bg-[#121720] hover:bg-[#1f2838] border border-[#334257] hover:border-purple-500/60 rounded-xl py-2.5 px-2 text-center text-xs font-bold text-gray-200 cursor-pointer transition-all active:scale-95 shadow-sm">
                <Video className="w-5 h-5 text-purple-400" />
                <span className="text-[11px]">فيديو المشكلة</span>
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Error or Progress */}
            {mediaError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{mediaError}</span>
              </div>
            )}

            {isProcessingMedia && (
              <p className="text-xs text-blue-400 text-center py-2 animate-pulse font-medium">
                جاري معالجة وتجهيز المرفق...
              </p>
            )}

            {/* Image Preview & Delete */}
            {imagePreview && !isProcessingMedia && (
              <div className="relative rounded-xl overflow-hidden border border-[#2d3a4e] bg-black/60 group">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <span className="text-[11px] text-gray-300 font-medium">معاينة الصورة المرفقة</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setMediaFile(null);
                    }}
                    className="flex items-center gap-1 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            )}

            {/* Video Preview & Delete */}
            {videoPreview && !isProcessingMedia && (
              <div className="relative rounded-xl overflow-hidden border border-[#2d3a4e] bg-black/70 p-2">
                <video
                  src={videoPreview}
                  controls
                  playsInline
                  className="w-full h-40 object-contain rounded-lg bg-black"
                />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-purple-300 font-medium">معاينة مقطع الفيديو</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoPreview(null);
                      setMediaFile(null);
                    }}
                    className="flex items-center gap-1 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الفيديو</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            {/* Primary Blue Button: إرسال البلاغ */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-sm sm:text-base"
            >
              <Send className="w-4 h-4" />
              <span>إرسال البلاغ</span>
            </button>

            {/* Secondary Button: إلغاء */}
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#181f2c] hover:bg-[#20293a] text-gray-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl border border-[#293448] transition-all cursor-pointer text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
