import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AlertCenter } from './components/AlertCenter';
import { DocumentManager } from './components/DocumentManager';
import { ProjectManager } from './components/ProjectManager';
import { VehicleManager } from './components/vehicles/VehicleManager';
import { UXOEquipmentManager } from './components/equipment_uxo/UXOEquipmentManager';
import { ArchiveWarehouseManager } from './components/ArchiveWarehouseManager';
import { TaskManager } from './components/TaskManager';
import { PersonnelManager } from './components/PersonnelManager';
import { EquipmentManager } from './components/EquipmentManager';
import { UserRoleManager } from './components/UserRoleManager';
import { LegalRepositoryManager } from './components/LegalRepositoryManager';
import { FormTemplateManager } from './components/FormTemplateManager';
import { GlobalSearchManager } from './components/GlobalSearchManager';
import { ReportAnalyticsManager } from './components/ReportAnalyticsManager';
import { AuditLogBackup } from './components/AuditLogBackup';
import { GoogleDriveManager } from './components/GoogleDriveManager';
import { WorkCalendarManager } from './components/WorkCalendarManager';

// Auth Components & Helpers
import { LoginPortal } from './components/auth/LoginPortal';
import { ProfileManager } from './components/auth/ProfileManager';
import { AccessDeniedView } from './components/auth/AccessDeniedView';
import { InactivitySessionModal } from './components/auth/InactivitySessionModal';
import {
  getCurrentUser,
  isUserLoggedIn,
  setLoggedInStatus,
  logoutUser,
  getProjects,
  getAuthSecurityConfig
} from './utils/storage';
import { User, FeatureAccessLevel } from './types';

export function App() {
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(isUserLoggedIn());
  const [activeTab, setActiveTab] = useState<string>(currentUser.defaultTab || 'dashboard');
  const [userKey, setUserKey] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showInactivityModal, setShowInactivityModal] = useState<boolean>(false);

  // Expose global logout function for Topbar & Header
  useEffect(() => {
    (window as any).onLogoutApp = () => {
      logoutUser('Thành viên chủ động đăng xuất');
      setIsLoggedInState(false);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    setIsLoggedInState(true);
    setActiveTab(user.defaultTab || 'dashboard');
    setUserKey(prev => prev + 1);
  };

  const handleExtendSession = () => {
    setShowInactivityModal(false);
  };

  const handleLogout = () => {
    setShowInactivityModal(false);
    logoutUser('Hết thời hạn phiên làm việc');
    setIsLoggedInState(false);
  };

  // Helper to check permission for tab
  const getTabAccessLevel = (tabKey: string): FeatureAccessLevel => {
    if (currentUser.role === 'quantri') return 'full';
    if (tabKey === 'dashboard' || tabKey === 'profile' || tabKey === 'global_search' || tabKey === 'notifications') return 'view';
    const featurePerms = currentUser.featurePermissions || {};
    return featurePerms[tabKey] || 'view';
  };

  // If user is not logged in, strictly serve the Login Portal (Section 3.18.2)
  if (!isLoggedIn) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  const currentTabLevel = getTabAccessLevel(activeTab);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="flex flex-1 min-h-screen overflow-hidden">
        {/* Requirement 20: Left Vertical Sidebar Navigation Menu */}
        <Sidebar
          key={userKey}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {/* Right Main Column (Topbar + Main Content + Footer) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Requirement 20: Topbar with search, notifications, account, breadcrumbs & dark/light mode switch */}
          <Topbar
            key={userKey}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            onUserChanged={() => {
              setCurrentUserState(getCurrentUser());
              setUserKey(prev => prev + 1);
            }}
          />

          {/* Main Content Area in Center */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
            {currentTabLevel === 'none' ? (
              <AccessDeniedView
                moduleName={activeTab}
                moduleKey={activeTab}
                onNavigateHome={() => setActiveTab('dashboard')}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && <AlertCenter onNavigateTab={setActiveTab} />}
                {activeTab === 'notifications' && <AlertCenter onNavigateTab={setActiveTab} />}
                {activeTab === 'global_search' && <GlobalSearchManager onNavigateTab={setActiveTab} />}
                {activeTab === 'profile' && <ProfileManager />}
                {activeTab === 'reports' && <ReportAnalyticsManager />}
                {activeTab === 'documents' && <DocumentManager />}
                {activeTab === 'projects' && <ProjectManager />}
                {activeTab === 'form_templates' && <FormTemplateManager />}
                {activeTab === 'vehicles' && <VehicleManager />}
                {activeTab === 'uxo_equipment' && <UXOEquipmentManager />}
                {activeTab === 'archive_warehouse' && <ArchiveWarehouseManager />}
                {activeTab === 'gdrive' && <GoogleDriveManager />}
                {activeTab === 'tasks' && <TaskManager />}
                {activeTab === 'personnel' && <PersonnelManager />}
                {activeTab === 'equipment' && <EquipmentManager />}
                {activeTab === 'user_role' && <UserRoleManager />}
                {activeTab === 'legal' && <LegalRepositoryManager />}
                {activeTab === 'calendar' && <WorkCalendarManager />}
                {activeTab === 'audit' && <AuditLogBackup />}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className={`py-4 text-center text-xs font-mono border-t ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <p>HỆ THỐNG QUẢN LÝ NGHIỆP VỤ RÀ PHÁ BOM MÌN, VẬT NỔ (QLRPBM) • BỘ PHẬN BOM MÌN TIỂU ĐOÀN 93</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tuân thủ Quy chuẩn Quốc gia QCVN 01:2022/BQP & Nghị định 18/2019/NĐ-CP</p>
          </footer>
        </div>
      </div>

      {/* Inactivity Session Expiry Warning Modal */}
      {showInactivityModal && (
        <InactivitySessionModal
          onExtendSession={handleExtendSession}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
