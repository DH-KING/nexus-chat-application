'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

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
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      axios.post(`/api/conversations/${conversationId}/seen`);
    }
  }, [conversationId, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !conversationId) {
      return;
    }

    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);

      // --- هذا هو الجزء الذي تم تبسيطه ---
      // نستخدم دالة تحديث بسيطة بدون lodash
      setMessages((currentMessages) => {
        // نتحقق يدويًا إذا كانت الرسالة موجودة بالفعل
        const isMessageAlreadyPresent = currentMessages.some(
          (existingMessage) => existingMessage.id === message.id
        );

        if (isMessageAlreadyPresent) {
          return currentMessages; // إذا كانت موجودة، لا تفعل شيئًا
        }

        // إذا لم تكن موجودة، أضفها إلى القائمة
        return [...currentMessages, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) => {
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
  }, [conversationId, status]);

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
