import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { CalendarClock, MapPin, GraduationCap, BookOpen, Briefcase, Clock, AlertCircle, Award, DollarSign, School, FileText, Share2, Bookmark, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { safeObjectEntries, safeReduce } from '@/lib/utils';
import { detectLevelFromTitle, getSafeRelation } from '@/lib/scholarship-helpers';

// دالة مساعدة لضمان أن تكون جميع قيم التاريخ مسلسلة بشكل صحيح
function serializeDate(date: any): string | null {
  if (!date) return null;
  
  try {
    if (date instanceof Date) {
      return date.toISOString();
    } else if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return null;
  } catch (e) {
    console.warn(`Error serializing date: ${date}`, e);
    return null;
  }
}

// تعريف واجهة تفاصيل المنحة الدراسية
interface ScholarshipDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  deadline: string;
  fundingType: string;
  studyDestination?: string;
  eligibilityCriteria?: string;
  applicationProcess?: string;
  benefits?: string;
  requirements?: string;
  categoryId?: number;
  countryId?: number;
  levelId?: number;
  category?: { id: number; name: string; slug: string };
  country?: { id: number; name: string; slug: string };
  level?: { id: number; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

// تعريف واجهة المنح ذات الصلة
interface RelatedScholarship {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  deadline: string;
  isFeatured: boolean;
}

// تعريف واجهة خصائص صفحة تفاصيل المنحة
interface ScholarshipDetailPageProps {
  scholarship: ScholarshipDetail;
  relatedScholarships: RelatedScholarship[];
}

// مكون صفحة تفاصيل المنحة
export default function ScholarshipDetailPage({ 
  scholarship,
  relatedScholarships
}: ScholarshipDetailPageProps) {
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // الوظائف
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // يمكن هنا تنفيذ المنطق الخاص بحفظ المنحة في قائمة المحفوظات
  };
  
  const shareScholarship = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scholarship.title,
          text: scholarship.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // نسخ الرابط إلى الحافظة إذا كانت ميزة المشاركة غير متوفرة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'غير محدد';
    }
  };
  
  // إذا كانت الصفحة قيد التحميل
  if (router.isFallback) {
    return (
      <MainLayout title="جاري التحميل..." description="جاري تحميل تفاصيل المنحة الدراسية">
        <div className="container py-12">
          <div className="flex justify-center items-center h-80">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold">جاري تحميل تفاصيل المنحة...</h2>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={`${scholarship.title} | ${siteSettings?.siteName || 'FULLSCO'}`} description={scholarship.description}>
      <Head>
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/scholarships/${scholarship.slug}`} />
        <meta property="og:title" content={scholarship.title} />
        <meta property="og:description" content={scholarship.description} />
        {scholarship.thumbnailUrl && (
          <meta property="og:image" content={scholarship.thumbnailUrl} />
        )}
        <meta property="article:published_time" content={scholarship.createdAt} />
        <meta property="article:modified_time" content={scholarship.updatedAt} />
      </Head>
      
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <nav className="flex mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 space-x-reverse">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary">
                  الرئيسية
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <Link href="/scholarships" className="hover:text-primary">
                  المنح الدراسية
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300" aria-current="page">
                  {scholarship.title.length > 30 ? `${scholarship.title.substring(0, 30)}...` : scholarship.title}
                </span>
              </li>
            </ol>
          </nav>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {scholarship.isFeatured && (
                <div className="inline-block bg-amber-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                  منحة مميزة
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {scholarship.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                {scholarship.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {scholarship.category && (
                  <Link href={`/scholarships?category=${scholarship.category.slug}`} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    <BookOpen className="w-4 h-4" />
                    {scholarship.category.name}
                  </Link>
                )}
                
                {scholarship.level && scholarship.level.slug && (
                  <Link href={`/scholarships?level=${scholarship.level.slug}`} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    {scholarship.level.name || 'المستوى الأكاديمي'}
                  </Link>
                )}
                
                {scholarship.country && (
                  <Link href={`/scholarships?country=${scholarship.country.slug}`} className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                    <MapPin className="w-4 h-4" />
                    {scholarship.country.name}
                  </Link>
                )}
                
                {scholarship.fundingType && (
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    {scholarship.fundingType}
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    الموعد النهائي
                  </h3>
                  <div className="text-lg font-medium text-red-600 dark:text-red-400">
                    {formatDate(scholarship.deadline)}
                  </div>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">بلد الدراسة:</span>
                      <span className="font-medium">{scholarship.country?.name || scholarship.studyDestination || 'غير محدد'}</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <School className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">المستوى الدراسي:</span>
                      <span className="font-medium">{scholarship.level?.name || 'جميع المستويات'}</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <Award className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">نوع التمويل:</span>
                      <span className="font-medium">{scholarship.fundingType}</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">تغطي المنحة:</span>
                      <span className="font-medium">الرسوم الدراسية، المعيشة، السكن، السفر</span>
                    </div>
                  </li>
                </ul>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-5">
                  <a 
                    href="#apply" 
                    className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    تقديم طلب
                  </a>
                  
                  <div className="flex mt-3 gap-2">
                    <button
                      onClick={toggleBookmark}
                      className={`flex-1 flex justify-center items-center gap-2 border ${
                        isBookmarked 
                          ? 'border-primary text-primary' 
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      } py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <Bookmark className="w-5 h-5" />
                      {isBookmarked ? 'محفوظة' : 'حفظ'}
                    </button>
                    
                    <button
                      onClick={shareScholarship}
                      className="flex-1 flex justify-center items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      مشاركة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* محتوى المنحة */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* صورة المنحة */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-8 h-96 relative">
              {scholarship.thumbnailUrl ? (
                <Image
                  src={scholarship.thumbnailUrl}
                  alt={scholarship.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                  <School className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* تفاصيل المنحة */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <h2>نظرة عامة</h2>
              <div dangerouslySetInnerHTML={{ __html: scholarship.content || scholarship.description }} />
              
              {scholarship.eligibilityCriteria && (
                <>
                  <h2>معايير الأهلية</h2>
                  <div dangerouslySetInnerHTML={{ __html: scholarship.eligibilityCriteria }} />
                </>
              )}
              
              {scholarship.benefits && (
                <>
                  <h2>المميزات والفوائد</h2>
                  <div dangerouslySetInnerHTML={{ __html: scholarship.benefits }} />
                </>
              )}
              
              {scholarship.requirements && (
                <>
                  <h2>المتطلبات والمستندات</h2>
                  <div dangerouslySetInnerHTML={{ __html: scholarship.requirements }} />
                </>
              )}
              
              {scholarship.applicationProcess && (
                <>
                  <h2 id="apply">كيفية التقديم</h2>
                  <div dangerouslySetInnerHTML={{ __html: scholarship.applicationProcess }} />
                </>
              )}
            </div>
            
            {/* رابط التقديم */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">للتقديم على المنحة</h3>
              <p className="mb-4">
                يرجى زيارة الموقع الرسمي للمنحة للاطلاع على كافة التفاصيل وتقديم طلبك قبل انتهاء الموعد النهائي.
              </p>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary text-white font-medium rounded-lg px-6 py-3 inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                التقديم الآن
                <ExternalLink className="w-5 h-5" />
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                <AlertCircle className="w-4 h-4 inline-block mr-1" />
                آخر موعد للتقديم: {formatDate(scholarship.deadline)}
              </p>
            </div>
          </div>
          
          {/* الشريط الجانبي */}
          <div className="md:w-80 md:flex-shrink-0">
            {/* المنح ذات الصلة */}
            {relatedScholarships.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-5">منح ذات صلة</h3>
                <div className="space-y-4">
                  {relatedScholarships.map(relatedScholarship => (
                    <div key={relatedScholarship.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <Link href={`/scholarships/${relatedScholarship.slug}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="p-4">
                          <h4 className="font-bold mb-2 line-clamp-2">{relatedScholarship.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>
                              آخر موعد: {formatDate(relatedScholarship.deadline)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link 
                    href="/scholarships" 
                    className="text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    عرض جميع المنح
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5"/>
                      <path d="M12 19l-7-7 7-7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            )}
            
            {/* معلومات إضافية */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
              <h3 className="text-xl font-bold mb-4">معلومات إضافية</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">التصنيف:</span>
                    <span className="font-medium">
                      {scholarship.category ? (
                        <Link 
                          href={`/scholarships?category=${scholarship.category.slug}`} 
                          className="text-primary hover:underline"
                        >
                          {scholarship.category.name}
                        </Link>
                      ) : (
                        'غير مصنف'
                      )}
                    </span>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <CalendarClock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">تاريخ النشر:</span>
                    <time className="font-medium">
                      {formatDate(scholarship.createdAt)}
                    </time>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">التخصصات:</span>
                    <span className="font-medium">جميع التخصصات</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// استيراد قاعدة البيانات والمخططات
import { db } from '@/db';
import { scholarships, categories, countries, levels } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

// جلب البيانات من الخادم
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    console.log(`جلب بيانات المنحة مع slug: ${slug}`);
    
    if (!slug) {
      return {
        notFound: true
      };
    }
    
    // استخدام قاعدة البيانات مباشرة
    // البحث من خلال slug الإنجليزي أو العربي
    // أولاً، محاولة البحث باستخدام الـ slug كما هو (يمكن أن يكون بالإنجليزية)
    let scholarshipData = await db.select().from(scholarships)
      .where(eq(scholarships.slug, slug))
      .limit(1);
    
    // إذا لم يتم العثور على نتائج، قد يكون slug عربي وتم تحويله إلى URL encoded
    // لذلك نبحث في جميع المنح لمقارنة العنوان
    if (!scholarshipData || scholarshipData.length === 0) {
      console.log(`لم يتم العثور على المنحة باستخدام slug مباشر: ${slug}, محاولة بحث أخرى...`);
      
      // محاولة البحث باستخدام عنوان المنحة المشابه للـ slug
      const allScholarships = await db.select().from(scholarships);
      
      // البحث عن عنوان مشابه للـ slug
      try {
        const arabicSlug = decodeURIComponent(slug);
        
        // طريقة 1: البحث عن تطابق دقيق في العنوان
        let possibleMatch = allScholarships.find(s => {
          const titleAsSlug = s.title
            .replace(/\s+/g, '-')
            .replace(/[^\u0621-\u064A0-9a-z-]/g, '')
            .toLowerCase();
          
          return titleAsSlug === arabicSlug.toLowerCase();
        });
        
        // طريقة 2: البحث عن تطابق جزئي في العنوان إذا لم نجد تطابقًا دقيقًا
        if (!possibleMatch) {
          possibleMatch = allScholarships.find(s => {
            const titleAsSlug = s.title
              .replace(/\s+/g, '-')
              .replace(/[^\u0621-\u064A0-9a-z-]/g, '')
              .toLowerCase();
            
            // تطابق جزئي في أي من الاتجاهين
            return titleAsSlug.includes(arabicSlug.toLowerCase()) || 
                   arabicSlug.toLowerCase().includes(titleAsSlug);
          });
        }
        
        // طريقة 3: مقارنة الكلمات الرئيسية إذا كان الـ slug يحتوي على أكثر من كلمة
        if (!possibleMatch && arabicSlug.includes('-')) {
          const slugKeywords = arabicSlug.split('-');
          
          possibleMatch = allScholarships.find(s => {
            // حساب عدد الكلمات المشتركة بين slug والعنوان
            let matchCount = 0;
            const title = s.title.toLowerCase();
            
            for (const keyword of slugKeywords) {
              if (title.includes(keyword.toLowerCase())) {
                matchCount++;
              }
            }
            
            // إذا كان هناك على الأقل 2 كلمات مشتركة (أو 50% من الكلمات)
            return matchCount >= Math.min(2, Math.floor(slugKeywords.length / 2));
          });
        }
        
        if (possibleMatch) {
          console.log(`تم العثور على منحة مطابقة محتملة: ${possibleMatch.title}`);
          scholarshipData = [possibleMatch];
        }
      } catch (e) {
        console.error('خطأ في معالجة الـ slug العربي:', e);
      }
    }
    
    console.log(`تم العثور على ${scholarshipData.length} منحة دراسية`);
    
    // التحقق من وجود المنحة
    if (!scholarshipData || scholarshipData.length === 0) {
      console.log(`لم يتم العثور على المنحة الدراسية: ${slug}`);
      return {
        notFound: true
      };
    }
    
    const scholarship = scholarshipData[0];
    console.log(`تم العثور على المنحة الدراسية بالعنوان: ${scholarship.title}`);
    
    // تحميل البيانات الإضافية
    let categoryInfo = null;
    if (scholarship.categoryId) {
      try {
        // جلب حقول محددة من التصنيف
        const categoryData = await db.select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description
        })
        .from(categories)
        .where(eq(categories.id, scholarship.categoryId))
        .limit(1);
        
        if (categoryData.length > 0) {
          categoryInfo = categoryData[0];
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
        // الاستمرار بدون معلومات التصنيف إذا حدث خطأ
      }
    }
    
    let countryInfo = null;
    if (scholarship.countryId) {
      try {
        // تجنب استخدام حقل flagUrl مباشرة وجلب الحقول الموجودة فقط
        const countryData = await db.select({
          id: countries.id,
          name: countries.name,
          slug: countries.slug
        })
        .from(countries)
        .where(eq(countries.id, scholarship.countryId))
        .limit(1);
        
        if (countryData.length > 0) {
          // إضافة حقل flagUrl = null لتجنب الأخطاء
          countryInfo = {
            ...countryData[0],
            flagUrl: null // إضافة حقل افتراضي للعلم
          };
        }
      } catch (error) {
        console.error('Error fetching country info:', error);
        // الاستمرار بدون معلومات البلد إذا حدث خطأ
      }
    }
    
    let levelInfo = null;
    // ابحث عن المستوى حتى إذا كان levelId null
    try {
      // تعديل: جلب جميع المستويات ثم البحث عن المستوى المناسب
      const allLevels = await db.select({
        id: levels.id,
        name: levels.name,
        slug: levels.slug,
        description: levels.description
      })
      .from(levels);
      
      console.log(`تم العثور على ${allLevels.length} مستوى دراسي`);
      
      // محاولة العثور على المستوى المناسب
      if (scholarship.levelId) {
        // البحث بناءً على معرف المستوى إذا كان متوفرًا
        levelInfo = allLevels.find(level => level.id === scholarship.levelId) || null;
        console.log(`استخدام المستوى المرتبط بالمنحة: ${levelInfo?.name || 'غير موجود'}`);
      } 
      
      // إذا لم يكن هناك مستوى محدد، نحاول اكتشافه من العنوان
      if (!levelInfo && scholarship.title) {
        // استخدام الدالة المساعدة التي أنشأناها
        console.log(`محاولة اكتشاف المستوى من العنوان: ${scholarship.title}`);
        console.log(`عدد المستويات المتاحة: ${allLevels.length}`);
        console.log('أسماء المستويات المتاحة:', allLevels.map(l => l.name).join(', '));
        
        levelInfo = detectLevelFromTitle(scholarship.title, allLevels);
        if (levelInfo) {
          console.log(`تم اكتشاف المستوى من العنوان: ${levelInfo.name}`);
        } else {
          console.log('لم يتم اكتشاف المستوى من العنوان');
        }
      }
      
      // تحويل كائن المستوى إلى بنية آمنة
      if (levelInfo) {
        levelInfo = getSafeRelation(levelInfo);
      } else {
        // إذا لم نتمكن من العثور على مستوى، نعين قيمة افتراضية لتجنب الأخطاء
        console.log('لم نتمكن من العثور على مستوى، باستخدام قيمة افتراضية');
        levelInfo = {
          id: 0,
          name: 'جميع المستويات',
          slug: 'all-levels'
        };
      }
    } catch (error) {
      console.error('Error fetching level info:', error);
      // الاستمرار بقيمة افتراضية لتجنب الأخطاء
      levelInfo = {
        id: 0,
        name: 'جميع المستويات',
        slug: 'all-levels'
      };
    }
    
    // الحصول على منح ذات صلة
    let relatedScholarships = [];
    
    try {
      console.log('بداية البحث عن منح ذات صلة');
      // محاولة جلب المنح من نفس الفئة أولاً
      if (scholarship.categoryId) {
        console.log(`البحث عن منح في نفس الفئة: ${scholarship.categoryId}`);
        const relatedByCategory = await db.select({
          id: scholarships.id,
          title: scholarships.title,
          slug: scholarships.slug,
          deadline: scholarships.deadline,
          thumbnailUrl: scholarships.imageUrl,
          isFeatured: scholarships.isFeatured
        })
        .from(scholarships)
        .where(eq(scholarships.categoryId, scholarship.categoryId))
        .where(sql`${scholarships.id} != ${scholarship.id}`)
        .where(eq(scholarships.isPublished, true))
        .limit(3);
        
        if (relatedByCategory && relatedByCategory.length > 0) {
          console.log(`تم العثور على ${relatedByCategory.length} منحة ذات صلة من نفس الفئة`);
          relatedScholarships = relatedByCategory;
        } else {
          console.log('لم يتم العثور على منح من نفس الفئة');
        }
      }
      
      // إذا لم يتم العثور على منح ذات صلة بناءً على الفئة
      if (relatedScholarships.length === 0) {
        const otherScholarships = await db.select({
          id: scholarships.id,
          title: scholarships.title,
          slug: scholarships.slug,
          deadline: scholarships.deadline,
          thumbnailUrl: scholarships.imageUrl,
          isFeatured: scholarships.isFeatured
        })
        .from(scholarships)
        .where(sql`${scholarships.id} != ${scholarship.id}`)
        .where(eq(scholarships.isPublished, true))
        .limit(3);
        
        if (otherScholarships && otherScholarships.length > 0) {
          relatedScholarships = otherScholarships;
        }
      }
    } catch (error) {
      console.error('Error fetching related scholarships:', error);
      // الاستمرار بدون منح ذات صلة إذا حدث خطأ
    }
    
    // إضافة التشخيص قبل إعداد البيانات
    console.log('Debug scholarship data:', {
      hasScholarship: !!scholarship,
      scholarshipType: typeof scholarship,
      hasLevel: !!levelInfo,
      levelInfoType: typeof levelInfo,
      categoryInfo: categoryInfo,
      countryInfo: countryInfo
    });

    // التحقق من التواريخ وحقول البيانات الأخرى
    const safeScholarship = typeof scholarship === 'object' && scholarship !== null ? scholarship : {};
    
    // تشخيص الحقول المستخدمة في العمليات الحسابية
    console.log('Computed fields debug:', {
      hasStartDate: 'startDate' in safeScholarship,
      hasEndDate: 'endDate' in safeScholarship,
      hasCreatedAt: 'createdAt' in safeScholarship,
      startDateType: typeof safeScholarship.startDate,
      endDateType: typeof safeScholarship.endDate,
      createdAtType: typeof safeScholarship.createdAt,
    });
    
    // إعداد بيانات المنحة مع التحقق من أنها كائن صالح
    const scholarshipWithRelations = {
      ...safeScholarship,
      thumbnailUrl: safeScholarship?.imageUrl || null,
      content: safeScholarship?.content || safeScholarship?.description || '',
      fundingType: safeScholarship?.fundingType || "ممول بالكامل",
      category: categoryInfo,
      country: countryInfo,
      level: levelInfo
    };
    
    // إضافة المزيد من التشخيص
    console.log('Debug dates:', {
      startDate: scholarship?.startDate,
      endDate: scholarship?.endDate,
      deadline: scholarship?.deadline,
      createdAt: scholarship?.createdAt,
      updatedAt: scholarship?.updatedAt
    });

    // تنسيق جميع التواريخ باستخدام الدالة المساعدة مع معالجة الأخطاء
    console.log('بدء تنسيق التواريخ');
    
    // استخدام معالجة أخطاء على مستوى كل حقل بدلاً من محاولة معالجة جميع الحقول في جملة try/catch واحدة
    const formattedScholarship = {
      ...scholarshipWithRelations,
      startDate: (() => {
        try { return serializeDate(safeScholarship.startDate); } 
        catch (e) { console.error('خطأ في معالجة تاريخ البدء:', e); return null; }
      })(),
      endDate: (() => {
        try { return serializeDate(safeScholarship.endDate); } 
        catch (e) { console.error('خطأ في معالجة تاريخ النهاية:', e); return null; }
      })(),
      deadline: (() => {
        try { return serializeDate(safeScholarship.deadline) || safeScholarship.deadline || null; } 
        catch (e) { console.error('خطأ في معالجة الموعد النهائي:', e); return null; }
      })(),
      createdAt: (() => {
        try { return serializeDate(safeScholarship.createdAt) || new Date().toISOString(); } 
        catch (e) { console.error('خطأ في معالجة تاريخ الإنشاء:', e); return new Date().toISOString(); }
      })(),
      updatedAt: (() => {
        try { return serializeDate(safeScholarship.updatedAt) || new Date().toISOString(); } 
        catch (e) { console.error('خطأ في معالجة تاريخ التحديث:', e); return new Date().toISOString(); }
      })(),
      applicationStartDate: (() => {
        try { return serializeDate(safeScholarship.applicationStartDate); } 
        catch (e) { console.error('خطأ في معالجة تاريخ بدء التقديم:', e); return null; }
      })(),
      applicationEndDate: (() => {
        try { return serializeDate(safeScholarship.applicationEndDate); } 
        catch (e) { console.error('خطأ في معالجة تاريخ نهاية التقديم:', e); return null; }
      })()
    };
    
    console.log('اكتمال تنسيق التواريخ');
    
    // مزيد من التشخيص للمنح ذات الصلة
    console.log('Related scholarships data:', {
      hasRelatedScholarships: !!relatedScholarships,
      isArray: Array.isArray(relatedScholarships),
      length: Array.isArray(relatedScholarships) ? relatedScholarships.length : 0
    });

    // معالجة المنح ذات الصلة بطريقة آمنة باستخدام safeReduce بدلاً من reduce
    const formattedRelatedScholarships = Array.isArray(relatedScholarships) 
      ? safeReduce(
          relatedScholarships,
          (acc, relatedItem) => {
            if (!relatedItem || typeof relatedItem !== 'object') return acc;
            
            try {
              // التأكد من أن slug للمنح ذات الصلة هو slug الإنجليزي المخزن في قاعدة البيانات
              const relatedSlug = relatedItem.slug || 
                              (relatedItem.title || '').toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^\u0621-\u064A0-9a-z-]/g, '');
                                
              acc.push({
                id: relatedItem.id || 0,
                title: relatedItem.title || '',
                slug: relatedSlug, // استخدام slug الإنجليزي المخزن
                thumbnailUrl: relatedItem.thumbnailUrl || relatedItem.imageUrl || null,
                deadline: (() => {
                  try { return serializeDate(relatedItem.deadline) || relatedItem.deadline || null; }
                  catch (e) { return null; }
                })(),
                isFeatured: !!relatedItem.isFeatured
              });
            } catch (err) {
              console.error('Error processing related scholarship:', err);
            }
            
            return acc;
          },
          [] as Array<{
            id: number;
            title: string;
            slug: string;
            thumbnailUrl: string | null;
            deadline: string | null;
            isFeatured: boolean;
          }>
        )
      : [];
    
    return {
      props: {
        scholarship: formattedScholarship,
        relatedScholarships: formattedRelatedScholarships || []
      }
    };
  } catch (error) {
    console.error('Error fetching scholarship details:', error);
    
    return {
      notFound: true
    };
  }
}