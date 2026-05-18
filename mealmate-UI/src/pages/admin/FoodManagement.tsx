import React, { useState } from 'react';
import { 
  Users, 
  UtensilsCrossed, 
  BookOpen, 
  Bell, 
  Settings, 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Leaf,
  BarChart3,
  Scale,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import SharedModal from '../../components/admin/Modal';
import { mockFoods as initialFoods, Food, mockSynonyms } from '../../data/mockData';

const FoodManagement: React.FC = () => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [foods, setFoods] = useState<Food[]>(initialFoods);
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Inline synonyms state
  const [inlineAdding, setInlineAdding] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         food.synonyms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'Tất cả' || food.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredFoods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFoods = filteredFoods.slice(startIndex, startIndex + itemsPerPage);

  const handleEditClick = (food: Food) => {
    // Sync synonyms from performance management if available
    const existingSynonym = mockSynonyms.find(s => s.originalName === food.name);
    const updatedFood = {
      ...food,
      synonyms: Array.from(new Set([...(food.synonyms || []), ...(existingSynonym?.variants || [])]))
    };
    setViewFood(updatedFood);
    setEditData(updatedFood);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editData) {
      setFoods(foods.map(f => f.id === editData.id ? editData : f));
      setViewFood(editData);
      setIsEditing(false);
    }
  };

  const handleInlineAddSynonym = () => {
    if (inlineValue.trim() && editData) {
      setEditData({...editData, synonyms: Array.from(new Set([...editData.synonyms, inlineValue.trim()]))});
      setInlineValue('');
      setInlineAdding(false);
    }
  };

  const handleAddFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFood: Food = {
      id: `#FD${foods.length + 100}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      synonyms: (formData.get('synonyms') as string).split(',').map(s => s.trim()),
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
    };
    setFoods([newFood, ...foods]);
    setShowAddModal(false);
  };

  return (
    <div className="um-layout">
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`um-sidebar ${isSidebarHovered ? 'expanded' : 'collapsed'}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '3rem', padding: isSidebarHovered ? '0 1.25rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: isSidebarHovered ? 'flex-start' : 'center' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--fiza-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', flexShrink: 0, margin: isSidebarHovered ? '0' : '0 auto' }}>
              <Leaf color="white" fill="white" size={28} />
            </div>
            <AnimatePresence>{isSidebarHovered && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--mint-green)', marginLeft: '0.75rem', whiteSpace: 'nowrap' }}>Fiza</motion.span>}</AnimatePresence>
          </div>
        </div>

        <nav style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SidebarLink icon={<Users size={22} />} label="Quản lý người dùng" to="/admin/users" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<UtensilsCrossed size={22} />} label="Quản lý thực phẩm" to="/admin/foods" isExpanded={isSidebarHovered} active />
          <SidebarLink icon={<BookOpen size={22} />} label="Quản lý món ăn" to="/admin/recipes" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<BarChart3 size={22} />} label="Quản lý hiệu suất" to="/admin/performance" isExpanded={isSidebarHovered} />
        </nav>
      </aside>

      <div className={`um-main ${isSidebarHovered ? 'shifted' : 'unshifted'}`}>
        <header className="um-header">
          <div className="um-header-left">
            <h1 className="um-title">Quản lý thực phẩm</h1>
            <p className="um-subtitle">Danh mục nguyên liệu và thực phẩm hệ thống</p>
          </div>
          <div className="um-header-right">
            <HeaderBtn icon={<Bell size={20} />} hasBadge />
            <HeaderBtn icon={<Settings size={20} />} />
          </div>
        </header>

        <div className="um-main-container">
          <main className="um-content">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="um-card">
              <div className="um-toolbar-sticky">
                <div className="um-toolbar-controls">
                  <div className="um-search-container">
                    <Search className="um-search-icon" size={18} />
                    <input className="um-search-input" placeholder="Tìm tên hoặc tên gọi khác..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                  </div>
                  <div className="um-role-badge">
                    <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--fiza-primary)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                      <option>Tất cả</option>
                      <option>Thực phẩm tươi</option>
                      <option>Rau củ</option>
                      <option>Trái cây</option>
                      <option>Thủy hải sản</option>
                      <option>Trứng & Sữa</option>
                    </select>
                  </div>
                </div>
                <button className="um-btn-primary" onClick={() => setShowAddModal(true)}><Plus size={20} />Thêm thực phẩm</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Thực phẩm</th>
                      <th>Nhóm</th>
                      <th>Đơn vị</th>
                      <th>Tên gọi khác</th>
                      <th style={{ textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFoods.map(food => (
                      <tr key={food.id}>
                        <td style={{ fontWeight: 700, color: '#94a3b8' }}>{food.id}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden' }}>
                            <img src={food.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontWeight: 700 }}>{food.name}</span>
                        </td>
                        <td><span className="um-role-badge">{food.category}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <span style={{ fontSize: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px' }}>{food.unit}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{food.synonyms.join(', ')}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <ActionBtn icon={<Eye size={18} />} hoverColor="var(--fiza-primary)" onClick={() => handleEditClick(food)} />
                            <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setDeleteConfirm(food.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>Hiển thị {startIndex+1}-{Math.min(startIndex+itemsPerPage, totalItems)} / {totalItems}</p>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <PageArrow icon={<ChevronLeft size={18} />} disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} />
                  {[...Array(totalPages)].map((_, i) => <PageNum key={i+1} active={currentPage === i+1} onClick={() => setCurrentPage(i+1)}>{i+1}</PageNum>)}
                  <PageArrow icon={<ChevronRight size={18} />} disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} />
                </div>
              </div>
            </motion.div>
          </main>
        </div>

        {/* Modal Chi tiết / Cập nhật */}
        <AnimatePresence>
          {(viewFood && editData) && (
            <SharedModal title={isEditing ? "Cập nhật thực phẩm" : "Thông tin thực phẩm"} onClose={() => setViewFood(null)}>
              <div style={{ display: 'flex', gap: '2.5rem' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                  <img src={viewFood.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <DetailItem label="Mã thực phẩm" value={viewFood.id} />
                  {isEditing ? (
                    <>
                      <FormGroup label="Tên thực phẩm" value={editData.name} onChange={(e: any) => setEditData({...editData, name: e.target.value})} />
                      <div style={{ gridColumn: 'span 2' }}>
                        <FormGroup label="Đơn vị" value={editData.unit} onChange={(e: any) => setEditData({...editData, unit: e.target.value})} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Tên gọi khác / Từ đồng nghĩa</label>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                          {editData.synonyms.map((s, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.85rem', backgroundColor: '#E1F2EB', borderRadius: '9999px', border: '1px solid #6DD4B4' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fiza-primary)' }}>{s}</span>
                              <button 
                                type="button"
                                onClick={() => setEditData({...editData, synonyms: editData.synonyms.filter((_, i) => i !== idx)})}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: 0 }}
                              >
                                <X size={14} color="var(--fiza-primary)" />
                              </button>
                            </div>
                          ))}
                          {inlineAdding ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                className="um-search-input"
                                style={{ width: '150px', height: '32px', paddingLeft: '0.75rem', fontSize: '12px', border: '1.5px solid var(--mint-green)', background: 'white' }}
                              />
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setInlineAdding(true);
                                setInlineValue('');
                              }}
                              className="um-btn-add"
                              style={{ height: '32px', padding: '0 1.25rem' }}
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
                      <div style={{ gridColumn: 'span 2' }}>
                        <DetailItem label="Tên gọi khác" value={viewFood.synonyms.join(', ') || 'Chưa có'} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}>Hủy</button>
                    <button onClick={handleSaveEdit} className="um-btn-primary">Lưu thay đổi</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="um-btn-primary">Chỉnh sửa</button>
                )}
              </div>
            </SharedModal>
          )}

          {showAddModal && (
            <SharedModal title="Thêm thực phẩm mới" onClose={() => setShowAddModal(false)}>
              <form onSubmit={handleAddFood} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                 <FormGroup label="Tên thực phẩm" name="name" required />
                 <FormGroup label="Nhóm" name="category" placeholder="Rau củ, Thịt..." required />
                 <FormGroup label="Đơn vị (kg, g, cái...)" name="unit" required />
                 <FormGroup label="Tên gọi khác" name="synonyms" />
                 <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                   <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}>Hủy</button>
                   <button type="submit" className="um-btn-primary">Tạo mới</button>
                 </div>
              </form>
            </SharedModal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Standard Helpers ---
function SidebarLink({ icon, label, to, isExpanded, active }: any) {
  return (
    <NavLink to={to} className={`um-nav-item ${active ? 'active' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="um-nav-icon">{icon}</div>
      {isExpanded && <span className="um-nav-label">{label}</span>}
    </NavLink>
  );
}

function FormGroup({ label, ...props }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{label}</label>
      <input {...props} className="um-search-input" style={{ paddingLeft: '1rem' }} />
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1e293b' }}>{value}</span>
    </div>
  );
}

function HeaderBtn({ icon, hasBadge }: any) {
  return (
    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {icon}
      {hasBadge && <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />}
    </button>
  );
}

function ActionBtn({ icon, hoverColor, onClick }: any) {
  const [h, setH] = useState(false);
  return <button onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: h ? 'white' : 'transparent', color: h ? hoverColor : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</button>;
}

function PageNum({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: active ? 'var(--mint-green)' : 'transparent', color: active ? 'white' : '#475569', fontWeight: 700 }}>{children}</button>;
}

function PageArrow({ icon, disabled, onClick }: any) {
  return <button disabled={disabled} onClick={onClick} style={{ border: 'none', background: 'transparent', opacity: disabled ? 0.3 : 1 }}>{icon}</button>;
}

export default FoodManagement;
