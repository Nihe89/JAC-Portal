"use strict";

/* =====================================================
   JAC PORTAL
   AKTE 04
   CODEX / DECRYPTION
   VERSION 5.0
===================================================== */


/* =====================================================
   ELEMENTE
===================================================== */

const startupScreen =
    document.getElementById("startup-screen");

const startupText =
    document.getElementById("startup-text");

const startupProgress =
    document.getElementById("startup-progress");

const startupPercent =
    document.getElementById("startup-percent");

const startSystemButton =
    document.getElementById("start-system");

const solutionInput =
    document.getElementById("solution-input");

const checkSolutionButton =
    document.getElementById("check-solution");

const inputStatus =
    document.getElementById("input-status");

const resultModal =
    document.getElementById("result-modal");

const resultIcon =
    document.getElementById("result-icon");

const resultTitle =
    document.getElementById("result-title");

const resultText =
    document.getElementById("result-text");

const resultButton =
    document.getElementById("result-button");

const completionScreen =
    document.getElementById("completion-screen");

const dashboardButton =
    document.getElementById("dashboard-button");


/* =====================================================
   RICHTIGE LÖSUNG
===================================================== */

const correctSolution =
    "Der Schlüssel ist im Archiv";


/* =====================================================
   STATUS
===================================================== */

let caseCompleted = false;

let startupRunning = false;

let startupFinished = false;


/* =====================================================
   STARTANIMATION
===================================================== */

const startupSteps = [

    {
        text:
            "CODEX-SYSTEM WIRD INITIALISIERT...",
        module: null,
        progress: 8
    },

    {
        text:
            "VERSCHLÜSSELTE DATEN WERDEN ERKANNT...",
        module: 1,
        progress: 28
    },

    {
        text:
            "ZAHLENMUSTER WERDEN ANALYSIERT...",
        module: 2,
        progress: 49
    },

    {
        text:
            "STRUKTUR UND MUSTER WERDEN ABGEGLICHEN...",
        module: 3,
        progress: 72
    },

    {
        text:
            "ENTSCHLÜSSELUNGSMODUL WIRD AKTIVIERT...",
        module: 4,
        progress: 91
    },

    {
        text:
            "CODEX ANALYSE ABGESCHLOSSEN.",
        module: 4,
        progress: 100
    }

];


/* =====================================================
   AUDIO-HILFSFUNKTION
===================================================== */

function playAudio(
    method,
    fallback = null
) {

    if (
        !window.JACAudio
    ) {

        console.warn(
            "JAC Audio: audio.js wurde nicht gefunden."
        );

        return null;

    }


    if (
        typeof window.JACAudio[method] ===
        "function"
    ) {

        return window.JACAudio[method]();

    }


    if (
        fallback &&
        typeof window.JACAudio.play ===
        "function"
    ) {

        return window.JACAudio.play(
            fallback
        );

    }


    return null;

}


/* =====================================================
   AUDIO FREISCHALTEN
===================================================== */

async function unlockAudio() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.unlock ===
        "function"
    ) {

        try {

            await window.JACAudio.unlock();

        }

        catch (error) {

            console.warn(
                "JAC Audio Unlock:",
                error
            );

        }

    }

}


/* =====================================================
   MODULE AKTIVIEREN
===================================================== */

function activateModule(
    moduleNumber
) {

    if (!moduleNumber) {

        return;

    }


    const module =
        document.getElementById(
            "module-" +
            moduleNumber
        );


    if (!module) {

        return;

    }


    const state =
        module.querySelector(
            ".module-state"
        );


    module.classList.add(
        "active"
    );


    if (state) {

        state.textContent =
            "SCAN";

    }


    setTimeout(
        () => {

            module.classList.remove(
                "active"
            );

            module.classList.add(
                "complete"
            );


            if (state) {

                state.textContent =
                    "OK";

            }

        },
        650
    );

}


/* =====================================================
   FORTSCHRITT
===================================================== */

function setStartupProgress(
    value
) {

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    if (startupProgress) {

        startupProgress.style.width =
            progress + "%";

    }


    if (startupPercent) {

        startupPercent.textContent =
            progress + " %";

    }

}


/* =====================================================
   EINEN INTRO-SCHRITT AUSFÜHREN
===================================================== */

