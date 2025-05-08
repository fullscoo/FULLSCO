import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// نوع البيانات للصفحة الثابتة
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  page: Page | null;
  error?: string;
}

export default function StaticPage({ page, error }: PageProps) {
  const router = useRouter();
  const { slug } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState<Page | null>(page);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(error);

  // نحن لا نحتاج إلى جلب البيانات من العميل لأننا نستخدم SSR فقط
  useEffect(() => {
    // عند تغيير المسار نتحقق إذا كان لدينا البيانات بالفعل
    if (!page && slug && router.isReady) {
      setIsLoading(true);
      // يمكننا استخدام إعادة التوجيه كحل بديل
      router.replace(`/pages/${slug}`);
    }
  }, [slug, page, router]);

  // إذا كانت الصفحة قيد التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300">جاري التحميل...</h1>
        </div>
      </div>
    );
  }

  // إذا كان هناك خطأ
  if (errorMessage || !pageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            الصفحة غير موجودة
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {errorMessage || 'لم يتم العثور على الصفحة المطلوبة. يرجى التحقق من الرابط أو الاتصال بمسؤول الموقع.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageData.metaTitle || pageData.title}</title>
        <meta name="description" content={pageData.metaDescription || `${pageData.title} - منصة المنح الدراسية`} />
        <meta property="og:title" content={pageData.metaTitle || pageData.title} />
        <meta property="og:description" content={pageData.metaDescription || `${pageData.title} - منصة المنح الدراسية`} />
        {pageData.imageUrl && <meta property="og:image" content={pageData.imageUrl} />}
        <meta property="og:type" content="article" />
      </Head>

      <div className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          {/* عنوان الصفحة */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {pageData.title}
            </h1>
            
            {/* خط فاصل مزخرف */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>
          </div>

          {/* صورة الصفحة (إذا وجدت) */}
          {pageData.imageUrl && (
            <div className="mb-8 relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image 
                src={pageData.imageUrl}
                alt={pageData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* محتوى الصفحة */}
          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          </div>

          {/* وقت التحديث */}
          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400 text-center">
            آخر تحديث: {new Date(pageData.updatedAt).toLocaleDateString('ar-EG')}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params, res }) => {
  // تعيين مدة التخزين المؤقت - 30 دقيقة للصفحات الثابتة
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=600');
  
  if (!params?.slug || typeof params.slug !== 'string') {
    return {
      props: {
        page: null,
        error: 'معرف الصفحة غير صالح'
      }
    };
  }
  
  try {
    // محاكاة بيانات الصفحة حتى يتم إصلاح واجهة API
    // استخدام البيانات الثابتة كمثال مؤقت
    
    // صفحة من نحن
    if (params.slug === 'about-us') {
      return {
        props: {
          page: {
            id: 1,
            title: 'من نحن',
            slug: 'about-us',
            content: `<h1>من نحن</h1>
<p>مرحبًا بك في منصة FULLSCO - الوجهة الأولى للطلاب العرب الباحثين عن فرص المنح الدراسية حول العالم.</p>
<h2>رؤيتنا</h2>
<p>نسعى في FULLSCO إلى تمكين الطلاب العرب من الوصول إلى أفضل فرص التعليم العالي عالميًا من خلال توفير منصة شاملة ومتكاملة للمنح الدراسية.</p>
<h2>مهمتنا</h2>
<p>مهمتنا هي تسهيل رحلة البحث عن المنح الدراسية للطلاب العرب من خلال توفير معلومات دقيقة وشاملة، ونصائح متخصصة، وموارد تعليمية تساعدهم في تحقيق طموحاتهم الأكاديمية.</p>
<h2>قيمنا</h2>
<ul>
<li>المصداقية: نلتزم بتقديم معلومات دقيقة وموثوقة عن المنح الدراسية.</li>
<li>الشمولية: نسعى لتوفير فرص متنوعة تناسب مختلف التخصصات والمستويات الدراسية.</li>
<li>الدعم: نقدم الإرشاد والدعم المستمر للطلاب في رحلة التقديم للمنح الدراسية.</li>
<li>التميز: نسعى دائمًا لتطوير منصتنا وخدماتنا لتقديم تجربة مستخدم متميزة.</li>
</ul>
<h2>فريقنا</h2>
<p>يضم فريق FULLSCO مجموعة من الخبراء والمتخصصين في مجال المنح الدراسية والتعليم الدولي، ممن يتمتعون بخبرات واسعة في هذا المجال.</p>`,
            metaTitle: 'من نحن | FULLSCO - منصة المنح الدراسية للطلاب العرب',
            metaDescription: 'تعرف على منصة FULLSCO وفريقنا ورؤيتنا لمساعدة الطلاب العرب في العثور على أفضل فرص المنح الدراسية حول العالم.',
            imageUrl: '',
            isPublished: true,
            createdAt: '2025-05-02T16:09:36.006303+00',
            updatedAt: '2025-05-02T16:09:36.006303+00',
          }
        }
      };
    }
    
    // صفحة سياسة الخصوصية
    if (params.slug === 'privacy-policy') {
      return {
        props: {
          page: {
            id: 3,
            title: 'سياسة الخصوصية',
            slug: 'privacy-policy',
            content: `<h1>سياسة الخصوصية</h1>
<p>آخر تحديث: 2 مايو 2023</p>
<p>نحن في FULLSCO نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا لمعلوماتك عند استخدام موقعنا الإلكتروني.</p>
<h2>1. المعلومات التي نجمعها</h2>
<p>قد نقوم بجمع المعلومات التالية:</p>
<ul>
<li>معلومات الاتصال: مثل الاسم، البريد الإلكتروني، رقم الهاتف.</li>
<li>معلومات التسجيل: عند إنشاء حساب على منصتنا.</li>
<li>معلومات الاستخدام: كيفية استخدامك لموقعنا وخدماتنا.</li>
<li>المعلومات التقنية: مثل عنوان IP، نوع المتصفح، ونظام التشغيل.</li>
</ul>`,
            metaTitle: 'سياسة الخصوصية | FULLSCO - منصة المنح الدراسية للطلاب العرب',
            metaDescription: 'تعرف على سياسة الخصوصية الخاصة بمنصة FULLSCO وكيفية حماية بياناتك الشخصية عند استخدام موقعنا.',
            imageUrl: '',
            isPublished: true,
            createdAt: '2025-05-02T16:10:15.004106+00',
            updatedAt: '2025-05-02T16:10:15.004106+00',
          }
        }
      };
    }
    
    // صفحة اتصل بنا
    if (params.slug === 'contact-us') {
      return {
        props: {
          page: {
            id: 2,
            title: 'اتصل بنا',
            slug: 'contact-us',
            content: `<h1>اتصل بنا</h1>
<p>يسعدنا في FULLSCO التواصل معك والإجابة على استفساراتك. يمكنك الاتصال بنا من خلال أي من الطرق التالية:</p>
<div class="contact-info">
  <h2>معلومات الاتصال</h2>
  <div class="info-item">
    <h3>البريد الإلكتروني</h3>
    <p><a href="mailto:info@fullsco.com">info@fullsco.com</a></p>
  </div>
  <div class="info-item">
    <h3>رقم الهاتف</h3>
    <p>+90XXXXXXXX</p>
  </div>
</div>`,
            metaTitle: 'اتصل بنا | FULLSCO - منصة المنح الدراسية للطلاب العرب',
            metaDescription: 'تواصل مع فريق FULLSCO للاستفسارات والمساعدة في مجال المنح الدراسية. نحن هنا لمساعدتك في رحلتك الأكاديمية.',
            imageUrl: '',
            isPublished: true,
            createdAt: '2025-05-02T16:09:51.737894+00',
            updatedAt: '2025-05-02T16:09:51.737894+00',
          }
        }
      };
    }
    
    // الأسئلة الشائعة
    if (params.slug === 'faq') {
      return {
        props: {
          page: {
            id: 5,
            title: 'الأسئلة الشائعة',
            slug: 'faq',
            content: `<h1>الأسئلة الشائعة</h1>
<p>فيما يلي إجابات لبعض الأسئلة الشائعة التي قد تكون لديك حول المنح الدراسية وخدماتنا.</p>
<div class="faq-item">
  <h2>أسئلة عامة حول المنح الدراسية</h2>
  <div class="question">
    <h3>ما هي المنحة الدراسية؟</h3>
    <p>المنحة الدراسية هي دعم مالي يُقدم للطلاب لمساعدتهم في تغطية تكاليف دراستهم. قد تغطي المنحة الرسوم الدراسية كاملة أو جزء منها، وقد تشمل أيضًا بدل معيشة وسكن وتذاكر سفر وتأمين صحي.</p>
  </div>
</div>`,
            metaTitle: 'الأسئلة الشائعة | FULLSCO - منصة المنح الدراسية للطلاب العرب',
            metaDescription: 'إجابات على الأسئلة الشائعة حول المنح الدراسية وعملية التقديم. تعرف على نصائح وإرشادات مهمة للحصول على منح دراسية.',
            imageUrl: '',
            isPublished: true,
            createdAt: '2025-05-02T16:11:39.136381+00',
            updatedAt: '2025-05-02T16:11:39.136381+00',
          }
        }
      };
    }
    
    // في حال لم يتم العثور على الصفحة المطلوبة
    return {
      props: {
        page: null,
        error: 'الصفحة غير موجودة'
      }
    };
    
  } catch (error) {
    console.error('خطأ في تحميل الصفحة:', error);
    
    return {
      props: {
        page: null,
        error: 'حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى لاحقاً.'
      }
    };
  }
}