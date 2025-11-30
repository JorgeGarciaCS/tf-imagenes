import { useState, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { UploadZone } from "@/components/UploadZone";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Car brands database for demo
// Car brands database removed


interface AnalysisResult {
  brand: string;
  confidence: number;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    try {
      // Convert base64 to blob
      const res = await fetch(selectedImage);
      const blob = await res.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la predicción');
      }

      const data = await response.json();

      setResult({
        brand: data.brand,
        confidence: Math.round(data.confidence * 100),
      });

      toast({
        title: "Análisis completado",
        description: `Se identificó un ${data.brand}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor de análisis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="space-y-12 md:space-y-16">
          {/* Hero Section */}
          <Hero />

          {/* Upload Section */}
          <div className="space-y-8">
            <UploadZone
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
              isAnalyzing={isAnalyzing}
            />

            {/* Analyze Button */}
            {selectedImage && !result && (
              <div className="flex justify-center animate-fade-in">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Identificar marca
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              <ResultCard
                brand={result.brand}
                confidence={result.confidence}
              />

              <div className="flex justify-center">
                <Button
                  variant="glass"
                  size="lg"
                  onClick={handleClear}
                >
                  <RefreshCw className="w-4 h-4" />
                  Analizar otra imagen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Supported Brands & Examples Section */}
        <div className="mt-24 space-y-16 animate-fade-in">

          {/* Examples */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-gradient">Ejemplos de Imágenes</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Para mejores resultados, usa imágenes claras donde el vehículo sea el protagonista.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { src: "/examples/audi.jpg", label: "Audi A3" },
                { src: "/examples/bmw.jpg", label: "BMW Serie 2" },
                { src: "/examples/tesla.jpg", label: "Tesla Model 3" },
                { src: "/examples/toyota.jpg", label: "Toyota 4Runner" },
              ].map((img, i) => (
                <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-elevated border border-white/10">
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white font-medium">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Brands */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-gradient">Marcas Soportadas</h3>
              <p className="text-muted-foreground">
                Nuestro modelo ha sido entrenado para reconocer una amplia variedad de fabricantes.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                "Acura", "Alfa Romeo", "Aston Martin", "Audi", "BMW", "Bentley", "Buick",
                "Cadillac", "Chevrolet", "Chrysler", "Dodge", "FIAT", "Ferrari", "Ford",
                "GMC", "Genesis", "Honda", "Hyundai", "INFINITI", "Jaguar", "Jeep", "Kia",
                "Lamborghini", "Land Rover", "Lexus", "Lincoln", "MINI", "Maserati", "Mazda",
                "McLaren", "Mercedes-Benz", "Mitsubishi", "Nissan", "Porsche", "Ram",
                "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo", "smart"
              ].map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-2 rounded-full bg-secondary/50 border border-white/5 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground">
        <p>Sube una foto de cualquier auto y descubre su marca al instante</p>
      </footer>
    </div>
  );
};

export default Index;
