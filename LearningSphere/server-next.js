// server-next.js
// النسخة المحسنة للخادم المتكامل بين Next.js و Express

const express = require('express');
const next = require('next');
const { createServer } = require('http');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Determine if we're in development or production
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0'; // Use 0.0.0.0 for Replit compatibility
const port = process.env.PORT || 5000;

// Initialize Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  // إنشاء تطبيق Express
  const app = express();
  
  // إعداد الوسطاء الأساسية
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // تخديم مجلد التحميلات كمجلد ساكن إذا كان موجوداً
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // وسيط تسجيل طلبات API
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    console.log(`API Request: ${req.method} ${req.url}`);
    
    // تسجيل وقت الاستجابة
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
    });
    
    next();
  });
  
  // محاولة تحميل مسارات API من ملف المسارات الرئيسي
  try {
    // استخدام المسارات المحددة في الملف routes.ts
    const routes = require('./server/routes');
    if (typeof routes.registerRoutes === 'function') {
      const httpServer = createServer(app);
      routes.registerRoutes(app, httpServer);
      console.log('API routes registered successfully');
    } else {
      // إذا وجد ملف المسارات ولكن ليس لديه الدالة المطلوبة
      console.log('API routes module found but no registerRoutes function available');
      app.use('/api', require('./server/routes/index').router);
    }
  } catch (error) {
    console.log('API routes not loaded. This is expected during development with Next.js only.');
    // إنشاء نقطة نهاية بسيطة للاختبار
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'API server is running' });
    });
  }
  
  // معالجة أخطاء API
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  
  // Next.js يتعامل مع جميع المسارات الأخرى
  app.all('*', (req, res) => {
    return handle(req, res);
  });
  
  // بدء تشغيل الخادم
  app.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});