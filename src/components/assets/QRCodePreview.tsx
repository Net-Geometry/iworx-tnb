import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodePreviewProps {
  data: string;
  size?: number;
}

export const QRCodePreview: React.FC<QRCodePreviewProps> = ({ data, size = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [data, size]);

  if (!data) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-sm font-medium text-foreground">QR Code Preview</label>
      <div className="p-4 bg-background rounded-lg border border-border shadow-sm">
        <canvas ref={canvasRef} className="bg-white rounded" />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-48 break-all">
        {data}
      </p>
    </div>
  );
};