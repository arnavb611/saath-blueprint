import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  LogOut,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

// Type for Supabase worker applications
interface SupabaseWorkerApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  area: string;
  experience: string;
  expected_price: string;
  photo: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_id: string | null;
  admin_notes: string | null;
}

// Type for Supabase workers
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
  created_at: string;
  updated_at: string;
}

// Type for Supabase services
interface SupabaseService {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  price_unit: string;
  emoji: string | null;
  verified_workers_count: number;
  created_at: string;
  updated_at: string;
}

// Type for bookings
interface AdminBooking {
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
    name: string;
    phone: string;
    area: string;
  };
  user_profile?: {
    name: string | null;
    email: string;
  };
}

const bookingStatusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary', icon: PlayCircle },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600', icon: X },
};

const AdminDashboard = () => {
  const { profile, isAdmin, signOut } = useSupabaseAuthContext();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<SupabaseWorker[]>([]);
  const [services, setServices] = useState<SupabaseService[]>([]);
  const [applications, setApplications] = useState<SupabaseWorkerApplication[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [editingWorker, setEditingWorker] = useState<SupabaseWorker | null>(null);
  const [editingService, setEditingService] = useState<SupabaseService | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New worker form
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    area: '',
    experience: '',
    price: '',
    photo: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch workers from Supabase
    const { data: workersData, error: workersError } = await supabase
      .from('workers' as never)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (workersError) {
      console.error('Error fetching workers:', workersError);
      toast.error('Failed to load workers');
    } else {
      setWorkers((workersData as unknown as SupabaseWorker[]) || []);
    }

    // Fetch services from Supabase
    const { data: servicesData, error: servicesError } = await supabase
      .from('services' as never)
      .select('*')
      .order('name');
    
    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      toast.error('Failed to load services');
    } else {
      setServices((servicesData as unknown as SupabaseService[]) || []);
    }
    
    // Fetch applications from Supabase
    const { data: apps, error: appsError } = await supabase
      .from('worker_applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (appsError) {
      console.error('Error fetching applications:', appsError);
      toast.error('Failed to load applications');
    } else if (apps) {
      setApplications(apps);
    }
    
    // Fetch bookings from Supabase
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings' as never)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      toast.error('Failed to load bookings');
    } else {
      // Fetch worker and user details for each booking
      const enrichedBookings: AdminBooking[] = [];
      for (const booking of (bookingsData as unknown as AdminBooking[]) || []) {
        // Fetch worker info
        const { data: workerData } = await supabase
          .from('workers' as never)
          .select('name, phone, area')
          .eq('id', booking.worker_id)
          .single();
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles' as never)
          .select('name, email')
          .eq('id', booking.user_id)
          .single();
        
        enrichedBookings.push({
          ...booking,
          worker: workerData as AdminBooking['worker'],
          user_profile: profileData as AdminBooking['user_profile'],
        });
      }
      setBookings(enrichedBookings);
    }
    
    setLoading(false);
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('workers' as never)
      .insert({
        name: newWorker.name,
        phone: newWorker.phone,
        email: newWorker.email || null,
        service: newWorker.service,
        area: newWorker.area,
        experience: newWorker.experience,
        price: newWorker.price,
        photo: newWorker.photo || null,
        rating: 5.0,
        reviews_count: 0,
        is_available: true,
        is_verified: true,
      } as never);
    
    if (error) {
      console.error('Error adding worker:', error);
      toast.error('Failed to add worker');
      return;
    }
    
    toast.success('Worker added successfully');
    setNewWorker({ name: '', phone: '', email: '', service: '', area: '', experience: '', price: '', photo: '' });
    setShowAddWorker(false);
    loadData();
  };

  const handleUpdateWorker = async (id: string, updates: Partial<SupabaseWorker>) => {
    const { error } = await supabase
      .from('workers' as never)
      .update(updates as never)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating worker:', error);
      toast.error('Failed to update worker');
      return;
    }
    
    toast.success('Worker updated');
    setEditingWorker(null);
    loadData();
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    
    const { error } = await supabase
      .from('workers' as never)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting worker:', error);
      toast.error('Failed to delete worker');
      return;
    }
    
    toast.success('Worker deleted');
    loadData();
  };

  const handleUpdateService = async (id: string, updates: Partial<SupabaseService>) => {
    const { error } = await supabase
      .from('services' as never)
      .update(updates as never)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      return;
    }
    
    toast.success('Service updated');
    setEditingService(null);
    loadData();
  };

  const handleApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('worker_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
      return;
    }

    // If approved, create worker in Supabase
    if (status === 'approved') {
      const app = applications.find(a => a.id === id);
      if (app) {
        const { error: workerError } = await supabase
          .from('workers' as never)
          .insert({
            name: app.name,
            phone: app.phone,
            email: app.email || null,
            service: app.service,
            area: app.area,
            experience: app.experience,
            price: app.expected_price,
            photo: app.photo || null,
            rating: 5.0,
            reviews_count: 0,
            is_available: true,
            is_verified: true,
          } as never);
        
        if (workerError) {
          console.error('Error creating worker from application:', workerError);
          toast.error('Application approved but failed to create worker profile');
        }
      }
    }
    
    toast.success(`Application ${status}`);
    loadData();
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: AdminBooking['status']) => {
    const updateData: { status: string; completed_at?: string } = { status: newStatus };
    
    // Set completed_at when status changes to completed
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('bookings' as never)
      .update(updateData as never)
      .eq('id', bookingId);
    
    if (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      return;
    }
    
    toast.success(`Booking marked as ${newStatus}`);
    loadData();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Note: For production, this should upload to Supabase Storage instead of base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isNew) {
          setNewWorker({ ...newWorker, photo: base64 });
        } else if (editingWorker) {
          setEditingWorker({ ...editingWorker, photo: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!isAdmin) return null;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.name || 'Admin'}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="workers" className="space-y-6">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="workers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="w-4 h-4 mr-2" />
              Services & Pricing
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Applications
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
              {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs">
                  {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Manage Workers</h2>
              <Button onClick={() => setShowAddWorker(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </div>

            {/* Add Worker Form */}
            {showAddWorker && (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-foreground mb-4">Add New Worker</h3>
                <form onSubmit={handleAddWorker} className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <select
                      value={newWorker.service}
                      onChange={(e) => setNewWorker({ ...newWorker, service: e.target.value })}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-foreground"
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area</Label>
                    <Input
                      value={newWorker.area}
                      onChange={(e) => setNewWorker({ ...newWorker, area: e.target.value })}
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={newWorker.experience}
                      onChange={(e) => setNewWorker({ ...newWorker, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      value={newWorker.price}
                      onChange={(e) => setNewWorker({ ...newWorker, price: e.target.value })}
                      placeholder="e.g., ₹500/visit"
                      className="bg-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                      {newWorker.photo && (
                        <img src={newWorker.photo} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-4 mt-4">
                    <Button type="submit">Add Worker</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddWorker(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Workers List */}
            <div className="grid gap-4">
              {workers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No workers yet. Add your first worker above.
                </div>
              ) : (
                workers.map(worker => (
                  <div key={worker.id} className="glass rounded-2xl p-6 card-3d">
                    {editingWorker?.id === worker.id ? (
                      <div className="grid md:grid-cols-4 gap-4">
                        <Input
                          value={editingWorker.name}
                          onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                          className="bg-secondary"
                        />
                        <Input
                          value={editingWorker.phone}
                          onChange={(e) => setEditingWorker({ ...editingWorker, phone: e.target.value })}
                          className="bg-secondary"
                        />
                        <Input
                          value={editingWorker.price}
                          onChange={(e) => setEditingWorker({ ...editingWorker, price: e.target.value })}
                          className="bg-secondary"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateWorker(worker.id, editingWorker)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingWorker(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                            {worker.photo ? (
                              <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">👤</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{worker.name}</h3>
                            <p className="text-sm text-primary">{worker.service}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {worker.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {worker.area}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {worker.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            worker.is_verified ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {worker.is_verified ? 'Verified' : 'Pending'}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => setEditingWorker(worker)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteWorker(worker.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Services & Pricing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="glass rounded-2xl p-6 card-3d">
                  {editingService?.id === service.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="bg-secondary"
                      />
                      <Input
                        value={editingService.base_price}
                        onChange={(e) => setEditingService({ ...editingService, base_price: Number(e.target.value) })}
                        className="bg-secondary"
                        placeholder="Base Price"
                        type="number"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateService(service.id, editingService)}>
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                          {service.emoji}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => setEditingService(service)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">₹{service.base_price} {service.price_unit}</span>
                        <span className="text-xs text-muted-foreground">{service.verified_workers_count} workers</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Worker Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No applications yet
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map(app => (
                  <div key={app.id} className="glass rounded-2xl p-6 card-3d">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                          {app.photo ? (
                            <img src={app.photo} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">👤</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{app.name}</h3>
                          <p className="text-sm text-primary">{app.service}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {app.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {app.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.area}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' ? (
                          <>
                            <Button size="sm" onClick={() => handleApplicationStatus(app.id, 'approved')}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleApplicationStatus(app.id, 'rejected')}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'approved' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Manage Bookings</h2>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">
                  {bookings.filter(b => b.status === 'pending').length} Pending
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full">
                  {bookings.filter(b => b.status === 'confirmed').length} Confirmed
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {bookings.filter(b => b.status === 'in_progress').length} In Progress
                </span>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No bookings yet
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(booking => {
                  const StatusIcon = bookingStatusConfig[booking.status]?.icon || Clock;
                  const statusInfo = bookingStatusConfig[booking.status] || bookingStatusConfig.pending;
                  
                  return (
                    <div key={booking.id} className="glass rounded-2xl p-6 card-3d">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              #{booking.id.slice(0, 8)}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-foreground text-lg mb-1">{booking.service}</h3>
                          
                          <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>Customer: {booking.user_profile?.name || booking.user_profile?.email || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>Worker: {booking.worker?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Scheduled: {formatDate(booking.scheduled_at)}</span>
                            </div>
                            {booking.worker?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{booking.worker.phone}</span>
                              </div>
                            )}
                            {booking.worker?.area && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.worker.area}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Created: {formatDate(booking.created_at)}</span>
                            </div>
                          </div>
                          
                          {booking.completed_at && (
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Completed: {formatDate(booking.completed_at)}
                            </div>
                          )}
                        </div>
                        
                        {/* Status Actions */}
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>
                                <Check className="w-4 h-4 mr-1" /> Confirm
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'in_progress')}>
                                <PlayCircle className="w-4 h-4 mr-1" /> Start
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'in_progress' && (
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Complete
                            </Button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <span className="text-sm text-muted-foreground italic">No actions available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
