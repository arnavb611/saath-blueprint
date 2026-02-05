import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { Copy, Gift, Users, Share2, CheckCircle } from 'lucide-react';

interface ReferralData {
  code: string;
  uses_count: number;
  credits_earned: number;
}

interface UserCredits {
  balance: number;
}

const ReferralCard = () => {
  const { user, isAuthenticated } = useSupabaseAuthContext();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReferralData();
      fetchCredits();
    }
  }, [isAuthenticated, user]);

  const fetchReferralData = async () => {
    if (!user) return;

    // Try to get existing referral code
    const { data, error } = await supabase
      .from('referral_codes')
      .select('code, uses_count, credits_earned')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching referral code:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setReferralData(data);
    } else {
      // Generate new referral code
      await generateReferralCode();
    }
    setLoading(false);
  };

  const fetchCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      return;
    }

    if (data) {
      setCredits(data);
    } else {
      // Create credits record
      const { error: createError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, balance: 0 });
      
      if (!createError) {
        setCredits({ balance: 0 });
      }
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;

    // Generate a simple code
    const code = `SAATH${user.id.substring(0, 6).toUpperCase()}`;

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code })
      .select('code, uses_count, credits_earned')
      .single();

    if (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
    } else {
      setReferralData(data);
    }
  };

  const copyToClipboard = async () => {
    if (!referralData) return;

    try {
      await navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareReferral = async () => {
    if (!referralData) return;

    const shareText = `Join Saath and get ₹50 off your first booking! Use my referral code: ${referralData.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Saath',
          text: shareText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold text-foreground mb-2">Refer & Earn</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Login to get your referral code and earn credits!
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/2" />
          <div className="h-10 bg-secondary rounded" />
          <div className="h-8 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Refer & Earn</h3>
          <p className="text-xs text-muted-foreground">Earn ₹50 for each referral</p>
        </div>
      </div>

      {/* Credits Balance */}
      {credits && (
        <div className="bg-gradient-hero rounded-xl p-4 mb-4 text-primary-foreground">
          <p className="text-sm opacity-90">Your Credits</p>
          <p className="text-2xl font-bold">₹{credits.balance}</p>
        </div>
      )}

      {/* Referral Code */}
      {referralData && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralData.code}
                readOnly
                className="font-mono font-semibold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{referralData.uses_count}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Gift className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-primary">₹{referralData.credits_earned}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>

          {/* Share Button */}
          <Button variant="hero" className="w-full gap-2" onClick={shareReferral}>
            <Share2 className="w-4 h-4" />
            Share & Earn ₹50
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReferralCard;
