import React from 'react';
import { Trash2, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ScanResult } from '../types';
import { localization } from '../services/localizationService';
import { historyService } from '../services/historyService';

interface HistoryViewProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  scans,
  onSelectScan,
  onClearHistory
}) => {
  const handleClear = () => {
    if (window.confirm(localization.t('history.delete_confirm'))) {
      historyService.clearHistory();
      onClearHistory();
    }
  };

  return (
    <div className="min-h-full pb-20 bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-gray-900">
            {localization.t('history.title')}
          </h1>
          <p className="text-[11px] text-gray-500">
            {localization.t('history.subtitle')}
          </p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{localization.t('history.clear_all')}</span>
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {scans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs mt-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              🌿
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {localization.t('history.empty_title')}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {localization.t('history.empty_desc')}
            </p>
          </div>
        ) : (
          scans.map((scan) => {
            const scanDate = new Date(scan.timestamp);
            const isToday =
              new Date().toDateString() === scanDate.toDateString();

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-emerald-200 transition"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={scan.imageUri}
                    alt={localization.t('result.image_caption')}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                      {scan.crop}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {isToday
                        ? localization.t('home.today')
                        : scanDate.toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {scan.disease}
                  </h4>

                  <div className="flex items-center gap-2 mt-1">
                    {scan.isHealthy ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {localization.t('home.healthy_tag')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-700 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        🌱 {localization.t('treatment.organic_header')}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
