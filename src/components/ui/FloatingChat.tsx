'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Phone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../config/site';

export const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "👋 Hi there! I'm Bizcore AI. How can I help streamline your HRM & CRM operations today?",
      time: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "How does 1-click payroll work?",
    "Can we manage 10+ branches?",
    "Book an executive demo",
    "View pricing options"
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text, time }]);
    if (!textToSend) setInputValue('');

    // Simulate smart AI response
    setIsTyping(true);
    setTimeout(() => {
      let reply = "Thanks for asking! Bizcore Suite synchronizes people, payroll, attendance, and leads in one platform. Would you like to schedule a 15-minute guided walkthrough with our solutions engineer?";
      
      if (text.toLowerCase().includes('payroll')) {
        reply = "Our automated payroll engine calculates salaries, taxes, incentives, and attendance deductions in under 3 minutes, generating encrypted PDF payslips and direct bank payout files automatically!";
      } else if (text.toLowerCase().includes('branch')) {
        reply = "Yes! You can manage from 1 to 500+ physical branches with localized shift policies, regional holiday calendars, and centralized executive consolidation.";
      } else if (text.toLowerCase().includes('demo')) {
        reply = "Awesome! Click below or scroll to the bottom of the page to reserve your preferred demo slot, or connect directly via WhatsApp at " + siteConfig.contact.phone;
      } else if (text.toLowerCase().includes('pricing')) {
        reply = "Our plans start at $79/mo for Starter Growth and $199/mo for Enterprise Pro with all 10 modules included. Scroll to our pricing section to see the full breakdown!";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Interactive Chat Window Drawer */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] rounded-3xl glass-card overflow-hidden shadow-2xl border border-navy-900/10 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-brand-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-navy-900" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Bizcore AI Assistant</h4>
                <p className="text-[11px] text-blue-200 flex items-center gap-1">
                  <span>Online</span> • <span>Typically replies instantly</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              aria-label="Close chat window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Channels Bar */}
          <div className="px-4 py-2 bg-tint-50/90 border-b border-tint-100 flex items-center justify-between text-xs text-navy-muted">
            <span className="font-semibold text-navy-text">Direct Channels:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, '')}?text=Hi%20Bizcore%20Suite,%20I'd%20like%20to%20learn%20more`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 hover:bg-emerald-200/80 transition-colors"
              >
                <Phone className="w-3 h-3" /> WhatsApp
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-1 text-brand-700 hover:text-brand-800 font-semibold px-2 py-0.5 rounded-full bg-brand-100/70 hover:bg-brand-200/80 transition-colors"
              >
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          </div>

          {/* Messages Body */}
          <div className="p-4 h-[280px] overflow-y-auto space-y-3 bg-white/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-navy-900 to-brand-600 text-white rounded-br-none'
                      : 'bg-tint-100/90 text-navy-text border border-tint-200/60 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-navy-muted mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 text-xs text-navy-muted p-2 bg-tint-100/70 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Quick Questions Pills */}
          <div className="p-2.5 bg-tint-50/80 border-t border-tint-100 flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] font-medium text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-tint-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about Bizcore..."
              className="flex-1 bg-tint-50/80 text-navy-text placeholder-navy-muted/60 text-xs px-3.5 py-2 rounded-full border border-tint-200 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-full bg-gradient-to-r from-navy-900 to-brand-600 text-white disabled:opacity-40 hover:shadow-md transition-all"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button with Pulsing Ring */}
      <div className="flex items-center gap-3">
        {/* Quick Icon: WhatsApp */}
        <a
          href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, '')}?text=Hi%20Bizcore%20Suite,%20I'd%20like%20to%20chat`}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white text-emerald-600 border border-tint-200 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Chat on WhatsApp"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* Quick Icon: Email */}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white text-brand-600 border border-tint-200 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Send email"
        >
          <Mail className="w-5 h-5" />
        </a>

        {/* Main Floating Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-navy-900 to-brand-600 text-white shadow-button hover:shadow-cardHover border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open support chat"
        >
          {/* Pulsing Ring Indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          <span className="text-xs font-bold tracking-tight">I'm online – chat now</span>
          <MessageSquare className="w-4 h-4 ml-1 transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </div>
  );
};

