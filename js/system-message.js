"use strict";

/* =========================================================
   JAC PORTAL
   SYSTEMMITTEILUNG
   ========================================================= */


/* =========================================================
   ELEMENT
========================================================= */

const openMessageButton =
    document.getElementById(
        "open-message-button"
    );


/* =========================================================
   AUDIO
========================================================= */

function initializeSystemAudio() {

    if (
        typeof window.JACAudio ===
        "undefined"
    ) {

        console.warn(
            "JAC Audio ist nicht verfügbar."
        );

        return;
    }

    try {

        /*
         * Audio-System initialisieren
         */

        if (
            typeof window.JACAudio.init ===
            "function"
        ) {

            window.JACAudio.init();
        }


        /*
         * Audio freischalten,
         * falls bereits eine Benutzeraktion
         * stattgefunden hat.
         */

        if (
            typeof window.JACAudio.unlock ===
            "function"
        ) {

            window.JACAudio.unlock();
        }

    } catch (error) {

        console.warn(
            "JAC Audio konnte nicht initialisiert werden:",
            error
        );
    }
}


/* =========================================================
   SYSTEMMITTEILUNG SOUND
========================================================= */

function playMessageSound() {

    if (
        typeof window.JACAudio ===
        "undefined"
    ) {

        return;
    }

    try {

        if (
            typeof window.JACAudio.message ===
            "function"
        ) {

            window.JACAudio.message();
        }

    } catch (error) {

        console.warn(
            "JAC Systemmitteilungs-Sound konnte nicht abgespielt werden:",
            error
        );
    }
}


/* =========================================================
   BUTTON SOUND
========================================================= */

function playButtonSound() {

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

    } catch (error) {

        console.warn(
            "JAC Button-Sound konnte nicht abgespielt werden:",
            error
        );
    }
}


/* =========================================================
   WEITERLEITUNG
========================================================= */

function openInstruction() {

    /*
     * Button-Sound
     */

    playButtonSound();


    /*
     * Kurze Verzögerung,
     * damit der Klick-Sound hörbar bleibt.
     */

    setTimeout(() => {

        window.location.href =
            "intro-video.html";

    }, 180);
}


/* =========================================================
   DOM READY
========================================================= */

function initializeSystemMessage() {

    /*
     * Audio vorbereiten
     */

    initializeSystemAudio();


    /*
     * Systemmitteilungs-Sound
     */

    setTimeout(() => {

        playMessageSound();

    }, 150);


    /*
     * Button
     */

    if (openMessageButton) {

        openMessageButton.addEventListener(
            "click",
            openInstruction
        );

    } else {

        console.warn(
            "JAC: Button #open-message-button wurde nicht gefunden."
        );
    }
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSystemMessage
    );

} else {

    initializeSystemMessage();
}