import { Express, Request, Response } from "express";
import { db } from "../db";
import { pages } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

/**
 * تسجيل مسارات الصفحات الثابتة
 * @param app تطبيق Express
 * @param prefix بادئة المسار
 */
export async function registerPagesRoutes(app: Express, prefix: string) {
  // الحصول على قائمة الصفحات
  app.get(`${prefix}/pages`, async (req: Request, res: Response) => {
    try {
      console.log("API: استلام طلب للصفحات");
      
      // معلمات الاستعلام
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const showUnpublished = req.query.unpublished === 'true' ? true : false;
      
      // بناء الاستعلام الأساسي
      let query = db.select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        metaTitle: pages.metaTitle,
        metaDescription: pages.metaDescription,
        imageUrl: pages.imageUrl,
        isPublished: pages.isPublished,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
        // نقوم بتحديد جزء صغير من المحتوى كمقتطف
        excerpt: sql<string>`SUBSTRING(${pages.content}, 1, 200)`
      }).from(pages);
      
      // إضافة فلتر الحالة
      if (!showUnpublished) {
        query = query.where(eq(pages.isPublished, true));
      }
      
      // تنفيذ استعلام الإحصاء
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pages)
        .where(showUnpublished ? sql`1=1` : eq(pages.isPublished, true));
      
      // تنفيذ الاستعلام
      const items = await query
        .orderBy(desc(pages.updatedAt))
        .limit(limit)
        .offset(offset);
      
      console.log(`API Pages: تم العثور على ${items.length} صفحة`);
      
      // إعداد الاستجابة
      const totalItems = Number(count);
      const totalPages = Math.ceil(totalItems / limit);
      
      // إرجاع البيانات
      return res.status(200).json({
        items,
        meta: {
          totalItems,
          itemsPerPage: limit,
          currentPage: page,
          totalPages
        }
      });
    } catch (error) {
      console.error("خطأ في تحميل الصفحات:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء تحميل الصفحات. يرجى المحاولة مرة أخرى لاحقاً." });
    }
  });
  
  // الحصول على صفحة محددة بواسطة الـ slug
  app.get(`${prefix}/pages/:slug`, async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      console.log(`API: استلام طلب للصفحة - ${slug}`);
      
      // الحصول على بيانات الصفحة من قاعدة البيانات
      const page = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
      
      // إذا لم يتم العثور على الصفحة
      if (!page || page.length === 0) {
        console.log(`الصفحة غير موجودة: ${slug}`);
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      const pageData = page[0];
      
      // إذا كانت الصفحة غير منشورة وليست في وضع المعاينة
      if (!pageData.isPublished && req.query.preview !== 'true') {
        console.log(`محاولة الوصول إلى صفحة غير منشورة: ${slug}`);
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      console.log(`API Pages: تم تحميل الصفحة ${slug} بنجاح`);
      
      // إرجاع بيانات الصفحة
      return res.status(200).json(pageData);
    } catch (error) {
      console.error("خطأ في تحميل الصفحة:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى لاحقاً." });
    }
  });
}