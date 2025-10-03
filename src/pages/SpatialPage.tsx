/**
 * Spatial Intelligence Page
 * 
 * Interactive GPS tracking, geofencing, and spatial analytics powered by PostGIS
 */

import { useState } from "react";
import { MapPin, Navigation, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useNearbyPeople, useGeofenceStatus } from "@/hooks/useLocationTracking";
import { useGeofenceZones } from "@/hooks/useGeofenceZones";
import { usePeople } from "@/hooks/usePeople";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const SpatialPage = () => {
  const { people } = usePeople();
  const { zones } = useGeofenceZones();
  const [searchRadius, setSearchRadius] = useState(5);
  const [mapCenter] = useState<[number, number]>([3.1390, 101.6869]); // Default: Kuala Lumpur

  // Example: Find nearby people within 5km radius
  const { data: nearbyPeople } = useNearbyPeople(
    mapCenter[0],
    mapCenter[1],
    searchRadius
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spatial Intelligence</h1>
          <p className="text-muted-foreground">GPS tracking, geofencing & route optimization powered by PostGIS</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tracking</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {people.filter((p) => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">People with GPS enabled</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nearby</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {nearbyPeople?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Within {searchRadius}km radius</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geofence Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {zones.filter((z) => z.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Active monitoring zones</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">98.5%</div>
            <p className="text-xs text-muted-foreground">Territory coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live-map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-map">Live Map</TabsTrigger>
          <TabsTrigger value="geofences">Geofence Zones</TabsTrigger>
          <TabsTrigger value="history">Travel History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Map Tab */}
        <TabsContent value="live-map" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Real-Time Location Tracking</CardTitle>
              <CardDescription>
                View live locations of people and assets with PostGIS-powered proximity search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Search radius circle */}
                  <Circle
                    center={mapCenter}
                    radius={searchRadius * 1000}
                    pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
                  />

                  {/* Nearby people markers */}
                  {nearbyPeople?.map((person) => (
                    <Marker
                      key={person.person_id}
                      position={[person.current_lat, person.current_lng]}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <p className="font-semibold">{person.person_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Distance: {person.distance_km.toFixed(2)} km
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last update: {new Date(person.last_update).toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Search radius control */}
              <div className="mt-4 flex items-center gap-4">
                <label className="text-sm font-medium">Search Radius:</label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="border border-border rounded-md px-3 py-1 bg-background"
                >
                  <option value={1}>1 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
                <span className="text-sm text-muted-foreground">
                  Found {nearbyPeople?.length || 0} people nearby
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geofence Zones Tab */}
        <TabsContent value="geofences" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Geofence Management</CardTitle>
              <CardDescription>
                Define geographical boundaries for automated tracking and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {zones.length} active geofence zones configured
                  </p>
                  <Button>
                    <MapPin className="w-4 h-4 mr-2" />
                    Create Zone
                  </Button>
                </div>

                {/* Geofence zones list */}
                {zones.length > 0 ? (
                  <div className="space-y-2">
                    {zones.map((zone) => (
                      <Card key={zone.id} className="border-border/30">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{zone.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {zone.zone_type} • {zone.radius_meters ? `${zone.radius_meters}m radius` : 'Polygon boundary'}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {zone.entry_notification && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Entry Alert
                                </span>
                              )}
                              {zone.exit_notification && (
                                <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                                  Exit Alert
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No geofence zones configured yet</p>
                    <p className="text-sm">Create zones to enable automated tracking and alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Travel History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Historical Path Playback</CardTitle>
              <CardDescription>
                Review and analyze movement patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a person and date range to view their travel history</p>
                <p className="text-sm mt-2">
                  Powered by PostGIS spatial queries for accurate distance calculations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Spatial Analytics</CardTitle>
              <CardDescription>
                Productivity heatmaps, territory coverage, and response time analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Response Time Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Average time to reach job sites: <span className="font-bold text-foreground">24 mins</span>
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Travel Distance Today</h4>
                    <p className="text-sm text-muted-foreground">
                      Total distance traveled: <span className="font-bold text-foreground">342 km</span>
                    </p>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Advanced Analytics Coming Soon</p>
                  <p className="text-sm mt-1">
                    • Productivity heatmaps<br />
                    • Territory coverage optimization<br />
                    • Route efficiency scoring<br />
                    • Time & attendance automation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <Navigation className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Dispatch Optimization</CardTitle>
            <CardDescription>
              Assign work orders to the nearest available technician with required skills
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <MapPin className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Geofencing Alerts</CardTitle>
            <CardDescription>
              Automatic notifications when entering/exiting designated work zones
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <Users className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Safety Monitoring</CardTitle>
            <CardDescription>
              Track personnel in real-time and alert when entering restricted areas
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Implementation Guide */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>PostGIS Integration Complete ✅</CardTitle>
          <CardDescription>Your database is now equipped with powerful geospatial capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What's Been Enabled:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>PostGIS extension with native GEOMETRY/GEOGRAPHY types</li>
              <li>Location columns added to people, assets, meters, and hierarchy nodes</li>
              <li>GPS tracking tables: person_location_history, asset_location_history</li>
              <li>Geofencing infrastructure: geofence_zones, geofence_events</li>
              <li>Spatial query functions: find_nearby_people, check_geofence_status, calculate_travel_distance</li>
              <li>GIST spatial indexes for fast proximity searches</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Build mobile app for GPS tracking (React Native / Capacitor)</li>
              <li>Implement geofence drawing tools on the map</li>
              <li>Add historical path playback with time controls</li>
              <li>Create productivity heatmaps and territory analytics</li>
              <li>Integrate with work orders for auto-status updates</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="default">
              <Navigation className="w-4 h-4 mr-2" />
              Test Location Update
            </Button>
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Draw Geofence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpatialPage;
