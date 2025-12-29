
export enum RoomStatus {
  VACANT_CLEAN = 'VACANT_CLEAN',
  VACANT_DIRTY = 'VACANT_DIRTY',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum RoomType {
  SINGLE = '单人间',
  DOUBLE = '双人大床房',
  SUITE = '行政套房',
  DELUXE = '豪华景观房'
}

export enum UserRole {
  MANAGER = 'MANAGER',       // 酒店经理：全权限
  FRONT_DESK = 'FRONT_DESK', // 前台：房态操作、入住办理
  CUSTOMER = 'CUSTOMER'      // 住客：浏览、预订、查看有限服务
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  price: number;
  guestName?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  conditionField: 'OCCUPANCY' | 'DATE' | 'LEAD_TIME' | 'EXTERNAL_EVENT';
  operator: '>' | '<' | '=' | 'BETWEEN';
  value: string | number;
  adjustmentType: 'PERCENT' | 'FIXED';
  adjustmentValue: number;
  active: boolean;
  description?: string; // 规则解释
}

// 外部事件数据，用于定价参考
export interface ExternalEvent {
  date: string;
  name: string;
  type: 'HOLIDAY' | 'CONCERT' | 'CONFERENCE' | 'WEATHER';
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastStay: string;
  totalStays: number; // Frequency
  totalSpent: number; // Monetary
  rfmScore: {
    r: number; // Recency 1-5
    f: number; // Frequency 1-5
    m: number; // Monetary 1-5
  };
  tags: string[]; // 画像标签：商务、亲子、价格敏感等
}

export interface Staff {
  id: string;
  name: string;
  role: 'MANAGER' | 'FRONT_DESK' | 'MAINTENANCE' | 'CLEANING';
  department: string;
  area: string; // 负责区域 e.g. "3F-5F", "大堂", "全区"
  phone: string;
  email: string;
  onDuty: boolean;
  guestVisible: boolean; // 是否允许住客查询联系方式
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
