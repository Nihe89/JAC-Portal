"use strict";

/* =========================================================
   JAC PORTAL
   LOGIN
   WINDOWS + ANDROID
   STABILES AUDIO-SYSTEM
   ========================================================= */


/* =========================================================
   ZUGANGSDATEN
========================================================= */

const JAC_LOGIN_ID = "JAC-090996";
const JAC_LOGIN_CODE = "M30H-U96J";


/* =========================================================
   DOM
========================================================= */

const loginForm =
    document.getElementById("login-form");

const participantIdInput =
    document.getElementById("participant-id");

const accessCodeInput =
    document.getElementById("access-code");

const loginButton =
    document.getElementById("login-button");

const loginMessage =
    document.getElementById("login-message");


/* =========================================================
   STATUS
========================================================= */

let loginRunning = false;


/* =========================================================
   AUDIO
========================================================= */

/*
 * WICHTIG:
 *
 * Hier wird wieder ausschließlich das
 * bestehende JACAudio verwendet.
 *
 * Das separate iOS-System wird NICHT
 * in den normalen Login eingebaut.
 */

function jacSound(name) {

    if (
        window.JACAudio &&
        typeof window.JACAudio[name] === "function"
    ) {

        try {

            return window.JACAudio[name]();

        } catch (error) {

            console.warn(
                "JAC Audio Fehler:",
                name,
                error
            );

        }

    }

    console.warn(
        "JAC Audio Funktion nicht vorhanden:",
        name
    );

    return null;
}


/* =========================================================
   NACHRICHT
========================================================= */

function showMessage(
    text,
    type = ""
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        text;

    loginMessage.className =
        type
            ? `login-message ${type}`
            : "login-message";
}


/* =========================================================
   LOGIN SPERREN
========================================================= */

function lockLogin() {

    if (participantIdInput) {
        participantIdInput.disabled = true;
    }

    if (accessCodeInput) {
        accessCodeInput.disabled = true;
    }

    if (loginButton) {
        loginButton.disabled = true;
    }
}


/* =========================================================
   LOGIN PRÜFEN
========================================================= */

function checkLogin() {

    const enteredId =
        participantIdInput
            ? participantIdInput.value
                .trim()
                .toUpperCase()
            : "";

    const enteredCode =
        accessCodeInput
            ? accessCodeInput.value.trim()
            : "";


    /* -----------------------------------------------------
       TEILNEHMER-ID FEHLT
    ----------------------------------------------------- */

    if (!enteredId) {

        jacSound("error");

        showMessage(
            "Bitte Teilnehmer-ID eingeben.",
            "error"
        );

        if (participantIdInput) {
            participantIdInput.focus();
        }

        return false;
    }


    /* -----------------------------------------------------
       ZUGANGSCODE FEHLT
    ----------------------------------------------------- */

    if (!enteredCode) {

        jacSound("error");

        showMessage(
            "Bitte Zugangscode eingeben.",
            "error"
        );

        if (accessCodeInput) {
            accessCodeInput.focus();
        }

        return false;
    }


    /* -----------------------------------------------------
       ZUGANGSDATEN FALSCH
    ----------------------------------------------------- */

    if (
        enteredId !== JAC_LOGIN_ID ||
        enteredCode !== JAC_LOGIN_CODE
    ) {

        jacSound("scanDenied");

        showMessage(
            "Zugangsdaten nicht verifiziert.",
            "error"
        );

        return false;
    }


    return true;
}


/* =========================================================
   LOGIN STARTEN
========================================================= */

function startLogin() {

    if (loginRunning) {
        return;
    }

    loginRunning = true;

    lockLogin();


    /* =====================================================
       AUDIO INITIALISIEREN
    ===================================================== */

    /*
     * Nur das bestehende Audiosystem.
     *
     * Die Initialisierung passiert hier,
     * nachdem der Benutzer auf LOGIN geklickt hat.
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.init === "function"
    ) {

        try {

            window.JACAudio.init();

        } catch (error) {

            console.warn(
                "JAC Audio konnte nicht initialisiert werden:",
                error
            );

        }

    }


    /* =====================================================
       KLICK
    ===================================================== */

    jacSound("click");


    /* =====================================================
       LOGIN NACHRICHT
    ===================================================== */

    showMessage(
        "Zugangsdaten werden verifiziert...",
        "info"
    );


    /* =====================================================
       SCANNER START
    ===================================================== */

    setTimeout(() => {

        jacSound("scanStart");

        showMessage(
            "Identität wird überprüft...",
            "info"
        );

    }, 400);


    /* =====================================================
       BIOMETRISCHE PRÜFUNG
    ===================================================== */

    setTimeout(() => {

        jacSound("fingerprintScan");

        showMessage(
            "Biometrische Daten werden abgeglichen...",
            "info"
        );

    }, 1400);


    /* =====================================================
       ERFOLG
    ===================================================== */

    setTimeout(() => {

        jacSound("scanSuccess");

        showMessage(
            "Identität bestätigt. Zugang freigegeben.",
            "success"
        );

    }, 2400);


    /* =====================================================
       SYSTEM BEREIT
    ===================================================== */

    setTimeout(() => {

        jacSound("ready");

    }, 3100);


    /* =====================================================
       NOCH KURZ LOGIN SICHTBAR LASSEN
    ===================================================== */

    /*
     * Die erfolgreiche Login-Sequenz darf
     * vollständig sichtbar und hörbar werden,
     * bevor die nächste Seite geladen wird.
     */

    setTimeout(() => {

        window.location.href =
            "verifizierung.html";

    }, 4300);

}


/* =========================================================
   FORMULAR
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (loginRunning) {
                return;
            }


            /* ---------------------------------------------
               LOGIN PRÜFEN
            --------------------------------------------- */

            if (!checkLogin()) {
                return;
            }


            /* ---------------------------------------------
               LOGIN STARTEN
            --------------------------------------------- */

            startLogin();

        }
    );

}


/* =========================================================
   BUTTON
========================================================= */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        () => {

            /*
             * Absichtlich leer.
             *
             * Der Submit-Handler übernimmt
             * den eigentlichen Ablauf.
             *
             * Dadurch gibt es keinen doppelten Klick-Sound.
             */

        }
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Bestehendes JACAudio initialisieren,
         * sofern vorhanden.
         */

        if (
            window.JACAudio &&
            typeof window.JACAudio.init === "function"
        ) {

            try {

                window.JACAudio.init();

            } catch (error) {

                console.warn(
                    "JAC Audio Initialisierung:",
                    error
                );

            }

        }


        /* ---------------------------------------------
           ERSTES FELD FOKUSSIEREN
        --------------------------------------------- */

        if (participantIdInput) {
            participantIdInput.focus();
        }

    }
);


/* =========================================================
   ENDE LOGIN
========================================================= */