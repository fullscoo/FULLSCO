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

  // إذا لم يتم توفير الصفحة من خلال SSR، نقوم بطلبها من الواجهة
  useEffect(() => {
    // إذا كان لدينا بيانات الصفحة أو ليس لدينا slug صالح، فلا نحتاج إلى طلبها
    if (page || !slug || typeof slug !== 'string') return;
    
    const fetchPage = async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      
      try {
        const response = await fetch(`/api/pages/${slug}`);
        
        if (!response.ok) {
          throw new Error(`فشل في تحميل الصفحة (${response.status})`);
        }
        
        const data = await response.json();
        setPageData(data);
      } catch (err) {
        console.error('خطأ في تحميل الصفحة:', err);
        setErrorMessage('حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى لاحقاً.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPage();
  }, [slug, page]);

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
    // الحصول على بيانات الصفحة من API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/pages/${params.slug}`);
    
    // إذا لم يتم العثور على الصفحة
    if (response.status === 404) {
      return {
        props: {
          page: null,
          error: 'الصفحة غير موجودة'
        }
      };
    }
    
    // إذا كان هناك خطأ في الخادم
    if (!response.ok) {
      throw new Error(`فشل في تحميل الصفحة (${response.status})`);
    }
    
    const page = await response.json();
    
    // التحقق من حالة نشر الصفحة
    if (!page.isPublished) {
      return {
        props: {
          page: null,
          error: 'هذه الصفحة غير منشورة حاليًا'
        }
      };
    }
    
    return {
      props: {
        page
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