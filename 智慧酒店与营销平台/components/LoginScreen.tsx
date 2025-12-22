
import React, { useState } from 'react';
import { Hotel, User, KeyRound, ArrowRight, ShieldCheck, Smile, MonitorPlay } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (username: string, role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 快捷模拟登录，方便原型演示
  const handleQuickLogin = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      let mockName = 'Admin';
      if (role === UserRole.CUSTOMER) mockName = 'Guest_Wang'; // 模拟一个具体住客名
      if (role === UserRole.FRONT_DESK) mockName = 'Staff_Anna';
      onLogin(mockName, role);
      setLoading(false);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // 默认表单登录为经理权限
      handleQuickLogin(UserRole.MANAGER);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row z-10 overflow-hidden min-h-[500px]">
        
        {/* Left Side: Brand & Info */}
        <div className="w-full md:w-1/2 pr-0 md:pr-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 pb-8 md:pb-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">智慧酒店平台</h1>
            </div>
            <p className="text-slate-500 text-sm mb-8 pl-1">Smart Hotel Management System</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
                  <MonitorPlay className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">全场景角色模拟</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    系统支持经理、前台、住客三种视角。不同角色拥有独立的权限控制与界面布局。
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600 mt-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">企业级 RBAC 权限</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    基于角色的访问控制，确保数据安全。敏感的定价规则与客户画像仅对管理层开放。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 mt-8">
            &copy; 2024 Smart Hotel Platform. Prototype Build.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 pl-0 md:pl-8 pt-8 md:pt-0 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">账号登录</h2>
            <p className="text-slate-400 text-sm">请选择角色进入演示系统</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 mt-4 text-sm">正在验证身份并加载权限...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simulation Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleQuickLogin(UserRole.MANAGER)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                      <ShieldCheck className="w-5 h-5 text-slate-600 group-hover:text-blue-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 group-hover:text-blue-800">我是酒店经理</div>
                      <div className="text-xs text-slate-500">全权限：定价、CRM、员工管理</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </button>

                <button 
                  onClick={() => handleQuickLogin(UserRole.FRONT_DESK)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group text-left"
                >
                   <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-emerald-200 transition-colors">
                      <User className="w-5 h-5 text-slate-600 group-hover:text-emerald-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 group-hover:text-emerald-800">我是前台员工</div>
                      <div className="text-xs text-slate-500">操作：办理入住、退房、查房</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                </button>

                <button 
                  onClick={() => handleQuickLogin(UserRole.CUSTOMER)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 hover:shadow-md transition-all group text-left"
                >
                   <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-amber-200 transition-colors">
                      <Smile className="w-5 h-5 text-slate-600 group-hover:text-amber-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 group-hover:text-amber-800">我是酒店住客</div>
                      <div className="text-xs text-slate-500">浏览：选房、查看设施、预订</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">或使用账号登录</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="用户名" 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="密码" 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                  登录
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
