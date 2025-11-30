import { Check, Car, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  brand: string;
  confidence: number;
}

export const ResultCard = ({ brand, confidence }: ResultCardProps) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-400";
    if (conf >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <div className="relative p-8 rounded-2xl bg-card border border-border shadow-elevated overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-glow opacity-50" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 shadow-glow">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Análisis completado</p>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Marca identificada</span>
              </div>
            </div>
          </div>

          {/* Main result */}
          <div className="space-y-6">
            <div className="text-center py-6">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                Marca detectada
              </p>
              <h2 className="text-5xl font-bold text-gradient mb-4">{brand}</h2>

            </div>

            {/* Confidence bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nivel de confianza</span>
                <span className={cn("text-lg font-bold", getConfidenceColor(confidence))}>
                  {confidence}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000 ease-out shadow-glow"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-muted-foreground">
            <Car className="w-5 h-5" />
            <span className="text-sm">Powered by AI Vision</span>
          </div>
        </div>
      </div>
    </div>
  );
};
