// VoxGenesisModelAdapter - bridge for real installed singing voice packs.
(function () {
    const DEFAULT_MANIFEST = 'models/voxgenesis/manifest.json';
    const LEGACY_PACK = {
        packType: 'legacy-voxgenesis',
        speakerEncoder: 'speaker_encoder.onnx',
        pitchEncoder: 'pitch_encoder.onnx',
        voiceConverter: 'voice_converter.onnx',
        vocoder: 'vocoder.onnx'
    };
    const CYCL0_PACK = {
        packType: 'cycl0-rvc',
        speakerEncoder: 'vec-768-layer-12.onnx',
        pitchEncoder: 'crepe_full.onnx',
        pitchFallback: 'crepe_tiny_v2.onnx',
        voiceConverter: 'rvc_full.onnx',
        rvcRuntime: 'rvc_infer_full.pt',
        retrievalIndexMeta: 'index_meta.txt',
        retrievalIndexVectors: 'index_vectors.bin'
    };

    class VoxGenesisModelAdapter {
        constructor(options = {}) {
            this.manifestUrl = options.manifestUrl || DEFAULT_MANIFEST;
            this.manifest = null;
            this.sessions = {};
            this.ready = false;
            this.lastError = null;
            this.installState = 'not-loaded';
            this.packType = null;
            this.modelBaseUrl = '';
        }

        async init() {
            if (this.ready) return this.status();
            try {
                if (!window.ort) throw new Error('ONNX Runtime is not loaded');
                if (window.ort.env && window.ort.env.wasm) {
                    window.ort.env.wasm.wasmPaths = 'node_modules/onnxruntime-web/dist/';
                    window.ort.env.wasm.numThreads = 1;
                }

                const response = await fetch(this.manifestUrl, { cache: 'no-store' });
                if (!response.ok) throw new Error('VoxGenesis manifest not found');
                this.manifest = await response.json();
                this.modelBaseUrl = this.manifestUrl.slice(0, this.manifestUrl.lastIndexOf('/') + 1);

                if (!this.manifest.installed) {
                    this.installState = 'manifest-disabled';
                    throw new Error('VoxGenesis model manifest is present but not marked installed');
                }

                this.packType = this.manifest.packType || this.detectPackType(this.manifest.models || {});
                await this.loadPackSessions();
                this.ready = true;
                this.installState = 'ready';
                this.lastError = null;
                return this.status();
            } catch (error) {
                this.ready = false;
                this.lastError = error.message || String(error);
                if (this.installState === 'not-loaded') this.installState = 'missing-models';
                return this.status();
            }
        }

        detectPackType(models) {
            const values = Object.values(models || {}).map((value) => String(value || '')).join(' ').toLowerCase();
            if (values.includes('vec-768-layer-12') || values.includes('crepe_full') || values.includes('rvc_full')) return 'cycl0-rvc';
            if (values.includes('speaker_encoder') || values.includes('pitch_encoder') || values.includes('voice_converter') || values.includes('vocoder')) return 'legacy-voxgenesis';
            return 'unknown';
        }

        resolveModelPath(key) {
            const models = this.manifest?.models || {};
            const candidates = [];
            if (models[key]) candidates.push(models[key]);
            if (this.packType === CYCL0_PACK.packType) {
                if (key === 'speakerEncoder') candidates.push(CYCL0_PACK.speakerEncoder);
                if (key === 'pitchEncoder') candidates.push(CYCL0_PACK.pitchEncoder);
                if (key === 'pitchFallback') candidates.push(CYCL0_PACK.pitchFallback);
                if (key === 'voiceConverter') candidates.push(CYCL0_PACK.voiceConverter);
                if (key === 'rvcRuntime') candidates.push(CYCL0_PACK.rvcRuntime);
            }
            if (this.packType === LEGACY_PACK.packType) {
                if (key === 'speakerEncoder') candidates.push(LEGACY_PACK.speakerEncoder);
                if (key === 'pitchEncoder') candidates.push(LEGACY_PACK.pitchEncoder);
                if (key === 'voiceConverter') candidates.push(LEGACY_PACK.voiceConverter);
                if (key === 'vocoder') candidates.push(LEGACY_PACK.vocoder);
            }
            const picked = candidates.find(Boolean);
            return picked ? this.modelBaseUrl + picked : '';
        }

        async loadPackSessions() {
            const layout = this.packType === LEGACY_PACK.packType ? LEGACY_PACK : CYCL0_PACK;
            const speakerPath = this.resolveModelPath('speakerEncoder') || (layout.packType === LEGACY_PACK.packType ? this.modelBaseUrl + LEGACY_PACK.speakerEncoder : '');
            const pitchPath = this.resolveModelPath('pitchEncoder') || this.resolveModelPath('pitchFallback') || (layout.packType === LEGACY_PACK.packType ? this.modelBaseUrl + LEGACY_PACK.pitchEncoder : '');
            const voicePath = this.resolveModelPath('voiceConverter') || (layout.packType === LEGACY_PACK.packType ? this.modelBaseUrl + LEGACY_PACK.voiceConverter : '');
            const vocoderPath = this.resolveModelPath('vocoder');
            const fallbackPitchPath = this.resolveModelPath('pitchFallback');
            const optionalRuntimePath = this.resolveModelPath('rvcRuntime');

            if (speakerPath) this.sessions.speakerEncoder = await this.loadSession('speakerEncoder', speakerPath);
            if (pitchPath) this.sessions.pitchEncoder = await this.loadSession('pitchEncoder', pitchPath);
            if (fallbackPitchPath) {
                try {
                    this.sessions.pitchFallback = await this.loadSession('pitchFallback', fallbackPitchPath);
                } catch (error) {
                    console.warn('[VoxGenesis] Optional pitch fallback unavailable:', error?.message || error);
                }
            }
            if (voicePath) this.sessions.voiceConverter = await this.loadSession('voiceConverter', voicePath);
            if (vocoderPath) {
                try {
                    this.sessions.vocoder = await this.loadSession('vocoder', vocoderPath);
                } catch (error) {
                    console.warn('[VoxGenesis] Optional vocoder unavailable:', error?.message || error);
                }
            }
            if (optionalRuntimePath) {
                try {
                    this.sessions.rvcRuntime = await this.loadSession('rvcRuntime', optionalRuntimePath);
                } catch (error) {
                    console.warn('[VoxGenesis] Optional runtime asset unavailable:', error?.message || error);
                    this.sessions.rvcRuntime = null;
                }
            }

            if (!this.sessions.speakerEncoder || !this.sessions.pitchEncoder || !this.sessions.voiceConverter) {
                throw new Error('VoxGenesis pack is incomplete or not a supported pack layout');
            }
        }

        async loadSession(name, url) {
            if (!url || url.endsWith('undefined')) throw new Error('Missing model path for ' + name);
            return window.ort.InferenceSession.create(url, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
        }

        status() {
            return {
                ready: this.ready,
                state: this.installState,
                error: this.lastError,
                packType: this.packType,
                manifest: this.manifest ? {
                    name: this.manifest.name,
                    version: this.manifest.version,
                    sampleRate: this.manifest.sampleRate,
                    installed: !!this.manifest.installed,
                    packType: this.manifest.packType || null
                } : null
            };
        }

        async cloneVoice({ buffer, voicePrint, settings } = {}) {
            const state = await this.init();
            if (!state.ready) throw new Error(state.error || 'VoxGenesis model adapter is not ready');
            const audio = this.audioBufferToTensor(buffer, this.manifest.sampleRate || buffer.sampleRate);
            const session = this.sessions.speakerEncoder;
            const inputName = session.inputNames[0];
            const outputName = session.outputNames[0];
            const result = await session.run({ [inputName]: audio });
            return {
                kind: this.packType === CYCL0_PACK.packType ? 'cycl0-rvc-embedding' : 'onnx-speaker-embedding',
                embedding: result[outputName],
                voicePrint,
                settings,
                packType: this.packType
            };
        }

        async synthesizeSinging({ model, voicePrint, sourceBuffer, lyrics = '', notes = [], params = {} } = {}) {
            const state = await this.init();
            if (!state.ready) throw new Error(state.error || 'VoxGenesis singing model adapter is not ready');
            if (!sourceBuffer) throw new Error('Source vocal buffer is required for singing conversion');

            const sourceAudio = this.audioBufferToTensor(sourceBuffer, this.manifest.sampleRate || sourceBuffer.sampleRate);
            const contentFeatures = await this.encodeContent(sourceAudio);
            const pitchTrack = await this.extractPitchTrack(sourceAudio);
            const speakerEmbed = model?.embedding || this.voicePrintToTensor(voicePrint);

            const converter = this.sessions.voiceConverter;
            const feeds = this.buildConverterFeeds(converter, contentFeatures, pitchTrack, speakerEmbed, { lyrics, notes, params, voicePrint });
            const converted = await converter.run(feeds);
            const outputName = converter.outputNames[0];
            const audioTensor = converted[outputName];
            if (!audioTensor) throw new Error('Voice converter did not return audio');
            return this.tensorToAudioBuffer(audioTensor, sourceBuffer.sampleRate || this.manifest.sampleRate || 44100);
        }

        async encodeContent(sourceAudio) {
            const session = this.sessions.speakerEncoder;
            const inputName = session.inputNames[0];
            const outputName = session.outputNames[0];
            const result = await session.run({ [inputName]: sourceAudio });
            return result[outputName];
        }

        async extractPitchTrack(sourceAudio) {
            const session = this.sessions.pitchEncoder || this.sessions.pitchFallback;
            if (!session) throw new Error('Pitch encoder is unavailable');
            const inputName = session.inputNames[0];
            const outputName = session.outputNames[0];
            const result = await session.run({ [inputName]: sourceAudio });
            const logits = result[outputName];
            return this.crepeToPitch(logits, sourceAudio.dims?.[1] || sourceAudio.data.length, this.manifest.sampleRate || 44100);
        }

        crepeToPitch(logits, sampleCount, sampleRate) {
            const data = logits?.data ? Array.from(logits.data) : [];
            const dims = Array.isArray(logits?.dims) ? logits.dims.slice() : [];
            const baseHz = 32.70319566257483;
            let bins = 360;
            let frameCount = Math.max(1, Math.round(sampleCount / 512));
            let frameMajor = true;

            if (dims.length >= 2) {
                const binsIndex = dims.findIndex((value) => value === 360);
                if (binsIndex >= 0) {
                    bins = 360;
                    if (binsIndex === dims.length - 1) {
                        frameMajor = true;
                        frameCount = dims[dims.length - 2] || frameCount;
                    } else if (binsIndex === dims.length - 2) {
                        frameMajor = false;
                        frameCount = dims[dims.length - 1] || frameCount;
                    } else {
                        const candidates = dims.filter((value, index) => index !== binsIndex && value > 1);
                        frameCount = candidates[candidates.length - 1] || frameCount;
                    }
                } else {
                    const last = dims[dims.length - 1];
                    const first = dims[0];
                    if (last && last <= 512) {
                        bins = last;
                        frameMajor = true;
                        frameCount = dims[dims.length - 2] || first || frameCount;
                    } else if (first && first <= 512) {
                        bins = first;
                        frameMajor = false;
                        frameCount = dims[dims.length - 1] || last || frameCount;
                    }
                }
            }

            if (!data.length) {
                const zeros = new Float32Array(frameCount);
                return {
                    frameCount,
                    continuousTensor: new window.ort.Tensor('float32', zeros, [1, frameCount]),
                    coarseTensor: new window.ort.Tensor('float32', zeros, [1, frameCount]),
                    hz: zeros,
                    coarse: zeros
                };
            }

            const hz = new Float32Array(frameCount);
            const coarse = new Float32Array(frameCount);
            for (let frame = 0; frame < frameCount; frame++) {
                let bestBin = 0;
                let bestValue = -Infinity;
                for (let bin = 0; bin < bins; bin++) {
                    const index = frameMajor ? (frame * bins + bin) : (bin * frameCount + frame);
                    const value = data[index] ?? data[Math.min(data.length - 1, index)] ?? -Infinity;
                    if (value > bestValue) {
                        bestValue = value;
                        bestBin = bin;
                    }
                }
                const freq = baseHz * Math.pow(2, bestBin / 60);
                hz[frame] = Number.isFinite(freq) ? freq : 0;
                coarse[frame] = freq > 0 ? Math.max(1, Math.min(255, Math.round(12 * Math.log2(freq / 440) + 69))) : 0;
            }

            return {
                frameCount,
                continuousTensor: new window.ort.Tensor('float32', hz, [1, frameCount]),
                coarseTensor: new window.ort.Tensor('float32', coarse, [1, frameCount]),
                hz,
                coarse
            };
        }

        buildConverterFeeds(session, contentFeatures, pitchTrack, speakerEmbed, context = {}) {
            const feeds = {};
            const frameCount = Math.max(1, pitchTrack.frameCount || (contentFeatures.dims?.[1] || 1));
            const speakerTensor = this.asSpeakerTensor(speakerEmbed, frameCount);
            const phoneTensor = this.asPhoneTensor(contentFeatures, frameCount);
            const pitchTensor = pitchTrack.coarseTensor;
            const pitchfTensor = pitchTrack.continuousTensor;
            const zeros = this.makeZeroTensor(frameCount);
            const random = this.makeOneTensor(frameCount);

            for (const name of session.inputNames) {
                const lower = String(name).toLowerCase();
                if (lower.includes('phone') || lower.includes('content')) {
                    feeds[name] = phoneTensor;
                } else if (lower.includes('pitchf') || lower.includes('f0')) {
                    feeds[name] = pitchfTensor;
                } else if (lower === 'pitch' || lower.includes('coarse')) {
                    feeds[name] = pitchTensor;
                } else if (lower.includes('sid') || lower.includes('spk') || lower.includes('speaker') || lower.includes('embed')) {
                    feeds[name] = speakerTensor;
                } else if (lower.includes('noise') || lower.includes('phase')) {
                    feeds[name] = zeros;
                } else if (lower.includes('rand')) {
                    feeds[name] = random;
                } else {
                    feeds[name] = phoneTensor;
                }
            }

            return feeds;
        }

        asPhoneTensor(featureTensor, frameCount) {
            const dims = featureTensor?.dims || [];
            const data = featureTensor?.data ? Float32Array.from(featureTensor.data) : new Float32Array(0);
            if (dims.length === 3) return featureTensor;
            const featureDim = dims[dims.length - 1] || Math.max(64, Math.min(768, data.length || 768));
            const source = data.length ? data : new Float32Array(featureDim);
            const tiled = new Float32Array(frameCount * featureDim);
            for (let frame = 0; frame < frameCount; frame++) {
                const offset = frame * featureDim;
                for (let i = 0; i < featureDim; i++) {
                    tiled[offset + i] = source[i % source.length] || 0;
                }
            }
            return new window.ort.Tensor('float32', tiled, [1, frameCount, featureDim]);
        }

        asSpeakerTensor(embedTensor, frameCount) {
            const dims = embedTensor?.dims || [];
            const data = embedTensor?.data ? Float32Array.from(embedTensor.data) : new Float32Array(0);
            if (dims.length >= 2) return embedTensor;
            const values = data.length ? data : new Float32Array([0]);
            const out = new Float32Array(frameCount * values.length);
            for (let frame = 0; frame < frameCount; frame++) {
                out.set(values, frame * values.length);
            }
            return new window.ort.Tensor('float32', out, [1, frameCount, values.length]);
        }

        makeZeroTensor(frameCount) {
            return new window.ort.Tensor('float32', new Float32Array(frameCount), [1, frameCount]);
        }

        makeOneTensor(frameCount) {
            const data = new Float32Array(frameCount);
            data.fill(1);
            return new window.ort.Tensor('float32', data, [1, frameCount]);
        }

        audioBufferToTensor(buffer, targetSampleRate) {
            const channel = buffer.getChannelData(0);
            const sampleRate = buffer.sampleRate || targetSampleRate || 44100;
            const ratio = sampleRate / (targetSampleRate || sampleRate);
            const length = Math.max(1, Math.floor(channel.length / ratio));
            const data = new Float32Array(length);
            for (let i = 0; i < length; i++) {
                data[i] = channel[Math.min(channel.length - 1, Math.floor(i * ratio))] || 0;
            }
            return new window.ort.Tensor('float32', data, [1, length]);
        }

        voicePrintToTensor(voicePrint) {
            const spectrum = Array.isArray(voicePrint?.spectrum) ? voicePrint.spectrum : [];
            const base = [
                voicePrint?.rms || 0,
                voicePrint?.peak || 0,
                voicePrint?.zeroCrossingRate || 0,
                voicePrint?.centroid || 0,
                voicePrint?.voicedRatio || 0,
                voicePrint?.confidence || 0
            ];
            const vector = new Float32Array(base.concat(spectrum).slice(0, 256));
            return new window.ort.Tensor('float32', vector, [1, vector.length]);
        }

        tensorToAudioBuffer(tensor, sampleRate) {
            const dims = tensor.dims || [];
            const data = tensor.data instanceof Float32Array ? tensor.data : Float32Array.from(tensor.data || []);
            const length = dims[dims.length - 1] || data.length;
            const ctx = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
            const buffer = ctx.createBuffer(1, Math.max(1, length), sampleRate || 44100);
            const out = buffer.getChannelData(0);
            for (let i = 0; i < out.length; i++) out[i] = Math.max(-1, Math.min(1, data[i] || 0));
            return buffer;
        }
    }

    window.VoxGenesisModelAdapterClass = VoxGenesisModelAdapter;
    window.VoxGenesisModelAdapter = window.VoxGenesisModelAdapter || new VoxGenesisModelAdapter();
})();


