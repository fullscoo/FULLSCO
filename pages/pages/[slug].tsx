import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { Page } from '@/shared/schema';

interface PageProps {
  page: Page | null;
  error?: string;
}

export default function StaticPage({ page: initialPage, error: initialError }: PageProps) {
  const router = useRouter();
  const { slug } = router.query;
  
  const [page, setPage] = useState<Page | null>(initialPage);
  const [error, setError] = useState<string | undefined>(initialError);
  const [loading, setLoading] = useState(!initialPage && !initialError);

  useEffect(() => {
    if (!initialPage && !initialError && slug) {
      // إذا لم يتم تمرير بيانات الصفحة من الخادم، نقوم بجلبها من واجهة API
      setLoading(true);
      
      fetch(`/api/pages/${slug}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`حدث خطأ: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setPage(data.page);
          setError(undefined);
        })
        .catch(err => {
          console.error('خطأ في جلب بيانات الصفحة:', err);
          setError('لم نتمكن من العثور على الصفحة المطلوبة');
          setPage(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialPage, initialError, slug]);

  // إظهار حالة التحميل
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-gray-600">جاري تحميل الصفحة...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // إظهار رسالة الخطأ
  if (error || !page) {
    return (
      <MainLayout>
        <Head>
          <title>الصفحة غير موجودة | منصة المنح الدراسية</title>
          <meta name="description" content="الصفحة المطلوبة غير موجودة" />
        </Head>
        <div className="container mx-auto py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً!</h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
              {error || 'لم نتمكن من العثور على الصفحة المطلوبة'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{page.title} | منصة المنح الدراسية</title>
        <meta name="description" content={page.metaDescription || `${page.title} - منصة المنح الدراسية`} />
        {page.metaTitle && <meta property="og:title" content={page.metaTitle} />}
        {page.metaDescription && <meta property="og:description" content={page.metaDescription} />}
      </Head>

      <div className="container mx-auto py-8 md:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{page.title}</h1>
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  // تعيين مدة التخزين المؤقت - 10 دقائق
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
  
  try {
    const slug = params?.slug as string;
    
    // استدعاء مباشر للقاعدة البيانات
    console.log(`Direct database query for page: ${slug}`);
    
    // جلب بيانات الصفحة من واجهة API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/pages/${slug}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      props: {
        page: data.page || null
      }
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return {
      props: {
        page: null,
        error: 'لم نتمكن من العثور على الصفحة المطلوبة'
      }
    };
  }
}