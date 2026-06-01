'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ReferralCard } from '@/components/ReferralCard';
import { Skeleton } from '@/components/ui/skeleton';
import { GitMerge, Users, Network } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalBonusEarned: number;
  referredUsers: Array<{
    id: string;
    maskedName: string;
    joinedAt: string;
    bonusAwarded: boolean;
    bonusAmount: number;
  }>;
}

interface TreeNode {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
  children: TreeNode[];
}

interface TreeData {
  tree: TreeNode;
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const [resReferrals, resTree] = await Promise.all([
        api.get('/referral'),
        api.get('/referral/tree'),
      ]);
      setData(resReferrals.data.data);
      setTreeData(resTree.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load referral stats & team tree');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode, isRoot = false) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Connection Line */}
        {!isRoot && <div className="w-0.5 h-6 bg-slate-200" />}

        {/* Node Card */}
        <div className="bg-white border border-gray-150 rounded-xl p-3.5 shadow-sm min-w-[160px] text-center flex flex-col items-center hover:shadow transition">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs mb-1.5 border border-slate-200">
            {node.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
          </div>
          <div className="font-bold text-gray-800 text-xs truncate max-w-[140px]">{node.name}</div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">******{node.phone.slice(-4)}</div>
          <div className="text-[9px] text-gray-400 mt-1 font-medium">{formatDate(node.joinedAt)}</div>
        </div>

        {/* Children Render */}
        {node.children && node.children.length > 0 && (
          <div className="relative">
            {/* Splitter Line */}
            <div className="w-0.5 h-6 bg-slate-200 mx-auto" />
            
            {/* Horizontal connect link */}
            {node.children.length > 1 && (
              <div className="absolute top-6 left-[15%] right-[15%] h-0.5 bg-slate-200" />
            )}

            {/* Subtree Row */}
            <div className="flex gap-6 items-start pt-0.5">
              {node.children.map((child) => renderTreeNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-text-dark tracking-tight">Refer & Earn v2.0</h1>
        <p className="text-text-muted text-sm mt-1">
          Grow the InvestSlabs network and earn multi-level bonuses.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left panel - Referral Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            {data && (
              <ReferralCard
                referralCode={data.referralCode}
                referralLink={data.referralLink}
                totalReferrals={data.totalReferrals}
                totalBonusEarned={data.totalBonusEarned}
                referredUsers={data.referredUsers}
              />
            )}
          </div>

          {/* Right panel - Team Network Tree */}
          <div className="bg-slate-50 border border-gray-150 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-gray-800">Visual Team Tree</h2>
            </div>
            
            <p className="text-xs text-gray-500 leading-normal">
              Observe your network levels. Direct referrees are Level 1 nodes, while their referrees show as Level 2 children.
            </p>

            <div className="overflow-x-auto py-4 flex justify-center bg-white rounded-xl border border-gray-100 min-h-[300px]">
              {treeData?.tree ? (
                <div className="flex flex-col items-center">
                  {renderTreeNode(treeData.tree, true)}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 text-xs italic">
                  No network tree available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
