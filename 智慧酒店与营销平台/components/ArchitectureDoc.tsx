import React from 'react';
import { Database, Server, Layout, FileCode, Lock, Calculator, Code } from 'lucide-react';

const ArchitectureDoc: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">技术架构设计文档</h1>
      <p className="text-slate-500 mb-8">智慧酒店管理与营销平台 (B/S 架构)</p>

      {/* Project Structure */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-blue-600" /> 项目目录结构 (Maven/Spring Boot)
        </h2>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto shadow-md">
          <pre>{`
com.smarthotel
├── common           // 全局工具类、常量、异常处理
├── config           // 配置类 (Redis, MyBatis, Security)
├── modules
│   ├── system       // RBAC权限, 认证, 用户管理
│   ├── hotel        // 房源, 楼层, 楼宇管理
│   ├── marketing    // 优惠券, 营销活动
│   ├── customer     // CRM, RFM 客户画像分析
│   └── pricing      // 动态调价规则引擎
│       ├── strategy
│       │   ├── PricingStrategy.java
│       │   ├── BasePriceStrategy.java
│       │   ├── HolidayStrategy.java
│       │   ├── OccupancyStrategy.java
│       │   └── VipStrategy.java
│       └── service
│           └── PricingCalculatorService.java
├── integration      // 外部接口 (LLM, 支付网关)
└── SmartHotelApplication.java
          `}</pre>
        </div>
      </section>

      {/* Core Service Logic */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <FileCode className="w-5 h-5 text-amber-600" /> 核心业务逻辑 (Java Spring Boot)
        </h2>

        {/* Strategy Pattern */}
        <div className="space-y-6 mb-8">
           <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
               <Calculator className="w-4 h-4 text-slate-500" />
               1. 智能动态调价引擎 (策略模式)
             </h3>
             <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200">复杂业务逻辑</span>
           </div>
           
           <p className="text-sm text-slate-600 mb-2">
             实现链式定价逻辑: <strong>基础价 (Base)</strong> &rarr; <strong>节假日涨幅 (*1.5)</strong> &rarr; <strong>库存告急 (*1.2)</strong> &rarr; <strong>VIP会员折扣 (*0.85)</strong>。
             使用 Spring 的 <code>@Order</code> 注解来控制策略执行顺序。
           </p>
           
           <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-md border-l-4 border-amber-500 leading-relaxed">
<pre>{`/**
 * 定价上下文：在策略链中传递状态
 */
@Data
public class PricingContext {
    private Long roomTypeId;
    private LocalDate checkInDate;
    private Long userId;
    private BigDecimal currentPrice; // 可变价格累加器
}

/**
 * 策略接口
 */
public interface PricingStrategy {
    void apply(PricingContext ctx);
}

/**
 * 1. 基础价策略 (初始化)
 */
@Component
@Order(1)
public class BasePriceStrategy implements PricingStrategy {
    @Autowired private RoomTypeMapper roomTypeMapper;

    public void apply(PricingContext ctx) {
        RoomType rt = roomTypeMapper.selectById(ctx.getRoomTypeId());
        ctx.setCurrentPrice(rt.getBasePrice());
    }
}

/**
 * 2. 节假日规则 (+50%)
 */
@Component
@Order(2)
public class HolidayStrategy implements PricingStrategy {
    @Autowired private CalendarService calendarService;

    public void apply(PricingContext ctx) {
        if (calendarService.isHoliday(ctx.getCheckInDate())) {
            BigDecimal surged = ctx.getCurrentPrice().multiply(new BigDecimal("1.5"));
            ctx.setCurrentPrice(surged);
        }
    }
}

/**
 * 3. 库存规则 (剩余 < 20% 时 +20%)
 */
@Component
@Order(3)
public class OccupancyStrategy implements PricingStrategy {
    @Autowired private InventoryService inventoryService;

    public void apply(PricingContext ctx) {
        double stockRate = inventoryService.getStockRate(ctx.getRoomTypeId(), ctx.getCheckInDate());
        if (stockRate < 0.20) {
            BigDecimal surged = ctx.getCurrentPrice().multiply(new BigDecimal("1.2"));
            ctx.setCurrentPrice(surged);
        }
    }
}

/**
 * 4. VIP 规则 (金卡会员 -15%)
 */
@Component
@Order(4)
public class VipStrategy implements PricingStrategy {
    @Autowired private UserMapper userMapper;

    public void apply(PricingContext ctx) {
        User user = userMapper.selectById(ctx.getUserId());
        if (user != null && "GOLD".equals(user.getLevel())) {
            BigDecimal discount = ctx.getCurrentPrice().multiply(new BigDecimal("0.85"));
            ctx.setCurrentPrice(discount);
        }
    }
}

/**
 * Service: 策略编排者
 */
@Service
public class PricingCalculatorService {
    // Spring 自动注入所有实现类，并按 @Order 排序
    @Autowired
    private List<PricingStrategy> pricingStrategies;

    public BigDecimal calculateFinalPrice(Long roomTypeId, LocalDate date, Long userId) {
        PricingContext ctx = new PricingContext();
        ctx.setRoomTypeId(roomTypeId);
        ctx.setCheckInDate(date);
        ctx.setUserId(userId);
        
        // 执行策略链
        for (PricingStrategy strategy : pricingStrategies) {
            strategy.apply(ctx);
        }
        
        return ctx.getCurrentPrice().setScale(2, RoundingMode.HALF_UP);
    }
}`}</pre>
           </div>
        </div>

        {/* Concurrency Control */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
               <Lock className="w-4 h-4 text-slate-500" />
               2. 房态库存管理 (Redis 分布式锁)
             </h3>
             <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200">高并发处理</span>
           </div>
           
           <p className="text-sm text-slate-600 mb-2">
             使用 <strong>Redis (Redisson)</strong> 防止“超卖”现象。这确保了即使两个用户在同一毫秒点击“预订”，也只有一个事务能成功。
           </p>
           
           <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-md border-l-4 border-red-500 leading-relaxed">
<pre>{`@Service
public class BookingService {
    @Autowired
    private RedissonClient redisson; // Redisson SDK
    
    @Autowired
    private RoomMapper roomMapper;

    @Transactional
    public BookingResult bookRoom(Long roomId, Long userId) {
        // 定义细粒度的锁 Key
        String lockKey = "lock:room_inventory:" + roomId;
        RLock lock = redisson.getLock(lockKey);
        
        try {
            // tryLock(等待时间, 租期, 单位)
            // 最多等待 2秒。
            // 获取锁后 10秒 自动释放，防止死锁（如服务器宕机）。
            boolean isLocked = lock.tryLock(2, 10, TimeUnit.SECONDS);
            
            if (!isLocked) {
                return BookingResult.failed("系统繁忙，请稍后再试。");
            }
            
            // --- 临界区开始 ---
            
            // 1. 双重检查库存 (DB)
            Room room = roomMapper.selectById(roomId);
            if (room.getStatus() != RoomStatus.VACANT_CLEAN) {
                return BookingResult.failed("该房间刚刚已被抢订。");
            }
            
            // 2. 执行预订逻辑
            room.setStatus(RoomStatus.OCCUPIED);
            room.setGuestId(userId);
            roomMapper.updateById(room);
            
            createOrderRecord(room, userId);
            
            // --- 临界区结束 ---
            
            return BookingResult.success();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SystemException("锁获取被中断");
        } finally {
            // 仅释放当前线程持有的锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}`}</pre>
           </div>
        </div>
      </section>

      {/* ER Diagram Description (Summary) */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-600" /> 数据库 Schema 设计 (摘要)
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
               <Database className="w-3 h-3" /> rooms (客房表)
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
              <li><code>id</code> (主键)</li>
              <li><code>room_number</code> (房号)</li>
              <li><code>type_id</code> (外键: 房型)</li>
              <li><code>status</code> (状态: 0=空净, 1=在住...)</li>
              <li><code>version</code> (乐观锁版本号)</li>
            </ul>
          </div>
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
             <h3 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
               <Code className="w-3 h-3" /> dynamic_pricing_rules (规则表)
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
              <li><code>id</code> (主键)</li>
              <li><code>condition_field</code> (条件字段: 如 OCCUPANCY)</li>
              <li><code>threshold</code> (阈值: 如 0.2)</li>
              <li><code>adjustment_factor</code> (调整系数: 如 1.2)</li>
              <li><code>priority</code> (优先级)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArchitectureDoc;