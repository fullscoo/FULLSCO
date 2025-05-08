import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { Page } from '@/shared/schema';

export default function TermsAndConditions() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // محاولة استرداد صفحة الشروط والأحكام من واجهة API
    setLoading(true);

    fetch('/api/pages/terms-and-conditions')
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
        setError('لم نتمكن من تحميل الشروط والأحكام');
        setPage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // الصفحة الافتراضية في حالة عدم وجود بيانات من الخادم
  const defaultTitle = 'الشروط والأحكام';
  const defaultContent = `
    <h2>الشروط والأحكام</h2>
    <p>تحدد هذه الوثيقة الشروط والأحكام لاستخدام منصة المنح الدراسية. باستخدامك للمنصة فإنك توافق على الالتزام بهذه الشروط.</p>

    <h3>استخدام المنصة</h3>
    <p>يتعهد المستخدم بما يلي:</p>
    <ul>
      <li>تقديم معلومات دقيقة وحقيقية عند التسجيل وتقديم طلبات المنح</li>
      <li>عدم انتحال شخصية أي فرد أو كيان آخر</li>
      <li>الحفاظ على سرية بيانات الحساب الشخصي</li>
      <li>عدم استخدام المنصة لأغراض غير قانونية أو احتيالية</li>
      <li>الامتناع عن أي نشاط قد يعطل أو يضر بأداء المنصة</li>
    </ul>

    <h3>المحتوى</h3>
    <p>تبذل منصة المنح الدراسية جهدها للتأكد من دقة وحداثة المعلومات المقدمة، ولكنها لا تضمن:</p>
    <ul>
      <li>خلو المعلومات من الأخطاء</li>
      <li>استمرارية توفر المنصة دون انقطاع</li>
      <li>نجاح المستخدم في الحصول على المنحة المقدم لها</li>
    </ul>
    <p>نحن نقدم معلومات عن المنح الدراسية المتاحة، لكن القرار النهائي للقبول يبقى بيد الجهات المانحة.</p>

    <h3>الملكية الفكرية</h3>
    <p>جميع المحتويات المنشورة على المنصة (نصوص، صور، شعارات، تصميمات) هي ملكية حصرية لمنصة المنح الدراسية أو الجهات المرخصة. لا يجوز نسخ أو توزيع أو تعديل هذه المحتويات دون إذن مسبق.</p>

    <h3>المسؤولية والتعويض</h3>
    <p>لن تكون منصة المنح الدراسية مسؤولة عن أي خسائر أو أضرار قد تنتج عن استخدام المنصة أو عدم القدرة على استخدامها. يتعهد المستخدم بتعويض المنصة ضد أي مطالبات قد تنشأ نتيجة انتهاكه لهذه الشروط.</p>

    <h3>إنهاء الخدمة</h3>
    <p>تحتفظ منصة المنح الدراسية بالحق في:</p>
    <ul>
      <li>تعديل أو إيقاف الخدمة بشكل مؤقت أو دائم</li>
      <li>تعليق أو إنهاء حساب أي مستخدم ينتهك هذه الشروط</li>
      <li>تحديث هذه الشروط والأحكام كلما دعت الحاجة</li>
    </ul>

    <h3>القانون الحاكم</h3>
    <p>تخضع هذه الشروط والأحكام للقوانين المعمول بها، وأي نزاع ينشأ عن استخدام المنصة سيتم حله وفقاً لهذه القوانين.</p>

    <h3>تواصل معنا</h3>
    <p>إذا كان لديك أي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا من خلال صفحة الاتصال.</p>
  `;

  // إظهار حالة التحميل
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-gray-600">جاري تحميل الشروط والأحكام...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{page?.title || defaultTitle} | منصة المنح الدراسية</title>
        <meta name="description" content={page?.metaDescription || "الشروط والأحكام لاستخدام منصة المنح الدراسية - حقوق ومسؤوليات المستخدمين"} />
        <meta property="og:title" content={`${page?.title || defaultTitle} | منصة المنح الدراسية`} />
        <meta property="og:description" content={page?.metaDescription || "الشروط والأحكام لاستخدام منصة المنح الدراسية - حقوق ومسؤوليات المستخدمين"} />
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