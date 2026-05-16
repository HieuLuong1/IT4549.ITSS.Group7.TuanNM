/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
const Login = () => <div className="p-10">Login Page</div>;
const Register = () => <div className="p-10">Register Page</div>;

// Profile
const ProfileDetail = () => <div className="p-10">Profile Detail</div>;

// Customer Pages
const FamilyGroup = () => <div className="p-10">Family Group</div>;
const ShoppingPlan = () => <div className="p-10">Shopping Plan</div>;
const MyFridge = () => <div className="p-10">My Fridge</div>;
const MenuSuggestion = () => <div className="p-10">Menu Suggestion</div>;
const Reports = () => <div className="p-10">Reports</div>;

// Admin Pages
import UserManagement from '@/src/pages/admin/UserManagement';
import FoodManagement from '@/src/pages/admin/FoodManagement';
import RecipeManagement from '@/src/pages/admin/RecipeManagement';
import PerformanceManagement from '@/src/pages/admin/PerformanceManagement';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Profile */}
      <Route path="/profile" element={<ProfileDetail />} />

      {/* Customer Routes */}
      <Route path="/family" element={<FamilyGroup />} />
      <Route path="/shopping" element={<ShoppingPlan />} />
      <Route path="/fridge" element={<MyFridge />} />
      <Route path="/suggestions" element={<MenuSuggestion />} />
      <Route path="/reports" element={<Reports />} />

      {/* Admin Routes */}
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/foods" element={<FoodManagement />} />
      <Route path="/admin/recipes" element={<RecipeManagement />} />
      <Route path="/admin/performance" element={<PerformanceManagement />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/admin/users" replace />} />
    </Routes>
  );
};

export default App;

