/**
 * Utility function to clear old test data from both localStorage and database
 * This should be called when the app starts to ensure clean state for new users
 */
export async function clearOldTestData() {
  const keysToRemove: string[] = [];
  
  // Find all localStorage keys that might contain old test data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('hardgainer-storage') || 
      key.includes('gainly') || 
      key.includes('test-') ||
      key.includes('demo-')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove old keys from localStorage
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared old test data from localStorage: ${key}`);
  });
  
  // Also clear old test data from database
  try {
    const userId = "974acc79-f202-4202-bdab-80c4ef55f534";
    const response = await fetch('/api/clear-test-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (response.ok) {
      console.log('Cleared old test data from database');
    }
  } catch (error) {
    console.warn('Could not clear test data from database:', error);
  }
  
  if (keysToRemove.length > 0) {
    console.log(`Cleared ${keysToRemove.length} old test data entries from localStorage`);
  }
}

/**
 * Check if current data seems to be test data (e.g., from August when it's not August)
 */
export function isTestData(): boolean {
  const currentMonth = new Date().getMonth(); // 0-11, where 7 = August
  
  // Check if we have weight entries from August but it's not August
  const hardgainerData = localStorage.getItem('hardgainer-storage');
  if (hardgainerData) {
    try {
      const parsed = JSON.parse(hardgainerData);
      const weightEntries = parsed.state?.weightEntries || [];
      
      // Check if any weight entries are from August
      const hasAugustData = weightEntries.some((entry: any) => {
        if (entry.date) {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === 7; // August = 7
        }
        return false;
      });
      
      // If we have August data but it's not August, it's likely test data
      return hasAugustData && currentMonth !== 7;
    } catch (e) {
      console.warn('Could not parse localStorage data:', e);
    }
  }
  
  return false;
}