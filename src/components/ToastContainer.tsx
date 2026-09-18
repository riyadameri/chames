import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Award, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 text-right bg-white ${
              toast.type === 'points'
                ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950'
                : toast.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                : toast.type === 'warning' || toast.type === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-950'
                : 'border-blue-300 bg-blue-50 text-blue-950'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'points' ? (
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
              ) : toast.type === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : toast.type === 'warning' || toast.type === 'error' ? (
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm leading-tight text-slate-900">{toast.title}</h4>
                {toast.pointsAdded && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
                    +{toast.pointsAdded} نقطة!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
