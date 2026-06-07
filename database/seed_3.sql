-- ==========================================
-- SEED_3: BỔ SUNG NGUYÊN LIỆU TỦ LẠNH & CÔNG THỨC
-- Mục tiêu: tạo nhiều công thức có % khớp cao (60% - 100%) cho
--           "Gia đình An An" để màn hình Trợ lý nhà bếp (Gợi ý món ăn)
--           có top 3 phong phú và nhiều món tận dụng đồ sắp hết hạn.
--
-- Chạy SAU db.sql và seed_1.sql.
-- Ngày tham chiếu của hệ thống demo: 2026-06-07.
--   - Nguyên liệu "sắp hết hạn" (trong 3 ngày): 2026-06-08 .. 2026-06-10
--
-- File an toàn khi chạy lại: tự dọn dữ liệu seed_3 cũ trước khi chèn.
-- ==========================================

BEGIN;

-- ------------------------------------------
-- 0. DỌN DỮ LIỆU SEED_3 CŨ (nếu chạy lại)
-- ------------------------------------------
DELETE FROM recipe_ingredients
WHERE recipe_id IN (SELECT id FROM recipes WHERE author = 'Trợ lý nhà bếp');

DELETE FROM user_favorite_recipes
WHERE recipe_id IN (SELECT id FROM recipes WHERE author = 'Trợ lý nhà bếp');

DELETE FROM meal_items
WHERE recipe_id IN (SELECT id FROM recipes WHERE author = 'Trợ lý nhà bếp');

DELETE FROM recipes WHERE author = 'Trợ lý nhà bếp';

DELETE FROM fridge_items
WHERE family_id = (SELECT id FROM families WHERE name = 'Gia đình An An')
  AND note LIKE '[seed_3]%';

-- ------------------------------------------
-- 1. BỔ SUNG NGUYÊN LIỆU CHO TỦ LẠNH "GIA ĐÌNH AN AN"
--    (một số đặt hạn sử dụng rất gần để minh hoạ "tận dụng đồ sắp hết hạn")
-- ------------------------------------------
INSERT INTO fridge_items (family_id, food_id, quantity, storage_location, specific_location, added_date, expiry_date, status, note) VALUES
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Tỏi'),                     200, 'DRY',     'TOP_SHELF',        '2026-06-01', '2026-09-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Đường'),                   500, 'DRY',     'TOP_SHELF',        '2026-06-01', '2027-06-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Tiêu xay'),                100, 'DRY',     'TOP_SHELF',        '2026-06-01', '2027-06-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Hạt nêm'),                 400, 'DRY',     'TOP_SHELF',        '2026-06-01', '2027-06-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Dầu ăn'),                 1000, 'DRY',     'TOP_SHELF',        '2026-06-01', '2027-06-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Muối'),                    500, 'DRY',     'TOP_SHELF',        '2026-06-01', '2028-06-01', 'STORED', '[seed_3] Gia vị cơ bản'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Gừng'),                    150, 'COOL',    'VEGETABLE_DRAWER', '2026-06-02', '2026-06-22', 'STORED', '[seed_3] Dùng kho, rang'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Cà rốt'),                  0.6, 'COOL',    'VEGETABLE_DRAWER', '2026-06-04', '2026-06-18', 'STORED', '[seed_3] Củ tươi'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Đùi gà'),                  1.2, 'FREEZER', 'TOP_SHELF',        '2026-06-03', '2026-06-28', 'STORED', '[seed_3] Chia 2 phần'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Sườn non heo'),           1.0, 'FREEZER', 'MIDDLE_SHELF',     '2026-06-03', '2026-07-02', 'STORED', '[seed_3] Kho hoặc xào'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Thịt nạc vai heo'),       0.8, 'FREEZER', 'MIDDLE_SHELF',     '2026-06-03', '2026-07-01', 'STORED', '[seed_3] Băm hoặc thái'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Mực ống'),                0.6, 'FREEZER', 'BOTTOM_SHELF',     '2026-06-03', '2026-06-24', 'STORED', '[seed_3] Làm sạch sẵn'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Bánh phở khô'),           500, 'DRY',     'MIDDLE_SHELF',     '2026-05-20', '2026-11-20', 'STORED', '[seed_3] Để xào hoặc nấu'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Sữa tươi không đường'),   1.5, 'COOL',    'DOOR_SHELF',       '2026-06-02', '2026-06-14', 'STORED', '[seed_3] Pha sinh tố'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Trứng vịt'),                8, 'COOL',    'DOOR_SHELF',       '2026-06-02', '2026-06-20', 'STORED', '[seed_3] Để kho'),
-- Nhóm SẮP HẾT HẠN (trong 3 ngày tới) để minh hoạ tính năng tận dụng:
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Nấm rơm'),                300, 'COOL',    'VEGETABLE_DRAWER', '2026-06-05', '2026-06-08', 'STORED', '[seed_3] Sắp hết hạn - nên dùng sớm'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Bí đỏ'),                   1.5, 'COOL',    'BOTTOM_SHELF',     '2026-06-04', '2026-06-09', 'STORED', '[seed_3] Sắp hết hạn - nên dùng sớm'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Cải thìa'),               0.8, 'COOL',    'VEGETABLE_DRAWER', '2026-06-05', '2026-06-09', 'STORED', '[seed_3] Sắp hết hạn - nên dùng sớm'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Tôm sú'),                 0.8, 'COOL',    'MIDDLE_SHELF',     '2026-06-06', '2026-06-10', 'STORED', '[seed_3] Sắp hết hạn - nên dùng sớm'),
((SELECT id FROM families WHERE name = 'Gia đình An An'), (SELECT id FROM foods WHERE name = 'Xoài'),                   1.0, 'COOL',    'BOTTOM_SHELF',     '2026-06-05', '2026-06-10', 'STORED', '[seed_3] Sắp hết hạn - làm sinh tố');

