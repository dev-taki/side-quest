'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { AuthService } from '../services/authService';

interface AppointmentLink {
  id: number;
  created_at: number;
  item_name: string;
  item_display_name: string;
  item_description: string;
  item_price: number;
  item_sku: string;
  item_id: string;
  version: number;
  object_id: string; // This contains the complete script
  variations_id: string;
  Type: string;
}

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [appointmentLinks, setAppointmentLinks] = useState<AppointmentLink[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchAppointmentLinks();
  }, []);

  // Render embedded calendars when appointment links change
  useEffect(() => {
    appointmentLinks.forEach((link) => {
      const container = document.getElementById(`appointment-embed-${link.id}`);
      if (container && link.object_id) {
        // Clear previous content
        container.innerHTML = '';
        
        // Extract domain from the script
        const scriptMatch = link.object_id.match(/data-domain="([^"]+)"/);
        if (scriptMatch) {
          const domain = scriptMatch[1];
          const iframeUrl = `https://${domain}.youcanbook.me?embed=true`;
          
          // Create iframe for direct embedding
          const iframe = document.createElement('iframe');
          iframe.src = iframeUrl;
          iframe.className = 'w-full border-0 rounded-lg';
          iframe.allow = 'payment';
          iframe.title = 'Appointment Calendar';
          iframe.style.minHeight = '500px';
          iframe.style.height = '500px';
          
          container.appendChild(iframe);
        } else {
          // Fallback: show a message
          container.innerHTML = `
            <div class="text-center p-8">
              <Calendar class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600">Calendar not available</p>
            </div>
          `;
        }
      }
    });
  }, [appointmentLinks]);


  const fetchAppointmentLinks = async () => {
    try {
      const response = await fetch(
        `https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/item/client?business_id=a16c462c-e0e8-45f9-81d4-a344874fc46c`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthService.getAuthToken()}`,
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
      setError('Failed to load appointment calendar');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Calendar</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600">Book your appointments and manage your schedule</p>
        </div>

        {/* Appointment Calendar */}
        {appointmentLinks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Appointments Available</h3>
            <p className="text-gray-600">Check back later for available appointment slots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentLinks.map((link) => (
              <div key={link.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                 <div className="flex items-start justify-between mb-4">
                   <div className="flex-1">
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                       {link.item_display_name}
                     </h3>
                     <p className="text-gray-600 mb-3">{link.item_description}</p>
                   </div>
                   <div className="flex items-center text-purple-600">
                     <Clock className="h-4 w-4 mr-1" />
                     <span className="text-sm font-medium">Available</span>
                   </div>
                 </div>

                                {/* Embedded Calendar */}
                <div className="mb-4">
                  <div 
                    id={`appointment-embed-${link.id}`}
                    className="w-full min-h-96 rounded-lg bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </AuthenticatedLayout>
  );
}
