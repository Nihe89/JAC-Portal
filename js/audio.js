"use strict";

/* =========================================================
   JAC PORTAL
   AUDIO.JS
   ZENTRALE AUDIO-ENGINE

   VERSION:
   - Dashboard-Hintergrundloop vollständig entfernt
   - UI-Klicks deutlich lauter
   - Boot-/Scan-Sounds unverändert
   - Akten-Klicks verwenden ui-click.wav
   - Aktenöffnung verwendet case-open.wav
   ========================================================= */


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

        /* =====================================================
           UI
        ===================================================== */

        uiClick:
            "ui-click.wav",

        uiHover:
            "ui-hover.wav",


        /* =====================================================
           SYSTEM
        ===================================================== */

        systemBoot:
            "system-boot.wav",

        systemReady:
            "system-ready.wav",

        systemMessage:
            "system-message.wav",


        /* =====================================================
           AKTEN
        ===================================================== */

        caseUnlock:
            "case-unlock.wav",

        caseOpen:
            "case-open.wav",

        envelopeOpen:
            "envelope-open.wav",


        /* =====================================================
           SCAN
        ===================================================== */

        scanStart:
            "scan-start.wav",

        scanLoop:
            "scan-loop.wav",

        scanSuccess:
            "scan-success.wav",

        scanDenied:
            "scan-denied.wav",

        fingerprintScan:
            "fingerprint-scan.wav",


        /* =====================================================
           DATEN
        ===================================================== */

        dataProcess:
            "data-process.wav",

        evidenceReveal:
            "evidence-reveal.wav",


        /* =====================================================
           HOLOGRAMM
        ===================================================== */

        hologram:
            "hologram.wav",

        hologramLoop:
            "hologram-loop.wav",


        /* =====================================================
           FORTSCHRITT
        ===================================================== */

        caseComplete:
            "case-complete.wav",

        progressUnlock:
            "progress-unlock.wav",

        sparkle:
            "sparkle.wav",

        doubleSparkle:
            "double-sparkle.wav",


        /* =====================================================
           ABSCHLUSS
        ===================================================== */

        finalReveal:
            "final-reveal.wav",

        finalComplete:
            "final-complete.wav",


        /* =====================================================
           RESET
        ===================================================== */

        reset:
            "reset.wav",

        error:
            "error.wav"

    },


    /* =========================================================
       AKTE 3
    ========================================================= */

    akte3: {

        aussage1:
            "akte3/aussage1.mp3",

        aussage2:
            "akte3/aussage2.mp3",

        aussage3:
            "akte3/aussage3.mp3",

        aussage4:
            "akte3/aussage4.mp3"

    }

};


/* =========================================================
   AUDIO ENGINE
========================================================= */

const JACAudio = {

    instances: {},

    activeSounds:
        new Set(),

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
       INIT
    ===================================================== */

    init() {

        if (this.initialized) {

            return;

        }


        this.initialized =
            true;


        this.prepareSounds();

    },


    /* =====================================================
       SOUNDS VORBEREITEN
    ===================================================== */

    prepareSounds() {

        Object.keys(
            JAC_AUDIO.sounds
        ).forEach(
            soundName => {

                const audio =
                    new Audio(
                        JAC_AUDIO.basePath +
                        JAC_AUDIO.sounds[
                            soundName
                        ]
                    );


                audio.preload =
                    "auto";


                audio.autoplay =
                    false;


                audio.volume =
                    this.volume;


                this.instances[
                    soundName
                ] =
                    audio;

            }
        );


        Object.keys(
            JAC_AUDIO.akte3
        ).forEach(
            soundName => {

                const audio =
                    new Audio(
                        JAC_AUDIO.basePath +
                        JAC_AUDIO.akte3[
                            soundName
                        ]
                    );


                audio.preload =
                    "metadata";


                audio.autoplay =
                    false;


                audio.volume =
                    this.volume;


                this.instances[
                    soundName
                ] =
                    audio;

            }
        );

    },


    /* =====================================================
       AUDIO FREISCHALTEN

       Diese Funktion wird aus dem Benutzerklick
       im SYSTEM BOOT aufgerufen.
    ===================================================== */

    async unlock() {

        this.init();


        if (this.audioUnlocked) {

            sessionStorage.setItem(
                JAC_AUDIO_UNLOCK_KEY,
                "true"
            );


            return true;

        }


        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            if (AudioContext) {

                if (!this.audioContext) {

                    this.audioContext =
                        new AudioContext();

                }


                if (
                    this.audioContext.state ===
                    "suspended"
                ) {

                    await this.audioContext.resume();

                }


                if (
                    this.audioContext.state ===
                    "running"
                ) {

                    this.audioUnlocked =
                        true;

                }

            }

        }


        catch (error) {

            console.warn(
                "JAC AudioContext:",
                error
            );

        }


        /*
         * Browser ohne WebAudio:
         * Wir behandeln Audio trotzdem als freigegeben.
         */

        this.audioUnlocked =
            true;


        /*
         * WICHTIG:
         * Diese Information überlebt den Seitenwechsel
         * vom System-Boot zum Dashboard.
         */

        sessionStorage.setItem(
            JAC_AUDIO_UNLOCK_KEY,
            "true"
        );


        return true;

    },


    /* =====================================================
       PRÜFEN, OB AUDIO BEREITS FREIGEGEBEN WURDE
    ===================================================== */

    hasUnlockFromBoot() {

        return (
            sessionStorage.getItem(
                JAC_AUDIO_UNLOCK_KEY
            ) === "true"
        );

    },


    /* =====================================================
       SOUND ABSPIELEN
    ===================================================== */

    play(
        soundName,
        options = {}
    ) {

        this.init();


        if (!this.enabled) {

            return null;

        }


        const original =
            this.instances[
                soundName
            ];


        if (!original) {

            console.warn(
                "JAC Audio: Sound nicht gefunden:",
                soundName
            );


            return null;

        }


        /*
         * Für jeden Aufruf eine eigene Instanz.
         * Dadurch können schnelle Klicks
         * zuverlässig hintereinander abgespielt werden.
         */

        const audio =
            original.cloneNode(true);


        audio.volume =
            typeof options.volume === "number"
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

        this.activeSounds.forEach(
            audio => {

                try {

                    audio.pause();

                    audio.currentTime =
                        0;

                }


                catch (error) {

                    /* absichtlich leer */

                }

            }
        );


        this.activeSounds.clear();

    },


    /* =====================================================
       SOUND NACH NAMEN STOPPEN
    ===================================================== */

    stopSound(soundName) {

        const filename =
            JAC_AUDIO.sounds[
                soundName
            ] ||
            JAC_AUDIO.akte3[
                soundName
            ];


        if (!filename) {

            return;

        }


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

                        this.stop(
                            audio
                        );

                    }

                }


                catch (error) {

                    /* absichtlich leer */

                }

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


    /*
     * =====================================================
     * JAC BUTTON CLICK
     * =====================================================
     *
     * VORHER:
     *
     * volume: 0.30
     *
     * JETZT:
     *
     * volume: 0.60
     *
     * Dadurch werden ALLE Stellen im Portal,
     * die JACAudio.click() verwenden,
     * automatisch deutlich hörbarer.
     */

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