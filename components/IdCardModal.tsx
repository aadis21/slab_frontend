'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Shield, Landmark, Phone, Mail, Award, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserData {
  name: string;
  phone: string;
  email?: string;
  role: string;
  referralCode: string;
  createdAt: string | Date;
}

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}

export default function IdCardModal({ isOpen, onClose, user }: IdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Temporarily remove shadow and roundness issues for html2canvas if any
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Increase resolution
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `${user.name.replace(/\s+/g, '_')}_ID_Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('ID Card download error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-500" />
            Member Identity Card
          </DialogTitle>
        </DialogHeader>

        {/* Outer card wrapper to add padding and nice spacing */}
        <div className="flex flex-col items-center justify-center space-y-6 my-4">
          
          {/* Card Element to capture */}
          <div
            ref={cardRef}
            className="relative w-[340px] h-[520px] rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between select-none"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            }}
          >
            {/* Background decorative patterns */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            {/* Hexagonal grid overlay pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%23ffffff' fill-opacity='1' fill-rule='evenodd' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l13-7.5zM3 17.9v12.7l11 6.35 11-6.35V17.9L14 11.55 3 17.9z'/%3E%3C/svg%3E")`,
                backgroundSize: '28px 49px'
              }}
            />

            {/* Top Branding Section */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shadow-md">
                  <Landmark className="w-4.5 h-4.5 text-slate-900 font-bold" />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-sm tracking-wider uppercase leading-none">InvestSlabs</h2>
                  <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase">Verified Member</span>
                </div>
              </div>
              
              <div className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[8px] text-white font-medium uppercase tracking-wider">{user.role}</span>
              </div>
            </div>

            {/* Avatar and Profile Section */}
            <div className="relative z-10 flex flex-col items-center my-auto py-4">
              {/* Profile Image Border with glowing ring */}
              <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-400 shadow-xl mb-4">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-slate-950">
                  {/* Styled fallback with custom gradient */}
                  <span className="text-3xl font-extrabold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    {user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                  </span>
                </div>
                
                {/* Micro chip element */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-amber-500/90 flex items-center justify-center shadow border border-amber-400/50">
                  <span className="text-[8px] font-bold text-slate-950">V2.0</span>
                </div>
              </div>

              {/* User Name & Status */}
              <h3 className="text-lg font-bold text-white text-center leading-snug drop-shadow-md">
                {user.name}
              </h3>
              <p className="text-xs text-slate-400 tracking-wide mt-1 font-mono uppercase bg-slate-950/40 px-3 py-0.5 rounded-full border border-white/5">
                ID: {user.referralCode}
              </p>
            </div>

            {/* Bottom Details Section */}
            <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <Phone className="w-3 h-3 text-emerald-400" /> Phone
                </span>
                <span className="font-semibold text-white">{user.phone}</span>
              </div>
              
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <Mail className="w-3 h-3 text-blue-400" /> Email
                </span>
                <span className="font-semibold text-white truncate max-w-[150px]">{user.email || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <Calendar className="w-3 h-3 text-purple-400" /> Joined
                </span>
                <span className="font-semibold text-white">{formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Footer Signature */}
            <div className="relative z-10 flex items-center justify-between text-[8px] text-slate-500 border-t border-white/5 pt-3">
              <span>SECURED ECOSYSTEM</span>
              <span className="font-mono text-right">SYSTEM CERTIFIED</span>
            </div>

          </div>

          {/* Action Button */}
          <Button
            onClick={handleDownload}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download ID Card (PNG)
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
