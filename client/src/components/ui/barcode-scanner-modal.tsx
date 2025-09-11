import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScanLine, Search, X } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: FoodItem) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onFoodFound }: BarcodeScannerModalProps) {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) {
      toast({
        title: "Enter barcode",
        description: "Please enter a barcode number to search.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const response = await fetch(`/api/foods/barcode/${encodeURIComponent(barcode.trim())}`);
      
      if (!response.ok) {
        throw new Error('Barcode search failed');
      }
      
      const food = await response.json();
      
      if (food && food.id) {
        onFoodFound(food);
        setBarcode('');
        onClose();
        toast({
          title: "Food found!",
          description: `Added ${food.name} from barcode scan.`,
        });
      } else {
        toast({
          title: "Barcode not found",
          description: "This barcode is not in our database. Try searching manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Could not scan barcode. Please try again or search manually.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <ScanLine className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-slate-300">
            Enter a barcode number to find nutrition information from our comprehensive database of 1.9M+ foods.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode" className="text-slate-200">
              Barcode Number
            </Label>
            <Input
              id="barcode"
              type="text"
              placeholder="Enter barcode (e.g., 1234567890123)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              autoFocus
            />
            <div className="text-xs text-slate-400">
              Scan or type the barcode from food packaging
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleBarcodeSearch}
              disabled={isScanning || !barcode.trim()}
              className="flex-1 grok-gradient"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Barcode
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-center text-slate-400 border-t border-slate-600 pt-3">
            Powered by FatSecret Platform API<br/>
            Global barcode coverage • 56 countries • Extensive food database
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}