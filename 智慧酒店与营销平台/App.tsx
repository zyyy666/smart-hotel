import React, { useState } from 'react';
import { LayoutDashboard, Users, Zap, Menu, Hotel, IdCard, LogOut } from 'lucide-react';
import RoomGrid from './components/RoomGrid';
import PricingEngine from './components/PricingEngine';
import CustomerProfiles from './components/CustomerProfiles';
import StaffDirectory from './components/StaffDirectory';
import AIChat from './components/AIChat';
import LoginScreen from './components/LoginScreen';
import { Room, RoomStatus, RoomType, User, UserRole, Customer } from './types';

// Mock Data - Customers (Moved to App level for syncing)
const initialCustomers: Customer[] = [
  { id: '1', name: '郭爱丽', email: 'alice.guo@example.com', phone: '+86 138-1234-5678', lastStay: '2023-10-15', totalStays: 12, totalSpent: 45000, rfmScore: { r: 5, f: 5, m: 5 }, tags: ['高净值', '商务常客', '行政套房偏好'] },
  { id: '2', name: '陈波', email: 'bob.chen@testmail.com', phone: '+86 139-8765-4321', lastStay: '2023-08-01', totalStays: 2, totalSpent: 800, rfmScore: { r: 2, f: 2, m: 2 }, tags: ['价格敏感', '新客'] },
  { id: '3', name: '王查理', email: 'charlie.w@domain.net', phone: '+86 137-0000-0003', lastStay: '2023-10-20', totalStays: 5, totalSpent: 6200, rfmScore: { r: 5, f: 3, m: 4 }, tags: ['家庭出游', '周末度假'] },
  { id: '4', name: '林黛玉', email: 'daiyu.lin@poetry.com', phone: '+86 136-1111-2222', lastStay: '2023-09-10', totalStays: 1, totalSpent: 1200, rfmScore: { r: 3, f: 1, m: 3 }, tags: ['文艺青年', '静音房需求'] },
  { id: '5', name: '薛宝钗', email: 'baochai.xue@gold.com', phone: '+86 135-3333-4444', lastStay: '2023-11-01', totalStays: 20, totalSpent: 88000, rfmScore: { r: 5, f: 5, m: 5 }, tags: ['企业协议', '会议策划', '顶级VIP'] },
  { id: '6', name: '贾宝玉', email: 'baoyu.jia@stone.com', phone: '+86 134-5555-6666', lastStay: '2023-05-20', totalStays: 8, totalSpent: 15000, rfmScore: { r: 1, f: 4, m: 4 }, tags: ['流失预警', '享乐主义'] },
];

