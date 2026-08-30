/* =========================================================
   JAC PORTAL
   AUDIO.JS
   ZENTRALE AUDIO-ENGINE

   VERSION:
   - iOS / iPadOS Audio-Latenz reduziert
   - WebAudio Buffer für kurze UI-/Portal-Sounds
   - Sounds werden beim Start vorgeladen und dekodiert
   - AudioContext wird beim Benutzerkontakt aktiviert
   - Fallback auf HTMLAudio, falls WebAudio nicht verfügbar ist
   - Bestehende JACAudio-API bleibt erhalten
   - Kein unnötiger HTMLAudio-Fallback auf iOS
   - Noch nicht geladene Sounds werden über WebAudio nachgeladen
   ========================================================= */

"use strict";


/* =========================================================
   AUDIO UNLOCK
   ========================================================= */

const JAC_AUDIO_UNLOCK_KEY =
    "JAC_AUDIO_UNLOCKED";


/* =========================================================
   AUDIO KONFIGURATION
   ========================================================= */

const JAC_AUDIO = {

    basePath:
        "../assets/audio/",

    sounds: {

        uiClick: "ui-click.wav",
        uiHover: "ui-hover.wav",

        systemBoot: "system-boot.wav",
        systemReady: "system-ready.wav",
        systemMessage: "system-message.wav",

        caseUnlock: "case-unlock.wav",
        caseOpen: "case-open.wav",
        envelopeOpen: "envelope-open.wav",

        scanStart: "scan-start.wav",
        scanLoop: "scan-loop.wav",
        scanSuccess: "scan-success.wav",
        scanDenied: "scan-denied.wav",
        fingerprintScan: "fingerprint-scan.wav",

        dataProcess: "data-process.wav",
        evidenceReveal: "evidence-reveal.wav",

        hologram: "hologram.wav",
        hologramLoop: "hologram-loop.wav",

        caseComplete: "case-complete.wav",
        progressUnlock: "progress-unlock.wav",
        sparkle: "sparkle.wav",
        doubleSparkle: "double-sparkle.wav",

        finalReveal: "final-reveal.wav",
        finalComplete: "final-complete.wav",

        reset: "reset.wav",
        error: "error.wav"
    },


    akte3: {

        aussage1: "akte3/aussage1.mp3",
        aussage2: "akte3/aussage2.mp3",
        aussage3: "akte3/aussage3.mp3",
        aussage4: "akte3/aussage4.mp3"

    }

};


/* =========================================================
   AUDIO ENGINE
   ========================================================= */

