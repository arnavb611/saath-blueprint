import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  X,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import LiveTrackingMap from '@/components/LiveTrackingMap';

// Supabase types
interface SupabaseService {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  price_unit: string;
  emoji: string | null;
  verified_workers_count: number;
}

interface SupabaseWorker {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  area: string;
  experience: string;
  price: string;
  photo: string | null;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  is_available: boolean;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, profile } = useSupabaseAuthContext();
  const [services, setServices] = useState<SupabaseService[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(
    searchParams.get('service') || null
  );
  const [workers, setWorkers] = useState<SupabaseWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<SupabaseWorker | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [bookedWorker, setBookedWorker] = useState<SupabaseWorker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      // Use rpc or raw query since tables not yet in generated types
      const { data, error } = await supabase
        .from('services' as never)
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } else {
        setServices((data as unknown as SupabaseService[]) || []);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  // Fetch workers when service is selected
  useEffect(() => {
    const fetchWorkers = async () => {
      if (selectedService) {
        const { data, error } = await supabase
          .from('workers' as never)
          .select('*')
          .eq('service', selectedService)
          .eq('is_verified', true)
          .order('rating', { ascending: false });
        
        if (error) {
          console.error('Error fetching workers:', error);
          toast.error('Failed to load workers');
        } else {
          setWorkers((data as unknown as SupabaseWorker[]) || []);
        }
        setSearchParams({ service: selectedService });
      } else {
        setWorkers([]);
        setSearchParams({});
      }
    };
    fetchWorkers();
  }, [selectedService, setSearchParams]);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [services, searchTerm]);

  const handleBookWorker = (worker: SupabaseWorker) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    setSelectedWorker(worker);
    setShowBookingConfirm(true);
  };

  const confirmBooking = () => {
    if (!selectedWorker || !user) return;

    // TODO: Create booking in Supabase when bookings table is created
    setShowBookingConfirm(false);
    setBookedWorker(selectedWorker);
    setShowTracking(true);
    toast.success('Booking confirmed! Track your worker on the map.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => selectedService ? setSelectedService(null) : navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-foreground">Saath</span>
            </Link>
          </div>
          {isAuthenticated ? (
            <span className="text-sm text-muted-foreground">Hi, {profile?.name || user?.email}</span>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        {/* Tracking Modal */}
        {showTracking && bookedWorker && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-3xl glass rounded-3xl p-6 shadow-3d animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Tracking Your Worker</h2>
                  <p className="text-muted-foreground">{bookedWorker.name} is on the way!</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTracking(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Worker Info */}
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl mb-4">
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center overflow-hidden">
                  {bookedWorker.photo ? (
                    <img src={bookedWorker.photo} alt={bookedWorker.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{bookedWorker.name}</h3>
                  <p className="text-sm text-primary">{bookedWorker.service}</p>
                </div>
                <a href={`tel:${bookedWorker.phone}`} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-accent/10 rounded-xl mb-4">
                <p className="text-sm text-muted-foreground mb-1">Worker's Phone Number</p>
                <p className="text-lg font-bold text-foreground">{bookedWorker.phone}</p>
              </div>

              {/* Map */}
              <LiveTrackingMap 
                workerName={bookedWorker.name}
                estimatedArrival={15}
              />

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setShowTracking(false);
                  setSelectedService(null);
                  setBookedWorker(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showBookingConfirm && selectedWorker && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md glass rounded-3xl p-6 shadow-3d animate-scale-in">
              <h2 className="text-xl font-bold text-foreground mb-4">Confirm Booking</h2>
              
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl mb-4">
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center overflow-hidden">
                  {selectedWorker.photo ? (
                    <img src={selectedWorker.photo} alt={selectedWorker.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedWorker.name}</h3>
                  <p className="text-sm text-primary">{selectedWorker.service}</p>
                  <p className="text-sm text-muted-foreground">{selectedWorker.price}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowBookingConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1" onClick={confirmBooking}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        )}

        {!selectedService ? (
          /* Services List */
          <div className="animate-fade-in">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Services
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Choose a <span className="text-gradient">Service</span>
              </h1>
              <p className="text-muted-foreground mb-6">
                Select a service to see available professionals
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search services..."
                  className="pl-12 bg-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.name)}
                  className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 border border-transparent hover:border-primary/20 text-left card-3d"
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
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">₹{service.base_price} {service.price_unit}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {service.verified_workers_count}+ pros
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Workers List */
          <div className="animate-fade-in">
            <div className="mb-8">
              <button 
                onClick={() => setSelectedService(null)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to services
              </button>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {selectedService} <span className="text-gradient">Professionals</span>
              </h1>
              <p className="text-muted-foreground">
                {workers.length} verified professionals available
              </p>
            </div>

            {workers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👷</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No workers available</h3>
                <p className="text-muted-foreground mb-6">
                  We're adding more professionals to this category
                </p>
                <Button variant="outline" onClick={() => navigate('/join-as-worker')}>
                  Become a Professional
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map(worker => (
                  <div
                    key={worker.id}
                    className="bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 border border-transparent hover:border-primary/20 card-3d"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl overflow-hidden">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>👤</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{worker.name}</h3>
                          <p className="text-sm text-primary">{worker.service}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          worker.is_available
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {worker.is_available ? "Available" : "Busy"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold text-foreground">{worker.rating}</span>
                        <span className="text-muted-foreground text-sm">({worker.reviews_count})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        {worker.experience}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      {worker.area}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-semibold text-foreground">{worker.price}</span>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleBookWorker(worker)}
                        disabled={!worker.is_available}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;
