import Link from 'next/link';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { useMenus } from '@/contexts/menus-context';
import { Mail, Phone, MapPin, Heart, BookOpen, User, School, Award, ShieldCheck, HelpCircle, FileText, Home, MessageSquare, LogIn, ExternalLink } from 'lucide-react';

// تخزين الأيقونات المناسبة لكل نوع من أنواع القوائم
const menuTypeIcons: Record<string, any> = {
  link: ExternalLink,
  page: FileText,
  category: Home,
  level: Award,
  country: Award,
  scholarship: Award,
  post: FileText,
  default: FileText
};

export default function Footer() {
  const { siteSettings } = useSiteSettings();
  const { footerMainMenu, footerSecondaryMenu, isLoading: isMenuLoading } = useMenus();
  
  // الحصول على السنة الحالية
  const currentYear = new Date().getFullYear();
  
  // القوائم الافتراضية في حالة عدم وجود بيانات
  const defaultMainFooterMenu = [
    { id: 1, title: 'الرئيسية', type: 'link', url: '/', icon: Home },
    { id: 2, title: 'المنح الدراسية', type: 'link', url: '/scholarships', icon: Award },
    { id: 3, title: 'المقالات', type: 'link', url: '/posts', icon: FileText },
    { id: 4, title: 'قصص النجاح', type: 'link', url: '/success-stories', icon: School },
    { id: 5, title: 'اتصل بنا', type: 'link', url: '/contact', icon: MessageSquare }
  ];
  
  const defaultSecondaryFooterMenu = [
    { id: 1, title: 'عن المنصة', type: 'link', url: '/about', icon: User },
    { id: 2, title: 'سياسة الخصوصية', type: 'link', url: '/privacy-policy', icon: ShieldCheck },
    { id: 3, title: 'الشروط والأحكام', type: 'link', url: '/terms', icon: FileText },
    { id: 4, title: 'الأسئلة الشائعة', type: 'link', url: '/faq', icon: HelpCircle },
    { id: 5, title: 'تسجيل الدخول', type: 'link', url: '/auth/login', icon: LogIn }
  ];
  
  return (
    <footer className="bg-slate-900 dark:bg-gray-950 text-white border-t border-slate-800/50 dark:border-gray-800/50">
      {/* القسم الرئيسي */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* معلومات الموقع */}
          <div className="lg:col-span-4">
            {/* الشعار */}
            <div className="mb-6">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.siteName || 'الموقع'}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 inline-block text-white px-4 py-2 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold">
                    {siteSettings?.siteName || 'FULLSCO'}
                  </h2>
                </div>
              )}
            </div>
            
            {/* وصف الموقع */}
            <p className="mb-8 text-gray-400 leading-relaxed">
              {siteSettings?.siteDescription || 
                'منصة شاملة للمنح الدراسية والفرص التعليمية حول العالم. نساعدك على العثور على المنح الدراسية المناسبة وفقًا لاهتماماتك ومؤهلاتك.'}
            </p>
            
            {/* وسائل التواصل الاجتماعي */}
            <div className="flex space-x-3 rtl:space-x-reverse">
              {siteSettings?.socialMedia?.facebook && (
                <a 
                  href={siteSettings.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 rounded-md transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              
              {siteSettings?.socialMedia?.twitter && (
                <a 
                  href={siteSettings.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 dark:bg-gray-800 hover:bg-blue-400 dark:hover:bg-blue-400 rounded-md transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              )}
              
              {siteSettings?.socialMedia?.instagram && (
                <a 
                  href={siteSettings.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 dark:bg-gray-800 hover:bg-pink-600 dark:hover:bg-pink-600 rounded-md transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              
              {siteSettings?.socialMedia?.linkedin && (
                <a 
                  href={siteSettings.socialMedia.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 dark:bg-gray-800 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-md transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              
              {siteSettings?.socialMedia?.youtube && (
                <a 
                  href={siteSettings.socialMedia.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 rounded-md transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          {/* روابط سريعة + معلومات الاتصال في نفس العمود للشاشات المتوسطة */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* روابط سريعة */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">روابط سريعة</h3>
                <ul className="space-y-2">
                  {!isMenuLoading && footerMainMenu.map((item: any, index: number) => {
                    // تحديد الأيقونة المناسبة ورابط الوجهة
                    const IconComponent = menuTypeIcons[item.type] || menuTypeIcons.default;
                    const href = item.type === 'link' ? item.url : `/${item.type}s/${item.slug || ''}`;
                    
                    return (
                      <li key={index}>
                        <Link 
                          href={href}
                          className="flex items-center text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <IconComponent className="w-4 h-4 ml-2 opacity-70" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* في حالة تحميل البيانات، نعرض عناصر وهمية */}
                  {isMenuLoading && (
                    <>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              {/* روابط مفيدة */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">روابط مفيدة</h3>
                <ul className="space-y-2">
                  {!isMenuLoading && footerSecondaryMenu.map((item: any, index: number) => {
                    // تحديد الأيقونة المناسبة ورابط الوجهة
                    const IconComponent = menuTypeIcons[item.type] || menuTypeIcons.default;
                    const href = item.type === 'link' ? item.url : `/${item.type}s/${item.slug || ''}`;
                    
                    return (
                      <li key={index}>
                        <Link 
                          href={href}
                          className="flex items-center text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <IconComponent className="w-4 h-4 ml-2 opacity-70" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* في حالة تحميل البيانات، نعرض عناصر وهمية */}
                  {isMenuLoading && (
                    <>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                      <li className="animate-pulse">
                        <div className="flex items-center">
                          <div className="w-4 h-4 ml-2 bg-gray-600 rounded opacity-50"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded opacity-50"></div>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              {/* معلومات الاتصال */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">تواصل معنا</h3>
                <ul className="space-y-3">
                  {siteSettings?.siteEmail && (
                    <li className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <a 
                        href={`mailto:${siteSettings.siteEmail}`}
                        className="text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        {siteSettings.siteEmail}
                      </a>
                    </li>
                  )}
                  
                  {siteSettings?.sitePhone && (
                    <li className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <a 
                        href={`tel:${siteSettings.sitePhone}`}
                        className="text-gray-300 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        {siteSettings.sitePhone}
                      </a>
                    </li>
                  )}
                  
                  {siteSettings?.siteAddress && (
                    <li className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                      <span className="text-gray-300 dark:text-gray-400">{siteSettings.siteAddress}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* شريط حقوق النشر */}
      <div className="border-t border-slate-800/40 dark:border-gray-800/40 py-6 bg-slate-950/50 dark:bg-black/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                &copy; {currentYear} {siteSettings?.siteName || 'FULLSCO'}. جميع الحقوق محفوظة.
              </p>
            </div>
            
            <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center">
              تم التطوير بواسطة 
              <Heart className="mx-1 w-4 h-4 text-red-500" />
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 dark:text-blue-300 hover:text-blue-300 dark:hover:text-blue-200 transition-colors font-medium"
              >
                FULLSCO
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}