function executeStartupStep(
    current
) {

    /* ---------------------------------------------
       TEXT
    --------------------------------------------- */

    if (startupText) {

        startupText.textContent =
            current.text;

    }


    /* ---------------------------------------------
       FORTSCHRITT
    --------------------------------------------- */

    setStartupProgress(
        current.progress
    );


    /* ---------------------------------------------
       MODUL
    --------------------------------------------- */

    activateModule(
        current.module
    );


    /* ---------------------------------------------
       BESTÄTIGUNGSTON
    --------------------------------------------- */

    playAudio(
        "message",
        "systemMessage"
    );

}


/* =====================================================
   STARTANIMATION
===================================================== */

function runStartupAnimation() {

    if (
        !startupScreen ||
        startupRunning ||
        startupFinished
    ) {

        return;

    }


    startupRunning =
        true;


    let step =
        0;


    setStartupProgress(
        0
    );


    const interval =
        setInterval(
            () => {

                if (
                    step >=
                    startupSteps.length
                ) {

                    clearInterval(
                        interval
                    );


                    finishStartupAnimation();

                    return;

                }


                const current =
                    startupSteps[
                        step
                    ];


                executeStartupStep(
                    current
                );


                step++;

            },
            900
        );

}


/* =====================================================
   STARTANIMATION ABSCHLIESSEN
===================================================== */

function finishStartupAnimation() {

    startupFinished =
        true;


    startupRunning =
        false;


    /* ---------------------------------------------
       READY SOUND
    --------------------------------------------- */

    playAudio(
        "ready",
        "systemReady"
    );


    if (startupText) {

        startupText.textContent =
            "SYSTEM BEREIT.";

    }


    setStartupProgress(
        100
    );


    setTimeout(
        () => {

            if (startupScreen) {

                startupScreen.classList.add(
                    "hidden"
                );

            }

        },
        850
    );

}


/* =====================================================
   SYSTEM STARTEN
===================================================== */

async function startSystem() {

    if (
        startupRunning ||
        startupFinished
    ) {

        return;

    }


    if (startSystemButton) {

        startSystemButton.disabled =
            true;

        startSystemButton.textContent =
            "SYSTEM WIRD GESTARTET...";

    }


    /* ---------------------------------------------
       AUDIO UNLOCK
    --------------------------------------------- */

    await unlockAudio();


    /* ---------------------------------------------
       KLICKSOUND
    --------------------------------------------- */

    playAudio(
        "click",
        "uiClick"
    );


    /* ---------------------------------------------
       KURZE PAUSE NACH KLICK
    --------------------------------------------- */

    setTimeout(
        () => {

            /* -------------------------------------
               SYSTEM BOOT
            ------------------------------------- */

            playAudio(
                "boot",
                "systemBoot"
            );


            /* -------------------------------------
               INTRO STARTEN
            ------------------------------------- */

            runStartupAnimation();

        },
        120
    );

}


/* =====================================================
   STARTBUTTON
===================================================== */

if (startSystemButton) {

    startSystemButton.addEventListener(
        "click",
        startSystem
    );

}


/* =====================================================
   EINGABE NORMALISIEREN
===================================================== */

function normalizeSolution(
    value
) {

    return value
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toLowerCase();

}


/* =====================================================
   EINGABESTATUS
===================================================== */

if (solutionInput) {

    solutionInput.addEventListener(
        "input",
        () => {

            const value =
                solutionInput.value.trim();


            if (
                value === ""
            ) {

                if (inputStatus) {

                    inputStatus.textContent =
                        "BEREIT ZUR EINGABE";

                    inputStatus.style.color =
                        "#607980";

                }

                return;

            }


            if (inputStatus) {

                inputStatus.textContent =
                    "EINGABE ERFASST";

                inputStatus.style.color =
                    "#8fa9b1";

            }

        }
    );

}


/* =====================================================
   STRG + ENTER
===================================================== */

if (solutionInput) {

    solutionInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.ctrlKey
            ) {

                event.preventDefault();

                checkSolution();

            }

        }
    );

}


/* =====================================================
   LÖSUNGSBUTTON
===================================================== */

if (checkSolutionButton) {

    checkSolutionButton.addEventListener(
        "click",
        () => {

            playAudio(
                "click",
                "uiClick"
            );

            checkSolution();

        }
    );

}


/* =====================================================
   LÖSUNG PRÜFEN
===================================================== */

