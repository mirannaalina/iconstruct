'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { messagesApi, repairRequestsApi } from '@/lib/api';
import type { RepairRequest } from '@/types';
import { ArrowLeft, Send, User } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, params.requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const requestId = Number(params.requestId);
      const [requestRes, messagesRes] = await Promise.all([
        repairRequestsApi.getById(requestId),
        messagesApi.getForRequest(requestId),
      ]);
      setRequest(requestRes.data);
      setMessages(messagesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const requestId = Number(params.requestId);
      const res = await messagesApi.getForRequest(requestId);
      setMessages(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messagesApi.send(Number(params.requestId), newMessage.trim());
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Se încarcă...</div>
      </div>
    );
  }

  const otherParty = user?.userType === 'CLIENT'
    ? request?.acceptedOffer?.professional
    : request?.client;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/dashboard/requests/${params.requestId}`} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {otherParty?.firstName} {otherParty?.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                {request?.category?.name} - {request?.problemType}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Începe conversația trimițând un mesaj.
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-orange-600 text-white rounded-br-md'
                        : 'bg-white shadow text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-orange-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
