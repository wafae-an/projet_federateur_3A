import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DependentSidebar } from '@/components/DependentSidebar';

const DependentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DependentSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="min-h-screen transition-all duration-300 lg:ml-64">
        <div className="p-6 pt-20 lg:pt-6">
          {/* ✅ Home / Activities / Medications / Appointments */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DependentLayout;
