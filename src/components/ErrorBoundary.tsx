import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('bashtil_complaints_v1');
      localStorage.removeItem('bashtil_dispatch_settings_v1');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-[#0d1117] text-gray-100 flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-[#161c24] border border-[#252d3d] rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              ملتقى شباب بشتيل
            </h1>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              حدث خطأ غير متوقع أثناء تحميل البيانات. لا تقلق، بياناتك آمنة على السحابة، ويمكنك استعادة المنصة بالخيارات التالية:
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-900/30 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل المنصة الآن</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-[#212836] hover:bg-[#2c3648] text-amber-300 border border-amber-500/20 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>إصلاح البيانات التالفة وإعادة التحديث</span>
              </button>

              <a
                href="https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN?s=cl&p=a&mlu=4&ilr=4&iam=2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>فتح جروب ملتقى شباب بشتيل على واتساب</span>
              </a>
            </div>

            <p className="mt-6 text-[11px] text-gray-500">
              تصميم: مصطفى هارون • خدمة أهالي بشتيل
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
