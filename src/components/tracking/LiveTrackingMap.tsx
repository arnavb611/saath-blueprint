import { useEffect, useState, useRef } from "react";
import { Phone, MessageCircle, Navigation, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkerInfo {
  name: string;
  phone: string;
  service: string;
  avatar: string;
  rating: number;
}

interface TrackingMapProps {
  workerInfo?: WorkerInfo;
  destinationAddress?: string;
  onClose?: () => void;
}

const LiveTrackingMap = ({
  workerInfo = {
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    service: "Electrician",
    avatar: "👨‍🔧",
    rating: 4.8,
  },
  destinationAddress = "123 HSR Layout, Sector 2, Bengaluru",
  onClose,
}: TrackingMapProps) => {
  // Simulated coordinates (Bengaluru)
  const destination = { lat: 12.9141, lng: 77.6411 }; // HSR Layout
  const startPoint = { lat: 12.9352, lng: 77.6245 }; // Koramangala

  // Simulated route points
  const routePoints = [
    startPoint,
    { lat: 12.9310, lng: 77.6280 },
    { lat: 12.9250, lng: 77.6320 },
    { lat: 12.9200, lng: 77.6360 },
    { lat: 12.9170, lng: 77.6390 },
    destination,
  ];

  const [workerPosition, setWorkerPosition] = useState(startPoint);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [eta, setEta] = useState(15);
  const [distance, setDistance] = useState(2.8);
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw map and animate worker
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mapRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Convert lat/lng to canvas coordinates
    const bounds = {
      minLat: 12.90,
      maxLat: 12.95,
      minLng: 77.61,
      maxLng: 77.66,
    };

    const toCanvasCoords = (lat: number, lng: number) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * canvas.width;
      const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * canvas.height;
      return { x, y };
    };

    let animationId: number;
    let progress = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw map background with gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "hsl(220, 20%, 15%)");
      gradient.addColorStop(1, "hsl(220, 20%, 12%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines (roads)
      ctx.strokeStyle = "hsl(220, 15%, 22%)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        // Horizontal roads
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 10) * i + Math.sin(i) * 30);
        ctx.lineTo(canvas.width, (canvas.height / 10) * i + Math.cos(i) * 30);
        ctx.stroke();
        // Vertical roads
        ctx.beginPath();
        ctx.moveTo((canvas.width / 10) * i + Math.cos(i) * 40, 0);
        ctx.lineTo((canvas.width / 10) * i + Math.sin(i) * 40, canvas.height);
        ctx.stroke();
      }

      // Draw route path
      ctx.beginPath();
      ctx.strokeStyle = "hsl(168, 65%, 38%)";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      routePoints.forEach((point, index) => {
        const { x, y } = toCanvasCoords(point.lat, point.lng);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw dashed remaining route
      const currentIdx = Math.floor(currentRouteIndex);
      if (currentIdx < routePoints.length - 1) {
        ctx.beginPath();
        ctx.strokeStyle = "hsl(168, 65%, 50%)";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        
        for (let i = currentIdx; i < routePoints.length; i++) {
          const { x, y } = toCanvasCoords(routePoints[i].lat, routePoints[i].lng);
          if (i === currentIdx) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw destination marker
      const destCoords = toCanvasCoords(destination.lat, destination.lng);
      ctx.setLineDash([]);
      
      // Destination glow
      const destGlow = ctx.createRadialGradient(
        destCoords.x, destCoords.y, 0,
        destCoords.x, destCoords.y, 30
      );
      destGlow.addColorStop(0, "hsla(25, 95%, 55%, 0.4)");
      destGlow.addColorStop(1, "hsla(25, 95%, 55%, 0)");
      ctx.fillStyle = destGlow;
      ctx.beginPath();
      ctx.arc(destCoords.x, destCoords.y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Destination pin
      ctx.fillStyle = "hsl(25, 95%, 55%)";
      ctx.beginPath();
      ctx.arc(destCoords.x, destCoords.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📍", destCoords.x, destCoords.y);

      // Calculate animated worker position
      const idx = Math.floor(currentRouteIndex);
      const nextIdx = Math.min(idx + 1, routePoints.length - 1);
      const t = currentRouteIndex - idx;
      
      const animLat = routePoints[idx].lat + (routePoints[nextIdx].lat - routePoints[idx].lat) * t;
      const animLng = routePoints[idx].lng + (routePoints[nextIdx].lng - routePoints[idx].lng) * t;
      const workerCoords = toCanvasCoords(animLat, animLng);

      // Worker glow effect
      const workerGlow = ctx.createRadialGradient(
        workerCoords.x, workerCoords.y, 0,
        workerCoords.x, workerCoords.y, 40
      );
      workerGlow.addColorStop(0, "hsla(168, 65%, 45%, 0.5)");
      workerGlow.addColorStop(1, "hsla(168, 65%, 45%, 0)");
      ctx.fillStyle = workerGlow;
      ctx.beginPath();
      ctx.arc(workerCoords.x, workerCoords.y, 40, 0, Math.PI * 2);
      ctx.fill();

      // Worker marker
      ctx.fillStyle = "hsl(168, 65%, 38%)";
      ctx.beginPath();
      ctx.arc(workerCoords.x, workerCoords.y, 18, 0, Math.PI * 2);
      ctx.fill();
      
      // Worker border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(workerCoords.x, workerCoords.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      
      // Worker emoji
      ctx.fillStyle = "white";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🛵", workerCoords.x, workerCoords.y);

      // Update position
      setWorkerPosition({ lat: animLat, lng: animLng });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Move along route
    const moveInterval = setInterval(() => {
      setCurrentRouteIndex((prev) => {
        const next = prev + 0.02;
        if (next >= routePoints.length - 1) {
          return routePoints.length - 1;
        }
        // Update ETA and distance
        const remaining = routePoints.length - 1 - next;
        setEta(Math.max(1, Math.round(remaining * 3)));
        setDistance(Math.max(0.1, remaining * 0.5));
        return next;
      });
    }, 100);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(moveInterval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [currentRouteIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" style={{ height: "100vh" }}>
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-foreground">Live Tracking</h1>
        <div className="w-10" />
      </div>

      {/* Map Canvas */}
      <div ref={mapRef} className="relative flex-grow overflow-hidden" style={{ minHeight: "300px" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* ETA Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-card/90 backdrop-blur-xl rounded-2xl p-4 shadow-medium border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arriving in</p>
                <p className="text-2xl font-bold text-foreground">{eta} min</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-lg font-semibold text-foreground">{distance.toFixed(1)} km</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
              style={{
                width: `${100 - (currentRouteIndex / (routePoints.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-xl rounded-xl p-3 shadow-medium border border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full" />
              <span className="text-muted-foreground">Worker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded-full" />
              <span className="text-muted-foreground">Your Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Worker Info */}
      <div className="bg-card border-t border-border rounded-t-3xl p-6 shadow-medium flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-3xl border-2 border-primary">
            {workerInfo.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{workerInfo.name}</h3>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                ⭐ {workerInfo.rating}
              </span>
            </div>
            <p className="text-muted-foreground">{workerInfo.service}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="w-4 h-4" />
              <span>On the way • {eta} min away</span>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl mb-4">
          <MapPin className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Delivering to</p>
            <p className="font-medium text-foreground">{destinationAddress}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 h-12 border-border"
            onClick={() => window.open(`tel:${workerInfo.phone}`)}
          >
            <Phone className="w-5 h-5" />
            Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 h-12 border-border"
            onClick={() => window.open(`sms:${workerInfo.phone}`)}
          >
            <MessageCircle className="w-5 h-5" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
