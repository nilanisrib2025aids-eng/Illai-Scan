import { localization } from './localizationService';

export class VoiceAssistantService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListeningState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Speaks the response text in the farmer's selected language
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = localization.getVoiceLangCode();
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang === langCode ||
        v.lang.startsWith(langCode.substring(0, 2)) ||
        v.lang.replace('_', '-').startsWith(langCode.substring(0, 2))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }

  /**
   * Speech Recognition in farmer's selected language
   */
  public startListening(
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return false;
    }

    try {
      this.stopListening();
      this.recognition = new SpeechRecognition();
      this.recognition.lang = localization.getVoiceLangCode();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListeningState = true;
      };

      this.recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const text = event.results[0][0].transcript;
          onResult(text);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListeningState = false;
        onError(event);
      };

      this.recognition.onend = () => {
        this.isListeningState = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListeningState = false;
      onError(e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
      this.isListeningState = false;
    }
  }

  public isListening(): boolean {
    return this.isListeningState;
  }

  /**
   * Grounded agricultural reasoning assistant responses in the selected language.
   * Leverages real Gemini AI if configured, otherwise uses verified agronomic database.
   */
  public async generateAgriculturalResponse(
    query: string,
    cropContext?: string,
    history?: { sender: 'user' | 'assistant'; text: string }[]
  ): Promise<string> {
    const { geminiAIService } = await import('./geminiAIService');
    if (geminiAIService.hasApiKey()) {
      const liveAiAnswer = await geminiAIService.askAgriculturalAssistant(query, cropContext, history);
      if (liveAiAnswer) return liveAiAnswer;
    }

    const lang = localization.getLanguage();
    const q = query.toLowerCase();

    // English responses
    if (lang === 'en') {
      if (q.includes('spot') || q.includes('black') || q.includes('blight') || q.includes('yellow')) {
        return 'For leaf spots or yellowing, check under the leaves first. Pinch off heavily infected leaves to stop fungal spread. You can spray 5% neem oil solution (50ml in 10 liters water) during cool morning hours. Avoid wetting leaves when watering.';
      }
      if (q.includes('neem') || q.includes('oil') || q.includes('spray')) {
        return 'To prepare neem spray: mix 50 ml of pure cold-pressed neem oil or NSKE with 10 liters of water. Add 10 grams of mild soap or kadhi soap so the oil mixes smoothly. Spray early morning on both sides of the leaves.';
      }
      if (q.includes('rice') || q.includes('paddy') || q.includes('blast')) {
        return 'For rice crop protection, do not overuse urea fertilizer. Spray fermented Panchagavya (300ml per 10 liters water) across the foliage and keep steady water level in the field.';
      }
      if (q.includes('curl') || q.includes('chilli') || q.includes('fly')) {
        return 'Leaf curling in chilli is usually caused by whiteflies or thrips. Install 12 yellow sticky traps per acre and spray Agniastra or garlic-chilli extract. Plant maize around your plot boundary as a living barrier.';
      }
      return 'I understand your concern for your crop. The best starting step is to inspect the leaf closely or take a photo using Scan Leaf. Organic remedies like neem spray, bio-fungicides like Trichoderma, and proper drainage help most common problems.';
    }

    // Tamil responses
    if (lang === 'ta') {
      if (q.includes('புள்ளி') || q.includes('மஞ்சள்') || q.includes('கருகல்') || q.includes('spot') || q.includes('blight')) {
        return 'இலைகளில் கருகல் அல்லது கருப்புப் புள்ளிகள் இருந்தால், பாதிக்கப்பட்ட கீழ் இலைகளை உடனடியாக கிள்ளி எடுத்து எரிக்கவும் அல்லது குழிதோண்டி புதைக்கவும். 10 லிட்டர் தண்ணீருக்கு 50 மிலி வேப்பெண்ணெய் கலந்து காலை வேளையில் தெளிக்கவும். இலைகளில் தண்ணீர் படாமல் வேருக்கு மட்டும் பாசனம் செய்யவும்.';
      }
      if (q.includes('வேப்ப') || q.includes('கரைசல்') || q.includes('neem')) {
        return 'வேப்பெண்ணெய் கரைசல் தயார் செய்ய: 10 லிட்டர் தண்ணீருக்கு 50 மில்லி வேப்பெண்ணெய் மற்றும் 10 கிராம் காதி சோப் சேர்த்து நன்கு கலக்கவும். இதனை அதிகாலை அல்லது மாலையில் இலைகளின் இருபுறமும் படுமாறு தெளிக்க வேண்டும்.';
      }
      if (q.includes('நெல்') || q.includes('குலை') || q.includes('paddy')) {
        return 'நெற்பயிரில் நோய் வராமல் தடுக்க அதிகப்படியான யூரியா உரம் இடுவதை தவிர்க்கவும். 10 லிட்டர் தண்ணீருக்கு 300 மிலி பஞ்சகவ்யா கலந்து பயிரில் தெளிக்கவும். வயலில் தண்ணீர் வற்றி விரிசல் விடாமல் சீராக வைக்கவும்.';
      }
      if (q.includes('மிளகாய்') || q.includes('சுருட்டல்') || q.includes('ஈ')) {
        return 'மிளகாயில் இலை சுருட்டல் வர காரணம் வெள்ளை ஈக்கள் ஆகும். ஏக்கருக்கு 12 மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும். அக்னி அஸ்திரம் அல்லது இஞ்சி-பூண்டு-பச்சைமிளகாய் கரைசல் தயாரித்து தெளிக்கவும். வரப்புகளில் மக்காச்சோளம் பயிரிட்டு தடுப்பு ஏற்படுத்தவும்.';
      }
      return 'உங்கள் பயிர் குறித்த கேள்வியை புரிந்துகொண்டேன். பாதிக்கப்பட்ட இலையை இலை ஸ்கேன் மூலம் படம் எடுத்து துல்லியமாக அறியலாம். வேப்பங்கொட்டை கரைசல், பஞ்சகவ்யா மற்றும் பாதிக்கப்பட்ட இலைகளை அகற்றுவது போன்ற இயற்கை முறைகள் மண்ணையும் பயிரையும் பாதுகாக்கும்.';
    }

    // Hindi responses
    if (lang === 'hi') {
      if (q.includes('धब्बे') || q.includes('पीली') || q.includes('झुलसा') || q.includes('spot')) {
        return 'पत्तियों पर काले या भूरे धब्बे दिखने पर संक्रमित निचली पत्तियों को तुरंत तोड़कर खेत से दूर दबा दें। 10 लीटर पानी में 50 मिली नीम का तेल मिलाकर सुबह के समय छिड़कें। पौधों की जड़ों में पानी दें, पत्तियों पर पानी न गिराएं।';
      }
      if (q.includes('नीम') || q.includes('काढ़ा') || q.includes('तेल')) {
        return 'नीम का छिड़काव तैयार करने के लिए: 10 लीटर पानी में 50 मिली नीम का तेल और थोड़ा सा साबुन घोल लें। इसे सुबह या शाम के समय पत्तियों के दोनों तरफ अच्छी तरह छिड़कें।';
      }
      return 'आपकी फसल की समस्या के लिए सबसे पहले संक्रमित पत्ती को स्कैन करें। नीम का घोल, ट्राइकोडर्मा और उचित जल प्रबंधन से अधिकांश बीमारियां बिना रासायनिक दवाओं के ठीक हो जाती हैं।';
    }

    // Telugu responses
    if (lang === 'te') {
      return 'మీ పంట సమస్యకు ముందుగా తెగులు సోకిన ఆకులను తొలగించండి. 10 లీటర్ల నీటిలో 50 మి.లీ వేపనూనె కలిపి ఉదయపు వేళల్లో పిచಿಕారీ చేయండి. ఆకులపై నీరు పడకుండా చూసుకోండి.';
    }

    // Kannada responses
    if (lang === 'kn') {
      return 'ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಗಳಲ್ಲಿ ರೋಗದ ಲಕ್ಷಣವಿದ್ದರೆ ಬಾಧಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ. 10 ಲೀಟರ್ ನೀರಿಗೆ 50 ಮಿಲಿ ಬೇವಿನೆಣ್ಣೆ ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ. ಹನಿ ನೀರಾವರಿ ಬಳಸಿ.';
    }

    // Malayalam responses
    if (lang === 'ml') {
      return 'ഇലകളിൽ കറുത്ത പുള്ളികൾ ഉണ്ടെങ്കിൽ ബാധിച്ച അടിയിലെ ഇലകൾ പറിച്ച് നശിപ്പിക്കുക. 10 ലിറ്റർ വെള്ളത്തിൽ 50 മില്ലി വേപ്പെണ്ണ മിശ്രിതം തളിക്കുക.';
    }

    return 'Please inspect your crop leaves and apply organic remedies like neem oil or trichoderma early.';
  }
}

export const voiceAssistantService = new VoiceAssistantService();
