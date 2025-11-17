import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Send, DollarSign, BarChart3, Sparkles, Loader2, Moon, Sun, Users, HelpCircle, Save, Bookmark, Trash2, Clock } from 'lucide-react';

export default function FinancialAIBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m WealthWise AI, your intelligent financial assistant. I can help you with:\n\n• Real-time stock prices and market data\n• Investment strategies and portfolio advice\n• Personal finance planning\n• Cryptocurrency insights\n• Economic news and analysis\n• Tax optimization strategies\n\nWhat financial question can I help you with today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('ai');
  const [savedConversations, setSavedConversations] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [conversationName, setConversationName] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [selectedConversationForExport, setSelectedConversationForExport] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadSavedConversations();
    }
  }, [isLoggedIn, currentUser]);

  const checkLoginStatus = async () => {
    try {
      const result = await window.storage.get('current_user');
      if (result && result.value) {
        const user = JSON.parse(result.value);
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSavedConversations = async () => {
    if (!currentUser) return;
    
    try {
      const keys = await window.storage.list(`conversation:${currentUser.email}:`);
      if (keys && keys.keys) {
        const conversations = [];
        for (const key of keys.keys) {
          const result = await window.storage.get(key);
          if (result && result.value) {
            conversations.push(JSON.parse(result.value));
          }
        }
        setSavedConversations(conversations.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.log('No saved conversations found');
    }
  };

  const saveConversation = async () => {
    if (!conversationName.trim() || messages.length <= 1 || !currentUser) return;

    const conversation = {
      id: Date.now().toString(),
      name: conversationName.trim(),
      messages: messages,
      timestamp: Date.now(),
      userEmail: currentUser.email
    };

    try {
      await window.storage.set(`conversation:${currentUser.email}:${conversation.id}`, JSON.stringify(conversation));
      await loadSavedConversations();
      setShowSaveDialog(false);
      setConversationName('');
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setActiveTab('ai');
  };

  const deleteConversation = async (id) => {
    if (!currentUser) return;
    
    try {
      await window.storage.delete(`conversation:${currentUser.email}:${id}`);
      await loadSavedConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSignup = async () => {
    if (!signupEmail.trim() || !signupPassword.trim() || signupPassword !== signupConfirmPassword) {
      alert('Please ensure all fields are filled and passwords match.');
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await window.storage.get(`user:${signupEmail}`);
      if (existingUser) {
        alert('An account with this email already exists. Please login instead.');
        return;
      }

      // Create new user
      const user = {
        email: signupEmail,
        password: signupPassword, // In production, this should be hashed
        createdAt: Date.now()
      };

      await window.storage.set(`user:${signupEmail}`, JSON.stringify(user));
      await window.storage.set('current_user', JSON.stringify(user));
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setActiveTab('ai');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error creating account. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const result = await window.storage.get(`user:${loginEmail}`);
      if (!result || !result.value) {
        alert('No account found with this email. Please sign up first.');
        return;
      }

      const user = JSON.parse(result.value);
      if (user.password !== loginPassword) {
        alert('Incorrect password. Please try again.');
        return;
      }

      await window.storage.set('current_user', JSON.stringify(user));
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
      setActiveTab('ai');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('current_user');
      setCurrentUser(null);
      setIsLoggedIn(false);
      setSavedConversations([]);
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m WealthWise AI, your intelligent financial assistant. I can help you with:\n\n• Real-time stock prices and market data\n• Investment strategies and portfolio advice\n• Personal finance planning\n• Cryptocurrency insights\n• Economic news and analysis\n• Tax optimization strategies\n\nWhat financial question can I help you with today?'
        }
      ]);
      setActiveTab('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleReportIssue = () => {
    if (!reportEmail.trim() || !reportMessage.trim()) return;
    
    const subject = 'WealthWise AI - Issue Report';
    const body = `From: ${reportEmail}

${reportMessage}`;
    
    window.location.href = `mailto:haripraveer111@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    setShowReportDialog(false);
    setReportEmail('');
    setReportMessage('');
  };

  const generateExportCode = (conversation) => {
    const jsonString = JSON.stringify(conversation);
    const base64 = btoa(jsonString);
    return base64;
  };

  const handleExport = (conversation) => {
    setSelectedConversationForExport(conversation);
    const code = generateExportCode(conversation);
    setExportCode(code);
    setShowExportDialog(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = exportCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    
    try {
      const jsonString = atob(importCode.trim());
      const conversation = JSON.parse(jsonString);
      
      // Create a new ID and timestamp for the imported conversation
      conversation.id = Date.now().toString();
      conversation.timestamp = Date.now();
      conversation.name = `${conversation.name} (Imported)`;
      conversation.userEmail = currentUser.email;
      
      await window.storage.set(`conversation:${currentUser.email}:${conversation.id}`, JSON.stringify(conversation));
      await loadSavedConversations();
      
      setShowImportDialog(false);
      setImportCode('');
    } catch (error) {
      alert('Invalid import code. Please check and try again.');
      console.error('Import error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          system: `You are WealthWise AI, an expert financial advisor and investment analyst. Your role is to provide accurate, up-to-date financial information and guidance.

CRITICAL INSTRUCTIONS:
- Always use the web_search tool to get current, real-time financial data for stocks, markets, crypto, and economic news
- Provide specific numbers, prices, and percentages when discussing financial instruments
- Cite your sources and mention when data was retrieved
- Offer balanced perspectives on investments, including risks
- Never provide specific buy/sell recommendations without proper disclaimers
- Be clear that you provide information, not personalized financial advice
- Always search for the latest information before answering questions about market data, stock prices, economic indicators, or recent financial news

When discussing investments, always include appropriate risk disclaimers. Format your responses clearly with proper structure.`,
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search'
            }
          ]
        })
      });

      const data = await response.json();
      
      let assistantMessage = '';
      
      if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') {
            assistantMessage += block.text;
          }
        }
      }

      if (assistantMessage) {
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error processing your request. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered a technical error. Please try again in a moment.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's the current price of S&P 500?",
    "Analyze recent Fed interest rate decisions",
    "Compare growth vs value stocks now",
    "What are the best performing sectors today?"
  ];

  const bgColor = darkMode ? 'bg-black' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-black';
  const cardBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const borderColor = darkMode ? 'border-green-500/20' : 'border-green-500/30';
  const inputBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inputBorder = darkMode ? 'border-gray-700' : 'border-gray-300';
  const assistantMsgBg = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const assistantMsgBorder = darkMode ? 'border-gray-700' : 'border-gray-300';
  const quickBtnBg = darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
  const quickBtnBorder = darkMode ? 'border-gray-700' : 'border-gray-300';
  const footerBg = darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50';
  const footerBorder = darkMode ? 'border-gray-800' : 'border-gray-200';
  const warningText = darkMode ? 'text-gray-500' : 'text-gray-600';

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`} style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Tabs */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => window.location.reload()} 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <TrendingUp className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">WealthWise</span>
              </button>
              
              {/* Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`px-5 py-3 text-sm font-medium transition-all border-b-3 ${
                    activeTab === 'ai' 
                      ? 'bg-white/15 text-white border-white' 
                      : 'text-green-50 border-transparent hover:bg-white/10'
                  }`}
                >
                  WealthWise AI
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-5 py-3 text-sm font-medium transition-all border-b-3 flex items-center gap-2 ${
                    activeTab === 'saved' 
                      ? 'bg-white/15 text-white border-white' 
                      : 'text-green-50 border-transparent hover:bg-white/10'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Saved
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-5 py-3 text-sm font-medium transition-all border-b-3 flex items-center gap-2 ${
                    activeTab === 'about' 
                      ? 'bg-white/15 text-white border-white' 
                      : 'text-green-50 border-transparent hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  About
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`px-5 py-3 text-sm font-medium transition-all border-b-3 flex items-center gap-2 ${
                    activeTab === 'help' 
                      ? 'bg-white/15 text-white border-white' 
                      : 'text-green-50 border-transparent hover:bg-white/10'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReportDialog(true)}
                className="bg-white/15 hover:bg-white/25 px-4 py-2 text-sm text-white font-medium transition-all rounded-lg"
              >
                Report Issues
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-white/15 hover:bg-white/25 p-2 transition-all rounded-lg"
              >
                {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'ai' && (
          <div className={`h-[85vh] ${cardBg} border ${borderColor} flex flex-col overflow-hidden transition-colors duration-300`}>
            
            {/* AI Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 border-b-4 border-green-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-white/15 p-2 rounded-lg">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">AI Financial Assistant</h1>
                    <p className="text-green-100 text-sm">Real-Time Market Data</p>
                  </div>
                </div>
                {messages.length > 1 && (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg flex items-center gap-2 text-white text-sm font-semibold transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
              <div className="flex gap-2 text-xs text-green-50">
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded border border-white/20">
                  <BarChart3 className="w-3 h-3" /> Live Markets
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded border border-white/20">
                  <DollarSign className="w-3 h-3" /> Investment Analysis
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 transition-colors duration-300 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : `${assistantMsgBg} ${textColor} border ${assistantMsgBorder}`
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className={`${assistantMsgBg} border ${assistantMsgBorder} rounded-lg px-4 py-3 flex items-center gap-2 transition-colors duration-300`}>
                    <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Analyzing market data...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className={`text-sm mb-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quick questions:</p>
                <div className="grid grid-cols-2 gap-3">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q)}
                      className={`text-left text-sm ${quickBtnBg} ${darkMode ? 'text-gray-300' : 'text-gray-700'} px-4 py-3 rounded-lg border ${quickBtnBorder} transition-all hover:border-green-500 shadow-sm`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`p-5 ${footerBg} border-t-2 ${footerBorder} transition-colors duration-300`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about stocks, investments, markets, or personal finance..."
                  className={`flex-1 ${inputBg} ${textColor} ${darkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} border-2 ${inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:ring-0 focus:border-green-500 transition-colors duration-300`}
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <p className={`text-xs ${warningText} mt-3 text-center transition-colors duration-300`}>
                ⚠️ AI may make some mistakes, check thoroughly before implementing. Contact a financial advisor for further help. This website should only be used as a simple supplement for further thinking.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className={`${cardBg} border-2 ${borderColor} p-10 transition-colors duration-300 ${textColor}`}>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-green-600 border-b-4 border-green-600 pb-3">Saved Conversations</h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportDialog(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Import
                  </button>
                </div>
              </div>
              
              <div className={`mb-6 p-4 ${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border-2 rounded-lg`}>
                <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'} flex items-center gap-2`}>
                  <Clock className="w-4 h-4" />
                  <strong>Important:</strong> Saved conversations may contain outdated information. Market data, prices, and financial information change rapidly. Always verify current information before making any financial decisions.
                </p>
              </div>

              {savedConversations.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No saved conversations yet.</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Start a conversation and click "Save" to save it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-2 ${borderColor} rounded-lg p-5 hover:border-green-500 transition-all`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-600 mb-1">{conv.name}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Saved on {formatDate(conv.timestamp)} • {conv.messages.length} messages.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadConversation(conv)}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleExport(conv)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => deleteConversation(conv.id)}
                            className={`${darkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2.5 rounded-lg transition-all shadow-sm`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                        Preview: {conv.messages[1]?.content.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className={`${cardBg} border-2 ${borderColor} p-10 transition-colors duration-300 ${textColor}`}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-green-600 border-b-4 border-green-600 pb-3">About WealthWise AI</h1>
              
              <div className="space-y-8">
                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">Our Mission</h2>
                  <p className="leading-relaxed text-base">
                    WealthWise AI is dedicated to democratizing access to financial intelligence. We leverage cutting-edge artificial intelligence 
                    and real-time market data to provide comprehensive financial insights to everyone, regardless of their investment experience.
                  </p>
                </section>

                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">What We Offer</h2>
                  <ul className="space-y-2 leading-relaxed text-base">
                    <li>• Real-time stock prices and market analysis from reputable financial sources</li>
                    <li>• Investment strategy guidance based on current market conditions</li>
                    <li>• Personal finance planning assistance</li>
                    <li>• Cryptocurrency market insights and trends</li>
                    <li>• Economic news analysis and interpretation</li>
                    <li>• Tax optimization strategies and considerations</li>
                  </ul>
                </section>

                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">Our Technology</h2>
                  <p className="leading-relaxed text-base">
                    Powered by advanced AI language models and integrated with web search capabilities, WealthWise AI constantly 
                    accesses the latest financial data from renowned sources including major financial news outlets, market data providers, 
                    and economic research institutions. Our system processes this information to deliver accurate, timely, and relevant 
                    financial insights.
                  </p>
                </section>

                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">Important Disclaimer</h2>
                  <p className="leading-relaxed text-base">
                    WealthWise AI is designed as an educational tool and information resource. While we strive for accuracy, our AI may 
                    make mistakes. Always verify information and consult with licensed financial advisors before making investment decisions. 
                    This platform should be used as a supplement to professional financial advice, not as a replacement.
                  </p>
                </section>

                <section className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
                  <p className="text-lg font-semibold text-green-600 mb-1">Created by Goldenseal Studios.</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created by Haripraveer Puranam.</p>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className={`${cardBg} border-2 ${borderColor} p-10 transition-colors duration-300 ${textColor}`}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-green-600 border-b-4 border-green-600 pb-3">Help & FAQs</h1>
              
              <div className="space-y-8">
                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">How to Use WealthWise AI</h2>
                  <p className="leading-relaxed mb-3 text-base">
                    Simply type your financial question in the chat interface on the WealthWise AI tab. Our AI will analyze your query 
                    and provide detailed responses based on the latest market data and financial information.
                  </p>
                  <p className="leading-relaxed text-base">
                    You can ask about stock prices, investment strategies, market trends, economic indicators, cryptocurrency, 
                    personal finance tips, and much more.
                  </p>
                </section>

                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">Frequently Asked Questions</h2>
                  
                  <div className="space-y-5">
                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">Is WealthWise AI free to use?</h3>
                      <p className="leading-relaxed text-base">Yes, WealthWise AI is completely free to use. We believe financial information should be accessible to everyone.</p>
                    </div>

                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">How accurate is the information?</h3>
                      <p className="leading-relaxed text-base">
                        Our AI accesses real-time data from reputable financial sources. However, AI can make mistakes. 
                        Always verify critical information and consult with professional financial advisors before making investment decisions.
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">Can I use this for investment advice?</h3>
                      <p className="leading-relaxed text-base">
                        WealthWise AI provides information and analysis, but should not be considered personalized investment advice. 
                        Always consult with a licensed financial advisor for decisions specific to your financial situation.
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">What sources does the AI use?</h3>
                      <p className="leading-relaxed text-base">
                        Our AI searches and analyzes information from major financial news outlets, market data providers, economic reports, 
                        and other reputable sources across the internet.
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">Is my data private?</h3>
                      <p className="leading-relaxed text-base">
                        Your conversations are processed to provide responses. We recommend not sharing sensitive personal financial 
                        information such as account numbers, passwords, or social security numbers.
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-400 pl-4">
                      <h3 className="font-bold text-base mb-2">How do saved conversations work?</h3>
                      <p className="leading-relaxed text-base">
                        You can save conversations by clicking the "Save" button. Saved conversations are stored locally and can be accessed later. 
                        Note that saved information may become outdated as market conditions change.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="border-l-4 border-green-600 pl-5">
                  <h2 className="text-2xl font-bold mb-3 text-green-500">Tips for Best Results</h2>
                  <ul className="space-y-2 leading-relaxed text-base">
                    <li>• Be specific with your questions (e.g., "What's the current price of Apple stock?" instead of "Tell me about Apple").</li>
                    <li>• Ask follow-up questions to dive deeper into topics.</li>
                    <li>• Use the quick question buttons to get started.</li>
                    <li>• Save important conversations for future reference.</li>
                    <li>• Toggle between dark and light mode using the button in the top right.</li>
                    <li>• Always verify important information with multiple sources.</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardBg} ${textColor} rounded-lg p-6 max-w-md w-full mx-4 border-2 ${borderColor}`}>
            <h3 className="text-2xl font-bold mb-4 text-green-600">Save Conversation</h3>
            <input
              type="text"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveConversation();
                }
              }}
              placeholder="Enter a name for this conversation..."
              className={`w-full ${inputBg} ${textColor} border-2 ${inputBorder} rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-green-500`}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${textColor} px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm`}
              >
                Cancel
              </button>
              <button
                onClick={saveConversation}
                disabled={!conversationName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardBg} ${textColor} rounded-lg p-6 max-w-lg w-full mx-4 border-2 ${borderColor}`}>
            <h3 className="text-2xl font-bold mb-2 text-green-600">Report an Issue</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your feedback will be sent to the owner. Please provide your email and describe the issue.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Email:
                </label>
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full ${inputBg} ${textColor} border-2 ${inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:border-green-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Describe the Issue:
                </label>
                <textarea
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Please describe the issue you're experiencing..."
                  rows="6"
                  className={`w-full ${inputBg} ${textColor} border-2 ${inputBorder} rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none`}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportEmail('');
                  setReportMessage('');
                }}
                className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${textColor} px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                disabled={!reportEmail.trim() || !reportMessage.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} ${textColor} rounded-lg p-6 max-w-2xl w-full border-2 ${borderColor} shadow-2xl`}>
            <h3 className="text-2xl font-bold mb-2 text-green-600">Export Conversation</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share this code with others to transfer this conversation. Copy the code below:
            </p>
            
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg mb-4 border-2 ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-green-600">Conversation: {selectedConversationForExport?.name}</p>
                {showCopySuccess && (
                  <span className="text-xs font-semibold text-green-600 animate-pulse">✓ Copied!</span>
                )}
              </div>
              <div className={`${inputBg} border-2 ${inputBorder} rounded-lg p-4`}>
                <p className="font-mono text-xs break-all leading-relaxed">{exportCode}</p>
              </div>
            </div>
            
            <div className={`mb-4 p-3 ${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border-2 rounded-lg`}>
              <p className={`text-xs ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                ⚠️ <strong>Important:</strong> This conversation may contain outdated market information. Always verify current data before making financial decisions.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExportDialog(false);
                  setExportCode('');
                  setShowCopySuccess(false);
                }}
                className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${textColor} px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm`}
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm"
              >
                {showCopySuccess ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardBg} ${textColor} rounded-lg p-6 max-w-2xl w-full mx-4 border-2 ${borderColor}`}>
            <h3 className="text-2xl font-bold mb-2 text-green-600">Import Conversation</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Paste the conversation code below to import it to your saved conversations:
            </p>
            
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Paste your conversation code here..."
              rows="8"
              className={`w-full ${inputBg} ${textColor} border-2 ${inputBorder} rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-green-500 resize-none font-mono text-sm`}
            />
            
            <div className={`mb-4 p-3 ${darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-300'} border-2 rounded-lg`}>
              <p className={`text-xs ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                ⚠️ <strong>Important:</strong> Imported conversations may contain outdated information. Always verify current market data.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportCode('');
                }}
                className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${textColor} px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Import Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}