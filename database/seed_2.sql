-- ==========================================
-- SEED_2: DỮ LIỆU THÔNG BÁO MẪU (notifications)
-- Chạy sau seed_1.sql và sau khi đã tạo bảng notifications (db.sql)
-- ==========================================

BEGIN;

-- Đảm bảo bảng tồn tại (chạy lại an toàn)
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(30)  NOT NULL CHECK (category IN ('FRIDGE','SHOPPING','MEAL','GROUP','SYSTEM')),
    severity    VARCHAR(20)  NOT NULL DEFAULT 'NORMAL' CHECK (severity IN ('INFO','NORMAL','MEDIUM','HIGH')),
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- ==========================================
-- GIA ĐÌNH AN AN
-- Users: lan.nguyen (housekeeper), minh.nguyen, anh.nguyen, binh.nguyen
-- ==========================================

-- 1. Nguyễn Thị Lan (housekeeper) — nhận nhiều thông báo quản lý
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Tủ lạnh: cảnh báo hết hạn (HIGH)
((SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
 'FRIDGE', 'HIGH',
 '⚠️ Thực phẩm sắp hết hạn',
 'Rau muống (hạn 07/06), Cải thìa sẽ hết hạn trong 1–2 ngày. Hãy sử dụng hoặc chế biến sớm!',
 FALSE, NOW() - INTERVAL '10 minutes'),

-- Nhóm gia đình: thành viên chấp nhận lời mời (NORMAL)
((SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
 'GROUP', 'NORMAL',
 '🎉 Thành viên mới gia nhập',
 'Nguyễn Gia Bình đã chấp nhận lời mời và gia nhập Gia đình An An.',
 FALSE, NOW() - INTERVAL '2 hours'),

-- Kế hoạch chợ: được phân công đi chợ (MEDIUM)
((SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
 'SHOPPING', 'MEDIUM',
 '🛒 Nhắc nhở kế hoạch đi chợ',
 'Danh sách mua sắm ngày 06/06 chưa hoàn thành. Còn 3 mục chưa mua: Cà rốt, Hành tím, Đậu phụ.',
 TRUE, NOW() - INTERVAL '1 day'),

-- Bữa ăn: bữa tối được xác nhận (NORMAL)
((SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
 'MEAL', 'NORMAL',
 '🍽️ Thực đơn bữa tối đã xác nhận',
 'Bữa tối ngày 08/06: Canh chua cá basa và Rau muống xào tỏi đã được xác nhận.',
 TRUE, NOW() - INTERVAL '2 days'),

-- Hệ thống (INFO)
((SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
 'SYSTEM', 'INFO',
 '📱 Chào mừng đến với MealMate!',
 'Hệ thống đã được cập nhật với nhiều tính năng mới: gợi ý công thức thông minh, cảnh báo hết hạn tự động và kế hoạch đi chợ theo tuần.',
 TRUE, NOW() - INTERVAL '7 days');

-- 2. Nguyễn Hoàng Minh (customer) — thành viên thường
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Tủ lạnh: ai đó thêm thực phẩm (NORMAL)
((SELECT id FROM users WHERE email = 'minh.nguyen@example.com'),
 'FRIDGE', 'NORMAL',
 '🧊 Tủ lạnh được cập nhật',
 'Nguyễn Thị Lan đã thêm "Thịt bò thăn" (0.8 kg) vào tủ lạnh.',
 FALSE, NOW() - INTERVAL '30 minutes'),

-- Kế hoạch chợ: được phân công đi chợ (MEDIUM)
((SELECT id FROM users WHERE email = 'minh.nguyen@example.com'),
 'SHOPPING', 'MEDIUM',
 '🛒 Bạn được phân công đi chợ',
 'Nguyễn Thị Lan đã giao nhiệm vụ đi chợ cho bạn vào ngày 09/06. Xem danh sách mua sắm để chuẩn bị!',
 FALSE, NOW() - INTERVAL '3 hours'),

-- Nhóm gia đình: nhận lời mời trước đó đã được chấp nhận (INFO)
((SELECT id FROM users WHERE email = 'minh.nguyen@example.com'),
 'GROUP', 'INFO',
 '🏠 Bạn đã gia nhập nhóm gia đình',
 'Chào mừng bạn đến với Gia đình An An! Bạn có thể xem tủ lạnh, kế hoạch đi chợ và thực đơn của gia đình.',
 TRUE, NOW() - INTERVAL '5 days'),

-- Tủ lạnh: cảnh báo hết hạn (HIGH)
((SELECT id FROM users WHERE email = 'minh.nguyen@example.com'),
 'FRIDGE', 'HIGH',
 '⚠️ Chuối đã hết hạn trong tủ',
 'Chuối (thêm ngày 29/05) đã quá hạn sử dụng từ ngày 03/06. Hãy kiểm tra và loại bỏ nếu cần.',
 TRUE, NOW() - INTERVAL '4 days');

-- 3. Nguyễn Khánh An (customer)
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Tủ lạnh: ai đó lấy thực phẩm ra (NORMAL)
((SELECT id FROM users WHERE email = 'anh.nguyen@example.com'),
 'FRIDGE', 'NORMAL',
 '🗑️ Thực phẩm được lấy ra khỏi tủ',
 'Nguyễn Hoàng Minh đã lấy "Ức gà" ra khỏi tủ lạnh (dùng để nấu cháo).',
 FALSE, NOW() - INTERVAL '1 hour'),

-- Kế hoạch đi chợ: hoàn thành (NORMAL)
((SELECT id FROM users WHERE email = 'anh.nguyen@example.com'),
 'SHOPPING', 'NORMAL',
 '✅ Đi chợ hoàn thành',
 'Nguyễn Thị Lan đã đánh dấu hoàn thành kế hoạch mua sắm ngày 06/06. Tất cả 8 mục đã được mua.',
 FALSE, NOW() - INTERVAL '6 hours'),

-- Bữa ăn: kế hoạch bữa ăn thay đổi (NORMAL)
((SELECT id FROM users WHERE email = 'anh.nguyen@example.com'),
 'MEAL', 'NORMAL',
 '🍜 Bữa sáng ngày mai được cập nhật',
 'Bữa sáng 09/06 đã thay đổi từ "Cháo gà" sang "Phở bò gia đình" do ý kiến của các thành viên.',
 TRUE, NOW() - INTERVAL '1 day');

-- 4. Nguyễn Gia Bình (customer) — bị kick rồi được mời lại (ví dụ scenario)
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Nhóm: nhận lời mời vào nhóm (INFO)
((SELECT id FROM users WHERE email = 'binh.nguyen@example.com'),
 'GROUP', 'INFO',
 '🏠 Bạn nhận được lời mời',
 'Nguyễn Thị Lan mời bạn gia nhập "Gia đình An An". Hãy mở ứng dụng để phản hồi lời mời!',
 TRUE, NOW() - INTERVAL '6 days'),

-- Nhóm: đã chấp nhận thành công (NORMAL)
((SELECT id FROM users WHERE email = 'binh.nguyen@example.com'),
 'GROUP', 'NORMAL',
 '🎉 Đã gia nhập nhóm thành công',
 'Bạn đã gia nhập Gia đình An An. Chào mừng bạn cùng chia sẻ quản lý tủ lạnh và kế hoạch ăn uống!',
 TRUE, NOW() - INTERVAL '5 days'),

-- Tủ lạnh: thông báo từ gia đình (NORMAL)
((SELECT id FROM users WHERE email = 'binh.nguyen@example.com'),
 'FRIDGE', 'NORMAL',
 '🧊 Tủ lạnh được cập nhật',
 'Nguyễn Thị Lan đã thêm "Sữa chua" (8 hộp) vào tủ lạnh ngăn mát.',
 FALSE, NOW() - INTERVAL '2 hours');

-- ==========================================
-- GIA ĐÌNH TRẦN SUM VẦY
-- Users: huong.tran (housekeeper), khoa.tran, mai.tran
-- ==========================================

-- 5. Trần Thu Hương (housekeeper)
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Tủ lạnh: sắp hết hạn (HIGH)
((SELECT id FROM users WHERE email = 'huong.tran@example.com'),
 'FRIDGE', 'HIGH',
 '⚠️ Thực phẩm sắp hết hạn',
 'Cải thìa (hạn 08/06) và Xoài (hạn 09/06) sắp hết hạn. Ưu tiên nấu trong hôm nay!',
 FALSE, NOW() - INTERVAL '15 minutes'),

-- Kế hoạch chợ: phân công thành viên (MEDIUM)
((SELECT id FROM users WHERE email = 'huong.tran@example.com'),
 'SHOPPING', 'MEDIUM',
 '🛒 Kế hoạch chợ cuối tuần',
 'Danh sách mua sắm ngày 07/06 đã được tạo với 12 mục. Trần Minh Khoa được phân công đi chợ.',
 FALSE, NOW() - INTERVAL '4 hours'),

-- Nhóm: thành viên rời nhóm (MEDIUM)
((SELECT id FROM users WHERE email = 'huong.tran@example.com'),
 'GROUP', 'MEDIUM',
 '👋 Thành viên rời khỏi nhóm',
 'Một thành viên vừa rời khỏi Gia đình Trần Sum Vầy. Kiểm tra lại phân công công việc trong gia đình.',
 TRUE, NOW() - INTERVAL '3 days'),

-- Bữa ăn: thực đơn tuần mới (INFO)
((SELECT id FROM users WHERE email = 'huong.tran@example.com'),
 'MEAL', 'INFO',
 '📅 Thực đơn tuần 08–14/06 đã tạo',
 'Thực đơn mới cho 3 bữa/ngày trong tuần 08–14/06 đã sẵn sàng. Công thức gợi ý dựa trên nguyên liệu trong tủ.',
 TRUE, NOW() - INTERVAL '2 days');

-- 6. Trần Minh Khoa (customer)
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Kế hoạch chợ: được phân công đi chợ (MEDIUM)
((SELECT id FROM users WHERE email = 'khoa.tran@example.com'),
 'SHOPPING', 'MEDIUM',
 '🛒 Bạn được phân công đi chợ',
 'Trần Thu Hương đã giao nhiệm vụ đi chợ cho bạn vào thứ Bảy 07/06. Danh sách có 12 mục cần mua.',
 FALSE, NOW() - INTERVAL '4 hours'),

-- Tủ lạnh: ai đó thêm thực phẩm (NORMAL)
((SELECT id FROM users WHERE email = 'khoa.tran@example.com'),
 'FRIDGE', 'NORMAL',
 '🧊 Tủ lạnh được cập nhật',
 'Trần Thu Hương đã thêm "Tôm sú" (0.9 kg) và "Mực ống" (0.6 kg) vào ngăn đông.',
 TRUE, NOW() - INTERVAL '2 days'),

-- Kế hoạch đi chợ: lần trước đã hoàn thành (NORMAL)
((SELECT id FROM users WHERE email = 'khoa.tran@example.com'),
 'SHOPPING', 'NORMAL',
 '✅ Đã hoàn thành kế hoạch đi chợ',
 'Kế hoạch đi chợ ngày 31/05 đã hoàn thành. Cảm ơn bạn đã mua đủ 7/7 mục trong danh sách!',
 TRUE, NOW() - INTERVAL '7 days');

-- 7. Trần Ngọc Mai (customer)
INSERT INTO notifications (user_id, category, severity, title, body, is_read, created_at) VALUES

-- Tủ lạnh: cảnh báo hết hạn (HIGH)
((SELECT id FROM users WHERE email = 'mai.tran@example.com'),
 'FRIDGE', 'HIGH',
 '⚠️ Sữa tươi sắp hết hạn',
 'Sữa tươi không đường (hạn 12/06) còn 5 ngày. Hãy dùng hoặc làm sinh tố trước khi hết hạn.',
 FALSE, NOW() - INTERVAL '20 minutes'),

-- Bữa ăn: gợi ý công thức từ tủ lạnh (INFO)
((SELECT id FROM users WHERE email = 'mai.tran@example.com'),
 'MEAL', 'INFO',
 '💡 Gợi ý món từ tủ lạnh',
 'Bạn có Bí đỏ và Sườn non — hệ thống gợi ý: Canh bí đỏ sườn non (94% nguyên liệu khớp)!',
 FALSE, NOW() - INTERVAL '1 hour'),

-- Nhóm: housekeeper cập nhật tên nhóm (NORMAL)
((SELECT id FROM users WHERE email = 'mai.tran@example.com'),
 'GROUP', 'NORMAL',
 '🏠 Thông tin nhóm được cập nhật',
 'Trần Thu Hương đã cập nhật tên nhóm gia đình. Kiểm tra trang Nhóm gia đình để xem thay đổi.',
 TRUE, NOW() - INTERVAL '4 days');

COMMIT;
