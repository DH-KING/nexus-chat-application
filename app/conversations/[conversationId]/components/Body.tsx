'use client';

import { useEffect, useRef, useState } from 'react';
import { find } from 'lodash';
import { useSession } from 'next-auth/react'; // <-- الخطوة 1: استيراد useSession

import { FullMessageType } from '@/app/types';
import useConversation from '@/app/hooks/useConversation';
import { pusherClient } from '@/app/libs/pusher';
import MessageBox from './MessageBox';
import axios from 'axios';

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const { conversationId } = useConversation();
  
  // --- هذا هو الجزء الأهم ---
  // الخطوة 2: الحصول على حالة الجلسة (status) بالإضافة إلى البيانات
  const { status } = useSession();

  // ... (بقية الكود يبقى كما هو)

  // الاستماع لأحداث Pusher
  useEffect(() => {
    // --- الخطوة 3: الشرط الجديد والأكثر قوة ---
    // لا تقم بتشغيل أي شيء إلا إذا كانت حالة المصادقة "authenticated"
    if (status !== 'authenticated') {
      return; // اخرج من الدالة فورًا وانتظر
    }

    // الآن نحن متأكدون من أن المستخدم مسجل دخوله
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    // دالة التنظيف
    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
    // --- الخطوة 4: إضافة status إلى مصفوفة الاعتماديات ---
  }, [conversationId, status]); // سيتم تشغيل هذا الكود فقط عندما تتغير "status"

  // ... (بقية الكود يبقى كما هو)

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
};

export default Body;
