/**
 * Audio Processing Utilities for Quranic Recitation Analysis
 * Handles audio feature extraction, voice activity detection, and audio normalization
 */

import { AudioFeatures } from '../types';

/**
 * Extract audio features from an audio buffer
 * Uses MFCC (Mel-frequency cepstral coefficients) for phonetic analysis
 */
export async function extractAudioFeatures(
  audioBuffer: ArrayBuffer,
  sampleRate: number = 16000
): Promise<AudioFeatures> {
  try {
    // Convert ArrayBuffer to Float32Array
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioData = await audioContext.decodeAudioData(audioBuffer);

    const rawAudio = audioData.getChannelData(0); // Get mono channel

    // Extract MFCC coefficients
    const mfccCoefficients = extractMFCC(rawAudio, sampleRate);

    // Extract energy
    const energy = extractEnergy(rawAudio);

    // Extract zero crossing rate
    const zcr = extractZeroCrossingRate(rawAudio);

    // Extract spectral centroid
    const spectralCentroid = extractSpectralCentroid(rawAudio, sampleRate);

    return {
      mfcc: mfccCoefficients,
      energy,
      zero_crossing_rate: zcr,
      spectral_centroid: spectralCentroid,
      sample_rate: sampleRate,
      duration: audioData.duration,
    };
  } catch (error) {
    console.error('Error extracting audio features:', error);
    throw new Error(`Audio feature extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract MFCC (Mel-Frequency Cepstral Coefficients)
 * Standard feature extraction for speech recognition
 */
function extractMFCC(
  audioData: Float32Array,
  sampleRate: number,
  numMFCC: number = 13,
  numMels: number = 128
): number[][] {
  const frameLength = Math.floor(sampleRate * 0.025); // 25ms frames
  const frameShift = Math.floor(sampleRate * 0.01); // 10ms overlap
  const numFrames = Math.floor((audioData.length - frameLength) / frameShift) + 1;

  const mfccCoefficients: number[][] = [];

  for (let i = 0; i < numFrames; i++) {
    const frameStart = i * frameShift;
    const frameEnd = frameStart + frameLength;

    // Apply Hamming window
    const frame = applyHammingWindow(audioData.slice(frameStart, frameEnd));

    // Compute FFT
    const fft = computeFFT(frame);

    // Compute mel-scale filterbank
    const melSpectrogram = melFilterbank(fft, sampleRate, numMels);

    // Compute DCT to get MFCCs
    const mfcc = discreteCosineTransform(melSpectrogram, numMFCC);

    mfccCoefficients.push(mfcc);
  }

  return mfccCoefficients;
}

/**
 * Extract energy from audio frames
 */
function extractEnergy(audioData: Float32Array): number[] {
  const frameLength = 512;
  const frameShift = 256;
  const numFrames = Math.floor((audioData.length - frameLength) / frameShift) + 1;

  const energyValues: number[] = [];

  for (let i = 0; i < numFrames; i++) {
    const frameStart = i * frameShift;
    const frameEnd = frameStart + frameLength;
    const frame = audioData.slice(frameStart, frameEnd);

    let energy = 0;
    for (let j = 0; j < frame.length; j++) {
      energy += frame[j] * frame[j];
    }
    energyValues.push(Math.sqrt(energy / frame.length));
  }

  return energyValues;
}

/**
 * Extract zero crossing rate (indicator of voicing)
 */
function extractZeroCrossingRate(audioData: Float32Array): number[] {
  const frameLength = 512;
  const frameShift = 256;
  const numFrames = Math.floor((audioData.length - frameLength) / frameShift) + 1;

  const zcrValues: number[] = [];

  for (let i = 0; i < numFrames; i++) {
    const frameStart = i * frameShift;
    const frameEnd = frameStart + frameLength;
    const frame = audioData.slice(frameStart, frameEnd);

    let zcrCount = 0;
    for (let j = 1; j < frame.length; j++) {
      if ((frame[j] >= 0 && frame[j - 1] < 0) || (frame[j] < 0 && frame[j - 1] >= 0)) {
        zcrCount++;
      }
    }
    zcrValues.push(zcrCount / (2 * frame.length));
  }

  return zcrValues;
}

/**
 * Extract spectral centroid
 */
function extractSpectralCentroid(audioData: Float32Array, sampleRate: number): number[] {
  const frameLength = 512;
  const frameShift = 256;
  const numFrames = Math.floor((audioData.length - frameLength) / frameShift) + 1;

  const centroids: number[] = [];

  for (let i = 0; i < numFrames; i++) {
    const frameStart = i * frameShift;
    const frameEnd = frameStart + frameLength;
    const frame = audioData.slice(frameStart, frameEnd);

    const fft = computeFFT(frame);
    const magnitude = fft.slice(0, fft.length / 2).map(x => x * x);

    let numerator = 0;
    let denominator = 0;

    for (let j = 0; j < magnitude.length; j++) {
      const freq = (j * sampleRate) / frameLength;
      numerator += freq * magnitude[j];
      denominator += magnitude[j];
    }

    centroids.push(numerator / (denominator || 1));
  }

  return centroids;
}

/**
 * Apply Hamming window to reduce spectral leakage
 */
function applyHammingWindow(frame: Float32Array): Float32Array {
  const windowed = new Float32Array(frame.length);
  for (let i = 0; i < frame.length; i++) {
    const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (frame.length - 1));
    windowed[i] = frame[i] * w;
  }
  return windowed;
}

/**
 * Compute FFT using Cooley-Tukey algorithm
 */
function computeFFT(data: Float32Array): number[] {
  const n = data.length;
  if (n <= 1) return Array.from(data);

  const even = computeFFT(new Float32Array(data.filter((_, i) => i % 2 === 0)));
  const odd = computeFFT(new Float32Array(data.filter((_, i) => i % 2 === 1)));

  const result = new Array(n);
  for (let k = 0; k < n / 2; k++) {
    const twiddle = Math.exp((-2 * Math.PI * k) / n);
    result[k] = even[k] + twiddle * odd[k];
    result[k + n / 2] = even[k] - twiddle * odd[k];
  }

  return result;
}

/**
 * Apply mel-scale filterbank
 */
function melFilterbank(fft: number[], sampleRate: number, numFilters: number): number[] {
  const freqBins = fft.length;
  const melBanks: number[] = new Array(numFilters).fill(0);

  for (let i = 0; i < numFilters; i++) {
    const centerFreq = (i + 1) * (sampleRate / 2) / (numFilters + 1);
    for (let j = 0; j < freqBins; j++) {
      const freq = (j * sampleRate) / freqBins;
      melBanks[i] += Math.abs(fft[j]) * triangleFilterResponse(freq, centerFreq, sampleRate / (2 * numFilters));
    }
  }

  return melBanks;
}

/**
 * Triangle filter response for mel filterbank
 */
function triangleFilterResponse(freq: number, centerFreq: number, bandwidth: number): number {
  if (freq < centerFreq - bandwidth || freq > centerFreq + bandwidth) {
    return 0;
  }
  if (freq <= centerFreq) {
    return (freq - (centerFreq - bandwidth)) / bandwidth;
  }
  return ((centerFreq + bandwidth) - freq) / bandwidth;
}

/**
 * Discrete Cosine Transform
 */
function discreteCosineTransform(input: number[], numCoefficients: number): number[] {
  const result: number[] = new Array(numCoefficients).fill(0);
  const n = input.length;

  for (let k = 0; k < numCoefficients; k++) {
    let sum = 0;
    for (let n_ = 0; n_ < n; n_++) {
      sum += input[n_] * Math.cos((Math.PI / n) * (n_ + 0.5) * k);
    }
    result[k] = sum * Math.sqrt(2 / n);
  }

  return result;
}

/**
 * Detect voice activity in audio
 * Returns array of time segments with voice activity
 */
export function detectVoiceActivity(
  energy: number[],
  zcr: number[],
  energyThreshold: number = 0.02,
  zcrThreshold: number = 0.1
): { start: number; end: number }[] {
  const frameShift = 0.01; // 10ms
  const voiceSegments: { start: number; end: number }[] = [];

  let isVoiceActive = false;
  let segmentStart = 0;

  for (let i = 0; i < energy.length; i++) {
    const hasVoice = energy[i] > energyThreshold && zcr[i] < zcrThreshold;

    if (hasVoice && !isVoiceActive) {
      // Start of voice segment
      segmentStart = i * frameShift;
      isVoiceActive = true;
    } else if (!hasVoice && isVoiceActive) {
      // End of voice segment
      voiceSegments.push({
        start: segmentStart,
        end: i * frameShift,
      });
      isVoiceActive = false;
    }
  }

  // Handle case where audio ends with voice
  if (isVoiceActive) {
    voiceSegments.push({
      start: segmentStart,
      end: energy.length * frameShift,
    });
  }

  return voiceSegments;
}

/**
 * Normalize audio to prevent clipping
 */
export function normalizeAudio(audioData: Float32Array): Float32Array {
  let maxValue = 0;
  for (let i = 0; i < audioData.length; i++) {
    maxValue = Math.max(maxValue, Math.abs(audioData[i]));
  }

  if (maxValue === 0) return audioData;

  const normalized = new Float32Array(audioData.length);
  const factor = 0.95 / maxValue; // Leave 5% headroom

  for (let i = 0; i < audioData.length; i++) {
    normalized[i] = audioData[i] * factor;
  }

  return normalized;
}

/**
 * Resample audio to target sample rate
 */
export function resampleAudio(
  audioData: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return audioData;

  const ratio = fromRate / toRate;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const index = i * ratio;
    const floor = Math.floor(index);
    const frac = index - floor;

    if (floor + 1 < audioData.length) {
      result[i] = audioData[floor] * (1 - frac) + audioData[floor + 1] * frac;
    } else {
      result[i] = audioData[floor];
    }
  }

  return result;
}
