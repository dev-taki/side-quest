'use client';

import { useEffect, useState } from 'react';
import { Calendar, Home, Gift, User, Clock } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/authService';

export default function SchedulePage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [appointmentLinks] = useState([
    {
      id: 1,
      object_id: 'data-domain="sidequest-members"'
    }
  ]);

  useEffect(() => {
    // Check authentication first
    const token = AuthService.getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#8c52ff] rounded-full flex items-center justify-center">
              <Calendar className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600 text-sm">Manage your appointments and bookings</p>
        </div>

        {/* Appointment Calendar Widget */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Book Your Appointment</h2>
          <div id="appointment-embed-1" className="min-h-[500px]">
            {/* Calendar iframe will be loaded here */}
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
