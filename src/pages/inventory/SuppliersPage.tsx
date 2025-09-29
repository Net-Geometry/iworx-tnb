import { Building, Plus, Star, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SuppliersPage = () => {
  // Mock data for demonstration
  const suppliers = [
    {
      id: "1",
      name: "Industrial Parts Co",
      contactName: "Robert Martinez",
      email: "robert@industrialparts.com",
      phone: "+1 (555) 123-4567",
      address: "789 Manufacturing Ave, Industrial City, TX 75001",
      website: "www.industrialparts.com",
      rating: 5,
      paymentTerms: 30,
      isActive: true,
      totalOrders: 24,
      totalValue: 45750.50,
      lastOrder: "2024-01-15",
      categories: ["Hydraulics", "Pumps", "Seals"]
    },
    {
      id: "2",
      name: "Bearing Solutions",
      contactName: "Jennifer Lee",
      email: "j.lee@bearingsolutions.com", 
      phone: "+1 (555) 987-6543",
      address: "456 Precision Way, Bearing Valley, OH 44101",
      website: "www.bearingsolutions.com",
      rating: 4,
      paymentTerms: 15,
      isActive: true,
      totalOrders: 18,
      totalValue: 28900.75,
      lastOrder: "2024-01-14",
      categories: ["Bearings", "Seals", "Lubricants"]
    },
    {
      id: "3", 
      name: "Safety First Ltd",
      contactName: "Michael Thompson",
      email: "m.thompson@safetyfirst.com",
      phone: "+1 (555) 456-7890",
      address: "321 Safety Boulevard, Secure City, CA 90210",
      website: "www.safetyfirst.com",
      rating: 5,
      paymentTerms: 45,
      isActive: true,
      totalOrders: 12,
      totalValue: 15600.25,
      lastOrder: "2024-01-12",
      categories: ["Safety", "PPE", "Valves"]
    },
    {
      id: "4",
      name: "Power Transmission Inc",
      contactName: "Sarah Wilson",
      email: "s.wilson@powertrans.com",
      phone: "+1 (555) 321-0987",
      address: "654 Transmission Road, Power City, MI 48201",
      website: "www.powertrans.com",
      rating: 4,
      paymentTerms: 30,
      isActive: true,
      totalOrders: 15,
      totalValue: 32450.00,
      lastOrder: "2024-01-10",
      categories: ["Couplings", "Gears", "Motors"]
    },
    {
      id: "5",
      name: "Filter Tech Corp",
      contactName: "David Chen",
      email: "d.chen@filtertech.com",
      phone: "+1 (555) 654-3210", 
      address: "987 Filter Lane, Clean Air City, WA 98001",
      website: "www.filtertech.com",
      rating: 3,
      paymentTerms: 60,
      isActive: false,
      totalOrders: 8,
      totalValue: 12300.00,
      lastOrder: "2023-12-15",
      categories: ["Filters", "Air Systems", "Purification"]
    }
  ];

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage vendor relationships and supplier information</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Supplier
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <div className="text-xs text-muted-foreground">
              {suppliers.filter(s => s.isActive).length} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, supplier) => sum + supplier.totalOrders, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Across all suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${suppliers.reduce((sum, supplier) => sum + supplier.totalValue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total procurement value</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Supplier performance</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Search suppliers..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hydraulics">Hydraulics</SelectItem>
                <SelectItem value="bearings">Bearings</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="couplings">Couplings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className={!supplier.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.contactName}</CardDescription>
                  </div>
                </div>
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div>
                {renderStarRating(supplier.rating)}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{supplier.website}</span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="text-sm font-medium mb-2">Categories</div>
                <div className="flex flex-wrap gap-1">
                  {supplier.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                  <div className="font-medium">{supplier.totalOrders}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="font-medium">${supplier.totalValue.toLocaleString()}</div>
                </div>
              </div>

              {/* Payment Terms & Last Order */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Payment Terms:</span>
                  <div className="font-medium">{supplier.paymentTerms} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Order:</span>
                  <div className="font-medium">{supplier.lastOrder}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Create PO
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuppliersPage;