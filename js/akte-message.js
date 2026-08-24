"use strict";

/* =========================================================
   JAC PORTAL
   AKTE-MESSAGE.JS

   FREIGABESEITE FÜR DIE NÄCHSTE AKTE

   FUNKTION:
   - nächste Akte aus JACGameState ermitteln
   - richtige Meldung anzeigen
   - Button aktivieren
   - beim Klick EINMAL ui-click.wav
   - anschließend richtige Akte öffnen

   AUDIO:
   - ausschließlich JACAudio.click()
   - KEIN envelope-open
   - KEIN envelope-wave
   - KEIN Loop
========================================================= */


/* =========================================================
   AKTEN-KONFIGURATION
========================================================= */

const CASE_MESSAGES = {

    1: {

        title:
            "ERMITTLUNGSPHASE FREIGEGEBEN",

        caseTitle:
            "AKTE 01",

        intro:
            "Die erste Ermittlungsphase wurde für Sie freigegeben.",

        warning:
            "UMSCHLAG 01 DARF JETZT GEÖFFNET WERDEN.",

        instruction:
            "Öffnen Sie ausschließlich den freigegebenen Umschlag und folgen Sie anschließend den Anweisungen der Ermittlungsakte.",

        button:
            "AKTE 01 ÖFFNEN",

        url:
            "akte1.html"

    },


    2: {

        title:
            "ZWEITE ERMITTLUNGSPHASE FREIGEGEBEN",

        caseTitle:
            "AKTE 02",

        intro:
            "Die zweite Ermittlungsphase wurde für Sie freigegeben.",

        warning:
            "UMSCHLAG 02 DARF JETZT GEÖFFNET WERDEN.",

        instruction:
            "Öffnen Sie ausschließlich den freigegebenen Umschlag und folgen Sie anschließend den Anweisungen der Ermittlungsakte.",

        button:
            "AKTE 02 ÖFFNEN",

        url:
            "akte2.html"

    },


    3: {

        title:
            "DRITTE ERMITTLUNGSPHASE FREIGEGEBEN",

        caseTitle:
            "AKTE 03",

        intro:
            "Die dritte Ermittlungsphase wurde für Sie freigegeben.",

        warning:
            "UMSCHLAG 03 DARF JETZT GEÖFFNET WERDEN.",

        instruction:
            "Öffnen Sie ausschließlich den freigegebenen Umschlag und folgen Sie anschließend den Anweisungen der Ermittlungsakte.",

        button:
            "AKTE 03 ÖFFNEN",

        url:
            "akte3.html"

    },


    4: {

        title:
            "VIERTE ERMITTLUNGSPHASE FREIGEGEBEN",

        caseTitle:
            "AKTE 04",

        intro:
            "Die vierte Ermittlungsphase wurde für Sie freigegeben.",

        warning:
            "UMSCHLAG 04 DARF JETZT GEÖFFNET WERDEN.",

        instruction:
            "Öffnen Sie ausschließlich den freigegebenen Umschlag und folgen Sie anschließend den Anweisungen der Ermittlungsakte.",

        button:
            "AKTE 04 ÖFFNEN",

        url:
            "akte4.html"

    },


    5: {

        title:
            "LETZTE ERMITTLUNGSPHASE FREIGEGEBEN",

        caseTitle:
            "AKTE 05",

        intro:
            "Die letzte Ermittlungsphase wurde für Sie freigegeben.",

        warning:
            "UMSCHLAG 05 DARF JETZT GEÖFFNET WERDEN.",

        instruction:
            "Öffnen Sie ausschließlich den freigegebenen Umschlag und folgen Sie anschließend den Anweisungen der Ermittlungsakte.",

        button:
            "AKTE 05 ÖFFNEN",

        url:
            "akte5.html"

    }

};


/* =========================================================
   AKTUELLE / NÄCHSTE AKTE
========================================================= */

function getNextJACCase() {

    /*
     * GameState muss vorhanden sein.
     */

    if (
        !window.JACGameState ||
        typeof window.JACGameState.getNextCase !==
        "function"
    ) {

        console.error(
            "JAC: JACGameState.getNextCase() ist nicht verfügbar."
        );

        return null;

    }


    const nextCase =
        window.JACGameState.getNextCase();


    console.log(
        "JAC: Nächste Akte laut GameState:",
        nextCase
    );


    /*
     * Keine weitere Akte vorhanden.
     */

    if (
        nextCase === null ||
        nextCase === undefined
    ) {

        console.log(
            "JAC: Alle Akten wurden abgeschlossen."
        );

        return null;

    }


    const number =
        Number(nextCase);


    if (
        !Number.isInteger(number) ||
        !CASE_MESSAGES[number]
    ) {

        console.error(
            "JAC: Ungültige Aktennummer:",
            nextCase
        );

        return null;

    }


    return number;

}


/* =========================================================
   DOM ELEMENTE
========================================================= */

function getCaseMessageElements() {

    return {

        title:
            document.getElementById(
                "message-title"
            ),

        caseTitle:
            document.getElementById(
                "case-title"
            ),

        intro:
            document.getElementById(
                "message-intro"
            ),

        warning:
            document.getElementById(
                "message-warning"
            ),

        instruction:
            document.getElementById(
                "message-instruction"
            ),

        button:
            document.getElementById(
                "continue-case-button"
            )

    };

}


/* =========================================================
   BUTTON AKTE ÖFFNEN
========================================================= */

