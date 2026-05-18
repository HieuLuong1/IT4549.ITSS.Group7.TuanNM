import React, { useState } from 'react';
import { 
  Users, 
  UtensilsCrossed, 
  BookOpen, 
  Bell, 
  Settings, 
  Leaf,
  BarChart3,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
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
import { mockSynonyms as initialSynonyms, mockFoods, mockRecipes, SynonymMapping, categories as initialCategories, mockUnidentifiedItems as initialUnidentifiedItems, UnidentifiedItem } from '../../data/mockData';

// --- Local Mock Data for Stats ---
const userStats = [
  { name: 'Thứ 2', users: 400 },
  { name: 'Thứ 3', users: 300 },
  { name: 'Thứ 4', users: 600 },
  { name: 'Thứ 5', users: 800 },
  { name: 'Thứ 6', users: 500 },
  { name: 'Thứ 7', users: 900 },
  { name: 'Chủ nhật', users: 1100 },
];

  // Calculate dynamic food stats based on mockFoods categories
  const foodStats = initialCategories.map(cat => ({
    name: cat,
    value: mockFoods.filter(f => f.category === cat).length
  })).filter(stat => stat.value > 0);

const COLORS = ['#6DD4B4', '#F99F1B', '#FF7E7E', '#64748b', '#0EA5E9', '#A855F7', '#EC4899', '#F59E0B'];

const PerformanceManagement: React.FC = () => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [synonyms, setSynonyms] = useState<SynonymMapping[]>(initialSynonyms);
  const [unidentifiedItems, setUnidentifiedItems] = useState<UnidentifiedItem[]>(initialUnidentifiedItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [uiSearchQuery, setUiSearchQuery] = useState('');
  const [inlineAdding, setInlineAdding] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Type, 2: Select Item, 3: Add Variants
  const [selectedType, setSelectedType] = useState<'food' | 'recipe'>('food');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newVariants, setNewVariants] = useState<string>('');
  const [itemSearch, setItemSearch] = useState('');

  const handleAddInlineVariant = (id: string) => {
    if (inlineValue.trim()) {
      setSynonyms(synonyms.map(s => s.id === id ? { ...s, variants: Array.from(new Set([...s.variants, inlineValue.trim()])) } : s));
      setInlineValue('');
      setInlineAdding(null);
    }
  };

  const handleRemoveVariant = (id: string, index: number) => {
    setSynonyms(synonyms.map(s => s.id === id ? { ...s, variants: s.variants.filter((_, i) => i !== index) } : s));
  };

  const handleFinalAdd = () => {
    if (!selectedItem) return;
    const variantsList = newVariants.split(',').map(v => v.trim()).filter(v => v !== '');
    
    // Check if mapping already exists
    const existingIndex = synonyms.findIndex(s => s.originalName === selectedItem.name);
    
    if (existingIndex > -1) {
      const updated = [...synonyms];
      updated[existingIndex] = {
        ...updated[existingIndex],
        variants: Array.from(new Set([...updated[existingIndex].variants, ...variantsList]))
      };
      setSynonyms(updated);
    } else {
      const newMapping: SynonymMapping = {
        id: `syn-${Date.now()}`,
        originalName: selectedItem.name,
        type: selectedType,
        variants: variantsList
      };
      setSynonyms([newMapping, ...synonyms]);
    }
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setStep(1);
    setSelectedItem(null);
    setNewVariants('');
    setItemSearch('');
  };

  const itemsToSelect = selectedType === 'food' 
    ? mockFoods.filter(f => 
        f.name.toLowerCase().includes(itemSearch.toLowerCase()) && 
        !synonyms.some(s => s.originalName === f.name)
      )
    : mockRecipes.filter(r => 
        r.name.toLowerCase().includes(itemSearch.toLowerCase()) && 
        !synonyms.some(s => s.originalName === r.name)
      );

  const handleAddVariantRow = (id: string, name: string) => {
    const v = prompt(`Nhập tên gọi khác / Từ đồng nghĩa cho "${name}":`);
    if (v && v.trim()) {
      setSynonyms(synonyms.map(s => s.id === id ? { ...s, variants: Array.from(new Set([...s.variants, v.trim()])) } : s));
    }
  };

  const filteredSynonyms = synonyms.filter(s => 
    (s.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.variants.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    s.variants.length > 0
  );

  return (
    <div className="um-layout">
      {/* Sidebar */}
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
            <AnimatePresence>
              {isSidebarHovered && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--mint-green)', marginLeft: '0.75rem', whiteSpace: 'nowrap' }}>
                  Fiza
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SidebarLink icon={<Users size={22} />} label="Quản lý người dùng" to="/admin/users" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<UtensilsCrossed size={22} />} label="Quản lý thực phẩm" to="/admin/foods" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<BookOpen size={22} />} label="Quản lý món ăn" to="/admin/recipes" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<BarChart3 size={22} />} label="Quản lý hiệu suất" to="/admin/performance" isExpanded={isSidebarHovered} active />
        </nav>

        <div style={{ width: '100%', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', margin: '0.5rem 0.5rem 0', borderRadius: '1rem', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--fiza-primary)', flexShrink: 0, margin: isSidebarHovered ? '0' : '0 auto' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <AnimatePresence>
              {isSidebarHovered && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ marginLeft: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Admin Fiza</p>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Super Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`um-main ${isSidebarHovered ? 'shifted' : 'unshifted'}`}>
        <header className="um-header">
          <div className="um-header-left">
            <h1 className="um-title">Quản lý hiệu suất</h1>
            <p className="um-subtitle">Theo dõi báo cáo và tối ưu hóa hệ thống</p>
          </div>
          <div className="um-header-right">
            <HeaderBtn icon={<Bell size={20} />} hasBadge />
            <HeaderBtn icon={<Settings size={20} />} />
          </div>
        </header>

        <div className="um-main-container" style={{ paddingBottom: '4rem' }}>
          <main className="um-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="um-card" style={{ height: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--fiza-primary)' }}>Lượt truy cập trong tuần</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={userStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="users" fill="var(--mint-green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="um-card" style={{ height: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--fiza-primary)' }}>Phân loại thực phẩm</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={foodStats}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {foodStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* New Unidentified Items Section - Meat */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="um-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fiza-primary)' }}>Thịt chung (Người dùng nhập)</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Các loại thịt mới chưa có trong hệ thống</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="um-search-container" style={{ maxWidth: '300px' }}>
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm thịt mới..." 
                      className="um-search-input"
                      value={uiSearchQuery}
                      onChange={(e) => setUiSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Mã loại</th>
                      <th>Cụ thể (Người dùng nhập)</th>
                      <th>Ghi chú / Chú thích</th>
                      <th>Người gửi</th>
                      <th>Ngày gửi</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidentifiedItems.filter(item => 
                      item.type === 'meat' && (
                        item.actualName.toLowerCase().includes(uiSearchQuery.toLowerCase()) || 
                        item.generalName.toLowerCase().includes(uiSearchQuery.toLowerCase())
                      )
                    ).map(item => (
                      <tr key={item.id}>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '9999px', 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase',
                            backgroundColor: '#FEF3C7',
                            color: '#D97706'
                          }}>
                            {item.generalName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>{item.actualName}</td>
                        <td style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '300px' }}>{item.note}</td>
                        <td style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{item.submittedBy}</td>
                        <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.submittedAt}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <ActionBtn icon={<Plus size={18} />} hoverColor="var(--mint-green)" onClick={() => alert('Duyệt thực phẩm này vào danh mục chính thức')} />
                            <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setUnidentifiedItems(unidentifiedItems.filter(i => i.id !== item.id))} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {unidentifiedItems.filter(i => i.type === 'meat').length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          Không có thịt mới nào cần xử lý.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* New Unidentified Items Section - Ingredients */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="um-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fiza-primary)' }}>Nguyên liệu chung (Người dùng nhập)</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Các loại nguyên liệu mới chưa có trong hệ thống</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="um-search-container" style={{ maxWidth: '300px' }}>
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm nguyên liệu mới..." 
                      className="um-search-input"
                      value={uiSearchQuery}
                      onChange={(e) => setUiSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Mã loại</th>
                      <th>Cụ thể (Người dùng nhập)</th>
                      <th>Ghi chú / Chú thích</th>
                      <th>Người gửi</th>
                      <th>Ngày gửi</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidentifiedItems.filter(item => 
                      item.type === 'ingredient' && (
                        item.actualName.toLowerCase().includes(uiSearchQuery.toLowerCase()) || 
                        item.generalName.toLowerCase().includes(uiSearchQuery.toLowerCase())
                      )
                    ).map(item => (
                      <tr key={item.id}>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '9999px', 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase',
                            backgroundColor: '#F3E8FF',
                            color: '#9333EA'
                          }}>
                            {item.generalName}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>{item.actualName}</td>
                        <td style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '300px' }}>{item.note}</td>
                        <td style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>{item.submittedBy}</td>
                        <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.submittedAt}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <ActionBtn icon={<Plus size={18} />} hoverColor="var(--mint-green)" onClick={() => alert('Duyệt nguyên liệu này vào danh mục chính thức')} />
                            <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setUnidentifiedItems(unidentifiedItems.filter(i => i.id !== item.id))} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {unidentifiedItems.filter(i => i.type === 'ingredient').length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          Không có nguyên liệu mới nào cần xử lý.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Synonym Management */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="um-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fiza-primary)' }}>Quản lý tên gọi địa phương</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Đồng nhất tên gọi thực phẩm cho các vùng miền</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="um-search-container" style={{ maxWidth: '300px' }}>
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm tên gọi..." 
                      className="um-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setShowAddModal(true)} className="um-btn-primary">
                    <Plus size={20} />
                    Thêm từ đồng nghĩa
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Tên chuẩn</th>
                      <th style={{ width: '120px' }}>Loại</th>
                      <th>Các biến thể / Tên gọi khác</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSynonyms.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>{item.originalName}</td>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '9999px', 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase',
                            backgroundColor: item.type === 'food' ? '#E1F2EB' : '#F0F9FF',
                            color: item.type === 'food' ? 'var(--mint-green)' : '#0EA5E9'
                          }}>
                            {item.type === 'food' ? 'Thực phẩm' : 'Món ăn'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                            {item.variants.map((v, idx) => (
                              <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.35rem', 
                                padding: '0.25rem 0.85rem', 
                                backgroundColor: '#E1F2EB', 
                                borderRadius: '9999px',
                                border: '1px solid #6DD4B4',
                                transition: 'all 0.2s'
                              }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fiza-primary)' }}>{v}</span>
                                <button 
                                  onClick={() => handleRemoveVariant(item.id, idx)}
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: 0 }}
                                >
                                  <X size={14} color="var(--fiza-primary)" />
                                </button>
                              </div>
                            ))}
                            
                            {inlineAdding === item.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                  style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    border: '1.5px solid var(--mint-green)', 
                                    fontSize: '0.8125rem',
                                    outline: 'none',
                                    width: '180px',
                                    background: 'white'
                                  }}
                                />
                                <button onClick={() => handleAddInlineVariant(item.id)} style={{ border: 'none', background: 'var(--mint-green)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(109, 212, 180, 0.2)' }}>
                                  <Plus size={16} />
                                </button>
                                <button onClick={() => { setInlineValue(''); setInlineAdding(null); }} style={{ border: 'none', background: '#f1f5f9', color: '#94a3b8', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setInlineAdding(item.id); setInlineValue(''); }}
                                className="um-btn-add"
                                style={{ padding: '0.25rem 1rem', height: '32px' }}
                              >
                                <Plus size={16} /> THÊM
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ActionBtn icon={<Trash2 size={18} />} hoverColor="#ef4444" onClick={() => setSynonyms(synonyms.filter(s => s.id !== item.id))} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </main>
        </div>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Thêm từ đồng nghĩa / Tên gọi địa phương" onClose={handleCloseModal}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Steps Progress */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step >= s ? 'var(--mint-green)' : '#f1f5f9' }} />
                ))}
              </div>

              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontWeight: 700, color: '#475569' }}>Bạn muốn thêm tên gọi cho loại hình nào?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div 
                      onClick={() => { setSelectedType('food'); setStep(2); }}
                      style={{ 
                        padding: '2rem', 
                        borderRadius: '24px', 
                        border: '2px solid #f1f5f9', 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: '#fff'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--mint-green)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
                    >
                      <UtensilsCrossed size={40} color="var(--mint-green)" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>Thực phẩm</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>Nguyên liệu thô, gia vị...</p>
                    </div>
                    <div 
                      onClick={() => { setSelectedType('recipe'); setStep(2); }}
                      style={{ 
                        padding: '2rem', 
                        borderRadius: '24px', 
                        border: '2px solid #f1f5f9', 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: '#fff'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--mint-green)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
                    >
                      <BookOpen size={40} color="#0EA5E9" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>Món ăn</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>Công thức nấu ăn đã hoàn thiện</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, color: '#475569' }}>Chọn {selectedType === 'food' ? 'thực phẩm' : 'món ăn'}</p>
                    <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: '#94a3b8', border: 'none', background: 'transparent', cursor: 'pointer' }}>Quay lại</button>
                  </div>
                  <div className="um-search-container">
                    <Search className="um-search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder={`Tìm ${selectedType === 'food' ? 'thực phẩm' : 'món ăn'}...`} 
                      className="um-search-input"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {itemsToSelect.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedItem(item); setStep(3); }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '1rem', 
                          border: '1px solid #f1f5f9',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: 'var(--fiza-primary)', fontSize: '0.9375rem' }}>{item.name}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8' }}>{item.category}</p>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && selectedItem && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={selectedItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: 'var(--fiza-primary)' }}>{selectedItem.name}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>{selectedItem.category}</p>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} style={{ fontSize: '12px', color: '#94a3b8', border: 'none', background: 'transparent', cursor: 'pointer' }}>Đổi mục khác</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Nhập các tên gọi khác / Từ đồng nghĩa</label>
                    <textarea 
                      placeholder="Cách nhau bằng dấu phẩy. VD: Thịt lợn, Heo, Lợn nái..." 
                      className="um-textarea"
                      style={{ height: '120px', resize: 'none' }}
                      value={newVariants}
                      onChange={(e) => setNewVariants(e.target.value)}
                    />
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>* Lưu ý: Các tên này sẽ giúp người dùng tìm kiếm chính xác hơn khi sử dụng ứng dụng.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={handleCloseModal} style={{ flex: 1, padding: '0.75rem', borderRadius: '9999px', border: '1px solid #f1f5f9', background: 'white', fontWeight: 600 }}>Hủy</button>
                    <button onClick={handleFinalAdd} className="um-btn-primary" style={{ flex: 2 }}>Hoàn tất</button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Copy helpers ---
function SidebarLink({ icon, label, to, isExpanded, active }: any) {
  return (
    <NavLink to={to} className={`um-nav-item ${active ? 'active' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="um-nav-icon">{icon}</div>
      <AnimatePresence>
        {isExpanded && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="um-nav-label">
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

function HeaderBtn({ icon, hasBadge }: any) {
  return (
    <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
      {icon}
      {hasBadge && <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #F0F4F2' }} />}
    </button>
  );
}

function ActionBtn({ icon, hoverColor, onClick }: any) {
  const [hover, setHover] = useState(false);
  return (
    <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: hover ? hoverColor : '#94a3b8', backgroundColor: hover ? 'white' : 'transparent', boxShadow: hover ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }}>{icon}</button>
  );
}

export default PerformanceManagement;
