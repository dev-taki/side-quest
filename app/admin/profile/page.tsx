'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, LogOut, Calendar, Settings, Edit, Save, X } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import { AuthService } from '../../services/authService';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import AdminBottomNav from '../../components/AdminBottomNav';
import PWAInstall from '../../components/PWAInstall';
import { showToast } from '../../utils/toast';
import { useAdmin, useAppDispatch } from '../../store/hooks';
import { fetchAllUsers, fetchAllUserSubscriptions, getAllRedeemItems, clearAdminError } from '../../store/slices/adminSlice';
import { logout } from '../../store/slices/authSlice';

export default function AdminProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, userSubscriptions, loading: adminLoading, error: adminError } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(
        `${AuthService.getApiBaseUrl()}/auth/me?business_id=${AuthService.getBusinessId()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch admin profile');
      }

      const profileData = await response.json();
      setAdminProfile(profileData);
      
      // Pre-populate form data
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      showToast.error(error.message || 'Failed to load profile');
    }
  };

  useEffect(() => {
    if (!AdminAuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!AdminAuthService.hasAdminRole()) {
      AdminAuthService.removeAuthToken();
      router.push('/login');
      return;
    }

    // Fetch admin profile and other data
    fetchAdminProfile();
    dispatch(fetchAllUsers());
    dispatch(fetchAllUserSubscriptions());
    setLoading(false);
  }, [router, dispatch]);

  // Clear admin error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAdminError());
    };
  }, [dispatch]);

  // Show admin error toast if there's an error
  useEffect(() => {
    if (adminError) {
      showToast.error(adminError);
    }
  }, [adminError]);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      showToast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      showToast.error('Failed to logout');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);

    // Validate passwords match if password is being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      setUpdateLoading(false);
      return;
    }

    try {
      const updateData: any = {
        business_id: AuthService.getBusinessId(),
        user_id: adminProfile?.id,
        name: formData.name,
        email: formData.email,
        role: adminProfile?.role, // Automatically pass existing role
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(
        `${AuthService.getApiBaseUrl()}/auth/user/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      
      // Check if the response contains valid data
      if (updatedProfile && (updatedProfile.name || updatedProfile.email)) {
        // Update the profile state
        setAdminProfile(updatedProfile);
        
        // Update form data with new values
        setFormData(prev => ({
          ...prev,
          name: updatedProfile.name || prev.name,
          email: updatedProfile.email || prev.email,
          password: '',
          confirmPassword: '',
        }));
        
        showToast.success('Profile updated successfully!');
      } else {
        // If no profile data returned, refresh from server
        await fetchAdminProfile();
        showToast.success('Profile updated successfully!');
      }
      
      setIsEditing(false);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: adminProfile?.name || '',
      email: adminProfile?.email || '',
      password: '',
      confirmPassword: '',
    });
  };

  if (loading) {
    return <PageLoader text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#8c52ff] text-white p-2 rounded-lg hover:bg-[#7a47e6] transition-colors"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
            )}
          </div>

          {!isEditing ? (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-[#3B3B3B]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{adminProfile?.name || 'Admin User'}</h3>
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
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              {formData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-[#8c52ff] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#7a47e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updateLoading ? (
                    <>
                      <ButtonLoader size="sm" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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