function checkSolution() {

    const enteredSolution =
        normalizeSolution(
            solutionInput
                ? solutionInput.value
                : ""
        );


    /* ---------------------------------------------
       KEINE EINGABE
    --------------------------------------------- */

    if (
        enteredSolution === ""
    ) {

        playAudio(
            "error"
        );


        showResultPopup(
            "warning",
            "KEINE EINGABE",
            "Bitte geben Sie den entschlüsselten Lösungssatz ein.",
            "SCHLIESSEN"
        );

        return;

    }


    /* ---------------------------------------------
       RICHTIGE LÖSUNG
    --------------------------------------------- */

    if (
        enteredSolution ===
        normalizeSolution(
            correctSolution
        )
    ) {

        if (inputStatus) {

            inputStatus.textContent =
                "LÖSUNG VERIFIZIERT";

            inputStatus.style.color =
                "#00d878";

        }


        playAudio(
            "scanSuccess",
            "scanSuccess"
        );


        showResultPopup(
            "success",
            "CODE ERFOLGREICH ENTSCHLÜSSELT",
            "Der eingegebene Lösungssatz wurde vom JAC-System korrekt verifiziert.",
            "WEITER"
        );


        return;

    }


    /* ---------------------------------------------
       FALSCHE LÖSUNG
    --------------------------------------------- */

    if (inputStatus) {

        inputStatus.textContent =
            "LÖSUNG NICHT VERIFIZIERT";

        inputStatus.style.color =
            "#ff5c5c";

    }


    playAudio(
        "scanDenied",
        "scanDenied"
    );


    showResultPopup(
        "error",
        "CODE NICHT KORREKT",
        "Der eingegebene Satz stimmt nicht mit dem gesuchten Lösungssatz überein. Überprüfen Sie den Codex und das Zahlenrätsel aus Umschlag 04.",
        "ERNEUT VERSUCHEN"
    );

}


/* =====================================================
   RESULT POPUP
===================================================== */

function showResultPopup(
    type,
    title,
    message,
    buttonText
) {

    if (!resultModal) {

        return;

    }


    resultModal.classList.remove(
        "hidden"
    );


    if (resultTitle) {

        resultTitle.textContent =
            title;

    }


    if (resultText) {

        resultText.textContent =
            message;

    }


    if (resultButton) {

        resultButton.textContent =
            buttonText;

    }


    if (resultIcon) {

        if (
            type === "success"
        ) {

            resultIcon.textContent =
                "✓";

            resultIcon.style.color =
                "#00d878";

            resultIcon.style.borderColor =
                "rgba(0,216,120,0.4)";

        }

        else if (
            type === "error"
        ) {

            resultIcon.textContent =
                "✕";

            resultIcon.style.color =
                "#ff5c5c";

            resultIcon.style.borderColor =
                "rgba(255,92,92,0.4)";

        }

        else {

            resultIcon.textContent =
                "!";

            resultIcon.style.color =
                "#ffd166";

            resultIcon.style.borderColor =
                "rgba(255,209,102,0.4)";

        }

    }


    resultModal.dataset.type =
        type;

}


/* =====================================================
   POPUP BUTTON
===================================================== */

if (resultButton) {

    resultButton.addEventListener(
        "click",
        () => {

            const type =
                resultModal.dataset.type;


            resultModal.classList.add(
                "hidden"
            );


            playAudio(
                "click",
                "uiClick"
            );


            if (
                type === "success"
            ) {

                completeCase4();

            }

        }
    );

}


/* =====================================================
   AKTE 4 ABSCHLIESSEN
===================================================== */

function completeCase4() {

    if (
        caseCompleted
    ) {

        return;

    }


    caseCompleted =
        true;


    /* ---------------------------------------------
       AUDIO
    --------------------------------------------- */

    playAudio(
        "completeCase",
        "caseComplete"
    );


    /* ---------------------------------------------
       GAME STATE
    --------------------------------------------- */

    if (
        window.JACGameState &&
        typeof
        window.JACGameState.completeCase ===
        "function"
    ) {

        window.JACGameState.completeCase(
            4
        );


        console.log(
            "JAC: Akte 4 erfolgreich gespeichert."
        );

    }

    else {

        console.error(
            "JAC: gameState.js oder completeCase() wurde nicht gefunden."
        );

    }


    /* ---------------------------------------------
       ABSCHLUSSBILDSCHIRM
    --------------------------------------------- */

    showCompletionScreen();

}


/* =====================================================
   ABSCHLUSSBILDSCHIRM
===================================================== */

function showCompletionScreen() {

    if (
        !completionScreen
    ) {

        return;

    }


    completionScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   DASHBOARD
===================================================== */

if (dashboardButton) {

    dashboardButton.addEventListener(
        "click",
        () => {

            playAudio(
                "click",
                "uiClick"
            );


            window.location.href =
                "dashboard.html";

        }
    );

}