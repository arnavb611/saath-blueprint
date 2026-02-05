import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  X,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import LiveTrackingMap from '@/components/LiveTrackingMap';
import ServiceFiltersComponent, { ServiceFilters } from '@/components/services/ServiceFilters';
import WorkerCard, { WorkerPublic } from '@/components/workers/WorkerCard';
import WorkerProfile from '@/components/workers/WorkerProfile';
import BookingScheduler from '@/components/booking/BookingScheduler';

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

// Full worker data (only accessible to authenticated users after booking)
interface SupabaseWorkerFull extends WorkerPublic {
  phone: string;
  email: string | null;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, profile } = useSupabaseAuthContext();
  const [services, setServices] = useState<SupabaseService[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(
    searchParams.get('service') || null
  );
  const [workers, setWorkers] = useState<WorkerPublic[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<WorkerPublic | null>(null);
  const [showWorkerProfile, setShowWorkerProfile] = useState(false);
  const [showBookingScheduler, setShowBookingScheduler] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [bookedWorker, setBookedWorker] = useState<SupabaseWorkerFull | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<ServiceFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 5000,
    minRating: 0,
    availability: 'all',
    sortBy: 'rating',
  });

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } else {
        setServices((data as SupabaseService[]) || []);
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
          .from('workers_public')
          .select('*')
          .eq('service', selectedService);
        
        if (error) {
          console.error('Error fetching workers:', error);
          toast.error('Failed to load workers');
        } else {
          const workersData = (data as WorkerPublic[]) || [];
          setWorkers(workersData);
          
          // Extract unique locations
          const uniqueLocations = [...new Set(workersData.map(w => w.area))].filter(Boolean);
          setLocations(uniqueLocations);
        }
        setSearchParams({ service: selectedService });
      } else {
        setWorkers([]);
        setLocations([]);
        setSearchParams({});
      }
    };
    fetchWorkers();
  }, [selectedService, setSearchParams]);

  // Filter and sort workers
  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    // Apply filters
    if (filters.location) {
      result = result.filter(w => w.area === filters.location);
    }
    if (filters.minRating > 0) {
      result = result.filter(w => w.rating >= filters.minRating);
    }
    if (filters.availability !== 'all') {
      result = result.filter(w => 
        filters.availability === 'available' ? w.is_available : !w.is_available
      );
    }
    // Price filter - parse price string
    result = result.filter(w => {
      const priceMatch = w.price.match(/₹?(\d+)/);
      if (!priceMatch) return true;
      const price = parseInt(priceMatch[1]);
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        result.sort((a, b) => {
          const priceA = parseInt(a.price.match(/₹?(\d+)/)?.[1] || '0');
          const priceB = parseInt(b.price.match(/₹?(\d+)/)?.[1] || '0');
          return priceA - priceB;
        });
        break;
      case 'price_high':
        result.sort((a, b) => {
          const priceA = parseInt(a.price.match(/₹?(\d+)/)?.[1] || '0');
          const priceB = parseInt(b.price.match(/₹?(\d+)/)?.[1] || '0');
          return priceB - priceA;
        });
        break;
      case 'reviews':
        result.sort((a, b) => b.reviews_count - a.reviews_count);
        break;
    }

    return result;
  }, [workers, filters]);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [services, searchTerm]);

  const handleBookWorker = (worker: WorkerPublic) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    setSelectedWorker(worker);
    setShowWorkerProfile(false);
    setShowBookingScheduler(true);
  };

  const handleViewProfile = (worker: WorkerPublic) => {
    setSelectedWorker(worker);
    setShowWorkerProfile(true);
  };

  const confirmBooking = async (scheduledAt: Date) => {
    if (!selectedWorker || !user) return;

    setBookingLoading(true);

    // Create booking record
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        worker_id: selectedWorker.id,
        service: selectedWorker.service,
        status: 'confirmed',
        scheduled_at: scheduledAt.toISOString(),
      });

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      toast.error('Failed to create booking. Please try again.');
      setBookingLoading(false);
      return;
    }

    // Fetch full worker data with contact info
    const { data: fullWorkerData, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', selectedWorker.id)
      .single();

    if (error || !fullWorkerData) {
      console.error('Error fetching worker contact info:', error);
      toast.error('Booking created but failed to load worker details');
      setBookingLoading(false);
      return;
    }

    setShowBookingScheduler(false);
    setBookedWorker(fullWorkerData as SupabaseWorkerFull);
    setShowTracking(true);
    setBookingLoading(false);
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

        {/* Worker Profile Modal */}
        {showWorkerProfile && selectedWorker && (
          <WorkerProfile
            worker={selectedWorker}
            onClose={() => setShowWorkerProfile(false)}
            onBook={() => {
              setShowWorkerProfile(false);
              handleBookWorker(selectedWorker);
            }}
          />
        )}

        {/* Booking Scheduler Modal */}
        {showBookingScheduler && selectedWorker && (
          <BookingScheduler
            worker={selectedWorker}
            onConfirm={confirmBooking}
            onCancel={() => setShowBookingScheduler(false)}
            isLoading={bookingLoading}
          />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to services
                </button>
                <h1 className="text-3xl font-bold text-foreground">
                  {selectedService} <span className="text-gradient">Professionals</span>
                </h1>
                <p className="text-muted-foreground">
                  {filteredWorkers.length} professionals available
                </p>
              </div>
              <ServiceFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                locations={locations}
              />
            </div>

            {filteredWorkers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👷</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No workers found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or check back later
                </p>
                <Button variant="outline" onClick={() => setFilters({
                  location: '',
                  minPrice: 0,
                  maxPrice: 5000,
                  minRating: 0,
                  availability: 'all',
                  sortBy: 'rating',
                })}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkers.map(worker => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onBook={handleBookWorker}
                    onViewProfile={handleViewProfile}
                  />
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
