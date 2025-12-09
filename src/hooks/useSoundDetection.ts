import { useState, useEffect, useRef } from "react";

export const useSoundDetection = (onClap: () => void) => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isListening) return;

    const startListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        microphoneRef.current = microphone;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let lastClapTime = 0;
        const detectClap = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

          // Clap detection threshold
          if (average > 100) {
            const now = Date.now();
            if (now - lastClapTime > 500) {
              // Prevent multiple triggers
              lastClapTime = now;
              onClap();
            }
          }

          if (isListening) {
            requestAnimationFrame(detectClap);
          }
        };

        detectClap();
      } catch (error) {
        console.error("Microphone access denied:", error);
        setIsListening(false);
      }
    };

    startListening();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening, onClap]);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return { isListening, toggleListening };
};











