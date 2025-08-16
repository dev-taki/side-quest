'use client';

import AuthenticatedLayout from '../components/AuthenticatedLayout';

export default function PlansPage() {
  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Plans</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900">Morning Routine</h3>
              <p className="text-sm text-gray-600">Daily • 7:00 AM</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Workout Plan</h3>
              <p className="text-sm text-gray-600">Mon, Wed, Fri • 6:00 PM</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Study Session</h3>
              <p className="text-sm text-gray-600">Tue, Thu • 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
