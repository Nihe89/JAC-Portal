"use strict";

/* =========================================================
   JAC PORTAL
   VERTRAULICHE EINWEISUNG
   INTRO VIDEO
   STABILE AUDIO-VERSION
   ========================================================= */


/* =========================================================
   DOM-ELEMENTE
========================================================= */

const introVideo =
    document.getElementById("intro-video");

const introOverlay =
    document.getElementById("intro-overlay");

const startIntroButton =
    document.getElementById("start-intro");


/* =========================================================
   SICHERHEITSCHECK
========================================================= */

if (
    !introVideo ||
    !introOverlay ||
    !startIntroButton
) {

    console.error(
        "JAC: Intro-Elemente wurden nicht vollständig gefunden."
    );

}


/* =========================================================
   INITIALZUSTAND
========================================================= */

if (introVideo) {

    introVideo.style.display = "none";

    introVideo.pause();

    introVideo.currentTime = 0;

}


/* =========================================================
   AUDIO INITIALISIEREN
========================================================= */

function initIntroAudio() {

    if (
        typeof window.JACAudio ===
        "undefined"
    ) {

        console.warn(
            "JAC: JACAudio wurde nicht gefunden."
        );

        return;

    }


    try {

        if (
            typeof window.JACAudio.init ===
            "function"
        ) {

            window.JACAudio.init();

        }

    }

    catch (error) {

        console.warn(
            "JAC: Audio konnte nicht initialisiert werden.",
            error
        );

    }

}


/* =========================================================
   AUDIO FREISCHALTEN
========================================================= */

async function unlockIntroAudio() {

    if (
        typeof window.JACAudio ===
        "undefined"
    ) {

        return false;

    }


    try {

        if (
            typeof window.JACAudio.unlock ===
            "function"
        ) {

            await window.JACAudio.unlock();

            return true;

        }

    }

    catch (error) {

        console.warn(
            "JAC: Audio konnte nicht freigeschaltet werden.",
            error
        );

    }


    return false;

}


/* =========================================================
   KLICK-SOUND
========================================================= */

function playIntroClick() {

    if (
        typeof window.JACAudio ===
        "undefined"
    ) {

        return;

    }


    try {

        if (
            typeof window.JACAudio.click ===
            "function"
        ) {

            window.JACAudio.click();

        }

    }

    catch (error) {

        console.warn(
            "JAC: Klick-Sound konnte nicht abgespielt werden.",
            error
        );

    }

}


/* =========================================================
   STARTBUTTON SPERREN
========================================================= */

function lockStartButton() {

    if (!startIntroButton) {

        return;

    }


    startIntroButton.disabled =
        true;


    startIntroButton.setAttribute(
        "aria-disabled",
        "true"
    );


    startIntroButton.textContent =
        "▶ EINWEISUNG WIRD GESTARTET...";

}


/* =========================================================
   STARTBUTTON ZURÜCKSETZEN
========================================================= */

function resetStartButton() {

    if (!startIntroButton) {

        return;

    }


    startIntroButton.disabled =
        false;


    startIntroButton.removeAttribute(
        "aria-disabled"
    );


    startIntroButton.textContent =
        "▶ EINWEISUNG STARTEN";

}


/* =========================================================
   OVERLAY AUSBLENDEN
========================================================= */

function hideIntroOverlay() {

    if (!introOverlay) {

        return;

    }


    introOverlay.classList.add(
        "hidden"
    );

}


/* =========================================================
   VIDEO ANZEIGEN
========================================================= */

function showIntroVideo() {

    if (!introVideo) {

        return;

    }


    introVideo.style.display =
        "block";

}


/* =========================================================
   VIDEO ZURÜCKSETZEN
========================================================= */

function resetIntroVideo() {

    if (!introVideo) {

        return;

    }


    try {

        introVideo.pause();

        introVideo.currentTime = 0;

    }

    catch (error) {

        console.warn(
            "JAC: Video konnte nicht zurückgesetzt werden.",
            error
        );

    }

}


/* =========================================================
   VOLLBILD
========================================================= */

async function enterIntroFullscreen() {

    if (!introVideo) {

        return false;

    }


    try {

        if (
            introVideo.requestFullscreen
        ) {

            await introVideo.requestFullscreen();

            return true;

        }


        if (
            introVideo.webkitRequestFullscreen
        ) {

            introVideo.webkitRequestFullscreen();

            return true;

        }


        if (
            introVideo.msRequestFullscreen
        ) {

            introVideo.msRequestFullscreen();

            return true;

        }

    }

    catch (error) {

        /*
         * Vollbild ist nicht zwingend notwendig.
         * Das Video darf trotzdem starten.
         */

        console.warn(
            "JAC: Vollbild konnte nicht aktiviert werden.",
            error
        );

    }


    return false;

}


