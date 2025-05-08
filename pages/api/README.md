# تعطيل API Routes في Next.js

**ملاحظة مهمة**: تم تعطيل API Routes في Next.js في هذا المشروع.

## السبب
نحن نعتمد بشكل كامل على خادم Express.js الموجود في مجلد `/server` للواجهة الخلفية (Backend) بسبب:

1. خادم Express جاهز مسبقاً ومنظم جيداً
2. يوفر Express مرونة أكبر في التعامل مع:
   - المصادقة والجلسات
   - رفع الملفات
   - WebSockets
   - Middlewares المخصصة

## بنية المشروع
- **Next.js** (`/pages`): يستخدم فقط للواجهة الأمامية (Frontend) وتقديم صفحات SSR/SSG
- **Express** (`/server`): يتعامل مع جميع طلبات API والعمليات في الخلفية

## API Endpoints
جميع نقاط النهاية متاحة من خلال الخادم Express على المسار `/api/*`

أي استدعاء API يجب أن يتم توجيهه إلى خادم Express وليس إلى Next.js API Routes.