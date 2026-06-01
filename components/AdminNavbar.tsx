'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Heart,
  FileCheck,
  ArrowUpRight,
  LogOut,
  BarChart2,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/plans', label: 'Manage Plans', icon: TrendingUp },
  { href: '/admin/plan-requests', label: 'Plan Requests', icon: FileCheck },
  { href: '/admin/withdrawals', label: 'Withdrawal Requests', icon: ArrowUpRight },
  { href: '/admin/donations', label: 'Donations & Scanner', icon: Heart },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 text-slate-100 shadow-xl fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-sm tracking-wide leading-tight uppercase">InvestSlabs</h1>
              <p className="text-[10px] text-rose-400 font-bold tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {adminNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center font-bold text-rose-400 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase font-mono">{user.role}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2 text-rose-400" />
            Logout Control
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-sm uppercase tracking-wide">InvestSlabs Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-800 bg-slate-900 px-3 py-3 space-y-1 text-slate-100">
            {adminNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === href ? 'bg-rose-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="w-5 h-5 text-rose-400" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 shadow-lg text-slate-400">
        <div className="flex items-center justify-around px-2 py-2">
          {adminNavItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors',
                  active ? 'text-rose-400' : 'hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium truncate max-w-[65px]">{label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
