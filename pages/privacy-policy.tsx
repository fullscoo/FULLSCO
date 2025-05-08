import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { Page } from '@/shared/schema';

export default function PrivacyPolicy() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // محاولة استرداد صفحة سياسة الخصوصية من واجهة API
    setLoading(true);

    fetch('/api/pages/privacy-policy')
      .then(res => {
        if (!res.ok) {
          throw new Error(`حدث خطأ: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setPage(data.page);
        setError(null);
      })
      .catch(err => {
        console.error('خطأ في جلب بيانات الصفحة:', err);
        setError('لم نتمكن من تحميل سياسة الخصوصية');
        setPage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // الصفحة الافتراضية في حالة عدم وجود بيانات من الخادم
  const defaultTitle = 'سياسة الخصوصية';
  const defaultContent = `
    <h2>سياسة الخصوصية</h2>
    <p>تهتم منصة المنح الدراسية بخصوصية مستخدميها وتلتزم بحماية بياناتهم الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي يتم الحصول عليها من المستخدمين.</p>

    <h3>المعلومات التي نجمعها</h3>
    <p>قد نجمع معلومات شخصية مثل:</p>
    <ul>
      <li>الاسم الكامل</li>
      <li>البريد الإلكتروني</li>
      <li>معلومات الاتصال</li>
      <li>السيرة الذاتية والمؤهلات التعليمية (إذا تم تقديمها)</li>
    </ul>

    <h3>كيفية استخدام المعلومات</h3>
    <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
    <ul>
      <li>تحسين خدمات المنصة وتجربة المستخدم</li>
      <li>توفير المنح الدراسية المناسبة بناءً على مؤهلات المستخدم</li>
      <li>التواصل مع المستخدم بخصوص طلبات المنح والفرص التعليمية</li>
      <li>إرسال تحديثات وإشعارات حول المنح الجديدة والمواعيد المهمة</li>
    </ul>

    <h3>حماية المعلومات</h3>
    <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.</p>

    <h3>مشاركة المعلومات</h3>
    <p>لن نبيع أو نؤجر أو نتبادل معلوماتك الشخصية مع أطراف ثالثة دون موافقتك، إلا في الحالات التالية:</p>
    <ul>
      <li>عندما يكون ذلك ضرورياً لتقديم الخدمة المطلوبة (مثل إرسال طلبك للمنحة إلى الجهة المانحة)</li>
      <li>للامتثال للقانون أو استجابة للإجراءات القانونية</li>
      <li>لحماية حقوقنا أو ممتلكاتنا أو سلامتنا أو مستخدمينا الآخرين</li>
    </ul>

    <h3>تغييرات على سياسة الخصوصية</h3>
    <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعار المستخدمين بأي تغييرات مهمة عن طريق نشر السياسة الجديدة على هذه الصفحة.</p>

    <h3>اتصل بنا</h3>
    <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا من خلال صفحة الاتصال على موقعنا.</p>
  `;

  // إظهار حالة التحميل
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-gray-600">جاري تحميل سياسة الخصوصية...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{page?.title || defaultTitle} | منصة المنح الدراسية</title>
        <meta name="description" content={page?.metaDescription || "سياسة الخصوصية لمنصة المنح الدراسية - معلومات حول كيفية جمع واستخدام وحماية بيانات المستخدمين"} />
        <meta property="og:title" content={`${page?.title || defaultTitle} | منصة المنح الدراسية`} />
        <meta property="og:description" content={page?.metaDescription || "سياسة الخصوصية لمنصة المنح الدراسية - معلومات حول كيفية جمع واستخدام وحماية بيانات المستخدمين"} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="container mx-auto py-8 md:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {page?.title || defaultTitle}
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page?.content || defaultContent }}
          />
        </div>
      </div>
    </MainLayout>
  );
}