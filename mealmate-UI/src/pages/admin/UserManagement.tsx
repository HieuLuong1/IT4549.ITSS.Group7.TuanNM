import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Users,
  UtensilsCrossed,
  BookOpen,
  BarChart3,
  LogOut,
  Leaf,
  Upload,
  UserCircle2,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import SharedModal from '../../components/admin/Modal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

import './UserManagement.css';

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface Family {
  id: number;
  name: string;
  housekeeperId?: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatarUrl?: string;
  emailVerified?: boolean;
  role?: Role;
  family?: Family;
}

interface FamilyMember {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  avatarUrl?: string;
  roleName?: string;
}

const UserManagement: React.FC = () => {
  const { logout } = useAuth();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Family members modal state
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const openFamilyModal = async (family: Family) => {
    setSelectedFamily(family);
    setLoadingMembers(true);
    try {
      const res = await api.get(`/api/v1/users/users/family/${family.id}/members`);
      setFamilyMembers(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setFamilyMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/api/v1/users/users');
      if (response.data?.success) {
        setUsers(response.data.data);
      } else {
        setUsers(response.data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Không tải được danh sách người dùng từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toString().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Tất cả' || user.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/v1/users/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa người dùng. Hãy chắc chắn rằng tài khoản này không bị ràng buộc dữ liệu khác.');
    }
  };

  const handleEditClick = (user: User) => {
    setViewUser(user);
    setEditData({ ...user });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        const payload = {
          fullName: editData.fullName,
          email: editData.email,
          phone: editData.phone,
          gender: editData.gender,
          role: editData.role
        };
        const response = await api.put(`/api/v1/users/users/${editData.id}`, payload);
        if (response.data?.success) {
          const updatedUser = response.data.data;
          setUsers(users.map(u => u.id === editData.id ? updatedUser : u));
          setViewUser(updatedUser);
          setIsEditing(false);
        }
      } catch (err) {
        console.error(err);
        alert('Cập nhật thông tin thất bại.');
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleName = formData.get('role') as string;
    
    const newUser = {
      fullName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      passwordHash: 'dummy_hash',
      role: {
        id: roleName === 'ADMIN' ? 1 : 2,
        name: roleName
      }
    };

    try {
      const response = await api.post('/api/v1/users/users', newUser);
      if (response.data?.success) {
        setUsers([response.data.data, ...users]);
        setAvatarPreview(null);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="um-layout">
      {/* Sidebar - Consistent with other Admin pages */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`um-sidebar ${isSidebarHovered ? "expanded" : "collapsed"}`}
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
          <SidebarLink icon={<Users size={22} />} label="Quản lý người dùng" to="/admin/users" isExpanded={isSidebarHovered} active />
          <SidebarLink icon={<UtensilsCrossed size={22} />} label="Quản lý thực phẩm" to="/admin/foods" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<BookOpen size={22} />} label="Quản lý món ăn" to="/admin/recipes" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<BarChart3 size={22} />} label="Quản lý hiệu suất" to="/admin/performance" isExpanded={isSidebarHovered} />
          <SidebarLink icon={<LogOut size={22} />} label="Đăng xuất" to="#" isExpanded={isSidebarHovered} onClick={logout} />
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
            <h1 className="um-title">Quản lý người dùng</h1>
            <p className="um-subtitle">Quản trị danh sách tài khoản toàn hệ thống</p>
          </div>
          <div className="um-header-right">
            <HeaderBtn icon={<Bell size={20} />} hasBadge />
            <HeaderBtn icon={<Settings size={20} />} />
          </div>
        </header>
      <Sidebar />

      <div className="um-main">
        {/* 🎯 SỬA ĐỔI: Bật tìm kiếm thông tin người dùng và ép tên hiển thị góc phải là ADMIN */}
        <Topbar 
          title="Quản lý người dùng" 
          searchPlaceholder="Tìm kiếm thông tin người dùng..."
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
            {errorMessage && <p className="error-message-text">{errorMessage}</p>}
            {isLoading ? (
              <p className="loading-display-text">Đang tải danh sách dữ liệu...</p>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="um-card">
                <div className="um-toolbar-sticky">
                  <div className="um-toolbar-controls">
                    <div className="um-role-badge filter-role-box">
                      <span className="filter-role-label">Vai trò:</span>
                      <select 
                        className="filter-role-select"
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option>Tất cả</option>
                        <option value="ADMIN">Người nội trợ</option>
                        <option value="CUSTOMER">Thành viên</option>
                      </select>
                    </div>
                  </div>
                  <button className="um-btn-primary un-shrinkable" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Thêm người dùng
                  </button>
                </div>

                <div className="table-overflow-box">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>Họ tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Gia đình</th>
                        <th style={{ textAlign: 'center' }}>Vai trò</th>
                        <th style={{ textAlign: 'center', width: '120px' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map(user => (
                        <tr key={user.id}>
                          <td className="user-id-cell">{user.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <UserCircle2 size={22} color="#94a3b8" />
                                )}
                              </div>
                              <span className="user-fullname-text">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="user-contact-text">{user.phone || 'N/A'}</td>
                          <td className="user-contact-text">{user.email}</td>
                          <td>
                            {user.family ? (
                              <div
                                onClick={() => openFamilyModal(user.family!)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  cursor: 'pointer',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '999px',
                                  background: '#F1FAF6',
                                  border: '1px solid #d1fae5',
                                  width: 'fit-content',
                                  transition: 'background 0.15s, box-shadow 0.15s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#dcfce7'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(109,212,180,0.25)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#F1FAF6'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                              >
                                <Home size={12} color="#6DD4B4" />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>{user.family.name}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Không có</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="text-center-flex">
                              <div className="um-role-badge">
                                {user.role?.name === 'ADMIN' ? 'Người nội trợ' : 'Thành viên'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="user-actions-row">
                              <ActionBtn 
                                icon={<Eye size={18} />} 
                                hoverColor="var(--fiza-primary)" 
                                onClick={() => handleEditClick(user)}
                              />
                              <ActionBtn 
                                icon={<Trash2 size={18} />} 
                                hoverColor="#ef4444" 
                                onClick={() => setDeleteConfirm(user.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="empty-user-row">
                            Không tìm thấy người dùng phù hợp
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-container-row">
                  <p className="pagination-bottom-info">
                    Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trên {totalItems} người dùng
                  </p>
                  <div className="pagination-buttons-wrap">
                    <PageArrow 
                      icon={<ChevronLeft size={18} />} 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <PageNum 
                        key={i + 1} 
                        active={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PageNum>
                    ))}
                    <PageArrow 
                      icon={<ChevronRight size={18} />} 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>

        <AnimatePresence mode="wait">
          {showAddModal && (
            <SharedModal title="Thêm người dùng mới" onClose={() => { setShowAddModal(false); setAvatarPreview(null); }}>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup label="Họ tên" name="name" placeholder="VD: Nguyễn Văn A" required />
                  <FormGroup label="Số điện thoại" name="phone" placeholder="090..." required />
                  <FormGroup label="Email" name="email" type="email" placeholder="email@example.com" required />
                  <div className="modal-select-wrapper">
                    <label className="modal-input-label">Vai trò</label>
                    <select name="role" className="um-search-input pl-1">
                      <option value="ADMIN">Người nội trợ</option>
                      <option value="CUSTOMER">Thành viên</option>
                    </select>
                  </div>
                  <div className="modal-select-wrapper">
                    <label className="modal-input-label">Giới tính</label>
                    <select name="gender" className="um-search-input pl-1">
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Ảnh đại diện</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #e2e8f0',
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        background: avatarPreview ? 'transparent' : '#f8fafc',
                        transition: 'border-color 0.2s, background 0.2s',
                        minHeight: '90px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--mint-green)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    >
                      {avatarPreview ? (
                        <>
                          <img src={avatarPreview} alt="preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--mint-green)' }} />
                          <span style={{ fontSize: '11px', color: '#6DD4B4', fontWeight: 700 }}>Nhấn để đổi ảnh</span>
                        </>
                      ) : (
                        <>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={18} color="#94a3b8" />
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Tải ảnh lên</span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, GIF (tối đa 2MB)</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="avatar"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => { setShowAddModal(false); setAvatarPreview(null); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <div className="modal-select-wrapper">
                    <label className="modal-input-label">Ảnh đại diện</label>
                    <input type="file" name="avatar" className="um-search-input pt-05 pl-1" accept="image/*" />
                  </div>
                </div>
                <div className="modal-footer-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel-round">Hủy</button>
                  <button type="submit" className="um-btn-primary">Lưu người dùng</button>
                </div>
              </form>
            </SharedModal>
          )}

          {viewUser && editData && (
            <SharedModal title={isEditing ? "Chỉnh sửa người dùng" : "Chi tiết người dùng"} onClose={() => { setViewUser(null); setIsEditing(false); }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#F1FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0' }}>
                  {viewUser.avatarUrl ? (
                    <img src={viewUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle2 size={64} color="#6DD4B4" />
                  )}
              <div className="detail-modal-layout">
                <div className="detail-avatar-container">
                  <img src={viewUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewUser.fullName}`} alt="" />
                </div>
                <div className="detail-fields-grid">
                  <DetailItem label="Mã người dùng" value={viewUser.id} readOnly />
                  {isEditing ? (
                    <>
                      <FormGroup 
                        label="Họ tên" 
                        value={editData.fullName} 
                        onChange={(e: any) => setEditData({ ...editData, fullName: e.target.value })} 
                      />
                      <div className="modal-select-wrapper">
                        <label className="modal-input-label">Vai trò</label>
                        <select 
                          className="um-search-input pl-1" 
                          value={editData.role?.name}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            role: { id: e.target.value === 'ADMIN' ? 1 : 2, name: e.target.value } 
                          })}
                        >
                          <option value="ADMIN">Người nội trợ</option>
                          <option value="CUSTOMER">Thành viên</option>
                        </select>
                      </div>
                      <div className="modal-select-wrapper">
                        <label className="modal-input-label">Giới tính</label>
                        <select 
                          className="um-search-input pl-1" 
                          value={editData.gender}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value as any })}
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <FormGroup 
                        label="Số điện thoại" 
                        value={editData.phone} 
                        onChange={(e: any) => setEditData({ ...editData, phone: e.target.value })} 
                      />
                      <FormGroup 
                        label="Email" 
                        value={editData.email} 
                        onChange={(e: any) => setEditData({ ...editData, email: e.target.value })} 
                      />
                    </>
                  ) : (
                    <>
                      <DetailItem label="Họ tên" value={viewUser.fullName} />
                      <DetailItem label="Vai trò" value={viewUser.role?.name === 'ADMIN' ? 'Người nội trợ' : 'Thành viên'} isBadge />
                      <DetailItem label="Giới tính" value={viewUser.gender === 'MALE' ? 'Nam' : viewUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'} />
                      <DetailItem label="Số điện thoại" value={viewUser.phone} />
                      <DetailItem label="Email" value={viewUser.email} />
                      <DetailItem label="Gia đình" value={viewUser.family?.name || 'Không có'} />
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer-actions mt-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn-cancel-round">Hủy</button>
                    <button onClick={handleSaveEdit} className="um-btn-primary">Lưu thay đổi</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="um-btn-primary">Chỉnh sửa thông tin</button>
                )}
              </div>
            </SharedModal>
          )}

          {deleteConfirm && (
            <SharedModal title="Xác nhận xóa" onClose={() => setDeleteConfirm(null)} width="400px">
              <div className="text-center">
                <div className="delete-warning-icon">
                  <Trash2 size={32} />
                </div>
                <p className="delete-title-text">Bạn có chắc chắn muốn xóa?</p>
                <p className="delete-subtitle-text">Hành động này không thể hoàn tác.</p>
                <div className="modal-buttons-flex gap-1">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-cancel-round flex-1">Hủy</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="btn-execute-delete">Xóa ngay</button>
                </div>
              </div>
            </SharedModal>
          )}

          {/* FAMILY MEMBERS MODAL */}
          {selectedFamily && (
            <SharedModal
              title=""
              onClose={() => { setSelectedFamily(null); setFamilyMembers([]); }}
              width="760px"
            >
              {/* Custom header */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #6DD4B4, #3BA89A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={18} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{selectedFamily.name}</h2>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                      {loadingMembers ? 'Đang tải...' : `${familyMembers.length} thành viên`}
                    </p>
                  </div>
                </div>
              </div>

              {loadingMembers ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6DD4B4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 600 }}>Đang tải danh sách thành viên...</p>
                </div>
              ) : familyMembers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <UserCircle2 size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600 }}>Gia đình chưa có thành viên nào</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>ID</th>
                        <th>Họ tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th style={{ textAlign: 'center' }}>Vai trò</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyMembers.map(member => (
                        <tr
                          key={member.id}
                          style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                          onClick={() => {
                            const asUser: User = {
                              id: member.id,
                              fullName: member.fullName,
                              email: member.email,
                              phone: member.phone,
                              gender: member.gender as any,
                              avatarUrl: member.avatarUrl,
                              role: { id: member.roleName === 'ADMIN' ? 1 : 2, name: member.roleName || 'CUSTOMER' },
                              family: selectedFamily,
                            };
                            setViewUser(asUser);
                            setEditData(asUser);
                            setIsEditing(false);
                            setSelectedFamily(null);
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <td style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.875rem' }}>{member.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                                {member.avatarUrl ? (
                                  <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <UserCircle2 size={20} color="#94a3b8" />
                                )}
                              </div>
                              <span style={{ fontWeight: 700, color: '#1e293b' }}>{member.fullName}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{member.phone || 'N/A'}</td>
                          <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{member.email}</td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <div className="um-role-badge">
                                {member.roleName === 'ADMIN' ? 'Người nội trợ' : 'Thành viên'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>
                    Nhấn vào một thành viên để xem chi tiết
                  </p>
                </div>
              )}
            </SharedModal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function FormGroup({ label, ...props }: any) {
  return (
    <div className="input-field-stack">
      <label className="modal-input-label">{label}</label>
      <input {...props} className="um-search-input pl-1" />
    </div>
  );
}

function DetailItem({ label, value, isBadge }: any) {
  return (
    <div className="detail-item-stack">
      <span className="detail-label-sm">{label}</span>
      {isBadge ? (
        <span className="um-role-badge self-start">{value}</span>
      ) : (
        <span className="detail-value-bold">{value || 'N/A'}</span>
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
      className="table-action-round-btn"
    >
      {icon}
    </button>
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
    <button disabled={disabled} onClick={onClick} className="pagination-arrow-round-btn">{icon}</button>
  );
}

function SidebarLink({ icon, label, to, isExpanded, active, onClick }: any) {
  return (
    <NavLink to={to} onClick={onClick} className={`um-nav-item ${active ? 'active' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
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

export default UserManagement;