import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Square, Send, Sparkles } from 'lucide-react';
import { localization } from '../services/localizationService';
import { voiceAssistantService } from '../services/voiceAssistantService';
import type { VoiceMessage } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropContext?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  cropContext
}) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: localization.t('voice.subtitle'),
      timestamp: Date.now()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      voiceAssistantService.stopSpeaking();
      voiceAssistantService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
    } else {
      setMessages([
        {
          id: 'msg_welcome_' + Date.now(),
          sender: 'assistant',
          text: cropContext
            ? `${localization.t('voice.subtitle')} (${cropContext})`
            : localization.t('voice.subtitle'),
          timestamp: Date.now()
        }
      ]);
    }
  }, [isOpen, cropContext]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      voiceAssistantService.stopListening();
      setIsListening(false);
      setStatusText('');
    } else {
      voiceAssistantService.stopSpeaking();
      setIsSpeaking(false);
      setStatusText(localization.t('voice.listening'));
      setIsListening(true);

      const started = voiceAssistantService.startListening(
        (transcript) => {
          setIsListening(false);
          setStatusText(localization.t('voice.processing'));
          processUserQuery(transcript);
        },
        (_err) => {
          setIsListening(false);
          setStatusText('');
        },
        () => {
          setIsListening(false);
        }
      );

      if (!started) {
        setStatusText('Voice input not supported in this browser. Please type.');
        setIsListening(false);
      }
    }
  };

  const processUserQuery = async (query: string) => {
    const userMsg: VoiceMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatusText(localization.t('voice.processing'));

    try {
      // Pass previous conversational history so Gemini has multi-turn context
      const historyTurns = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await voiceAssistantService.generateAgriculturalResponse(query, cropContext, historyTurns);
      const assistantMsg: VoiceMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: response,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStatusText('');

      setIsSpeaking(true);
      voiceAssistantService.speak(
        response,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } catch {
      setStatusText('');
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput('');
    processUserQuery(query);
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      voiceAssistantService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceAssistantService.speak(
        text,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-lg">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">
                  {localization.t('voice.title')}
                </h2>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded-full font-medium">
                  ✨ Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                {localization.t('app.title')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              voiceAssistantService.stopSpeaking();
              voiceAssistantService.stopListening();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-emerald-700/80 text-white hover:bg-emerald-600 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/70">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-xs ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeakText(msg.text)}
                      className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-1.5 border-t border-gray-100"
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 text-red-500 fill-current" />
                          <span>{localization.t('voice.stop')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{localization.t('voice.replay')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {statusText && (
            <div className="text-center py-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium animate-pulse">
                {statusText}
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-2.5 bg-white border-t border-gray-100">
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{localization.t('voice.prompt_hints')}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => processUserQuery(localization.t('voice.hint_1'))}
              className="whitespace-nowrap px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-full text-gray-700 text-xs transition border border-gray-200"
            >
              {localization.t('voice.hint_1')}
            </button>
            <button
              onClick={() => processUserQuery(localization.t('voice.hint_2'))}
              className="whitespace-nowrap px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-full text-gray-700 text-xs transition border border-gray-200"
            >
              {localization.t('voice.hint_2')}
            </button>
            <button
              onClick={() => processUserQuery(localization.t('voice.hint_3'))}
              className="whitespace-nowrap px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-full text-gray-700 text-xs transition border border-gray-200"
            >
              {localization.t('voice.hint_3')}
            </button>
          </div>
        </div>

        {/* Voice Microphone Center & Input */}
        <div className="p-3 bg-white border-t border-gray-100 flex flex-col items-center">
          <div className="flex items-center gap-4 w-full">
            <form onSubmit={handleSendText} className="flex-1 flex gap-1.5">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={localization.t('voice.type_placeholder')}
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3 py-2 bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3.5 rounded-full shadow-md transition flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
              title={localization.t('voice.tap_to_speak')}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>
          <span className="text-[11px] text-gray-500 mt-1.5">
            {isListening
              ? localization.t('voice.listening')
              : localization.t('voice.tap_to_speak')}
          </span>
        </div>
      </div>
    </div>
  );
};
