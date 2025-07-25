import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ToasterContext from './context/ToasterContext';
import AuthContextProvider from './context/AuthContext';
import ActiveStatus from './components/ActiveStatus';

const inter = Inter({ subsets: ['latin'] });

// --- تم تعديل كل البيانات الوصفية هنا ---
export const metadata: Metadata = {
  // 1. تغيير العنوان الرئيسي الذي يظهر في تبويب المتصفح
  title: 'DH Messages',

  // 2. تغيير الوصف الذي يظهر في محركات البحث ونافذة تثبيت التطبيق
  description: 'The official real-time chat application by Haider Al-Saadi.',

  // 3. إضافة اسمك كمؤلف/مطور
  authors: [{ name: 'Haider Al-Saadi' }],

  // 4. إضافة كلمات مفتاحية لتحسين البحث
  keywords: ['DH Messages', 'chat', 'real-time', 'messenger', 'Haider Al-Saadi'],

  // 5. تغيير حساب تويتر (يمكنك وضع حسابك الحقيقي هنا)
  twitter: {
    card: 'summary_large_image',
    creator: '@DH_KING_Dev', // <-- مثال، يمكنك تغييره
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ToasterContext />
          <ActiveStatus />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
