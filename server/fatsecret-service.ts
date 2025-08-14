import crypto from 'crypto';

interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_description: string;
  food_url: string;
}

interface FatSecretFoodDetails {
  food: {
    food_id: string;
    food_name: string;
    servings: {
      serving: Array<{
        calcium?: string;
        calories?: string;
        carbohydrate?: string;
        cholesterol?: string;
        fat?: string;
        fiber?: string;
        iron?: string;
        measurement_description: string;
        metric_serving_amount?: string;
        metric_serving_unit?: string;
        monounsaturated_fat?: string;
        number_of_units?: string;
        polyunsaturated_fat?: string;
        potassium?: string;
        protein?: string;
        saturated_fat?: string;
        serving_description: string;
        serving_id: string;
        serving_url: string;
        sodium?: string;
        sugar?: string;
        trans_fat?: string;
        vitamin_a?: string;
        vitamin_c?: string;
      }>;
    };
  };
}

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class FatSecretService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor() {
    this.clientId = process.env.FATSECRET_CLIENT_ID!;
    this.clientSecret = process.env.FATSECRET_CLIENT_SECRET!;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('FatSecret API credentials not configured');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Return existing token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Get new access token using OAuth 2.0
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await fetch('https://oauth.fatsecret.com/connect/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=basic'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data: AccessTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting FatSecret access token:', error);
      throw error;
    }
  }

  async searchFoods(query: string, maxResults: number = 20): Promise<Array<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
  }>> {
    if (!query.trim()) return [];

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `method=foods.search&search_expression=${encodeURIComponent(query)}&max_results=${maxResults}&format=json`
      });

      if (!response.ok) {
        throw new Error(`FatSecret search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.foods || !data.foods.food) {
        return [];
      }

      // Handle both single food and array of foods
      const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      
      // Get detailed nutrition info for each food
      const detailedFoods = await Promise.all(
        foods.slice(0, 10).map(async (food: FatSecretFood) => { // Limit to 10 for performance
          try {
            return await this.getFoodDetails(food.food_id);
          } catch (error) {
            console.error(`Error getting details for food ${food.food_id}:`, error);
            // Return basic info if detailed fetch fails
            return {
              id: food.food_id,
              name: food.food_name,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              serving: 'Unknown serving'
            };
          }
        })
      );

      return detailedFoods.filter(food => food !== null);
    } catch (error) {
      console.error('Error searching FatSecret foods:', error);
      return [];
    }
  }

  async getFoodDetails(foodId: string): Promise<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
  }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `method=food.get.v4&food_id=${foodId}&format=json`
      });

      if (!response.ok) {
        throw new Error(`FatSecret food details failed: ${response.status}`);
      }

      const data: FatSecretFoodDetails = await response.json();
      const food = data.food;
      
      if (!food.servings || !food.servings.serving) {
        throw new Error('No serving information available');
      }

      // Get the first serving (usually per 100g or most common serving)
      const serving = Array.isArray(food.servings.serving) 
        ? food.servings.serving[0] 
        : food.servings.serving;

      return {
        id: food.food_id,
        name: food.food_name,
        calories: parseFloat(serving.calories || '0'),
        protein: parseFloat(serving.protein || '0'),
        carbs: parseFloat(serving.carbohydrate || '0'),
        fat: parseFloat(serving.fat || '0'),
        serving: serving.serving_description || 'Unknown serving'
      };
    } catch (error) {
      console.error(`Error getting FatSecret food details for ${foodId}:`, error);
      throw error;
    }
  }

  async searchByBarcode(barcode: string): Promise<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
  } | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Ensure barcode is 13 digits (GTIN-13 format)
      const formattedBarcode = barcode.padStart(13, '0');
      
      const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `method=food.find_id_for_barcode&barcode=${formattedBarcode}&region=US&format=json`
      });

      if (!response.ok) {
        return null; // Barcode not found
      }

      const data = await response.json();
      
      if (!data.food_id || !data.food_id.value) {
        return null;
      }

      // Get detailed nutrition info for the barcode food
      return await this.getFoodDetails(data.food_id.value);
    } catch (error) {
      console.error('Error searching by barcode:', error);
      return null;
    }
  }
}

export const fatSecretService = new FatSecretService();