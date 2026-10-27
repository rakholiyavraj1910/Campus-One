import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Camera,
  Trash2
} from 'lucide-react';

export interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (imageBlob: Blob) => Promise<void>;
  currentAvatarUrl?: string;
  onRemovePhoto?: () => Promise<void>;
  title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  currentAvatarUrl,
  onRemovePhoto,
  title = 'Update Profile Photo'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImageSrc(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setErrorMsg(null);
      setIsProcessing(false);
      setIsRemoving(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Validate and load selected file
  const handleFileChange = (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please choose a JPG, PNG, or WebP photo.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setZoom(1);
      setPan({ x: 0, y: 0 });

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Redraw canvas with zoom & pan
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Compute scaled dimensions to fill circle
    const aspect = img.width / img.height;
    let drawWidth = size * zoom;
    let drawHeight = size * zoom;

    if (aspect > 1) {
      drawWidth = size * aspect * zoom;
    } else {
      drawHeight = (size / aspect) * zoom;
    }

    const drawX = (size - drawWidth) / 2 + pan.x;
    const drawY = (size - drawHeight) / 2 + pan.y;

    // Draw image
    ctx.save();
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, pan]);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      drawCanvas();
    }
  }, [imageSrc, zoom, pan, drawCanvas]);

  // Mouse / Touch handlers for dragging/panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Drag and drop into modal
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Export cropped 512x512 image blob
  const handleApplyCrop = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 512;
      exportCanvas.height = 512;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context.');

      // Anti-aliasing quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = imageRef.current;
      const size = 512;
      const aspect = img.width / img.height;
      let drawWidth = size * zoom;
      let drawHeight = size * zoom;

      if (aspect > 1) {
        drawWidth = size * aspect * zoom;
      } else {
        drawHeight = (size / aspect) * zoom;
      }

      // Map pan coordinates proportional to 512 export size vs 280 viewport
      const scaleFactor = 512 / 280;
      const drawX = (size - drawWidth) / 2 + pan.x * scaleFactor;
      const drawY = (size - drawHeight) / 2 + pan.y * scaleFactor;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Export as WebP or JPEG blob
      exportCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            setErrorMsg('Failed to process image crop.');
            setIsProcessing(false);
            return;
          }

          try {
            await onCropComplete(blob);
            setIsProcessing(false);
            onClose();
          } catch (err: any) {
            setErrorMsg(err.message || 'Failed to upload cropped photo.');
            setIsProcessing(false);
          }
        },
        'image/webp',
        0.88
      );
    } catch (e: any) {
      setErrorMsg(e.message || 'Image processing error.');
      setIsProcessing(false);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    if (!onRemovePhoto) return;
    setIsRemoving(true);
    try {
      await onRemovePhoto();
      setIsRemoving(false);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to remove photo.');
      setIsRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, or WebP up to 5 MB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing || isRemoving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Image Selected: Cropper View */}
        {imageSrc ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* Canvas with circular crop mask overlay */}
              <div 
                className="relative w-[280px] h-[280px] rounded-3xl overflow-hidden bg-slate-950 shadow-inner cursor-grab active:cursor-grabbing border-2 border-dashed border-teal-500/40"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="w-full h-full block"
                />

                {/* Circular focal guide */}
                <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-teal-400/80 shadow-[0_0_0_9999px_rgba(10,25,47,0.65)]" />
              </div>

              {/* Live Preview Thumbnail */}
              <div className="text-center space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Preview Circle
                </p>
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto ring-4 ring-teal-400/50 shadow-md bg-slate-800 flex items-center justify-center">
                  <canvas
                    width={80}
                    height={80}
                    ref={(c) => {
                      if (!c || !canvasRef.current) return;
                      const ctx = c.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(canvasRef.current, 0, 0, 80, 80);
                      }
                    }}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-[10px] text-slate-400">512 × 512 px</span>
              </div>
            </div>

            {/* Zoom Slider Control */}
            <div className="bg-slate-50 dark:bg-navy-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                <span className="flex items-center space-x-1">
                  <ZoomIn className="w-3.5 h-3.5 text-teal-500" />
                  <span>Zoom &amp; Reposition</span>
                </span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-500"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-500"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Click and drag photo to position your face inside the circle
              </p>
            </div>

            {/* Choose Different Image Button */}
            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-teal-600 dark:text-teal-400 hover:underline font-bold"
              >
                Choose another file
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Reset Position
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt View */
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-navy-950/40 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Drag and drop your photo here, or <span className="text-teal-600 dark:text-teal-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports high-resolution JPG, PNG, or WebP images
              </p>
            </div>

            {/* If photo currently exists, provide Remove option */}
            {currentAvatarUrl && onRemovePhoto && (
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Existing photo active</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isRemoving}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center space-x-1.5"
                >
                  {isRemoving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Remove Current Photo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing || isRemoving}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            Cancel
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-navy-950 font-extrabold text-xs shadow-md shadow-teal-500/20 hover:shadow-lg transition-all flex items-center space-x-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Uploading...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply &amp; Save Photo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
