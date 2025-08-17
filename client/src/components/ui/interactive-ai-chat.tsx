import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { 
  Send, 
  Brain, 
  User, 
  Bot,
  Lightbulb,
  TrendingUp,
  Target,
  MessageCircle,
  Zap
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any; // For structured data like charts or recommendations
}

interface InteractiveAIChatProps {
  currentTdeeAnalysis: any;
  userProgress: {
    totalDays: number;
    weightEntries: any[];
    calorieEntries: any[];
    activityEntries: any[];
  };
}

export function InteractiveAIChat({ currentTdeeAnalysis, userProgress }: InteractiveAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Hei! I'm your personal AI coach specialized in hardgainer weight gain. I have access to your tracking data and can provide personalized advice. What would you like to know about your progress or nutrition?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Quick action suggestions
  const quickActions = [
    { text: "Analyze my weight progress", icon: TrendingUp },
    { text: "Why am I not gaining weight?", icon: Target },
    { text: "Meal suggestions for today", icon: Lightbulb },
    { text: "Is my calorie intake enough?", icon: Zap },
  ];

  const getPersonalizedResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id || '974acc79-f202-4202-bdab-80c4ef55f534',
          userData: {
            totalDays: userProgress.totalDays,
            weightEntries: userProgress.weightEntries,
            calorieEntries: userProgress.calorieEntries,
            currentTdee: currentTdeeAnalysis?.tdee,
            targetCalories: (currentTdeeAnalysis?.tdee || 2000) + 1100
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI chat error:', error);
      return "I'm having trouble processing your request. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = await getPersonalizedResponse(inputMessage);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <Card className="ai-coach-glow-hover h-[600px] flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Interactive AI Coach
          </div>
          <Badge variant="secondary" className="bg-purple-400/20 text-purple-400">
            <MessageCircle className="h-3 w-3 mr-1" />
            Live Chat
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden min-h-0">
        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={() => handleQuickAction(action.text)}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-3 border-purple-400/30 hover:bg-purple-400/10 hover:border-purple-400/50"
                data-testid={`quick-action-${index}`}
              >
                <action.icon className="h-4 w-4 mr-2 text-purple-400" />
                <span className="text-white">{action.text}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-1 overflow-hidden">
          <div className="space-y-3 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 w-full ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-orange-400/20 border border-orange-400/40' 
                    : 'bg-purple-400/20 border border-purple-400/40'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-3 w-3 text-orange-400" />
                  ) : (
                    <Bot className="h-3 w-3 text-purple-400" />
                  )}
                </div>
                
                <div className={`max-w-[65%] rounded-lg p-2 break-words overflow-hidden ${
                  message.type === 'user'
                    ? 'bg-orange-400/10 border border-orange-400/20 text-white'
                    : 'bg-purple-400/10 border border-purple-400/20 text-white'
                }`}>
                  <p className="text-sm leading-relaxed break-all">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-400/20 border border-purple-400/40 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-purple-400" />
                </div>
                <div className="bg-purple-400/10 border border-purple-400/20 rounded-lg p-2 max-w-[65%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your weight gain progress..."
            className="flex-1 grok-input"
            disabled={isTyping}
            data-testid="chat-input"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 grok-gradient text-black"
            data-testid="send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}