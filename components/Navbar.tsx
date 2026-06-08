'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  LogOut,
  BarChart2,
  Menu,
  X,
  Heart,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import DonationModal from '@/components/DonationModal';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plans', label: 'Plans', icon: TrendingUp },
  { href: '/wallet', label: 'My Wallet', icon: Wallet },
  { href: '/referral', label: 'Refer & Earn', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-text-dark leading-tight">InvestSlabs</h1>
              <p className="text-xs text-text-muted">v2.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'sidebar-link',
                pathname === href || pathname.startsWith(href + '/') ? 'active' : ''
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          
          <button
            onClick={() => setIsDonateOpen(true)}
            className="sidebar-link w-full text-left flex items-center gap-3 text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl px-4 py-2.5 transition"
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            Donate
          </button>
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-dark truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate">+{user.phone}</p>
              </div>
            </div>
          )}
          <Button
            id="logout-btn"
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-dark">InvestSlabs</span>
          </div>
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-3 py-3 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'sidebar-link',
                  pathname === href ? 'active' : ''
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            
            <button
              onClick={() => {
                setMobileOpen(false);
                setIsDonateOpen(true);
              }}
              className="sidebar-link w-full text-left flex items-center gap-3 text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl px-4 py-2.5 transition"
            >
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              Donate
            </button>

            <button
              onClick={logout}
              className="sidebar-link w-full text-left flex items-center gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-2.5 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors',
                  active ? 'text-primary-600' : 'text-text-muted hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Donation Scanner Modal */}
      <DonationModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </>
  );
}
