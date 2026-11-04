import { Complaint, DispatchSettings } from '../types';

export const CATEGORY_LABELS: Record<string, { label: string; badge: string; color: string; icon: string }> = {
  garbage: {
    label: 'تراكم قمامة ونظافة',
    badge: 'قمامة',
    color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    icon: 'Trash2',
  },
  roads: {
    label: 'طرق ورصف وحفر',
    badge: 'طريق',
    color: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    icon: 'AlertTriangle',
  },
  water: {
    label: 'مياه وصرف صحي',
    badge: 'مياه وصرف',
    color: 'bg-sky-900/60 text-sky-300 border-sky-700/50',
    icon: 'Droplets',
  },
  electricity: {
    label: 'أعمدة إنارة وكهرباء',
    badge: 'إنارة وكهرباء',
    color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
    icon: 'Zap',
  },
  encroachments: {
    label: 'إشغالات ومحليات ومخالفات',
    badge: 'محليات',
    color: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
    icon: 'Building2',
  },
  other: {
    label: 'شكاوى عامة أخرى',
    badge: 'أخرى',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: 'HelpCircle',
  },
};

export const STATUS_LABELS: Record<string, { label: string; color: string; bgClass: string }> = {
  open: {
    label: 'مفتوحة',
    color: 'text-rose-400',
    bgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  },
  in_progress: {
    label: 'قيد المعالجة',
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  },
  resolved: {
    label: 'تم الحل',
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  },
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'bst-101',
    ticketNumber: 'BST-101',
    authorName: 'محمد أحمد',
    category: 'garbage',
    title: 'تراكم قمامة أمام مدرسة بشتيل',
    detailedAddress: 'أمام مدرسة بشتيل، بجوار الوحدة المحلية، بجانب نقطة البشتيل',
    details: 'أكوام قمامة تعيق دخول الطلاب وتسبب روائح كريهة وانتشار الحشرات، ونرجو إرسال سيارة النظافة فوراً لرفع التراكمات.',
    phone: '01012345678',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    status: 'open',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    upvotes: 15,
    downvotes: 1,
    comments: [
      {
        id: 'c-1',
        author: 'طارق حسام (عضو ملتقى شباب بشتيل)',
        text: 'تم إخطار مسؤول قطاع النظافة وجاري المتابعة لرفع القمامة صباح اليوم بمشيئة الله.',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        isOfficial: true,
      },
    ],
  },
  {
    id: 'bst-102',
    ticketNumber: 'BST-102',
    authorName: 'فاطمة علي',
    category: 'roads',
    title: 'حفرة كبيرة في شارع الجمهورية',
    detailedAddress: 'شارع الجمهورية، أمام كشك أشرف',
    details: 'حفرة عميقة تشكل خطراً كبيراً على السيارات والمارة خصوصاً الأطفال بعد غروب الشمس، وتسببت في تلف إطارات أكثر من سيارة.',
    phone: '01123456789',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    upvotes: 23,
    downvotes: 2,
    comments: [
      {
        id: 'c-2',
        author: 'م. خالد الديب (مسؤول الطرق)',
        text: 'تمت المعاينة ومدرجة ضمن خطة ردم الحفر ورصف القطاع غداً.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isOfficial: true,
      },
    ],
  },
  {
    id: 'bst-103',
    ticketNumber: 'BST-103',
    authorName: 'حاج سعيد الشريف',
    category: 'water',
    title: 'كسر ماسورة مياه وغرق الشارع',
    detailedAddress: 'شارع النفق المتفرع من شارع المحطة، بجوار صيدلية الدكتور وليد',
    details: 'تسريب مياه شرب غزير أدى لقطع المياه عن المنازل المجاورة وتجمع بركة مياه تعيق حركة السير.',
    phone: '01234567890',
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    upvotes: 38,
    downvotes: 0,
    comments: [],
  },
  {
    id: 'bst-104',
    ticketNumber: 'BST-104',
    authorName: 'إبراهيم دسوقي',
    category: 'electricity',
    title: 'انقطاع إضاءة 4 أعمدة إنارة بمحيط مزلقان بشتيل',
    detailedAddress: 'طريق المزلقان القديم، بجوار سور السكة الحديد بشتيل',
    details: 'المنطقة مظلمة تماماً منذ يومين وتسبب قلقاً للمشاة في الليل، الأعمدة تحتاج لتغيير لمبات وصيانة أسلاك.',
    phone: '01511223344',
    status: 'resolved',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    upvotes: 45,
    downvotes: 0,
    comments: [
      {
        id: 'c-3',
        author: 'فريق صيانة كهرباء بشتيل',
        text: 'تم بحمد الله تغيير الكشافات وصيانة الأسلاك وعادت الإنارة للعمل بصورة طبيعية.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isOfficial: true,
      },
    ],
  },
];

export const DEFAULT_DISPATCH_SETTINGS: DispatchSettings = {
  adminPassword: '123456',
  groupTitle: 'جروب ملتقى شباب بشتيل (واتساب)',
  groupWhatsappNumberOrLink: 'https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN?s=cl&p=a&mlu=4&ilr=4&iam=2',
  autoOpenWhatsappOnSubmit: true,
  globalWebhookApi: 'https://api.example.com/bashtil/webhooks/all-complaints',
  officials: {
    garbage: {
      id: 'off-garbage',
      categoryKey: 'garbage',
      title: 'مسؤول قطاع النظافة والبيئة ببشتيل',
      officialName: 'أ. محمود سالم (هيئة النظافة والتجميل)',
      role: 'مفتش النظافة بقطاع بشتيل والوراق',
      whatsappNumber: '201001234561',
      webhookApiUrl: 'https://api.example.com/bashtil/apis/garbage-department',
      enabled: true,
    },
    water: {
      id: 'off-water',
      categoryKey: 'water',
      title: 'مسؤول شبكات مياه الشرب والصرف الصحي',
      officialName: 'م. أحمد ربيع (شركة المياه والصرف)',
      role: 'رئيس شبكات الصرف ومياه الشرب ببشتيل',
      whatsappNumber: '201001234562',
      webhookApiUrl: 'https://api.example.com/bashtil/apis/water-department',
      enabled: true,
    },
    municipality: {
      id: 'off-municipality',
      categoryKey: 'roads',
      title: 'مسؤول المحليات والطرق والإنارة',
      officialName: 'أ. سامي عبد الحميد (الوحدة المحلية)',
      role: 'مشرف الإشغالات والطرق والإنارة بمجلس المدينة',
      whatsappNumber: '201001234563',
      webhookApiUrl: 'https://api.example.com/bashtil/apis/municipality-roads',
      enabled: true,
    },
  },
};
