import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  Bot,
  User,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Globe,
  RefreshCw,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

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

const statusOptions = [
  { value: 'open', label: 'Open', icon: AlertCircle, color: 'bg-success/10 text-success' },
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-warning/10 text-warning' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-info/10 text-info' },
  { value: 'closed', label: 'Closed', icon: Pause, color: 'bg-muted text-muted-foreground' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const ChatManagement: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [newChatCustomerName, setNewChatCustomerName] = useState('');
  const [newChatCustomerEmail, setNewChatCustomerEmail] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, statusFilter]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Parse messages JSON if it's stored as string
      const parsedSessions = (data || []).map(session => ({
        ...session,
        messages: typeof session.messages === 'string' 
          ? JSON.parse(session.messages) 
          : session.messages
      }));

      setSessions(parsedSessions);
    } catch (error: any) {
      console.error('Error loading chat sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let result = [...sessions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.session_id.toLowerCase().includes(query) ||
          s.customer_name.toLowerCase().includes(query) ||
          (s.customer_email && s.customer_email.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort by most recent
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredSessions(result);
  };

  const handleSelectSession = async (session: ChatSession) => {
    // Mark as read if there are unread messages
    if (session.unread_count > 0) {
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .update({ 
            unread_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (error) throw error;

        // Update local state
        const updatedSessions = sessions.map((s) => {
          if (s.id === session.id) {
            return { ...s, unread_count: 0 };
          }
          return s;
        });
        setSessions(updatedSessions);
        setSelectedSession({ ...session, unread_count: 0 });
      } catch (error: any) {
        toast.error('Failed to update unread count');
      }
    } else {
      setSelectedSession(session);
    }
    setSelectedLanguage(session.language);
  };

  const handleStatusChange = async (newStatus: ChatSession['status']) => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSession.id);

      if (error) throw error;

      // Update local state
      const updatedSessions = sessions.map((s) => {
        if (s.id === selectedSession.id) {
          return { ...s, status: newStatus, updated_at: new Date().toISOString() };
        }
        return s;
      });

      setSessions(updatedSessions);
      setSelectedSession({ ...selectedSession, status: newStatus });
      toast.success(`Chat status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error('Failed to update chat status');
    }
  };

  const handleToggleBotMode = async () => {
    if (!selectedSession) return;

    const newBotMode = !selectedSession.is_bot;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          is_bot: newBotMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSession.id);

      if (error) throw error;

      // Update local state
      const updatedSessions = sessions.map((s) => {
        if (s.id === selectedSession.id) {
          return { ...s, is_bot: newBotMode };
        }
        return s;
      });

      setSessions(updatedSessions);
      setSelectedSession({ ...selectedSession, is_bot: newBotMode });
      toast.success(newBotMode ? 'Switched to Bot mode' : 'Switched to Human Agent mode');
    } catch (error: any) {
      toast.error('Failed to switch mode');
    }
  };

  const handleSendReply = async () => {
    if (!selectedSession || !replyMessage.trim()) return;

    setIsSending(true);
    setIsTyping(true);

    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: replyMessage,
        isBot: false,
        isAgent: true,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...selectedSession.messages, newMessage];
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          status: selectedSession.status === 'pending' ? 'open' : selectedSession.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSession.id);

      if (error) throw error;

      // Update local state
      const updatedSessions = sessions.map((s) => {
        if (s.id === selectedSession.id) {
          return {
            ...s,
            messages: updatedMessages,
            updated_at: new Date().toISOString(),
            status: s.status === 'pending' ? 'open' : s.status,
          };
        }
        return s;
      });

      setSessions(updatedSessions);
      setSelectedSession({
        ...selectedSession,
        messages: updatedMessages,
      });

      setReplyMessage('');
      toast.success('Message sent');
    } catch (error: any) {
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Update local state
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      
      toast.success('Chat session deleted');
    } catch (error: any) {
      toast.error('Failed to delete chat session');
    }
  };

  const handleCreateNewChat = async () => {
    if (!newChatCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    try {
      const sessionId = `CHAT-${Date.now()}`;
      const newSession: Omit<ChatSession, 'id'> = {
        session_id: sessionId,
        customer_name: newChatCustomerName,
        customer_email: newChatCustomerEmail || undefined,
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

      // Add the new session to local state
      setSessions([data, ...sessions]);
      setSelectedSession(data);
      setNewChatCustomerName('');
      setNewChatCustomerEmail('');
      setIsNewChatDialogOpen(false);
      toast.success('New chat session created');
    } catch (error: any) {
      toast.error('Failed to create chat session');
    }
  };

  const getTotalUnread = () => {
    return sessions.reduce((acc, s) => acc + s.unread_count, 0);
  };

  const getStatusBadge = (status: ChatSession['status']) => {
    const option = statusOptions.find((s) => s.value === status);
    if (!option) return null;
    return (
      <Badge variant="outline" className={cn('text-xs', option.color)}>
        {option.label}
      </Badge>
    );
  };

  const getLanguageFlag = (code: string) => {
    return languages.find((l) => l.code === code)?.flag || '🌐';
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-280px)] min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px] flex gap-4">
      {/* Sessions List */}
      <div className="w-80 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent" />
              Conversations
              {getTotalUnread() > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {getTotalUnread()}
                </Badge>
              )}
            </h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={loadSessions} className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Chat Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Name *</label>
                      <Input
                        value={newChatCustomerName}
                        onChange={(e) => setNewChatCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Email</label>
                      <Input
                        type="email"
                        value={newChatCustomerEmail}
                        onChange={(e) => setNewChatCustomerEmail(e.target.value)}
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewChatDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNewChat} className="btn-gradient-accent">
                        Create Chat
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="p-2 border-b border-border">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chats</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors group',
                  selectedSession?.id === session.id && 'bg-accent/10'
                )}
                onClick={() => handleSelectSession(session)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {session.is_bot ? (
                        <Bot className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 text-sm">
                      {getLanguageFlag(session.language)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {session.customer_name}
                      </span>
                      <div className="flex items-center gap-1">
                        {session.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {session.unread_count}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.messages[session.messages.length - 1]?.content || 'No messages'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      {getStatusBadge(session.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{selectedSession.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSession.customer_email || selectedSession.session_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[140px] h-9">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          {lang.flag} {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bot/Human Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleBotMode}
                  className={cn(
                    'gap-2',
                    selectedSession.is_bot ? 'border-accent text-accent' : ''
                  )}
                >
                  {selectedSession.is_bot ? (
                    <>
                      <Bot className="h-4 w-4" />
                      Bot
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Agent
                    </>
                  )}
                </Button>

                {/* Status Selector */}
                <Select value={selectedSession.status} onValueChange={(v) => handleStatusChange(v as ChatSession['status'])}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedSession.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground/70">Start the conversation</p>
                  </div>
                </div>
              ) : (
                selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      message.isBot || message.isAgent ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!message.isBot && !message.isAgent && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="max-w-[70%] space-y-1">
                      <div
                        className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm',
                          message.isBot
                            ? 'bg-info/10 text-foreground rounded-tr-sm'
                            : message.isAgent
                            ? 'bg-accent text-accent-foreground rounded-tr-sm'
                            : 'bg-muted rounded-tl-sm'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p
                        className={cn(
                          'text-xs text-muted-foreground',
                          message.isBot || message.isAgent ? 'text-right' : 'text-left'
                        )}
                      >
                        {format(new Date(message.timestamp), 'HH:mm')}
                        {message.isAgent && ' • Movemate Support'}
                        {message.isBot && ' • Bot'}
                      </p>
                    </div>
                    {(message.isBot || message.isAgent) && (
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        message.isBot ? 'bg-info/10' : 'bg-accent'
                      )}>
                        {message.isBot ? (
                          <Bot className="h-4 w-4 text-info" />
                        ) : (
                          <User className="h-4 w-4 text-accent-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex justify-end gap-2">
                  <div className="px-4 py-3 bg-accent/10 rounded-2xl rounded-tr-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" />
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isSending}
                  className="btn-gradient-accent self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Select a conversation
              </p>
              <p className="text-sm text-muted-foreground/70">
                Choose a chat from the list to start replying
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;