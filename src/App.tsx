import React, { useState, useEffect } from 'react';
import { Home, Camera, History, HelpCircle } from 'lucide-react';
import { localization } from './services/localizationService';
import { historyService } from './services/historyService';
import { diseaseDetectionService } from './services/diseaseDetectionService';
import { authService } from './services/authService';
import type { ScanResult, SupportedLanguage, FarmerProfile } from './types';
import { HomeView } from './components/HomeView';
import { ScanView } from './components/ScanView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  // Navigation tabs: 'home' | 'scan' | 'history' | 'help' | 'result'
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'history' | 'help' | 'result'>('home');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  // Farmer Authentication & Profile State
  const [currentFarmer, setCurrentFarmer] = useState<FarmerProfile | null>(authService.getCurrentFarmer());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceCropContext, setVoiceCropContext] = useState<string>('');

  // Localization re-render trigger: STRICT REQUIREMENT: when language changes, entire app re-renders immediately
  const [, setLangState] = useState<SupportedLanguage>(localization.getLanguage());

  useEffect(() => {
    // Refresh history
    setRecentScans(historyService.getHistory());

    // Subscribe to auth changes
    const unsubAuth = authService.subscribe((farmer) => {
      setCurrentFarmer(farmer);
    });

    // Subscribe to language change events
    const unsubscribe = localization.subscribe((newLang) => {
      setLangState(newLang);
      // Also update localized text on already loaded scans
      setRecentScans(historyService.getHistory());
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, []);

  const handleScanCompleted = (result: ScanResult) => {
    setSelectedScan(result);
    setRecentScans(historyService.getHistory());
    setActiveTab('result');
  };

  const handleSelectDemoSample = async (sampleId: string) => {
    try {
      const result = await diseaseDetectionService.analyzeImage('', '', sampleId);
      historyService.saveScan(result);
      setSelectedScan(result);
      setRecentScans(historyService.getHistory());
      setActiveTab('result');
    } catch {
      // fallback
    }
  };

  const handleOpenVoiceWithContext = (context?: string) => {
    setVoiceCropContext(context || '');
    setIsVoiceOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans antialiased text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Device Container Frame (Android mobile-first viewport) */}
      <div className="w-full max-w-md h-[100dvh] bg-white flex flex-col shadow-2xl relative overflow-hidden border-x border-gray-200">
        
        {/* Main View Port */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              onStartScan={() => setActiveTab('scan')}
              onOpenVoice={() => handleOpenVoiceWithContext()}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSelectScan={(scan) => {
                setSelectedScan(scan);
                setActiveTab('result');
              }}
              onSelectDemoSample={handleSelectDemoSample}
              recentScans={recentScans}
              currentFarmer={currentFarmer}
            />
          )}

          {activeTab === 'scan' && (
            <ScanView
              onScanCompleted={handleScanCompleted}
              onCancel={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'result' && selectedScan && (
            <ResultView
              result={selectedScan}
              onBack={() => setActiveTab('home')}
              onOpenVoice={handleOpenVoiceWithContext}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              scans={recentScans}
              onSelectScan={(scan) => {
                setSelectedScan(scan);
                setActiveTab('result');
              }}
              onClearHistory={() => setRecentScans([])}
            />
          )}
        </div>

        {/* Farmer-friendly Bottom Navigation Bar */}
        <div className="h-16 bg-white border-t border-gray-200 px-6 flex items-center justify-between z-20 shrink-0 shadow-lg">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'home'
                ? 'text-emerald-800 font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{localization.t('nav.home')}</span>
          </button>

          {/* Central Scan Action Button */}
          <button
            onClick={() => setActiveTab('scan')}
            className={`-mt-5 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition ${
              activeTab === 'scan'
                ? 'bg-emerald-900 text-white ring-4 ring-emerald-100'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
            title={localization.t('nav.scan')}
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'history'
                ? 'text-emerald-800 font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{localization.t('nav.history')}</span>
          </button>

          {/* Help */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-emerald-800 transition"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{localization.t('nav.help')}</span>
          </button>
        </div>

        {/* Global Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenHelp={() => {
            setIsSettingsOpen(false);
            setIsHelpOpen(true);
          }}
          onOpenAuth={() => {
            setIsSettingsOpen(false);
            setIsAuthOpen(true);
          }}
          currentFarmer={currentFarmer}
        />

        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />

        <VoiceAssistantModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          cropContext={voiceCropContext}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(farmer) => {
            setCurrentFarmer(farmer);
          }}
        />
      </div>
    </div>
  );
};

export default App;
