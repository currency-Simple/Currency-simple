// ============================================
// ⚙️ SUPABASE CONFIGURATION
// ============================================
// هذا الملف يحتوي على إعداد Supabase الأساسي
// يجب استيراده في جميع الملفات التي تحتاج الاتصال بالسحابة

// 🔑 مفاتيح Supabase
const SUPABASE_URL = 'https://byxbwljcwevywrgjuvkn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zWY6EAOczT_nhiscFxqHQA_hboO8gpf';

// 📦 إنشاء عميل Supabase واحد للاستخدام العام
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
  }

  // 🔐 المصادقة
  get auth() {
    return {
      // تسجيل مستخدم جديد
      signUp: async ({ email, password, options = {} }) => {
        try {
          const response = await fetch(`${this.url}/auth/v1/signup`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ email, password, data: options.data })
          });
          const data = await response.json();
          return response.ok 
            ? { data, error: null } 
            : { data: null, error: data };
        } catch (error) {
          return { data: null, error };
        }
      },

      // تسجيل الدخول
      signInWithPassword: async ({ email, password }) => {
        try {
          const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          if (response.ok && data.access_token) {
            localStorage.setItem('supabase_token', data.access_token);
            localStorage.setItem('supabase_user', JSON.stringify(data.user));
          }
          return response.ok 
            ? { data, error: null } 
            : { data: null, error: data };
        } catch (error) {
          return { data: null, error };
        }
      },

      // تسجيل الخروج
      signOut: async () => {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_user');
        return { error: null };
      },

      // الحصول على المستخدم الحالي
      getUser: async () => {
        const token = localStorage.getItem('supabase_token');
        if (!token) return { data: { user: null }, error: null };
        
        const user = JSON.parse(localStorage.getItem('supabase_user') || 'null');
        return { data: { user }, error: null };
      },

      // الحصول على الجلسة
      getSession: async () => {
        const token = localStorage.getItem('supabase_token');
        if (!token) return { data: { session: null }, error: null };
        
        return { 
          data: { 
            session: { 
              access_token: token,
              user: JSON.parse(localStorage.getItem('supabase_user') || 'null')
            }
          }, 
          error: null 
        };
      }
    };
  }

  // 📊 قاعدة البيانات
  from(table) {
    return new TableQuery(this.url, this.headers, table);
  }

  // 📁 التخزين
  get storage() {
    return {
      from: (bucket) => ({
        upload: async (path, file, options = {}) => {
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            const response = await fetch(
              `${this.url}/storage/v1/object/${bucket}/${path}`,
              {
                method: 'POST',
                headers: {
                  'apikey': this.key,
                  'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
                },
                body: formData
              }
            );
            const data = await response.json();
            return response.ok 
              ? { data, error: null } 
              : { data: null, error: data };
          } catch (error) {
            return { data: null, error };
          }
        },

        getPublicUrl: (path) => ({
          data: { publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}` }
        })
      })
    };
  }
}

// 🔧 استعلامات الجداول
class TableQuery {
  constructor(url, headers, table) {
    this.url = url;
    this.headers = headers;
    this.table = table;
    this.query = '';
  }

  select(columns = '*') {
    this.query = `select=${columns}`;
    return this;
  }

  insert(data) {
    return this._execute('POST', data);
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  upsert(data) {
    return this._execute('POST', data, { headers: { ...this.headers, 'Prefer': 'resolution=merge-duplicates' } });
  }

  delete() {
    return this;
  }

  eq(column, value) {
    this.query += `&${column}=eq.${value}`;
    return this;
  }

  neq(column, value) {
    this.query += `&${column}=neq.${value}`;
    return this;
  }

  gt(column, value) {
    this.query += `&${column}=gt.${value}`;
    return this;
  }

  gte(column, value) {
    this.query += `&${column}=gte.${value}`;
    return this;
  }

  lt(column, value) {
    this.query += `&${column}=lt.${value}`;
    return this;
  }

  lte(column, value) {
    this.query += `&${column}=lte.${value}`;
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.query += `&order=${column}.${ascending ? 'asc' : 'desc'}`;
    return this;
  }

  limit(count) {
    this.query += `&limit=${count}`;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async _execute(method = 'GET', body = null, options = {}) {
    const token = localStorage.getItem('supabase_token');
    const headers = {
      ...this.headers,
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(
        `${this.url}/rest/v1/${this.table}?${this.query}`,
        {
          method,
          headers,
          body: body ? JSON.stringify(body) : null
        }
      );

      let data = await response.json();
      
      if (this.isSingle && Array.isArray(data)) {
        data = data[0] || null;
      }

      return response.ok 
        ? { data, error: null } 
        : { data: null, error: data };
    } catch (error) {
      return { data: null, error };
    }
  }

  // تحويل Promise
  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  catch(reject) {
    return this._execute().catch(reject);
  }
}

// 🎯 تصدير العميل الوحيد
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔑 تصدير المفاتيح للاستخدام المباشر إذا لزم الأمر
export const config = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY
};

// ✅ استخدام مثالي:
// import { supabase } from './supabase-config.js';
// const { data, error } = await supabase.from('profiles').select('*');
