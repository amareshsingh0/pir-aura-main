import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const useVoiceCommands = (onCommand: (command: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .toLowerCase();

      if (transcript.includes("hey motion") || transcript.includes("hey motion sensor")) {
        onCommand("hey motion");
      } else if (transcript.includes("test") || transcript.includes("check")) {
        onCommand("test");
      } else if (transcript.includes("clear") || transcript.includes("reset")) {
        onCommand("clear");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand]);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not available");
      return;
    }
    try {
      if (!isListening) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error: any) {
      console.error("Failed to start listening:", error);
      setIsListening(false);
      if (error.name === "not-allowed") {
        toast.error("Microphone permission denied");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error("Failed to stop listening:", error);
        setIsListening(false);
      }
    }
  };

  return { isListening, startListening, stopListening };
};

export const speak = (text: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }
};

