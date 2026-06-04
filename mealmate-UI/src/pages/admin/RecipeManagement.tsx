import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SharedModal from '../../components/admin/Modal';
import api from '../../services/api';

import Sidebar from '../../components/layout/Sidebar';
// 🎯 NHÚNG TOPBAR MỚI
import Topbar from '../../components/layout/Topbar';

// 🎯 IMPORT FILE CSS RIÊNG
import './RecipeManagement.css';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: number;
  name: string;
  instructions: string;
  referenceLink?: string;
  author?: string;
  preferredMealTime: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  imageUrl?: string;
  ingredients: Ingredient[];
  regionalNames?: string[];
  displayStatus?: 'SYSTEM' | 'CUSTOM';
  createdAt?: string;
  updatedAt?: string;
  cookingTimeMinutes?: number;
  difficulty?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  servingSize?: number;
}

const formatDateTime = (value?: string) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const RecipeManagement: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foodsCatalog, setFoodsCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Recipe | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [newIngredients, setNewIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [inlineAdding, setInlineAdding] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/catalogs/recipes');
      const data = response.data?.data || response.data || [];
      setRecipes(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách món ăn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoodsCatalog = async () => {
    try {
      const response = await api.get('/api/foods');
      const data = response.data?.data || response.data || [];
      setFoodsCatalog(data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục thực phẩm:', err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchFoodsCatalog();
  }, []);

  const parseAmount = (amountStr: string) => {
    const clean = amountStr.trim();
    const match = clean.match(/^([\d.,]+)\s*(.*)$/);
    if (match) {
      const qty = parseFloat(match[1].replace(',', '.'));
      return { quantity: isNaN(qty) ? 1.0 : qty, unit: match[2] ? match[2].trim() : '' };
    }
    return { quantity: 1.0, unit: clean };
  };

  const findFoodInCatalog = (name: string) => {
    return foodsCatalog.find(f => f.name.toLowerCase().trim() === name.toLowerCase().trim());
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.id.toString().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Tất cả' || recipe.preferredMealTime === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredRecipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/v1/catalogs/recipes/${id}`);
      setRecipes(recipes.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Xóa món ăn thất bại.');
    }
  };

  const handleEditClick = async (recipe: Recipe) => {
    try {
      const response = await api.get(`/api/v1/catalogs/recipes/${recipe.id}/ingredients`);
      const backendIngredients = response.data?.data || response.data || [];
      const mappedIngredients = backendIngredients.map((ri: any) => ({
        name: ri.food?.name || '',
        amount: `${ri.quantity} ${ri.unit || ''}`.trim()
      }));

      const updatedRecipe = {
        ...recipe,
        ingredients: mappedIngredients
      };
      setViewRecipe(updatedRecipe);
      setEditData(JSON.parse(JSON.stringify(updatedRecipe)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách nguyên liệu.');
    }
  };

  const handleAddInlineRegional = () => {
    if (inlineValue.trim() && editData) {
      const current = editData.regionalNames || [];
      if (!current.includes(inlineValue.trim())) {
        const updated = [...current, inlineValue.trim()];
        setEditData({ ...editData, regionalNames: updated });
      }
      setInlineValue('');
      setInlineAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    const invalidIngredients: string[] = [];
    const recipeIngredientsPayload: any[] = [];

    for (const ing of editData.ingredients) {
      if (!ing.name.trim()) continue;
      const food = findFoodInCatalog(ing.name);
      if (!food) {
        invalidIngredients.push(ing.name);
      } else {
        const parsed = parseAmount(ing.amount);
        recipeIngredientsPayload.push({
          food: { id: food.id },
          quantity: parsed.quantity,
          unit: parsed.unit || food.unit || 'g'
        });
      }
    }

    if (invalidIngredients.length > 0) {
      alert(`Các thực phẩm sau không tồn tại trong danh mục hệ thống: ${invalidIngredients.join(', ')}. Vui lòng thêm thực phẩm trước.`);
      return;
    }

    try {
      const recipePayload = {
        name: editData.name,
        instructions: editData.instructions,
        referenceLink: editData.referenceLink || '',
        author: editData.author || 'Admin',
        preferredMealTime: editData.preferredMealTime,
        imageUrl: editData.imageUrl || '',
        displayStatus: editData.displayStatus || 'SYSTEM',
        cookingTimeMinutes: editData.cookingTimeMinutes,
        servingSize: editData.servingSize,
        difficulty: editData.difficulty || null,
        calories: editData.calories,
        protein: editData.protein,
        fat: editData.fat,
        carbs: editData.carbs
      };

      await api.put(`/api/v1/catalogs/recipes/${editData.id}`, recipePayload);
      await api.post(`/api/v1/catalogs/recipes/${editData.id}/ingredients`, recipeIngredientsPayload);

      alert('Cập nhật món ăn thành công!');
      setViewRecipe(null);
      setIsEditing(false);
      fetchRecipes();
    } catch (err) {
      console.error(err);
      alert('Cập nhật món ăn thất bại.');
    }
  };

  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const invalidIngredients: string[] = [];
    const recipeIngredientsPayload: any[] = [];

    for (const ing of newIngredients) {
      if (!ing.name.trim()) continue;
      const food = findFoodInCatalog(ing.name);
      if (!food) {
        invalidIngredients.push(ing.name);
      } else {
        const parsed = parseAmount(ing.amount);
        recipeIngredientsPayload.push({
          food: { id: food.id },
          quantity: parsed.quantity,
          unit: parsed.unit || food.unit || 'g'
        });
      }
    }

    if (invalidIngredients.length > 0) {
      alert(`Các thực phẩm sau không tồn tại trong danh mục hệ thống: ${invalidIngredients.join(', ')}. Vui lòng thêm thực phẩm trước.`);
      return;
    }

    try {
      const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500';
      const recipePayload = {
        name: formData.get('name') as string,
        instructions: formData.get('instructions') as string,
        referenceLink: formData.get('referenceLink') as string,
        author: (formData.get('author') as string) || 'Admin',
        preferredMealTime: formData.get('preferredMealTime') as any,
        imageUrl: (formData.get('imageUrl') as string) || defaultImage,
        displayStatus: (formData.get('displayStatus') as string) || 'SYSTEM',
        cookingTimeMinutes: formData.get('cookingTimeMinutes') ? parseInt(formData.get('cookingTimeMinutes') as string) : null,
        servingSize: formData.get('servingSize') ? parseInt(formData.get('servingSize') as string) : null,
        difficulty: (formData.get('difficulty') as string) || null,
        calories: formData.get('calories') ? parseInt(formData.get('calories') as string) : null,
        protein: formData.get('protein') ? parseFloat(formData.get('protein') as string) : null,
        fat: formData.get('fat') ? parseFloat(formData.get('fat') as string) : null,
        carbs: formData.get('carbs') ? parseFloat(formData.get('carbs') as string) : null
      };

      const response = await api.post('/api/v1/catalogs/recipes', recipePayload);
      const newRecipe = response.data?.data || response.data;

      if (recipeIngredientsPayload.length > 0) {
        await api.post(`/api/v1/catalogs/recipes/${newRecipe.id}/ingredients`, recipeIngredientsPayload);
      }

      alert('Thêm món ăn thành công!');
      setShowAddModal(false);
      setNewIngredients([{ name: '', amount: '' }]);
      fetchRecipes();
    } catch (err) {
      console.error(err);
      alert('Thêm món ăn thất bại.');
    }
  };

  const handleUpdateIngredient = (idx: number, field: keyof Ingredient, value: string, isEditingModal: boolean) => {
    if (isEditingModal && editData) {
      const updated = [...editData.ingredients];
      updated[idx] = { ...updated[idx], [field]: value };
      setEditData({ ...editData, ingredients: updated });
    } else {
      const updated = [...newIngredients];
      updated[idx] = { ...updated[idx], [field]: value };
      setNewIngredients(updated);
    }
  };

  const handleAddIngredientRow = (isEditingModal: boolean) => {
    if (isEditingModal && editData) {
      setEditData({ ...editData, ingredients: [...editData.ingredients, { name: '', amount: '' }] });
    } else {
      setNewIngredients([...newIngredients, { name: '', amount: '' }]);
    }
  };

  const handleRemoveIngredientRow = (idx: number, isEditingModal: boolean) => {
    if (isEditingModal && editData) {
      setEditData({ ...editData, ingredients: editData.ingredients.filter((_, i) => i !== idx) });
    } else {
      setNewIngredients(newIngredients.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="um-layout">
      <Sidebar />

      <div className="um-main">
        {/* 🎯 ĐÃ NHÚNG TOPBAR: Đổi chữ placeholder tìm kiếm và cấu hình hiển thị ADMIN */}
        <Topbar 
          title="Quản lý món ăn" 
          searchPlaceholder="Tìm kiếm món ăn"
          searchValue={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          showSearch={true}
          familyName="ADMIN"
        />

        <div className="um-main-container">
          <main className="um-content">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="um-card">
              <div className="um-toolbar-sticky">
                <div className="um-toolbar-controls">
                  <div className="um-role-badge filter-meal-box">
                    <span className="filter-label">Loại bữa ăn:</span>
                    <select 
                      className="filter-select"
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="Tất cả">Tất cả</option>
                      <option value="BREAKFAST">Bữa sáng</option>
                      <option value="LUNCH">Bữa trưa</option>
                      <option value="DINNER">Bữa tối</option>
                    </select>
                  </div>
                </div>
                <button className="um-btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={20} />
                  Thêm món ăn
                </button>
              </div>

              {isLoading ? (
                <div className="loading-text">Đang tải công thức nấu ăn...</div>
              ) : (
                <div className="table-responsive">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th className="w-80">ID</th>
                        <th>Món ăn</th>
                        <th>Bữa ăn</th>
                        <th>Tác giả</th>
                        <th className="text-center w-120">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecipes.map(recipe => (
                        <tr key={recipe.id}>
                          <td className="recipe-id-cell">#{recipe.id}</td>
                          <td>
                            <div className="recipe-name-wrapper">
                              <div className="recipe-img-container" style={{ backgroundColor: '#F1FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                {recipe.imageUrl ? (
                                  <img src={recipe.imageUrl} alt="" />
                                ) : (
                                  <UtensilsCrossed size={22} color="#6DD4B4" />
                                )}
                              </div>
                              <span className="recipe-title-text">{recipe.name}</span>
                            </div>
                          </td>
                          <td className="text-muted-sm">
                            {recipe.preferredMealTime === 'BREAKFAST' ? 'Bữa sáng' : recipe.preferredMealTime === 'LUNCH' ? 'Bữa trưa' : 'Bữa tối'}
                          </td>
                          <td className="text-muted-sm">{recipe.author || 'Admin'}</td>
                          <td>
                            <div className="action-buttons-flex">
                              <ActionBtn icon={<Eye size={18} />} hoverColor="var(--fiza-primary)" onClick={() => handleEditClick(recipe)} />
                              <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setDeleteConfirm(recipe.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentRecipes.length === 0 && (
                        <tr>
                          <td colSpan={5} className="empty-table-cell">
                            Không tìm thấy món ăn nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pagination-wrapper">
                <p className="pagination-info">
                  Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên {totalItems} món ăn
                </p>
                <div className="pagination-controls">
                  <PageArrow icon={<ChevronLeft size={18} />} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                  {[...Array(totalPages)].map((_, i) => (
                    <PageNum key={i + 1} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>{i+1}</PageNum>
                  ))}
                  <PageArrow icon={<ChevronRight size={18} />} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                </div>
              </div>
            </motion.div>
          </main>
        </div>

        {/* MODALS */}
        <AnimatePresence mode="wait">
          {showAddModal && (
            <SharedModal title="Thêm món ăn mới" onClose={() => setShowAddModal(false)} width="800px">
              <form onSubmit={handleAddRecipe} className="modal-form-layout">
                <div className="modal-grid-2col">
                  <FormGroup label="Tên món ăn" name="name" placeholder="VD: Sườn xào chua ngọt" required />
                  <div className="form-select-group">
                    <label className="form-label-sm">Bữa ăn ưu tiên</label>
                    <select name="preferredMealTime" className="um-search-input pl-1">
                      <option value="BREAKFAST">Bữa sáng</option>
                      <option value="LUNCH">Bữa trưa</option>
                      <option value="DINNER">Bữa tối</option>
                    </select>
                  </div>
                  <div className="form-select-group">
                    <label className="form-label-sm">Phân loại món ăn</label>
                    <select name="displayStatus" className="um-search-input pl-1">
                      <option value="SYSTEM">Món hệ thống</option>
                      <option value="CUSTOM">Món tự tạo</option>
                    </select>
                  </div>
                  <FormGroup label="Tác giả" name="author" placeholder="Bỏ trống để mặc định là Admin" />
                  <FormGroup label="Nguồn trích dẫn (Link)" name="referenceLink" placeholder="VD: https://food-source.com" />
                  <FormGroup label="Thời gian chế biến (phút)" name="cookingTimeMinutes" type="number" placeholder="VD: 30" />
                  <FormGroup label="Khẩu phần (người ăn)" name="servingSize" type="number" placeholder="VD: 4" />
                  <div className="form-select-group">
                    <label className="form-label-sm">Độ khó</label>
                    <select name="difficulty" className="um-search-input pl-1">
                      <option value="">Chưa chọn</option>
                      <option value="EASY">Dễ</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HARD">Khó</option>
                    </select>
                  </div>
                  <FormGroup label="Lượng calo (kcal)" name="calories" type="number" placeholder="VD: 350" />
                  <FormGroup label="Chất đạm (g)" name="protein" type="number" step="0.1" placeholder="VD: 25.5" />
                  <FormGroup label="Chất béo (g)" name="fat" type="number" step="0.1" placeholder="VD: 12.0" />
                  <FormGroup label="Carbs (Tinh bột) (g)" name="carbs" type="number" step="0.1" placeholder="VD: 45.0" />
                  <div className="grid-span-2">
                    <FormGroup label="Hình ảnh món ăn (URL)" name="imageUrl" placeholder="VD: https://images.unsplash.com/photo-..." />
                  </div>
                  <div className="grid-span-2">
                    <FormGroup label="Tên gọi khác / Từ đồng nghĩa (phân cách bằng dấu phẩy)" name="regionalNames" placeholder="VD: Nem rán, Chả giò" />
                  </div>
                </div>

                <div className="ingredients-section">
                  <div className="ingredients-header">
                    <label className="ingredients-label">Danh sách nguyên liệu</label>
                    <button type="button" onClick={() => handleAddIngredientRow(false)} className="um-btn-add">
                      <Plus size={16} /> Thêm nguyên liệu
                    </button>
                  </div>
                  <div className="ingredients-table-box">
                    <table className="ingredients-inner-table">
                      <thead>
                        <tr>
                          <th>Tên nguyên liệu</th>
                          <th>Định mức (VD: 200g, 2 củ)</th>
                          <th className="w-40"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newIngredients.map((ing, idx) => (
                          <tr key={idx}>
                            <td className="p-qtr">
                              <input 
                                type="text" 
                                value={ing.name} 
                                onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value, false)} 
                                placeholder="VD: Dầu ăn" 
                                list="foods-catalog-list" 
                                className="um-search-input ing-input-field" 
                              />
                            </td>
                            <td className="p-qtr">
                              <input type="text" value={ing.amount} onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value, false)} placeholder="VD: 200g" className="um-search-input ing-input-field" />
                            </td>
                            <td className="p-qtr text-center">
                              <button type="button" onClick={() => handleRemoveIngredientRow(idx, false)} className="btn-remove-row">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="instructions-textarea-box">
                  <label className="form-label-sm">Hướng dẫn chế biến</label>
                  <textarea name="instructions" className="um-textarea fixed-textarea" placeholder="Các bước thực hiện..." />
                </div>

                <div className="modal-footer-buttons">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-modal-cancel">Hủy</button>
                  <button type="submit" className="um-btn-primary">Lưu món ăn</button>
                </div>
              </form>
            </SharedModal>
          )}

          {viewRecipe && editData && (
            <SharedModal title={isEditing ? "Chỉnh sửa món ăn" : "Chi tiết món ăn"} onClose={() => { setViewRecipe(null); setIsEditing(false); }} width="1000px">
              <div className="modal-flex-container">
                <div className="modal-sidebar-profile">
                  <div className="modal-recipe-img-box">
                    {viewRecipe.imageUrl ? (
                      <img src={viewRecipe.imageUrl} alt="" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <UtensilsCrossed size={56} color="#6DD4B4" />
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="modal-general-info-box">
                    <p className="info-header-text">Thông tin chung</p>
                    <div className="info-items-stack">
                      <DetailItem label="Mã món ăn" value={`#${viewRecipe.id}`} />
                      <DetailItem 
                        label="Bữa ăn" 
                        value={viewRecipe.preferredMealTime === 'BREAKFAST' ? 'Bữa sáng' : viewRecipe.preferredMealTime === 'LUNCH' ? 'Bữa trưa' : 'Bữa tối'} 
                        isBadge 
                      />
                      <DetailItem label="Tác giả" value={viewRecipe.author || 'Admin'} />
                      <DetailItem label="Phân loại" value={viewRecipe.displayStatus === 'SYSTEM' ? 'Món hệ thống' : 'Món tự tạo'} />
                      <DetailItem label="Ngày tạo" value={formatDateTime(viewRecipe.createdAt)} />
                      <DetailItem label="Ngày cập nhật" value={formatDateTime(viewRecipe.updatedAt)} />
                    </div>
                  </div>
                </div>

                <div className="modal-scroll-content">
                  {isEditing ? (
                    <div className="modal-grid-2col">
                      <FormGroup label="Tên món ăn" value={editData.name} onChange={(e: any) => setEditData({ ...editData, name: e.target.value })} />
                      <div className="form-select-group">
                        <label className="form-label-sm">Bữa ăn ưu tiên</label>
                        <select className="um-search-input pl-1" value={editData.preferredMealTime} onChange={(e: any) => setEditData({ ...editData, preferredMealTime: e.target.value as any })}>
                          <option value="BREAKFAST">Bữa sáng</option>
                          <option value="LUNCH">Bữa trưa</option>
                          <option value="DINNER">Bữa tối</option>
                        </select>
                      </div>
                      <div className="form-select-group">
                        <label className="form-label-sm">Phân loại món ăn</label>
                        <select className="um-search-input pl-1" value={editData.displayStatus || 'SYSTEM'} onChange={(e: any) => setEditData({ ...editData, displayStatus: e.target.value as any })}>
                          <option value="SYSTEM">Món hệ thống</option>
                          <option value="CUSTOM">Món tự tạo</option>
                        </select>
                      </div>
                      <FormGroup label="Tác giả" value={editData.author} onChange={(e: any) => setEditData({ ...editData, author: e.target.value })} />
                      <FormGroup label="Nguồn (Link)" value={editData.referenceLink} onChange={(e: any) => setEditData({ ...editData, referenceLink: e.target.value })} />
                      <FormGroup label="Thời gian chế biến (phút)" type="number" value={editData.cookingTimeMinutes || ''} onChange={(e: any) => setEditData({ ...editData, cookingTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })} />
                      <FormGroup label="Khẩu phần (người ăn)" type="number" value={editData.servingSize || ''} onChange={(e: any) => setEditData({ ...editData, servingSize: e.target.value ? parseInt(e.target.value) : undefined })} />
                      <div className="form-select-group">
                        <label className="form-label-sm">Độ khó</label>
                        <select className="um-search-input pl-1" value={editData.difficulty || ''} onChange={(e: any) => setEditData({ ...editData, difficulty: e.target.value || undefined })}>
                          <option value="">Chưa chọn</option>
                          <option value="EASY">Dễ</option>
                          <option value="MEDIUM">Trung bình</option>
                          <option value="HARD">Khó</option>
                        </select>
                      </div>
                      <FormGroup label="Lượng calo (kcal)" type="number" value={editData.calories || ''} onChange={(e: any) => setEditData({ ...editData, calories: e.target.value ? parseInt(e.target.value) : undefined })} />
                      <FormGroup label="Chất đạm (g)" type="number" step="0.1" value={editData.protein || ''} onChange={(e: any) => setEditData({ ...editData, protein: e.target.value ? parseFloat(e.target.value) : undefined })} />
                      <FormGroup label="Chất béo (g)" type="number" step="0.1" value={editData.fat || ''} onChange={(e: any) => setEditData({ ...editData, fat: e.target.value ? parseFloat(e.target.value) : undefined })} />
                      <FormGroup label="Carbs (Tinh bột) (g)" type="number" step="0.1" value={editData.carbs || ''} onChange={(e: any) => setEditData({ ...editData, carbs: e.target.value ? parseFloat(e.target.value) : undefined })} />
                      <div className="grid-span-2">
                        <FormGroup label="Hình ảnh món ăn (URL)" value={editData.imageUrl} onChange={(e: any) => setEditData({ ...editData, imageUrl: e.target.value })} />
                      </div>

                      <div className="grid-span-2">
                        <div className="mb-05">
                          <label className="form-label-sm">Tên gọi khác / Từ đồng nghĩa</label>
                        </div>
                        <div className="tags-flex-container">
                          {editData.regionalNames?.map((name: string, idx: number) => (
                            <div key={idx} className="regional-tag-item">
                              <span className="tag-text">{name}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  const updated = editData.regionalNames?.filter((_: any, i: number) => i !== idx) || [];
                                  setEditData({ ...editData, regionalNames: updated });
                                }}
                                className="btn-remove-tag"
                              >
                                <X size={14} color="var(--fiza-primary)" />
                              </button>
                            </div>
                          ))}
                          {inlineAdding ? (
                            <div className="inline-add-wrapper">
                              <input 
                                autoFocus
                                value={inlineValue}
                                onChange={(e) => setInlineValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddInlineRegional()}
                                onBlur={() => {
                                  if (!inlineValue.trim()) setInlineAdding(false);
                                  else handleAddInlineRegional();
                                }}
                                placeholder="Nhập tên..."
                                className="um-search-input inline-tag-input"
                              />
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => { setInlineAdding(true); setInlineValue(''); }}
                              className="um-btn-add inline-add-tag-btn"
                            >
                              <Plus size={12} /> Thêm
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid-span-2">
                        <div className="ingredients-header mb-05">
                          <label className="form-label-sm">Nguyên liệu & Định mức</label>
                          <button type="button" onClick={() => handleAddIngredientRow(true)} className="um-btn-add">
                            <Plus size={14} /> Thêm nguyên liệu
                          </button>
                        </div>
                        <div className="edit-ingredients-table-wrapper">
                          <table className="edit-ingredients-table">
                            <thead>
                              <tr>
                                <th>Tên</th>
                                <th>Định mức</th>
                                <th className="w-40"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {editData.ingredients.map((ing, idx) => (
                                <tr key={idx}>
                                  <td className="p-05">
                                    <input 
                                      type="text" 
                                      value={ing.name} 
                                      onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value, true)} 
                                      list="foods-catalog-list" 
                                      className="um-search-input edit-ing-field" 
                                    />
                                  </td>
                                  <td className="p-05">
                                    <input type="text" value={ing.amount} onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value, true)} className="um-search-input edit-ing-field" />
                                  </td>
                                  <td className="text-center border-cell">
                                    <button onClick={() => handleRemoveIngredientRow(idx, true)} className="btn-remove-row">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="grid-span-2">
                        <label className="form-label-sm">Hướng dẫn nấu</label>
                        <textarea value={editData.instructions} onChange={(e) => setEditData({ ...editData, instructions: e.target.value })} className="um-textarea edit-textarea-field" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="modal-grid-2col gap-15">
                        <DetailItem label="Tên món ăn" value={viewRecipe.name} />
                        <DetailItem label="Nguồn" value={viewRecipe.referenceLink ? <a href={viewRecipe.referenceLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fiza-primary)', fontWeight: 600 }}>{viewRecipe.referenceLink}</a> : 'Nội bộ'} />
                        <DetailItem label="Thời gian chế biến" value={viewRecipe.cookingTimeMinutes ? `${viewRecipe.cookingTimeMinutes} phút` : 'Chưa cập nhật'} />
                        <DetailItem label="Khẩu phần" value={viewRecipe.servingSize ? `${viewRecipe.servingSize} người ăn` : 'Chưa cập nhật'} />
                        <DetailItem label="Độ khó" value={viewRecipe.difficulty === 'EASY' ? 'Dễ' : viewRecipe.difficulty === 'MEDIUM' ? 'Trung bình' : viewRecipe.difficulty === 'HARD' ? 'Khó' : viewRecipe.difficulty || 'Chưa cập nhật'} />
                        <DetailItem label="Lượng calo" value={viewRecipe.calories ? `${viewRecipe.calories} kcal` : 'Chưa cập nhật'} />
                      </div>

                      <div className="mt-1">
                        <p className="section-title-label">Giá trị dinh dưỡng (Cho mỗi khẩu phần)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                          <DetailItem label="Chất đạm (Protein)" value={viewRecipe.protein !== undefined && viewRecipe.protein !== null ? `${viewRecipe.protein} g` : 'Chưa cập nhật'} />
                          <DetailItem label="Chất béo (Fat)" value={viewRecipe.fat !== undefined && viewRecipe.fat !== null ? `${viewRecipe.fat} g` : 'Chưa cập nhật'} />
                          <DetailItem label="Carbs (Tinh bột)" value={viewRecipe.carbs !== undefined && viewRecipe.carbs !== null ? `${viewRecipe.carbs} g` : 'Chưa cập nhật'} />
                        </div>
                      </div>


                      <div className="mt-1">
                        <p className="section-title-label">Nguyên liệu & Định mức</p>
                        <div className="view-ingredients-table-box">
                          <table className="view-ingredients-table">
                            <thead>
                              <tr>
                                <th>Nguyên liệu</th>
                                <th>Định mức</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewRecipe.ingredients?.map((ing, idx) => (
                                <tr key={idx}>
                                  <td className="ing-name-cell">{ing.name}</td>
                                  <td className="ing-amount-cell">{ing.amount}</td>
                                </tr>
                              )) || (
                                <tr><td colSpan={2} className="text-center p-1 text-muted">Chưa cập nhật nguyên liệu</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-1">
                        <p className="section-title-label">Hướng dẫn chế biến</p>
                        <div className="instructions-display-box">
                          {viewRecipe.instructions || 'Chưa có hướng dẫn chi tiết.'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="modal-footer-buttons mt-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn-modal-cancel">Hủy</button>
                    <button onClick={handleSaveEdit} className="um-btn-primary">Lưu thay đổi</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="um-btn-primary">Chỉnh sửa món ăn</button>
                )}
              </div>
            </SharedModal>
          )}

          {deleteConfirm && (
            <SharedModal title="Xác nhận xóa" onClose={() => setDeleteConfirm(null)} width="400px">
              <div className="text-center">
                <div className="delete-alert-icon-box">
                  <Trash2 size={32} />
                </div>
                <p className="delete-confirm-title">Xóa món ăn?</p>
                <p className="delete-confirm-subtitle">Dữ liệu này sẽ không thể khôi phục.</p>
                <div className="modal-flex-row gap-1">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-modal-cancel flex-1 p-075">Hủy</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="btn-delete-execute">Xóa ngay</button>
                </div>
              </div>
            </SharedModal>
          )}
        </AnimatePresence>
      </div>

      <datalist id="foods-catalog-list">
        {foodsCatalog.map(f => (
          <option key={f.id} value={f.name} />
        ))}
      </datalist>
    </div>
  );
};

function FormGroup({ label, ...props }: any) {
  return (
    <div className="form-input-stack">
      <label className="form-label-sm">{label}</label>
      <input {...props} className="um-search-input pl-1" />
    </div>
  );
}

function DetailItem({ label, value, isBadge }: any) {
  return (
    <div className="detail-item-stack">
      <span className="detail-label">{label}</span>
      {isBadge ? (
        <span className="um-role-badge self-start">{value}</span>
      ) : (
        <span className="detail-value">{value || 'N/A'}</span>
      )}
    </div>
  );
}

function ActionBtn({ icon, hoverColor, onClick }: any) {
  const [hover, setHover] = useState(false);
  return (
    <button 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)} 
      onClick={onClick} 
      style={{ 
        color: hover ? hoverColor : '#94a3b8', 
        backgroundColor: hover ? 'white' : 'transparent', 
        boxShadow: hover ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' 
      }} 
      className="action-round-btn"
    >
      {icon}
    </button>
  );
}

function PageNum({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`pagination-num-btn ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function PageArrow({ icon, disabled, onClick }: any) {
  return (
    <button disabled={disabled} onClick={onClick} className="pagination-arrow-btn">{icon}</button>
  );
}

export default RecipeManagement;