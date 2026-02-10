import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="min-h-screen transition-all duration-300 lg:ml-64">
        <div className="p-6 pt-20 lg:pt-6">
          {/* ✅ Dashboard / Caregivers / Dependents s'affichent ici */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
