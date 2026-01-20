import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/10 mb-6">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                Trusted by 50,000+ families
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Quality Help,{" "}
              <span className="text-gradient">Always Together</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Connect with verified professionals for all your home and personal needs. 
              From cleaning to care, we bring trusted help right to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="xl">
                Find a Professional
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                <Play className="w-5 h-5" />
                See How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">10K+</p>
                  <p className="text-xs text-muted-foreground">Professionals</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">4.9/5</p>
                  <p className="text-xs text-muted-foreground">User Rating</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="relative lg:pl-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-3xl shadow-medium p-6 md:p-8">
                <div className="aspect-[4/3] bg-gradient-card rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🤝</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Your Saath Journey Starts Here
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Connecting you with trusted professionals
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 md:-left-8 bg-card rounded-2xl shadow-soft p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Home Services</p>
                    <p className="text-xs text-muted-foreground">50+ options</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 md:-right-8 bg-card rounded-2xl shadow-soft p-4 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Top Rated</p>
                    <p className="text-xs text-muted-foreground">Quality assured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
