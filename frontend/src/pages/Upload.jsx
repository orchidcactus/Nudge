import React from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import Button from '../components/Button';

export default function Upload() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Receipt</h1>
        <p className="text-text-muted mt-1">Upload an image of a receipt to automatically extract invoice data (Stretch Goal).</p>
      </div>

      <div className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface/50 to-surface transition-all cursor-pointer group shadow-lg">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <UploadIcon size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-text">Drag and drop your receipt</h3>
        <p className="text-text-muted mb-10 max-w-md text-lg">
          Supports JPG, PNG and PDF. The Google Vision API will extract the customer name, amount, and dates automatically.
        </p>
        <Button className="px-8 py-3 text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
          Browse Files
        </Button>
      </div>
    </div>
  );
}
