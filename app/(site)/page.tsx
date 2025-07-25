import AuthForm from './components/AuthForm';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col-reverse lg:flex-row min-h-screen">
      {/* Left Column (CTA) */}
      <div
        className="lg:w-1/2 p-10"
        style={{ background: 'linear-gradient(45deg, #00BFFF, #0099CC)' }}
      >
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-4xl font-bold mb-2 text-center text-white">
            Welcome to DH Messages!
          </h1>
          <p className="text-lg my-6 mx-auto text-center text-white">
            Your Real-Time Chat Application
          </p>
          <p className="text-sm opacity-90 mx-auto text-center text-white">
            Developed by Haider Al-Saadi.
          </p>
          {/* --- تم إصلاح الخطأ هنا --- */}
          <a
            href="https://github.com/DH-KING"
            // تم تغيير علامات الاقتباس لحل المشكلة
            title="Developer's GitHub"
            className="mt-8 bg-gray-800 hover:bg-cyan-700 text-white py-2 px-8 rounded-full font-semibold shadow-md transition duration-300 ease-in-out w-auto max-w-lg mx-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developer&apos;s GitHub
          </a>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="lg:w-1/2 bg-gray-100 p-10">
        <div className="sm:mx-auto flex flex-col justify-center h-full sm:w-full sm:max-w-md">
          <Image
            alt="logo"
            className="mx-auto w-auto"
            height={64}
            width={64}
            src="/images/logo.png"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 tracking-tight">
            Join DH Messages Today!
          </h2>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
