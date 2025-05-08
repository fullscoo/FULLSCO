import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Filter, Check, ChevronDown, X } from 'lucide-react';

interface FilterOption {
  id: number;
  name: string;
  slug?: string;
  count?: number;
}

interface FilterComponentProps {
  categories?: FilterOption[];
  countries?: FilterOption[];
  levels?: FilterOption[];
  fundingTypes?: string[];
  defaultValues?: {
    category?: string;
    country?: string;
    level?: string;
    fundingType?: string;
    sortBy?: string;
  };
  onFilterChange?: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

/**
 * مكون تصفية المنح الدراسية
 * يتيح للمستخدمين تصفية المنح حسب الفئة، الدولة، المستوى، ونوع التمويل
 */
export function FilterComponent({
  categories = [],
  countries = [],
  levels = [],
  fundingTypes = ['ممولة بالكامل', 'ممولة جزئياً', 'منح تكاليف دراسية', 'منح تدريب'],
  defaultValues = {},
  onFilterChange,
  isLoading = false
}: FilterComponentProps) {
  const router = useRouter();
  
  // حالة تصفية المنح
  const [filters, setFilters] = useState({
    category: defaultValues.category || '',
    country: defaultValues.country || '',
    level: defaultValues.level || '',
    fundingType: defaultValues.fundingType || '',
    sortBy: defaultValues.sortBy || 'newest'
  });
  
  // حالة عرض/إخفاء الفلاتر على الأجهزة المحمولة
  const [showFilters, setShowFilters] = useState(false);
  
  // تأثير لتحديث حالة الفلاتر عند تغيير استعلام URL
  useEffect(() => {
    setFilters({
      category: (router.query.category as string) || defaultValues.category || '',
      country: (router.query.country as string) || defaultValues.country || '',
      level: (router.query.level as string) || defaultValues.level || '',
      fundingType: (router.query.fundingType as string) || defaultValues.fundingType || '',
      sortBy: (router.query.sortBy as string) || defaultValues.sortBy || 'newest'
    });
  }, [router.query, defaultValues]);
  
  // معالجة تغيير الفلاتر
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    } else {
      // تحديث استعلام URL
      const updatedQuery = { ...router.query, [filterName]: value, page: '1' };
      
      // إزالة الفلاتر الفارغة من الاستعلام
      Object.keys(updatedQuery).forEach(key => {
        if (updatedQuery[key] === '') {
          delete updatedQuery[key];
        }
      });
      
      router.push({
        pathname: router.pathname,
        query: updatedQuery
      }, undefined, { scroll: false });
    }
  };
  
  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    const newFilters = {
      category: '',
      country: '',
      level: '',
      fundingType: '',
      sortBy: 'newest'
    };
    
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    } else {
      // استخراج استعلام البحث فقط من الاستعلام الحالي
      const { search, page = '1', ...rest } = router.query;
      
      router.push({
        pathname: router.pathname,
        query: search ? { search, page: '1' } : { page: '1' }
      }, undefined, { scroll: false });
    }
  };
  
  // التحقق مما إذا كانت أي فلاتر نشطة
  const hasActiveFilters = filters.category || filters.country || filters.level || filters.fundingType || filters.sortBy !== 'newest';
  
  // قائمة خيارات الترتيب
  const sortOptions = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'deadline', label: 'آخر موعد للتقديم' },
    { value: 'popularity', label: 'الأكثر شهرة' },
    { value: 'relevance', label: 'الأكثر صلة' }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* رأس الفلاتر */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h3 className="font-medium">تصفية المنح</h3>
          
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
              نشط
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center gap-1"
              disabled={isLoading}
            >
              <X size={14} />
              مسح الكل
            </button>
          )}
          
          <button
            type="button"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-label={showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
      
      {/* محتوى الفلاتر */}
      <div className={`md:block ${showFilters ? 'block' : 'hidden'}`}>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* التصنيفات */}
          {categories.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium mb-2">التصنيف</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right ${
                    filters.category === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('category', '')}
                  disabled={isLoading}
                >
                  {filters.category === '' && <Check size={16} />}
                  <span className={filters.category === '' ? 'mr-2' : ''}>جميع التصنيفات</span>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right ${
                      filters.category === category.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('category', category.slug || '')}
                    disabled={isLoading}
                  >
                    {filters.category === category.slug && <Check size={16} />}
                    <span className={filters.category === category.slug ? 'mr-2' : ''}>
                      {category.name}
                      {category.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
                          ({category.count})
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* الدول */}
          {countries.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium mb-2">الدولة</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right ${
                    filters.country === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('country', '')}
                  disabled={isLoading}
                >
                  {filters.country === '' && <Check size={16} />}
                  <span className={filters.country === '' ? 'mr-2' : ''}>جميع الدول</span>
                </button>
                
                {countries.map(country => (
                  <button
                    key={country.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right ${
                      filters.country === country.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('country', country.slug || '')}
                    disabled={isLoading}
                  >
                    {filters.country === country.slug && <Check size={16} />}
                    <span className={filters.country === country.slug ? 'mr-2' : ''}>
                      {country.name}
                      {country.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
                          ({country.count})
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* المستويات */}
          {levels.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium mb-2">المستوى</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right ${
                    filters.level === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('level', '')}
                  disabled={isLoading}
                >
                  {filters.level === '' && <Check size={16} />}
                  <span className={filters.level === '' ? 'mr-2' : ''}>جميع المستويات</span>
                </button>
                
                {levels.map(level => (
                  <button
                    key={level.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right ${
                      filters.level === level.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('level', level.slug || '')}
                    disabled={isLoading}
                  >
                    {filters.level === level.slug && <Check size={16} />}
                    <span className={filters.level === level.slug ? 'mr-2' : ''}>
                      {level.name}
                      {level.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
                          ({level.count})
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* نوع التمويل */}
          {fundingTypes.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium mb-2">نوع التمويل</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right ${
                    filters.fundingType === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('fundingType', '')}
                  disabled={isLoading}
                >
                  {filters.fundingType === '' && <Check size={16} />}
                  <span className={filters.fundingType === '' ? 'mr-2' : ''}>جميع أنواع التمويل</span>
                </button>
                
                {fundingTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right ${
                      filters.fundingType === type 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('fundingType', type)}
                    disabled={isLoading}
                  >
                    {filters.fundingType === type && <Check size={16} />}
                    <span className={filters.fundingType === type ? 'mr-2' : ''}>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* ترتيب حسب */}
          <div className="p-4">
            <h4 className="font-medium mb-2">ترتيب حسب</h4>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`flex items-center gap-2 w-full text-right ${
                    filters.sortBy === option.value 
                      ? 'text-primary font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('sortBy', option.value)}
                  disabled={isLoading}
                >
                  {filters.sortBy === option.value && <Check size={16} />}
                  <span className={filters.sortBy === option.value ? 'mr-2' : ''}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}