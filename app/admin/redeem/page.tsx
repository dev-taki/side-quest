'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import { AuthService } from '../../services/authService';
import { AdminService } from '../../services/adminService';
import { useAppDispatch } from '../../store/hooks';
import AdminBottomNav from '../../components/AdminBottomNav';
import AdminHeader from '../../components/AdminHeader';
import { CardLoader, ButtonLoader } from '../../components/common/Loader';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { showToast } from '../../utils/toast';

interface RedemptionRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  item_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  credits_used: number;
}

export default function AdminRedeemPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const BUSINESS_ID = AuthService.getBusinessId();

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

    fetchRedemptionRequests();
  }, [router]);

  const fetchRedemptionRequests = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllRedeemItems();
      setRedemptionRequests(response);
    } catch (error: any) {
      console.error('Error fetching redemption requests:', error);
      showToast.error(error.message || 'Failed to load redemption requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await AdminService.updateRedeemItem(requestId, { status: 'approved' });
      
      // Refresh the list after approval
      await fetchRedemptionRequests();
      showToast.success('Redemption request approved');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await AdminService.updateRedeemItem(requestId, { status: 'rejected' });
      
      // Refresh the list after rejection
      await fetchRedemptionRequests();
      showToast.success('Redemption request rejected');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <CardLoader text="Loading redemption requests..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Admin Header */}
      <AdminHeader 
        title="Redemption Management" 
        subtitle="Manage user redemption requests"
      />

      {/* Main Content */}
      <main className="p-4 pb-24">

        {/* Statistics */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {redemptionRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {redemptionRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total</p>
                  <p className="text-2xl font-bold text-[#3B3B3B]">
                    {redemptionRequests.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Requests */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Redemption Requests</h3>
          
          {redemptionRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No redemption requests found</p>
            </div>
          ) : (
            redemptionRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{request.item_name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">User</p>
                        <p className="font-medium">{request.user_name}</p>
                        <p className="text-gray-500">{request.user_email}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Details</p>
                        <p className="font-medium">-</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Credits Used</p>
                        <p className="font-medium text-[#8c52ff]">{request.credits_used} credits</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Requested</p>
                        <p className="font-medium">{formatDate(request.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === request.id ? (
                        <ButtonLoader size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === request.id ? (
                        <ButtonLoader size="sm" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
