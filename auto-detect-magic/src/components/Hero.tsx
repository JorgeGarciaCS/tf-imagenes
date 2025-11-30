import { Car, Scan } from "lucide-react";

export const Hero = () => {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      {/* Logo/Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150" />
        <div className="relative p-5 rounded-2xl bg-secondary/50 border border-border shadow-elevated">
          <div className="relative">
            <Car className="w-14 h-14 text-primary" />
            <Scan className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="text-foreground">Auto</span>
          <span className="text-gradient">ID</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Descubre la marca de cualquier auto con 
          <span className="text-primary font-medium"> inteligencia artificial</span>
        </p>
      </div>

      {/* Subtitle */}
      <p className="text-muted-foreground max-w-xl mx-auto">
        Sube una foto y nuestra IA identificará la marca, modelo y año aproximado del vehículo en segundos
      </p>
    </div>
  );
};
