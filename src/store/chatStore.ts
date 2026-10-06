import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isEmergencyMode?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Actions
  createSession: (firstMessageText?: string) => string;
  addMessage: (sessionId: string, message: Message) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setEmergencyMode: (sessionId: string, isEmergencyMode: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,

      createSession: (firstMessageText?: string) => {
        const id = Date.now().toString();
        
        // Generate a simple title based on the first message or use default
        let title = "New Chat";
        if (firstMessageText) {
          title = firstMessageText.length > 25 
            ? firstMessageText.substring(0, 25) + "..." 
            : firstMessageText;
        }

        const newSession: ChatSession = {
          id,
          title,
          messages: [
            {
              id: Date.now().toString() + "-ai",
              sender: "ai",
              text: "Hello! I'm your NavOk AI Health Assistant. How can I help you today? Please describe any symptoms you are experiencing.",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }));
        
        return id;
      },

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === sessionId) {
              // If this is the user's first message, update the title
              let updatedTitle = session.title;
              if (session.messages.length === 1 && message.sender === 'user' && session.title === "New Chat") {
                updatedTitle = message.text.length > 25 
                  ? message.text.substring(0, 25) + "..." 
                  : message.text;
              }

              return {
                ...session,
                title: updatedTitle,
                messages: [...session.messages, message],
                updatedAt: Date.now(),
              };
            }
            return session;
          }),
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          // If we deleted the active session, set current to null
          const newCurrentId = state.currentSessionId === sessionId ? null : state.currentSessionId;
          
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
          };
        });
      },

      setCurrentSessionId: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((session) => 
            session.id === sessionId ? { ...session, title } : session
          ),
        }));
      },
      
      setEmergencyMode: (sessionId, isEmergencyMode) => {
        set((state) => ({
          sessions: state.sessions.map((session) => 
            session.id === sessionId ? { ...session, isEmergencyMode } : session
          ),
        }));
      },
    }),
    {
      name: 'navok-chat-storage', // Key for localStorage
    }
  )
);
