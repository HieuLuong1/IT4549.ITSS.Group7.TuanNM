
// --- Shared Mock Data for Admin Panels ---

export interface User {
  id: string;
  family_id?: number;
  role_id?: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  status: 'Active' | 'Inactive';
  avatar: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email_verified: boolean;
}

export interface Food {
  id: string;
  category_id?: number;
  name: string;
  unit: string;
  synonyms: string[];
  image: string;
  category: string; // Keep for UI labeling
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  image: string;
  prepTime: string;
  preferred_meal_time: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  regionalNames: string[];
  ingredients: Ingredient[];
  instructions: string;
  source?: string;
  author?: string;
}

export interface SynonymMapping {
  id: string;
  originalName: string; 
  type: 'food' | 'recipe';
  variants: string[];
}

// --- MOCK USERS ---
export const mockUsers: User[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `#USR${100 + i}`,
  family_id: (i % 5) + 1,
  role_id: i === 0 ? 1 : 2,
  name: [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Minh D', 'Hoàng Anh E',
    'Vũ Thị F', 'Phan Văn G', 'Đặng Minh H', 'Bùi Thị I', 'Hồ Văn J',
    'Ngô Thị K', 'Dương Văn L', 'Lý Thị M', 'Trịnh Văn N', 'Đỗ Thị O',
    'Trương Văn P', 'Lâm Thị Q', 'Huỳnh Văn R', 'Võ Thị S', 'Hà Văn T'
  ][i % 20],
  email: `user${i + 1}@mealmate.vn`,
  role: i === 0 ? 'ADMIN' : 'CUSTOMER',
  status: i % 5 === 0 ? 'Inactive' : 'Active',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  gender: i % 3 === 0 ? 'MALE' : (i % 3 === 1 ? 'FEMALE' : 'OTHER'),
  phone: `090${1234567 + i}`,
  email_verified: i % 2 === 0
}));

// --- MOCK FOODS ---
export const categories = ['Thực phẩm tươi', 'Rau củ', 'Trái cây', 'Thủy hải sản', 'Trứng & Sữa', 'Gia vị'];
export const mockFoods: Food[] = [
  { id: '#FD001', name: 'Thịt heo', category: 'Thực phẩm tươi', unit: 'kg', synonyms: ['Thịt lợn', 'Heo'], image: 'https://images.unsplash.com/photo-1602491951785-030800e8f668?w=500' },
  { id: '#FD002', name: 'Bắp cải', category: 'Rau củ', unit: 'kg', synonyms: ['Cải bắp', 'Bắp'], image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500' },
  { id: '#FD003', name: 'Trứng gà', category: 'Trứng & Sữa', unit: 'quả', synonyms: ['Trứng'], image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3cba?w=500' },
  { id: '#FD004', name: 'Cá lóc', category: 'Thủy hải sản', unit: 'kg', synonyms: ['Cá quả', 'Cá chuối'], image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500' },
  { id: '#FD005', name: 'Dứa', category: 'Trái cây', unit: 'quả', synonyms: ['Thơm', 'Khóm'], image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500' },
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `#FD${106 + i}`,
    name: `Thực phẩm ${i + 6}`,
    category: categories[i % categories.length],
    unit: 'kg',
    synonyms: [],
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
  }))
];

// --- MOCK RECIPES ---
export const recipeCategories = ['Món nước', 'Món kho', 'Món xào', 'Canh', 'Đồ ăn nhanh'];
export const mockRecipes: Recipe[] = [
  { 
    id: '#RE001', 
    name: 'Phở Bò', 
    category: 'Món nước', 
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500', 
    prepTime: '45 phút', 
    preferred_meal_time: 'BREAKFAST',
    regionalNames: ['Phở'],
    ingredients: [
      { name: 'Bánh phở', amount: '500g' },
      { name: 'Thịt bò', amount: '200g' },
      { name: 'Xương ống', amount: '1kg' }
    ],
    instructions: '1. Ninh xương ống lấy nước dùng.\n2. Chần thịt bò thái lát mỏng.\n3. Xếp phở vào bát, thêm thịt, hành và chan nước dùng.',
    author: 'Admin'
  },
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `#RE${102 + i}`,
    name: `Món ăn ${i + 2}`,
    category: recipeCategories[i % recipeCategories.length],
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500',
    prepTime: '30 phút',
    preferred_meal_time: (['BREAKFAST', 'LUNCH', 'DINNER'] as const)[i % 3],
    regionalNames: [],
    ingredients: [{ name: 'Nguyên liệu chính', amount: 'Vừa đủ' }],
    instructions: 'Hướng dẫn chế biến chi tiết đang được cập nhật...',
    author: 'Admin'
  }))
];

export interface UnidentifiedItem {
  id: string;
  type: 'meat' | 'ingredient';
  generalName: string; // e.g., "Thịt chung 1"
  actualName: string;  // e.g., "Thịt cá sấu"
  note: string;
  submittedBy: string;
  submittedAt: string;
}

// --- MOCK SYNONYMS ---
export const mockSynonyms: SynonymMapping[] = [
  ...mockFoods.filter(f => f.synonyms.length > 0).map(f => ({
    id: `syn-f-${f.id}`,
    originalName: f.name,
    type: 'food' as const,
    variants: f.synonyms
  })),
  ...mockRecipes.filter(r => r.regionalNames.length > 0).map(r => ({
    id: `syn-r-${r.id}`,
    originalName: r.name,
    type: 'recipe' as const,
    variants: r.regionalNames
  }))
];

// --- MOCK UNIDENTIFIED ITEMS ---
export const mockUnidentifiedItems: UnidentifiedItem[] = [
  { id: 'ui-1', type: 'meat', generalName: 'Thịt chung 1', actualName: 'Thịt cá sấu', note: 'Mua tại chợ đầu mối, cần cách chế biến phù hợp', submittedBy: 'Nguyễn Văn A', submittedAt: '2026-05-15' },
  { id: 'ui-2', type: 'meat', generalName: 'Thịt chung 2', actualName: 'Thịt lươn đồng', note: 'Đặc sản vùng quê', submittedBy: 'Trần Thị B', submittedAt: '2026-05-16' },
  { id: 'ui-3', type: 'ingredient', generalName: 'Nguyên liệu chung 1', actualName: 'Gia vị Tây Bắc', note: 'Mắc khén, hạt dổi hỗn hợp', submittedBy: 'Lê Văn C', submittedAt: '2026-05-14' },
];
