import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageIcon, RefreshCw, UploadCloud } from 'lucide-react';
import './RecipeManagement.css';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import {
  fetchRecipeCatalog,
  uploadRecipeImage,
  type RecipeCatalogItem,
} from '@/features/recipes/recipeApi';

const RecipeManagement: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeCatalogItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingRecipeId, setUploadingRecipeId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await fetchRecipeCatalog();
      setRecipes(data);
    } catch {
      setErrorMessage('Không thể tải danh sách món ăn.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(keyword));
  }, [recipes, searchValue]);

  const handleUpload = async (recipe: RecipeCatalogItem, file?: File) => {
    if (!file) {
      return;
    }

    try {
      setUploadingRecipeId(recipe.id);
      setMessage('');
      setErrorMessage('');
      const result = await uploadRecipeImage(recipe.id, file);
      setRecipes((current) =>
        current.map((item) => (item.id === recipe.id ? { ...item, imageUrl: result.imageUrl } : item))
      );
      setMessage(`Đã cập nhật ảnh cho ${recipe.name}.`);
    } catch {
      setErrorMessage('Upload ảnh thất bại. Kiểm tra cấu hình Cloudinary và thử lại.');
    } finally {
      setUploadingRecipeId(null);
      const input = fileInputRefs.current[recipe.id];
      if (input) {
        input.value = '';
      }
    }
  };

  return (
    <div className="recipe-admin">
      <Sidebar />
      <main className="recipe-admin-page">
        <Topbar
          title="Quản lý món ăn"
          searchPlaceholder="Tìm món ăn"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <section className="recipe-admin-content">
          <div className="recipe-admin-toolbar">
            <div>
              <h1>Ảnh món ăn</h1>
              <p>{filteredRecipes.length} món đang hiển thị</p>
            </div>
            <button type="button" onClick={loadRecipes} disabled={isLoading}>
              <RefreshCw aria-hidden="true" size={18} />
              Làm mới
            </button>
          </div>

          {message && <div className="recipe-admin-state success">{message}</div>}
          {errorMessage && <div className="recipe-admin-state error">{errorMessage}</div>}
          {isLoading && <div className="recipe-admin-state">Đang tải danh sách món ăn...</div>}

          {!isLoading && (
            <div className="recipe-admin-table-wrap">
              <table className="recipe-admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên món</th>
                    <th>Thoi gian nau</th>
                    <th>Link Cloudinary</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
                    <tr key={recipe.id}>
                      <td>
                        <div className="recipe-admin-thumb">
                          {recipe.imageUrl ? (
                            <img src={recipe.imageUrl} alt={recipe.name} />
                          ) : (
                            <ImageIcon aria-hidden="true" size={22} />
                          )}
                        </div>
                      </td>
                      <td>{recipe.name}</td>
                      <td>{recipe.cookingTimeMinutes ? `${recipe.cookingTimeMinutes}'` : '-'}</td>
                      <td>
                        <span className="recipe-admin-url">{recipe.imageUrl || 'Chưa có ảnh'}</span>
                      </td>
                      <td>
                        <input
                          ref={(element) => {
                            fileInputRefs.current[recipe.id] = element;
                          }}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(event) => handleUpload(recipe, event.target.files?.[0])}
                        />
                        <button
                          className="recipe-admin-upload"
                          type="button"
                          disabled={uploadingRecipeId === recipe.id}
                          onClick={() => fileInputRefs.current[recipe.id]?.click()}
                        >
                          <UploadCloud aria-hidden="true" size={18} />
                          {uploadingRecipeId === recipe.id ? 'Đang upload' : 'Upload'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default RecipeManagement;
