import { useRef, useState } from "react";
import WavEncoder from "wav-encoder";


export const useAudioRecording = () => {
  const [recording, setRecording] = useState(false);
  const audioData = useRef<Float32Array[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    audioContextRef.current = context;

    const source = context.createMediaStreamSource(stream);
    sourceRef.current = source;

    const processor = context.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      audioData.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };

    source.connect(processor);
    processor.connect(context.destination);
    setRecording(true);
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    setRecording(false);
  };

  const getAudioBlob = async (): Promise<Blob> => {
    const flat = Float32Array.from(audioData.current.flat());
    const wavBuffer = {
      sampleRate: audioContextRef.current?.sampleRate ?? 44100,
      channelData: [flat],
    };

    const buffer = await WavEncoder.encode(wavBuffer);
    return new Blob([buffer], { type: 'audio/wav' });
  };

  return { recording, startRecording, stopRecording, getAudioBlob };
};
