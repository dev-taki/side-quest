'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Calendar, Link, Trash2 } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import AdminBottomNav from '../../components/AdminBottomNav';

interface AppointmentLink {
  id: number;
  business_id: string;
  appointment_item_name: string;
  description: string;
  link: string;
  created_at: number;
}

export default function AppointmentLinksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointmentLinks, setAppointmentLinks] = useState<AppointmentLink[]>([]);
  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    script: '',
  });
  const [submitting, setSubmitting] = useState(false);

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

        await fetchAppointmentLinks();
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchAppointmentLinks = async () => {
    try {
      const response = await fetch(
        `https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/item/client?business_id=a16c462c-e0e8-45f9-81d4-a344874fc46c`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appointment links');
      }

      const data = await response.json();
      setAppointmentLinks(data);
    } catch (error) {
      console.error('Error fetching appointment links:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/item/square/appointment-link',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          },
          body: JSON.stringify({
            business_id: 'a16c462c-e0e8-45f9-81d4-a344874fc46c',
            item_name: formData.item_name,
            item_description: formData.item_description,
            link: formData.script, // Pass script as link
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create appointment link');
      }

      // Reset form and refresh data
      setFormData({
        item_name: '',
        item_description: '',
        script: '',
      });
      await fetchAppointmentLinks();
    } catch (error) {
      console.error('Error creating appointment link:', error);
    } finally {
      setSubmitting(false);
    }
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Appointment Links</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Add Form Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Appointment Link</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter item name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Description
              </label>
              <textarea
                name="item_description"
                value={formData.item_description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter item description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script
              </label>
              <input
                type="text"
                name="script"
                value={formData.script}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="Paste the complete script here"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: &lt;script src="https://embed.ycb.me" async="true" data-domain="sidequest-members" data-type="text-link" data-displaymode="auto"&gt;&lt;/script&gt;
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Appointment Link
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Appointment Links List */}
        <div className="space-y-4">
          {appointmentLinks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment Links</h3>
              <p className="text-gray-600">Create your first appointment link to get started.</p>
            </div>
          ) : (
            appointmentLinks.map((link) => (
              <div key={link.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{link.appointment_item_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                    <div className="flex items-center text-xs text-purple-600">
                      <Link className="h-3 w-3 mr-1" />
                      <span className="truncate">{link.link}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
