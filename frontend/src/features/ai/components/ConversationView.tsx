'use client';

import React, { useRef, useEffect } from 'react';
import { useAiStore } from '../store/useAiStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export const ConversationView: React.FC = () => {
  const { conversation, isLoading } = useAiStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isLoading]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[350px] max-h-[500px] scrollbar-thin"
      role="log"
      aria-live="polite"
      aria-label="AI Conversation stream"
    >
      {conversation.messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
};
