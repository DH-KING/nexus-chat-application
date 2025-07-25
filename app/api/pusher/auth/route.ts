import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { pusherServer } from '@/app/libs/pusher';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  // 1. الحصول على الجلسة باستخدام الطريقة القوية
  const session = await getServerSession(authOptions);

  // 2. التحقق من وجود مستخدم مسجل الدخول
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 3. الحصول على بيانات الطلب
  const socketId = (await request.formData()).get('socket_id') as string;
  const channel = (await request.formData()).get('channel_name') as string;

  // 4. إنشاء بيانات المصادقة
  const data = {
    user_id: session.user.email, // استخدام البريد الإلكتروني كمعرف للمستخدم
  };

  // 5. توقيع الطلب وإرسال الرد
  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
  return NextResponse.json(authResponse);
}
