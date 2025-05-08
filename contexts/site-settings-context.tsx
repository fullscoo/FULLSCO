import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteTagline?: string;
  siteEmail?: string;
  sitePhone?: string;
  siteAddress?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    enableDarkMode: boolean;
    rtlDirection: boolean;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  layout: {
    homePageLayout: string;
    scholarshipPageLayout: string;
    articlePageLayout: string;
  };
  sections: {
    showHeroSection: boolean;
    showFeaturedScholarships: boolean;
    showSearchSection: boolean;
    showCategoriesSection: boolean;
    showCountriesSection: boolean;
    showLatestArticles: boolean;
    showSuccessStories: boolean;
    showNewsletterSection: boolean;
    showStatisticsSection: boolean;
    showPartnersSection: boolean;
  };
  customCss?: string;
  
  // حقول إضافية لدعم التوافق مع هيكل البيانات المستلمة من الخادم
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
}

// إنشاء سياق إعدادات الموقع
const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// القيم الافتراضية لإعدادات الموقع
const defaultSiteSettings: SiteSettings = {
  siteName: 'FULLSCO',
  siteDescription: 'منصة المنح الدراسية والفرص التعليمية',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    accentColor: '#a855f7',
    enableDarkMode: true,
    rtlDirection: true
  },
  socialMedia: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  layout: {
    homePageLayout: 'default',
    scholarshipPageLayout: 'default',
    articlePageLayout: 'default'
  },
  sections: {
    showHeroSection: true,
    showFeaturedScholarships: true,
    showSearchSection: true,
    showCategoriesSection: true,
    showCountriesSection: true,
    showLatestArticles: true,
    showSuccessStories: true,
    showNewsletterSection: true,
    showStatisticsSection: true,
    showPartnersSection: true
  }
};

// مزود سياق إعدادات الموقع
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSiteSettings() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/site-settings');
        
        if (!response.ok) {
          throw new Error('فشل في جلب إعدادات الموقع');
        }
        
        const data = await response.json();
        
        if (data.settings) {
          console.log('تم استلام إعدادات الموقع:', data.settings);
          
          // تعيين بيانات الإعدادات مباشرة بدون تنسيق لاستخدام البيانات الحقيقية فقط
          setSiteSettings({
            // البيانات الأساسية
            siteName: data.settings.siteName,
            siteDescription: data.settings.siteDescription,
            siteTagline: data.settings.siteTagline,
            siteEmail: data.settings.email,
            sitePhone: data.settings.phone,
            siteAddress: data.settings.address,
            logoUrl: data.settings.logo,
            logoDarkUrl: data.settings.logoDark,
            faviconUrl: data.settings.favicon,
            footerText: data.settings.footerText,
            
            // البيانات المحسنة
            socialMedia: {
              facebook: data.settings.facebook,
              twitter: data.settings.twitter,
              instagram: data.settings.instagram,
              linkedin: data.settings.linkedin,
              youtube: data.settings.youtube,
              whatsapp: data.settings.whatsapp
            },
            
            // السمة
            theme: {
              primaryColor: data.settings.primaryColor,
              secondaryColor: data.settings.secondaryColor,
              accentColor: data.settings.accentColor,
              enableDarkMode: data.settings.enableDarkMode,
              rtlDirection: data.settings.rtlDirection
            },
            
            // التخطيط
            layout: {
              homePageLayout: data.settings.homePageLayout,
              scholarshipPageLayout: data.settings.scholarshipPageLayout,
              articlePageLayout: data.settings.articlePageLayout
            },
            
            // الأقسام
            sections: {
              showHeroSection: data.settings.showHeroSection,
              showFeaturedScholarships: data.settings.showFeaturedScholarships,
              showSearchSection: data.settings.showSearchSection,
              showCategoriesSection: data.settings.showCategoriesSection,
              showCountriesSection: data.settings.showCountriesSection,
              showLatestArticles: data.settings.showLatestArticles,
              showSuccessStories: data.settings.showSuccessStories,
              showNewsletterSection: data.settings.showNewsletterSection,
              showStatisticsSection: data.settings.showStatisticsSection,
              showPartnersSection: data.settings.showPartnersSection
            },
            
            // إضافات
            customCss: data.settings.customCss,
            
            // دعم الحقول البديلة
            email: data.settings.email,
            phone: data.settings.phone, 
            address: data.settings.address,
            facebook: data.settings.facebook,
            twitter: data.settings.twitter,
            instagram: data.settings.instagram,
            linkedin: data.settings.linkedin,
            youtube: data.settings.youtube,
            whatsapp: data.settings.whatsapp
          });
        } else {
          console.error('لم يتم العثور على إعدادات في استجابة API');
          setError('لم يتم العثور على إعدادات الموقع');
        }
        
        setError(null);
      } catch (err) {
        console.error('خطأ في جلب إعدادات الموقع:', err);
        setError('حدث خطأ أثناء جلب إعدادات الموقع');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSiteSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, isLoading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// Hook لاستخدام سياق إعدادات الموقع
export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  
  if (context === undefined) {
    throw new Error('يجب استخدام useSiteSettings داخل SiteSettingsProvider');
  }
  
  return context;
}