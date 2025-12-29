
import React, { useState } from 'react';
import { Customer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Mail, Phone, Calendar, Eye, EyeOff, Shield } from 'lucide-react';
import { generateMarketingInsight } from '../services/geminiService';

interface CustomerProfilesProps {
  customers: Customer[];
}

const CustomerProfiles: React.FC<CustomerProfilesProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers.length > 0 ? customers[0] : null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // 隐私脱敏函数
  const maskString = (str: string, type: 'email' | 'phone') => {
    if (showPrivacy) return str;
    if (type === 'email') {
      const parts = str.split('@');
      if (parts.length < 2) return str;
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
    if (type === 'phone') {
      return str.replace(/(\d{3})\D?(\d{4})\D?(\d{4})/, '$1-****-$3');
    }
    return str;
  };

  const handleGenerateInsight = async () => {
    if (!selectedCustomer) return;
    setLoading(true);
    setInsight(null);
    const dataStr = `姓名: ${selectedCustomer.name}, RFM: R${selectedCustomer.rfmScore.r}/F${selectedCustomer.rfmScore.f}/M${selectedCustomer.rfmScore.m}, 总消费: ¥${selectedCustomer.totalSpent}, 标签: ${selectedCustomer.tags.join(', ')}`;
    const result = await generateMarketingInsight(dataStr);
    setInsight(result);
    setLoading(false);
  };
  
  // 处理初始空状态
  if (!selectedCustomer && customers.length > 0) {
      setSelectedCustomer(customers[0]);
  }

  if (customers.length === 0) {
      return <div className="p-10 text-center text-slate-500">暂无客户数据</div>;
  }

  // 确保 selectedCustomer 始终有效 (例如删除后)
  const activeCustomer = selectedCustomer || customers[0];

  const chartData = [
    { name: '最近入住 (R)', score: activeCustomer.rfmScore.r, full: 5 },
    { name: '入住频率 (F)', score: activeCustomer.rfmScore.f, full: 5 },
    { name: '消费金额 (M)', score: activeCustomer.rfmScore.m, full: 5 },
  ];

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6">
      {/* List */}
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">客户数据库</h3>
          <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{customers.length} 位会员</span>
        </div>
        <div className="overflow-y-auto flex-1">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedCustomer(c); setInsight(null); }}
              className={`p-4 border-b cursor-pointer transition-colors group ${activeCustomer.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <div className="font-bold text-slate-800">{c.name}</div>
                {c.tags.includes('VIP') || c.totalSpent > 10000 ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">VIP</span> : null}
              </div>
              <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                <span className="flex items-center gap-1 opacity-80 group-hover:opacity-100"><Shield className="w-3 h-3" /> {maskString(c.phone, 'phone')}</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {c.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
          {/* Privacy Toggle */}
          <button 
            onClick={() => setShowPrivacy(!showPrivacy)} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title={showPrivacy ? "隐藏隐私信息" : "查看隐私信息 (需权限)"}
          >
            {showPrivacy ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {activeCustomer.name}
                {activeCustomer.rfmScore.m >= 4 && <Sparkles className="w-5 h-5 text-amber-500" />}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {activeCustomer.tags.map(t => (
                  <span key={t} className={`px-2 py-1 text-xs rounded-md border ${
                    t.includes('VIP') || t.includes('高净值') ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                    t.includes('流失') ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right mr-12">
              <div className="text-sm text-slate-500">生命周期总价值 (LTV)</div>
              <div className="text-2xl font-bold text-emerald-600">¥{activeCustomer.totalSpent.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <h4 className="font-semibold text-slate-700 mb-2 border-b pb-2">联系信息 (安全视图)</h4>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                 <Mail className="w-4 h-4 text-slate-400" /> 
                 <span className="font-mono">{maskString(activeCustomer.email, 'email')}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                 <Phone className="w-4 h-4 text-slate-400" /> 
                 <span className="font-mono">{maskString(activeCustomer.phone, 'phone')}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                 <Calendar className="w-4 h-4 text-slate-400" /> 
                 <span>最近入住: {activeCustomer.lastStay}</span>
               </div>
            </div>

            <div className="h-48">
              <h4 className="font-semibold text-slate-700 mb-2 text-center">RFM 价值模型分析</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#10b981' : entry.score >= 3 ? '#3b82f6' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32 text-indigo-600" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI 精准营销建议
              </h3>
              {!insight && !loading && (
                <button 
                  onClick={handleGenerateInsight}
                  className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  生成营销策略
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-white/50 rounded-lg p-4 text-sm text-indigo-900 leading-relaxed border border-indigo-100/50 backdrop-blur-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span>AI 正在分析 RFM 数据与客户画像标签...</span>
                </div>
              ) : insight ? (
                <div className="prose prose-indigo prose-sm">
                  <p>{insight}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-indigo-400 italic">
                  <p>点击上方按钮，让 AI 基于 "{activeCustomer.tags.join('、')}" 等标签</p>
                  <p>为您生成针对性的套餐推送建议。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfiles;
