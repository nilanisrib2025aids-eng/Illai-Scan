import React from 'react';
import { HelpCircle, PhoneCall, MapPin, CheckCircle2 } from 'lucide-react';
import { localization } from '../services/localizationService';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5 text-emerald-800" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {localization.t('help.title')}
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
          {/* Emergency helpline banner */}
          <div className="bg-emerald-800 text-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                Kisan Helpline
              </div>
              <div className="text-sm font-bold">
                {localization.t('help.emergency_call')}
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{localization.t('help.faq_title')}</span>
            </h3>

            {/* Q1 */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-1">
                {localization.t('help.q1')}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {localization.t('help.a1')}
              </p>
            </div>

            {/* Q2 */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-950 mb-1">
                {localization.t('help.q2')}
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {localization.t('help.a2')}
              </p>
            </div>

            {/* Q3 */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-1">
                {localization.t('help.q3')}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {localization.t('help.a3')}
              </p>
            </div>
          </div>

          {/* Nearest KVK link */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-amber-700 shrink-0" />
            <span className="text-xs font-semibold text-amber-900">
              {localization.t('help.contact_kvk')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition"
          >
            {localization.t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
