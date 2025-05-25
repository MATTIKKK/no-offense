import { useState, useRef } from 'react';
import { WaveFile } from 'wavefile';

export const useAudioRecording = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/wav', // или 'audio/webm' как fallback
    });
    mediaRecorderRef.current = recorder;
    chunks.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          setRecording(false);
          resolve();
        };
        mediaRecorderRef.current.stop();
      }
    });
  };

  const getAudioBlob = async (): Promise<Blob> => {
    const fullBlob = new Blob(chunks.current, { type: 'audio/webm' });
    const buffer = await fullBlob.arrayBuffer();

    // Декодируем в аудио данные
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(buffer);
    const channel = decoded.getChannelData(0);

    // Конвертируем в Int16
    const int16 = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      const s = Math.max(-1, Math.min(1, channel[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Генерация WAV файла с wavefile
    const wav = new WaveFile();
    wav.fromScratch(1, decoded.sampleRate, '16', int16);
    const wavBuffer = wav.toBuffer();

    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  return { recording, startRecording, stopRecording, getAudioBlob };
};
