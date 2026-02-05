import { Star, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WorkerPublic {
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
}

interface WorkerCardProps {
  worker: WorkerPublic;
  onBook: (worker: WorkerPublic) => void;
  onViewProfile: (worker: WorkerPublic) => void;
}

const WorkerCard = ({ worker, onBook, onViewProfile }: WorkerCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 border border-transparent hover:border-primary/20 card-3d">
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
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground">{worker.name}</h3>
              {worker.is_verified && (
                <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
              )}
            </div>
            <p className="text-sm text-primary">{worker.service}</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            worker.is_available
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="w-3 h-3" />
          {worker.is_available ? "Available" : "Busy"}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="font-medium text-foreground">{worker.rating.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">({worker.reviews_count})</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{worker.area}</span>
        </div>
      </div>

      {/* Experience & Price */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-muted-foreground">{worker.experience}</span>
        <span className="font-semibold text-primary">{worker.price}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => onViewProfile(worker)}
        >
          View Profile
        </Button>
        <Button
          variant="hero"
          className="flex-1"
          onClick={() => onBook(worker)}
          disabled={!worker.is_available}
        >
          {worker.is_available ? 'Book Now' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};

export default WorkerCard;
