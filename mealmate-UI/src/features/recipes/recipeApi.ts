import api from '@/services/api';
import type { ApiResponse } from '@/features/auth/types/auth';

export interface RecipeCatalogItem {
  id: number;
  name: string;
  imageUrl?: string | null;
  preferredMealTime?: string | null;
  cookingTimeMinutes?: number | null;
  displayStatus?: string | null;
  favorite: boolean;
  ingredients: string[];
}

export interface RecipeIngredientDetail {
  foodId: number;
  foodName: string;
  quantity: number;
  unit?: string | null;
}

export interface RecipeDetail extends Omit<RecipeCatalogItem, 'ingredients'> {
  instructions?: string | null;
  referenceLink?: string | null;
  author?: string | null;
  ingredients: RecipeIngredientDetail[];
}

export interface FoodOption {
  id: number;
  name: string;
  unit?: string | null;
  categoryName?: string | null;
}

export interface RecipeIngredientInput {
  foodId: number;
  quantity: number;
  unit?: string;
}

export interface CreateRecipePayload {
  name: string;
  instructions?: string;
  referenceLink?: string;
  author?: string;
  preferredMealTime?: string;
  cookingTimeMinutes?: number;
  ingredients: RecipeIngredientInput[];
}

export interface RecipeImageUploadResponse {
  imageUrl: string;
  publicId: string;
}

export const fetchRecipeCatalog = async (): Promise<RecipeCatalogItem[]> => {
  const response = await api.get<ApiResponse<RecipeCatalogItem[]>>('/api/v1/catalogs/recipes/catalog');
  return response.data.data;
};

export const fetchRecipeDetail = async (recipeId: number): Promise<RecipeDetail> => {
  const response = await api.get<ApiResponse<RecipeDetail>>(`/api/v1/catalogs/recipes/${recipeId}/detail`);
  return response.data.data;
};

export const fetchFoodOptions = async (): Promise<FoodOption[]> => {
  const response = await api.get<FoodOption[]>('/api/foods');
  return response.data;
};

export const setRecipeFavorite = async (recipeId: number, favorite: boolean): Promise<void> => {
  if (favorite) {
    await api.post<ApiResponse<void>>(`/api/v1/catalogs/recipes/${recipeId}/favorite`);
    return;
  }

  await api.delete<ApiResponse<void>>(`/api/v1/catalogs/recipes/${recipeId}/favorite`);
};

export const uploadRecipeImage = async (
  recipeId: number,
  file: File
): Promise<RecipeImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<RecipeImageUploadResponse>>(
    `/api/v1/catalogs/recipes/${recipeId}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
};

export const createRecipe = async (
  payload: CreateRecipePayload,
  image?: File | null
): Promise<RecipeDetail> => {
  const formData = new FormData();
  formData.append(
    'recipe',
    new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    })
  );

  if (image) {
    formData.append('image', image);
  }

  const response = await api.post<ApiResponse<RecipeDetail>>('/api/v1/catalogs/recipes/full', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};
