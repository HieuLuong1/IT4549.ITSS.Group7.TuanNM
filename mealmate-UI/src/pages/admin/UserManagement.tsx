import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SharedModal from '../../components/admin/Modal';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

import './UserManagement.css';

interface Role {
  id: number;
  name: string;
  description?: string;
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
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="um-layout">
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
                        <th className="w-80">ID</th>
                        <th>Họ tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th className="text-center">Vai trò</th>
                        <th className="text-center w-120">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map(user => (
                        <tr key={user.id}>
                          <td className="user-id-cell">{user.id}</td>
                          <td>
                            <div className="user-profile-flex">
                              <div className="user-avatar-circle">
                                <img 
                                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} 
                                  alt="" 
                                />
                              </div>
                              <span className="user-fullname-text">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="user-contact-text">{user.phone || 'N/A'}</td>
                          <td className="user-contact-text">{user.email}</td>
                          <td>
                            <div className="text-center-flex">
                              <div className="um-role-badge">
                                {user.role?.name === 'ADMIN' ? 'Người nội trợ (Admin)' : 'Thành viên'}
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
            <SharedModal title="Thêm người dùng mới" onClose={() => setShowAddModal(false)}>
              <form onSubmit={handleAddUser} className="modal-form-flex">
                <div className="modal-grid-inputs">
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
                          <option value="ADMIN">Người nội trợ (Admin)</option>
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
                      <DetailItem label="Vai trò" value={viewUser.role?.name === 'ADMIN' ? 'Người nội trợ (Admin)' : 'Thành viên'} isBadge />
                      <DetailItem label="Giới tính" value={viewUser.gender === 'MALE' ? 'Nam' : viewUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'} />
                      <DetailItem label="Số điện thoại" value={viewUser.phone} />
                      <DetailItem label="Email" value={viewUser.email} />
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

export default UserManagement;