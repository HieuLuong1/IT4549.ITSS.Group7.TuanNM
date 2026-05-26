import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FamilyGroup.css';

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import DeleteMember from "./DeleteMember"; 

import iconEdit from "@/assets/icon/Icon-edit-eye.svg";  
import iconDelete from "@/assets/icon/Icon-delete.svg";

interface MemberType {
  id: number;
  fullName: string;
  roleName: string; 
  avatarClass: string; 
}

const FamilyGroup: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [familyName, setFamilyName] = useState<string>("Đang tải...");
  
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [isHousekeeper, setIsHousekeeper] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [members, setMembers] = useState<MemberType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMemberName, setSelectedMemberName] = useState<string>("");

  const avatarColors = ["avatar-orange", "avatar-peach", "avatar-teal", "avatar-blue", "avatar-purple"];

  // 🎯 SỬA DỨT ĐIỂM: Chuyển sang dùng async/await độc lập để chống nuốt log và crash luồng
  useEffect(() => {
    const loadFamilyData = async () => {
      const token = localStorage.getItem("accessToken");
      const authUserString = localStorage.getItem("authUser");
      
      let currentUserId: number | null = null;

      // 1. Lấy ID an toàn, lỗi ở đây không làm chết luồng API bên dưới
      if (authUserString) {
        try {
          const parsedUser = JSON.parse(authUserString);
          const rawId = parsedUser.userId || parsedUser.id;
          if (rawId) currentUserId = Number(rawId);
          console.log("👉 [LOG] ID từ LocalStorage:", currentUserId);
        } catch (e) {
          console.error("❌ Lỗi đọc localStorage:", e);
        }
      }

      // 2. Gọi API lấy thông tin nhóm gia đình hiện tại
      try {
        const resGroup = await axios.get('http://localhost:8080/api/v1/users/familys/current', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("👉 [LOG] API Nhóm Gia Đình trả về:", resGroup.data);
        
        const groupData = resGroup.data.success ? resGroup.data.data : resGroup.data;
        
        if (groupData) {
          const cleanName = String(groupData.name || "Gia đình Fiza").trim();
          setFamilyName(cleanName);
          setEditName(cleanName);
          setFamilyId(groupData.id);

          // Quét sạch mã ID chủ nhà từ Backend
          const dbHousekeeperId = groupData.housekeeperId || groupData.ownerId || groupData.createdBy || (groupData.housekeeper && groupData.housekeeper.id);
          console.log("👉 [LOG] Đối chiếu ID:", currentUserId, "với Chủ nhà DB:", dbHousekeeperId);

          // Kiểm tra quyền: ID người dùng trùng khớp với ID chủ nhà thì mở khóa
          if (currentUserId && dbHousekeeperId && Number(currentUserId) === Number(dbHousekeeperId)) {
            console.log("➔ MỞ KHÓA: Bạn là chủ nhà!");
            setIsHousekeeper(true);
          } else {
            console.log("➔ KHÓA: Bạn là thành viên thường!");
            setIsHousekeeper(false);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi API luồng A (Chi tiết nhóm):", err);
        setFamilyName("Gia đình Fiza");
        setEditName("Gia đình Fiza");
      }

      // 3. Gọi API lấy danh sách thành viên trong nhà
      try {
        const resMembers = await axios.get('http://localhost:8080/api/v1/users/users/family/members', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("👉 [LOG] API Thành Viên trả về:", resMembers.data);

        const dbMembers = resMembers.data.success ? resMembers.data.data : resMembers.data;

        if (Array.isArray(dbMembers)) {
          const formattedMembers = dbMembers.map((m: any, index: number) => {
            const isOwner = m.role && (m.role.name === "HOUSEKEEPER" || m.role.id === 3 || m.roleId === 3);
            return {
              id: m.id,
              fullName: m.fullName || "Thành viên ẩn danh",
              roleName: isOwner ? "Chủ nhà" : "Thành viên",
              avatarClass: avatarColors[index % avatarColors.length]
            };
          });
          setMembers(formattedMembers);
        }
      } catch (err) {
        console.error("❌ Lỗi API luồng B (Danh sách thành viên):", err);
      }
    };

    loadFamilyData();
  }, []);

  const handleUpdateName = () => {
    const cleanedName = editName.trim();
    if (!familyId || !cleanedName || cleanedName === familyName.trim()) {
      setEditName(familyName);
      return;
    }

    const token = localStorage.getItem("accessToken");
    axios.put(`http://localhost:8080/api/v1/users/familys/${familyId}`, 
      { id: familyId, name: cleanedName },
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(() => {
      setFamilyName(cleanedName);
      setEditName(cleanedName);
      alert("🎉 Đã cập nhật tên nhóm thành công!");
    })
    .catch(error => {
      alert(`Backend từ chối lưu! Lỗi HTTP: ${error.response?.status}`);
      setEditName(familyName);
    });
  };

  const filteredMembers = members
    .filter(member => member.fullName.toLowerCase().includes(keyword.toLowerCase()))
    .sort((a, b) => a.id - b.id);

  return (
    <div className="my-fridge-layout">
      <Sidebar />
      <div className="my-fridge-page">
        <Topbar 
          title="Nhóm gia đình" 
          searchPlaceholder="Tìm kiếm thành viên..."
          searchValue={keyword}
          onSearchChange={(value) => setKeyword(value)}
          familyName={familyName} 
        />

        <div className="family-group-main-wrapper">
          <div className="info-bar">
            <div className="info-bar-left">
              <div className="info-item-flex">
                <div className="info-label-box-wide">
                  <div className="info-label">TÊN NHÓM:</div>
                </div>
                
                <div className="info-value-name-box">
                  <input
                    type="text"
                    className="info-value-name-input-blank"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    
                    // 🎯 THAY ĐỔI ĐỂ TEST: Nếu vẫn dính cấm, đổi thẳng thành disabled={false} để gõ chữ thoải mái
                    disabled={!isHousekeeper} 
                    
                    onBlur={handleUpdateName} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName(); 
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      width: '100%',
                      outline: 'none',
                      cursor: isHousekeeper ? 'text' : 'not-allowed',
                      pointerEvents: 'auto'
                    }}
                  />
                </div>
              </div>
              
              <div className="info-item-flex">
                <div className="info-label-box">
                  <div className="info-label">MÃ NHÓM:</div>
                </div>
                <div className="info-value-code-box">
                  <div className="info-value-code-text" style={{ userSelect: 'all', fontWeight: 'bold' }}>
                    {familyId ? `FZ-${String(familyId).padStart(2, '0')}` : "Đang tải..."}
                  </div>
                </div>
              </div>
            </div>
            
            <button className="btn-add-member" onClick={() => alert('Chức năng thêm thành viên')}>
              <div className="btn-shadow" />
              <div className="btn-text">Thêm thành viên</div>
            </button>
          </div>

          <div className="table-wrapper">
            <div className="table-card">
              <div className="table-content">
                <div className="table-header-row">
                  <div className="th-id"><div className="th-text">MÃ ID</div></div>
                  <div className="th-member"><div className="th-text">THÀNH VIÊN</div></div>
                  <div className="th-role"><div className="th-text">VAI TRÒ</div></div>
                  <div className="th-action"><div className="th-text-right">HÀNH ĐỘNG</div></div>
                </div>

                <div className="table-body">
                  {filteredMembers.map((member, index) => {
                    const showDeleteButton = isHousekeeper 
                      ? member.roleName !== "Chủ nhà" 
                      : member.roleName !== "Chủ nhà";

                    return (
                      <div className={index === 0 ? "table-row" : "table-row-bordered"} key={member.id}>
                        <div className="td-id"><div className="td-id-text">#{member.id}</div></div>
                        <div className="td-member-info">
                          <div className={`avatar-wrapper ${member.avatarClass}`}>
                            <span className="avatar-text-placeholder">{member.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="member-name-box"><div className="member-name">{member.fullName}</div></div>
                        </div>
                        <div className="td-role">
                          <div className={member.roleName === "Chủ nhà" ? "role-badge-admin" : "role-badge-member"}>
                            <div className={member.roleName === "Chủ nhà" ? "role-text-admin" : "role-text-member"}>{member.roleName}</div>
                          </div>
                        </div>
                        <div className="td-actions">
                          <button className="action-btn-circle" title="Sửa">
                            <img src={iconEdit} alt="Sửa" className="action-icon-img" />
                          </button>
                          {showDeleteButton && (
                            <button 
                              className="action-btn-circle btn-delete" 
                              onClick={() => {
                                setSelectedMemberName(member.fullName);
                                setIsModalOpen(true);
                              }}
                            >
                              <img src={iconDelete} alt="Xóa" className="action-icon-img" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteMember
        isOpen={isModalOpen}
        memberName={isHousekeeper ? selectedMemberName : "bản thân"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FamilyGroup;
