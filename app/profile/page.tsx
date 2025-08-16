'use client';

import { User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.name || 'User Profile'}</h2>
          <p className="text-gray-600 mb-2">{user?.email}</p>
          <p className="text-gray-500 text-sm mb-4">
            Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Role:</span> {user?.role || 'User'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Customer ID:</span> {user?.square_customer_id || 'N/A'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