function handleCaseOpenClick(event) {

    event.preventDefault();


    const button =
        event.currentTarget;


    /*
     * Sicherheit gegen Doppelklick.
     */

    if (
        button.dataset.opening ===
        "true"
    ) {

        return;

    }


    button.dataset.opening =
        "true";


    /*
     * Aktuelle nächste Akte erneut aus GameState lesen.
     */

    const caseNumber =
        getNextJACCase();


    if (
        caseNumber === null
    ) {

        console.error(
            "JAC: Keine gültige Akte zum Öffnen."
        );


        button.dataset.opening =
            "false";


        button.disabled =
            false;


        return;

    }


    const caseData =
        CASE_MESSAGES[
            caseNumber
        ];


    if (!caseData) {

        console.error(
            "JAC: Keine Konfiguration für Akte:",
            caseNumber
        );


        button.dataset.opening =
            "false";


        button.disabled =
            false;


        return;

    }


    console.log(
        "JAC: Button geklickt.",
        "Öffne:",
        caseData.caseTitle
    );


    /* =====================================================
       UI-KLICK – GENAU EINMAL
    ===================================================== */

    if (
        window.JACAudio &&
        typeof window.JACAudio.click ===
        "function"
    ) {

        console.log(
            "JAC: ui-click.wav wird abgespielt."
        );


        window.JACAudio.click();

    }

    else {

        console.warn(
            "JAC: JACAudio.click() nicht verfügbar."
        );

    }


    /* =====================================================
       BUTTON DEAKTIVIEREN
    ===================================================== */

    button.disabled =
        true;


    button.classList.add(
        "opening"
    );


    /*
     * Kurze Verzögerung, damit der Klicksound hörbar ist.
     */

    window.setTimeout(
        function() {

            console.log(
                "JAC: Weiterleitung zu:",
                caseData.url
            );


            window.location.href =
                caseData.url;

        },
        350
    );

}


/* =========================================================
   MELDUNG AUFBAUEN
========================================================= */

function setupCaseMessage() {

    console.log(
        "JAC: Aktenmeldung wird aufgebaut."
    );


    /*
     * Nächste Akte bestimmen.
     */

    const caseNumber =
        getNextJACCase();


    if (
        caseNumber === null
    ) {

        console.error(
            "JAC: Keine nächste Akte gefunden."
        );

        return;

    }


    const caseData =
        CASE_MESSAGES[
            caseNumber
        ];


    /*
     * DOM holen.
     */

    const elements =
        getCaseMessageElements();


    /*
     * Button muss vorhanden sein.
     */

    if (
        !elements.button
    ) {

        console.error(
            "JAC: Button #continue-case-button nicht gefunden."
        );

        return;

    }


    /* =====================================================
       TEXTE
    ===================================================== */

    if (
        elements.title
    ) {

        elements.title.textContent =
            caseData.title;

    }


    if (
        elements.caseTitle
    ) {

        elements.caseTitle.textContent =
            caseData.caseTitle;

    }


    if (
        elements.intro
    ) {

        elements.intro.textContent =
            caseData.intro;

    }


    if (
        elements.warning
    ) {

        elements.warning.textContent =
            caseData.warning;

    }


    if (
        elements.instruction
    ) {

        elements.instruction.textContent =
            caseData.instruction;

    }


    /* =====================================================
       BUTTON
    ===================================================== */

    elements.button.textContent =
        caseData.button;


    elements.button.disabled =
        false;


    elements.button.dataset.opening =
        "false";


    /*
     * Wichtig:
     * onclick komplett entfernen.
     */

    elements.button.onclick =
        null;


    /*
     * Alten JAC-Listener entfernen,
     * indem Button durch Klon ersetzt wird.
     *
     * Dadurch gibt es garantiert nur EINEN
     * Click-Listener.
     */

    const cleanButton =
        elements.button.cloneNode(true);


    cleanButton.textContent =
        caseData.button;


    cleanButton.disabled =
        false;


    cleanButton.dataset.opening =
        "false";


    cleanButton.classList.remove(
        "opening"
    );


    elements.button.parentNode.replaceChild(
        cleanButton,
        elements.button
    );


    /*
     * EINEN Click-Listener setzen.
     */

    cleanButton.addEventListener(
        "click",
        handleCaseOpenClick
    );


    /* =====================================================
       SEITENTITEL
    ===================================================== */

    document.title =
        "JAC Portal | " +
        caseData.caseTitle;


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "========================================"
    );

    console.log(
        "JAC AKTENMELDUNG"
    );

    console.log(
        "Abgeschlossene Akten:",
        window.JACGameState
            .getGameState()
            .completedCases
    );

    console.log(
        "Nächste Akte:",
        caseNumber
    );

    console.log(
        "Angezeigte Akte:",
        caseData.caseTitle
    );

    console.log(
        "Ziel:",
        caseData.url
    );

    console.log(
        "========================================"
    );

}


/* =========================================================
   START
========================================================= */

function startCaseMessage() {

    console.log(
        "JAC: akte-message.js gestartet."
    );


    /*
     * Prüfen, ob GameState geladen wurde.
     */

    if (
        !window.JACGameState
    ) {

        console.error(
            "JAC: gameState.js wurde vor akte-message.js nicht geladen."
        );

        return;

    }


    /*
     * Meldung aufbauen.
     */

    setupCaseMessage();

}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startCaseMessage,
        {
            once: true
        }
    );

}

else {

    startCaseMessage();

}


/* =========================================================
   GLOBALE API
========================================================= */

window.JACCaseMessage = {

    getNextCase:
        getNextJACCase,

    setup:
        setupCaseMessage

};


/* =========================================================
   ENDE
========================================================= */

console.log(
    "JAC: akte-message.js geladen."
);