# وثيقة مشروع IBEX (Integrated Business Exchange & Experience)

## 1. الرؤية العامة (Project Vision)
منصة سحابية (SaaS) متكاملة تهدف لربط المتاجر والمراكز الخدمية في اليمن بالعملاء عبر نظام "الهوية الموحدة". تتيح المنصة للعملاء الانضمام للمتاجر عبر QR Code، وإدارة أرصدة دفع مسبق أو حسابات دفع آجل (ديون) موثقة رقمياً، مع تكامل مباشر مع واتساب لإتمام الطلبات.

## 2. البنية التقنية (Tech Stack)
- **Framework:** Next.js 15 (App Router).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS + Shadcn UI.
- **Direction:** RTL (Right-to-Left).
- **Font:** IBM Plex Sans Arabic.
- **Database ORM:** Drizzle ORM.
- **Database Provider:** Neon PostgreSQL (Serverless).
- **Validation:** Zod.

## 3. مستويات الوصول (User Roles)
1. **Super Admin:** مدير المنصة العام (إدارة المتاجر والاشتراكات).
2. **Merchant (التاجر):** صاحب المتجر (إدارة المنتجات، التقارير، وسقوف الائتمان).
3. **Cashier (الكاشير):** موظف المتجر (تسجيل المبيعات، شحن الأرصدة، مسح QR العملاء عبر الجوال).
4. **Customer (العميل):** المستخدم النهائي (استعراض المتاجر، سجل العمليات، سلة واتساب).

## 4. المخطط المبدئي لقاعدة البيانات (Database Schema)

### الجداول الأساسية:
- **users:** `id, full_name, phone, password_hash, role (enum), created_at`
- **stores:** `id, name, slug, owner_id (FK), logo, description, whatsapp_number, created_at`
- **store_memberships:** (الرابط بين العميل والمتجر)
  `id, user_id (FK), store_id (FK), current_balance (Decimal), credit_limit (Decimal), status (active, blocked), joined_at`
- **products:** `id, store_id (FK), name, description, price (Decimal), image_url, is_available`
- **transactions:** `id, membership_id (FK), type (deposit, purchase, credit_payment), amount (Decimal), balance_after, note, created_at`

## 5. القواعد المالية والمنطقية (Business Logic)
- **الدقة المالية:** جميع الحقول المالية تستخدم النوع `Decimal(10, 2)` لضمان دقة الحسابات العشرية.
- **الهوية الرقمية:** يتم توليد QR Code فريد لكل متجر؛ عند مسحه من قبل العميل، يتم تفعيل العضوية في `store_memberships`.
- **سجل العمليات:** كل حركة مالية يجب أن تُسجل في جدول `transactions` وهي غير قابلة للتعديل (Immutable).

## 6. متطلبات الواجهة (UI/UX)
- **دعم كامل للغة العربية واتجاه RTL.**
- **استخدام مكونات Shadcn UI المخصصة بخط IBM Plex Sans Arabic.**
- **تجربة مستخدم سريعة (Mobile-first) لسهولة الاستخدام من قبل الكاشير والعميل عبر الجوال.**

