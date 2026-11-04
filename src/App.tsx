/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ComplaintFilters } from './components/ComplaintFilters';
import { ComplaintCard } from './components/ComplaintCard';
import { ComplaintModal } from './components/ComplaintModal';
import { QrPosterModal } from './components/QrPosterModal';
import { OfficialsSettingsModal } from './components/OfficialsSettingsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { Complaint, ComplaintComment, ComplaintStatus, DispatchSettings } from './types';
import { INITIAL_COMPLAINTS, DEFAULT_DISPATCH_SETTINGS } from './data/initialComplaints';
import { 
  formatComplaintForWhatsApp, 
  openBashtilGroupDirect,
  openWhatsAppDirect, 
  openWhatsAppGroup, 
  redirectToWhatsAppGroup, 
  copyComplaintToClipboard, 
  BASHTIL_WHATSAPP_GROUP_LINK 
} from './utils/whatsapp';
import { Plus, AlertCircle, RefreshCw, X, Send, CheckCircle2, MessageCircle, ExternalLink, Users, Copy, Sparkles, ArrowRight } from 'lucide-react';

const STORAGE_KEY_COMPLAINTS = 'bashtil_complaints_v1';
const STORAGE_KEY_SETTINGS = 'bashtil_dispatch_settings_v1';

// Safe sanitization helper for any complaint object
const sanitizeComplaint = (c: any): Complaint => {
  if (!c || typeof c !== 'object') {
    return {
      id: `bst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketNumber: 'BST-000',
      authorName: 'مواطن من بشتيل',
      category: 'other',
      title: 'بلاغ عام',
      detailedAddress: 'بشتيل، الجيزة',
      details: '',
      status: 'open',
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
    };
  }

  // Defensively strip oversized inline base64 images/videos that might bloat localStorage
  let safeImageUrl = c.imageUrl;
  if (typeof safeImageUrl === 'string' && safeImageUrl.startsWith('data:image') && safeImageUrl.length > 50000) {
    safeImageUrl = undefined;
  }

  let safeVideoUrl = c.videoUrl;
  if (typeof safeVideoUrl === 'string' && safeVideoUrl.startsWith('data:video') && safeVideoUrl.length > 50000) {
    safeVideoUrl = undefined;
  }

  return {
    id: String(c.id || `bst-${Date.now()}`),
    ticketNumber: String(c.ticketNumber || `BST-${Math.floor(100 + Math.random() * 900)}`),
    authorName: String(c.authorName || 'مواطن من بشتيل'),
    category: c.category || 'other',
    title: String(c.title || 'بلاغ بدون عنوان'),
    detailedAddress: String(c.detailedAddress || 'بشتيل، الجيزة'),
    details: String(c.details || ''),
    phone: c.phone ? String(c.phone) : undefined,
    imageUrl: safeImageUrl,
    videoUrl: safeVideoUrl,
    status: (['open', 'in_progress', 'resolved'].includes(c.status) ? c.status : 'open') as ComplaintStatus,
    createdAt: c.createdAt || new Date().toISOString(),
    upvotes: typeof c.upvotes === 'number' && !isNaN(c.upvotes) ? c.upvotes : 0,
    downvotes: typeof c.downvotes === 'number' && !isNaN(c.downvotes) ? c.downvotes : 0,
    userVoted: c.userVoted,
    comments: Array.isArray(c.comments) ? c.comments : [],
  };
};

export default function App() {
  // Complaints list
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeComplaint);
        }
      }
    } catch (e) {
      console.warn('Error loading complaints from localStorage, clearing broken state:', e);
      try {
        localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
      } catch {}
    }
    return INITIAL_COMPLAINTS.map(sanitizeComplaint);
  });

  // Dispatch settings for WhatsApp & 3 APIs
  const [dispatchSettings, setDispatchSettings] = useState<DispatchSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return DEFAULT_DISPATCH_SETTINGS;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isOfficialsSettingsOpen, setIsOfficialsSettingsOpen] = useState(false);
  const [isQrPosterOpen, setIsQrPosterOpen] = useState(false);
  const [selectedCommentsComplaint, setSelectedCommentsComplaint] = useState<Complaint | null>(null);
  // Auto-disappearing Toast Notification state
  const [activeToast, setActiveToast] = useState<{
    id: string;
    ticketNumber: string;
    formattedText: string;
  } | null>(null);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Cloud sync on mount
  useEffect(() => {
    // Fetch complaints from cloud server
    fetch('/api/complaints')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.complaints && Array.isArray(data.complaints) && data.complaints.length > 0) {
          setComplaints(data.complaints.map(sanitizeComplaint));
        }
      })
      .catch((err) => {
        console.warn('Cloud complaints sync note:', err);
      });

    // Fetch settings from cloud server
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setDispatchSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      // Clean oversized data before saving to localStorage to prevent QuotaExceededError
      const safeComplaints = complaints.map((c) => {
        if (c.imageUrl && c.imageUrl.startsWith('data:image') && c.imageUrl.length > 50000) {
          return { ...c, imageUrl: undefined };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(safeComplaints));
    } catch (e) {
      console.warn('Failed to save complaints to localStorage (quota or private mode):', e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(dispatchSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [dispatchSettings]);

  // Check URL query parameters (e.g. from QR code scanned on walls: ?action=new_complaint)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new_complaint' || params.get('new') === '1') {
      setIsNewComplaintOpen(true);
    }
    const ticketParam = params.get('ticket');
    if (ticketParam) {
      setSearchQuery(ticketParam);
    }
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const list = Array.isArray(complaints) ? complaints : [];
    return {
      total: list.length,
      open: list.filter((c) => c?.status === 'open').length,
      inProgress: list.filter((c) => c?.status === 'in_progress').length,
      resolved: list.filter((c) => c?.status === 'resolved').length,
    };
  }, [complaints]);

  // Filtered and sorted complaints
  const filteredComplaints = useMemo(() => {
    const list = Array.isArray(complaints) ? complaints : [];
    return list.filter((c) => {
      if (!c) return false;
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        const matchesAddress = (c.detailedAddress || '').toLowerCase().includes(query);
        const matchesAuthor = (c.authorName || '').toLowerCase().includes(query);
        const matchesDetails = (c.details || '').toLowerCase().includes(query);
        const matchesTicket = (c.ticketNumber || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesAddress && !matchesAuthor && !matchesDetails && !matchesTicket) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'most_voted') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === 'open') {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
      }
      if (sortBy === 'in_progress') {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
      }
      if (sortBy === 'resolved') {
        if (a.status === 'resolved' && b.status !== 'resolved') return -1;
        if (a.status !== 'resolved' && b.status === 'resolved') return 1;
      }
      return 0;
    });
  }, [complaints, searchQuery, selectedCategory, statusFilter, sortBy]);

  // Handlers
  const handleCreateComplaint = async (
    data: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>,
    mediaFile?: File
  ) => {
    const ticketId = `BST-${100 + complaints.length + 1}`;
    const newComplaint: Complaint = {
      ...data,
      id: `bst-${Date.now()}`,
      ticketNumber: ticketId,
      status: 'open',
      createdAt: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      userVoted: 'up',
      comments: [],
    };

    // Optimistically add to local state and close the submission modal immediately
    setComplaints((prev) => [newComplaint, ...prev]);
    setIsNewComplaintOpen(false);

    let finalComplaint = newComplaint;

    // Save to Cloud Server API
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.complaint) {
          finalComplaint = result.complaint;
          // Replace optimistic complaint with cloud response containing static /uploads URLs
          setComplaints((prev) =>
            prev.map((c) => (c.id === newComplaint.id ? result.complaint : c))
          );
        }
      }
    } catch (e) {
      console.warn('Cloud save fallback', e);
    }

    // 1. Format text with full public URLs for photos/videos so WhatsApp generates link preview
    const formattedText = formatComplaintForWhatsApp(finalComplaint);

    // 2. Open Bashtil WhatsApp group directly and copy text and image to clipboard
    openBashtilGroupDirect(formattedText, finalComplaint.imageUrl);

    // 3. Set auto-disappearing toast notification on the site
    setActiveToast({
      id: String(Date.now()),
      ticketNumber: finalComplaint.ticketNumber,
      formattedText,
    });
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.userVoted === type) {
          return {
            ...c,
            userVoted: undefined,
            upvotes: type === 'up' ? Math.max(0, c.upvotes - 1) : c.upvotes,
            downvotes: type === 'down' ? Math.max(0, c.downvotes - 1) : c.downvotes,
          };
        }

        const wasUp = c.userVoted === 'up';
        const wasDown = c.userVoted === 'down';

        return {
          ...c,
          userVoted: type,
          upvotes: type === 'up' ? c.upvotes + 1 : wasUp ? Math.max(0, c.upvotes - 1) : c.upvotes,
          downvotes: type === 'down' ? c.downvotes + 1 : wasDown ? Math.max(0, c.downvotes - 1) : c.downvotes,
        };
      })
    );

    // Sync vote to cloud
    fetch(`/api/complaints/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    // Sync status to cloud
    fetch(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});
  };

  const handleAddComment = (
    complaintId: string,
    commentData: Omit<ComplaintComment, 'id' | 'createdAt'>
  ) => {
    const newComment: ComplaintComment = {
      ...commentData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updated = {
            ...c,
            comments: [...(c.comments || []), newComment],
          };
          if (selectedCommentsComplaint?.id === complaintId) {
            setSelectedCommentsComplaint(updated);
          }
          return updated;
        }
        return c;
      })
    );

    // Sync comment to cloud
    fetch(`/api/complaints/${complaintId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    }).catch(() => {});
  };

  const handleDirectDispatchModal = (complaint: Complaint) => {
    const text = formatComplaintForWhatsApp(complaint);
    openBashtilGroupDirect(text, complaint.imageUrl);
    setActiveToast({
      id: String(Date.now()),
      ticketNumber: complaint.ticketNumber,
      formattedText: text,
    });
  };

  const handleSaveSettings = (newSettings: DispatchSettings) => {
    setDispatchSettings(newSettings);

    // Sync to cloud
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: newSettings.adminPassword || '123456',
        newSettings,
      }),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#0f131a] text-gray-100 flex flex-col font-['Cairo',sans-serif] pb-16" dir="rtl">
      {/* Top Header with secret 6-tap admin trigger on title */}
      <Header
        onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
        onTriggerAdminAuth={() => setIsAdminAuthOpen(true)}
        activeCount={stats.open}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-3.5 sm:px-4 py-4 flex-1">
        {/* Filters & Search Component matching Screenshot 2 */}
        <ComplaintFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          stats={stats}
        />

        {/* Complaints Feed matching Screenshot 2 */}
        <div className="space-y-3.5 sm:space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-[#161c24] border border-[#252d3d] rounded-2xl p-8 text-center text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-500 opacity-60" />
              <p className="text-base font-bold text-gray-200">لا توجد شكاوى مطابقة للبحث أو التصفية</p>
              <p className="text-xs text-gray-400 mt-1">جرّب تغيير كلمات البحث أو اختر "كل المشاكل"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                إعادة ضبط عوامل التصفية
              </button>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onVote={handleVote}
                onOpenComments={(c) => setSelectedCommentsComplaint(c)}
                onOpenDirectDispatch={handleDirectDispatchModal}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button (+) for mobile (clean, without bottom navigation tabs) */}
      <div className="fixed bottom-6 left-6 z-40 sm:hidden">
        <button
          onClick={() => setIsNewComplaintOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-blue-600/50 border-2 border-blue-400/30 transition-all cursor-pointer"
          title="إبلاغ عن مشكلة جديدة"
        >
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals */}
      <ComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSubmit={handleCreateComplaint}
      />

      {/* Auto-disappearing Toast Notification */}
      {activeToast && (
        <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#121824]/95 border-2 border-emerald-500/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-right shadow-emerald-950/60">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs sm:text-sm font-black text-white">
                  تم تسجيل البلاغ (#{activeToast.ticketNumber}) بنجاح!
                </span>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2735] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              تم نسخ نص البلاغ ورابط الصورة تلقائياً لحافظة جهازك. اضغط لفتح الجروب مباشرة:
            </p>

            <button
              onClick={() => {
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(activeToast.formattedText).catch(() => {});
                }
                openWhatsAppGroup();
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>دخول جروب ملتقى شباب بشتيل ولصق البلاغ 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* Secret Admin Password Modal (triggered by 6 taps) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsOfficialsSettingsOpen(true);
        }}
        savedPassword={dispatchSettings.adminPassword || '123456'}
      />

      {/* Officials & Free APIs Control Panel (Admin Settings) */}
      <OfficialsSettingsModal
        isOpen={isOfficialsSettingsOpen}
        onClose={() => setIsOfficialsSettingsOpen(false)}
        settings={dispatchSettings}
        onSave={handleSaveSettings}
        onOpenQrPoster={() => setIsQrPosterOpen(true)}
      />

      {/* QR Poster Generator (can be printed from admin panel) */}
      <QrPosterModal
        isOpen={isQrPosterOpen}
        onClose={() => setIsQrPosterOpen(false)}
      />

      {/* Comments Drawer */}
      <CommentsDrawer
        isOpen={!!selectedCommentsComplaint}
        complaint={selectedCommentsComplaint}
        onClose={() => setSelectedCommentsComplaint(null)}
        onAddComment={handleAddComment}
      />



      {/* Footer with Designer Credit */}
      <footer className="mt-12 py-6 border-t border-[#1e2736] bg-[#0c0f15] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="text-xs text-gray-400">
            منصة ملتقى شباب بشتيل • المنصة الإلكترونية لتوصيل صوت أهالي بشتيل
          </p>
          <div className="inline-flex items-center justify-center gap-1.5 bg-[#141b26] border border-[#232e42] px-4 py-1.5 rounded-full text-xs text-gray-300 shadow-sm">
            <span>تصميم:</span>
            <span className="font-bold text-blue-400 text-sm tracking-wide">
              مصطفى هارون
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