-- ------------------------------------------
-- 2. CÔNG THỨC MỚI (author = 'Trợ lý nhà bếp')
--    Thiết kế để khớp 60%-100% với tủ lạnh An An ở trên.
-- ------------------------------------------
INSERT INTO recipes (name, description, instructions, cooking_time_minutes, servings, calories, difficulty, reference_link, author, preferred_meal_time, image_url) VALUES
('Trứng chiên cà chua', 'Món trứng mềm hoà quyện cà chua chua dịu, nhanh gọn cho bữa sáng.', 'Đánh tan trứng với chút hạt nêm. Phi thơm rồi cho cà chua xào mềm, đổ trứng vào đảo nhanh tới khi chín tới.', 15, 3, 240, 'EASY', NULL, 'Trợ lý nhà bếp', 'BREAKFAST', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir-fried_tomato_and_scrambled_eggs.jpg'),
('Thịt ba chỉ rang cháy cạnh', 'Thịt ba chỉ rang vàng cạnh, mặn ngọt đậm đà, cực đưa cơm.', 'Thái thịt miếng vừa, rang cho ra bớt mỡ và vàng cạnh. Nêm nước mắm, đường, tỏi, tiêu rồi rim tới khi áo đều.', 35, 4, 560, 'MEDIUM', NULL, 'Trợ lý nhà bếp', 'LUNCH', 'https://commons.wikimedia.org/wiki/Special:FilePath/Thit_kho.jpg'),
('Canh cải thìa nấu tôm', 'Canh thanh mát với cải thìa giòn và tôm ngọt, tận dụng đồ sắp hết hạn.', 'Phi thơm chút hành, cho tôm vào xào săn. Thêm nước, nêm hạt nêm và muối, cuối cùng cho cải thìa vào nấu vừa chín.', 20, 4, 180, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bok_choy_soup.jpg'),
('Bò xào tỏi', 'Thịt bò mềm thơm lừng mùi tỏi, xào nhanh giữ độ ngọt.', 'Ướp bò với chút dầu, tiêu và hạt nêm. Phi tỏi thật thơm rồi cho bò vào xào lửa lớn thật nhanh.', 20, 4, 420, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir_fried_beef.jpg'),
('Đùi gà chiên nước mắm', 'Đùi gà giòn rụm phủ nước mắm tỏi đường bóng đẹp.', 'Chiên đùi gà vàng giòn. Thắng nước mắm với đường và tỏi tới khi sánh, rồi áo đều lên gà.', 40, 4, 520, 'MEDIUM', NULL, 'Trợ lý nhà bếp', 'LUNCH', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried_chicken_legs.jpg'),
('Cá basa kho tộ', 'Cá basa kho nước hàng đậm đà, thơm tiêu, ăn với cơm nóng rất ngon.', 'Ướp cá với nước mắm, đường, tiêu. Kho lửa nhỏ tới khi nước kho sánh và cá thấm đều.', 45, 4, 380, 'MEDIUM', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/C%C3%A1_kho_t%E1%BB%99.JPG'),
('Nấm rơm xào tỏi', 'Nấm rơm giòn ngọt xào tỏi thơm, tận dụng nấm sắp hết hạn.', 'Phi thơm tỏi với dầu ăn, cho nấm rơm vào xào lửa lớn, nêm hạt nêm vừa ăn.', 15, 3, 150, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir-fried_mushrooms.jpg'),
('Gà kho gừng', 'Đùi gà kho gừng cay ấm, nước kho đậm đà cho ngày se lạnh.', 'Ướp gà với gừng, nước mắm, đường, tiêu. Kho lửa nhỏ tới khi gà mềm và ngấm vị.', 40, 4, 480, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ga_kho_gung.jpg'),
('Sườn xào chua ngọt', 'Sườn non xào chua ngọt với cà chua và dứa, màu sắc bắt mắt.', 'Chiên sơ sườn. Xào cà chua và dứa, thêm nước mắm, đường rồi cho sườn vào rim tới khi sốt sánh.', 50, 4, 600, 'MEDIUM', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sweet_and_sour_pork_ribs.jpg'),
('Mực xào dứa', 'Mực giòn ngọt xào cùng dứa và cà chua, vị chua ngọt hài hoà.', 'Xào tỏi thơm, cho mực đảo nhanh. Thêm dứa, cà chua và nêm vừa ăn, đảo đều tới chín tới.', 25, 4, 320, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir_fried_squid.jpg'),
('Salad xoài sữa chua', 'Món tráng miệng mát lạnh, xoài chín trộn sữa chua, tận dụng xoài sắp hết hạn.', 'Cắt xoài và dưa hấu miếng vừa, trộn nhẹ với sữa chua và chút đường, dùng lạnh.', 15, 3, 220, 'EASY', NULL, 'Trợ lý nhà bếp', 'BREAKFAST', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fruit_salad_with_yogurt.jpg'),
('Bún xào thập cẩm', 'Bún xào cùng thịt, cải thìa và cà rốt, nhanh gọn đủ chất.', 'Trụng bún. Xào thịt nạc vai với tỏi, thêm cà rốt và cải thìa, cho bún vào đảo đều, nêm nước mắm.', 30, 4, 470, 'MEDIUM', NULL, 'Trợ lý nhà bếp', 'LUNCH', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir_fried_noodles.jpg'),
('Canh nghêu cà chua', 'Canh nghêu ngọt nước, cà chua thanh nhẹ, dễ nấu cho bữa tối.', 'Phi tỏi thơm, cho cà chua xào mềm. Thêm nước và nghêu, nêm hạt nêm, muối, nấu tới khi nghêu mở miệng.', 25, 4, 200, 'EASY', NULL, 'Trợ lý nhà bếp', 'DINNER', 'https://commons.wikimedia.org/wiki/Special:FilePath/Clam_soup.jpg'),
('Miến gà nấm thập cẩm', 'Miến gà nấu cùng nấm rơm và cà rốt, ấm bụng cho bữa sáng.', 'Nấu nước dùng gà. Cho miến ngâm mềm, nấm rơm, cà rốt và thịt gà xé vào, nêm nước mắm vừa ăn.', 45, 4, 410, 'EASY', NULL, 'Trợ lý nhà bếp', 'BREAKFAST', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mi%E1%BA%BFn_g%C3%A0.jpg');

-- ------------------------------------------
-- 3. NGUYÊN LIỆU CHO CÁC CÔNG THỨC MỚI
--    (A = có trong tủ An An, M = còn thiếu → giảm % khớp)
-- ------------------------------------------

-- Trứng chiên cà chua — 100% (Trứng gà, Cà chua, Dầu ăn, Nước mắm)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Trứng chiên cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Trứng gà'), 4, 'quả'),
((SELECT id FROM recipes WHERE name = 'Trứng chiên cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà chua'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Trứng chiên cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dầu ăn'), 20, 'ml'),
((SELECT id FROM recipes WHERE name = 'Trứng chiên cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 15, 'ml');

-- Thịt ba chỉ rang cháy cạnh — 100% (Thịt ba chỉ, Nước mắm, Đường, Tỏi, Tiêu xay)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Thịt ba chỉ rang cháy cạnh' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Thịt ba chỉ heo'), 500, 'g'),
((SELECT id FROM recipes WHERE name = 'Thịt ba chỉ rang cháy cạnh' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 30, 'ml'),
((SELECT id FROM recipes WHERE name = 'Thịt ba chỉ rang cháy cạnh' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 25, 'g'),
((SELECT id FROM recipes WHERE name = 'Thịt ba chỉ rang cháy cạnh' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 20, 'g'),
((SELECT id FROM recipes WHERE name = 'Thịt ba chỉ rang cháy cạnh' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tiêu xay'), 5, 'g');

-- Canh cải thìa nấu tôm — 100% (Cải thìa*, Tôm sú*, Hạt nêm, Muối)  (* sắp hết hạn)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Canh cải thìa nấu tôm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cải thìa'), 400, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh cải thìa nấu tôm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tôm sú'), 300, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh cải thìa nấu tôm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Hạt nêm'), 10, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh cải thìa nấu tôm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Muối'), 5, 'g');

-- Bò xào tỏi — 100% (Thịt bò thăn, Tỏi, Dầu ăn, Hạt nêm, Tiêu xay)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Bò xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Thịt bò thăn'), 400, 'g'),
((SELECT id FROM recipes WHERE name = 'Bò xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 25, 'g'),
((SELECT id FROM recipes WHERE name = 'Bò xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dầu ăn'), 25, 'ml'),
((SELECT id FROM recipes WHERE name = 'Bò xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Hạt nêm'), 8, 'g'),
((SELECT id FROM recipes WHERE name = 'Bò xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tiêu xay'), 4, 'g');

-- Đùi gà chiên nước mắm — 100% (Đùi gà, Nước mắm, Đường, Tỏi, Dầu ăn)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Đùi gà chiên nước mắm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đùi gà'), 800, 'g'),
((SELECT id FROM recipes WHERE name = 'Đùi gà chiên nước mắm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 40, 'ml'),
((SELECT id FROM recipes WHERE name = 'Đùi gà chiên nước mắm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 30, 'g'),
((SELECT id FROM recipes WHERE name = 'Đùi gà chiên nước mắm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 20, 'g'),
((SELECT id FROM recipes WHERE name = 'Đùi gà chiên nước mắm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dầu ăn'), 40, 'ml');

-- Cá basa kho tộ — 100% (Cá basa, Nước mắm, Đường, Tiêu xay)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Cá basa kho tộ' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cá basa'), 600, 'g'),
((SELECT id FROM recipes WHERE name = 'Cá basa kho tộ' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 40, 'ml'),
((SELECT id FROM recipes WHERE name = 'Cá basa kho tộ' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 25, 'g'),
((SELECT id FROM recipes WHERE name = 'Cá basa kho tộ' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tiêu xay'), 5, 'g');

-- Nấm rơm xào tỏi — 100% (Nấm rơm*, Tỏi, Dầu ăn, Hạt nêm)  (* sắp hết hạn)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Nấm rơm xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nấm rơm'), 300, 'g'),
((SELECT id FROM recipes WHERE name = 'Nấm rơm xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 20, 'g'),
((SELECT id FROM recipes WHERE name = 'Nấm rơm xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dầu ăn'), 25, 'ml'),
((SELECT id FROM recipes WHERE name = 'Nấm rơm xào tỏi' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Hạt nêm'), 8, 'g');

-- Gà kho gừng — 100% (Đùi gà, Gừng, Nước mắm, Đường, Tiêu xay)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Gà kho gừng' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đùi gà'), 800, 'g'),
((SELECT id FROM recipes WHERE name = 'Gà kho gừng' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Gừng'), 40, 'g'),
((SELECT id FROM recipes WHERE name = 'Gà kho gừng' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 40, 'ml'),
((SELECT id FROM recipes WHERE name = 'Gà kho gừng' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 25, 'g'),
((SELECT id FROM recipes WHERE name = 'Gà kho gừng' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tiêu xay'), 5, 'g');

-- Sườn xào chua ngọt — 80% (Sườn non, Cà chua, Đường, Nước mắm | THIẾU: Dứa)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Sườn xào chua ngọt' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Sườn non heo'), 700, 'g'),
((SELECT id FROM recipes WHERE name = 'Sườn xào chua ngọt' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà chua'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Sườn xào chua ngọt' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 30, 'g'),
((SELECT id FROM recipes WHERE name = 'Sườn xào chua ngọt' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 30, 'ml'),
((SELECT id FROM recipes WHERE name = 'Sườn xào chua ngọt' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dứa'), 0.5, 'quả');

-- Mực xào dứa — 80% (Mực ống, Cà chua, Tỏi, Dầu ăn | THIẾU: Dứa)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Mực xào dứa' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Mực ống'), 500, 'g'),
((SELECT id FROM recipes WHERE name = 'Mực xào dứa' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà chua'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Mực xào dứa' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 20, 'g'),
((SELECT id FROM recipes WHERE name = 'Mực xào dứa' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dầu ăn'), 25, 'ml'),
((SELECT id FROM recipes WHERE name = 'Mực xào dứa' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dứa'), 0.5, 'quả');

-- Salad xoài sữa chua — 75% (Xoài*, Sữa chua, Đường | THIẾU: Dưa hấu)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Salad xoài sữa chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Xoài'), 300, 'g'),
((SELECT id FROM recipes WHERE name = 'Salad xoài sữa chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Sữa chua'), 2, 'hộp'),
((SELECT id FROM recipes WHERE name = 'Salad xoài sữa chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Đường'), 15, 'g'),
((SELECT id FROM recipes WHERE name = 'Salad xoài sữa chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Dưa hấu'), 300, 'g');

-- Bún xào thập cẩm — 83% (Thịt nạc vai, Cải thìa*, Cà rốt, Tỏi, Nước mắm | THIẾU: Bún khô)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Bún khô'), 400, 'g'),
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Thịt nạc vai heo'), 300, 'g'),
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cải thìa'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà rốt'), 150, 'g'),
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 15, 'g'),
((SELECT id FROM recipes WHERE name = 'Bún xào thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 25, 'ml');

-- Canh nghêu cà chua — 80% (Cà chua, Tỏi, Hạt nêm, Muối | THIẾU: Nghêu)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Canh nghêu cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nghêu'), 800, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh nghêu cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà chua'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh nghêu cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Tỏi'), 15, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh nghêu cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Hạt nêm'), 10, 'g'),
((SELECT id FROM recipes WHERE name = 'Canh nghêu cà chua' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Muối'), 5, 'g');

-- Miến gà nấm thập cẩm — 60% (Nấm rơm*, Cà rốt, Nước mắm | THIẾU: Miến dong, Ức gà)
INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Miến gà nấm thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Miến dong'), 300, 'g'),
((SELECT id FROM recipes WHERE name = 'Miến gà nấm thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Ức gà'), 400, 'g'),
((SELECT id FROM recipes WHERE name = 'Miến gà nấm thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nấm rơm'), 200, 'g'),
((SELECT id FROM recipes WHERE name = 'Miến gà nấm thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Cà rốt'), 150, 'g'),
((SELECT id FROM recipes WHERE name = 'Miến gà nấm thập cẩm' AND author = 'Trợ lý nhà bếp'), (SELECT id FROM foods WHERE name = 'Nước mắm'), 25, 'ml');

-- ------------------------------------------
-- 4. ĐÁNH DẤU MỘT VÀI MÓN YÊU THÍCH CHO CHỦ NHÀ AN AN
-- ------------------------------------------
INSERT INTO user_favorite_recipes (user_id, recipe_id)
SELECT (SELECT id FROM users WHERE email = 'lan.nguyen@example.com'),
       r.id
FROM recipes r
WHERE r.author = 'Trợ lý nhà bếp'
  AND r.name IN ('Canh cải thìa nấu tôm', 'Bò xào tỏi')
ON CONFLICT (user_id, recipe_id) DO NOTHING;

COMMIT;

-- ==========================================
-- GHI CHÚ KIỂM TRA NHANH (tuỳ chọn, chạy ngoài transaction):
--   Xem % khớp dự kiến của các công thức mới với tủ An An:
--
-- SELECT r.name,
--        COUNT(*) AS total_ingredients,
--        COUNT(fi.food_id) AS matched,
--        ROUND(COUNT(fi.food_id) * 100.0 / COUNT(*)) AS coverage_percent
-- FROM recipes r
-- JOIN recipe_ingredients ri ON ri.recipe_id = r.id
-- LEFT JOIN (
--     SELECT DISTINCT food_id
--     FROM fridge_items
--     WHERE family_id = (SELECT id FROM families WHERE name = 'Gia đình An An')
--       AND status = 'STORED'
--       AND (expiry_date IS NULL OR expiry_date >= DATE '2026-06-07')
-- ) fi ON fi.food_id = ri.food_id
-- WHERE r.author = 'Trợ lý nhà bếp'
-- GROUP BY r.name
-- ORDER BY coverage_percent DESC;
-- ==========================================
