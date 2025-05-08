import { Request, Response } from 'express';
import { SiteSettingsService } from '../services/site-settings-service';
import { insertSiteSettingsSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class SiteSettingsController {
  private service: SiteSettingsService;

  constructor() {
    this.service = new SiteSettingsService();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getSiteSettings();
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على إعدادات الموقع'
        });
        return;
      }
      
      res.json(successResponse(settings, 'تم جلب إعدادات الموقع بنجاح'));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      
      // معالجة القيم المنطقية (Boolean)
      // الأصل: تحويل القيم النصية من واجهة المستخدم إلى قيم منطقية
      let processedData: Record<string, any> = {};
      
      console.log('validatedData:', validatedData);
      
      // التحقق من صحة البيانات قبل معالجتها
      if (validatedData && typeof validatedData === 'object') {
        try {
          // نسخة أكثر أمانًا للتعامل مع البيانات
          const safeData = validatedData || {};
          
          // تحديث طريقة المعالجة لتجنب مشاكل null أو undefined
          if (Object.keys(safeData).length > 0) {
            processedData = Object.entries(safeData).reduce((result, [key, value]) => {
              // للتعامل مع القيم المنطقية المرسلة كنصوص
              if (typeof value === 'string' && (value === 'true' || value === 'false')) {
                result[key] = value === 'true';
              } else {
                result[key] = value;
              }
              return result;
            }, {} as Record<string, any>);
          } else {
            processedData = {}; // إرجاع كائن فارغ إذا لم تكن هناك مفاتيح
          }
        } catch (error) {
          console.error('Error processing validatedData:', error);
          processedData = { ...validatedData }; // نسخ البيانات كما هي في حالة الخطأ
        }
      }
      
      console.log('Updating site settings with data:', processedData);
      
      const updatedSettings = await this.service.updateSiteSettings(processedData);
      
      res.json(successResponse(
        updatedSettings,
        'تم تحديث إعدادات الموقع بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات إعدادات الموقع',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }
}