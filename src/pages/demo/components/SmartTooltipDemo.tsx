import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Download, Settings } from "lucide-react";

const SmartTooltipDemo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Tooltips</CardTitle>
        <CardDescription>
          Enhanced tooltips with rich content, shortcuts, and actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <TooltipProvider>
            {/* Basic Rich Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold">Save Changes</div>
                  <p className="text-xs text-muted-foreground">
                    Save your current work. All changes are automatically synced.
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Ctrl+S
                    </Badge>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Tooltip with Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold">Upload Files</div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, PDF (max 10MB)
                  </p>
                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="secondary" className="h-6 text-xs">
                      Quick Upload
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      Settings
                    </Button>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Tooltip with Warning */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    Download Report
                    <Badge variant="destructive" className="text-xs">
                      Large File
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This report is 45MB. Download may take several minutes on slow connections.
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      Ctrl+D
                    </Badge>
                    <span className="text-xs text-muted-foreground">to download</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Tooltip with Multiple Shortcuts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold">System Settings</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Configure system preferences and advanced options
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Open Settings</span>
                      <Badge variant="secondary" className="text-xs">Ctrl+,</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Quick Actions</span>
                      <Badge variant="secondary" className="text-xs">Ctrl+K</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Help</span>
                      <Badge variant="secondary" className="text-xs">F1</Badge>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Smart tooltips</strong> go beyond simple text by including:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Keyboard shortcuts and hotkeys</li>
            <li>Quick action buttons</li>
            <li>Warning badges and status indicators</li>
            <li>Formatted content with multiple sections</li>
            <li>Links to detailed documentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartTooltipDemo;
