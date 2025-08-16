'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Settings, BarChart3, Calendar, DollarSign, Package } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import AdminBottomNav from '../../components/AdminBottomNav';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      if (!AdminAuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      // Verify admin status
      try {
        const isAdmin = await AdminAuthService.verifyAdminStatus();
        if (!isAdmin) {
          // User is authenticated but not an admin
          AdminAuthService.removeAuthToken();
          router.push('/admin/login');
          return;
        }

        // Get admin profile
        const profile = await AdminAuthService.getAdminProfile();
        setAdminProfile(profile);
      } catch (error) {
        // Authentication failed or user is not an admin
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Centered Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Side Quest</h1>
          <p className="text-gray-600 text-sm">Vendor Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-lg mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Manage Patients</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/admin/appointment-links')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-lg mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Appointment Links</span>
              </div>
            </button>

            <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-lg mb-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Treatments</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/admin/plans')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-yellow-100 rounded-lg mb-3">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Plan Management</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/admin/items')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-orange-100 rounded-lg mb-3">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Items Management</span>
              </div>
            </button>

            <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gray-100 rounded-lg mb-3">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">System Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Patients</p>
                <p className="text-lg font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Today's Appointments</p>
                <p className="text-lg font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Treatments</p>
                <p className="text-lg font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-lg font-bold text-gray-900">$45,678</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
