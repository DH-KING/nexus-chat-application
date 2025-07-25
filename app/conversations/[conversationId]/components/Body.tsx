'use client';

import { useEffect, useRef, useState } from 'react';
import { find } from 'lodash';
import { useSession } from 'next-auth/react'; // <-- 1. استيراد useSession

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
  const { data: session } = useSession(); // <-- 2. الحصول على بيانات الجلسة

  // ... (بقية الكود يبقى كما هو)

  // الاستماع لأحداث Pusher
  useEffect(() => {
    // --- 3. الشرط الجديد: لا تقم بتشغيل أي شيء إذا لم تكتمل المصادقة ---
    if (!session?.user?.email || !conversationId) {
      return;
    }

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

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
    // --- 4. إضافة session كـ dependency ---
  }, [conversationId, session?.user?.email]);

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
