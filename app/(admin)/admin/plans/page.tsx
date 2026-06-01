'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Plan {
  _id: string;
  name: string;
  priceUSD: number; // in cents
  minInvestmentUSD: number; // in cents
  annualReturnPercent: number;
  durationDays: number;
  features: string[];
  isRecommended: boolean;
  isActive: boolean;
  color: string;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [minInvestmentUSD, setMinInvestmentUSD] = useState('');
  const [annualReturnPercent, setAnnualReturnPercent] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [featuresText, setFeaturesText] = useState('');
  const [isRecommended, setIsRecommended] = useState(false);
  const [color, setColor] = useState('#10B981');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans/admin/all');
      setPlans(res.data.data.plans);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setName('');
    setPriceUSD('');
    setMinInvestmentUSD('');
    setAnnualReturnPercent('');
    setDurationDays('30');
    setFeaturesText('');
    setIsRecommended(false);
    setColor('#10B981');
    setIsOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPriceUSD((plan.priceUSD / 100).toString());
    setMinInvestmentUSD((plan.minInvestmentUSD / 100).toString());
    setAnnualReturnPercent(plan.annualReturnPercent.toString());
    setDurationDays(plan.durationDays.toString());
    setFeaturesText(plan.features.join('\n'));
    setIsRecommended(plan.isRecommended);
    setColor(plan.color);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceUSD || !minInvestmentUSD || !annualReturnPercent || !durationDays) {
      toast.error('All fields are required');
      return;
    }

    try {
      const payload = {
        name,
        priceUSD: Math.round(Number(priceUSD) * 100),
        minInvestmentUSD: Math.round(Number(minInvestmentUSD) * 100),
        annualReturnPercent: Number(annualReturnPercent),
        durationDays: Number(durationDays),
        features: featuresText.split('\n').map(f => f.trim()).filter(Boolean),
        isRecommended,
        color,
      };

      if (editingPlan) {
        await api.patch(`/plans/admin/update/${editingPlan._id}`, payload);
        toast.success('Plan updated successfully');
      } else {
        await api.post('/plans/admin/create', payload);
        toast.success('Plan created successfully');
      }

      setIsOpen(false);
      fetchPlans();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save plan');
    }
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!confirm(`Are you sure you want to deactivate the plan: "${planName}"?`)) return;
    try {
      await api.delete(`/plans/admin/delete/${id}`);
      toast.success('Plan deactivated successfully');
      fetchPlans();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to deactivate plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-rose-500" />
            Manage Investment Plans
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure starter, growth, and elite plans, returns, and recommendations.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openAddModal}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-5 h-5" /> Add New Plan
          </Button>
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Plans list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && plans.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
            <p>Loading plans list...</p>
          </div>
        ) : plans.length > 0 ? (
          plans.map((p) => (
            <div
              key={p._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between shadow-xl overflow-hidden group"
            >
              {/* Background gradient hint */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: p.color || '#ffffff' }}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition">{p.name}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono">
                      {p.durationDays} Days Duration
                    </span>
                  </div>
                  {p.isRecommended && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>

                <div className="border-t border-b border-slate-800 py-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-2xl font-black text-white">{formatCurrency(p.priceUSD)}</span>
                    <span className="text-slate-500 text-xs ml-1">cost</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400">+{p.annualReturnPercent}%</span>
                    <span className="text-slate-500 text-xs block">return p.a.</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Features Included:</p>
                  <ul className="space-y-1.5">
                    {p.features.map((feat, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 leading-none mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  {p.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Deactivated
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(p)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-xl"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  {p.isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(p._id, p.name)}
                      className="text-rose-500 hover:text-rose-400 hover:bg-slate-850 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500">
            No plans configured. Click "Add New Plan" to create one.
          </div>
        )}
      </div>

      {/* --- ADD / EDIT PLAN DIALOG --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Investment Plan'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="planName" className="text-slate-400 text-xs">Plan Title / Name</Label>
              <Input
                id="planName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Premium Growth"
                className="mt-1 bg-slate-950 border-slate-800 text-sm text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planPrice" className="text-slate-400 text-xs">Plan Cost (USD $)</Label>
                <Input
                  id="planPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                  required
                  placeholder="249.00"
                  className="mt-1 bg-slate-950 border-slate-800 text-sm text-slate-200"
                />
              </div>
              <div>
                <Label htmlFor="planMin" className="text-slate-400 text-xs">Min Investment ($)</Label>
                <Input
                  id="planMin"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={minInvestmentUSD}
                  onChange={(e) => setMinInvestmentUSD(e.target.value)}
                  required
                  placeholder="2500.00"
                  className="mt-1 bg-slate-950 border-slate-800 text-sm text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planReturn" className="text-slate-400 text-xs">Annual Return (% p.a.)</Label>
                <Input
                  id="planReturn"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={annualReturnPercent}
                  onChange={(e) => setAnnualReturnPercent(e.target.value)}
                  required
                  placeholder="14"
                  className="mt-1 bg-slate-950 border-slate-800 text-sm text-slate-200"
                />
              </div>
              <div>
                <Label htmlFor="planDuration" className="text-slate-400 text-xs">Duration (Days)</Label>
                <Input
                  id="planDuration"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                  className="mt-1 bg-slate-950 border-slate-800 text-sm text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="flex items-center gap-2">
                <input
                  id="planRecommend"
                  type="checkbox"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 bg-slate-950 border-slate-800 w-4 h-4"
                />
                <Label htmlFor="planRecommend" className="text-slate-300 text-xs font-semibold select-none">Mark Recommended</Label>
              </div>

              <div>
                <Label htmlFor="planColor" className="text-slate-400 text-xs block mb-1">Theme Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    id="planColor"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-slate-400 uppercase font-mono">{color}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="planFeatures" className="text-slate-400 text-xs">Features List (One feature per line)</Label>
              <textarea
                id="planFeatures"
                rows={4}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="24/7 Premium support&#10;Advisor calls included&#10;Access to PMS advisory"
                className="mt-1 block w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