const JACAudio = {

    instances: {},

    activeSounds:
        new Set(),

    activeSources:
        new Set(),

    buffers:
        new Map(),

    loadingPromise:
        null,

    /*
     * Einzelne Sounds, die gerade nachgeladen werden.
     * Verhindert doppelte fetch/decode-Vorgänge.
     */
    pendingLoads:
        new Map(),

    enabled:
        true,

    volume:
        0.65,

    initialized:
        false,

    audioUnlocked:
        false,

    audioContext:
        null,


    /* =====================================================
       AUDIO CONTEXT
       ===================================================== */

    ensureAudioContext() {

        if (this.audioContext) {
            return this.audioContext;
        }

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        try {

            this.audioContext =
                new AudioContext();

        }

        catch (error) {

            console.warn(
                "JAC AudioContext konnte nicht erstellt werden:",
                error
            );

            this.audioContext =
                null;

        }

        return this.audioContext;

    },


    /* =====================================================
       INIT
       ===================================================== */

    init() {

        if (this.initialized) {
            return;
        }

        this.initialized =
            true;

        this.ensureAudioContext();

        /*
         * Preloading läuft im Hintergrund.
         * Es wird NICHT darauf gewartet.
         */
        this.prepareSounds();

    },


    /* =====================================================
       SOUNDS VORBEREITEN

       WebAudio lädt die Dateien komplett in den Speicher.
       Dadurch werden kurze Sounds nach dem Laden ohne
       HTMLAudio-Latenz abgespielt.
       ===================================================== */

    prepareSounds() {

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        const context =
            this.ensureAudioContext();

        if (!context) {

            this.prepareHTMLAudioFallback();

            return Promise.resolve(false);

        }

        const allSounds = {

            ...JAC_AUDIO.sounds,
            ...JAC_AUDIO.akte3

        };

        const entries =
            Object.entries(allSounds);


        this.loadingPromise =
            Promise.all(

                entries.map(

                    async ([soundName, filename]) => {

                        const url =
                            JAC_AUDIO.basePath +
                            filename;

                        try {

                            const response =
                                await fetch(
                                    url,
                                    {
                                        cache:
                                            "force-cache"
                                    }
                                );

                            if (!response.ok) {

                                throw new Error(
                                    `HTTP ${response.status}`
                                );

                            }

                            const arrayBuffer =
                                await response.arrayBuffer();

                            const audioBuffer =
                                await this.decodeAudioData(
                                    arrayBuffer
                                );

                            if (audioBuffer) {

                                this.buffers.set(
                                    soundName,
                                    audioBuffer
                                );

                            }

                        }

                        catch (error) {

                            console.warn(
                                "JAC Audio Preload:",
                                soundName,
                                error
                            );

                        }

                    }

                )

            )

            .then(() => {

                /*
                 * HTMLAudio bleibt nur als echter Fallback
                 * erhalten.
                 */
                this.prepareHTMLAudioFallback();

                return true;

            })

            .catch(error => {

                console.warn(
                    "JAC Audio Preload Fehler:",
                    error
                );

                this.prepareHTMLAudioFallback();

                return false;

            });


        return this.loadingPromise;

    },


    /* =====================================================
       DECODE AUDIO DATA

       Safari/iOS unterstützt je nach WebKit-Version
       unterschiedliche decodeAudioData-Varianten.
       ===================================================== */

    decodeAudioData(arrayBuffer) {

        const context =
            this.audioContext;

        if (!context) {
            return Promise.resolve(null);
        }

        return new Promise(resolve => {

            let finished =
                false;


            const done =
                buffer => {

                    if (finished) {
                        return;
                    }

                    finished =
                        true;

                    resolve(
                        buffer || null
                    );

                };


            try {

                const result =
                    context.decodeAudioData(
                        arrayBuffer,
                        done,
                        () => done(null)
                    );


                /*
                 * Moderne Safari-Versionen geben
                 * zusätzlich ein Promise zurück.
                 */
                if (
                    result &&
                    typeof result.then ===
                        "function"
                ) {

                    result
                        .then(
                            buffer => done(buffer)
                        )
                        .catch(
                            () => done(null)
                        );

                }

            }

            catch (error) {

                console.warn(
                    "JAC Audio Decode:",
                    error
                );

                done(null);

            }

        });

    },


    /* =====================================================
       HTML AUDIO FALLBACK

       Wird nur verwendet, wenn WebAudio überhaupt
       nicht verfügbar ist.
       ===================================================== */

    prepareHTMLAudioFallback() {

        Object.keys(
            JAC_AUDIO.sounds
        ).forEach(soundName => {

            if (this.instances[soundName]) {
                return;
            }

            const audio =
                new Audio(
                    JAC_AUDIO.basePath +
                    JAC_AUDIO.sounds[soundName]
                );

            audio.preload =
                "auto";

            audio.autoplay =
                false;

            audio.playsInline =
                true;

            audio.volume =
                this.volume;

            this.instances[soundName] =
                audio;

        });


        Object.keys(
            JAC_AUDIO.akte3
        ).forEach(soundName => {

            if (this.instances[soundName]) {
                return;
            }

            const audio =
                new Audio(
                    JAC_AUDIO.basePath +
                    JAC_AUDIO.akte3[soundName]
                );

            audio.preload =
                "auto";

            audio.autoplay =
                false;

            audio.playsInline =
                true;

            audio.volume =
                this.volume;

            this.instances[soundName] =
                audio;

        });

    },


    /* =====================================================
       AUDIO FREISCHALTEN

       Wird aus einer echten Benutzerinteraktion aufgerufen.
       ===================================================== */

    async unlock() {

        this.init();

        const context =
            this.ensureAudioContext();


        try {

            if (context) {

                /*
                 * Safari / iOS:
                 * AudioContext muss nach User-Geste
                 * wieder aktiviert werden.
                 */
                if (
                    context.state ===
                    "suspended"
                ) {

                    await context.resume();

                }


                /*
                 * Kurzer stummer Buffer.
                 *
                 * Kein hörbarer Ton.
                 * Aktiviert auf vielen Safari-Versionen
                 * zuverlässig die Audio-Pipeline.
                 */
                if (
                    context.state ===
                    "running"
                ) {

                    const silentBuffer =
                        context.createBuffer(
                            1,
                            1,
                            context.sampleRate
                        );


                    const silentSource =
                        context.createBufferSource();


                    silentSource.buffer =
                        silentBuffer;


                    silentSource.connect(
                        context.destination
                    );


                    silentSource.start(0);


                    silentSource.onended =
                        () => {

                            try {

                                silentSource.disconnect();

                            }

                            catch (_) {}

                        };


                    this.audioUnlocked =
                        true;

                }

            }

        }

        catch (error) {

            console.warn(
                "JAC Audio Unlock:",
                error
            );

        }


        /*
         * HTMLAudio-Fallback nur vorbereiten.
         *
         * Es wird KEIN Sound abgespielt.
         */
        Object.values(
            this.instances
        ).forEach(audio => {

            try {

                audio.load();

            }

            catch (_) {}

        });


        /*
         * WICHTIG:
         *
         * Das globale Preloading wird NICHT abgewartet.
         *
         * Der AudioContext muss innerhalb der
         * Benutzeraktion freigeschaltet werden.
         * Die Dateien dürfen parallel laden/dekodieren.
         */
        if (!this.loadingPromise) {

            this.prepareSounds();

        }


        /*
         * Safari kann den Context nach Fokuswechsel
         * oder Seitenwechsel wieder suspendieren.
         */
        if (
            this.audioContext &&
            this.audioContext.state ===
                "suspended"
        ) {

            try {

                await this.audioContext.resume();

            }

            catch (_) {}

        }


        this.audioUnlocked =
            true;


        try {

            sessionStorage.setItem(
                JAC_AUDIO_UNLOCK_KEY,
                "true"
            );

        }

        catch (_) {}


        return true;

    },


    /* =====================================================
       AUDIO CONTEXT AKTIV HALTEN
       ===================================================== */

    keepContextRunning() {

        if (!this.audioContext) {
            return;
        }

        /*
         * Nicht nur auf audioUnlocked verlassen.
         * Safari kann jederzeit suspendieren.
         */
        if (
            this.audioContext.state ===
            "suspended"
        ) {

            this.audioContext
                .resume()
                .catch(() => {});

        }

    },


    /* =====================================================
       PRÜFEN, OB AUDIO FREIGEGEBEN WURDE
       ===================================================== */

    hasUnlockFromBoot() {

        try {

            return (
                sessionStorage.getItem(
                    JAC_AUDIO_UNLOCK_KEY
                ) === "true"
            );

        }

        catch (_) {

            return false;

        }

    },


    /* =====================================================
       SOUND ABSPIELEN

       WebAudio wird bevorzugt.

       WICHTIG:
       Wenn der Buffer noch nicht vorhanden ist,
       wird NICHT sofort auf HTMLAudio gewechselt.
       ===================================================== */

    play(
        soundName,
        options = {}
    ) {

        this.init();

        if (!this.enabled) {
            return null;
        }

        const context =
            this.ensureAudioContext();


        /*
         * WebAudio vorhanden:
         */
        if (context) {

            /*
             * Safari kann den Context suspendiert haben.
             */
            if (
                context.state ===
                "suspended"
            ) {

                context.resume().catch(() => {});

            }


            const buffer =
                this.buffers.get(
                    soundName
                );


            /*
             * BUFFER VORHANDEN
             *
             * Direkt über WebAudio starten.
             */
            if (
                buffer &&
                context.state ===
                    "running"
            ) {

                try {

                    const source =
                        context.createBufferSource();


                    source.buffer =
                        buffer;


                    source.loop =
                        options.loop === true;


                    if (
                        typeof options.playbackRate ===
                            "number"
                    ) {

                        source.playbackRate.value =
                            options.playbackRate;

                    }


                    const gain =
                        context.createGain();


                    const volume =
                        typeof options.volume ===
                            "number"

                            ? Math.max(
                                0,
                                Math.min(
                                    1,
                                    options.volume
                                )
                            )

                            : this.volume;


                    gain.gain.value =
                        volume;


                    source.connect(gain);

                    gain.connect(
                        context.destination
                    );


                    const record = {

                        source,
                        gain,
                        soundName

                    };


                    this.activeSources.add(
                        record
                    );


                    source.onended =
                        () => {

                            this.activeSources.delete(
                                record
                            );

                            try {

                                source.disconnect();
                                gain.disconnect();

                            }

                            catch (_) {}

                        };


                    /*
                     * SOFORTIGER START.
                     *
                     * Keine setTimeout-Verzögerung.
                     */
                    source.start(0);


                    return record;

                }

                catch (error) {

                    console.warn(
                        "JAC WebAudio Wiedergabe:",
                        soundName,
                        error
                    );

                }

            }


            /*
             * BUFFER NOCH NICHT GELADEN
             *
             * NICHT HTMLAudio.play() verwenden.
             *
             * Stattdessen nachladen und anschließend
             * über WebAudio abspielen.
             */
            this.loadAndPlayWhenReady(
                soundName,
                options
            );


            return null;

        }


        /*
         * Echter Fallback:
         * WebAudio ist überhaupt nicht verfügbar.
         */
        return this.playHTMLAudio(
            soundName,
            options
        );

    },


    /* =====================================================
       SOUND NACHLADEN UND DANACH ABSPIELEN

       Verhindert doppelte Ladeprozesse und reduziert
       iOS-Verzögerungen bei später ausgelösten Sounds.
       ===================================================== */

    loadAndPlayWhenReady(
        soundName,
        options = {}
    ) {

        if (!this.pendingLoads) {

            this.pendingLoads =
                new Map();

        }


        /*
         * Sound wird bereits geladen.
         */
        if (
            this.pendingLoads.has(
                soundName
            )
        ) {

            this.pendingLoads
                .get(soundName)
                .then(buffer => {

                    if (!buffer) {
                        return;
                    }

                    this.play(
                        soundName,
                        options
                    );

                });

            return;

        }


        const filename =
            JAC_AUDIO.sounds[soundName] ||
            JAC_AUDIO.akte3[soundName];


        if (!filename) {

            console.warn(
                "JAC Audio: Sound nicht gefunden:",
                soundName
            );

            return;

        }


        const context =
            this.ensureAudioContext();


        if (!context) {
            return;
        }


        const url =
            JAC_AUDIO.basePath +
            filename;


        const promise =
            fetch(
                url,
                {
                    cache:
                        "force-cache"
                }
            )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );

                }

                return response.arrayBuffer();

            })

            .then(arrayBuffer => {

                return this.decodeAudioData(
                    arrayBuffer
                );

            })

            .then(buffer => {

                if (buffer) {

                    this.buffers.set(
                        soundName,
                        buffer
                    );

                }

                return buffer;

            })

            .catch(error => {

                console.warn(
                    "JAC Audio Nachladen:",
                    soundName,
                    error
                );

                return null;

            })

            .finally(() => {

                this.pendingLoads.delete(
                    soundName
                );

            });


        this.pendingLoads.set(
            soundName,
            promise
        );


        promise.then(buffer => {

            if (!buffer) {
                return;
            }


            /*
             * Safari kann während des Ladevorgangs
             * den Context suspendieren.
             */
            if (
                context.state ===
                "suspended"
            ) {

                context.resume()
                    .catch(() => {});

            }


            /*
             * play() prüft den Context erneut
             * und startet den Sound ohne künstliche
             * Verzögerung.
             */
            if (
                context.state ===
                "running"
            ) {

                this.play(
                    soundName,
                    options
                );

            }

        });

    },


    /* =====================================================
       HTML AUDIO FALLBACK
       ===================================================== */

    playHTMLAudio(
        soundName,
        options = {}
    ) {

        const original =
            this.instances[soundName];


        if (!original) {

            console.warn(
                "JAC Audio: Sound nicht gefunden:",
                soundName
            );

            return null;

        }


        const audio =
            original.cloneNode(true);


        audio.volume =
            typeof options.volume ===
                "number"

                ? Math.max(
                    0,
                    Math.min(
                        1,
                        options.volume
                    )
                )

                : this.volume;


        audio.loop =
            options.loop === true;


        audio.playsInline =
            true;


        if (
            typeof options.playbackRate ===
                "number"
        ) {

            audio.playbackRate =
                options.playbackRate;

        }


        this.activeSounds.add(
            audio
        );


        const cleanup =
            () => {

                this.activeSounds.delete(
                    audio
                );

            };


        audio.addEventListener(
            "ended",
            cleanup,
            {
                once: true
            }
        );


        audio.addEventListener(
            "error",
            cleanup,
            {
                once: true
            }
        );


        try {

            const promise =
                audio.play();


            if (
                promise &&
                typeof promise.catch ===
                    "function"
            ) {

                promise.catch(
                    error => {

                        cleanup();

                        console.warn(
                            "JAC Audio Wiedergabe blockiert:",
                            soundName,
                            error
                        );

                    }
                );

            }

        }

        catch (error) {

            cleanup();

            console.warn(
                "JAC Audio Wiedergabefehler:",
                soundName,
                error
            );

        }


        return audio;

    },


    /* =====================================================
       SOUND STOPPEN
       ===================================================== */

    stop(audio) {

        if (!audio) {
            return;
        }


        /*
         * WebAudio Record
         */
        if (
            typeof audio === "object" &&
            audio.source
        ) {

            try {

                audio.source.stop(0);

            }

            catch (_) {}


            try {

                audio.source.disconnect();

                audio.gain.disconnect();

            }

            catch (_) {}


            this.activeSources.delete(
                audio
            );

            return;

        }


        /*
         * HTMLAudio
         */
        try {

            audio.pause();

            audio.currentTime =
                0;

        }

        catch (error) {

            console.warn(
                "JAC Audio Stop:",
                error
            );

        }


        this.activeSounds.delete(
            audio
        );

    },


    /* =====================================================
       ALLE SOUNDS STOPPEN
       ===================================================== */

    stopAll() {

        this.activeSources.forEach(
            record => {

                try {

                    record.source.stop(0);

                }

                catch (_) {}


                try {

                    record.source.disconnect();

                    record.gain.disconnect();

                }

                catch (_) {}

            }
        );


        this.activeSources.clear();


        this.activeSounds.forEach(
            audio => {

                try {

                    audio.pause();

                    audio.currentTime =
                        0;

                }

                catch (_) {}

            }
        );


        this.activeSounds.clear();

    },


    /* =====================================================
       SOUND NACH NAMEN STOPPEN
       ===================================================== */

    stopSound(soundName) {

        const filename =
            JAC_AUDIO.sounds[soundName] ||
            JAC_AUDIO.akte3[soundName];


        if (!filename) {
            return;
        }


        /*
         * WebAudio
         */
        this.activeSources.forEach(
            record => {

                if (
                    record.soundName ===
                    soundName
                ) {

                    this.stop(record);

                }

            }
        );


        /*
         * HTMLAudio
         */
        this.activeSounds.forEach(
            audio => {

                try {

                    const source =
                        new URL(
                            audio.src,
                            window.location.href
                        ).pathname;


                    if (
                        source.endsWith(
                            filename
                        )
                    ) {

                        this.stop(audio);

                    }

                }

                catch (_) {}

            }
        );

    },


    /* =====================================================
       LAUTSTÄRKE
       ===================================================== */

    setVolume(volume) {

        const value =
            Number(volume);


        if (
            Number.isNaN(value)
        ) {

            return;

        }


        this.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        /*
         * Bereits vorbereitete HTMLAudio-Instanzen
         * ebenfalls aktualisieren.
         */
        Object.values(
            this.instances
        ).forEach(audio => {

            try {

                audio.volume =
                    this.volume;

            }

            catch (_) {}

        });

    },


    /* =====================================================
       ENABLE / DISABLE
       ===================================================== */

    setEnabled(enabled) {

        this.enabled =
            Boolean(enabled);


        if (!this.enabled) {

            this.stopAll();

        }

    },


    /* =====================================================
       UI
       ===================================================== */

    hover() {

        return this.play(
            "uiHover",
            {
                volume: 0.18
            }
        );

    },


    click() {

        return this.play(
            "uiClick",
            {
                volume: 0.60
            }
        );

    },


    /* =====================================================
       SYSTEM
       ===================================================== */

    boot() {

        return this.play(
            "systemBoot",
            {
                volume: 0.55
            }
        );

    },


    ready() {

        return this.play(
            "systemReady",
            {
                volume: 0.48
            }
        );

    },


    message() {

        return this.play(
            "systemMessage",
            {
                volume: 0.38
            }
        );

    },


    /* =====================================================
       AKTEN
       ===================================================== */

    unlockCase() {

        return this.play(
            "caseUnlock",
            {
                volume: 0.52
            }
        );

    },


    openCase() {

        return this.play(
            "caseOpen",
            {
                volume: 0.52
            }
        );

    },


    openEnvelope() {

        return this.play(
            "envelopeOpen",
            {
                volume: 0.50
            }
        );

    },


    /* =====================================================
       SCAN
       ===================================================== */

    scanStart() {

        return this.play(
            "scanStart",
            {
                volume: 0.48
            }
        );

    },


    scanLoop() {

        return this.play(
            "scanLoop",
            {
                volume: 0.22,
                loop: true
            }
        );

    },


    scanSuccess() {

        return this.play(
            "scanSuccess",
            {
                volume: 0.52
            }
        );

    },


    scanDenied() {

        return this.play(
            "scanDenied",
            {
                volume: 0.38
            }
        );

    },


    fingerprintScan() {

        return this.play(
            "fingerprintScan",
            {
                volume: 0.42
            }
        );

    },


    /* =====================================================
       DATEN
       ===================================================== */

    processData() {

        return this.play(
            "dataProcess",
            {
                volume: 0.28
            }
        );

    },


    revealEvidence() {

        return this.play(
            "evidenceReveal",
            {
                volume: 0.48
            }
        );

    },


    /* =====================================================
       HOLOGRAMM
       ===================================================== */

    hologram() {

        return this.play(
            "hologram",
            {
                volume: 0.45
            }
        );

    },


    hologramLoop() {

        return this.play(
            "hologramLoop",
            {
                volume: 0.16,
                loop: true
            }
        );

    },


    /* =====================================================
       FORTSCHRITT
       ===================================================== */

    completeCase() {

        return this.play(
            "caseComplete",
            {
                volume: 0.50
            }
        );

    },


    progressUnlock() {

        return this.play(
            "progressUnlock",
            {
                volume: 0.40
            }
        );

    },


    sparkle() {

        return this.play(
            "sparkle",
            {
                volume: 0.20
            }
        );

    },


    doubleSparkle() {

        return this.play(
            "doubleSparkle",
            {
                volume: 0.24
            }
        );

    },


    /* =====================================================
       FINALE
       ===================================================== */

    finalReveal() {

        this.stopSound(
            "scanLoop"
        );


        this.stopSound(
            "hologramLoop"
        );


        return this.play(
            "finalReveal",
            {
                volume: 0.82
            }
        );

    },


    finalComplete() {

        return this.play(
            "finalComplete",
            {
                volume: 0.58
            }
        );

    },


    /* =====================================================
       RESET
       ===================================================== */

    reset() {

        return this.play(
            "reset",
            {
                volume: 0.38
            }
        );

    },


    /* =====================================================
       FEHLER
       ===================================================== */

    error() {

        return this.play(
            "error",
            {
                volume: 0.32
            }
        );

    },


    /* =====================================================
       AKTE 3
       ===================================================== */

    aussage1() {

        return this.play(
            "aussage1",
            {
                volume: 0.85
            }
        );

    },


    aussage2() {

        return this.play(
            "aussage2",
            {
                volume: 0.85
            }
        );

    },


    aussage3() {

        return this.play(
            "aussage3",
            {
                volume: 0.85
            }
        );

    },


    aussage4() {

        return this.play(
            "aussage4",
            {
                volume: 0.85
            }
        );

    },


    stopAussagen() {

        [
            "aussage1",
            "aussage2",
            "aussage3",
            "aussage4"

        ].forEach(
            soundName => {

                this.stopSound(
                    soundName
                );

            }
        );

    }

};


