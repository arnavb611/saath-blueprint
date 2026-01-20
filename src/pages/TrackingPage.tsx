import { useNavigate, useSearchParams } from "react-router-dom";
import LiveTrackingMap from "@/components/tracking/LiveTrackingMap";

const TrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const workerName = searchParams.get("worker") || "Rajesh Kumar";
  const service = searchParams.get("service") || "Electrician";

  const workerInfo = {
    name: workerName,
    phone: "+91 98765 43210",
    service: service,
    avatar: "👨‍🔧",
    rating: 4.8,
  };

  return (
    <LiveTrackingMap
      workerInfo={workerInfo}
      destinationAddress="123 HSR Layout, Sector 2, Bengaluru"
      onClose={() => navigate(-1)}
    />
  );
};

export default TrackingPage;
