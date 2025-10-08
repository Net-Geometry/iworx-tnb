/**
 * IoT Webhook Setup Guide Component
 * 
 * Step-by-step guide for configuring TTN webhook integration
 */

import { Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { toast } from "sonner";

interface IoTWebhookSetupProps {
  isOpen: boolean;
  onClose: () => void;
  deviceDevEUI?: string;
}

const WEBHOOK_URL = `${window.location.origin}/functions/v1/ttn-webhook-handler`;

export function IoTWebhookSetup({ isOpen, onClose, deviceDevEUI }: IoTWebhookSetupProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>TTN Webhook Integration Guide</DialogTitle>
          <DialogDescription>
            Follow these steps to send data from The Things Network to iWorx
          </DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible defaultValue="step1" className="w-full">
          {/* Step 1: Copy Webhook URL */}
          <AccordionItem value="step1">
            <AccordionTrigger className="text-left">
              <span className="font-semibold">Step 1: Copy Webhook URL</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy this webhook URL - you'll paste it in TTN console:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-3 rounded text-sm break-all">
                  {WEBHOOK_URL}
                </code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(WEBHOOK_URL)}
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2: Login to TTN */}
          <AccordionItem value="step2">
            <AccordionTrigger className="text-left">
              <span className="font-semibold">Step 2: Login to The Things Network</span>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Navigate to{" "}
                  <a 
                    href="https://console.thethingsnetwork.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    TTN Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Select your application from the list</li>
                {deviceDevEUI && (
                  <li>Click on your device (DevEUI: <code className="text-xs bg-muted px-1 py-0.5 rounded">{deviceDevEUI}</code>)</li>
                )}
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Step 3: Add Webhook Integration */}
          <AccordionItem value="step3">
            <AccordionTrigger className="text-left">
              <span className="font-semibold">Step 3: Add Webhook Integration</span>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In TTN Console, navigate to <strong>Integrations</strong> tab</li>
                <li>Click <strong>+ Add Integration</strong></li>
                <li>Select <strong>Webhook</strong></li>
                <li>Choose <strong>Custom webhook</strong></li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Step 4: Configure Webhook */}
          <AccordionItem value="step4">
            <AccordionTrigger className="text-left">
              <span className="font-semibold">Step 4: Configure Webhook</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Webhook ID:</strong>
                  <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                    iworx-device-{deviceDevEUI || 'YOUR_DEVEUI'}
                  </code>
                </div>
                <div className="text-sm">
                  <strong>Webhook format:</strong> <span className="ml-2">JSON</span>
                </div>
                <div className="text-sm">
                  <strong>Base URL:</strong> <span className="ml-2 text-muted-foreground">Paste the URL from Step 1</span>
                </div>
                <div className="text-sm">
                  <strong>Enabled:</strong> <span className="ml-2">✅ Check this box</span>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Make sure to enable the webhook by checking the "Enabled" checkbox
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          {/* Step 5: Test Integration */}
          <AccordionItem value="step5">
            <AccordionTrigger className="text-left">
              <span className="font-semibold">Step 5: Test Integration</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In TTN Console, go to device page</li>
                <li>Click <strong>Send test uplink</strong></li>
                <li>Check iWorx IoT Devices page for new data</li>
                <li>Expected delay: &lt; 5 seconds</li>
              </ol>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Troubleshooting</AlertTitle>
                <AlertDescription>
                  <p className="text-sm mb-2">If data doesn't appear:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {deviceDevEUI && (
                      <li>Verify DevEUI matches exactly: {deviceDevEUI}</li>
                    )}
                    <li>Check webhook logs in TTN Console for errors</li>
                    <li>Ensure device type decoder is configured in iWorx</li>
                    <li>Verify the device is registered in iWorx</li>
                    <li>Check that the network provider matches (TTN)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
