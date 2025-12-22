
import React, { useState } from 'react';
import { PricingRule, ExternalEvent, RoomType } from '../types';
import { Plus, Trash2, Zap, ArrowUpRight, ArrowDownRight, Calendar as CalendarIcon, MapPin, HelpCircle, Filter } from 'lucide-react';

const PricingEngine: React.FC = () => {
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(RoomType.DOUBLE);
  
  // 基础价格映射
  const basePrices: Record<RoomType, number> = {
    [RoomType.SINGLE]: 180,
    [RoomType.DOUBLE]: 280,
    [RoomType.SUITE]: 580,
    [RoomType.DELUXE]: 420,
  };

  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: '高入住率自动涨价',
      conditionField: 'OCCUPANCY',
      operator: '>',
      value: '80',
      adjustmentType: 'PERCENT',
      adjustmentValue: 20,
      active: true,
      description: '当实时入住率超过80%时，系统认为需求旺盛，自动触发溢价策略以提升RevPAR。'
    },
    {
      id: '2',
      name: '大型活动/演唱会溢价',
      conditionField: 'EXTERNAL_EVENT',
      operator: '=',
      value: 'CONCERT',
      adjustmentType: 'PERCENT',
      adjustmentValue: 35,
      active: true,
      description: '对接本地票务接口，检测到周边3km内有大型演唱会时，自动调高房价。'
    },
    {
      id: '3',
      name: '尾房甩卖优惠',
      conditionField: 'LEAD_TIME',
      operator: '<',
      value: '0', // 当天
      adjustmentType: 'PERCENT',
      adjustmentValue: -15,
      active: true,
      description: '针对当日22:00后仍未售出的空房进行降价促销，减少空置损失。'
    },
  ]);

  const externalEvents: ExternalEvent[] = [
    { date: '2023-10-01', name: '国庆节假期', type: 'HOLIDAY', impactLevel: 'HIGH' },
    { date: '2023-10-05', name: '周杰伦演唱会 (体育中心)', type: 'CONCERT', impactLevel: 'HIGH' },
    { date: '2023-10-20', name: '互联网科技峰会', type: 'CONFERENCE', impactLevel: 'MEDIUM' },
  ];

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  // Mock Calendar Data Generation
  const generateCalendarDays = () => {
    const days = [];
    const currentBasePrice = basePrices[selectedRoomType];

    for (let i = 1; i <= 30; i++) {
      const dateStr = `2023-10-${i.toString().padStart(2, '0')}`;
      const event = externalEvents.find(e => e.date === dateStr);
      
      let multiplier = 1;
      
      // Simple logic to visualize pricing impact
      // 1. Holiday Rule
      if (i >= 1 && i <= 7) multiplier += 0.5; 
      // 2. Event Rule
      if (i === 5) multiplier += 0.35; 
      // 3. Conference
      if (i === 20) multiplier += 0.2; 
      
      days.push({
        day: i,
        price: Math.round(currentBasePrice * multiplier),
        level: multiplier > 1.5 ? 'high' : multiplier > 1 ? 'medium' : 'normal',
        event
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            智能动态调价引擎
          </h2>
          <p className="text-slate-500 mt-1">基于规则引擎与外部数据（节日、活动）的收益管理系统。</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> 添加规则
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 mb-2">生效中的定价策略</h3>
          {rules.map((rule) => (
            <div key={rule.id} className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${rule.active ? 'border-purple-200 shadow-purple-50' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg mt-1 ${rule.active ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{rule.name}</h4>
                    <div className="text-slate-500 text-xs mt-2 flex items-center flex-wrap gap-2">
                      <span className="bg-slate-100 px-2 py-1 rounded font-mono uppercase border border-slate-200">{rule.conditionField}</span>
                      <span className="font-bold text-slate-400">{rule.operator}</span>
                      <span className="font-bold text-slate-700">{rule.value}</span>
                      <span className="text-slate-400">→</span>
                      <span className={`font-bold flex items-center px-2 py-1 rounded ${rule.adjustmentValue > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {rule.adjustmentValue > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(rule.adjustmentValue)}{rule.adjustmentType === 'PERCENT' ? '%' : '元'}
                      </span>
                    </div>
                    {rule.description && (
                      <div className="mt-3 text-sm text-slate-500 flex items-start gap-1.5 bg-slate-50 p-2 rounded">
                        <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {rule.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={rule.active} onChange={() => toggleRule(rule.id)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <button onClick={() => deleteRule(rule.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Visualization */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full">
            <div className="flex flex-col gap-3 mb-4 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> 价格模拟
                </h3>
                <div className="text-xs flex gap-2">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>旺季</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>平日</div>
                </div>
              </div>
              
              {/* 房型选择器 */}
              <div className="flex items-center gap-2">
                 <Filter className="w-3 h-3 text-slate-400" />
                 <select 
                   value={selectedRoomType}
                   onChange={(e) => setSelectedRoomType(e.target.value as RoomType)}
                   className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-400"
                 >
                   <option value={RoomType.SINGLE}>单人间 (基价 ¥{basePrices[RoomType.SINGLE]})</option>
                   <option value={RoomType.DOUBLE}>双人大床房 (基价 ¥{basePrices[RoomType.DOUBLE]})</option>
                   <option value={RoomType.DELUXE}>豪华景观房 (基价 ¥{basePrices[RoomType.DELUXE]})</option>
                   <option value={RoomType.SUITE}>行政套房 (基价 ¥{basePrices[RoomType.SUITE]})</option>
                 </select>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['日','一','二','三','四','五','六'].map(d => <div key={d} className="text-xs text-slate-400 font-medium">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty slots for start of month (mock) */}
              <div className="col-span-6"></div> 
              {calendarDays.map((d) => (
                <div 
                  key={d.day} 
                  className={`
                    relative aspect-square rounded-lg flex flex-col items-center justify-center border text-xs cursor-pointer hover:scale-105 transition-transform group
                    ${d.level === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 
                      d.level === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                      'bg-emerald-50 border-emerald-200 text-emerald-700'}
                  `}
                >
                  <span className="font-bold">{d.day}</span>
                  <span className="scale-75">¥{d.price}</span>
                  
                  {d.event && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" title={d.event.name}></div>
                  )}

                  {/* Hover Tooltip */}
                  {d.event && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-slate-800 text-white p-2 rounded text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      <div className="font-bold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.event.name}</div>
                      <div>建议上调: {d.event.impactLevel === 'HIGH' ? '30%+' : '15%+'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
              <div className="font-bold mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 外部数据洞察
              </div>
              <p>系统检测到 <strong>10月5日</strong> 周边有 "周杰伦演唱会"，已自动应用大型活动溢价策略。建议关注库存流转速度。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingEngine;
