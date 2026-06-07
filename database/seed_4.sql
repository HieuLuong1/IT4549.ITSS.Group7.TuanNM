-- ============================================================
-- SEED 4: Reseed anh that cho toan bo cong thuc trong seed_1 va seed_3
-- Chay sau: db.sql, seed_1.sql, seed_3.sql
--
-- Ghi chu:
-- - Uu tien link cloud truc tiep: storage.googleapis.com, Wikimedia Special:FilePath.
-- - Tat ca URL deu tro den anh mon an that, khong dung icon.
-- - Script co the chay lai nhieu lan.
-- ============================================================

BEGIN;

CREATE TEMP TABLE seed_4_recipe_images (
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_4_recipe_images (name, author, image_url) VALUES
-- ============================================================
-- Cong thuc tu seed_1: Bếp nhà Fiza (truoc day: Bếp nhà Fiza)
-- ============================================================
('Phở bò gia đình', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pho-Beef-Noodles-2008.jpg'),
('Bún chả Hà Nội', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-bun-cha-mon-chinh-409946962562.jpg'),
('Cơm tấm sườn trứng', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/11/cach-lam-com-tam-suon-nuong-mon-chinh-831905996856.jpg'),
('Canh chua cá basa', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-canh-chua-ca-basa-mon-chinh-147322849370.jpg'),
('Cá thu kho tiêu', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-ca-thu-kho-mon-chinh-921317343617.jpg'),
('Thịt kho trứng', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-thit-kho-trung-nam-djong-co-mon-chinh-871512913685.jpg'),
('Gà rang gừng', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-ga-rang-gung-mon-chinh-850554516745.jpg'),
('Rau muống xào tỏi', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-rau-muong-xao-toi-mon-chinh-424950040069.jpg'),
('Bò lúc lắc', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bo_luc_lac.jpg'),
('Cháo gà xé', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ch%C3%A1o_g%C3%A0_x%C3%A9_phay_%E1%BB%9F_P3_%C4%90%C3%B4ng_H%C3%A0_n%C4%83m_2018.jpg'),
('Canh bí đỏ thịt bằm', 'Bếp nhà Fiza', 'https://i0.wp.com/www.wokandkin.com/wp-content/uploads/2020/11/Pumpkin-Soup-2.png?ssl=1'),
('Mực xào cà chua', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/M%C3%B3n_m%E1%BB%B1c_x%C3%A0o%2C_th%C3%A1ng_4_n%C4%83m_2018_%282%29.jpg'),
('Tôm rang thịt ba chỉ', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-tom-djong-rang-thit-ba-chi-mon-chinh-229448800789.jpg'),
('Miến gà nấm rơm', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mi%E1%BA%BFn_g%C3%A0.jpg'),
('Sườn non kho tiêu', 'Bếp nhà Fiza', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-suon-heo-non-kho-tieu-mon-chinh-150790441965.jpg'),
('Salad trái cây sữa chua', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/Summer_fruit_salad.jpg'),
('Xôi đậu xanh', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/X%C3%B4i_%C4%91%E1%BB%97_xanh.jpg'),
('Sinh tố xoài sữa chua', 'Bếp nhà Fiza', 'https://commons.wikimedia.org/wiki/Special:FilePath/AE_li%C3%AAn_hoan%2C_Sinh_t%E1%BB%91_xo%C3%A0i_%E1%BB%9F_B%C3%ACnh_T%C3%A2n%2C_ng8th2n2020_%281%29.jpg'),

-- ============================================================
-- Cong thuc tu seed_3: Trợ lý nhà bếp
-- ============================================================
('Trứng chiên cà chua', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir-fried_tomato_and_scrambled_eggs.jpg'),
('Thịt ba chỉ rang cháy cạnh', 'Trợ lý nhà bếp', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-thit-ba-chi-rang-mon-chinh-290314796258.jpg'),
('Canh cải thìa nấu tôm', 'Trợ lý nhà bếp', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-canh-cai-thia-nau-tom-trung-mon-chinh-846192367421.jpg'),
('Bò xào tỏi', 'Trợ lý nhà bếp', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/11/cach-lam-bo-xao-rau-cu-eatclean-mon-chinh-235991584517.jpg'),
('Đùi gà chiên nước mắm', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried_chicken_legs.jpg'),
('Cá basa kho tộ', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/C%C3%A1_kho_t%E1%BB%99.JPG'),
('Nấm rơm xào tỏi', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir-fried_mushrooms.jpg'),
('Gà kho gừng', 'Trợ lý nhà bếp', 'https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/10/cach-lam-ga-kho-gung-soi-mon-chinh-332196393593.jpg'),
('Sườn xào chua ngọt', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Suon_xao_chua_ngot_bac_ninh.jpg'),
('Mực xào dứa', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/M%C3%B3n_m%E1%BB%B1c_x%C3%A0o%2C_th%C3%A1ng_4_n%C4%83m_2018_%282%29.jpg'),
('Salad xoài sữa chua', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Summer_fruit_salad.jpg'),
('Bún xào thập cẩm', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Stir_fried_noodles.jpg'),
('Canh nghêu cà chua', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Clam_soup.jpg'),
('Miến gà nấm thập cẩm', 'Trợ lý nhà bếp', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mi%E1%BA%BFn_g%C3%A0.jpg');

UPDATE recipes r
SET image_url = s.image_url
FROM seed_4_recipe_images s
WHERE r.name = s.name
  AND r.author = s.author;

-- Doi ten tac gia tu 'Bếp nhà Fiza' sang 'Bếp nhà Fiza'
UPDATE recipes
SET author = 'Bếp nhà Fiza'
WHERE author = 'Bếp nhà Fiza';

-- Doi ten he thong 'Fiza' -> 'Fiza' trong bang users va notifications
UPDATE users
SET full_name = REPLACE(full_name, 'Fiza', 'Fiza')
WHERE full_name LIKE '%Fiza%';

UPDATE notifications
SET
  title = REPLACE(title, 'Fiza', 'Fiza'),
  body  = REPLACE(body,  'Fiza', 'Fiza')
WHERE title LIKE '%Fiza%'
   OR body  LIKE '%Fiza%';

-- Ket qua mong doi: updated_count = 32 neu da chay du seed_1 va seed_3.
SELECT COUNT(*) AS updated_count
FROM recipes r
JOIN seed_4_recipe_images s
  ON r.name = s.name
 AND r.author = s.author
 AND r.image_url = s.image_url;

-- Neu co dong nao hien ra o day thi recipe do chua ton tai trong database.
SELECT s.name, s.author
FROM seed_4_recipe_images s
LEFT JOIN recipes r
  ON r.name = s.name
 AND r.author = s.author
WHERE r.id IS NULL
ORDER BY s.author, s.name;

COMMIT;
