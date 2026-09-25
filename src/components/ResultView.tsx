import React, { useState } from 'react';
import {
  Volume2,
  Square,
  ChevronDown,
  ChevronUp,
  Scissors,
  Droplets,
  Wind,
  ShieldCheck,
  Sun,
  Flame,
  Sparkles,
  Layers,
  Calendar,
  Eye,
  ArrowLeft
} from 'lucide-react';
import type { ScanResult } from '../types';
import { localization } from '../services/localizationService';
import { voiceAssistantService } from '../services/voiceAssistantService';

interface ResultViewProps {
  result: ScanResult;
  onBack: () => void;
  onOpenVoice: (cropContext: string) => void;
  onOpenHelp?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onBack,
  onOpenVoice
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showChemicalSection, setShowChemicalSection] = useState(false);
  const [expandedOrganicIdx, setExpandedOrganicIdx] = useState<number | null>(0);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Scissors':
        return <Scissors className="w-5 h-5 text-emerald-800" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-emerald-800" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-emerald-800" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-800" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-emerald-800" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-700" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-800" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-emerald-800" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-emerald-800" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-emerald-800" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-800" />;
    }
  };

  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      voiceAssistantService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const explanationText = result.isHealthy
        ? `${result.crop}: ${localization.t('disease.healthy_leaf')}. ${localization.t(
            'treatment.organic_subtitle'
          )}`
        : `${result.crop}. ${result.disease}. ${localization.t(
            'treatment.organic_header'
          )}: ${result.organicTreatments[0]?.title}. ${result.organicTreatments[0]?.desc}`;

      voiceAssistantService.speak(
        explanationText,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <div className="min-h-full pb-20 bg-gray-50">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => {
            voiceAssistantService.stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 px-2 py-1 rounded-lg bg-gray-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{localization.t('common.back')}</span>
        </button>
        <h1 className="text-sm font-bold text-gray-900">
          {localization.t('result.title')}
        </h1>
        <button
          onClick={handleToggleVoicePlayback}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition ${
            isPlayingAudio
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{localization.t('result.stop_voice')}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>{localization.t('result.listen_voice')}</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Actual Analyzed Leaf Photo Card with Localized Caption */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100">
          <div className="relative aspect-4/3 bg-gray-100">
            <img
              src={result.imageUri}
              alt={localization.t('result.image_caption')}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
              <span>{localization.t('result.image_caption')}</span>
              <span className="text-[11px] text-gray-300">
                {new Date(result.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Disease Headline & AI Badge */}
          <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {result.crop}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/80">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>AI Verified</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {result.disease}
            </h2>
          </div>
        </div>

        {/* Symptoms Section: What We Noticed */}
        {result.symptoms && result.symptoms.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
              <span className="text-emerald-700">🔍</span>
              <span>{localization.t('result.what_noticed')}</span>
            </h3>
            <ul className="space-y-2">
              {result.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* STRICT REQUIREMENT: SECTION 1 -> ORGANIC TREATMENT FIRST */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border-2 border-emerald-500/30">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h3 className="text-base font-bold text-emerald-950">
                {localization.t('treatment.organic_header')}
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {localization.t('treatment.organic_subtitle')}
            </p>
          </div>

          <div className="space-y-2.5">
            {result.organicTreatments.map((treatment, idx) => {
              const isExpanded = expandedOrganicIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/40 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedOrganicIdx(isExpanded ? null : idx)
                    }
                    className="w-full p-3 flex items-start gap-2.5 text-left transition hover:bg-emerald-50"
                  >
                    <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                      {getIconComponent(treatment.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-emerald-950">
                        {treatment.title}
                      </div>
                      {!isExpanded && (
                        <div className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                          {treatment.desc}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 shrink-0 self-center">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-700" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 text-xs text-gray-700 leading-relaxed border-t border-emerald-100/60 bg-white">
                      <p>{treatment.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STRICT REQUIREMENT: SECTION 2 -> PREVENTION */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h3 className="text-base font-bold text-gray-900">
                {localization.t('prevention.header')}
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {localization.t('prevention.subtitle')}
            </p>
          </div>

          <div className="space-y-2">
            {result.prevention.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5"
              >
                <div className="p-1.5 bg-gray-200/70 rounded-lg shrink-0 mt-0.5">
                  {getIconComponent(item.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STRICT REQUIREMENT: SECTION 3 -> CHEMICAL OPTION COLLAPSED AS SECONDARY FALLBACK ONLY */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h3 className="text-sm font-bold text-gray-900">
                {localization.t('chemical.header')}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {localization.t('chemical.secondary_badge')}
            </span>
          </div>

          <p className="text-xs text-amber-900/80 mb-3 leading-relaxed">
            {localization.t('chemical.warning')}
          </p>

          <button
            onClick={() => setShowChemicalSection(!showChemicalSection)}
            className="w-full py-2 px-3 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition"
          >
            <span>
              {showChemicalSection
                ? localization.t('chemical.toggle_close')
                : localization.t('chemical.toggle_open')}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showChemicalSection ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showChemicalSection && (
            <div className="mt-3 pt-3 border-t border-amber-200 space-y-2.5 animate-fadeIn">
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="font-bold text-xs text-amber-950 mb-1">
                  {result.chemicalFallback.title}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  {result.chemicalFallback.desc}
                </p>
                <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg font-medium">
                  <strong>{localization.t('chemical.precaution_title')}:</strong>{' '}
                  {result.chemicalFallback.precautions}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contextual Voice Guidance Button */}
        <div className="bg-emerald-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200 font-semibold">
              {localization.t('voice.title')}
            </div>
            <div className="text-sm font-bold">
              {localization.t('voice.prompt_hints')}
            </div>
          </div>
          <button
            onClick={() => onOpenVoice(`${result.crop} - ${result.disease}`)}
            className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition shadow-xs flex items-center gap-1.5"
          >
            <span>🎙️</span>
            <span>{localization.t('home.voice_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
