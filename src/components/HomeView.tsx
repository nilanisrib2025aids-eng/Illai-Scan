import React from 'react';
import {
  Camera,
  Image as ImageIcon,
  Mic,
  ChevronRight,
  Settings,
  HelpCircle,
  Leaf,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { localization } from '../services/localizationService';
import type { ScanResult, FarmerProfile } from '../types';
import { AGRICULTURAL_DISEASE_DB } from '../data/agriculturalDb';

interface HomeViewProps {
  onStartScan: () => void;
  onOpenVoice: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  onSelectScan: (scan: ScanResult) => void;
  onSelectDemoSample: (sampleId: string) => void;
  recentScans: ScanResult[];
  currentFarmer: FarmerProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartScan,
  onOpenVoice,
  onOpenSettings,
  onOpenHelp,
  onOpenAuth,
  onSelectScan,
  onSelectDemoSample,
  recentScans,
  currentFarmer
}) => {
  return (
    <div className="min-h-full pb-20 bg-gray-50">
      {/* Human Agricultural App Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Leaf className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">
              {localization.t('app.title')}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium">
              {localization.t('app.tagline')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Farmer Profile / Login Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              currentFarmer
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-emerald-800 text-white hover:bg-emerald-900 border-emerald-800 shadow-xs'
            }`}
            title={currentFarmer ? `Kisan ID: ${currentFarmer.farmerId}` : 'Login / Create Farmer ID'}
          >
            {currentFarmer ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] font-bold">{currentFarmer.farmerId}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px]">Farmer ID</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition"
            title={localization.t('help.title')}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition"
            title={localization.t('settings.title')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Farmer Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-900">
              {currentFarmer
                ? `Namaste, ${currentFarmer.name}`
                : localization.t('home.greeting')}
            </div>
            <div className="text-xs text-gray-500">
              {currentFarmer
                ? `${currentFarmer.state} • ${currentFarmer.primaryCrop || 'Farmer'}`
                : localization.t('home.greeting_sub')}
            </div>
          </div>
          {currentFarmer ? (
            <button
              onClick={onOpenAuth}
              className="text-[11px] px-2.5 py-1 bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-900 font-bold rounded-full border border-emerald-200/50 transition cursor-pointer"
            >
              Pass: {currentFarmer.farmerId}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[11px] px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full transition shadow-xs cursor-pointer"
            >
              + Create ID
            </button>
          )}
        </div>

        {/* HERO CARD: Real Crop Image + Primary Action */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 relative">
          <div className="relative h-44 bg-emerald-950">
            <img
              src="https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=800&q=80"
              alt="Healthy crop leaf"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h2 className="text-lg font-bold leading-tight">
                {localization.t('home.hero_title')}
              </h2>
              <p className="text-xs text-gray-200 mt-1 max-w-xs">
                {localization.t('home.hero_desc')}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white grid grid-cols-2 gap-2.5">
            <button
              onClick={onStartScan}
              className="py-3 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{localization.t('home.btn_scan')}</span>
            </button>
            <button
              onClick={onStartScan}
              className="py-3 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>{localization.t('home.btn_upload')}</span>
            </button>
          </div>
        </div>

        {/* VOICE-FIRST ASSISTANT CARD */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-emerald-900">
              {localization.t('home.voice_title')}
            </div>
            <div className="text-xs text-emerald-800 font-normal">
              {localization.t('home.voice_desc')}
            </div>
          </div>

          <button
            onClick={onOpenVoice}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>{localization.t('home.voice_btn')}</span>
          </button>
        </div>

        {/* DEMO / SAMPLE CASES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              {localization.t('home.demo_cases')}
            </h3>
            <span className="text-[11px] text-gray-500">
              {localization.t('home.demo_cases_sub')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {AGRICULTURAL_DISEASE_DB.slice(0, 4).map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectDemoSample(sample.id)}
                className="bg-white p-2.5 rounded-xl border border-gray-100 hover:border-emerald-300 shadow-xs text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={sample.sampleImageUrl}
                    alt={localization.t(sample.diseaseKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-gray-900 truncate">
                    {localization.t(sample.cropKey)}
                  </div>
                  <div className="text-[10px] text-emerald-800 truncate font-medium">
                    {localization.t(sample.diseaseKey)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RECENT SCANS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              {localization.t('home.recent_scans')}
            </h3>
          </div>

          {recentScans.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 text-xs text-gray-500">
              {localization.t('home.no_scans')}
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.slice(0, 3).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={scan.imageUri}
                        alt={localization.t('result.image_caption')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {scan.crop} • {scan.disease}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {localization.t('home.today')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
