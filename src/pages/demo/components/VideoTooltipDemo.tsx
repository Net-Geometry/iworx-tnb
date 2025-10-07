import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Settings, Users } from "lucide-react";

const VideoTooltipDemo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Tooltips</CardTitle>
        <CardDescription>
          Short video demonstrations that play on hover or click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          {/* Video Tooltip 1 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <FileText className="w-4 h-4 mr-2" />
                Create Work Order
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  <Play className="w-3 h-3" />
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="relative">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Video: Creating a Work Order</p>
                    <p className="text-xs text-muted-foreground">~12 seconds</p>
                  </div>
                </div>
                <div className="p-3 bg-card border-t">
                  <p className="text-xs text-muted-foreground">
                    Quick walkthrough of the work order creation process
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Video Tooltip 2 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Settings className="w-4 h-4 mr-2" />
                Asset Hierarchy
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  <Play className="w-3 h-3" />
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Video: Building Hierarchies</p>
                    <p className="text-xs text-muted-foreground">~15 seconds</p>
                  </div>
                </div>
                <div className="p-3 bg-card border-t">
                  <p className="text-xs text-muted-foreground">
                    See how to organize assets into hierarchies
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Video Tooltip 3 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Users className="w-4 h-4 mr-2" />
                Assign Technician
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  <Play className="w-3 h-3" />
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Video: Assigning Technicians</p>
                    <p className="text-xs text-muted-foreground">~10 seconds</p>
                  </div>
                </div>
                <div className="p-3 bg-card border-t">
                  <p className="text-xs text-muted-foreground">
                    Learn the best way to assign and manage technicians
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div>
            <p className="text-sm font-semibold mb-2">Video Tooltip Best Practices:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Keep videos under 15 seconds</li>
              <li>No audio required (use captions if needed)</li>
              <li>Focus on one specific action</li>
              <li>Use high contrast and clear visuals</li>
              <li>Optimize file size (use GIF or compressed MP4)</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Implementation note:</strong> In production, these would use actual video files or GIFs.
              Videos can be generated from screen recordings or created with tools like Loom, ScreenFlow, or CloudApp.
            </p>
          </div>
        </div>

        {/* Production Guidelines */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Production Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">1</Badge>
              <p className="text-muted-foreground">
                Record at 1080p, then scale down to 720p for web
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">2</Badge>
              <p className="text-muted-foreground">
                Use MP4 format with H.264 codec for best compatibility
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">3</Badge>
              <p className="text-muted-foreground">
                Store videos in <code className="bg-muted px-1 py-0.5 rounded">src/assets/videos/</code> or use CDN
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">4</Badge>
              <p className="text-muted-foreground">
                Consider lazy loading to improve page performance
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default VideoTooltipDemo;
