import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { pusherServer } from '@/app/libs/pusher';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  // 1. الحصول على الجلسة
  const session = await getServerSession(authOptions);

  // 2. التحقق من وجود مستخدم
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // --- هذا هو الجزء الذي تم إصلاحه ---
  // 3. قراءة جسم الطلب مرة واحدة فقط وتخزينه في متغير
  const body = await request.formData();
  
  // 4. استخدام المتغير للحصول على البيانات المطلوبة
  const socketId = body.get('socket_id') as string;
  const channel = body.get('channel_name') as string;

  // 5. إنشاء بيانات المصادقة لـ Pusher
  const data = {
    user_id: session.user.email,
  };

  // 6. توقيع الطلب وإرسال الرد
  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
  
  return NextResponse.json(authResponse);
}
