// Mock Data and API Simulation Layer

export interface Shipment {
  id: string;
  trackingId: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupLocation: string;
  deliveryLocation: string;
  packageDescription: string;
  weight: number;
  category: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: string;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface Ticket {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  isAgent?: boolean;
  timestamp: string;
  quickReplies?: string[];
}

export interface ChatSession {
  id: string;
  sessionId: string;
  customerName: string;
  customerEmail?: string;
  messages: ChatMessage[];
  status: 'open' | 'pending' | 'resolved' | 'closed';
  unreadCount: number;
  assignedTo?: string;
  isBot: boolean;
  createdAt: string;
  updatedAt: string;
  language: string;
}

// Generate unique tracking ID
export const generateTrackingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 5 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `MM-LX-${randomPart}`;
};

// Generate unique ticket ID
export const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// Generate unique session ID
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CHAT-${timestamp}-${random}`;
};

// Default timeline events with accurate timestamps
export const createDefaultTimeline = (status: Shipment['status'], createdAt?: string): TimelineEvent[] => {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  const statuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIndex = statuses.indexOf(status);

  const timeOffsets = [0, 4, 24, 48, 72]; // Hours from creation

  return [
    {
      id: '1',
      status: 'Order Received',
      location: 'Processing Center',
      timestamp: new Date(baseDate.getTime()).toISOString(),
      description: 'Your shipment request has been received and is being processed.',
      completed: currentIndex >= 0,
    },
    {
      id: '2',
      status: 'Picked Up',
      location: 'Local Hub',
      timestamp: new Date(baseDate.getTime() + timeOffsets[1] * 60 * 60 * 1000).toISOString(),
      description: 'Package has been picked up from the sender.',
      completed: currentIndex >= 1,
    },
    {
      id: '3',
      status: 'In Transit',
      location: 'Regional Distribution Center',
      timestamp: new Date(baseDate.getTime() + timeOffsets[2] * 60 * 60 * 1000).toISOString(),
      description: 'Your package is on its way to the destination.',
      completed: currentIndex >= 2,
    },
    {
      id: '4',
      status: 'Out for Delivery',
      location: 'Delivery Station',
      timestamp: new Date(baseDate.getTime() + timeOffsets[3] * 60 * 60 * 1000).toISOString(),
      description: 'Package is out for delivery to the recipient.',
      completed: currentIndex >= 3,
    },
    {
      id: '5',
      status: 'Delivered',
      location: 'Destination',
      timestamp: new Date(baseDate.getTime() + timeOffsets[4] * 60 * 60 * 1000).toISOString(),
      description: 'Package has been successfully delivered.',
      completed: currentIndex >= 4,
    },
  ];
};

// Testimonials mock data
export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "E-commerce Business Owner",
    content: "Movemate has transformed our shipping operations. Their tracking system is incredibly reliable, and our customers love the real-time updates.",
    avatar: "SJ",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Supply Chain Manager",
    content: "The best logistics partner we've worked with. Their global coverage and 24/7 support have been game-changers for our international shipments.",
    avatar: "MC",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Retail Operations Director",
    content: "Exceptional service and seamless integration with our systems. Movemate's platform is intuitive and their team is always responsive.",
    avatar: "ER",
    rating: 5,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Startup Founder",
    content: "As a growing business, we needed a logistics partner that could scale with us. Movemate exceeded all our expectations.",
    avatar: "DT",
    rating: 5,
  },
];

// FAQ data
export const faqData = [
  {
    category: "Tracking",
    questions: [
      {
        q: "How do I track my shipment?",
        a: "Enter your tracking ID (e.g., MM-LX-XXXXX) on our Track Shipment page. You'll see real-time status updates, location information, and estimated delivery time."
      },
      {
        q: "What do the different status updates mean?",
        a: "Our tracking statuses include: Pending (order received), Picked Up (collected from sender), In Transit (en route), Out for Delivery (with local courier), and Delivered (successfully delivered)."
      },
      {
        q: "How often is tracking information updated?",
        a: "Tracking information is updated in real-time as your package moves through our network. You can expect updates at each major checkpoint."
      },
    ]
  },
  {
    category: "Shipping",
    questions: [
      {
        q: "What are your delivery timeframes?",
        a: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business day delivery. International shipments vary by destination."
      },
      {
        q: "Do you offer international shipping?",
        a: "Yes! We provide global shipping services to over 200 countries. International delivery times and rates vary by destination."
      },
      {
        q: "What items can I ship?",
        a: "We accept most items including documents, electronics, clothing, and general merchandise. Hazardous materials, illegal items, and perishables have restrictions."
      },
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How do I create a shipping account?",
        a: "Visit our Request Tracking ID page to create shipments. For business accounts with volume discounts, contact our sales team."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, PayPal, bank transfers, and corporate billing for business accounts."
      },
    ]
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact customer support?",
        a: "You can reach us via live chat (available 24/7), submit a support ticket, call our hotline at 1-800-MOVEMATE, or email support@movemate.com."
      },
      {
        q: "What if my package is lost or damaged?",
        a: "Contact our support team immediately. We offer full tracking investigations and our insurance covers up to $500 for standard shipments."
      },
    ]
  },
];

// Bot responses
export const botResponses: Record<string, { response: string; quickReplies?: string[] }> = {
  greeting: {
    response: "Hello! I'm Movemate's virtual assistant. How can I help you today?",
    quickReplies: ["Track my shipment", "Delivery timeline", "Lost tracking ID", "Speak to an agent"],
  },
  "track my shipment": {
    response: "I'd be happy to help you track your shipment! Please enter your tracking ID (format: MM-LX-XXXXX), or visit our Track Shipment page for detailed information.",
    quickReplies: ["I don't have my tracking ID", "Go to tracking page", "Something else"],
  },
  "delivery timeline": {
    response: "Our standard delivery timeframes are:\n• Local: 1-2 business days\n• Regional: 2-3 business days\n• National: 3-5 business days\n• International: 5-10 business days\n\nWould you like more specific information?",
    quickReplies: ["Track my shipment", "International shipping", "Speak to an agent"],
  },
  "lost tracking id": {
    response: "No worries! You can find your tracking ID in:\n1. Confirmation email from us\n2. SMS notification\n3. Your account history\n\nIf you still can't find it, please provide your email/phone to look it up.",
    quickReplies: ["Submit a ticket", "Speak to an agent", "Something else"],
  },
  "speak to an agent": {
    response: "I'll connect you with a live agent. Our support team is available 24/7. Please wait while I transfer you...",
    quickReplies: ["Submit a ticket", "View FAQ", "Back to main menu"],
  },
  default: {
    response: "I'm here to help! Please choose from the options below or type your question.",
    quickReplies: ["Track my shipment", "Delivery timeline", "Lost tracking ID", "Speak to an agent"],
  },
};

// Multi-language translations
export const translations: Record<string, Record<string, string>> = {
  en: {
    greeting: "Hello! I'm Movemate's virtual assistant. How can I help you today?",
    trackShipment: "Track my shipment",
    deliveryTimeline: "Delivery timeline",
    lostTrackingId: "Lost tracking ID",
    speakToAgent: "Speak to an agent",
    online: "Online",
    offline: "Offline",
    typingMessage: "Type your message...",
  },
  es: {
    greeting: "¡Hola! Soy el asistente virtual de Movemate. ¿Cómo puedo ayudarte hoy?",
    trackShipment: "Rastrear mi envío",
    deliveryTimeline: "Tiempo de entrega",
    lostTrackingId: "ID de seguimiento perdido",
    speakToAgent: "Hablar con un agente",
    online: "En línea",
    offline: "Desconectado",
    typingMessage: "Escribe tu mensaje...",
  },
  fr: {
    greeting: "Bonjour! Je suis l'assistant virtuel de Movemate. Comment puis-je vous aider aujourd'hui?",
    trackShipment: "Suivre mon envoi",
    deliveryTimeline: "Délai de livraison",
    lostTrackingId: "ID de suivi perdu",
    speakToAgent: "Parler à un agent",
    online: "En ligne",
    offline: "Hors ligne",
    typingMessage: "Tapez votre message...",
  },
  de: {
    greeting: "Hallo! Ich bin der virtuelle Assistent von Movemate. Wie kann ich Ihnen heute helfen?",
    trackShipment: "Meine Sendung verfolgen",
    deliveryTimeline: "Lieferzeit",
    lostTrackingId: "Tracking-ID verloren",
    speakToAgent: "Mit einem Agenten sprechen",
    online: "Online",
    offline: "Offline",
    typingMessage: "Nachricht eingeben...",
  },
  zh: {
    greeting: "您好！我是Movemate的虚拟助手。今天我能帮您什么？",
    trackShipment: "追踪我的包裹",
    deliveryTimeline: "配送时间",
    lostTrackingId: "丢失追踪号",
    speakToAgent: "联系客服",
    online: "在线",
    offline: "离线",
    typingMessage: "输入您的消息...",
  },
  ar: {
    greeting: "مرحباً! أنا المساعد الافتراضي لـ Movemate. كيف يمكنني مساعدتك اليوم؟",
    trackShipment: "تتبع شحنتي",
    deliveryTimeline: "وقت التسليم",
    lostTrackingId: "رقم التتبع المفقود",
    speakToAgent: "التحدث مع وكيل",
    online: "متصل",
    offline: "غير متصل",
    typingMessage: "اكتب رسالتك...",
  },
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

// Statistics
export const statistics = [
  { label: "Deliveries Completed", value: "5,000+", icon: "package" },
  { label: "Countries Covered", value: "200+", icon: "globe" },
  { label: "Support Available", value: "24/7", icon: "headset" },
  { label: "Customer Satisfaction", value: "99.8%", icon: "star" },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  SHIPMENTS: 'movemate_shipments',
  TICKETS: 'movemate_tickets',
  CHAT_HISTORY: 'movemate_chat_history',
  CHAT_SESSIONS: 'movemate_chat_sessions',
  CURRENT_SESSION: 'movemate_current_session',
  RECENT_TRACKING: 'movemate_recent_tracking',
  THEME: 'movemate_theme',
  FORM_DRAFT: 'movemate_form_draft',
  ADMIN_AUTH: 'movemate_admin_auth',
};

// Simulate API delay
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Local Storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
};

// Sample chat sessions for demo
export const createSampleChatSessions = (): ChatSession[] => {
  const now = new Date();
  return [
    {
      id: '1',
      sessionId: 'CHAT-ABC123',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      messages: [
        {
          id: '1',
          content: "Hello! I'm Movemate's virtual assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        },
        {
          id: '2',
          content: "Hi, I need help tracking my package MM-LX-ABC12",
          isBot: false,
          timestamp: new Date(now.getTime() - 28 * 60000).toISOString(),
        },
        {
          id: '3',
          content: "Let me check that for you. Your package is currently in transit.",
          isBot: true,
          timestamp: new Date(now.getTime() - 27 * 60000).toISOString(),
        },
      ],
      status: 'open',
      unreadCount: 1,
      isBot: true,
      createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 27 * 60000).toISOString(),
      language: 'en',
    },
    {
      id: '2',
      sessionId: 'CHAT-DEF456',
      customerName: 'Maria Garcia',
      customerEmail: 'maria.g@email.com',
      messages: [
        {
          id: '1',
          content: "¡Hola! Necesito ayuda con mi envío.",
          isBot: false,
          timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
      ],
      status: 'pending',
      unreadCount: 1,
      isBot: false,
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      language: 'es',
    },
    {
      id: '3',
      sessionId: 'CHAT-GHI789',
      customerName: 'Alex Wong',
      customerEmail: 'alex.wong@email.com',
      messages: [
        {
          id: '1',
          content: "Package delivered, thanks!",
          isBot: false,
          timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
        },
      ],
      status: 'resolved',
      unreadCount: 0,
      isBot: false,
      createdAt: new Date(now.getTime() - 25 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      language: 'en',
    },
  ];
};

// Sample shipments for demo
export const createSampleShipments = (): Shipment[] => {
  const now = new Date();
  return [
    {
      id: '1',
      trackingId: 'MM-LX-ABC12',
      senderName: 'John Smith',
      senderPhone: '+1 555-0101',
      receiverName: 'Jane Doe',
      receiverPhone: '+1 555-0102',
      pickupLocation: '123 Main St, New York, NY',
      deliveryLocation: '456 Oak Ave, Los Angeles, CA',
      packageDescription: 'Electronics - Laptop',
      weight: 2.5,
      category: 'electronics',
      status: 'in_transit',
      currentLocation: 'Phoenix Distribution Center',
      estimatedDelivery: new Date(now.getTime() + 2 * 24 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
      updatedAt: now.toISOString(),
      timeline: createDefaultTimeline('in_transit', new Date(now.getTime() - 2 * 24 * 3600000).toISOString()),
    },
    {
      id: '2',
      trackingId: 'MM-LX-DEF34',
      senderName: 'Bob Johnson',
      senderPhone: '+1 555-0201',
      receiverName: 'Alice Brown',
      receiverPhone: '+1 555-0202',
      pickupLocation: '789 Pine St, Chicago, IL',
      deliveryLocation: '321 Elm St, Miami, FL',
      packageDescription: 'Documents - Legal Papers',
      weight: 0.5,
      category: 'documents',
      status: 'out_for_delivery',
      currentLocation: 'Miami Delivery Station',
      estimatedDelivery: now.toISOString(),
      createdAt: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(),
      updatedAt: now.toISOString(),
      timeline: createDefaultTimeline('out_for_delivery', new Date(now.getTime() - 3 * 24 * 3600000).toISOString()),
    },
    {
      id: '3',
      trackingId: 'MM-LX-GHI56',
      senderName: 'Carol White',
      senderPhone: '+1 555-0301',
      receiverName: 'David Lee',
      receiverPhone: '+1 555-0302',
      pickupLocation: '567 Cedar Rd, Seattle, WA',
      deliveryLocation: '890 Birch Ln, Denver, CO',
      packageDescription: 'Clothing - Winter Jacket',
      weight: 1.2,
      category: 'clothing',
      status: 'pending',
      currentLocation: 'Seattle Processing Center',
      estimatedDelivery: new Date(now.getTime() + 5 * 24 * 3600000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      timeline: createDefaultTimeline('pending', now.toISOString()),
    },
    {
      id: '4',
      trackingId: 'MM-LX-JKL78',
      senderName: 'Eve Martinez',
      senderPhone: '+1 555-0401',
      receiverName: 'Frank Wilson',
      receiverPhone: '+1 555-0402',
      pickupLocation: '234 Maple Dr, Boston, MA',
      deliveryLocation: '678 Walnut St, Atlanta, GA',
      packageDescription: 'Fragile - Glassware Set',
      weight: 5.0,
      category: 'fragile',
      status: 'delivered',
      currentLocation: 'Delivered',
      estimatedDelivery: new Date(now.getTime() - 1 * 24 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 3600000).toISOString(),
      timeline: createDefaultTimeline('delivered', new Date(now.getTime() - 5 * 24 * 3600000).toISOString()),
    },
  ];
};

// Sample tickets for demo
export const createSampleTickets = (): Ticket[] => {
  const now = new Date();
  return [
    {
      id: '1',
      ticketId: 'TKT-XYZ123',
      name: 'Robert Taylor',
      email: 'robert.t@email.com',
      subject: 'Package Delayed',
      category: 'Shipping',
      message: 'My package MM-LX-ABC12 was supposed to arrive yesterday but tracking still shows in transit.',
      status: 'open',
      createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
      responses: [],
    },
    {
      id: '2',
      ticketId: 'TKT-ABC456',
      name: 'Sarah Connor',
      email: 'sarah.c@email.com',
      subject: 'Damaged Package',
      category: 'Support',
      message: 'My package arrived with visible damage to the box. Contents seem intact but I want to file a report.',
      status: 'in_progress',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      responses: [
        {
          id: '1',
          message: 'Thank you for reporting this. We have initiated an investigation and will update you within 24 hours.',
          isAdmin: true,
          timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
        },
      ],
    },
    {
      id: '3',
      ticketId: 'TKT-DEF789',
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      subject: 'Billing Inquiry',
      category: 'Billing',
      message: 'I was charged twice for my last shipment. Please refund the duplicate charge.',
      status: 'resolved',
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      responses: [
        {
          id: '1',
          message: 'We apologize for the inconvenience. The duplicate charge has been refunded. Please allow 3-5 business days for it to reflect.',
          isAdmin: true,
          timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
        },
      ],
    },
  ];
};