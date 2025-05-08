const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

// تهيئة Neon DB مع WebSocket
neonConfig.webSocketConstructor = ws;

// التأكد من وجود DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL غير موجود');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addColumn() {
  try {
    const client = await pool.connect();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    
    try {
      // التحقق من وجود العمود
      console.log('التحقق من وجود العمود description...');
      const checkResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'levels' AND column_name = 'description';
      `);

      if (checkResult.rows.length === 0) {
        // إضافة العمود للجدول
        console.log('العمود غير موجود، جاري إضافته...');
        await client.query(`
          ALTER TABLE levels
          ADD COLUMN description TEXT;
        `);
        console.log('تمت إضافة العمود description إلى جدول levels بنجاح');
      } else {
        console.log('العمود description موجود بالفعل في الجدول');
      }
    } finally {
      client.release();
      console.log('تم إغلاق الاتصال');
    }
  } catch (err) {
    console.error('حدث خطأ أثناء إضافة العمود:', err);
  } finally {
    await pool.end();
    console.log('تم إنهاء الاتصال');
  }
}

addColumn();
