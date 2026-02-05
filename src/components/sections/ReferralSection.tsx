import { Gift, Users, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import ReferralCard from '@/components/referral/ReferralCard';

const ReferralSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuthContext();

  const benefits = [
    {
      icon: Gift,
      title: 'Share Your Code',
      description: 'Get your unique referral code and share it with friends',
    },
    {
      icon: Users,
      title: 'Friends Sign Up',
      description: 'When they book their first service using your code',
    },
    {
      icon: Wallet,
      title: 'Both Earn ₹50',
      description: 'You get ₹50 credit, they get ₹50 off their booking',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Refer & Earn
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Invite Friends, <span className="text-gradient">Earn Rewards</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Share the love! Refer your friends to Saath and earn credits for every successful referral. 
              It's our way of saying thank you for spreading the word.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <Button variant="hero" onClick={() => navigate('/register')} className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Right Side - Referral Card */}
          <div className="lg:pl-8">
            <ReferralCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
