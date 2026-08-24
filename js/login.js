"use strict";

/* =========================================================
   JAC PORTAL
   LOGIN
   ========================================================= */


/* =========================================================
   ZUGANGSDATEN
   ========================================================= */

const JAC_LOGIN_ID = "JAC-090996";
const JAC_LOGIN_CODE = "M30H-U96K";


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
                error
            );

        }

    }

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

        participantIdInput.disabled =
            true;

    }

    if (accessCodeInput) {

        accessCodeInput.disabled =
            true;

    }

    if (loginButton) {

        loginButton.disabled =
            true;

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
       FELDER LEER
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


    loginRunning =
        true;


    lockLogin();


    /* -----------------------------------------------------
       SOFORTIGER KLICK-SOUND
    ----------------------------------------------------- */

    jacSound("click");


    /* -----------------------------------------------------
       SYSTEMMELDUNG
    ----------------------------------------------------- */

    showMessage(
        "Zugangsdaten werden verifiziert...",
        "info"
    );


    /* -----------------------------------------------------
       SCAN
    ----------------------------------------------------- */

    setTimeout(
        () => {

            jacSound("scanStart");

            showMessage(
                "Identität wird überprüft...",
                "info"
            );

        },
        250
    );


    /* -----------------------------------------------------
       BIOMETRIE
    ----------------------------------------------------- */

    setTimeout(
        () => {

            jacSound("fingerprintScan");

            showMessage(
                "Biometrische Daten werden abgeglichen...",
                "info"
            );

        },
        850
    );


    /* -----------------------------------------------------
       ERFOLG
    ----------------------------------------------------- */

    setTimeout(
        () => {

            jacSound("scanSuccess");

            showMessage(
                "Identität bestätigt. Zugang freigegeben.",
                "success"
            );

        },
        1450
    );


    /* -----------------------------------------------------
       SYSTEM BEREIT
    ----------------------------------------------------- */

    setTimeout(
        () => {

            jacSound("ready");

        },
        1750
    );


    /* -----------------------------------------------------
       VERIFIZIERUNG
    ----------------------------------------------------- */

    setTimeout(
        () => {

            window.location.href =
                "verifizierung.html";

        },
        2200
    );

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


            /*
               WICHTIG:
               Sound direkt innerhalb der
               Benutzeraktion.
            */

            jacSound("click");


            if (!checkLogin()) {

                return;

            }


            /*
               Bei korrekten Daten
               Login-Prozess starten.
            */

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
               Kein separater Sound hier,
               damit der Klick nicht doppelt ertönt.

               Der Submit-Handler übernimmt ihn.
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
           Audio initialisieren,
           falls audio.js vorhanden ist.
        */

        if (
            window.JACAudio &&
            typeof window.JACAudio.init ===
                "function"
        ) {

            window.JACAudio.init();

        }


        /*
           Erstes Feld fokussieren.
        */

        if (participantIdInput) {

            participantIdInput.focus();

        }

    }
);