/* =========================================================
   iOS / iPadOS AUDIO UNLOCK

   Safari benötigt für die Audio-Freigabe eine echte
   Benutzerinteraktion.

   pointerdown deckt moderne iOS-/iPadOS-Geräte ab.
   touchstart bleibt als Fallback für ältere WebKit-Versionen.

   Es wird kein hörbarer Sound gestartet.
   ========================================================= */

let jacAudioUserInteractionHandled =
    false;


function jacUnlockAudioFromUserInteraction() {

    /*
     * Initialen Unlock genau einmal durchführen.
     */
    if (
        !jacAudioUserInteractionHandled
    ) {

        jacAudioUserInteractionHandled =
            true;


        /*
         * unlock() innerhalb der Benutzerinteraktion.
         */
        JACAudio.unlock()
            .catch(() => {});


        return;

    }


    /*
     * Safari kann den Context später wieder suspendieren.
     */
    if (
        JACAudio.audioContext &&
        JACAudio.audioContext.state ===
            "suspended"
    ) {

        JACAudio.audioContext
            .resume()
            .catch(() => {});

    }

}


/*
 * Moderner iOS-Pfad.
 */
document.addEventListener(
    "pointerdown",
    jacUnlockAudioFromUserInteraction,
    {
        passive: true,
        capture: true
    }
);


/*
 * Fallback für ältere iOS-/WebKit-Versionen.
 */
document.addEventListener(
    "touchstart",
    jacUnlockAudioFromUserInteraction,
    {
        passive: true,
        capture: true
    }
);


/* =========================================================
   iOS / iPadOS:

   Bei Rückkehr aus dem Hintergrund AudioContext wieder
   aktivieren.

   Es wird dabei kein Sound automatisch gestartet.
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            JACAudio.keepContextRunning();

        }

    }
);


/* =========================================================
   DOM INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        JACAudio.init();

    }
);


/* =========================================================
   GLOBALE API
   ========================================================= */

window.JACAudio =
    JACAudio;


/* =========================================================
   ENDE
   ========================================================= */