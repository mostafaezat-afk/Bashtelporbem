import React, { useState } from 'react';
import { X, Send, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { Complaint, ComplaintComment } from '../types';

interface CommentsDrawerProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (complaintId: string, comment: Omit<ComplaintComment, 'id' | 'createdAt'>) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  complaint,
  isOpen,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isOfficialRole, setIsOfficialRole] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !authorName.trim()) return;

    onAddComment(complaint.id, {
      author: authorName.trim(),
      text: commentText.trim(),
      isOfficial: isOfficialRole,
    });

    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#121720] border-t sm:border border-[#252d3d] w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden text-right max-h-[85vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#212837] bg-[#161c27] shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                تحديثات وتعليقات الأهالي
              </h3>
              <p className="text-xs text-gray-400 font-mono">#{complaint.ticketNumber} - {complaint.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {(!complaint.comments || complaint.comments.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
              <p className="text-sm font-semibold text-gray-300">لا توجد تعليقات أو ردود حتى الآن</p>
              <p className="text-xs text-gray-500 mt-1">كن أول من يضيف تحديثاً أو شهادة حول هذه المشكلة</p>
            </div>
          ) : (
            (complaint.comments || []).map((c) => (
              <div 
                key={c.id} 
                className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                  c.isOfficial 
                    ? 'bg-blue-950/30 border-blue-600/40' 
                    : 'bg-[#181f2c] border-[#252d3d]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {c.isOfficial ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-blue-300">{c.author}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40">رد مسؤول</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-200">{c.author}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed font-normal">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 bg-[#161c27] border-t border-[#212837] shrink-0 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="اسمك (مواطن / جار / عضو ملتقى)"
              className="bg-[#121720] border border-[#293448] rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none bg-[#121720] border border-[#293448] rounded-xl px-2.5">
              <input
                type="checkbox"
                checked={isOfficialRole}
                onChange={(e) => setIsOfficialRole(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span className="truncate">رد رسمي / عضو الملتقى</span>
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="أضف تعليقاً أو إفادة بتطور المشكلة..."
              className="flex-1 bg-[#121720] border border-[#293448] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
