import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";

const professionals = [
  {
    name: "Priya Sharma",
    service: "Home Cleaning",
    rating: 4.9,
    reviews: 127,
    location: "Indiranagar",
    experience: "5 years",
    price: "₹500/visit",
    available: true,
    avatar: "👩",
  },
  {
    name: "Rajesh Kumar",
    service: "Electrician",
    rating: 4.8,
    reviews: 89,
    location: "Koramangala",
    experience: "8 years",
    price: "₹300/hr",
    available: true,
    avatar: "👨",
  },
  {
    name: "Sunita Devi",
    service: "Elder Care",
    rating: 5.0,
    reviews: 156,
    location: "HSR Layout",
    experience: "10 years",
    price: "₹800/day",
    available: false,
    avatar: "👩‍⚕️",
  },
];

const ProfessionalsSection = () => {
  const navigate = useNavigate();

  const handleBookNow = (professional: typeof professionals[0]) => {
    navigate(`/tracking?worker=${encodeURIComponent(professional.name)}&service=${encodeURIComponent(professional.service)}`);
  };

  return (
    <section id="professionals" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 md:mb-16">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Top Professionals
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Meet Our <span className="text-gradient">Verified Experts</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              Handpicked professionals with proven track records
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto">
            View All Professionals
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Professionals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <div
              key={pro.name}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 border border-transparent hover:border-primary/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                    {pro.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{pro.name}</h3>
                    <p className="text-sm text-primary">{pro.service}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    pro.available
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pro.available ? "Available" : "Busy"}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-semibold text-foreground">{pro.rating}</span>
                  <span className="text-muted-foreground text-sm">({pro.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  {pro.experience}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                <MapPin className="w-4 h-4" />
                {pro.location}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-semibold text-foreground">{pro.price}</span>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={!pro.available}
                  onClick={() => handleBookNow(pro)}
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfessionalsSection;
