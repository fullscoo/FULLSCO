import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  defaultQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showLabel?: boolean;
  isCompact?: boolean;
  isSearchPage?: boolean;
}

/**
 * مكون نموذج البحث
 * يتيح للمستخدمين البحث عن المنح الدراسية
 */
export function SearchForm({
  defaultQuery = '',
  placeholder = 'ابحث عن منح دراسية، جامعات، تخصصات...',
  onSearch,
  className = '',
  showLabel = false,
  isCompact = false,
  isSearchPage = false
}: SearchFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  
  // معالجة تقديم النموذج
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) return;
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else if (isSearchPage) {
      // إذا كنا في صفحة البحث، نقوم بتحديث الاستعلام فقط
      router.push({
        pathname: router.pathname,
        query: { ...router.query, search: trimmedQuery, page: '1' }
      }, undefined, { scroll: false });
    } else {
      // التوجيه إلى صفحة البحث
      router.push(`/scholarships?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };
  
  // معالجة تغيير قيمة البحث
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // مسح البحث
  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    } else if (isSearchPage) {
      const { search, ...restQuery } = router.query;
      router.push({
        pathname: router.pathname,
        query: { ...restQuery, page: '1' }
      }, undefined, { scroll: false });
    }
  };
  
  // تحديد أنماط العناصر بناءً على حجم النموذج
  const inputClasses = isCompact
    ? 'py-2 px-4 pl-10 text-sm'
    : 'py-3 md:py-4 px-4 pl-12';
    
  const buttonClasses = isCompact
    ? 'px-4 py-2 text-sm'
    : 'px-6 py-3 md:py-4 text-base';
  
  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="search-input" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          البحث عن منح دراسية
        </label>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
        <div className="relative flex-grow mb-2 sm:mb-0">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={isCompact ? 18 : 22}
          />
          
          <input
            id="search-input"
            type="text"
            className={`w-full ${inputClasses} rounded-lg sm:rounded-r-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary`}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleChange}
            aria-label="مربع البحث"
            autoComplete="off"
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="مسح البحث"
            >
              <X size={isCompact ? 16 : 18} />
            </button>
          )}
        </div>
        
        <button
          type="submit"
          className={`${buttonClasses} bg-primary hover:bg-primary/90 text-white font-medium rounded-lg sm:rounded-l-none transition-colors`}
          disabled={!searchQuery.trim()}
          aria-label="بحث"
        >
          بحث
        </button>
      </form>
    </div>
  );
}