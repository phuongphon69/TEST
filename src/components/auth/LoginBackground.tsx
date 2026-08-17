import React from 'react';
import { Shield, Radio, Target, Crosshair } from 'lucide-react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-8 text-white select-none">
      {/* Background Military Tactical Imagery & Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1579912437766-78921e102283?w=1200&auto=format&fit=crop&q=80"
          alt="Tactical Bomb Disposal Operations"
          className="w-full h-full object-cover opacity-25 filter grayscale contrast-125 scale-105 transition-transform duration-1000"
          onError={(e) => {
            // Dark gradient overlay fallback if image offline
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Tactical Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 via-transparent to-slate-950/90" />
      </div>

      {/* Grid Pattern & Radar Sweeper Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Top Unit Badge */}
      <div className="relative z-10 flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-emerald-700 to-slate-900 p-0.5 shadow-xl shadow-amber-950/50">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center border border-amber-500/30">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold block">
            BỘ TƯ LỆNH CÔNG BINH
          </span>
          <h1 className="text-sm font-black text-slate-100 tracking-wider">
            TIỂU ĐOÀN 93 - ĐƠN VỊ BỐT BOM MÌN
          </h1>
        </div>
      </div>

      {/* Center Tactical Visual Content */}
      <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Hệ thống Quản lý Nghiệp vụ RPBM (QLRPBM)</span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-slate-100 leading-tight tracking-tight">
          An Toàn Kỹ Thuật & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500">
            Quản Lý Hồ Sơ Hiện Trường
          </span>
        </h2>

        <p className="text-xs lg:text-sm text-slate-300/90 leading-relaxed font-sans">
          Nền tảng số hóa nghiệp vụ rà phá bom mìn, vật nổ toàn diện: Quản lý phương tiện, vật tư, phương án kỹ thuật thi công, văn bản hồ sơ và nghiệm thu công trình.
        </p>

        {/* Tactical Key Features Pills */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2.5">
            <Crosshair className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200">Giám sát Hiện trường</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2.5">
            <Target className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200">Đánh giá Nguy cơ BOM</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Notice */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Mật mã An toàn Binh chủng Công binh</span>
        <span className="text-emerald-400 font-bold">Phiên bản 2026.08</span>
      </div>
    </div>
  );
};