/* =========================================================
   VIDEO STARTEN
========================================================= */

async function playIntroVideo() {

    if (!introVideo) {

        return false;

    }


    try {

        /*
         * Ganz wichtig:
         *
         * Das Video wird NICHT stumm geschaltet.
         *
         * Der Benutzer hat gerade auf den
         * Startbutton geklickt.
         */

        introVideo.muted =
            false;


        introVideo.volume =
            1.0;


        const playPromise =
            introVideo.play();


        if (
            playPromise &&
            typeof playPromise.then ===
            "function"
        ) {

            await playPromise;

        }


        return true;

    }

    catch (error) {

        console.error(
            "JAC: Intro-Video konnte nicht gestartet werden.",
            error
        );


        return false;

    }

}


/* =========================================================
   EINWEISUNG STARTEN
========================================================= */

async function startIntroVideo() {

    if (
        !introVideo ||
        !introOverlay ||
        !startIntroButton
    ) {

        return;

    }


    /*
     * Doppelklick verhindern.
     */

    if (
        startIntroButton.disabled
    ) {

        return;

    }


    /* =====================================================
       BENUTZERAKTION
       
       Ab hier befinden wir uns direkt im Klick-Event.
       Deshalb muss die Audiofreigabe HIER erfolgen.
    ===================================================== */

    initIntroAudio();


    /*
     * Audio freischalten.
     */

    await unlockIntroAudio();


    /*
     * Klick-Sound.
     *
     * Dieser bleibt wie bisher erhalten.
     */

    playIntroClick();


    /*
     * Button sperren.
     */

    lockStartButton();


    /* =====================================================
       VIDEO VORBEREITEN
    ===================================================== */

    resetIntroVideo();


    showIntroVideo();


    hideIntroOverlay();


    /* =====================================================
       VIDEO STARTEN
       
       Zuerst das Video starten.
       Danach versuchen wir Vollbild.
    ===================================================== */

    const videoStarted =
        await playIntroVideo();


    if (!videoStarted) {

        /*
         * Fehler:
         * Startbildschirm wieder anzeigen.
         */

        introVideo.style.display =
            "none";


        introOverlay.classList.remove(
            "hidden"
        );


        resetStartButton();


        return;

    }


    /* =====================================================
       VOLLBILD
       
       Der Vollbildaufruf erfolgt weiterhin innerhalb
       des durch den Button ausgelösten Ablaufs.
    ===================================================== */

    await enterIntroFullscreen();

}


/* =========================================================
   BUTTON-EVENT
========================================================= */

if (startIntroButton) {

    startIntroButton.addEventListener(
        "click",
        startIntroVideo
    );

}


/* =========================================================
   VIDEO BEENDET
========================================================= */

if (introVideo) {

    introVideo.addEventListener(
        "ended",
        finishIntroVideo
    );

}


/* =========================================================
   VIDEO FEHLER
========================================================= */

if (introVideo) {

    introVideo.addEventListener(
        "error",
        function() {

            console.error(
                "JAC: Fehler beim Laden des Intro-Videos."
            );

            if (introOverlay) {

                introOverlay.classList.remove(
                    "hidden"
                );

            }


            introVideo.style.display =
                "none";


            resetStartButton();

        }
    );

}


/* =========================================================
   INTRO BEENDET
========================================================= */

async function finishIntroVideo() {

    if (!introVideo) {

        return;

    }


    /* =====================================================
       VIDEO STOPPEN
    ===================================================== */

    try {

        introVideo.pause();

    }

    catch (error) {

        console.warn(
            "JAC: Video konnte nicht pausiert werden.",
            error
        );

    }


    /* =====================================================
       VOLLBILD VERLASSEN
    ===================================================== */

    try {

        const fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;


        if (fullscreenElement) {

            if (
                document.exitFullscreen
            ) {

                await document.exitFullscreen();

            }

            else if (
                document.webkitExitFullscreen
            ) {

                document.webkitExitFullscreen();

            }

            else if (
                document.msExitFullscreen
            ) {

                document.msExitFullscreen();

            }

        }

    }

    catch (error) {

        console.warn(
            "JAC: Vollbild konnte nicht beendet werden.",
            error
        );

    }


    /* =====================================================
       KURZE ÜBERGANGSPAUSE
    ===================================================== */

    await new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                500
            );

        }
    );


    /* =====================================================
       PRÜFUNG 2
    ===================================================== */

    window.location.href =
        "pruefung-2.html";

}


/* =========================================================
   ENDE
========================================================= */