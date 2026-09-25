import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  MapPin,
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle
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
  // Page mode: 'register' (Create Account) | 'login' (Sign In)
  const [mode, setMode] = useState<'register' | 'login'>(
    currentFarmer ? 'login' : 'register'
  );

  // Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('Tamil Nadu');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPrimaryCrop, setRegPrimaryCrop] = useState('Banana');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Success / Notification State
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Account Creation
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessBanner(null);

    if (!regUsername.trim()) {
      setErrorMsg('Please enter a username');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
      return;
    }

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    const res = authService.register({
      username: regUsername,
      password: regPassword,
      name: regName,
      phone: regPhone,
      state: regState,
      district: regDistrict,
      primaryCrop: regPrimaryCrop
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed');
      return;
    }

    // REQUIREMENT: Redirect to the login page to verify username & password
    setLoginUsername(regUsername.trim());
    setLoginPassword('');
    setSuccessBanner(
      `Account created successfully! Your Farmer ID is ${res.profile?.farmerId}. Please sign in with your username and password below.`
    );
    setMode('login');
  };

  // Handle Login & Verification
  const handleVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = authService.verifyCredentials(loginUsername, loginPassword);

    if (!res.success || !res.profile) {
      setErrorMsg(res.error || 'Invalid username or password');
      return;
    }

    // Successful authentication
    onSuccess(res.profile);
    onBackToHome();
  };

  const handleLogout = () => {
    authService.logout();
    setSuccessBanner(null);
    setErrorMsg('');
    setMode('login');
  };

  return (
    <div className="min-h-full pb-20 bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
        {currentFarmer ? (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>Back to Farm</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-black tracking-tight text-gray-900">
              ILAI SCAN
            </span>
          </div>
        )}

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          Kisan Auth Portal
        </span>
      </div>

      <div className="p-4 flex-1 max-w-md mx-auto w-full space-y-4">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-700/60 rounded-xl text-emerald-200">
                <Sprout className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                Farmer Verification System
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight leading-snug">
              {currentFarmer
                ? `Namaste, ${currentFarmer.name}`
                : mode === 'register'
                ? 'Create Farmer Account'
                : 'Sign In to Your Account'}
            </h1>
            <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
              {currentFarmer
                ? `Logged in as ${currentFarmer.farmerId}. Manage your account below.`
                : mode === 'register'
                ? 'Create a secure username & password to protect your field history and diagnostic results.'
                : 'Enter your registered username and password to access your field data.'}
            </p>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* LOGGED IN FARMER PROFILE CARD */}
        {currentFarmer ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Digital Kisan Pass
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  ✓ Verified
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
                  <span className="text-[10px] text-gray-500 block">Username</span>
                  <span className="font-bold text-gray-900">@{currentFarmer.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Farmer Name</span>
                  <span className="font-bold text-gray-900">{currentFarmer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Mobile</span>
                  <span className="font-semibold text-gray-800">{currentFarmer.phone}</span>
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
                className="py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Go to Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="py-3 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* AUTH FORMS CONTAINER */
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4">
            {/* Top Navigation Switch: Create Account vs Sign In */}
            <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessBanner(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Notification Alerts */}
            {successBanner && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="font-medium leading-relaxed">{successBanner}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in shadow-xs">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1 font-semibold leading-relaxed">
                  {errorMsg}
                </div>
              </div>
            )}

            {/* 1. CREATE AN ACCOUNT PAGE */}
            {mode === 'register' ? (
              <form onSubmit={handleCreateAccount} className="space-y-3.5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Choose Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. ramesh_farmer or kisan2026"
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Choose Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Farmer Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar / ரமேஷ் குமார்"
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* State & Crop in 2 columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      State / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3.5 pointer-events-none" />
                      <select
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
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
                      Primary Crop
                    </label>
                    <div className="relative">
                      <Sprout className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3.5 pointer-events-none" />
                      <select
                        value={regPrimaryCrop}
                        onChange={(e) => setRegPrimaryCrop(e.target.value)}
                        className="w-full pl-8 pr-2 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-gray-50/50 appearance-none"
                      >
                        {COMMON_CROPS.map((cr) => (
                          <option key={cr} value={cr}>
                            {cr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* District (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    District / Taluk <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    placeholder="e.g. Thanjavur, Mandya, Guntur"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-gray-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Create Account & Continue to Sign In</span>
                </button>

                <p className="text-center text-[11px] text-gray-500 mt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </p>
              </form>
            ) : (
              /* 2. LOGIN PAGE WHICH VERIFIES USERNAME & PASSWORD */
              <form onSubmit={handleVerifyLogin} className="space-y-4 py-1">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Username or Farmer ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter your username or Farmer ID"
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-gray-50/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>
                    Signing in securely verifies your credentials and loads your personalized leaf diagnoses and crop history.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span>Verify Credentials & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[11px] text-gray-500 mt-2">
                  New farmer?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setSuccessBanner(null);
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
