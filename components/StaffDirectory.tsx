
import React, { useState } from 'react';
import { Staff, UserRole } from '../types';
import { Phone, Mail, UserCheck, UserX, Search, ShieldCheck, Eye, MapPin } from 'lucide-react';

const mockStaff: Staff[] = [
  { id: '1', name: '李明 (经理)', role: 'MANAGER', department: '总经办', area: '全酒店', phone: '138-0000-8888', email: 'manager.li@hotel.com', onDuty: true, guestVisible: true },
  { id: '2', name: '王芳 (前台)', role: 'FRONT_DESK', department: '前厅部', area: '一楼大堂', phone: '021-12345678', email: 'reception@hotel.com', onDuty: true, guestVisible: true },
  { id: '3', name: '张强 (工程)', role: 'MAINTENANCE', department: '工程部', area: '3F-5F 客房区', phone: '139-1111-2222', email: 'fix@hotel.com', onDuty: true, guestVisible: false },
  { id: '4', name: '赵敏 (管家)', role: 'CLEANING', department: '客房部', area: '8F 行政楼层', phone: '137-3333-4444', email: 'housekeeping@hotel.com', onDuty: false, guestVisible: true },
  { id: '5', name: '孙悟空 (安保)', role: 'MAINTENANCE', department: '安保部', area: '外围巡逻', phone: '110-0000-0000', email: 'security@hotel.com', onDuty: true, guestVisible: false },
];

interface StaffDirectoryProps {
  userRole: UserRole;
}

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // 根据当前用户角色和搜索条件过滤员工
  const filteredStaff = mockStaff.filter(s => {
    // 1. 角色过滤: 住客只能看到 guestVisible 的员工
    if (userRole === UserRole.CUSTOMER && !s.guestVisible) return false;

    // 2. 搜索过滤
    const matchesSearch = s.name.includes(searchTerm) || s.department.includes(searchTerm);
    
    // 3. 职能过滤
    const matchesRole = filterRole === 'ALL' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'FRONT_DESK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'CLEANING': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'MANAGER': return '酒店经理';
      case 'FRONT_DESK': return '前台接待';
      case 'MAINTENANCE': return '工程维修';
      case 'CLEANING': return '客房管家';
      default: return role;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            {userRole === UserRole.CUSTOMER ? '服务人员通讯录' : '员工职能与通讯录'}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {userRole === UserRole.CUSTOMER ? '需要帮助？您可以直接联系以下值班人员。' : '管理员工排班、负责区域及对外联系方式。'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索姓名或部门..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">所有部门</option>
            <option value="MANAGER">总经办</option>
            <option value="FRONT_DESK">前台</option>
            {userRole !== UserRole.CUSTOMER && <option value="MAINTENANCE">工程部</option>}
            <option value="CLEANING">客房部</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(staff => (
          <div key={staff.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${staff.onDuty ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 grayscale'}`}>
                  {staff.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{staff.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getRoleColor(staff.role)}`}>
                    {getRoleLabel(staff.role)}
                  </span>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${staff.onDuty ? 'bg-green-500' : 'bg-slate-300'}`} title={staff.onDuty ? "值班中" : "休息中"}></div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
               <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>负责区域: <span className="font-medium text-slate-800">{staff.area}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {/* 仅对员工显示真实邮箱，对住客显示掩码或隐藏 */}
                <span>{userRole === UserRole.CUSTOMER ? '******' : staff.email}</span>
              </div>
            </div>

            {/* 仅对内部员工显示可见性控制状态 */}
            {userRole !== UserRole.CUSTOMER && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  {staff.guestVisible ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">住客可见</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-500">内部保密</span>
                    </>
                  )}
                </div>
                
                {staff.guestVisible && (
                   <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">
                     可查询
                   </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {userRole !== UserRole.CUSTOMER && (
        <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-500 flex gap-2 border border-slate-200">
          <ShieldCheck className="w-4 h-4" />
          <div>
            <strong>隐私安全提示：</strong> 此处显示完整的员工联系方式以便管理调度。
            C端住客APP中，仅会显示标记为“住客可见”的员工（如酒店经理、当前值班管家）的联系方式，且部分敏感数字会进行虚拟号处理。
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
