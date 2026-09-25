import React, { useState } from 'react';
import {
  Globe,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  HelpCircle,
  Volume2,
  Leaf
} from 'lucide-react';
import { localization, SUPPORTED_LANGUAGES } from '../services/localizationService';
import { authService } from '../services/authService';
import type { SupportedLanguage, FarmerProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  currentFarmer: FarmerProfile | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
  onOpenAuth,
  currentFarmer
}) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(
    localization.getLanguage()
  );
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);

  if (!isOpen) return null;

  const handleSelectLang = (code: SupportedLanguage) => {
    localization.setLanguage(code);
    setCurrentLang(code);
    setShowLanguagePicker(false);
  };

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {localization.t('settings.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Farmer Digital ID Card Section */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Farmer Identity Pass
              </span>
              {currentFarmer ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Guest
                </span>
              )}
            </div>

            {currentFarmer ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{currentFarmer.name}</h3>
                    <div className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                      ID: {currentFarmer.farmerId}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      authService.logout();
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Switch User
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-[11px] text-gray-600">
                  <span>📱 {currentFarmer.phone}</span>
                  <span>📍 {currentFarmer.state}</span>
                  <span>🌱 {currentFarmer.primaryCrop}</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">
                  Generate your official Farmer User ID to save crop disease scan records and access personalized organic advice.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Create / Sign In to Farmer ID</span>
                </button>
              </div>
            )}
          </div>

          {/* Language Section */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-gray-900">
                  {localization.t('settings.lang_section')}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                {currentMeta?.nativeName} ({currentMeta?.name})
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {localization.t('settings.lang_desc')}
            </p>

            <button
              onClick={() => setShowLanguagePicker(!showLanguagePicker)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-emerald-300 rounded-lg text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition shadow-xs"
            >
              <span>{localization.t('settings.change_lang')}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showLanguagePicker ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showLanguagePicker && (
              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100 max-h-56 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang.code)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-700 text-white font-bold shadow-xs'
                          : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{lang.nativeName}</div>
                        <div
                          className={`text-[10px] ${
                            isSelected ? 'text-emerald-100' : 'text-gray-500'
                          }`}
                        >
                          {lang.name}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Voice setting */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-700" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {localization.t('settings.voice_section')}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {localization.t('settings.voice_enable')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoVoice}
                  onChange={(e) => setAutoVoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Help & FAQ navigation */}
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {localization.t('help.title')}
                </h4>
                <p className="text-xs text-gray-500">
                  {localization.t('help.faq_title')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Optional Gemini AI API Key Configuration */}
          <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">✨</span>
                <h4 className="text-xs font-bold text-emerald-950">
                  Gemini Vision & Assistant AI
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                localStorage.getItem('ilai_scan_gemini_api_key')
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {localStorage.getItem('ilai_scan_gemini_api_key') ? 'Live AI Active' : 'Built-in Model Active'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              ILAI SCAN operates with a built-in computer-vision model and structured agronomy database. You can optionally supply your Google Gemini API key to activate live multimodal vision diagnostics.
            </p>
            <div className="flex gap-1.5 pt-1">
              <input
                type="password"
                placeholder="Paste Gemini API key (optional)..."
                defaultValue={localStorage.getItem('ilai_scan_gemini_api_key') || ''}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    localStorage.setItem('ilai_scan_gemini_api_key', val);
                  } else {
                    localStorage.removeItem('ilai_scan_gemini_api_key');
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Privacy statement */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 mb-0.5">
                  {localization.t('settings.privacy_section')}
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {localization.t('settings.privacy_text')}
                </p>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm mb-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>{localization.t('settings.about_title')}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {localization.t('settings.about_desc')}
            </p>
            <div className="mt-2 text-[10px] text-gray-400 font-mono">
              Version 1.0.0 • Made with Care for Indian Farmers
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition shadow-sm"
          >
            {localization.t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
};
