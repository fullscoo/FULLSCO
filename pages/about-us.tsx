import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AboutUsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // إعادة توجيه إلى صفحة "من نحن" في نظام الصفحات الثابتة
    router.replace('/pages/about-us');
  }, [router]);

  return (
    <>
      <Head>
        <title>من نحن | منصة المنح الدراسية</title>
        <meta name="description" content="تعرف على منصة المنح الدراسية، أهدافنا ورؤيتنا ورسالتنا" />
      </Head>
      {/* تعرض صفحة تحميل بسيطة أثناء إعادة التوجيه */}
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300">جاري التحميل...</h1>
        </div>
      </div>
    </>
  );
}