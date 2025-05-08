// تحديث لاستخدام neon serverless
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "../shared/schema";

// تكوين neon لاستخدام WebSocket
neonConfig.webSocketConstructor = ws;

// التواصل مع قاعدة البيانات
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// إنشاء مثيل لـ Drizzle ORM باستخدام المخطط المحدد
export const db = drizzle(pool, { schema });

/**
 * تأكد من إغلاق اتصال قاعدة البيانات عند إيقاف التطبيق
 * هذا يمنع تسرب الاتصالات
 */
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});