// Mock Data - Rooms (Updated to include ALL RoomTypes)
const initialRooms: Room[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `room-${i}`,
  number: `${Math.floor(i / 6) + 1}0${(i % 6) + 1}`,
  // 循环生成所有4种房型：单人间, 双人房, 行政套房, 豪华房
  type: [RoomType.SINGLE, RoomType.DOUBLE, RoomType.SUITE, RoomType.DELUXE][i % 4],
  status: i === 3 || i === 8 ? RoomStatus.VACANT_DIRTY : 
            i === 5 ? RoomStatus.MAINTENANCE :
            i % 3 === 0 ? RoomStatus.OCCUPIED : RoomStatus.VACANT_CLEAN,
  floor: Math.floor(i / 6) + 1,
  // 价格随房型变化
  price: [180, 280, 580, 420][i % 4],
  guestName: i % 3 === 0 ? ['张伟', '李秀英', '王强', '刘洋'][i % 4] : undefined
}));

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pricing' | 'customers' | 'staff'>('dashboard');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 登录处理
  const handleLogin = (username: string, role: UserRole) => {
    setCurrentUser({
      id: Date.now().toString(),
      username,
      name: username === 'Admin' ? '超级管理员' : username,
      role: role
    });
    // 登录后重置Tab到Dashboard
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 核心逻辑：更新房态的同时，同步更新客户数据库
  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));

    // 如果是办理入住 (OCCUPIED) 且有客人姓名，则更新客户库
    if (updatedRoom.status === RoomStatus.OCCUPIED && updatedRoom.guestName) {
      const guestName = updatedRoom.guestName;
      setCustomers(prev => {
        const existingCustomerIndex = prev.findIndex(c => c.name === guestName);
        
        if (existingCustomerIndex >= 0) {
          // 老客：更新数据
          const newCustomers = [...prev];
          const existing = newCustomers[existingCustomerIndex];
          newCustomers[existingCustomerIndex] = {
            ...existing,
            totalStays: existing.totalStays + 1,
            lastStay: new Date().toISOString().split('T')[0],
            totalSpent: existing.totalSpent + updatedRoom.price, // 简单累加一晚房费作为示例
            rfmScore: { ...existing.rfmScore, r: 5, f: Math.min(5, existing.rfmScore.f + 1) } // 更新R值
          };
          return newCustomers;
        } else {
          // 新客：创建档案
          const newCustomer: Customer = {
            id: Date.now().toString(),
            name: guestName,
            email: `guest_${Math.floor(Math.random()*1000)}@hotel.com`, // 模拟邮箱
            phone: '138-xxxx-xxxx',
            lastStay: new Date().toISOString().split('T')[0],
            totalStays: 1,
            totalSpent: updatedRoom.price,
            rfmScore: { r: 5, f: 1, m: 3 },
            tags: ['新客', '散客']
          };
          // 将新客添加到列表前部
          return [newCustomer, ...prev];
        }
      });
    }
  };

  // 权限检查辅助函数
  const canAccessTab = (tab: string, role: UserRole): boolean => {
    if (role === UserRole.MANAGER) return true; // 经理拥有所有权限
    
    switch (tab) {
      case 'dashboard': return true; // 所有人可见房态(不同视角)
      case 'pricing': return false; // 仅经理
      case 'customers': return role === UserRole.FRONT_DESK; // 前台可看CRM
      case 'staff': return true; // 所有人可见通讯录(不同内容)
      default: return false;
    }
  };

  // 如果未登录，渲染登录页
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    // 最外层容器：使用 Flex 布局，并确保最小高度是视口高度
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      
      {/* 侧边栏 (Sidebar) - 关键修改点 */}
      {/* 使用 'h-screen' 和 'sticky top-0' 确保侧边栏粘在顶部并占据整个视口高度 */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 flex flex-col flex-shrink-0 h-screen sticky top-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Hotel className="w-8 h-8 text-blue-400 mr-3 flex-shrink-0" />
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">智慧酒店平台</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {canAccessTab('dashboard', currentUser.role) && (
            <SidebarItem 
              icon={<LayoutDashboard />} 
              label={currentUser.role === UserRole.CUSTOMER ? "预定选房" : "房态管理"}
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              collapsed={!sidebarOpen}
            />
          )}
          
          {canAccessTab('pricing', currentUser.role) && (
            <SidebarItem 
              icon={<Zap />} 
              label="智能调价" 
              active={activeTab === 'pricing'} 
              onClick={() => setActiveTab('pricing')} 
              collapsed={!sidebarOpen}
            />
          )}
          
          {canAccessTab('customers', currentUser.role) && (
            <SidebarItem 
              icon={<Users />} 
              label="客户画像" 
              active={activeTab === 'customers'} 
              onClick={() => setActiveTab('customers')} 
              collapsed={!sidebarOpen}
            />
          )}
          
          {canAccessTab('staff', currentUser.role) && (
              <SidebarItem 
              icon={<IdCard />} 
              label={currentUser.role === UserRole.CUSTOMER ? "服务人员" : "员工管理"}
              active={activeTab === 'staff'} 
              onClick={() => setActiveTab('staff')} 
              collapsed={!sidebarOpen}
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
              title="退出登录"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-2 text-sm">退出登录</span>}
          </button>
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* 主内容区 (Main Content) - 保持 Flex-1 占据剩余空间 */}
      {/* 移除所有 'ml-' 边距，让 Flexbox 自动定位，并设置 overflow-auto 来处理内容滚动 */}
      <main className="flex-1 overflow-auto transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {activeTab === 'dashboard' ? (currentUser.role === UserRole.CUSTOMER ? '预定选房' : '实时房态看板') : 
              activeTab === 'pricing' ? '动态调价策略引擎' : 
              activeTab === 'customers' ? '客户智能分析 (CRM)' : 
              (currentUser.role === UserRole.CUSTOMER ? '联系服务人员' : '员工职能与通讯录')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-700">{currentUser.name}</div>
              <div className="text-xs text-slate-500 uppercase">{currentUser.role}</div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
              ${currentUser.role === UserRole.MANAGER ? 'bg-blue-600' : 
                currentUser.role === UserRole.FRONT_DESK ? 'bg-emerald-500' : 'bg-amber-500'}
            `}>
              {currentUser.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-2">
          {activeTab === 'dashboard' && (
              <RoomGrid rooms={rooms} onUpdateRoom={handleUpdateRoom} currentUser={currentUser} />
          )}
          {activeTab === 'pricing' && currentUser.role === UserRole.MANAGER && (
            <PricingEngine />
          )}
          {activeTab === 'customers' && (currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.FRONT_DESK) && (
            <CustomerProfiles customers={customers} />
          )}
          {activeTab === 'staff' && (
            <StaffDirectory userRole={currentUser.role} />
          )}
        </div>
      </main>

      {/* AI Assistant - 所有人可见 */}
      <AIChat />
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, collapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center p-3 rounded-lg transition-colors group relative
        ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      `}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
};

export default App;