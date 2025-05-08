import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, Sun, Moon, Search } from 'lucide-react';
import { useSiteSettings } from '../../contexts/site-settings-context';
import { useMobile } from '../../hooks/use-mobile';

export default function Header() {
  const { siteSettings } = useSiteSettings();
  const router = useRouter();
  const isMobile = useMobile();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // التحقق من وضع العرض (فاتح/داكن) عند تحميل الصفحة
  useEffect(() => {
    // التحقق من التفضيل المخزن محلياً
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
    
    // إضافة مستمع لحدث التمرير
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // إزالة المستمع عند تفكيك المكون
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // تبديل وضع العرض (فاتح/داكن)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // إغلاق القائمة المتنقلة عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [router.pathname]);
  
  // معالجة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/scholarships?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };
  
  // عناصر القائمة
  const menuItems = [
    { title: 'الرئيسية', href: '/' },
    { title: 'المنح الدراسية', href: '/scholarships' },
    { 
      title: 'التصنيفات', 
      children: [
        { title: 'حسب التخصص', href: '/categories' },
        { title: 'حسب الدولة', href: '/countries' },
        { title: 'حسب المستوى', href: '/levels' },
      ]
    },
    { title: 'المقالات', href: '/posts' },
    { title: 'قصص النجاح', href: '/success-stories' },
    { title: 'اتصل بنا', href: '/contact' },
  ];
  
  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md'
          : 'bg-transparent dark:bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* الشعار */}
          <Link href="/" className="flex items-center">
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.siteName || 'الموقع'} 
                className="h-10 w-auto"
              />
            ) : (
              <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                {siteSettings?.siteName || 'FULLSCO'}
              </span>
            )}
          </Link>
          
          {/* القائمة الرئيسية - سطح المكتب */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {menuItems.map((item, index) => (
              item.children ? (
                <div key={index} className="relative group">
                  <button className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    {item.title}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 origin-top-left rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      {item.children.map((child, childIndex) => (
                        <Link 
                          key={childIndex} 
                          href={child.href}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={index} 
                  href={item.href}
                  className={`px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    router.pathname === item.href ? 'font-medium text-primary' : ''
                  }`}
                >
                  {item.title}
                </Link>
              )
            ))}
          </nav>
          
          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            {/* زر البحث */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* زر تبديل السمة */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            {/* زر القائمة المتنقلة */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* نموذج البحث */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-md p-4 border-t dark:border-gray-800 animate-fade-in">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="search"
              placeholder="ابحث عن منح دراسية..."
              className="flex-1 px-4 py-2 border rounded-l-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-r-lg"
            >
              بحث
            </button>
          </form>
        </div>
      )}
      
      {/* القائمة المتنقلة */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-t dark:border-gray-800 animate-fade-in">
          <nav className="flex flex-col py-4">
            {menuItems.map((item, index) => (
              item.children ? (
                <div key={index} className="py-2 px-4">
                  <div className="font-medium mb-2">{item.title}</div>
                  <div className="pl-4 space-y-2 border-r dark:border-gray-700">
                    {item.children.map((child, childIndex) => (
                      <Link 
                        key={childIndex} 
                        href={child.href}
                        className="block py-1 hover:text-primary"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={index} 
                  href={item.href}
                  className={`py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    router.pathname === item.href ? 'font-medium text-primary' : ''
                  }`}
                >
                  {item.title}
                </Link>
              )
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}