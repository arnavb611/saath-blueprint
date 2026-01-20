const steps = [
  {
    number: "01",
    title: "Choose Your Service",
    description: "Browse our wide range of home and personal services. Filter by category, ratings, or availability.",
    icon: "🔍",
  },
  {
    number: "02",
    title: "Select a Professional",
    description: "View verified profiles, read reviews, and compare prices. Find the perfect match for your needs.",
    icon: "👤",
  },
  {
    number: "03",
    title: "Book & Confirm",
    description: "Pick a convenient time slot and confirm your booking. Get instant confirmation via SMS.",
    icon: "📅",
  },
  {
    number: "04",
    title: "Get Quality Service",
    description: "Your professional arrives on time. Rate your experience and build your service history.",
    icon: "✨",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple Steps to <span className="text-gradient">Quality Help</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting started is easy. Follow these simple steps and experience hassle-free service.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
