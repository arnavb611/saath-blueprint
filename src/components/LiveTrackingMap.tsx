import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface LiveTrackingMapProps {
  workerName: string;
  estimatedArrival: number;
}

const LiveTrackingMap = ({ workerName, estimatedArrival }: LiveTrackingMapProps) => {
  const [eta, setEta] = useState(estimatedArrival);
  const [workerPosition, setWorkerPosition] = useState({ x: 20, y: 80 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);

  // Simulate worker movement
  useEffect(() => {
    const targetX = 80;
    const targetY = 20;
    const steps = 60;
    const stepX = (targetX - workerPosition.x) / steps;
    const stepY = (targetY - workerPosition.y) / steps;

    let currentStep = 0;
    let currentX = workerPosition.x;
    let currentY = workerPosition.y;

    const moveInterval = setInterval(() => {
      if (currentStep < steps) {
        // Add some randomness to simulate real movement
        const randomX = (Math.random() - 0.5) * 2;
        const randomY = (Math.random() - 0.5) * 2;
        
        currentX += stepX + randomX * 0.3;
        currentY += stepY + randomY * 0.3;
        
        // Clamp values
        currentX = Math.max(5, Math.min(95, currentX));
        currentY = Math.max(5, Math.min(95, currentY));

        setWorkerPosition({ x: currentX, y: currentY });
        setPath(prev => [...prev.slice(-20), { x: currentX, y: currentY }]);
        currentStep++;
      }
    }, 1000);

    return () => clearInterval(moveInterval);
  }, []);

  // Update ETA
  useEffect(() => {
    if (eta <= 0) return;
    
    const etaInterval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 0.25));
    }, 15000);

    return () => clearInterval(etaInterval);
  }, [eta]);

  return (
    <div className="space-y-4">
      {/* ETA Display */}
      <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse">
            <Navigation className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Arrival</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.ceil(eta)} <span className="text-lg font-normal">min</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-primary font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            On the way
          </p>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Main roads */}
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="hsl(var(--muted))" strokeWidth="3" strokeDasharray="10,5" />
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="hsl(var(--muted))" strokeWidth="3" strokeDasharray="10,5" />
          <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="hsl(var(--muted))" strokeWidth="3" strokeDasharray="10,5" />
          
          {/* Worker path trail */}
          {path.length > 1 && (
            <polyline
              points={path.map(p => `${p.x}%,${p.y}%`).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Destination marker (your location) */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: '80%', top: '20%' }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-card rounded text-xs font-medium">
              Your Location
            </div>
          </div>
        </div>

        {/* Worker marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${workerPosition.x}%`, top: `${workerPosition.y}%` }}
        >
          <div className="relative">
            {/* Pulse effect */}
            <div className="absolute inset-0 w-10 h-10 -m-1 rounded-full bg-primary/30 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg glow-primary">
              <Navigation className="w-5 h-5 text-primary-foreground transform rotate-45" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium shadow-lg">
              {workerName}
            </div>
          </div>
        </div>

        {/* Buildings/landmarks */}
        <div className="absolute top-[30%] left-[20%] w-8 h-8 bg-muted/50 rounded-lg" />
        <div className="absolute top-[60%] left-[40%] w-6 h-6 bg-muted/50 rounded-lg" />
        <div className="absolute top-[40%] left-[60%] w-10 h-10 bg-muted/50 rounded-lg" />
        <div className="absolute top-[70%] left-[75%] w-7 h-7 bg-muted/50 rounded-lg" />
      </div>

      {/* Info text */}
      <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        Live tracking - Updates every few seconds
      </p>
    </div>
  );
};

export default LiveTrackingMap;
