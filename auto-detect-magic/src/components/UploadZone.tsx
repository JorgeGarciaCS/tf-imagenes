import { useCallback, useState } from "react";
import { Upload, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
}

export const UploadZone = ({ onImageSelect, selectedImage, onClear, isAnalyzing }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  }, [onImageSelect]);

  if (selectedImage) {
    return (
      <div className="relative w-full max-w-2xl mx-auto animate-scale-in">
        <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border/50">
          <img 
            src={selectedImage} 
            alt="Uploaded car" 
            className="w-full h-auto max-h-[500px] object-contain bg-card"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-primary/80 animate-scan shadow-glow" />
              </div>
            </div>
          )}
          {!isAnalyzing && (
            <button
              onClick={onClear}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative w-full max-w-2xl mx-auto p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
        isDragging 
          ? "border-primary bg-primary/5 shadow-glow" 
          : "border-border hover:border-primary/50 hover:bg-secondary/30"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-6 pointer-events-none">
        <div className={cn(
          "p-6 rounded-2xl transition-all duration-300",
          isDragging 
            ? "bg-primary/20 shadow-glow" 
            : "bg-secondary group-hover:bg-primary/10"
        )}>
          {isDragging ? (
            <Image className="w-12 h-12 text-primary animate-pulse-glow" />
          ) : (
            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          )}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-foreground">
            {isDragging ? "Suelta la imagen aquí" : "Arrastra una foto de tu auto"}
          </p>
          <p className="text-muted-foreground">
            o haz clic para seleccionar un archivo
          </p>
        </div>

        <Button variant="glass" size="lg" className="pointer-events-none">
          Seleccionar imagen
        </Button>
      </div>
    </div>
  );
};
