/**
 * Utility function to clear old test data that might be lingering in localStorage
 * This should be called when the app starts to ensure clean state for new users
 */
export function clearOldTestData() {
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
  
  // Remove old keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared old test data: ${key}`);
  });
  
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