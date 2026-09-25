import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Lock,
  LogOut
} from 'lucide-react';
import { authService } from '../services/authService';
import type { FarmerProfile } from '../types';

interface LoginPageProps {
  currentFarmer: FarmerProfile | null;
  onSuccess: (farmer: FarmerProfile) => void;
  onBackToHome: () => void;
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

export const LoginPage: React.FC<LoginPageProps> = ({
  currentFarmer,
  onSuccess,
  onBackToHome
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(
    currentFarmer ? 'login' : 'register'
  );
  const [createdProfile, setCreatedProfile] = useState<FarmerProfile | null>(null);

  // Registration State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Banana');

  // Sign In State
  const [loginIdOrPhone, setLoginIdOrPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    onSuccess(newProfile);
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
      onBackToHome();
    } else {
      setErrorMsg('No farmer profile found with this ID or Mobile. Please register below.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCreatedProfile(null);
    setActiveTab('register');
  };

  return (
    <div className="min-h-full pb-20 bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>Back to Farm</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          Kisan ID Portal
        </span>
      </div>

      <div className="p-4 flex-1 max-w-md mx-auto w-full space-y-4">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-700/60 rounded-xl text-emerald-200">
                <Sprout className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                Official Farmer Identity Pass
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight leading-snug">
              {currentFarmer
                ? `Namaste, ${currentFarmer.name}`
                : 'Digital Farmer Registration'}
            </h1>
            <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
              {currentFarmer
                ? `Your active Kisan ID is linked to your field scan records.`
                : 'Create your unique Kisan User ID to save leaf disease history, get crop remedies, and sync diagnostics.'}
            </p>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* ACTIVE PROFILE VIEW (if logged in and not registering new) */}
        {currentFarmer && !createdProfile ? (
          <div className="space-y-4">
            {/* Digital ID Pass Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Digital Kisan Card
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  ✓ Active
                </span>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">
                  Permanent Farmer User ID
                </div>
                <div className="text-2xl font-black text-emerald-900 font-mono tracking-wider mt-0.5">
                  {currentFarmer.farmerId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Farmer Name</span>
                  <span className="font-bold text-gray-900">{currentFarmer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Mobile Number</span>
                  <span className="font-bold text-gray-900">{currentFarmer.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Region / State</span>
                  <span className="font-semibold text-gray-800">
                    {currentFarmer.district ? `${currentFarmer.district}, ` : ''}{currentFarmer.state}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Primary Crop</span>
                  <span className="font-bold text-emerald-800">{currentFarmer.primaryCrop}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onBackToHome}
                className="py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Go to Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="py-3 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : createdProfile ? (
          /* JUST CREATED SUCCESS CARD */
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-100 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Farmer ID Created Successfully!
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Your profile is active and saved to your device
              </p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-left space-y-2">
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Your Digital Kisan ID
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono tracking-wider">
                {createdProfile.farmerId}
              </div>
              <div className="text-xs text-gray-600 pt-1 border-t border-emerald-200">
                Farmer: <strong>{createdProfile.name}</strong> • Crop: <strong>{createdProfile.primaryCrop}</strong>
              </div>
            </div>

            <button
              onClick={onBackToHome}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <span>Continue to Leaf Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* REGISTRATION / LOGIN FORM CARD */
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition ${
                  activeTab === 'register'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create New Farmer ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition ${
                  activeTab === 'login'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In with ID
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {activeTab === 'register' ? (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Farmer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar / ரமேஷ் குமார்"
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    State / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    District / Taluk <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Thanjavur, Mandya, Guntur"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Main Crop Grown
                  </label>
                  <div className="relative">
                    <Sprout className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
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
                  className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
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
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={loginIdOrPhone}
                      onChange={(e) => setLoginIdOrPhone(e.target.value)}
                      placeholder="e.g. TN-FARM-8291 or 9876543210"
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50 uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    Signing in keeps your crop scan records organized and enables tailored organic solutions.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
