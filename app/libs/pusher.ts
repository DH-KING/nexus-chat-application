import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// الكود الصحيح مع كتابة الـ cluster بشكل مباشر
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: 'us2', // القيمة مكتوبة بشكل مباشر
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    channelAuthorization: {
      endpoint: '/api/pusher/auth',
      transport: 'ajax',
    },
    cluster: 'us2', // القيمة مكتوبة بشكل مباشر
  }
);
