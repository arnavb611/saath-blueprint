import { ArrowRight } from "lucide-react";

const services = [
  {
    emoji: "🧹",
    name: "Home Cleaning",
    description: "Professional deep cleaning for your space",
    count: "200+ pros",
  },
  {
    emoji: "👶",
    name: "Baby Care",
    description: "Trained nannies and babysitters",
    count: "150+ pros",
  },
  {
    emoji: "👴",
    name: "Elder Care",
    description: "Compassionate care for seniors",
    count: "180+ pros",
  },
  {
    emoji: "🍳",
    name: "Cooking",
    description: "Skilled home cooks for daily meals",
    count: "300+ pros",
  },
  {
    emoji: "🔧",
    name: "Repairs",
    description: "Electricians, plumbers & more",
    count: "400+ pros",
  },
  {
    emoji: "🚗",
    name: "Driver",
    description: "Reliable personal & family drivers",
    count: "250+ pros",
  },
  {
    emoji: "🌿",
    name: "Gardening",
    description: "Garden care and landscaping",
    count: "100+ pros",
  },
  {
    emoji: "📚",
    name: "Tutoring",
    description: "Private tutors for all subjects",
    count: "500+ pros",
  },
  {
    emoji: "🐕",
    name: "Pet Care",
    description: "Pet sitting, grooming & walking",
    count: "80+ pros",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need, <span className="text-gradient">One Place</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From daily chores to specialized care, find the right professional for every need.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {service.emoji}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {service.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                {service.description}
              </p>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {service.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
