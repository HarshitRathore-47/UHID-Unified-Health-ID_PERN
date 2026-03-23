import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminsSidebar";
import AdminNavbar from "./AdminNavbar";
import useTheme from "../../../hooks/useTheme";

function AdminLayout() {
  useTheme("admin-light"); // Switch to your light theme

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64 transition-all duration-300">
        <AdminNavbar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;