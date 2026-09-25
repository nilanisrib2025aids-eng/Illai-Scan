import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/authService';
import type { FarmerProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (farmer: FarmerProfile) => void;
}

const INDIAN_STATES = [
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Gujarat',
  'Madhya Pradesh',
  'Bihar',
  'West Bengal',
  'Rajasthan',
  'Odisha'
];

const COMMON_CROPS = [
  'Banana',
  'Paddy / Rice',
  'Tomato',
  'Potato',
  'Cotton',
  'Chilli',
  'Brinjal',
  'Groundnut',
  'Sugarcane',
  'Maize'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [createdProfile, setCreatedProfile] = useState<FarmerProfile | null>(null);

  // Registration Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Banana');

  // Login Form State
  const [loginIdOrPhone, setLoginIdOrPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter farmer name');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    const newProfile = authService.register({
      name,
      phone,
      state,
      district,
      primaryCrop
    });

    setCreatedProfile(newProfile);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdOrPhone.trim()) {
      setErrorMsg('Please enter your Farmer ID or registered Mobile number');
      return;
    }

    const found = authService.loginWithFarmerId(loginIdOrPhone);
    if (found) {
      onSuccess(found);
      onClose();
    } else {
      setErrorMsg('No farmer profile found with this ID / Phone. Please create a new ID.');
    }
  };

  const handleDoneCreated = () => {
    if (createdProfile) {
      onSuccess(createdProfile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-5 py-5 text-white relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-700/60 rounded-xl text-emerald-200">
              <Sprout className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
              Kisan Portal
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight">
            {createdProfile
              ? 'Farmer ID Generated!'
              : mode === 'register'
              ? 'Create Farmer User ID'
              : 'Sign In to Your Farm'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {createdProfile
              ? 'Save your unique Farmer ID for crop health records'
              : mode === 'register'
              ? 'Free digital farmer identification & instant AI leaf scan'
              : 'Enter your Farmer ID or mobile number to continue'}
          </p>

          {!createdProfile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-emerald-200 hover:text-white text-xs bg-emerald-900/40 hover:bg-emerald-900/60 px-2.5 py-1 rounded-full transition"
            >
              Skip
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* SUCCESS SCREEN: Shows the generated Farmer ID badge */}
          {createdProfile ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Welcome, {createdProfile.name}!
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your official digital Kisan Pass is active
                </p>
              </div>

              {/* Farmer ID Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 text-left shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Farmer ID Card
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-gray-500 font-medium">Digital Farmer ID</div>
                  <div className="text-lg font-black text-emerald-900 font-mono tracking-wider">
                    {createdProfile.farmerId}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/40 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Mobile</span>
                    <span className="font-semibold text-gray-800">{createdProfile.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Region</span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {createdProfile.district ? `${createdProfile.district}, ` : ''}{createdProfile.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Primary Crop</span>
                    <span className="font-semibold text-emerald-800">{createdProfile.primaryCrop}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Service</span>
                    <span className="font-semibold text-gray-800">Gemini AI Scan</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 text-left border border-amber-200/70 text-[11px] text-amber-900">
                💡 <strong>Tip:</strong> Take a screenshot or note down <strong>{createdProfile.farmerId}</strong> to easily sign in anytime.
              </div>

              <button
                onClick={handleDoneCreated}
                className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Continue to Leaf Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector: Register vs Login */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    mode === 'register'
                      ? 'bg-white text-emerald-900 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create New ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    mode === 'login'
                      ? 'bg-white text-emerald-900 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In with ID
                </button>
              </div>

              {errorMsg && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* REGISTRATION FORM */}
              {mode === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* Farmer Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Farmer Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar / ரமேஷ்"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* State / Province */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      State / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* District / Village (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      District / Taluk <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Thanjavur, Madurai, Mandya"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                    />
                  </div>

                  {/* Main Crop */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Main Crop Cultivated
                    </label>
                    <div className="relative">
                      <Sprout className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                      <select
                        value={primaryCrop}
                        onChange={(e) => setPrimaryCrop(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
                      >
                        {COMMON_CROPS.map((cr) => (
                          <option key={cr} value={cr}>
                            {cr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generate My Farmer ID</span>
                  </button>
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Farmer ID or Registered Mobile
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={loginIdOrPhone}
                        onChange={(e) => setLoginIdOrPhone(e.target.value)}
                        placeholder="e.g. TN-FARM-8291 or 9876543210"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      Logging in syncs your field scan history, organic remedies, and voice assistant settings.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                  >
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
