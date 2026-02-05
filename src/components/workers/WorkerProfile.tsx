import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock, 
  X, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
}

interface WorkerProfileProps {
  worker: {
    id: string;
    name: string;
    service: string;
    area: string;
    experience: string;
    price: string;
    photo: string | null;
    rating: number;
    reviews_count: number;
    is_verified: boolean;
    is_available: boolean;
  };
  onClose: () => void;
  onBook: () => void;
}

const WorkerProfile = ({ worker, onClose, onBook }: WorkerProfileProps) => {
  const { user, isAuthenticated } = useSupabaseAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [worker.id]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        worker_id: worker.id,
        rating: newReview.rating,
        comment: newReview.comment || null,
      });

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    }

    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl glass rounded-3xl p-6 shadow-3d animate-scale-in my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
              {worker.photo ? (
                <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{worker.name}</h2>
                {worker.is_verified && (
                  <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
                )}
              </div>
              <p className="text-primary font-medium">{worker.service}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {worker.area}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {worker.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-2xl font-bold text-foreground">{worker.rating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="bg-secondary rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-foreground">{worker.reviews_count}</span>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </div>
          <div className="bg-secondary rounded-xl p-4 text-center">
            <span className="text-xl font-bold text-primary">{worker.price}</span>
            <p className="text-sm text-muted-foreground">Price</p>
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-2">Experience</h3>
          <p className="text-muted-foreground">{worker.experience}</p>
        </div>

        {/* Reviews Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reviews ({reviews.length})
            </h3>
            {isAuthenticated && !showReviewForm && (
              <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
                Write Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-secondary rounded-xl p-4 mb-4">
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground mb-2 block">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-accent fill-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground mb-2 block">Your Review</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="bg-secondary/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-accent fill-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book Button */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="hero" 
            className="flex-1 gap-2" 
            onClick={onBook}
            disabled={!worker.is_available}
          >
            <Calendar className="w-4 h-4" />
            {worker.is_available ? 'Book Now' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
