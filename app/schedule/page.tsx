'use client';

import AuthenticatedLayout from '../components/AuthenticatedLayout';

export default function SchedulePage() {
  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Morning Workout</h3>
                <p className="text-sm text-gray-600">7:00 AM - 8:00 AM</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Active</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Team Meeting</h3>
                <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Upcoming</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Lunch Break</h3>
                <p className="text-sm text-gray-600">12:00 PM - 1:00 PM</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Upcoming</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Project Review</h3>
                <p className="text-sm text-gray-600">3:00 PM - 4:00 PM</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === 2 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {day}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {index === 2 ? '4' : Math.floor(Math.random() * 3) + 1} tasks
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-center transition-colors">
            <div className="text-lg font-semibold mb-1">Add Event</div>
            <div className="text-sm text-purple-100">Create new schedule item</div>
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-center transition-colors">
            <div className="text-lg font-semibold mb-1">View Calendar</div>
            <div className="text-sm text-blue-100">Full calendar view</div>
          </button>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Completed: Morning Routine</h3>
                <p className="text-sm text-gray-600">Yesterday at 7:30 AM</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Completed</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Team Standup</h3>
                <p className="text-sm text-gray-600">Yesterday at 9:00 AM</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Attended</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Missed: Gym Session</h3>
                <p className="text-sm text-gray-600">2 days ago at 6:00 PM</p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Missed</span>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
