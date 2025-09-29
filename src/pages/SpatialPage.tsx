import { MapPin } from "lucide-react";

const SpatialPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spatial Intelligence</h1>
          <p className="text-muted-foreground">Interactive spatial maps and GIS integration</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This spatial intelligence module will feature interactive spatial maps using Google Maps and Mapbox, 
          location hierarchy management, GIS integration, and route optimization capabilities.
        </p>
      </div>
    </div>
  );
};

export default SpatialPage;