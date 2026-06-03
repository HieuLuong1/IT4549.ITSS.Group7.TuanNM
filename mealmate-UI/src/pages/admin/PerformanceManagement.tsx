import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  UtensilsCrossed,
  Users, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Eye, 
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Modal from '../../components/admin/Modal';
import api from '../../services/api';

// 🎯 NHÚNG CÁC THÀNH PHẦN LAYOUT HỆ THỐNG MỚI
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

// 🎯 IMPORT FILE CSS RIÊNG
import './PerformanceManagement.css';

export interface CustomFoodRequest {
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

const COLORS = ['#6DD4B4', '#F99F1B', '#FF7E7E', '#64748b', '#0EA5E9', '#A855F7', '#EC4899', '#F59E0B'];

const formatDateTime = (value?: string) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const PerformanceManagement: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalFamilies: 0,
    totalFoods: 0,
    totalRecipes: 0,
    foodStats: [],
    userActivity: []
  });
  
  const [customFoodRequests, setCustomFoodRequests] = useState<CustomFoodRequest[]>([]);
  const [isLoadingCustomFoodRequests, setIsLoadingCustomFoodRequests] = useState(false);
  const [customFoodRequestError, setCustomFoodRequestError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [synonymPage, setSynonymPage] = useState(1);
  const [uiSearchQuery, setUiSearchQuery] = useState('');
  const [inlineAdding, setInlineAdding] = useState<number | null>(null);
  const [inlineValue, setInlineValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(2);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newVariants, setNewVariants] = useState<string>('');
  const [itemSearch, setItemSearch] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [approvingItem, setApprovingItem] = useState<CustomFoodRequest | null>(null);
  const [viewingItem, setViewingItem] = useState<CustomFoodRequest | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [selectedLinkFood, setSelectedLinkFood] = useState<any | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  
  // Fields for approval modal
  const [approveName, setApproveName] = useState('');
  const [approveCategory, setApproveCategory] = useState<number>(1);
  const [approveUnit, setApproveUnit] = useState('kg');
  const [approveSynonyms, setApproveSynonyms] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/v1/admin/stats');
      if (response.data?.success) {
        setStats(response.data.data);
      } else {
        setStats(response.data || {});
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err);
    }
  };

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/foods');
      const data = response.data?.data || response.data || [];
      setFoods(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thực phẩm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  const fetchCustomFoodRequests = async () => {
    setIsLoadingCustomFoodRequests(true);
    setCustomFoodRequestError('');
    try {
      const response = await api.get('/api/fridge-items/custom-food-requests');
      setCustomFoodRequests(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải thực phẩm người dùng nhập:', err);
      setCustomFoodRequests([]);
      setCustomFoodRequestError('Không tải được dữ liệu thực phẩm trong nhóm "khác". Kiểm tra đăng nhập admin hoặc backend đã restart.');
    } finally {
      setIsLoadingCustomFoodRequests(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFoods();
    fetchCategories();
    fetchCustomFoodRequests();
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      if (!document.hidden) {
        fetchCustomFoodRequests();
      }
    };
    const intervalId = window.setInterval(fetchCustomFoodRequests, 15000);

    document.addEventListener('visibilitychange', refreshOnFocus);
    window.addEventListener('focus', fetchCustomFoodRequests);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      window.removeEventListener('focus', fetchCustomFoodRequests);
    };
  }, []);

  const handleAddInlineVariant = async (foodId: number) => {
    if (!inlineValue.trim()) return;

    const food = foods.find(f => f.id === foodId);
    if (!food) return;

    const currentVariants = food.synonyms ? food.synonyms.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
    if (!currentVariants.includes(inlineValue.trim())) {
      const updatedVariants = [...currentVariants, inlineValue.trim()].join(',');
      try {
        const payload = {
          name: food.name,
          categoryId: food.categoryId,
          unit: food.unit,
          imageUrl: food.imageUrl,
          synonyms: updatedVariants
        };
        await api.put(`/api/foods/${foodId}`, payload);
        setInlineValue('');
        setInlineAdding(null);
        fetchFoods();
      } catch (err) {
        console.error(err);
        alert('Lỗi khi thêm tên gọi khác.');
      }
    }
  };

  const handleRemoveVariant = async (foodId: number, index: number) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;

    const currentVariants = food.synonyms ? food.synonyms.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
    const updatedVariants = currentVariants.filter((_: string, i: number) => i !== index).join(',');
    try {
      const payload = {
        name: food.name,
        categoryId: food.categoryId,
        unit: food.unit,
        imageUrl: food.imageUrl,
        synonyms: updatedVariants
      };
      await api.put(`/api/foods/${foodId}`, payload);
      fetchFoods();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa tên gọi khác.');
    }
  };

  const handleFinalAdd = async () => {
    if (!selectedItem) return;
    const variantsList = newVariants.split(',').map(v => v.trim()).filter(v => v !== '');
    const currentVariants = selectedItem.synonyms ? selectedItem.synonyms.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
    const combined = Array.from(new Set([...currentVariants, ...variantsList])).join(',');
    
    try {
      const payload = {
        name: selectedItem.name,
        categoryId: selectedItem.categoryId,
        unit: selectedItem.unit,
        imageUrl: selectedItem.imageUrl,
        synonyms: combined
      };
      await api.put(`/api/foods/${selectedItem.id}`, payload);
      fetchFoods();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Không thể lưu tên gọi địa phương.');
    }
  };

  const handleDeleteSynonymMapping = async (foodId: number) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;
    try {
      const payload = {
        name: food.name,
        categoryId: food.categoryId,
        unit: food.unit,
        imageUrl: food.imageUrl,
        synonyms: ''
      };
      await api.put(`/api/foods/${foodId}`, payload);
      fetchFoods();
    } catch (err) {
      console.error(err);
      alert('Không thể xóa tên gọi địa phương.');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setStep(2);
    setSelectedItem(null);
    setNewVariants('');
    setItemSearch('');
  };

  const handleOpenApproveModal = (item: CustomFoodRequest) => {
    setApprovingItem(item);
    setApproveName(item.customName);
    setApproveCategory(item.categoryId);
    setApproveUnit(item.unit || 'g');
    setApproveSynonyms(`${item.customName},${item.placeholderFoodName}`);
  };

  const handleSaveApproval = async () => {
    if (!approvingItem) return;
    try {
      const payload = {
        customName: approvingItem.customName,
        placeholderFoodId: approvingItem.placeholderFoodId,
        name: approveName,
        categoryId: approveCategory,
        unit: approveUnit,
        synonyms: approveSynonyms,
        imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
      };
      await api.post('/api/fridge-items/custom-food-requests/resolve-new', payload);
      alert(`Đã duyệt "${approveName}" thành thực phẩm mới và cập nhật các item trong tủ lạnh.`);
      setApprovingItem(null);
      fetchFoods();
      fetchCustomFoodRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Duyệt thực phẩm thất bại.');
    }
  };

  const handleSaveSynonymMapping = async () => {
    if (!viewingItem || !selectedLinkFood) return;
    try {
      const food = selectedLinkFood;
      await api.post('/api/fridge-items/custom-food-requests/resolve-synonym', {
        customName: viewingItem.customName,
        placeholderFoodId: viewingItem.placeholderFoodId,
        targetFoodId: food.id
      });
      alert(`Đã liên kết thành công! Đã thêm "${viewingItem.customName}" làm từ đồng nghĩa của "${food.name}" và cập nhật các item trong tủ lạnh.`);
      setViewingItem(null);
      setIsLinkingMode(false);
      fetchFoods();
      fetchCustomFoodRequests();
    } catch (err) {
      console.error(err);
      alert('Liên kết từ đồng nghĩa thất bại.');
    }
  };

  const foodSynonyms = foods.filter(f => f.synonyms && (f.synonyms as string).trim().length > 0).map(f => ({
    id: f.id,
    originalName: f.name,
    type: 'food',
    variants: (f.synonyms as string).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
  }));

  const filteredSynonyms = foodSynonyms.filter(s => 
    s.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.variants.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const synonymItemsPerPage = 10;
  const synonymTotalPages = Math.ceil(filteredSynonyms.length / synonymItemsPerPage);
  const synonymStartIndex = (synonymPage - 1) * synonymItemsPerPage;
  const displayedSynonyms = filteredSynonyms.slice(synonymStartIndex, synonymStartIndex + synonymItemsPerPage);

  const getVisibleSynonymPages = () => {
    if (synonymTotalPages <= 3) {
      return Array.from({ length: synonymTotalPages }, (_, i) => i + 1);
    }
    if (synonymPage === 1) {
      return [1, 2, 3];
    }
    if (synonymPage === synonymTotalPages) {
      return [synonymTotalPages - 2, synonymTotalPages - 1, synonymTotalPages];
    }
    return [synonymPage - 1, synonymPage, synonymPage + 1];
  };

  const itemsToSelect = foods.filter(f => 
    (!f.synonyms || f.synonyms.trim().length === 0) &&
    f.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="um-layout">
      <Sidebar />

      <div className="um-main">
        {/* 🎯 ĐÃ NHÚNG TOPBAR: Ẩn tìm kiếm thanh trên đi (showSearch={false}) và ép hiển thị ADMIN góc phải */}
        <Topbar 
          title="Quản lý hiệu suất" 
          showSearch={false}
          familyName="ADMIN"
        />

        <div className="um-main-container pb-4">
          <main className="um-content vertical-stack-gap">
            
            {/* Stats Summary Cards */}
            <div className="stats-grid-4col">
              <div className="um-card stat-item-card">
                <div className="stat-icon-wrapper bg-sky text-sky">
                  <Users size={24} />
                </div>
                <div>
                  <p className="stat-card-label">Người dùng</p>
                  <p className="stat-card-number">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="um-card stat-item-card">
                <div className="stat-icon-wrapper bg-red text-red">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <p className="stat-card-label">Gia đình</p>
                  <p className="stat-card-number">{stats.totalFamilies}</p>
                </div>
              </div>
              <div className="um-card stat-item-card">
                <div className="stat-icon-wrapper bg-green text-green">
                  <UtensilsCrossed size={24} />
                </div>
                <div>
                  <p className="stat-card-label">Thực phẩm</p>
                  <p className="stat-card-number">{stats.totalFoods}</p>
                </div>
              </div>
              <div className="um-card stat-item-card">
                <div className="stat-icon-wrapper bg-purple text-purple">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="stat-card-label">Món ăn</p>
                  <p className="stat-card-number">{stats.totalRecipes}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid-2col">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="um-card h-400">
                <h3 className="chart-title">Lượt truy cập trong tuần</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={stats.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="users" fill="var(--mint-green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="um-card h-400">
                <h3 className="chart-title">Phân loại thực phẩm</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={stats.foodStats}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.foodStats.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Unidentified Items Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="um-card">
              <div className="section-toolbar-wrapper">
                <div>
                  <h3 className="section-block-title">Thực phẩm trong nhóm "khác" do người dùng nhập</h3>
                  <p className="section-block-subtitle">Các item đang nằm dưới Rau củ khác, Trái cây khác, Thịt khác, Hải sản khác, Đồ khô khác, Gia vị khác... cần admin xem xét.</p>
                </div>
                <div className="toolbar-search-actions-flex">
                  <div className="um-search-container max-w-300">
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm yêu cầu..." 
                      className="um-search-input"
                      value={uiSearchQuery}
                      onChange={(e) => setUiSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchCustomFoodRequests}
                    className="um-btn-primary whitespace-nowrap"
                    disabled={isLoadingCustomFoodRequests}
                  >
                    <RefreshCw size={18} />
                    {isLoadingCustomFoodRequests ? 'Đang tải' : 'Tải lại'}
                  </button>
                </div>
              </div>

              {customFoodRequestError && (
                <div className="error-alert-banner">
                  {customFoodRequestError}
                </div>
              )}

              <div className="table-overflow-box">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Cụ thể người dùng nhập</th>
                      <th>Nhóm hiện tại</th>
                      <th>Food placeholder</th>
                      <th>Đơn vị</th>
                      <th>Số lần nhập</th>
                      <th>Lần cuối</th>
                      <th className="text-center w-100">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCustomFoodRequests && (
                      <tr>
                        <td colSpan={7} className="text-center p-2 text-muted">
                          Đang tải dữ liệu thực phẩm người dùng nhập...
                        </td>
                      </tr>
                    )}
                    {customFoodRequests.filter(item => 
                      item.customName.toLowerCase().includes(uiSearchQuery.toLowerCase()) || 
                      item.categoryName.toLowerCase().includes(uiSearchQuery.toLowerCase()) ||
                      item.placeholderFoodName.toLowerCase().includes(uiSearchQuery.toLowerCase())
                    ).map(item => (
                      <tr key={`${item.placeholderFoodId}-${item.customName}`}>
                        <td className="custom-name-highlight">{item.customName}</td>
                        <td>
                          <span className="um-role-badge">{item.categoryName}</span>
                        </td>
                        <td className="placeholder-name-bold">{item.placeholderFoodName}</td>
                        <td className="text-muted-sm">{item.unit || 'g'}</td>
                        <td className="count-number-text">{item.requestCount}</td>
                        <td className="text-muted-sm">{formatDateTime(item.lastRequestedAt)}</td>
                        <td>
                          <div className="action-flex-center">
                            <ActionBtn icon={<Eye size={18} />} hoverColor="var(--fiza-primary)" onClick={() => { setViewingItem(item); setIsLinkingMode(false); }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoadingCustomFoodRequests && customFoodRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="empty-table-cell">
                          Không có thực phẩm thuộc nhóm "khác" nào cần xử lý.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Synonym Management */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="um-card">
              <div className="section-toolbar-wrapper">
                <div>
                  <h3 className="section-block-title">Quản lý tên gọi địa phương</h3>
                  <p className="section-block-subtitle">Đồng nhất tên gọi thực phẩm cho các vùng miền</p>
                </div>
                <div className="toolbar-search-actions-flex">
                  <div className="um-search-container max-w-300">
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm tên gọi..." 
                      className="um-search-input"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSynonymPage(1);
                      }}
                    />
                  </div>
                  <button onClick={() => { setSelectedItem(null); setStep(2); setShowAddModal(true); }} className="um-btn-primary">
                    <Plus size={20} />
                    Thêm từ đồng nghĩa
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-text-box">Đang tải danh sách tên gọi...</div>
              ) : (
                <div className="table-overflow-box">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>Tên chuẩn</th>
                        <th className="w-120">Loại</th>
                        <th>Các biến thể / Tên gọi khác</th>
                        <th className="text-center w-120">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSynonyms.map(item => (
                        <tr key={item.id}>
                          <td className="custom-name-highlight">{item.originalName}</td>
                          <td>
                            <span className="type-badge-green">
                              Thực phẩm
                            </span>
                          </td>
                          <td>
                            <div className="tags-flex-wrap">
                              {item.variants.map((v, idx) => (
                                <div key={idx} className="variant-tag-pill">
                                  <span className="pill-text-sm">{v}</span>
                                  <button 
                                    onClick={() => handleRemoveVariant(item.id, idx)}
                                    className="btn-remove-tag-inline"
                                  >
                                    <X size={14} color="var(--fiza-primary)" />
                                  </button>
                                </div>
                              ))}
                              
                              {inlineAdding === item.id ? (
                                <div className="inline-add-input-container">
                                  <input 
                                    autoFocus 
                                    value={inlineValue}
                                    onChange={(e) => setInlineValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddInlineVariant(item.id)}
                                    onBlur={() => {
                                      if (!inlineValue.trim()) setInlineAdding(null);
                                      else handleAddInlineVariant(item.id);
                                    }}
                                    placeholder="Nhập tên gọi khác..."
                                    className="inline-pill-text-input"
                                  />
                                  <button onClick={() => handleAddInlineVariant(item.id)} className="btn-circle-submit-pill">
                                    <Plus size={16} />
                                  </button>
                                  <button onClick={() => { setInlineValue(''); setInlineAdding(null); }} className="btn-circle-cancel-pill">
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => { setInlineAdding(item.id); setInlineValue(''); }}
                                  className="um-btn-add h-32"
                                >
                                  <Plus size={16} /> THÊM
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="action-flex-center">
                              <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => handleDeleteSynonymMapping(item.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSynonyms.length === 0 && (
                        <tr>
                          <td colSpan={4} className="empty-table-cell">
                            Không tìm thấy tên gọi địa phương nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {filteredSynonyms.length > 10 && (
                <div className="pagination-wrapper-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
                  <p className="pagination-info-text" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Hiển thị {synonymStartIndex + 1} - {Math.min(synonymStartIndex + synonymItemsPerPage, filteredSynonyms.length)} trên {filteredSynonyms.length} tên gọi
                  </p>
                  <div className="pagination-controls-flex" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <PageArrow 
                      icon={<ChevronLeft size={18} />} 
                      disabled={synonymPage === 1}
                      onClick={() => setSynonymPage(prev => Math.max(prev - 1, 1))}
                    />
                    {getVisibleSynonymPages().map((p) => (
                      <PageNum 
                        key={p} 
                        active={synonymPage === p}
                        onClick={() => setSynonymPage(p)}
                      >
                        {p}
                      </PageNum>
                    ))}
                    <PageArrow 
                      icon={<ChevronRight size={18} />} 
                      disabled={synonymPage === synonymTotalPages}
                      onClick={() => setSynonymPage(prev => Math.min(prev + 1, synonymTotalPages))}
                    />
                  </div>
                </div>
              )}
            </motion.div>

          </main>
        </div>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Thêm từ đồng nghĩa / Tên gọi địa phương" onClose={handleCloseModal}>
            <div className="modal-vertical-stack-gap">
              
              {step === 2 && (
                <div className="modal-vertical-stack-gap">
                  <p className="select-food-prompt-text">Chọn thực phẩm cần thêm tên gọi khác:</p>
                  <div className="um-search-container">
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm thực phẩm..." 
                      className="um-search-input"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                    />
                  </div>
                  <div className="modal-scroll-food-list">
                    {itemsToSelect.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedItem(item); setStep(3); }}
                        className="selectable-food-row-card"
                      >
                        <div className="food-avatar-square-40">
                          <img src={item.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'} alt="" />
                        </div>
                        <div className="flex-1">
                          <p className="selectable-food-title">{item.name}</p>
                          <p className="selectable-food-unit">Đơn vị: {item.unit}</p>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                      </div>
                    ))}
                    {itemsToSelect.length === 0 && (
                      <p className="text-center p-2 text-muted">Không tìm thấy thực phẩm phù hợp.</p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && selectedItem && (
                <div className="modal-vertical-stack-gap-lg">
                  <div className="selected-food-header-row">
                    <div className="selected-food-meta-flex">
                      <div className="recipe-img-container">
                        <img src={selectedItem.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'} alt="" />
                      </div>
                      <div>
                        <p className="placeholder-name-bold">{selectedItem.name}</p>
                        <p className="selectable-food-unit">Đơn vị: {selectedItem.unit}</p>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="btn-change-selection-link">Đổi mục khác</button>
                  </div>

                  <div className="modal-textarea-stack-group">
                    <label className="modal-input-label">Nhập các tên gọi khác / Từ đồng nghĩa</label>
                    <textarea 
                      placeholder="Cách nhau bằng dấu phẩy. VD: Thịt lợn, Heo, Lợn nái..." 
                      className="um-textarea h-120-fixed"
                      value={newVariants}
                      onChange={(e) => setNewVariants(e.target.value)}
                    />
                    <p className="textarea-helper-note">* Lưu ý: Các tên này sẽ giúp người dùng tìm kiếm chính xác hơn khi sử dụng ứng dụng.</p>
                  </div>

                  <div className="modal-buttons-flex gap-1 mt-1">
                    <button onClick={handleCloseModal} className="btn-cancel-round flex-1">Hủy</button>
                    <button onClick={handleFinalAdd} className="um-btn-primary flex-2">Hoàn tất</button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {approvingItem && (
          <Modal title="Duyệt thực phẩm mới" onClose={() => setApprovingItem(null)}>
            <div className="modal-vertical-stack-gap-lg">
              <div className="alert-info-container-box">
                <p className="alert-meta-label">Người dùng nhập:</p>
                <p className="alert-meta-value">{approvingItem.customName} ({approvingItem.placeholderFoodName})</p>
                <p className="alert-meta-desc">Các item hiện đang trỏ tới food placeholder này sẽ được chuyển sang thực phẩm mới sau khi duyệt.</p>
              </div>

              <div className="form-input-stack">
                <label className="modal-input-label">Tên chuẩn hóa hệ thống</label>
                <input 
                  type="text" 
                  value={approveName} 
                  onChange={(e) => setApproveName(e.target.value)} 
                  className="um-search-input pl-1" 
                />
              </div>

              <div className="form-input-stack">
                <label className="modal-input-label">Nhóm thực phẩm</label>
                <select 
                  value={approveCategory} 
                  onChange={(e) => setApproveCategory(Number(e.target.value))} 
                  className="um-search-input pl-1" 
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-input-stack">
                <label className="modal-input-label">Đơn vị tính</label>
                <select 
                  value={approveUnit} 
                  onChange={(e) => setApproveUnit(e.target.value)} 
                  className="um-search-input pl-1" 
                >
                  <option value="kg">kg (Ki-lô-gam)</option>
                  <option value="g">g (Gam)</option>
                  <option value="ml">ml (Mi-li-lít)</option>
                  <option value="l">l (Lít)</option>
                  <option value="quả">quả</option>
                  <option value="hộp">hộp</option>
                  <option value="gói">gói</option>
                  <option value="lon">lon</option>
                  <option value="chai">chai</option>
                  <option value="cái">cái</option>
                  <option value="bó">bó</option>
                </select>
              </div>

              <div className="form-input-stack">
                <label className="modal-input-label">Từ đồng nghĩa / Tên gọi khác (phân cách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={approveSynonyms} 
                  onChange={(e) => setApproveSynonyms(e.target.value)} 
                  className="um-search-input pl-1" 
                  placeholder="VD: Lợn nái, Heo nái..." 
                />
              </div>

              <div className="modal-buttons-flex gap-1 mt-1">
                <button onClick={() => setApprovingItem(null)} className="btn-cancel-round flex-1">Hủy</button>
                <button onClick={handleSaveApproval} className="um-btn-primary flex-2">Lưu & Duyệt vào danh mục</button>
              </div>
            </div>
          </Modal>
        )}

        {viewingItem && (
          <Modal 
            title={isLinkingMode ? "Liên kết tên gọi địa phương" : "Chi tiết yêu cầu định danh"} 
            onClose={() => { setViewingItem(null); setIsLinkingMode(false); }} 
            width="500px"
          >
            {isLinkingMode ? (
              <div className="modal-vertical-stack-gap-lg">
                <div className="alert-info-container-box">
                  <p className="alert-meta-label">Liên kết tên gọi của người dùng:</p>
                  <p className="alert-meta-value">{viewingItem.customName} ({viewingItem.placeholderFoodName})</p>
                </div>

                <div className="form-input-stack">
                  <label className="modal-input-label">Chọn thực phẩm hệ thống sẵn có để liên kết làm từ đồng nghĩa</label>
                  <div className="um-search-container w-100">
                    <Search className="um-search-icon icon-left-1" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm thực phẩm hệ thống..." 
                      value={linkSearchQuery}
                      onChange={(e) => setLinkSearchQuery(e.target.value)}
                      className="um-search-input pl-25 w-100"
                    />
                  </div>
                </div>

                <div className="modal-scroll-link-list">
                  {foods
                    .filter(f => f.name.toLowerCase().includes(linkSearchQuery.toLowerCase()))
                    .map(f => (
                      <div 
                        key={f.id} 
                        onClick={() => setSelectedLinkFood(f)}
                        style={{ backgroundColor: selectedLinkFood?.id === f.id ? '#E1F2EB' : 'transparent' }}
                        className="link-food-item-row"
                      >
                        <div>
                          <span className="placeholder-name-bold">{f.name}</span>
                          <span className="text-muted-sm ml-05">({f.unit})</span>
                        </div>
                        {selectedLinkFood?.id === f.id && (
                          <span className="selected-text-green-bold">ĐÃ CHỌN</span>
                        )}
                      </div>
                    ))}
                  {foods.filter(f => f.name.toLowerCase().includes(linkSearchQuery.toLowerCase())).length === 0 && (
                    <p className="text-center p-1 text-muted fs-0875">Không tìm thấy thực phẩm nào.</p>
                  )}
                </div>

                <div className="modal-buttons-flex gap-1 mt-1">
                  <button onClick={() => setIsLinkingMode(false)} className="btn-cancel-round flex-1">Quay lại</button>
                  <button 
                    onClick={handleSaveSynonymMapping} 
                    disabled={!selectedLinkFood}
                    className="um-btn-primary flex-15" 
                    style={{ opacity: selectedLinkFood ? 1 : 0.6 }}
                  >
                    Xác nhận liên kết
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-vertical-stack-gap-lg">
                <div className="modal-grid-2col gap-15">
                  <DetailItem label="Food placeholder" value={viewingItem.placeholderFoodName} isBadge />
                  <DetailItem label="Tên người dùng nhập" value={viewingItem.customName} />
                  <DetailItem label="Danh mục" value={viewingItem.categoryName} />
                  <DetailItem label="Đơn vị" value={viewingItem.unit || 'g'} />
                  <DetailItem label="Số lần nhập" value={viewingItem.requestCount} />
                  <DetailItem label="Lần cuối" value={formatDateTime(viewingItem.lastRequestedAt)} />
                </div>
                <div className="form-input-stack mt-05">
                  <span className="detail-label">Logic xử lý</span>
                  <div className="alert-desc-text-box">
                    Nếu đây là tên gọi khác của thực phẩm đã có, hãy liên kết vào thực phẩm sẵn có để thêm đồng nghĩa và chuyển các item khỏi nhóm "{viewingItem.placeholderFoodName}". Nếu đây là thực phẩm mới, hãy duyệt thành item mới trong cơ sở dữ liệu.
                  </div>
                </div>
                <div className="modal-vertical-buttons-stack mt-15">
                  <div className="modal-buttons-flex gap-1">
                    <button onClick={() => setViewingItem(null)} className="btn-cancel-round flex-1">Đóng</button>
                    <button 
                      onClick={() => {
                        setIsLinkingMode(true);
                        setSelectedLinkFood(null);
                        setLinkSearchQuery('');
                      }}
                      className="btn-link-existing"
                    >
                      Liên kết thực phẩm sẵn có
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setViewingItem(null);
                      handleOpenApproveModal(viewingItem);
                    }}
                    className="um-btn-primary w-100 mt-05" 
                  >
                    Duyệt thực phẩm mới
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Components ---
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

function DetailItem({ label, value, isBadge }: any) {
  return (
    <div className="detail-item-stack">
      <span className="detail-label">{label}</span>
      {isBadge ? (
        <span className="um-role-badge self-start">{value}</span>
      ) : (
        <span className="detail-value-bold">{value || 'N/A'}</span>
      )}
    </div>
  );
}

function PageNum({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%', 
        border: 'none', 
        fontWeight: 700, 
        fontSize: '0.75rem', 
        cursor: 'pointer', 
        transition: 'all 0.2s', 
        backgroundColor: active ? 'var(--mint-green)' : 'transparent', 
        color: active ? 'white' : '#475569', 
        boxShadow: active ? '0 10px 15px -3px rgba(109, 212, 180, 0.3)' : 'none' 
      }}
    >
      {children}
    </button>
  );
}

function PageArrow({ icon, disabled, onClick }: any) {
  return (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      style={{ 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%', 
        border: 'none', 
        background: 'transparent', 
        display: 'flex', 
        alignItems: 'center', 
        justify-content: 'center', 
        cursor: disabled ? 'default' : 'pointer', 
        color: '#94a3b8', 
        opacity: disabled ? 0.3 : 1 
      }}
    >
      {icon}
    </button>
  );
}

export default PerformanceManagement;