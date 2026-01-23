import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  user_id: string;
  worker_id: string;
  service: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  worker?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    photo: string | null;
    rating: number;
    area: string;
    price: string;
  };
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary', icon: Loader2 },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600', icon: X },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    
    // Fetch bookings with worker details
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings' as never)
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      toast.error('Failed to load bookings');
      setLoading(false);
      return;
    }

    // Fetch worker details for each booking
    const bookingsWithWorkers: Booking[] = [];
    for (const booking of (bookingsData as unknown as Booking[]) || []) {
      const { data: workerData } = await supabase
        .from('workers' as never)
        .select('id, name, phone, email, photo, rating, area, price')
        .eq('id', booking.worker_id)
        .single();

      bookingsWithWorkers.push({
        ...booking,
        worker: workerData as Booking['worker'],
      });
    }

    setBookings(bookingsWithWorkers);
    setLoading(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBookingId) return;

    setCancellingId(selectedBookingId);
    setShowCancelDialog(false);

    const { error } = await supabase
      .from('bookings' as never)
      .update({ status: 'cancelled' } as never)
      .eq('id', selectedBookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } else {
      toast.success('Booking cancelled successfully');
      fetchBookings();
    }

    setCancellingId(null);
    setSelectedBookingId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookings...</p>
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
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-foreground">Saath</span>
            </Link>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
            Book New Service
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My <span className="text-gradient">Bookings</span>
          </h1>
          <p className="text-muted-foreground">
            View and manage your service bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't made any bookings yet. Start by browsing our services!
            </p>
            <Button variant="default" onClick={() => navigate('/services')}>
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status]?.icon || AlertCircle;
              const statusInfo = statusConfig[booking.status] || statusConfig.pending;

              return (
                <div
                  key={booking.id}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Worker Photo */}
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.worker?.photo ? (
                        <img 
                          src={booking.worker.photo} 
                          alt={booking.worker.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {booking.worker?.name || 'Unknown Worker'}
                          </h3>
                          <p className="text-primary font-medium">{booking.service}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.scheduled_at)}</span>
                        </div>
                        {booking.worker?.area && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.worker.area}</span>
                          </div>
                        )}
                        {booking.worker?.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                            <span>{booking.worker.rating} rating</span>
                          </div>
                        )}
                        {booking.worker?.price && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{booking.worker.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {booking.worker?.phone && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <a
                            href={`tel:${booking.worker.phone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call Worker
                          </a>
                        )}
                        {booking.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="text-destructive hover:text-destructive"
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking metadata */}
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    Booked on {formatDate(booking.created_at)}
                    {booking.completed_at && ` • Completed on ${formatDate(booking.completed_at)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;