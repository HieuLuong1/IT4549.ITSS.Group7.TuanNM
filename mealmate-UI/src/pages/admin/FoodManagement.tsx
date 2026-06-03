import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SharedModal from '../../components/admin/Modal';
import api from '../../services/api';

// 🎯 NHÚNG CÁC THÀNH PHẦN LAYOUT HỆ THỐNG
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

// IMPORT FILE CSS RIÊNG
import './FoodManagement.css';

interface Category {
  id: number;
  name: string;
  iconKey?: string;
  colorCode?: string;
}

export interface Food {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  unit: string;
  synonyms: string[];
  imageUrl?: string;
  isSystem: boolean;
}

interface CustomFoodRequest {
  customName: string;
  categoryId: number;
  categoryName: string;
  unit?: string;
  placeholderFoodId: number;
  placeholderFoodName: string;
  requestCount: number;
  firstRequestedAt?: string;
  lastRequestedAt?: string;
}

type AddFoodDraft = {
  name: string;
  categoryId: number;
  unit: string;
  synonyms: string;
} | null;

const FoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [customFoodRequests, setCustomFoodRequests] = useState<CustomFoodRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomRequests, setIsLoadingCustomRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewFood, setViewFood] = useState<Food | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Food | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [addFoodDraft, setAddFoodDraft] = useState<AddFoodDraft>(null);

  // Inline synonyms state
  const [inlineAdding, setInlineAdding] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<any[]>('/api/foods');
      const mappedFoods: Food[] = response.data.map(item => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName || 'Chưa phân loại',
        name: item.name,
        unit: item.unit || 'g',
        synonyms: item.synonyms ? item.synonyms.split(',').map((s: string) => s.trim()) : [],
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500',
        isSystem: item.isSystem ?? true
      }));
      setFoods(mappedFoods);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomFoodRequests = async () => {
    setIsLoadingCustomRequests(true);
    try {
      const response = await api.get<CustomFoodRequest[]>('/api/fridge-items/custom-food-requests');
      setCustomFoodRequests(response.data);
    } catch (err) {
      console.error(err);
      setCustomFoodRequests([]);
    } finally {
      setIsLoadingCustomRequests(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFoods();
    fetchCustomFoodRequests();
  }, []);

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          food.synonyms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'Tất cả' || food.categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredFoods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFoods = filteredFoods.slice(startIndex, startIndex + itemsPerPage);

  const handleEditClick = (food: Food) => {
    setViewFood(food);
    setEditData({ ...food });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        const payload = {
          name: editData.name,
          categoryId: editData.categoryId,
          unit: editData.unit,
          synonyms: editData.synonyms.join(','),
          imageUrl: editData.imageUrl
        };
        const response = await api.put(`/api/foods/${editData.id}`, payload);
        const updated = {
          ...editData,
          name: response.data.name,
          categoryId: response.data.categoryId,
          categoryName: categories.find(c => c.id === response.data.categoryId)?.name || editData.categoryName,
          unit: response.data.unit,
          synonyms: response.data.synonyms ? response.data.synonyms.split(',').map((s: string) => s.trim()) : []
        };
        setFoods(foods.map(f => f.id === editData.id ? updated : f));
        setViewFood(updated);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        alert('Cập nhật thực phẩm thất bại.');
      }
    }
  };

  const handleInlineAddSynonym = () => {
    if (inlineValue.trim() && editData) {
      setEditData({...editData, synonyms: Array.from(new Set([...editData.synonyms, inlineValue.trim()]))});
      setInlineValue('');
      setInlineAdding(false);
    }
  };

  const handleAddFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const catId = Number(formData.get('categoryId'));
    const payload = {
      name: formData.get('name') as string,
      categoryId: catId,
      unit: formData.get('unit') as string,
      synonyms: formData.get('synonyms') as string,
      imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
    };

    try {
      const response = await api.post('/api/foods', payload);
      const newFood: Food = {
        id: response.data.id,
        categoryId: response.data.categoryId,
        categoryName: categories.find(c => c.id === response.data.categoryId)?.name || 'Chưa phân loại',
        name: response.data.name,
        unit: response.data.unit,
        synonyms: response.data.synonyms ? response.data.synonyms.split(',').map((s: string) => s.trim()) : [],
        imageUrl: response.data.imageUrl || payload.imageUrl,
        isSystem: response.data.isSystem ?? true
      };
      setFoods([newFood, ...foods]);
      setShowAddModal(false);
      setAddFoodDraft(null);
      fetchCustomFoodRequests();
    } catch (err) {
      console.error(err);
      alert('Tạo thực phẩm thất bại.');
    }
  };

  const handleCreateFromCustomRequest = (request: CustomFoodRequest) => {
    setAddFoodDraft({
      name: request.customName,
      categoryId: request.categoryId,
      unit: request.unit || 'g',
      synonyms: `${request.customName},${request.placeholderFoodName}`,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/foods/${id}`);
      setFoods(foods.filter(f => f.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa thực phẩm này vì nó đang được liên kết trong tủ lạnh hoặc công thức món ăn.');
    }
  };

  return (
    <div className="um-layout">
      <Sidebar />

      <div className="um-main">
        {/* 🎯 ĐÃ NHÚNG TOPBAR: Sửa placeholder tìm kiếm thực phẩm và ép ô xanh hiển thị ADMIN */}
        <Topbar 
          title="Quản lý thực phẩm" 
          searchPlaceholder="Tìm kiếm thực phẩm"
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
                  <div className="um-role-badge filter-select-badge">
                    <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="category-dropdown-select">
                      <option>Tất cả</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="um-btn-primary whitespace-nowrap"
                  onClick={() => {
                    setAddFoodDraft(null);
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} />Thêm thực phẩm
                </button>
              </div>

              {/* Custom Food Section Wrapper */}
              <div className="custom-requests-panel">
                <div className="custom-requests-header">
                  <div>
                    <h2 className="custom-requests-title">Thực phẩm tự nhập</h2>
                    <p className="custom-requests-subtitle">
                      Thực phẩm do người dùng tự thêm vào tủ lạnh.
                    </p>
                  </div>
                  <span className="custom-requests-count-badge">
                    {customFoodRequests.length} chờ xử lý
                  </span>
                </div>

                {isLoadingCustomRequests ? (
                  <div className="panel-loading-text">Đang tải dữ liệu...</div>
                ) : customFoodRequests.length === 0 ? (
                  <div className="panel-loading-text">Không có thực phẩm khác cần xử lý.</div>
                ) : (
                  <div className="custom-requests-grid">
                    {customFoodRequests.slice(0, 6).map((request) => (
                      <div key={`${request.categoryId}-${request.customName}`} className="custom-request-card">
                        <div>
                          <div className="custom-request-item-name">{request.customName}</div>
                          <div className="custom-request-item-meta">
                            {request.categoryName} · từ "{request.placeholderFoodName}" · {request.requestCount} lần nhập
                          </div>
                        </div>
                        <button
                          type="button"
                          className="um-btn-primary create-from-request-btn"
                          onClick={() => handleCreateFromCustomRequest(request)}
                        >
                          <Plus size={16} /> Tạo thực phẩm
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="table-overflow-box">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th className="w-80">ID</th>
                      <th>Thực phẩm</th>
                      <th>Nhóm</th>
                      <th>Đơn vị</th>
                      <th>Tên gọi khác</th>
                      <th className="text-center w-120">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFoods.map(food => (
                      <tr key={food.id}>
                        <td className="food-id-cell">{food.id}</td>
                        <td>
                          <div className="food-profile-wrapper">
                            <div className="food-img-square">
                              <img src={food.imageUrl} alt="" />
                            </div>
                            <span className="food-name-text">{food.name}</span>
                          </div>
                        </td>
                        <td><span className="um-role-badge">{food.categoryName}</span></td>
                        <td>
                          <div className="flex-row-gap-qtr">
                            <span className="unit-badge-gray">{food.unit}</span>
                          </div>
                        </td>
                        <td className="synonyms-list-text">{food.synonyms.join(', ')}</td>
                        <td>
                          <div className="action-buttons-container">
                            <ActionBtn icon={<Eye size={18} />} hoverColor="var(--fiza-primary)" onClick={() => handleEditClick(food)} />
                            <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setDeleteConfirm(food.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentFoods.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-400">
                          Không tìm thấy thực phẩm phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination-wrapper-row">
                <p className="pagination-info-text">Hiển thị {startIndex+1}-{Math.min(startIndex+itemsPerPage, totalItems)} / {totalItems}</p>
                <div className="pagination-controls-flex">
                  <PageArrow icon={<ChevronLeft size={18} />} disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} />
                  {[...Array(totalPages)].map((_, i) => <PageNum key={i+1} active={currentPage === i+1} onClick={() => setCurrentPage(i+1)}>{i+1}</PageNum>)}
                  <PageArrow icon={<ChevronRight size={18} />} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} />
                </div>
              </div>
            </motion.div>
          </main>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {(viewFood && editData) && (
            <SharedModal title={isEditing ? "Cập nhật thực phẩm" : "Thông tin thực phẩm"} onClose={() => setViewFood(null)}>
              <div className="modal-flex-layout">
                <div className="modal-profile-img-box">
                  <img src={viewFood.imageUrl} alt="" />
                </div>
                <div className="modal-form-grid-fields">
                  <DetailItem label="Mã thực phẩm" value={viewFood.id} />
                  {isEditing ? (
                    <>
                      <FormGroup label="Tên thực phẩm" value={editData.name} onChange={(e: any) => setEditData({...editData, name: e.target.value})} />
                      <div className="form-select-group-stack">
                        <label className="form-label-sm">Chủng loại</label>
                        <select 
                          className="um-search-input pl-1" 
                          value={editData.categoryId} 
                          onChange={(e) => setEditData({...editData, categoryId: Number(e.target.value)})}
                        >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="grid-span-2">
                        <FormGroup label="Đơn vị" value={editData.unit} onChange={(e: any) => setEditData({...editData, unit: e.target.value})} />
                      </div>
                      <div className="grid-span-2">
                        <div className="mb-05">
                          <label className="form-label-sm">Tên gọi khác / Từ đồng nghĩa</label>
                        </div>
                        <div className="tags-container-box">
                          {editData.synonyms.map((s, idx) => (
                            <div key={idx} className="regional-tag-pill">
                              <span className="pill-text-sm">{s}</span>
                              <button 
                                type="button"
                                onClick={() => setEditData({...editData, synonyms: editData.synonyms.filter((_, i) => i !== idx)})}
                                className="btn-remove-tag-pill"
                              >
                                <X size={14} color="var(--fiza-primary)" />
                              </button>
                            </div>
                          ))}
                          {inlineAdding ? (
                            <div className="inline-add-input-wrapper">
                              <input 
                                autoFocus
                                value={inlineValue}
                                onChange={(e) => setInlineValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInlineAddSynonym()}
                                onBlur={() => {
                                  if (!inlineValue.trim()) setInlineAdding(false);
                                  else handleInlineAddSynonym();
                                }}
                                placeholder="Nhập tên..."
                                className="um-search-input modal-inline-input-field"
                              />
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setInlineAdding(true);
                                setInlineValue('');
                              }}
                              className="um-btn-add modal-add-tag-trigger-btn"
                            >
                              <Plus size={16} /> THÊM TÊN GỌI
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <DetailItem label="Tên thực phẩm" value={viewFood.name} />
                      <DetailItem label="Đơn vị đo" value={viewFood.unit} />
                      <div className="grid-span-2">
                        <DetailItem label="Tên gọi khác" value={viewFood.synonyms.join(', ') || 'Chưa có'} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer-buttons-row">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn-modal-cancel">Hủy</button>
                    <button onClick={handleSaveEdit} className="um-btn-primary">Lưu thay đổi</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="um-btn-primary">Chỉnh sửa</button>
                )}
              </div>
            </SharedModal>
          )}

          {showAddModal && (
            <SharedModal title={addFoodDraft ? "Tạo thực phẩm từ người dùng nhập" : "Thêm thực phẩm mới"} onClose={() => { setShowAddModal(false); setAddFoodDraft(null); }}>
              <form onSubmit={handleAddFood} className="modal-grid-2col">
                 <FormGroup label="Tên thực phẩm" name="name" required defaultValue={addFoodDraft?.name || ''} />
                 <div className="form-select-group-stack">
                   <label className="form-label-sm">Chủng loại</label>
                   <select name="categoryId" className="um-search-input pl-1" defaultValue={addFoodDraft?.categoryId || categories[0]?.id}>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <FormGroup label="Đơn vị (kg, g, cái...)" name="unit" required defaultValue={addFoodDraft?.unit || ''} />
                 <FormGroup label="Tên gọi khác" name="synonyms" defaultValue={addFoodDraft?.synonyms || ''} />
                 <div className="modal-footer-buttons-row grid-span-2 mt-1">
                   <button type="button" onClick={() => { setShowAddModal(false); setAddFoodDraft(null); }} className="btn-modal-cancel">Hủy</button>
                   <button type="submit" className="um-btn-primary">Tạo mới</button>
                 </div>
              </form>
            </SharedModal>
          )}

          {deleteConfirm && (
            <SharedModal title="Xác nhận xóa" onClose={() => setDeleteConfirm(null)} width="400px">
              <div className="text-center">
                <div className="delete-alert-icon-box">
                  <Trash2 size={32} />
                </div>
                <p className="delete-title-bold">Xóa thực phẩm?</p>
                <p className="delete-subtitle-muted">Hành động này không thể hoàn tác và có thể lỗi nếu đang được sử dụng.</p>
                <div className="modal-buttons-row-gap">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-modal-cancel flex-1">Hủy</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="btn-execute-delete-action">Xóa ngay</button>
                </div>
              </div>
            </SharedModal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Form Sub-Components ---
function FormGroup({ label, ...props }: any) {
  return (
    <div className="form-input-stack">
      <label className="form-label-sm">{label}</label>
      <input {...props} className="um-search-input pl-1" />
    </div>
  );
}

// --- Detail Row Mapping Components ---
function DetailItem({ label, value }: any) {
  return (
    <div className="detail-item-stack">
      <span className="detail-label-uppercase">{label}</span>
      <span className="detail-value-text">{value}</span>
    </div>
  );
}

function PageNum({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`pagination-number-btn ${active ? 'active' : ''}`}
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
function ActionBtn({ icon, hoverColor, onClick }: any) {
  const [h, setH] = useState(false);
  return (
    <button 
      onMouseEnter={() => setH(true)} 
      onMouseLeave={() => setH(false)} 
      onClick={onClick} 
      style={{ background: h ? 'white' : 'transparent', color: h ? hoverColor : '#94a3b8' }}
      className="table-action-round-btn"
    >
      {icon}
    </button>
  );
}

export default FoodManagement;