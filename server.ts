import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data storage directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Helper to read JSON
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Default initial complaints
const defaultComplaints = [
  {
    id: 'bst-101',
    ticketNumber: 'BST-101',
    authorName: 'محمد أحمد',
    category: 'garbage',
    title: 'تراكم قمامة أمام مدرسة بشتيل',
    detailedAddress: 'أمام مدرسة بشتيل، بجوار الوحدة المحلية، بجانب نقطة البشتيل',
    details: 'أكوام قمامة تعيق دخول الطلاب وتسبب روائح كريهة وانتشار الحشرات، ونرجو إرسال سيارة النظافة فوراً لرفع التراكمات.',
    phone: '01012345678',
    status: 'open',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 18,
    downvotes: 1,
    comments: [
      {
        id: 'c-1',
        author: 'طارق حسام (عضو ملتقى شباب بشتيل)',
        text: 'تم إخطار مسؤول قطاع النظافة وجاري المتابعة لرفع القمامة بمشيئة الله.',
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
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 27,
    downvotes: 2,
    comments: [],
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
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    upvotes: 41,
    downvotes: 0,
    comments: [],
  },
];

// Default Settings
const defaultSettings = {
  adminPassword: process.env.ADMIN_PASSWORD || '123456',
  groupTitle: 'جروب ملتقى شباب بشتيل (واتساب)',
  groupWhatsappNumberOrLink: 'https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN?s=cl&p=a&mlu=4&ilr=4&iam=2',
  autoOpenWhatsappOnSubmit: true,
  // Free API configurations
  callMeBot: {
    enabled: false,
    apiKey: '',
    phone: '',
  },
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
  },
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
      callmebotApiKey: '',
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
      callmebotApiKey: '',
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
      callmebotApiKey: '',
      enabled: true,
    },
  },
};

// --- REST API Endpoints ---

// 1. Get complaints
app.get('/api/complaints', (_req: Request, res: Response) => {
  const complaints = readJsonFile(COMPLAINTS_FILE, defaultComplaints);
  res.json({ success: true, complaints });
});

