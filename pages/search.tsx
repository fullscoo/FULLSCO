import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from '@/components/ui/pagination';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { FilterComponent } from '@/components/search/FilterComponent';
import { Scholarship, Post, SuccessStory, Category, Country, Level } from '@/shared/schema';
import { Loader2, Search, AlertCircle, Calendar, MapPin, GraduationCap, BookOpen, Users, FileText, Tag } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  type: 'scholarship' | 'post' | 'story' | 'page' | 'category' | 'country' | 'level';
  typeLabel: string;
}

interface ScholarshipSearchResult extends Scholarship {
  type: 'scholarship';
  url: string;
}

interface PostSearchResult extends Post {
  type: 'post';
  url: string;
}

interface StorySearchResult extends SuccessStory {
  type: 'story';
  url: string;
}

interface SearchPageProps {
  initialQuery: string;
  initialResults?: {
    scholarships?: ScholarshipSearchResult[];
    posts?: PostSearchResult[];
    stories?: StorySearchResult[];
    pages?: any[];
    categories?: Category[];
    countries?: Country[];
    levels?: Level[];
  };
  initialTotalItems?: number;
  initialPage?: number;
  initialActiveTab?: string;
  error?: string;
}

export default function SearchPage({
  initialQuery = '',
  initialResults = {},
  initialTotalItems = 0,
  initialPage = 1,
  initialActiveTab = 'all',
  error: initialError
}: SearchPageProps) {
  const router = useRouter();
  const { q: queryParam, tab: tabParam, page: pageParam } = router.query;
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(initialError);
  
  // فلترة البحث
  const [filters, setFilters] = useState({
    category: '',
    country: '',
    level: '',
    fundingType: '',
    dateRange: '',
    sortBy: 'relevance'
  });

  // حجم نتائج البحث لكل صفحة
  const itemsPerPage = 10;

  // تحديث البحث عند تغيير معلمات عنوان URL
  useEffect(() => {
    const newQuery = queryParam as string || '';
    const newTab = tabParam as string || 'all';
    const newPage = parseInt(pageParam as string) || 1;
    
    setQuery(newQuery);
    setActiveTab(newTab);
    setCurrentPage(newPage);
    
    if (newQuery) {
      performSearch(newQuery, newTab, newPage);
    }
  }, [queryParam, tabParam, pageParam]);

  // وظيفة البحث
  const performSearch = async (searchQuery: string, tab: string, page: number, searchFilters = filters) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(undefined);
    
    try {
      // بناء معلمات الاستعلام
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: itemsPerPage.toString(),
        tab
      });
      
      // إضافة الفلاتر إلى الاستعلام
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`خطأ في البحث: ${response.status}`);
      }
      
      const data = await response.json();
      
      setResults(data.results || {});
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('خطأ في البحث:', err);
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSearching(false);
    }
  };

  // معالجة تغيير الصفحة
  const handlePageChange = (page: number) => {
    router.push({
      pathname: '/search',
      query: { 
        ...router.query,
        page
      }
    }, undefined, { scroll: true });
  };

  // معالجة تغيير التبويب
  const handleTabChange = (tab: string) => {
    router.push({
      pathname: '/search',
      query: { 
        ...router.query,
        tab,
        page: 1 // إعادة تعيين الصفحة عند تغيير التبويب
      }
    }, undefined, { scroll: true });
  };

  // معالجة البحث الجديد
  const handleSearch = (newQuery: string) => {
    router.push({
      pathname: '/search',
      query: { 
        q: newQuery,
        tab: activeTab,
        page: 1 // إعادة تعيين الصفحة عند البحث الجديد
      }
    }, undefined, { scroll: true });
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (newFilters: Record<string, string>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    router.push({
      pathname: '/search',
      query: { 
        q: query,
        tab: activeTab,
        page: 1, // إعادة تعيين الصفحة عند تغيير الفلاتر
        ...updatedFilters
      }
    }, undefined, { scroll: true });
  };

  // حساب عدد الصفحات
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // استخراج النتائج حسب التبويب النشط
  const getResultsByTab = () => {
    if (activeTab === 'all') {
      return Object.values(results).flat();
    }
    
    return results[activeTab] || [];
  };

  // الحصول على عدد النتائج حسب التبويب
  const getCountByTab = (tab: string) => {
    if (tab === 'all') {
      return totalItems;
    }
    
    return results[tab]?.length || 0;
  };

  return (
    <MainLayout>
      <Head>
        <title>{query ? `نتائج البحث: ${query}` : 'البحث'} | منصة المنح الدراسية</title>
        <meta name="description" content={`نتائج البحث عن "${query}" في منصة المنح الدراسية`} />
        <meta property="og:title" content={`نتائج البحث: ${query} | منصة المنح الدراسية`} />
        <meta property="og:description" content={`نتائج البحث عن "${query}" في منصة المنح الدراسية`} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">البحث في المنصة</h1>
          
          <div className="max-w-3xl mb-6">
            <GlobalSearch 
              placeholder="ابحث عن منح، مقالات، دول، مستويات دراسية..."
              size="lg"
              className="w-full"
              onSearch={(searchQuery) => handleSearch(searchQuery)}
            />
          </div>
          
          {query && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isSearching ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin ml-2 h-4 w-4" />
                  جاري البحث...
                </span>
              ) : (
                <>
                  {totalItems > 0 ? (
                    <>تم العثور على <span className="font-semibold text-primary">{totalItems}</span> نتيجة لـ "<span className="font-semibold">{query}</span>"</>
                  ) : (
                    <>لم يتم العثور على نتائج لـ "<span className="font-semibold">{query}</span>"</>
                  )}
                </>
              )}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="ml-2 h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {query && !error && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* فلاتر البحث للشاشات الكبيرة */}
            <div className="hidden md:block w-full md:w-72 flex-shrink-0">
              <FilterComponent 
                title="تصفية النتائج"
                categories={results.categories}
                countries={results.countries}
                levels={results.levels}
                fundingTypes={["ممول بالكامل", "ممول جزئياً", "غير ممول"]}
                defaultValues={filters}
                onFilterChange={handleFilterChange}
                isLoading={isSearching}
                showApplyButton={false}
                showActiveCount={true}
                includeKeywordSearch={false}
                variant="shadcn"
              />
            </div>

            {/* نتائج البحث */}
            <div className="flex-1">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="w-full sm:w-auto overflow-x-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-none">
                    الكل
                    {query && totalItems > 0 && (
                      <span className="mr-1 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                        {totalItems}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="scholarships" className="flex-1 sm:flex-none">
                    المنح
                    {query && results.scholarships?.length > 0 && (
                      <span className="mr-1 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                        {results.scholarships.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="flex-1 sm:flex-none">
                    المقالات
                    {query && results.posts?.length > 0 && (
                      <span className="mr-1 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                        {results.posts.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="flex-1 sm:flex-none">
                    قصص النجاح
                    {query && results.stories?.length > 0 && (
                      <span className="mr-1 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                        {results.stories.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="pages" className="flex-1 sm:flex-none">
                    الصفحات
                    {query && results.pages?.length > 0 && (
                      <span className="mr-1 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                        {results.pages.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  {renderSearchResults(getResultsByTab())}
                </TabsContent>

                <TabsContent value="scholarships" className="mt-4">
                  {renderSearchResults(results.scholarships || [])}
                </TabsContent>

                <TabsContent value="posts" className="mt-4">
                  {renderSearchResults(results.posts || [])}
                </TabsContent>

                <TabsContent value="stories" className="mt-4">
                  {renderSearchResults(results.stories || [])}
                </TabsContent>

                <TabsContent value="pages" className="mt-4">
                  {renderSearchResults(results.pages || [])}
                </TabsContent>
              </Tabs>

              {/* عنصر التنقل بين الصفحات */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                    showText
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* صندوق البحث الكبير عندما لا يوجد استعلام */}
        {!query && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center max-w-3xl mx-auto">
            <Search className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ابحث في المنصة</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ابحث عن المنح الدراسية، المقالات، قصص النجاح، الدول، المستويات الدراسية، والمزيد.
            </p>
            
            <div className="max-w-xl mx-auto">
              <GlobalSearch 
                placeholder="أدخل كلمات البحث هنا..."
                size="lg"
                className="w-full"
                onSearch={(searchQuery) => handleSearch(searchQuery)}
              />
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/scholarships"
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <GraduationCap className="h-8 w-8 mb-2 text-primary" />
                <span className="text-gray-800 dark:text-gray-200">المنح الدراسية</span>
              </Link>
              <Link
                href="/posts"
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <BookOpen className="h-8 w-8 mb-2 text-primary" />
                <span className="text-gray-800 dark:text-gray-200">المقالات</span>
              </Link>
              <Link
                href="/success-stories"
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="text-gray-800 dark:text-gray-200">قصص النجاح</span>
              </Link>
              <Link
                href="/categories"
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Tag className="h-8 w-8 mb-2 text-primary" />
                <span className="text-gray-800 dark:text-gray-200">التصنيفات</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );

  // تصيير نتائج البحث
  function renderSearchResults(results: any[]) {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">جاري البحث...</span>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">لا توجد نتائج</h3>
          <p className="text-gray-600 dark:text-gray-400">
            لم نتمكن من العثور على نتائج مطابقة. حاول استخدام كلمات مفتاحية مختلفة أو تصفية أخرى.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.map((result, index) => {
          switch (result.type) {
            case 'scholarship':
              return renderScholarshipResult(result as ScholarshipSearchResult, index);
            case 'post':
              return renderPostResult(result as PostSearchResult, index);
            case 'story':
              return renderStoryResult(result as StorySearchResult, index);
            default:
              return renderGenericResult(result, index);
          }
        })}
      </div>
    );
  }

  // تصيير نتيجة منحة دراسية
  function renderScholarshipResult(scholarship: ScholarshipSearchResult, index: number) {
    return (
      <div key={`scholarship-${scholarship.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <Link href={scholarship.url || `/scholarships/${scholarship.slug}`} className="flex flex-col md:flex-row">
          {/* صورة المنحة */}
          {(scholarship.thumbnailUrl || scholarship.imageUrl) && (
            <div className="md:w-56 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
              <Image
                src={scholarship.thumbnailUrl || scholarship.imageUrl || '/images/placeholder.svg'}
                alt={scholarship.title}
                fill
                className="object-cover"
              />
              {scholarship.isFullyFunded && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                  ممول بالكامل
                </div>
              )}
            </div>
          )}

          <div className="p-4 md:p-5 flex-1">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">منحة دراسية</span>
              
              {scholarship.country && (
                <div className="flex items-center ml-3">
                  <MapPin size={12} className="ml-1" />
                  <span>{scholarship.country.name}</span>
                </div>
              )}
              
              {scholarship.level && (
                <div className="flex items-center ml-3">
                  <GraduationCap size={12} className="ml-1" />
                  <span>{scholarship.level.name}</span>
                </div>
              )}
              
              {scholarship.deadline && (
                <div className="flex items-center">
                  <Calendar size={12} className="ml-1" />
                  <span>آخر موعد: {new Date(scholarship.deadline).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400 transition-colors line-clamp-2">
              {scholarship.title}
            </h3>

            {scholarship.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {scholarship.description}
              </p>
            )}

            <div className="mt-auto pt-2">
              <div className="flex flex-wrap gap-2 text-xs">
                {scholarship.university && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
                    {scholarship.university}
                  </span>
                )}
                
                {scholarship.category && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
                    {scholarship.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // تصيير نتيجة مقال
  function renderPostResult(post: PostSearchResult, index: number) {
    return (
      <div key={`post-${post.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <Link href={post.url || `/posts/${post.slug}`} className="flex flex-col md:flex-row">
          {/* صورة المقال */}
          {(post.thumbnailUrl || post.imageUrl) && (
            <div className="md:w-48 h-40 md:h-auto relative overflow-hidden flex-shrink-0">
              <Image
                src={post.thumbnailUrl || post.imageUrl || '/images/placeholder.svg'}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-5 flex-1">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full ml-2">مقال</span>
              
              {post.category && (
                <div className="flex items-center ml-3">
                  <Tag size={12} className="ml-1" />
                  <span>{post.category.name}</span>
                </div>
              )}
              
              {post.createdAt && (
                <div className="flex items-center">
                  <Calendar size={12} className="ml-1" />
                  <span>{new Date(post.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
            )}

            {post.authorName && (
              <div className="mt-auto pt-2 text-sm text-gray-500 dark:text-gray-400">
                بواسطة: {post.authorName}
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // تصيير نتيجة قصة نجاح
  function renderStoryResult(story: StorySearchResult, index: number) {
    return (
      <div key={`story-${story.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <Link href={story.url || `/success-stories/${story.slug}`} className="flex flex-col md:flex-row">
          {/* صورة قصة النجاح */}
          {(story.thumbnailUrl || story.imageUrl) && (
            <div className="md:w-48 h-40 md:h-auto relative overflow-hidden flex-shrink-0">
              <Image
                src={story.thumbnailUrl || story.imageUrl || '/images/placeholder.svg'}
                alt={story.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-5 flex-1">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full ml-2">قصة نجاح</span>
              
              {story.createdAt && (
                <div className="flex items-center">
                  <Calendar size={12} className="ml-1" />
                  <span>{new Date(story.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-2">
              {story.title}
            </h3>

            {story.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {story.excerpt}
              </p>
            )}

            <div className="mt-auto pt-2 flex items-center text-sm">
              {story.studentName && (
                <span className="text-gray-700 dark:text-gray-300 font-medium ml-2">
                  {story.studentName}
                </span>
              )}
              
              {story.university && (
                <span className="text-gray-500 dark:text-gray-400">
                  {story.university}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // تصيير نتيجة عامة
  function renderGenericResult(result: any, index: number) {
    return (
      <div key={`result-${result.id || index}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <Link href={result.url || '#'} className="block">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {result.typeLabel || result.type}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400 transition-colors">
            {result.title}
          </h3>

          {result.description && (
            <p className="text-gray-600 dark:text-gray-300">
              {result.description}
            </p>
          )}
        </Link>
      </div>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  const { q, tab = 'all', page = '1' } = query;
  
  // تعيين مدة التخزين المؤقت - 5 دقائق للنتائج
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  
  // إذا لم يتم تقديم استعلام، لا داعي لإجراء البحث
  if (!q) {
    return {
      props: {
        initialQuery: '',
        initialResults: {},
        initialTotalItems: 0,
        initialPage: parseInt(page as string) || 1,
        initialActiveTab: tab as string || 'all'
      }
    };
  }
  
  try {
    // بناء معلمات الاستعلام
    const params = new URLSearchParams({
      q: q as string,
      page: page as string,
      limit: '10',
      tab: tab as string
    });
    
    // إضافة أي فلاتر أخرى من الاستعلام
    Object.entries(query).forEach(([key, value]) => {
      if (!['q', 'page', 'tab'].includes(key) && value) {
        params.append(key, value as string);
      }
    });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`خطأ في البحث: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      props: {
        initialQuery: q as string,
        initialResults: data.results || {},
        initialTotalItems: data.total || 0,
        initialPage: parseInt(page as string) || 1,
        initialActiveTab: tab as string || 'all'
      }
    };
  } catch (error) {
    console.error('خطأ في البحث:', error);
    
    return {
      props: {
        initialQuery: q as string,
        initialResults: {},
        initialTotalItems: 0,
        initialPage: parseInt(page as string) || 1,
        initialActiveTab: tab as string || 'all',
        error: 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.'
      }
    };
  }
}