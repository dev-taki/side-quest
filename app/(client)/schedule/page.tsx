'use client';

import { useEffect, useState } from 'react';
import { Calendar, Home, Gift, User, Clock } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/authService';
import Image from 'next/image';

export default function SchedulePage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
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

  // Set calendar URL when appointment links change
  useEffect(() => {
    if (appointmentLinks.length > 0 && appointmentLinks[0].object_id) {
      const scriptMatch = appointmentLinks[0].object_id.match(/data-domain="([^"]+)"/);
      if (scriptMatch) {
        const domain = scriptMatch[1];
        const iframeUrl = `https://${domain}.youcanbook.me?embed=true`;
        setCalendarUrl(iframeUrl);
      }
    }
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

        {/* Wizard's Study Image or Calendar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          {!showCalendar ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter The Wizard's Study</h2>
              <div 
                className="cursor-pointer transition-transform hover:scale-105 duration-300"
                onClick={() => setShowCalendar(true)}
              >
                <Image
                  src="/the-wizards-study.jpg"
                  alt="The Wizard's Study"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                  priority
                />
                <p className="text-gray-600 mt-4 text-sm">Click to reveal the appointment calendar</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Book Your Appointment</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Back to Study
                </button>
              </div>
              <div className="min-h-[500px]">
                {calendarUrl ? (
                  <iframe
                    src={calendarUrl}
                    className="w-full border-0 rounded-lg"
                    allow="payment"
                    title="Appointment Calendar"
                    style={{ minHeight: '500px', height: '500px' }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Calendar not available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => router.push('/home')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Home className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push('/plans')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Calendar className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Plans</span>
          </button>

          <button
            onClick={() => router.push('/schedule')}
            className="flex flex-col items-center space-y-1 text-[#8c52ff]"
          >
            <Clock className="h-6 w-6 text-[#8c52ff]" />
            <span className="text-xs font-medium">Schedule</span>
          </button>

          <button
            onClick={() => router.push('/redeem')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Gift className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Redeem</span>
          </button>

          <button
            onClick={() => {
              // Check if user is admin and route accordingly
              const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'owner';
              const profilePath = isAdmin ? '/admin/profile' : '/profile';
              router.push(profilePath);
            }}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <User className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