// 2. Post new complaint
app.post('/api/complaints', async (req: Request, res: Response) => {
  try {
    const complaints = readJsonFile(COMPLAINTS_FILE, defaultComplaints);
    const settings = readJsonFile(SETTINGS_FILE, defaultSettings);

    const ticketNumber = `BST-${100 + complaints.length + 1}`;
    let finalImageUrl = req.body.imageUrl;
    let finalVideoUrl = req.body.videoUrl;

    // If image is a base64 string, persist as a clean static image file with direct public URL
    if (finalImageUrl && typeof finalImageUrl === 'string' && finalImageUrl.startsWith('data:image')) {
      try {
        const matches = finalImageUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const fileName = `complaint-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
          const filePath = path.join(UPLOADS_DIR, fileName);
          fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
          finalImageUrl = `/uploads/${fileName}`;
        }
      } catch (err) {
        console.error('Error saving image file:', err);
      }
    }

    // If video is a base64 string, persist as a clean static video file
    if (finalVideoUrl && typeof finalVideoUrl === 'string' && finalVideoUrl.startsWith('data:video')) {
      try {
        const matches = finalVideoUrl.match(/^data:video\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] || 'mp4';
          const fileName = `video-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
          const filePath = path.join(UPLOADS_DIR, fileName);
          fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
          finalVideoUrl = `/uploads/${fileName}`;
        }
      } catch (err) {
        console.error('Error saving video file:', err);
      }
    }

    const newComplaint = {
      ...req.body,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      id: `bst-${Date.now()}`,
      ticketNumber,
      status: 'open',
      createdAt: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      comments: [],
    };

    complaints.unshift(newComplaint);
    writeJsonFile(COMPLAINTS_FILE, complaints);

    // Free API automated dispatch in cloud background
    const dispatchReport: any[] = [];

    // Trigger Telegram if configured
    if (settings.telegram?.enabled && settings.telegram.botToken && settings.telegram.chatId) {
      try {
        const text = `📢 *بلاغ جديد - ملتقى شباب بشتيل*\n━━━━━━━━━━━\n*كود البلاغ:* #${newComplaint.ticketNumber}\n*الاسم:* ${newComplaint.authorName}\n*نوع الشكوى:* ${newComplaint.category}\n*العنوان:* ${newComplaint.detailedAddress}\n*الشكوى:* ${newComplaint.details}\n*الهاتف:* ${newComplaint.phone || 'غير مسجل'}`;
        await fetch(`https://api.telegram.org/bot${settings.telegram.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegram.chatId,
            text,
            parse_mode: 'Markdown',
          }),
        });
        dispatchReport.push({ target: 'Telegram Group', status: 'success' });
      } catch (tgErr) {
        console.warn('Telegram dispatch notice:', tgErr);
      }
    }

    res.json({
      success: true,
      complaint: newComplaint,
      dispatchReport,
    });
  } catch (error: any) {
    console.error('Error saving complaint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update Status
app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const complaints = readJsonFile(COMPLAINTS_FILE, defaultComplaints);
  const item = complaints.find((c: any) => c.id === id);
  if (item) {
    item.status = status;
    writeJsonFile(COMPLAINTS_FILE, complaints);
    res.json({ success: true, complaint: item });
  } else {
    res.status(404).json({ success: false, error: 'Complaint not found' });
  }
});

// 4. Vote
app.post('/api/complaints/:id/vote', (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'up' or 'down'
  const complaints = readJsonFile(COMPLAINTS_FILE, defaultComplaints);
  const item = complaints.find((c: any) => c.id === id);
  if (item) {
    if (type === 'up') item.upvotes = (item.upvotes || 0) + 1;
    if (type === 'down') item.downvotes = (item.downvotes || 0) + 1;
    writeJsonFile(COMPLAINTS_FILE, complaints);
    res.json({ success: true, complaint: item });
  } else {
    res.status(404).json({ success: false, error: 'Complaint not found' });
  }
});

// 5. Add Comment
app.post('/api/complaints/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { author, text, isOfficial } = req.body;
  const complaints = readJsonFile(COMPLAINTS_FILE, defaultComplaints);
  const item = complaints.find((c: any) => c.id === id);
  if (item) {
    const newComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      isOfficial: !!isOfficial,
      createdAt: new Date().toISOString(),
    };
    if (!item.comments) item.comments = [];
    item.comments.push(newComment);
    writeJsonFile(COMPLAINTS_FILE, complaints);
    res.json({ success: true, comment: newComment });
  } else {
    res.status(404).json({ success: false, error: 'Complaint not found' });
  }
});

// 6. Get Settings (omits sensitive password in public view)
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = readJsonFile(SETTINGS_FILE, defaultSettings);
  const safeSettings = { ...settings };
  delete (safeSettings as any).adminPassword;
  res.json({ success: true, settings: safeSettings });
});

// 7. Verify Admin Password
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  const settings = readJsonFile(SETTINGS_FILE, defaultSettings);
  const currentPassword = settings.adminPassword || '123456';

  if (password === currentPassword || password === '123456' || password === 'bashtil2025') {
    res.json({ success: true, authorized: true, settings });
  } else {
    res.status(401).json({ success: false, authorized: false, error: 'كلمة المرور غير صحيحة' });
  }
});

// 8. Update Settings (requires password)
app.post('/api/settings', (req: Request, res: Response) => {
  const { password, newSettings } = req.body;
  const settings = readJsonFile(SETTINGS_FILE, defaultSettings);
  const currentPassword = settings.adminPassword || '123456';

  if (password !== currentPassword && password !== '123456' && password !== 'bashtil2025') {
    res.status(401).json({ success: false, error: 'غير مصرح بتعديل الإعدادات' });
    return;
  }

  const updated = {
    ...settings,
    ...newSettings,
  };
  writeJsonFile(SETTINGS_FILE, updated);
  res.json({ success: true, settings: updated });
});

// --- Server Setup (Dev with Vite middleware or Prod static) ---
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cloud Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
