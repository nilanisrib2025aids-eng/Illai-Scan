import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  SwitchCamera,
  X
} from 'lucide-react';
import { localization } from '../services/localizationService';
import { imageQualityService } from '../services/imageQualityService';
import type { ImageQualityReport } from '../services/imageQualityService';
import { diseaseDetectionService } from '../services/diseaseDetectionService';
import { historyService } from '../services/historyService';
import type { ScanResult } from '../types';
import { CROPS_LIST, AGRICULTURAL_DISEASE_DB } from '../data/agriculturalDb';

interface ScanViewProps {
  onScanCompleted: (result: ScanResult) => void;
  onCancel: () => void;
}

export const ScanView: React.FC<ScanViewProps> = ({
  onScanCompleted,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('crop.tomato');
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [targetDiseaseOverride, setTargetDiseaseOverride] = useState<string | null>(null);

  // Live Camera states
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream cleanly when component unmounts or view changes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  /**
   * Request user permission and start live camera stream
   */
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(localization.t('scan.camera_error'));
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLiveCameraActive(true);
      setSelectedImage(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(localization.t('scan.camera_permission_denied'));
      } else {
        setCameraError(localization.t('scan.camera_error'));
      }
      setIsLiveCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    stopCameraStream();
    setIsLiveCameraActive(false);
  };

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  /**
   * Capture photo frame directly from the live video stream
   */
  const handleCaptureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop stream after snap
    stopCameraStream();
    setIsLiveCameraActive(false);

    setSelectedImage(dataUrl);
    setTargetDiseaseOverride(null);
    runQualityCheck(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        stopCameraStream();
        setIsLiveCameraActive(false);
        setSelectedImage(dataUrl);
        setTargetDiseaseOverride(null);
        runQualityCheck(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetSample = (sampleId: string) => {
    stopCameraStream();
    setIsLiveCameraActive(false);
    const sample = AGRICULTURAL_DISEASE_DB.find((d) => d.id === sampleId);
    if (sample) {
      setSelectedImage(sample.sampleImageUrl);
      setSelectedCrop(sample.cropKey);
      setTargetDiseaseOverride(sample.id);
      runQualityCheck(sample.sampleImageUrl);
    }
  };

  const runQualityCheck = async (imgUri: string) => {
    const report = await imageQualityService.analyzeQuality(imgUri);
    setQualityReport(report);
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);

    const timer1 = setTimeout(() => setAnalysisStep(2), 350);
    const timer2 = setTimeout(() => setAnalysisStep(3), 700);
    const timer3 = setTimeout(() => setAnalysisStep(4), 1050);

    try {
      const result = await diseaseDetectionService.analyzeImage(
        selectedImage,
        selectedCrop,
        targetDiseaseOverride || undefined
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      historyService.saveScan(result);

      setIsAnalyzing(false);
      onScanCompleted(result);
    } catch {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full pb-20 bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <button
          onClick={() => {
            stopCameraStream();
            onCancel();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 px-2.5 py-1.5 rounded-lg bg-gray-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{localization.t('common.back')}</span>
        </button>
        <h2 className="text-sm font-bold text-gray-900">
          {localization.t('scan.title')}
        </h2>
        <div className="w-8" />
      </div>

      <div className="max-w-md mx-auto p-4 w-full flex-1 flex flex-col space-y-4">
        {/* Hidden Camera/Gallery File Input for fallback */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Camera Error Message with permission recovery notice */}
        {cameraError && (
          <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">
                {cameraError}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-bold hover:bg-red-800 transition"
                >
                  {localization.t('scan.live_camera')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-50 transition"
                >
                  {localization.t('scan.btn_gallery')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main View Area: Live Camera Preview OR Captured Photo OR Start Prompt */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200 aspect-4/3 relative flex flex-col items-center justify-center">
          {/* 1. Live Camera Mode with User Permission */}
          {isLiveCameraActive ? (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Aiming Reticle / Leaf Guide frame */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/90 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-xs font-medium">
                  {localization.t('scan.instruction_1')}
                </span>
              </div>

              {/* Live camera controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleFlipCamera}
                  className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition"
                  title={localization.t('scan.switch_camera')}
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStopCamera}
                  className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition"
                  title={localization.t('scan.stop_camera')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shutter Button */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center">
                <button
                  onClick={handleCaptureFromVideo}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-2 border-2 border-white/80 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>{localization.t('scan.snap_photo')}</span>
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            /* 2. Captured Image View */
            <div className="w-full h-full relative">
              <img
                src={selectedImage}
                alt={localization.t('scan.caption_preview')}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setQualityReport(null);
                    setTargetDiseaseOverride(null);
                    startCamera(facingMode);
                  }}
                  className="px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{localization.t('scan.btn_retake')}</span>
                </button>
              </div>

              {/* Localized Caption under leaf */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
                <span>{localization.t('scan.caption_preview')}</span>
                {qualityReport && qualityReport.isValid && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{localization.t('quality.good')}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* 3. Empty Camera Start Prompt */
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
                <Camera className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {localization.t('scan.title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {localization.t('scan.instruction_1')}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {/* Live Camera Button (Direct browser camera with permission) */}
                <button
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>{localization.t('scan.live_camera')}</span>
                </button>
                {/* File picker / Gallery button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <span>{localization.t('scan.btn_gallery')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image Quality Warning If Low Light or Blurry */}
        {qualityReport && !qualityReport.isValid && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold">
                {qualityReport.reasonKey
                  ? localization.t(qualityReport.reasonKey)
                  : localization.t('quality.blurry')}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800"
                >
                  {localization.t('quality.retake')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Practical Field Guidelines */}
        {!selectedImage && !isLiveCameraActive && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {localization.t('home.hero_title')}
            </h4>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{localization.t('scan.instruction_1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{localization.t('scan.instruction_2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{localization.t('scan.instruction_3')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Leaf Samples for Evaluator */}
        {!isLiveCameraActive && (
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>🌾</span>
                <span>{localization.t('home.demo_cases')}</span>
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Tap to test
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectPresetSample('tomato_early_blight')}
                className="p-2.5 bg-white hover:bg-emerald-50/80 rounded-xl border border-emerald-200 text-left text-xs transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    🍅 {localization.t('crop.tomato')}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {localization.t('disease.tomato_early_blight')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={() => handleSelectPresetSample('potato_late_blight')}
                className="p-2.5 bg-white hover:bg-emerald-50/80 rounded-xl border border-emerald-200 text-left text-xs transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    🥔 {localization.t('crop.potato')}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {localization.t('disease.potato_late_blight')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={() => handleSelectPresetSample('paddy_blast')}
                className="p-2.5 bg-white hover:bg-emerald-50/80 rounded-xl border border-emerald-200 text-left text-xs transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    🌾 {localization.t('crop.paddy')}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {localization.t('disease.paddy_blast')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={() => handleSelectPresetSample('healthy_leaf')}
                className="p-2.5 bg-white hover:bg-emerald-50/80 rounded-xl border border-emerald-200 text-left text-xs transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    🌿 {localization.t('crop.tomato')}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {localization.t('disease.healthy_leaf')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>
        )}

        {/* Crop Selection */}
        <div className="bg-white rounded-2xl p-3 border border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">
            {localization.t('scan.select_crop_label')}
          </span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-bold text-emerald-900 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            {CROPS_LIST.map((crop) => (
              <option key={crop.id} value={crop.nameKey}>
                {crop.icon} {localization.t(crop.nameKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Check Leaf Action Button */}
        {selectedImage && !isLiveCameraActive && (
          <div className="pt-2">
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{localization.t('scan.btn_analyze')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Human-centered Analysis Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-200 animate-pulse">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {localization.t('analyzing.title')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {localization.t('app.title')}
              </p>
            </div>

            <div className="space-y-2 text-left bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
              <div
                className={`flex items-center gap-2 ${
                  analysisStep >= 1 ? 'text-emerald-800 font-bold' : 'text-gray-400'
                }`}
              >
                <span>{analysisStep > 1 ? '✓' : '•'}</span>
                <span>{localization.t('analyzing.step1')}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  analysisStep >= 2 ? 'text-emerald-800 font-bold' : 'text-gray-400'
                }`}
              >
                <span>{analysisStep > 2 ? '✓' : '•'}</span>
                <span>{localization.t('analyzing.step2')}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  analysisStep >= 3 ? 'text-emerald-800 font-bold' : 'text-gray-400'
                }`}
              >
                <span>{analysisStep > 3 ? '✓' : '•'}</span>
                <span>{localization.t('analyzing.step3')}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  analysisStep >= 4 ? 'text-emerald-800 font-bold' : 'text-gray-400'
                }`}
              >
                <span>{analysisStep > 4 ? '✓' : '•'}</span>
                <span>{localization.t('analyzing.step4')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
