"use client";

import React from "react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary" | "success";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
}) => {
  if (!isOpen) return null;

  const variantColors = {
    primary: "bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20",
    danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 leading-relaxed font-medium">{message}</p>
          
          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${variantColors[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
