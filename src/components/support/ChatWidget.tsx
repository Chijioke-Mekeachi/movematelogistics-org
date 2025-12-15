import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, MinusCircle, Bot, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  isAgent: boolean;
  timestamp: string;
}

interface ChatSession {
  id: string;
  session_id: string;
  customer_name: string;
  customer_email?: string;
  language: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  is_bot: boolean;
  unread_count: number;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Local storage key for user session ID
const USER_SESSION_KEY = 'movemate_chat_session';

// Generate a unique session ID for the user
const generateSessionId = () => {
  return `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create user session ID
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem(USER_SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(USER_SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Get user info (if available)
const getUserInfo = () => {
  if (typeof window === 'undefined') return { name: 'Customer', email: '' };
  
  // Try to get from localStorage
  const storedName = localStorage.getItem('movemate_user_name') || 'Customer';
  const storedEmail = localStorage.getItem('movemate_user_email') || '';
  
  return { name: storedName, email: storedEmail };
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const sessionId = getOrCreateSessionId();
      setSessionId(sessionId);
      
      // Try to load existing session
      await loadOrCreateSession(sessionId);
    };
    
    initSession();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!currentSession?.id || !isOpen) return;

    // Subscribe to session updates
    subscriptionRef.current = supabase
      .channel(`chat-session-${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_sessions',
          filter: `id=eq.${currentSession.id}`,
        },
        async (payload) => {
          const updatedSession = payload.new as ChatSession;
          const updatedMessages = typeof updatedSession.messages === 'string' 
            ? JSON.parse(updatedSession.messages) 
            : updatedSession.messages;
          
          setCurrentSession(updatedSession);
          setMessages(updatedMessages);
          
          // If there's a new message from an agent, play notification sound
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage?.isAgent && !lastMessage.isBot) {
            playNotificationSound();
            showDesktopNotification('New message from support');
          }
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentSession?.id, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && currentSession) {
      // If no messages, send a greeting
      sendInitialGreeting();
    }
  }, [isOpen, currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadOrCreateSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      // Try to find existing session
      const { data: existingSessions, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingSessions && existingSessions.length > 0) {
        // Load existing session
        const session = existingSessions[0];
        const sessionMessages = typeof session.messages === 'string' 
          ? JSON.parse(session.messages) 
          : session.messages;
        
        setCurrentSession(session);
        setMessages(sessionMessages);
      } else {
        // Create new session
        const userInfo = getUserInfo();
        const newSession: Omit<ChatSession, 'id'> = {
          session_id: sessionId,
          customer_name: userInfo.name,
          customer_email: userInfo.email || undefined,
          language: 'en',
          status: 'open',
          is_bot: false,
          unread_count: 0,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([newSession])
          .select()
          .single();

        if (error) throw error;

        setCurrentSession(data);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error loading chat session:', error);
      toast.error('Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendInitialGreeting = async () => {
    if (!currentSession) return;

    try {
      const greetingMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Hello! I'm your Movemate support assistant. How can I help you today?",
        isBot: false,
        isAgent: true,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [greetingMessage];
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setMessages(updatedMessages);
    } catch (error: any) {
      console.error('Error sending greeting:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail if audio can't play
      });
    } catch (error) {
      // Silent fail
    }
  };

  const showDesktopNotification = (message: string) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification("Movemate Support", {
        body: message,
        icon: "/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Movemate Support", {
            body: message,
            icon: "/favicon.ico",
          });
        }
      });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !currentSession) return;

    setIsTyping(true);

    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        isBot: false,
        isAgent: false,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          status: 'open',
          unread_count: currentSession.unread_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setMessages(updatedMessages);
      setInputValue('');
      
      // Send auto-reply if no admin response within 30 seconds
      setTimeout(async () => {
        if (currentSession && !currentSession.is_bot) {
          const { data: latestSession } = await supabase
            .from('chat_sessions')
            .select('messages, is_bot')
            .eq('id', currentSession.id)
            .single();

          if (latestSession && !latestSession.is_bot) {
            const autoReply: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: "Thank you for your message. Our support team will respond shortly. In the meantime, you might find answers in our FAQ section.",
              isBot: false,
              isAgent: true,
              timestamp: new Date().toISOString(),
            };

            const updatedMessagesWithReply = [...updatedMessages, autoReply];
            
            await supabase
              .from('chat_sessions')
              .update({ 
                messages: updatedMessagesWithReply,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentSession.id);
          }
        }
      }, 30000); // 30 seconds
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleRefreshSession = async () => {
    if (sessionId) {
      await loadOrCreateSession(sessionId);
      toast.success('Chat refreshed');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickReplies = [
    "Where is my package?",
    "How do I track my shipment?",
    "I need to update my delivery address",
    "My package is delayed",
    "Talk to a human agent"
  ];

  const getAgentStatus = () => {
    if (!currentSession) return 'Connecting...';
    
    if (currentSession.is_bot) {
      return 'Bot • Typically replies instantly';
    }
    
    // Check if there are any agent messages in the last 5 minutes
    const recentAgentMessage = messages
      .filter(m => m.isAgent && !m.isBot)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (recentAgentMessage) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const lastMessageTime = new Date(recentAgentMessage.timestamp);
      
      if (lastMessageTime > fiveMinutesAgo) {
        return 'Online • Support team active';
      }
    }
    
    return 'Support team will reply soon';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-accent text-accent-foreground",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110",
          "animate-bounce-subtle"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {isOnline && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-[380px] max-w-[calc(100vw-3rem)]",
        "bg-card border border-border rounded-2xl shadow-xl",
        "flex flex-col overflow-hidden",
        "animate-scale-in",
        isMinimized ? "h-16" : "h-[500px] max-h-[calc(100vh-6rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8" />
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-accent",
              isOnline ? "bg-success" : "bg-muted"
            )} />
          </div>
          <div>
            <p className="font-semibold text-sm">Movemate Support</p>
            <p className="text-xs opacity-80">
              {getAgentStatus()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
              onClick={handleRefreshSession}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <MinusCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Loading chat...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Start a conversation</p>
                  <p className="text-sm text-muted-foreground/70">Ask us anything about your shipments!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.isAgent ? "justify-start" : "justify-end"
                    )}
                  >
                    {message.isAgent && (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        message.isBot ? "bg-info/10" : "bg-accent"
                      )}>
                        {message.isBot ? (
                          <Bot className="h-4 w-4 text-info" />
                        ) : (
                          <User className="h-4 w-4 text-accent-foreground" />
                        )}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] space-y-2"
                    )}>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm",
                        message.isAgent
                          ? "bg-muted rounded-tl-sm"
                          : "bg-accent text-accent-foreground rounded-tr-sm"
                      )}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 text-xs text-muted-foreground",
                        message.isAgent ? "justify-start" : "justify-end"
                      )}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.isAgent && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted">
                            {message.isBot ? 'Bot' : 'Support'}
                          </span>
                        )}
                      </div>
                    </div>
                    {!message.isAgent && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="px-4 py-3 bg-accent/10 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" />
                        <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                        <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick replies for empty chat */}
                {messages.length <= 1 && !isTyping && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading || !currentSession}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="shrink-0 btn-gradient-accent"
                disabled={!inputValue.trim() || isLoading || !currentSession}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your chat is saved and will be attended by our support team
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;