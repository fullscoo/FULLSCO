/**
 * وحدة مساعدة للاتصال مع خادم Express API
 * تستخدم هذه الوحدة لتوحيد جميع طلبات API والتأكد من توجيهها إلى خادم Express
 */

import { debug } from './utils';

// الإعدادات الافتراضية
const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // عندما نكون في المتصفح، استخدم المسار النسبي 
  : process.env.API_BASE_URL || 'http://localhost:5000'; // على الخادم، استخدم عنوان URL كامل

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * وظيفة موحدة لجلب البيانات من Express API
 * 
 * @param endpoint - مسار النقطة النهائية للـ API (بدون '/api' في البداية)
 * @param options - خيارات اختيارية للطلب (مثل method, headers, body)
 * @returns وعد يرجع الاستجابة من API
 */
export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // بناء عنوان URL مع معلمات الاستعلام إذا كانت موجودة
  let url = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // إضافة معلمات الاستعلام إذا كانت موجودة
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  // تكوين إعدادات الطلب
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // إرسال ملفات تعريف الارتباط للمصادقة
    ...options,
  };
  
  // تحويل البيانات إلى JSON إذا كانت موجودة ولم يتم توفير body
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    debug('API Request', { url, options: fetchOptions });
    
    // إرسال الطلب
    const response = await fetch(url, fetchOptions);
    
    // التحقق من نجاح الاستجابة
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API error: ${response.status} ${response.statusText}`
      );
    }
    
    // التحقق من نوع المحتوى والحصول على البيانات
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as unknown as T;
    }
    
  } catch (error) {
    debug('API Error', error);
    throw error;
  }
}

/**
 * وظيفة مختصرة لطلبات GET
 */
export function apiGet<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, { params });
}

/**
 * وظيفة مختصرة لطلبات POST
 */
export function apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'POST', body: data });
}

/**
 * وظيفة مختصرة لطلبات PUT
 */
export function apiPut<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PUT', body: data });
}

/**
 * وظيفة مختصرة لطلبات PATCH
 */
export function apiPatch<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PATCH', body: data });
}

/**
 * وظيفة مختصرة لطلبات DELETE
 */
export function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE' });
}

/**
 * وظيفة لرفع الملفات إلى API
 */
export function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // السماح لـ fetch بتعيين Content-Type تلقائيًا مع حدود متعددة الأجزاء
  });
}