import { create } from 'zustand';
import {
  AIConversation,
  AIMessage,
  AIContext,
  AIMode,
  AIExplanationRequest
} from '../types/ai';
import { AIService } from '../services/aiService';

const STORAGE_KEY = 'ablenova_ai_conversation_state';

interface AiStoreState {
  conversation: AIConversation;
  activeContext?: AIContext;
  isLoading: boolean;
  isSpeaking: boolean;
  speakingMessageId?: string;
  isClearModalOpen: boolean;
  isAssistantDrawerOpen: boolean;

  // Actions
  setContext: (context?: AIContext) => void;
  sendMessage: (query: string, mode?: AIMode) => Promise<void>;
  clearConversation: () => void;
  toggleSpeech: (messageId: string, text: string) => void;
  stopSpeech: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  setClearModalOpen: (isOpen: boolean) => void;
  initializeStore: () => void;
}

export const useAiStore = create<AiStoreState>((set, get) => ({
  conversation: AIService.getInitialConversation(),
  activeContext: undefined,
  isLoading: false,
  isSpeaking: false,
  speakingMessageId: undefined,
  isClearModalOpen: false,
  isAssistantDrawerOpen: false,

  initializeStore: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.conversation) {
          set({
            conversation: parsed.conversation,
            activeContext: parsed.activeContext
          });
        }
      }
    } catch (err) {
      console.error('Failed to load AI store from localStorage:', err);
    }
  },

  setContext: (context) => {
    const state = get();
    // If context changed, update state and optionally add context welcome message
    const updatedContext = { ...state.activeContext, ...context };
    set({ activeContext: updatedContext });
  },

  sendMessage: async (query, mode = 'standard') => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const state = get();
    const userMessage: AIMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'student',
      content: trimmed,
      timestamp: 'Just now',
      mode,
      context: state.activeContext,
      status: 'sent'
    };

    // Update conversation with user message immediately
    const updatedMessages = [...state.conversation.messages, userMessage];
    const updatedConversation = {
      ...state.conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    set({
      conversation: updatedConversation,
      isLoading: true
    });

    try {
      const req: AIExplanationRequest = {
        question: trimmed,
        mode,
        context: state.activeContext
      };

      const response = await AIService.sendExplanationRequest(req);

      const aiMessage: AIMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: response.response,
        timestamp: 'Just now',
        mode: response.mode,
        codeSnippet: response.code_snippet,
        sourceIds: response.source_ids,
        context: state.activeContext,
        status: 'sent'
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedMessages, aiMessage],
        updatedAt: new Date().toISOString()
      };

      set({
        conversation: finalConversation,
        isLoading: false
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            conversation: finalConversation,
            activeContext: state.activeContext
          })
        );
      }
    } catch (err) {
      console.error('AI message failed:', err);

      const errorMessage: AIMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'ai',
        content: `I'm having a brief trouble connecting. Please tap "Try Again" to retry!`,
        timestamp: 'Just now',
        status: 'failed'
      };

      set({
        conversation: {
          ...updatedConversation,
          messages: [...updatedMessages, errorMessage]
        },
        isLoading: false
      });
    }
  },

  clearConversation: () => {
    get().stopSpeech();
    const fresh = AIService.getInitialConversation(get().activeContext);
    set({
      conversation: fresh,
      isClearModalOpen: false
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  toggleSpeech: (messageId, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const state = get();
    if (state.isSpeaking && state.speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      set({ isSpeaking: false, speakingMessageId: undefined });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => set({ isSpeaking: false, speakingMessageId: undefined });
    utterance.onerror = () => set({ isSpeaking: false, speakingMessageId: undefined });

    set({ isSpeaking: true, speakingMessageId: messageId });
    window.speechSynthesis.speak(utterance);
  },

  stopSpeech: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    set({ isSpeaking: false, speakingMessageId: undefined });
  },

  setDrawerOpen: (isOpen) => set({ isAssistantDrawerOpen: isOpen }),
  setClearModalOpen: (isOpen) => set({ isClearModalOpen: isOpen })
}));
