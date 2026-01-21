/**
 * TTS Service - Frontend Voice Integration
 * 
 * Abstracts text-to-speech for interview questions.
 * Uses backend Indic Parler-TTS model for high-quality Indian language TTS.
 * Falls back to browser TTS if backend unavailable.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Voice presets available from backend
export const VOICE_PRESETS = {
    interviewer: "interviewer",
    female_professional: "female_professional",
    male_professional: "male_professional",
    female_friendly: "female_friendly",
    male_calm: "male_calm",
} as const;

export type VoicePreset = keyof typeof VOICE_PRESETS;

// Audio state
let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

/**
 * Check if Indic Parler-TTS is available on backend
 */
export async function checkTTSStatus(): Promise<{
    available: boolean;
    model: string | null;
}> {
    try {
        const res = await fetch(`${API_BASE}/api/interview/tts-status`);
        if (res.ok) {
            return await res.json();
        }
        return { available: false, model: null };
    } catch {
        return { available: false, model: null };
    }
}

/**
 * Speak text using Indic Parler-TTS (backend)
 * Falls back to browser TTS if unavailable
 */
export async function speak(
    text: string,
    options: {
        language?: string;
        voicePreset?: VoicePreset;
        token?: string | null;
        onStart?: () => void;
        onEnd?: () => void;
        onError?: (error: Error) => void;
    } = {}
): Promise<void> {
    const {
        language = "en",
        voicePreset = "interviewer",
        token,
        onStart,
        onEnd,
        onError,
    } = options;

    // Stop any current audio
    stopSpeaking();

    try {
        onStart?.();

        // Try backend TTS first
        if (token) {
            const success = await speakWithBackend(text, language, token);
            if (success) {
                onEnd?.();
                return;
            }
        }

        // Fallback to browser TTS
        await speakWithBrowser(text, language);
        onEnd?.();
    } catch (error) {
        console.error("[TTS] Error:", error);
        onError?.(error as Error);

        // Try browser fallback on backend failure
        try {
            await speakWithBrowser(text, language);
            onEnd?.();
        } catch (browserError) {
            onError?.(browserError as Error);
        }
    }
}

/**
 * Speak using backend Indic Parler-TTS
 * Speaker is automatically selected based on language
 */
async function speakWithBackend(
    text: string,
    language: string,
    token: string
): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/interview/speak`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                text,
                language,
            }),
        });

        if (!res.ok) {
            console.warn("[TTS] Backend TTS failed:", res.status);
            return false;
        }

        const data = await res.json();

        // Play base64 audio
        await playBase64Audio(data.audio_base64);
        return true;
    } catch (error) {
        console.error("[TTS] Backend error:", error);
        return false;
    }
}

/**
 * Play base64-encoded WAV audio
 */
function playBase64Audio(base64: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        currentAudio = audio;
        isPlaying = true;

        audio.onended = () => {
            isPlaying = false;
            currentAudio = null;
            resolve();
        };

        audio.onerror = (e) => {
            isPlaying = false;
            currentAudio = null;
            reject(new Error("Audio playback failed"));
        };

        audio.play().catch(reject);
    });
}

/**
 * Speak using browser's built-in TTS (fallback)
 * Tries to select the best available voice for natural speech
 */
function speakWithBrowser(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
            reject(new Error("Browser TTS not supported"));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Map language codes to BCP 47
        const langMap: Record<string, string> = {
            en: "en-IN",
            hi: "hi-IN",
            ta: "ta-IN",
            te: "te-IN",
            bn: "bn-IN",
            mr: "mr-IN",
            kn: "kn-IN",
            ml: "ml-IN",
            gu: "gu-IN",
            pa: "pa-IN",
        };

        const targetLang = langMap[language] || "en-IN";
        utterance.lang = targetLang;

        // Try to find a good voice - prefer female voices for interviewer
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Priority: 1) Google voices, 2) Microsoft voices, 3) Any matching language
            const preferredVoice = voices.find(v =>
                v.lang.startsWith(targetLang.split("-")[0]) &&
                (v.name.includes("Google") || v.name.includes("Microsoft"))
            ) || voices.find(v =>
                v.lang.startsWith(targetLang.split("-")[0])
            ) || voices.find(v =>
                v.lang.startsWith("en") && v.name.includes("Google")
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }

        // Natural speech settings
        utterance.rate = 0.95;  // Slightly slower for clarity
        utterance.pitch = 1.05; // Slightly higher for professional tone
        utterance.volume = 1.0;

        utterance.onend = () => {
            isPlaying = false;
            resolve();
        };

        utterance.onerror = (e) => {
            isPlaying = false;
            reject(new Error(`Speech synthesis failed: ${e.error}`));
        };

        isPlaying = true;

        // Chrome bug workaround: voices may not be loaded immediately
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.speak(utterance);
            };
        } else {
            window.speechSynthesis.speak(utterance);
        }
    });
}

/**
 * Stop any currently playing audio
 */
export function stopSpeaking(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    isPlaying = false;
}

/**
 * Check if audio is currently playing
 */
export function isSpeaking(): boolean {
    return isPlaying;
}

// ==========================================
// SPEECH RECOGNITION (STT) - Voice Input
// ==========================================

type SpeechRecognitionCallback = (transcript: string, isFinal: boolean) => void;

let recognition: any = null;
let isListening = false;

/**
 * Check if browser speech recognition is available
 */
export function isSpeechRecognitionAvailable(): boolean {
    return !!(
        typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
}

/**
 * Start listening for voice input
 */
export function startListening(
    options: {
        language?: string;
        onResult: SpeechRecognitionCallback;
        onEnd?: () => void;
        onError?: (error: Error) => void;
    }
): void {
    const { language = "en-IN", onResult, onEnd, onError } = options;

    if (!isSpeechRecognitionAvailable()) {
        onError?.(new Error("Speech recognition not supported"));
        return;
    }

    // Stop any existing recognition
    stopListening();

    const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognition = new SpeechRecognitionCtor();

    // Map language codes
    const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-IN",
        mr: "mr-IN",
    };

    recognition.lang = langMap[language] || language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        onResult(transcript, isFinal);
    };

    recognition.onend = () => {
        isListening = false;
        onEnd?.();
    };

    recognition.onerror = (event: any) => {
        isListening = false;

        // Provide user-friendly error messages
        let errorMessage = `Recognition error: ${event.error}`;
        if (event.error === "network") {
            errorMessage = "Speech recognition requires internet connection. Please check your network or type your answer instead.";
        } else if (event.error === "not-allowed") {
            errorMessage = "Microphone access denied. Please allow microphone permission.";
        } else if (event.error === "no-speech") {
            errorMessage = "No speech detected. Please try speaking again.";
        }

        onError?.(new Error(errorMessage));
    };

    recognition.start();
    isListening = true;
}

/**
 * Stop listening
 */
export function stopListening(): void {
    if (recognition) {
        try {
            recognition.stop();
        } catch { }
        recognition = null;
    }
    isListening = false;
}

/**
 * Check if currently listening
 */
export function isCurrentlyListening(): boolean {
    return isListening;
}

// ==========================================
// EXPORTS
// ==========================================
export default {
    speak,
    stopSpeaking,
    isSpeaking,
    checkTTSStatus,
    startListening,
    stopListening,
    isSpeechRecognitionAvailable,
    isCurrentlyListening,
    VOICE_PRESETS,
};
