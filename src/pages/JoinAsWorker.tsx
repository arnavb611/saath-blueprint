import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getServices } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { Camera, ArrowLeft, Send, MapPin, Briefcase, Clock, User, Phone, Mail } from 'lucide-react';

const JoinAsWorker = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuthContext();
  const services = getServices();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    area: '',
    experience: '',
    expectedPrice: '',
    photo: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const requestCameraAndOpen = async () => {
    // Must be called from a user gesture (click/tap)
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      // If user denies permission, still allow picking from gallery.
    } finally {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.photo) {
      toast.error('Please add a photo to submit your application');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('worker_applications')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          service: formData.service,
          area: formData.area,
          experience: formData.experience,
          expected_price: formData.expectedPrice,
          photo: formData.photo,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Application submitted successfully! We will review and get back to you.');
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
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
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Join Our Team
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Become a <span className="text-gradient">Saath Professional</span>
            </h1>
            <p className="text-muted-foreground">
              Fill out the form below to apply. We'll review your application and get back to you within 48 hours.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 shadow-3d animate-slide-up space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
              <div className="relative">
                <button
                  type="button"
                  onClick={requestCameraAndOpen}
                  className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden"
                  aria-label="Add your photo"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={requestCameraAndOpen}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  aria-label="Open camera"
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">Upload your photo (required for verification)</p>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-secondary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-secondary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="bg-secondary"
                required
              />
            </div>

            {/* Service Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Service You Provide
                </Label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-foreground"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Service Area
                </Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Indiranagar, Koramangala"
                  className="bg-secondary"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Experience
                </Label>
                <Input
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 5 years"
                  className="bg-secondary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Price</Label>
                <Input
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                  placeholder="e.g., ₹500/visit"
                  className="bg-secondary"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default JoinAsWorker;
