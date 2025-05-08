import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * مكون التنقل بين الصفحات
 * يتيح للمستخدمين التنقل بين صفحات النتائج
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  isLoading = false
}: PaginationProps) {
  const router = useRouter();
  
  // التأكد من أن الصفحة الحالية وإجمالي الصفحات أرقام صالحة
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validTotalPages = Math.max(1, totalPages);
  
  // حساب الصفحات التي سيتم عرضها
  const getVisiblePages = () => {
    // إذا كان العدد الإجمالي للصفحات 7 أو أقل، اعرض جميع الصفحات
    if (validTotalPages <= 7) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1);
    }
    
    // إظهار الصفحات المجاورة للصفحة الحالية
    const pages = [1]; // دائمًا إظهار الصفحة الأولى
    
    if (validCurrentPage > 3) {
      pages.push(-1); // إضافة علامة "..."
    }
    
    // إضافة الصفحات المجاورة للصفحة الحالية
    for (let i = Math.max(2, validCurrentPage - 1); i <= Math.min(validTotalPages - 1, validCurrentPage + 1); i++) {
      pages.push(i);
    }
    
    if (validCurrentPage < validTotalPages - 2) {
      pages.push(-2); // إضافة علامة "..."
    }
    
    if (validTotalPages > 1) {
      pages.push(validTotalPages); // دائمًا إظهار الصفحة الأخيرة
    }
    
    return pages;
  };
  
  // الانتقال إلى صفحة معينة
  const goToPage = (page: number) => {
    if (page < 1 || page > validTotalPages || page === validCurrentPage || isLoading) {
      return;
    }
    
    if (onPageChange) {
      onPageChange(page);
    } else {
      // تحديث استعلام URL مع الحفاظ على باقي المعلمات
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page: page.toString() }
      }, undefined, { scroll: true });
    }
  };
  
  // الانتقال إلى الصفحة السابقة
  const goToPreviousPage = () => {
    goToPage(validCurrentPage - 1);
  };
  
  // الانتقال إلى الصفحة التالية
  const goToNextPage = () => {
    goToPage(validCurrentPage + 1);
  };
  
  // إذا كان هناك صفحة واحدة فقط، لا داعي لعرض التنقل
  if (validTotalPages <= 1) {
    return null;
  }
  
  const visiblePages = getVisiblePages();
  
  return (
    <nav className={`flex justify-center items-center mt-8 ${className}`} aria-label="تنقل الصفحات">
      {/* زر الصفحة السابقة */}
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={validCurrentPage === 1 || isLoading}
        className={`p-2 mx-1 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center ${
          validCurrentPage === 1 || isLoading
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      
      {/* أزرار الصفحات */}
      <div className="flex items-center">
        {visiblePages.map((page, index) => {
          // إذا كانت القيمة سالبة، فهي تمثل "..."
          if (page < 0) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="p-2 mx-1 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-5 w-5" />
              </span>
            );
          }
          
          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              disabled={page === validCurrentPage || isLoading}
              className={`min-w-[40px] h-10 mx-1 rounded-md ${
                page === validCurrentPage
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={`الصفحة ${page}`}
              aria-current={page === validCurrentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      {/* زر الصفحة التالية */}
      <button
        type="button"
        onClick={goToNextPage}
        disabled={validCurrentPage === validTotalPages || isLoading}
        className={`p-2 mx-1 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center ${
          validCurrentPage === validTotalPages || isLoading
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </nav>
  );
}