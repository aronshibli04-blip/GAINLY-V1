import { useState, useRef } from "react";
import { Camera, Upload, Scan, Check, X, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

interface PhotoNutritionScannerProps {
  onFoodCreated?: () => void;
}

export function PhotoNutritionScanner({ onFoodCreated }: PhotoNutritionScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<NutritionData | null>(null);
  const [dishName, setDishName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix to get just the base64 data
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Scan nutrition label mutation
  const scanNutritionMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await fetch('/api/scan-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) {
        throw new Error('Failed to scan nutrition label');
      }
      
      return response.json();
    },
    onSuccess: (data: NutritionData) => {
      setExtractedData(data);
      toast({
        title: "Nutrition Data Extracted!",
        description: "Review the details and add a dish name to create your custom meal.",
      });
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Couldn't read the nutrition label. Please try a clearer photo.",
        variant: "destructive"
      });
    }
  });

  // Create custom food mutation
  const createFoodMutation = useMutation({
    mutationFn: async (foodData: any) => {
      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create custom food');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Custom Meal Created!",
        description: `${dishName} has been added to your food database.`,
      });
      
      // Reset form
      setExtractedData(null);
      setDishName("");
      setSelectedImage(null);
      
      // Invalidate food cache
      queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
      
      onFoodCreated?.();
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Couldn't create custom meal. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);

    setIsScanning(true);
    
    try {
      const base64 = await convertToBase64(file);
      await scanNutritionMutation.mutateAsync(base64);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Couldn't process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateFood = () => {
    if (!extractedData || !dishName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a dish name and scan nutrition data.",
        variant: "destructive"
      });
      return;
    }

    const foodData = {
      name: dishName.trim(),
      calories: extractedData.calories,
      protein: extractedData.protein,
      carbs: extractedData.carbs,
      fat: extractedData.fat,
      serving: extractedData.servingSize || "100g",
      category: "Custom Created"
    };

    createFoodMutation.mutate(foodData);
  };

  const resetScanner = () => {
    setExtractedData(null);
    setDishName("");
    setSelectedImage(null);
    setIsScanning(false);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-400/30 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
          <Camera className="h-8 w-8 text-purple-400" />
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Nutrition Scanner
        </CardTitle>
        <p className="text-sm text-purple-300/70">
          Take a photo of nutrition labels to create custom meals
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Section */}
        {!extractedData && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-12"
                data-testid="button-camera-capture"
              >
                <Camera className="h-5 w-5 mr-2" />
                Take Photo
              </Button>
              
              <Button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                disabled={isScanning}
                variant="outline"
                className="border-purple-400/30 text-purple-300 hover:bg-purple-400/10 h-12"
                data-testid="button-upload-image"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </Button>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
                    <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                  </div>
                  <p className="text-purple-300 font-medium">Analyzing nutrition label...</p>
                  <p className="text-purple-400/60 text-sm mt-1">AI is extracting nutrition data</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Preview */}
            {selectedImage && !isScanning && (
              <div className="text-center">
                <img 
                  src={selectedImage} 
                  alt="Nutrition label" 
                  className="max-w-full h-48 object-contain mx-auto rounded-lg border border-purple-400/30"
                />
              </div>
            )}
          </div>
        )}

        {/* Extracted Data Section */}
        <AnimatePresence>
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-white">Nutrition Data Extracted</span>
                </div>
                <Button
                  onClick={resetScanner}
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                  data-testid="button-reset-scanner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Nutrition Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-400/20">
                  <div className="text-2xl font-bold text-white">{extractedData.calories}</div>
                  <div className="text-xs text-purple-300">Calories</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-400/20">
                  <div className="text-2xl font-bold text-white">{extractedData.protein}g</div>
                  <div className="text-xs text-purple-300">Protein</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-400/20">
                  <div className="text-2xl font-bold text-white">{extractedData.carbs}g</div>
                  <div className="text-xs text-purple-300">Carbs</div>
                </div>
                <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-400/20">
                  <div className="text-2xl font-bold text-white">{extractedData.fat}g</div>
                  <div className="text-xs text-purple-300">Fat</div>
                </div>
              </div>

              {/* Dish Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Dish Name</label>
                <Input
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Enter the name of this dish..."
                  className="bg-slate-800/50 border-purple-400/30 text-white placeholder:text-slate-400 focus:border-purple-400"
                  data-testid="input-dish-name"
                />
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateFood}
                disabled={!dishName.trim() || createFoodMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-12"
                data-testid="button-create-custom-food"
              >
                {createFoodMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Create Custom Meal
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}