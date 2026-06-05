import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import './RecipeLibraryPage.css';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import RecipeCatalogFilters from '@/components/recipes/RecipeCatalogFilters';
import type { RecipeViewFilter } from '@/components/recipes/RecipeCatalogFilters';
import RecipeCreateModal from '@/components/recipes/RecipeCreateModal';
import RecipeDetailModal from '@/components/recipes/RecipeDetailModal';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import {
  createRecipe,
  fetchFoodOptions,
  fetchRecipeCatalog,
  fetchRecipeDetail,
  setRecipeFavorite,
  type CreateRecipePayload,
  type FoodOption,
  type RecipeCatalogItem,
  type RecipeDetail,
} from '@/features/recipes/recipeApi';

const normalizeText = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const RecipeLibraryPage: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeCatalogItem[]>([]);
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [activeView, setActiveView] = useState<RecipeViewFilter>('all');
  const [selectedMealTime, setSelectedMealTime] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState<Set<number>>(new Set());

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchRecipeCatalog();
      setRecipes(data);
    } catch {
      setErrorMessage('Không thể tải danh mục món ăn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    fetchFoodOptions()
      .then(setFoods)
      .catch(() => setFoods([]));
  }, [loadRecipes]);

  const mealTimeOptions = useMemo(() => {
    return Array.from(
      new Set(
        recipes
          .map((recipe) => recipe.preferredMealTime?.trim())
          .filter((mealTime): mealTime is string => Boolean(mealTime))
      )
    ).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue.trim());

    return recipes.filter((recipe) => {
      if (activeView === 'favorites' && !recipe.favorite) {
        return false;
      }

      if (selectedMealTime !== 'all' && recipe.preferredMealTime !== selectedMealTime) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = normalizeText(`${recipe.name} ${recipe.ingredients.join(' ')}`);
      return searchableText.includes(normalizedSearch);
    });
  }, [activeView, recipes, searchValue, selectedMealTime]);

  const handleOpenRecipe = useCallback(async (recipe: RecipeCatalogItem) => {
    setSelectedRecipe(null);
    setIsDetailLoading(true);

    try {
      const detail = await fetchRecipeDetail(recipe.id);
      setSelectedRecipe(detail);
    } catch {
      setErrorMessage('Không thể tải chi tiết công thức.');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (recipe: RecipeCatalogItem) => {
    const nextFavorite = !recipe.favorite;

    setUpdatingFavoriteIds((current) => new Set(current).add(recipe.id));
    setRecipes((current) =>
      current.map((item) => (item.id === recipe.id ? { ...item, favorite: nextFavorite } : item))
    );

    try {
      await setRecipeFavorite(recipe.id, nextFavorite);
    } catch {
      setRecipes((current) =>
        current.map((item) => (item.id === recipe.id ? { ...item, favorite: recipe.favorite } : item))
      );
      setErrorMessage('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    } finally {
      setUpdatingFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(recipe.id);
        return next;
      });
    }
  }, []);

  const handleCreateRecipe = useCallback(async (payload: CreateRecipePayload, image?: File | null) => {
    setIsCreating(true);
    setErrorMessage('');

    try {
      const createdRecipe = await createRecipe(payload, image);
      setIsCreateOpen(false);
      setSelectedRecipe(createdRecipe);
      await loadRecipes();
    } catch {
      setErrorMessage('Không thể tạo công thức. Kiểm tra nội dung và cấu hình Cloudinary.');
    } finally {
      setIsCreating(false);
    }
  }, [loadRecipes]);

  const closeDetail = () => {
    setSelectedRecipe(null);
    setIsDetailLoading(false);
  };

  return (
    <div className="recipe-library">
      <Sidebar />
      <main className="recipe-library-page">
        <Topbar
          title="Danh mục món ăn"
          searchPlaceholder="Tìm kiếm món ăn, nguyên liệu"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <section className="recipe-library-content">
          <div className="recipe-library-actions">
            <RecipeCatalogFilters
              activeView={activeView}
              selectedMealTime={selectedMealTime}
              mealTimeOptions={mealTimeOptions}
              onViewChange={setActiveView}
              onMealTimeChange={setSelectedMealTime}
            />

            <button className="recipe-add-button" type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus aria-hidden="true" size={18} />
              Thêm công thức nấu ăn
            </button>
          </div>

          {isLoading && <div className="recipe-catalog-state">Đang tải danh mục món ăn...</div>}
          {!isLoading && errorMessage && <div className="recipe-catalog-state error">{errorMessage}</div>}
          {!isLoading && !errorMessage && (
            <RecipeGrid
              recipes={filteredRecipes}
              updatingFavoriteIds={updatingFavoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onOpenRecipe={handleOpenRecipe}
            />
          )}
        </section>
      </main>

      <RecipeDetailModal recipe={selectedRecipe} isLoading={isDetailLoading} onClose={closeDetail} />
      <RecipeCreateModal
        isOpen={isCreateOpen}
        foods={foods}
        isSubmitting={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateRecipe}
      />
    </div>
  );
};

export default RecipeLibraryPage;
