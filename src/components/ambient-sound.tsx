"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Waves } from "lucide-react";

type AmbientHandle = {
  context: AudioContext;
  master: GainNode;
  stop: () => void;
};

const STORAGE_KEY = "saptambu-ambient-sound-muted";
const MASTER_VOLUME = 0.28;

function createNoiseBuffer(context: AudioContext) {
  const duration = 8;
  const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);

  for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
    const channel = buffer.getChannelData(channelIndex);
    let last = 0;

    for (let index = 0; index < channel.length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + white * 0.035) / 1.035;
      channel[index] = last * 2.9;
    }
  }

  return buffer;
}

function addDroneVoice(context: AudioContext, destination: AudioNode, frequency: number, detune = 0) {
  const voiceGain = context.createGain();
  voiceGain.gain.value = 0.026;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 820;
  filter.Q.value = 0.7;

  const oscillator = context.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  oscillator.detune.value = detune;

  oscillator.connect(filter);
  filter.connect(voiceGain);
  voiceGain.connect(destination);
  oscillator.start();

  return oscillator;
}

function createAmbientSound(): AmbientHandle {
  const AudioContextConstructor =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("Web Audio is not supported in this browser.");
  }

  const context = new AudioContextConstructor();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const stopNodes: AudioScheduledSourceNode[] = [];
  const timers = new Set<number>();

  const riverSource = context.createBufferSource();
  riverSource.buffer = createNoiseBuffer(context);
  riverSource.loop = true;

  const riverHighpass = context.createBiquadFilter();
  riverHighpass.type = "highpass";
  riverHighpass.frequency.value = 80;

  const riverLowpass = context.createBiquadFilter();
  riverLowpass.type = "lowpass";
  riverLowpass.frequency.value = 920;
  riverLowpass.Q.value = 0.9;

  const riverMovement = context.createOscillator();
  riverMovement.frequency.value = 0.045;
  const riverMovementGain = context.createGain();
  riverMovementGain.gain.value = 280;
  riverMovement.connect(riverMovementGain);
  riverMovementGain.connect(riverLowpass.frequency);

  const riverGain = context.createGain();
  riverGain.gain.value = 0.18;

  riverSource.connect(riverHighpass);
  riverHighpass.connect(riverLowpass);
  riverLowpass.connect(riverGain);
  riverGain.connect(master);
  riverSource.start();
  riverMovement.start();
  stopNodes.push(riverSource, riverMovement);

  const droneGain = context.createGain();
  droneGain.gain.value = 0.72;
  droneGain.connect(master);

  [136.1, 204.15, 272.2, 408.3].forEach((frequency, index) => {
    stopNodes.push(addDroneVoice(context, droneGain, frequency, index % 2 === 0 ? -4 : 3));
  });

  const ringTempleBell = () => {
    if (context.state === "closed") return;

    const now = context.currentTime;
    const bellGain = context.createGain();
    bellGain.gain.setValueAtTime(0.0001, now);
    bellGain.gain.exponentialRampToValueAtTime(0.052, now + 0.04);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
    bellGain.connect(master);

    [544, 816, 1088].forEach((frequency, index) => {
      const bell = context.createOscillator();
      bell.type = "sine";
      bell.frequency.setValueAtTime(frequency, now);
      bell.detune.setValueAtTime(index * 4, now);
      bell.connect(bellGain);
      bell.start(now);
      bell.stop(now + 4.35);
    });

    const timer = window.setTimeout(ringTempleBell, 14_000 + Math.random() * 10_000);
    timers.add(timer);
  };

  const firstBellTimer = window.setTimeout(ringTempleBell, 5_500 + Math.random() * 4_000);
  timers.add(firstBellTimer);

  master.gain.setTargetAtTime(MASTER_VOLUME, context.currentTime, 1.4);

  return {
    context,
    master,
    stop: () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      stopNodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // The node may have already stopped while the ambient bed was fading out.
        }
      });
      void context.close();
    },
  };
}

export function AmbientSound() {
  const handleRef = useRef<AmbientHandle | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  const stopAmbient = useCallback(() => {
    const handle = handleRef.current;
    if (!handle) {
      setPlaying(false);
      return;
    }

    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    handle.master.gain.cancelScheduledValues(handle.context.currentTime);
    handle.master.gain.setTargetAtTime(0.0001, handle.context.currentTime, 0.45);
    stopTimerRef.current = window.setTimeout(() => {
      handle.stop();
      if (handleRef.current === handle) handleRef.current = null;
      stopTimerRef.current = null;
    }, 900);
    setPlaying(false);
  }, []);

  const startAmbient = useCallback(async () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    try {
      if (!handleRef.current) {
        handleRef.current = createAmbientSound();
      }

      await handleRef.current.context.resume();
      handleRef.current.master.gain.cancelScheduledValues(handleRef.current.context.currentTime);
      handleRef.current.master.gain.setTargetAtTime(MASTER_VOLUME, handleRef.current.context.currentTime, 1.1);
      setSupported(true);
      setPlaying(handleRef.current.context.state === "running");
    } catch {
      setSupported(false);
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supported || playing) return;

    const startAfterGesture = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-ambient-sound-toggle]")) return;
      if (window.localStorage.getItem(STORAGE_KEY) === "true") {
        setEnabled(false);
        return;
      }
      void startAmbient();
    };

    window.addEventListener("pointerdown", startAfterGesture, { passive: true });
    window.addEventListener("keydown", startAfterGesture);

    return () => {
      window.removeEventListener("pointerdown", startAfterGesture);
      window.removeEventListener("keydown", startAfterGesture);
    };
  }, [enabled, playing, startAmbient, supported]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      handleRef.current?.stop();
    };
  }, []);

  const toggleAmbient = async () => {
    if (playing) {
      window.localStorage.setItem(STORAGE_KEY, "true");
      setEnabled(false);
      stopAmbient();
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "false");
    setEnabled(true);
    await startAmbient();
  };

  const Icon = playing ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      data-ambient-sound-toggle
      onClick={toggleAmbient}
      className={`focus-ring fixed bottom-5 right-5 z-[120] inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-[0_16px_44px_rgba(33,20,8,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 ${
        playing
          ? "border-[#d6b069] bg-[#211408]/88 text-[#fff6df]"
          : "border-[#d8c8ae] bg-[#fffaf0]/92 text-[#2d251c]"
      }`}
      aria-pressed={playing}
      aria-label={playing ? "Mute ambient sound" : "Start ambient sound"}
      title={playing ? "Mute ambient sound" : "Start ambient sound"}
    >
      <Waves size={17} aria-hidden="true" />
      <Icon size={17} aria-hidden="true" />
      <span className="hidden sm:inline">{playing ? "Sound On" : "Sound"}</span>
    </button>
  );
}
