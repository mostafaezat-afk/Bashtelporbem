import React, { useState } from 'react';
import { 
  MapPin, Clock, MessageSquare, ThumbsUp, ThumbsDown, Camera, 
  Video, X, Maximize2 
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../data/initialComplaints';

interface ComplaintCardProps {
  complaint: Complaint;
  onVote: (id: string, type: 'up' | 'down') => void;
  onOpenComments: (complaint: Complaint) => void;
  onOpenDirectDispatch: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onVote,
  onOpenComments,
  onOpenDirectDispatch,
  onUpdateStatus,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const cat = CATEGORY_LABELS[complaint.category] || CATEGORY_LABELS.other;
  const statusInfo = STATUS_LABELS[complaint.status] || STATUS_LABELS.open;

  // Format relative time in Arabic
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'منذ لحظات';
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'منذ 1 يوم';
      if (diffDays === 2) return 'منذ يومين';
      if (diffDays <= 10) return `منذ ${diffDays} أيام`;
      return `منذ ${diffDays} يوم`;
    } catch {
      return 'حديثاً';
    }
  };

  return (
    <>
      <article className="bg-[#161c24] border border-[#252d3d] hover:border-[#37445a] rounded-2xl p-4 sm:p-5 transition-all shadow-sm">
        {/* Top Header: Category Tag & Status Tag matching Screenshot 2 */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Right side in RTL: Category Pill */}
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-[#1e2533] text-gray-300 border border-[#2d3748]">
            {cat.badge}
          </span>

          {/* Left side in RTL: Status Badge */}
          <div className="flex items-center gap-2">
            <select
              value={complaint.status}
              onChange={(e) => onUpdateStatus(complaint.id, e.target.value as ComplaintStatus)}
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-colors ${statusInfo.bgClass}`}
              title="تحديث حالة البلاغ"
            >
              <option value="open" className="bg-[#161c24] text-rose-300">مفتوحة</option>
              <option value="in_progress" className="bg-[#161c24] text-amber-300">قيد المعالجة</option>
              <option value="resolved" className="bg-[#161c24] text-emerald-300">تم الحل</option>
            </select>
          </div>
        </div>

        {/* Complaint Title */}
        <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
          {complaint.title}
        </h3>

        {/* Complaint Details Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-3">
          {complaint.details}
        </p>

        {/* Attached Image Thumbnail */}
        {complaint.imageUrl && (
          <div 
            onClick={() => setIsImageModalOpen(true)}
            className="mb-3 rounded-xl overflow-hidden border border-[#252d3d] bg-black/50 relative cursor-pointer group shadow-sm"
            title="انقر لتكبير ومعاينة الصورة بحجمها الكامل"
          >
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="w-full h-44 sm:h-52 object-cover group-hover:scale-102 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-end justify-between p-2.5">
              <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>صورة المشكلة (اضغط للتكبير)</span>
              </span>
              <span className="w-7 h-7 rounded-lg bg-black/75 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* Attached Video Player */}
        {complaint.videoUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-[#252d3d] bg-black/70 p-2 shadow-sm">
            <div className="flex items-center gap-1.5 pb-2 px-1 text-xs text-purple-300 font-semibold">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>مقطع فيديو لتوثيق المشكلة</span>
            </div>
            <video
              src={complaint.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-56 rounded-lg bg-black object-contain"
            />
          </div>
        )}

        {/* Detailed Address with Location Pin matching Screenshot 2 */}
        <div className="flex items-start gap-1.5 text-xs sm:text-[13px] text-gray-400 mb-3 bg-[#12161d] p-2.5 rounded-xl border border-[#1f2735]">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-tight text-gray-300 font-medium">{complaint.detailedAddress}</span>
        </div>

        {/* Author Name and Relative Time matching Screenshot 2 */}
        <div className="flex items-center justify-between text-xs text-gray-400 pb-3 mb-3 border-b border-[#212837]">
          {/* Right side in RTL: Author */}
          <span className="text-gray-300 font-medium">{complaint.authorName}</span>

          {/* Left side in RTL: Time */}
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeAgo(complaint.createdAt)}</span>
          </div>
        </div>

        {/* Action Footer: Comments, Voting, WhatsApp Direct Dispatch */}
        <div className="flex items-center justify-between gap-2">
          {/* Comments count */}
          <button
            onClick={() => onOpenComments(complaint)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 py-1.5 px-2.5 rounded-lg hover:bg-[#1f2735] transition-colors cursor-pointer"
            title="عرض التعليقات والتحديثات"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{(complaint.comments || []).length}</span>
          </button>

          {/* Voting Buttons matching Screenshot 2 (Downvote 👎, Upvote 👍) */}
          <div className="flex items-center gap-1">
            {/* Downvote */}
            <button
              onClick={() => onVote(complaint.id, 'down')}
              className={`flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                complaint.userVoted === 'down'
                  ? 'bg-rose-500/20 text-rose-400 font-bold'
                  : 'text-gray-400 hover:text-rose-400 hover:bg-[#1f2735]'
              }`}
              title="لم أواجه هذه المشكلة"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{complaint.downvotes || 0}</span>
            </button>

            {/* Upvote */}
            <button
              onClick={() => onVote(complaint.id, 'up')}
              className={`flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                complaint.userVoted === 'up'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-emerald-400 hover:bg-[#1f2735]'
              }`}
              title="أؤيد الشكوى (مشكلة حقيقية أعاني منها)"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{complaint.upvotes || 0}</span>
            </button>
          </div>

          {/* WhatsApp direct group share button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenDirectDispatch(complaint)}
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
              title="إرسال الشكوى فوراً إلى جروب ملتقى شباب بشتيل على الواتساب"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>إرسال للجروب</span>
            </button>
          </div>
        </div>
      </article>

      {/* Image Zoom Lightbox Modal */}
      {isImageModalOpen && complaint.imageUrl && (
        <div 
          onClick={() => setIsImageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-[#121720] border border-[#293448] rounded-2xl overflow-hidden shadow-2xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-[#212837] bg-[#161c27]">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  صورة توثيق: {complaint.title}
                </span>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252d3d] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/60">
              <img
                src={complaint.imageUrl}
                alt={complaint.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
