import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Filter, 
  Check, 
  ChevronDown, 
  X, 
  ArrowUpDown, 
  Tag, 
  Globe, 
  GraduationCap, 
  Coins, 
  Search, 
  Loader2 
} from 'lucide-react';
import { cn } from '../../lib/utils';

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
  variant?: 'default' | 'shadcn';
  className?: string;
  title?: string;
  showApplyButton?: boolean;
  showActiveCount?: boolean;
  includeKeywordSearch?: boolean;
}

/**
 * مكون تصفية المنح الدراسية المحسن
 * يتيح للمستخدمين تصفية المنح حسب الفئة، الدولة، المستوى، نوع التمويل وأكثر
 * مع دعم البحث السريع والواجهة المتقدمة
 */
export function FilterComponent({
  categories = [],
  countries = [],
  levels = [],
  fundingTypes = ['ممولة بالكامل', 'ممولة جزئياً', 'منح تكاليف دراسية', 'منح تدريب'],
  defaultValues = {},
  onFilterChange,
  isLoading = false,
  variant = 'default',
  className = '',
  title = 'تصفية المنح',
  showApplyButton = false,
  showActiveCount = true,
  includeKeywordSearch = false
}: FilterComponentProps) {
  const router = useRouter();
  
  // حالة تصفية المنح
  const [filters, setFilters] = useState({
    category: defaultValues.category || '',
    country: defaultValues.country || '',
    level: defaultValues.level || '',
    fundingType: defaultValues.fundingType || '',
    sortBy: defaultValues.sortBy || 'newest',
    keyword: ''
  });
  
  // حالة عرض/إخفاء الفلاتر على الأجهزة المحمولة
  const [showFilters, setShowFilters] = useState(false);
  
  // حالة عملية التطبيق
  const [isApplying, setIsApplying] = useState(false);
  
  // تأثير لتحديث حالة الفلاتر عند تغيير استعلام URL
  useEffect(() => {
    setFilters({
      category: (router.query.category as string) || defaultValues.category || '',
      country: (router.query.country as string) || defaultValues.country || '',
      level: (router.query.level as string) || defaultValues.level || '',
      fundingType: (router.query.fundingType as string) || defaultValues.fundingType || '',
      sortBy: (router.query.sortBy as string) || defaultValues.sortBy || 'newest',
      keyword: (router.query.keyword as string) || ''
    });
  }, [router.query, defaultValues]);
  
  // معالجة تغيير الفلاتر
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    if (!showApplyButton) {
      applyFilters(newFilters);
    }
  };
  
  // معالجة تغيير كلمات البحث
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, keyword: e.target.value });
  };
  
  // تطبيق الفلاتر
  const applyFilters = (filtersToApply = filters) => {
    setIsApplying(true);
    
    try {
      if (onFilterChange) {
        onFilterChange(filtersToApply);
      } else {
        // تحديث استعلام URL
        const updatedQuery = { ...router.query, page: '1' } as Record<string, string>;
        
        // إضافة الفلاتر إلى الاستعلام
        Object.entries(filtersToApply).forEach(([key, value]: [string, string]) => {
          if (value) {
            (updatedQuery as any)[key] = value;
          } else {
            delete (updatedQuery as any)[key];
          }
        });
        
        router.push({
          pathname: router.pathname,
          query: updatedQuery
        }, undefined, { scroll: false });
      }
    } finally {
      setIsApplying(false);
    }
  };
  
  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    const newFilters = {
      category: '',
      country: '',
      level: '',
      fundingType: '',
      sortBy: 'newest',
      keyword: ''
    };
    
    setFilters(newFilters);
    
    if (!showApplyButton) {
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
    }
  };
  
  // التحقق مما إذا كانت أي فلاتر نشطة
  const hasActiveFilters = filters.category || filters.country || filters.level || filters.fundingType || filters.sortBy !== 'newest' || filters.keyword;
  
  // عدد الفلاتر النشطة
  const activeFiltersCount = [
    filters.category, 
    filters.country, 
    filters.level, 
    filters.fundingType,
    filters.keyword
  ].filter(Boolean).length;
  
  // قائمة خيارات الترتيب
  const sortOptions = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'deadline', label: 'آخر موعد للتقديم' },
    { value: 'popularity', label: 'الأكثر شهرة' },
    { value: 'relevance', label: 'الأكثر صلة' }
  ];
  
  // تعيين تصميم shadcn
  if (variant === 'shadcn') {
    return (
      <div className={cn("rounded-lg border border-input bg-background shadow-sm overflow-hidden", className)}>
        {/* رأس الفلاتر */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <h3 className="font-medium">{title}</h3>
            
            {showActiveCount && hasActiveFilters && (
              <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                disabled={isLoading || isApplying}
              >
                <X size={14} />
                مسح الكل
              </button>
            )}
            
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground"
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
          <div className="divide-y">
            {/* البحث بالكلمات المفتاحية */}
            {includeKeywordSearch && (
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ابحث عن كلمات مفتاحية..."
                    className="w-full h-9 pl-3 pr-9 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filters.keyword}
                    onChange={handleKeywordChange}
                    disabled={isLoading || isApplying}
                  />
                  {filters.keyword && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange('keyword', '')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="مسح البحث"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* التصنيفات */}
            {categories.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">التصنيف</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                      filters.category === '' 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleFilterChange('category', '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.category === '' && <Check size={14} />}
                    <span className={filters.category === '' ? 'mr-2' : ''}>جميع التصنيفات</span>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                        filters.category === category.slug 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleFilterChange('category', category.slug || '')}
                      disabled={isLoading || isApplying}
                    >
                      {filters.category === category.slug && <Check size={14} />}
                      <span className={filters.category === category.slug ? 'mr-2' : ''}>
                        {category.name}
                        {category.count !== undefined && (
                          <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded-full mr-1 font-normal">
                            {category.count}
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
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">الدولة</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                      filters.country === '' 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleFilterChange('country', '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.country === '' && <Check size={14} />}
                    <span className={filters.country === '' ? 'mr-2' : ''}>جميع الدول</span>
                  </button>
                  
                  {countries.map(country => (
                    <button
                      key={country.id}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                        filters.country === country.slug 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleFilterChange('country', country.slug || '')}
                      disabled={isLoading || isApplying}
                    >
                      {filters.country === country.slug && <Check size={14} />}
                      <span className={filters.country === country.slug ? 'mr-2' : ''}>
                        {country.name}
                        {country.count !== undefined && (
                          <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded-full mr-1 font-normal">
                            {country.count}
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
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">المستوى</h4>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                      filters.level === '' 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleFilterChange('level', '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.level === '' && <Check size={14} />}
                    <span className={filters.level === '' ? 'mr-2' : ''}>جميع المستويات</span>
                  </button>
                  
                  {levels.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                        filters.level === level.slug 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleFilterChange('level', level.slug || '')}
                      disabled={isLoading || isApplying}
                    >
                      {filters.level === level.slug && <Check size={14} />}
                      <span className={filters.level === level.slug ? 'mr-2' : ''}>
                        {level.name}
                        {level.count !== undefined && (
                          <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded-full mr-1 font-normal">
                            {level.count}
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
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">نوع التمويل</h4>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                      filters.fundingType === '' 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleFilterChange('fundingType', '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.fundingType === '' && <Check size={14} />}
                    <span className={filters.fundingType === '' ? 'mr-2' : ''}>جميع أنواع التمويل</span>
                  </button>
                  
                  {fundingTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                        filters.fundingType === type 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => handleFilterChange('fundingType', type)}
                      disabled={isLoading || isApplying}
                    >
                      {filters.fundingType === type && <Check size={14} />}
                      <span className={filters.fundingType === type ? 'mr-2' : ''}>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* ترتيب حسب */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">ترتيب حسب</h4>
              </div>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 w-full text-sm px-2 py-1.5 rounded-md text-right",
                      filters.sortBy === option.value 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    disabled={isLoading || isApplying}
                  >
                    {filters.sortBy === option.value && <Check size={14} />}
                    <span className={filters.sortBy === option.value ? 'mr-2' : ''}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* زر تطبيق الفلاتر */}
            {showApplyButton && (
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => applyFilters()}
                  disabled={isLoading || isApplying}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md py-2 px-4 transition-colors flex items-center justify-center"
                >
                  {isApplying && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تطبيق الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // التصميم الافتراضي
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      {/* رأس الفلاتر */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h3 className="font-medium">{title}</h3>
          
          {showActiveCount && hasActiveFilters && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center gap-1"
              disabled={isLoading || isApplying}
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
          {/* البحث بالكلمات المفتاحية */}
          {includeKeywordSearch && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن كلمات مفتاحية..."
                  className="w-full h-10 pl-3 pr-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                  value={filters.keyword}
                  onChange={handleKeywordChange}
                  disabled={isLoading || isApplying}
                />
                {filters.keyword && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange('keyword', '')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="مسح البحث"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* التصنيفات */}
          {categories.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Tag size={16} className="ml-1 text-primary" />
                التصنيف
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                    filters.category === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('category', '')}
                  disabled={isLoading || isApplying}
                >
                  {filters.category === '' && <Check size={16} />}
                  <span className={filters.category === '' ? 'mr-2' : ''}>جميع التصنيفات</span>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                      filters.category === category.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('category', category.slug || '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.category === category.slug && <Check size={16} />}
                    <span className={filters.category === category.slug ? 'mr-2' : ''}>
                      {category.name}
                      {category.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {category.count}
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
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Globe size={16} className="ml-1 text-primary" />
                الدولة
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                    filters.country === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('country', '')}
                  disabled={isLoading || isApplying}
                >
                  {filters.country === '' && <Check size={16} />}
                  <span className={filters.country === '' ? 'mr-2' : ''}>جميع الدول</span>
                </button>
                
                {countries.map(country => (
                  <button
                    key={country.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                      filters.country === country.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('country', country.slug || '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.country === country.slug && <Check size={16} />}
                    <span className={filters.country === country.slug ? 'mr-2' : ''}>
                      {country.name}
                      {country.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {country.count}
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
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <GraduationCap size={16} className="ml-1 text-primary" />
                المستوى
              </h4>
              <div className="space-y-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                    filters.level === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('level', '')}
                  disabled={isLoading || isApplying}
                >
                  {filters.level === '' && <Check size={16} />}
                  <span className={filters.level === '' ? 'mr-2' : ''}>جميع المستويات</span>
                </button>
                
                {levels.map(level => (
                  <button
                    key={level.id}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                      filters.level === level.slug 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('level', level.slug || '')}
                    disabled={isLoading || isApplying}
                  >
                    {filters.level === level.slug && <Check size={16} />}
                    <span className={filters.level === level.slug ? 'mr-2' : ''}>
                      {level.name}
                      {level.count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {level.count}
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
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Coins size={16} className="ml-1 text-primary" />
                نوع التمويل
              </h4>
              <div className="space-y-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                    filters.fundingType === '' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('fundingType', '')}
                  disabled={isLoading || isApplying}
                >
                  {filters.fundingType === '' && <Check size={16} />}
                  <span className={filters.fundingType === '' ? 'mr-2' : ''}>جميع أنواع التمويل</span>
                </button>
                
                {fundingTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                      filters.fundingType === type 
                        ? 'text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleFilterChange('fundingType', type)}
                    disabled={isLoading || isApplying}
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
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <ArrowUpDown size={16} className="ml-1 text-primary" />
              ترتيب حسب
            </h4>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`flex items-center gap-2 w-full text-right hover:bg-gray-50 dark:hover:bg-gray-750 px-2 py-1 rounded ${
                    filters.sortBy === option.value 
                      ? 'text-primary font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleFilterChange('sortBy', option.value)}
                  disabled={isLoading || isApplying}
                >
                  {filters.sortBy === option.value && <Check size={16} />}
                  <span className={filters.sortBy === option.value ? 'mr-2' : ''}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* زر تطبيق الفلاتر */}
          {showApplyButton && (
            <div className="p-4">
              <button
                type="button"
                onClick={() => applyFilters()}
                disabled={isLoading || isApplying}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md py-2 px-4 transition-colors flex items-center justify-center"
              >
                {isApplying && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تطبيق الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * مكون تصفية مصغر للاستخدام في صفحات المنح والمحتوى
 */
export function MiniFilterComponent({
  categories = [],
  countries = [],
  levels = [],
  onFilterChange,
  variant = 'default',
  className = '',
}: Pick<FilterComponentProps, 'categories' | 'countries' | 'levels' | 'onFilterChange' | 'variant' | 'className'>) {
  return (
    <FilterComponent
      categories={categories}
      countries={countries}
      levels={levels}
      onFilterChange={onFilterChange}
      variant={variant}
      className={className}
      title="التصفية السريعة"
      showApplyButton={true}
      showActiveCount={false}
      includeKeywordSearch={true}
    />
  );
}

export default FilterComponent;