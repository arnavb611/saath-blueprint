import { Shield, UserCheck, Clock, CreditCard, Headphones, Award } from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Background Verified",
    description: "Every professional undergoes rigorous background checks",
  },
  {
    icon: UserCheck,
    title: "ID Verified",
    description: "Government ID verification for all service providers",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "Punctuality promise with compensation for delays",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options with fraud protection",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support for any issues",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Service guarantee with free re-work if unsatisfied",
  },
];

const TrustSection = () => {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trust Built on <span className="text-gradient">Transparency</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Your safety and satisfaction are our top priorities. Here's what sets us apart.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
