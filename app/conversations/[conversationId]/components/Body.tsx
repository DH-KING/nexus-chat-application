'use client';

import { useEffect, useRef, useState } from 'react';
import { find } from 'lodash';

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

  // 1. التأكد من أن المستخدم رأى الرسائل عند فتح المحادثة
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // 2. الاستماع لأحداث Pusher
  useEffect(() => {
    // التأكد من وجود conversationId قبل الاشتراك
    if (!conversationId) {
      return;
    }

    // الاشتراك في قناة المحادثة
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    // معالج الرسائل الجديدة
    const messageHandler = (message: FullMessageType) => {
      // طباعة في المتصفح للتأكد من وصول الإشعار
      console.log('PUSHER: New message received!', message);
      
      // إرسال طلب لتحديث حالة "تمت القراءة"
      axios.post(`/api/conversations/${conversationId}/seen`);

      // تحديث قائمة الرسائل (بطريقة آمنة)
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    // معالج تحديث الرسائل (مثلاً، تحديث حالة "تمت القراءة")
    const updateMessageHandler = (newMessage: FullMessageType) => {
      // طباعة في المتصفح للتأكد من وصول التحديث
      console.log('PUSHER: Message update received!', newMessage);

      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
        })
      );
    };

    // ربط المعالجات بالأحداث
    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    // دالة التنظيف عند مغادرة الصفحة
    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [conversationId]);

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
