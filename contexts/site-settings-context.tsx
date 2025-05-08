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
          
          // إعادة هيكلة البيانات المستلمة لتتوافق مع النموذج المتوقع
          const formattedSettings: SiteSettings = {
            siteName: data.settings.siteName || defaultSiteSettings.siteName,
            siteDescription: data.settings.siteDescription || defaultSiteSettings.siteDescription,
            siteTagline: data.settings.siteTagline,
            siteEmail: data.settings.email,  // ملاحظة: الاسم مختلف في البيانات المستلمة
            sitePhone: data.settings.phone,  // ملاحظة: الاسم مختلف في البيانات المستلمة
            siteAddress: data.settings.address,  // ملاحظة: الاسم مختلف في البيانات المستلمة
            logoUrl: data.settings.logo,
            logoDarkUrl: data.settings.logoDark,
            faviconUrl: data.settings.favicon,
            footerText: data.settings.footerText,
            
            // تنظيم بيانات وسائل التواصل الاجتماعي
            socialMedia: {
              facebook: data.settings.facebook,
              twitter: data.settings.twitter,
              instagram: data.settings.instagram,
              linkedin: data.settings.linkedin,
              youtube: data.settings.youtube,
              whatsapp: data.settings.whatsapp
            },
            
            // تنظيم بيانات السمة
            theme: {
              primaryColor: data.settings.primaryColor || defaultSiteSettings.theme.primaryColor,
              secondaryColor: data.settings.secondaryColor || defaultSiteSettings.theme.secondaryColor,
              accentColor: data.settings.accentColor || defaultSiteSettings.theme.accentColor,
              enableDarkMode: data.settings.enableDarkMode ?? defaultSiteSettings.theme.enableDarkMode,
              rtlDirection: data.settings.rtlDirection ?? defaultSiteSettings.theme.rtlDirection
            },
            
            // تنظيم بيانات التخطيط
            layout: {
              homePageLayout: data.settings.homePageLayout || defaultSiteSettings.layout.homePageLayout,
              scholarshipPageLayout: data.settings.scholarshipPageLayout || defaultSiteSettings.layout.scholarshipPageLayout,
              articlePageLayout: data.settings.articlePageLayout || defaultSiteSettings.layout.articlePageLayout
            },
            
            // تنظيم بيانات الأقسام
            sections: {
              showHeroSection: data.settings.showHeroSection ?? defaultSiteSettings.sections.showHeroSection,
              showFeaturedScholarships: data.settings.showFeaturedScholarships ?? defaultSiteSettings.sections.showFeaturedScholarships,
              showSearchSection: data.settings.showSearchSection ?? defaultSiteSettings.sections.showSearchSection,
              showCategoriesSection: data.settings.showCategoriesSection ?? defaultSiteSettings.sections.showCategoriesSection,
              showCountriesSection: data.settings.showCountriesSection ?? defaultSiteSettings.sections.showCountriesSection,
              showLatestArticles: data.settings.showLatestArticles ?? defaultSiteSettings.sections.showLatestArticles,
              showSuccessStories: data.settings.showSuccessStories ?? defaultSiteSettings.sections.showSuccessStories,
              showNewsletterSection: data.settings.showNewsletterSection ?? defaultSiteSettings.sections.showNewsletterSection,
              showStatisticsSection: data.settings.showStatisticsSection ?? defaultSiteSettings.sections.showStatisticsSection,
              showPartnersSection: data.settings.showPartnersSection ?? defaultSiteSettings.sections.showPartnersSection
            },
            
            customCss: data.settings.customCss
          };
          setSiteSettings(formattedSettings);
        } else {
          // استخدام الإعدادات الافتراضية إذا لم يتم العثور على إعدادات
          console.log('استخدام الإعدادات الافتراضية للموقع');
          setSiteSettings(defaultSiteSettings);
        }
        
        setError(null);
      } catch (err) {
        console.error('خطأ في جلب إعدادات الموقع:', err);
        setError('حدث خطأ أثناء جلب إعدادات الموقع');
        // استخدام الإعدادات الافتراضية في حالة الخطأ
        setSiteSettings(defaultSiteSettings);
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