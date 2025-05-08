import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, Sun, Moon, Search, User, LogIn, Bookmark, Bell, BookOpen } from 'lucide-react';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
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
    
    // التحقق من حالة تسجيل الدخول
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
    
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
    setIsUserMenuOpen(false);
  }, [router.pathname]);
  
  // معالجة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/scholarships?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };
  
  // معالجة تسجيل الخروج
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUser(null);
        setIsLoggedIn(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
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
          ? 'bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 shadow-md'
          : 'bg-white dark:bg-gray-900 shadow-sm'
      }`}
    >
      {/* الشريط العلوي */}
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20 py-2 text-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {siteSettings?.siteEmail && (
              <a href={`mailto:${siteSettings.siteEmail}`} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">
                {siteSettings.siteEmail}
              </a>
            )}
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light flex items-center">
                <BookOpen className="h-4 w-4 ml-1" />
                <span>لوحة التحكم</span>
              </Link>
            ) : (
              <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light flex items-center">
                <LogIn className="h-4 w-4 ml-1" />
                <span>تسجيل الدخول</span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light flex items-center">
                <User className="h-4 w-4 ml-1" />
                <span>إدارة الموقع</span>
              </Link>
            )}
            <button 
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light flex items-center focus:outline-none"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 ml-1" />
                  <span className="hidden sm:inline">الوضع الداكن</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 ml-1" />
                  <span className="hidden sm:inline">الوضع الفاتح</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* القائمة الرئيسية */}
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
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {siteSettings?.siteName || 'FULLSCO'}
              </span>
            )}
          </Link>
          
          {/* القائمة الرئيسية - سطح المكتب */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {menuItems.map((item, index) => (
              item.children ? (
                <div key={index} className="relative group">
                  <button className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    {item.title}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 origin-top-left rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50">
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
                  className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                      ? 'text-primary dark:text-primary-light bg-primary/5 dark:bg-primary/10' 
                      : 'text-gray-700 dark:text-gray-300'
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
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* قسم المستخدم */}
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary-light font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-2 px-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 ml-2" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link 
                        href="/dashboard/saved-scholarships"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4 ml-2" />
                        <span>المنح المحفوظة</span>
                      </Link>
                      <Link 
                        href="/dashboard/notifications"
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bell className="w-4 h-4 ml-2" />
                        <span>الإشعارات</span>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link 
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                          <span>لوحة الإدارة</span>
                        </Link>
                      )}
                      <button 
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800"
                        onClick={handleLogout}
                      >
                        <LogIn className="w-4 h-4 ml-2 transform rotate-180" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-1 py-2 px-4 font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}
            
            {/* زر القائمة المتنقلة */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
        <div className="absolute top-[calc(4rem+var(--header-height))] left-0 right-0 bg-white dark:bg-gray-900 shadow-md p-4 border-t dark:border-gray-800 animate-fade-in">
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
              className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
            >
              بحث
            </button>
          </form>
        </div>
      )}
      
      {/* القائمة المتنقلة */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(var(--header-height))] left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-t dark:border-gray-800 animate-slide-in-top z-50">
          <nav className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {!isLoggedIn && (
              <div className="p-4">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-1 py-2 px-4 w-full font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </Link>
              </div>
            )}
            
            {menuItems.map((item, index) => (
              item.children ? (
                <div key={index} className="py-3 px-4">
                  <div className="font-medium mb-2">{item.title}</div>
                  <div className="pr-4 space-y-2 border-r border-gray-200 dark:border-gray-700">
                    {item.children.map((child, childIndex) => (
                      <Link 
                        key={childIndex} 
                        href={child.href}
                        className="block py-1 hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
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
                  className={`py-3 px-4 flex items-center ${
                    router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                      ? 'font-medium text-primary dark:text-primary-light'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              )
            ))}
            
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="py-3 px-4 flex items-center text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 ml-2" />
                  <span>الملف الشخصي</span>
                </Link>
                <button
                  className="py-3 px-4 flex items-center text-red-600 dark:text-red-500 w-full text-right"
                  onClick={handleLogout}
                >
                  <LogIn className="h-4 w-4 ml-2 transform rotate-180" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}