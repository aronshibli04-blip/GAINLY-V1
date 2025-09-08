import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { Download, Upload, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function DataBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { user, weightEntries, calorieEntries, currentTdeeAnalysis, setUser, addWeightEntry, addCalorieEntry, setTdeeAnalysis, clearUserData } = useUserStore();

  const exportData = async () => {
    setIsExporting(true);
    try {
      const backupData = {
        user,
        weightEntries,
        calorieEntries,
        currentTdeeAnalysis,
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0"
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gainly-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "📁 Data eksportert!",
        description: "Sikkerhetskopien er lastet ned til enheten din",
      });
    } catch (error) {
      toast({
        title: "❌ Eksport feilet",
        description: "Kunne ikke eksportere dataene dine",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validate backup structure
        if (!backupData.user || !Array.isArray(backupData.weightEntries)) {
          throw new Error("Ugyldig backup-format");
        }

        // Clear existing data first
        clearUserData();
        
        // Restore data
        if (backupData.user) setUser(backupData.user);
        if (backupData.weightEntries) {
          backupData.weightEntries.forEach((entry: any) => addWeightEntry(entry));
        }
        if (backupData.calorieEntries) {
          backupData.calorieEntries.forEach((entry: any) => addCalorieEntry(entry));
        }
        if (backupData.currentTdeeAnalysis) setTdeeAnalysis(backupData.currentTdeeAnalysis);

        toast({
          title: "📂 Data importert!",
          description: "Sikkerhetskopien er gjenopprettet",
        });
      } catch (error) {
        toast({
          title: "❌ Import feilet",
          description: "Ugyldig backup-fil eller format",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const calculateDataSize = () => {
    const dataSize = JSON.stringify({ user, weightEntries, calorieEntries }).length;
    return `${Math.round(dataSize / 1024)} KB`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <Database className="h-5 w-5" />
          Datasikkerhet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-400/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Automatisk sikkerhetskopi</h4>
              <p className="text-sm text-blue-300/70">
                Dataene dine lagres automatisk i nettleseren. Eksporter regelmessig for ekstra sikkerhet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Total data størrelse</p>
                <p className="text-xs text-slate-400">{calculateDataSize()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{weightEntries.length + calorieEntries.length}</p>
                <p className="text-xs text-slate-400">registrerte poster</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={exportData}
            disabled={isExporting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Eksporterer..." : "Eksporter data"}
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button 
              variant="outline"
              disabled={isImporting}
              className="w-full border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Importerer..." : "Importer data"}
            </Button>
          </div>
        </div>

        <div className="bg-green-950/30 rounded-lg p-3 border border-green-400/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <p className="text-xs text-green-300">
              Dataene dine forblir private og lagres kun lokalt på enheten din
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}