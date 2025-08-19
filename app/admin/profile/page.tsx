'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Mail, Shield, LogOut, Calendar, Settings } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import AdminBottomNav from '../../components/AdminBottomNav';
import PWAInstall from '../../components/PWAInstall';

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!AdminAuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      try {
        const isAdmin = await AdminAuthService.verifyAdminStatus();
        if (!isAdmin) {
          AdminAuthService.removeAuthToken();
          router.push('/admin/login');
          return;
        }

        // Get admin profile
        const profile = await AdminAuthService.getAdminProfile();
        setAdminProfile(profile);
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    AdminAuthService.removeAuthToken();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Admin Profile</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{adminProfile?.name || 'Admin User'}</h2>
            <p className="text-gray-600 text-sm">{adminProfile?.role || 'Administrator'}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{adminProfile?.email || 'admin@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900">{adminProfile?.role || 'Administrator'}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {adminProfile?.created_at ? 
                    new Date(adminProfile.created_at).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">Admin</div>
            <div className="text-xs text-gray-600">Access Level</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Active</div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-gray-900">Account Settings</span>
            </button>
            <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Shield className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-gray-900">Security</span>
            </button>
            <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Calendar className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-gray-900">Activity Log</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </main>

      {/* Bottom Navigation */}
      <AdminBottomNav />
      <PWAInstall showAfterAuth={true} />
    </div>
  );
}
