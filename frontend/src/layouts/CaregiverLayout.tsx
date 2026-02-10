import { Outlet } from 'react-router-dom';
import CaregiverSidebar from '@/components/CaregiverSidebar';

const CaregiverLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <CaregiverSidebar />
      <main className="ml-64 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default CaregiverLayout;
