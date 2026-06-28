import { useState, useRef } from 'react';
import { Upload as UploadIcon, Loader2, File, X, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import { uploadOCR } from '../services/invoices';
import { toast } from 'react-hot-toast';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResponseMsg('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResponseMsg('');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('No file selected. Please select a file first.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading file and running OCR scanner...');
    try {
      const res = await uploadOCR(file);
      setResponseMsg(res.message || 'Upload completed.');
      toast.success('Upload complete!', { id: toastId });
    } catch (err) {
      toast.error(`Upload failed: ${err.message || err}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResponseMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Upload Receipt</h1>
        <p className="text-text-muted mt-1">
          Upload an image of a receipt to automatically extract invoice data (Stretch Goal).
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface/50 to-surface transition-all cursor-pointer group shadow-lg"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-primary/20 transition-all shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <UploadIcon size={32} />
          )}
        </div>
        
        {!file ? (
          <>
            <h3 className="text-xl font-bold mb-2 text-text">Drag and drop your receipt</h3>
            <p className="text-text-muted mb-8 max-w-sm text-sm">
              Supports JPG, PNG and PDF. The Google Vision API will extract the customer name, amount, and dates automatically.
            </p>
            <Button type="button" className="px-6 py-2 text-sm rounded-lg">
              Browse Files
            </Button>
          </>
        ) : (
          <div className="w-full max-w-md bg-background/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-left">
              <div className="p-3 bg-primary/15 text-primary rounded-xl">
                <File size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate max-w-[200px] text-text">{file.name}</p>
                <p className="text-xs text-text-muted">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-text transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {file && !uploading && !responseMsg && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} className="px-8 py-2.5 text-sm gap-2">
            <UploadIcon size={16} />
            Upload and Scan
          </Button>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col items-center justify-center py-4 space-y-2 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs">Extracting metadata from receipt...</p>
        </div>
      )}

      {responseMsg && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in duration-300">
          <div className="p-2 bg-primary/10 text-primary rounded-xl mt-0.5">
            <CheckCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-text">OCR System Status</h4>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              {responseMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

