
import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomStatus, RoomType, UserRole, User } from '../types';
import { 
  MoreVertical, User as UserIcon, CheckCircle, Trash2, Wrench, LogIn, LogOut, Info, 
  Lock, Calendar, Users, Clock, Wifi, Tv, Wind, Coffee, X 
} from 'lucide-react';

interface RoomGridProps {
  rooms: Room[];
  onUpdateRoom: (room: Room) => void;
  currentUser: User;
}

// 房型静态配置：图片、设施、床型
const ROOM_DETAILS_CONFIG: Record<RoomType, { 
  image: string; 
  bed: string; 
  area: string; 
  amenities: string[]; 
  desc: string 
}> = {
  [RoomType.SINGLE]: {
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600',
    bed: '1.2m 单人床',
    area: '25㎡',
    amenities: ['Wi-Fi', '独立卫浴', '24h热水'],
    desc: '温馨舒适的单人空间，适合独自旅行或商务短住。'
  },
  [RoomType.DOUBLE]: {
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600',
    bed: '1.8m 大床',
    area: '35㎡',
    amenities: ['Wi-Fi', '智能电视', '浴缸', '迷你吧'],
    desc: '宽敞明亮的大床房，情侣或夫妻出行的理想选择。'
  },
  [RoomType.SUITE]: {
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
    bed: '2.0m 特大床',
    area: '60㎡',
    amenities: ['行政酒廊', '咖啡机', '全景落地窗', '独立客厅'],
    desc: '尊贵行政套房，配备独立会客区，尽享奢华体验。'
  },
  [RoomType.DELUXE]: {
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600',
    bed: '2.0m 圆床',
    area: '50㎡',
    amenities: ['海景阳台', '智能语音控制', '按摩浴缸'],
    desc: '拥有绝佳景观的豪华房，让您的假期充满浪漫色彩。'
  }
};

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onUpdateRoom, currentUser }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; roomId: string } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); // 详情弹窗选中的房间
  
  // 筛选器状态
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nights, setNights] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(1);

  const menuRef = useRef<HTMLDivElement>(null);
  const userRole = currentUser.role;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 右键菜单逻辑 (员工/经理)
  const handleContextMenu = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    if (userRole === UserRole.CUSTOMER) return;
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ x, y, roomId });
  };

  // 房间点击逻辑
  const handleRoomClick = (room: Room) => {
    // 无论是员工还是住客，点击都显示详情弹窗
    setSelectedRoom(room);
  };

  // 员工操作逻辑 - 核心修复：支持从Modal调用（此时contextMenu为null）
  const handleStaffAction = (action: 'CHECK_IN' | 'CHECK_OUT' | 'CLEAN' | 'DIRTY' | 'MAINTENANCE' | 'DETAILS') => {
    // 优先使用右键选中的房间，如果没有则使用详情弹窗选中的房间
    const targetRoomId = contextMenu?.roomId || selectedRoom?.id;
    if (!targetRoomId) return;

    const room = rooms.find(r => r.id === targetRoomId);
    if (!room) return;

    switch(action) {
      case 'CHECK_IN':
        if (room.status !== RoomStatus.VACANT_CLEAN) {
          alert("无法办理入住：房间状态不是“空净房”。请先安排打扫或结束上一笔订单。");
          break;
        }
        const name = window.prompt("请输入住客姓名 (将同步至CRM):", "访客");
        if (name) {
          onUpdateRoom({ ...room, status: RoomStatus.OCCUPIED, guestName: name });
          // 如果是从Modal操作的，操作完关闭弹窗
          if (selectedRoom) setSelectedRoom(null);
        }
        break;
      case 'CHECK_OUT':
        if (window.confirm(`确认要为 ${room.number} 房间的 ${room.guestName || '客人'} 办理退房吗?`)) {
          onUpdateRoom({ ...room, status: RoomStatus.VACANT_DIRTY, guestName: undefined });
          if (selectedRoom) setSelectedRoom(null);
        }
        break;
      case 'CLEAN':
        onUpdateRoom({ ...room, status: RoomStatus.VACANT_CLEAN, guestName: undefined });
        if (selectedRoom) setSelectedRoom(null);
        break;
      case 'DIRTY':
        onUpdateRoom({ ...room, status: RoomStatus.VACANT_DIRTY });
        if (selectedRoom) setSelectedRoom(null);
        break;
      case 'MAINTENANCE':
        onUpdateRoom({ ...room, status: RoomStatus.MAINTENANCE });
        if (selectedRoom) setSelectedRoom(null);
        break;
      case 'DETAILS':
        setSelectedRoom(room); // 打开详情弹窗
        break;
    }
    setContextMenu(null);
  };

  // 住客预订逻辑
  const handleGuestBook = () => {
    if (!selectedRoom) return;
    // 简单检查
    if (selectedRoom.status !== RoomStatus.VACANT_CLEAN) {
      alert('抱歉，该房间刚刚已不可预订，请刷新重试。');
      return;
    }

    if (window.confirm(`确认预订 ${selectedRoom.type} (房号: ${selectedRoom.number})?\n入住日期: ${filterDate}\n入住天数: ${nights}晚\n总价: ¥${selectedRoom.price * nights}`)) {
       onUpdateRoom({ ...selectedRoom, status: RoomStatus.OCCUPIED, guestName: currentUser.name });
       alert('预订成功！系统已为您生成订单，您可以在“我的房间”查看。');
       setSelectedRoom(null);
    }
  };

  // 住客退房逻辑
  const handleGuestCheckout = () => {
    if (!selectedRoom) return;
    if (window.confirm("确定要退房吗？退房后房间将需要清洁。")) {
      onUpdateRoom({ ...selectedRoom, status: RoomStatus.VACANT_DIRTY, guestName: undefined });
      alert('退房成功，欢迎下次光临！');
      setSelectedRoom(null);
    }
  };

  // UI 样式辅助函数
  const getStatusStyles = (status: RoomStatus) => {
    if (userRole === UserRole.CUSTOMER) {
      // 住客视角
      if (status === RoomStatus.VACANT_CLEAN) {
        return { bg: 'bg-white hover:border-emerald-500 cursor-pointer shadow-sm', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> };
      } else if (status === RoomStatus.OCCUPIED && rooms.find(r => r.id === selectedRoom?.id)?.guestName === currentUser.name) {
         return { bg: 'bg-blue-50 border-blue-400 cursor-pointer shadow-md', border: 'border-blue-400', text: 'text-blue-700', icon: <UserIcon className="w-4 h-4" /> };
      } else {
        return { bg: 'bg-slate-50 opacity-60 cursor-pointer', border: 'border-slate-200', text: 'text-slate-400', icon: <Lock className="w-4 h-4" /> };
      }
    }

    // 员工视角
    switch (status) {
      case RoomStatus.VACANT_CLEAN: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> };
      case RoomStatus.VACANT_DIRTY: return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <Trash2 className="w-4 h-4" /> };
      case RoomStatus.OCCUPIED: return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: <UserIcon className="w-4 h-4" /> };
      case RoomStatus.MAINTENANCE: return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', icon: <Wrench className="w-4 h-4" /> };
      default: return { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-700', icon: <Info className="w-4 h-4" /> };
    }
  };

  const getStatusLabel = (room: Room) => {
    if (userRole === UserRole.CUSTOMER) {
      if (room.status === RoomStatus.OCCUPIED && room.guestName === currentUser.name) return '我的房间';
      return room.status === RoomStatus.VACANT_CLEAN ? '可预订' : '不可用';
    }
    if (room.status === RoomStatus.OCCUPIED) return room.guestName || '在住';
    const labels = {
      [RoomStatus.VACANT_CLEAN]: '空净房',
      [RoomStatus.VACANT_DIRTY]: '脏房',
      [RoomStatus.OCCUPIED]: '在住',
      [RoomStatus.MAINTENANCE]: '维修中',
    };
    return labels[room.status];
  };

  return (
    <div className="p-6 h-full flex flex-col relative">
      {/* 顶部筛选栏 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">
             {userRole === UserRole.CUSTOMER ? '预定选房' : '房态实时看板'}
           </h2>
           {userRole === UserRole.CUSTOMER && <p className="text-slate-500 text-xs mt-1">选择您心仪的房间，点击查看详情及预订。</p>}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">入住:</span>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">天数:</span>
            <select value={nights} onChange={(e) => setNights(Number(e.target.value))} className="bg-transparent text-sm font-medium outline-none text-slate-700 cursor-pointer">
              {[1,2,3,4,5,7,14].map(n => <option key={n} value={n}>{n} 晚</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">人数:</span>
            <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="bg-transparent text-sm font-medium outline-none text-slate-700 cursor-pointer">
              {[1,2,3,4].map(n => <option key={n} value={n}>{n} 人</option>)}
            </select>
          </div>
        </div>

        {/* 状态图例 */}
        {userRole !== UserRole.CUSTOMER && (
          <div className="hidden lg:flex space-x-3 text-[10px] font-medium uppercase tracking-wide">
            <div className="flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>空净</div>
            <div className="flex items-center"><div className="w-2 h-2 bg-rose-500 rounded-full mr-1"></div>在住</div>
            <div className="flex items-center"><div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>脏房</div>
            <div className="flex items-center"><div className="w-2 h-2 bg-slate-500 rounded-full mr-1"></div>维修</div>
          </div>
        )}
      </div>

      {/* 房间网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 overflow-y-auto pb-20">
        {rooms.map((room) => {
          const style = getStatusStyles(room.status);
          const config = ROOM_DETAILS_CONFIG[room.type];
          return (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              onContextMenu={(e) => handleContextMenu(e, room.id)}
              className={`
                relative rounded-xl border-2 transition-all duration-200 
                hover:shadow-lg flex flex-col overflow-hidden bg-white
                ${style.border} group
                ${userRole === UserRole.CUSTOMER && room.status === RoomStatus.VACANT_CLEAN ? 'hover:-translate-y-1' : ''}
              `}
            >
              {/* 图片区域 - 仅住客或详情模式可见，或者作为背景 */}
              <div className="h-24 bg-slate-100 relative overflow-hidden">
                 <img src={config.image} alt={room.type} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur ${style.text}`}>
                    {room.number}
                 </div>
              </div>

              <div className={`p-3 flex-1 flex flex-col justify-between ${style.bg}`}>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[10px] font-bold uppercase opacity-60 tracking-wider truncate mr-1" title={room.type}>{room.type}</div>
                  </div>
                  <div className={`text-xs font-bold truncate flex items-center gap-1 ${style.text}`}>
                    {style.icon}
                    {getStatusLabel(room)}
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-between items-end">
                  <div className="text-xs text-slate-500">{config.area}</div>
                  <div className="text-sm font-bold text-slate-700">¥{room.price}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 详情模态框 (Modal) */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row relative animate-scale-up">
            <button 
              onClick={() => setSelectedRoom(null)} 
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 左侧：图片 */}
            <div className="w-full md:w-1/2 h-48 md:h-auto relative">
              <img 
                src={ROOM_DETAILS_CONFIG[selectedRoom.type].image} 
                alt={selectedRoom.type} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white">{selectedRoom.number}</h3>
                <p className="text-white/80 text-sm">{selectedRoom.type}</p>
              </div>
            </div>

            {/* 右侧：信息与操作 */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
               <div className="flex-1 space-y-4">
                 <div>
                   <h4 className="font-bold text-slate-800 text-lg mb-1">房间详情</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">{ROOM_DETAILS_CONFIG[selectedRoom.type].desc}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {ROOM_DETAILS_CONFIG[selectedRoom.type].area}</div>
                    <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-blue-500" /> {ROOM_DETAILS_CONFIG[selectedRoom.type].bed}</div>
                 </div>

                 <div className="space-y-2">
                   <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide">便利设施</h5>
                   <div className="flex flex-wrap gap-2">
                      {ROOM_DETAILS_CONFIG[selectedRoom.type].amenities.map(amenity => (
                        <span key={amenity} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md flex items-center gap-1">
                          {amenity === 'Wi-Fi' ? <Wifi className="w-3 h-3" /> : 
                           amenity === '浴缸' ? <Wind className="w-3 h-3" /> :
                           amenity === '智能电视' ? <Tv className="w-3 h-3" /> :
                           <Coffee className="w-3 h-3" />}
                          {amenity}
                        </span>
                      ))}
                   </div>
                 </div>

                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center mt-4">
                    <span className="text-sm text-slate-500">当前房价 ({nights}晚)</span>
                    <span className="text-xl font-bold text-emerald-600">¥{selectedRoom.price * nights}</span>
                 </div>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100">
                 {userRole === UserRole.CUSTOMER ? (
                    selectedRoom.status === RoomStatus.VACANT_CLEAN ? (
                      <button 
                        onClick={handleGuestBook}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
                      >
                        立即预订
                      </button>
                    ) : (selectedRoom.status === RoomStatus.OCCUPIED && selectedRoom.guestName === currentUser.name) ? (
                       <button 
                        onClick={handleGuestCheckout}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                      >
                        办理退房
                      </button>
                    ) : (
                      <button disabled className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed">
                        当前不可用
                      </button>
                    )
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      {/* 员工操作按钮 - 使用无参数调用来指向 selectedRoom */}
                      {selectedRoom.status === RoomStatus.VACANT_CLEAN && (
                        <button onClick={() => handleStaffAction('CHECK_IN')} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">办理入住</button>
                      )}
                      {selectedRoom.status === RoomStatus.OCCUPIED && (
                        <button onClick={() => handleStaffAction('CHECK_OUT')} className="bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700">办理退房</button>
                      )}
                      {(selectedRoom.status !== RoomStatus.VACANT_CLEAN && selectedRoom.status !== RoomStatus.OCCUPIED) && (
                         <button onClick={() => handleStaffAction('CLEAN')} className="col-span-2 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">设为打扫完成 (空净)</button>
                      )}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 - 仅对内部员工显示 (保持原有功能，但作为快捷方式) */}
      {contextMenu && userRole !== UserRole.CUSTOMER && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-slate-200 shadow-2xl rounded-lg py-1 z-50 w-56 text-sm overflow-hidden animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 font-medium text-slate-500 text-xs">
            {rooms.find(r => r.id === contextMenu.roomId)?.number} 快捷操作
          </div>
          
          <button onClick={() => handleStaffAction('CHECK_IN')} className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-slate-700 flex items-center gap-2">
             <LogIn className="w-4 h-4" /> 办理入住
          </button>
          <button onClick={() => handleStaffAction('CHECK_OUT')} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-slate-700 flex items-center gap-2">
             <LogOut className="w-4 h-4" /> 办理退房
          </button>
          
          <div className="border-t border-slate-100 my-1"></div>
          
          <button onClick={() => handleStaffAction('CLEAN')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 设为空净
          </button>
          <button onClick={() => handleStaffAction('DIRTY')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div> 设为脏房
          </button>
           <button onClick={() => handleStaffAction('MAINTENANCE')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div> 设为维修
          </button>

          <div className="border-t border-slate-100 my-1"></div>
          <button onClick={() => handleStaffAction('DETAILS')} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4" /> 查看详情
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomGrid;
