"use strict";

/* =========================================================
   JAC PORTAL
   AKTE 05
   VERSION 6.0
========================================================= */


/* =========================================================
   DOM
========================================================= */

let startupScreen;
let startupAnimation;
let systemStartButton;

let startupText;
let startupDetail;
let startupPercent;
let startupProgress;
let startupStatus;

let analysisItems;
let puzzlePieces;
let puzzleCenter;

let caseContent;

let puzzleItems;
let puzzleOptions;
let checkPuzzleButton;
let puzzleProgressText;
let puzzleHint;

let resultModal;
let resultIcon;
let resultTitle;
let resultText;
let resultButton;

let completionScreen;
let dashboardButton;


/* =========================================================
   STATUS
========================================================= */

let systemStarted = false;
let animationFinished = false;
let selectedAnswers = {};
let analysisCompleted = false;
let caseCompleted = false;


/* =========================================================
   RICHTIGE ANTWORTEN
========================================================= */

const correctAnswers = {

    date:
        "04. Oktober 2026",

    location:
        "Jury Experience Stuttgart",

    time:
        "16:00 Uhr",

    case:
        "20 Millionen Dollar Raub"

};


/* =========================================================
   STARTANIMATION
========================================================= */

const startupSteps = [

    {
        text:
            "FALLDATEN WERDEN GELADEN...",

        detail:
            "DATENBESTAND 01 / 04",

        percent:
            20,

        pieces:
            [1, 2, 3]
    },

    {
        text:
            "ZEITLINIE WIRD REKONSTRUIERT...",

        detail:
            "ZEITLICHE ABFOLGE 02 / 04",

        percent:
            42,

        pieces:
            [4, 5, 6]
    },

    {
        text:
            "BEWEISDATEN WERDEN ABGEGLICHEN...",

        detail:
            "BEWEISBESTAND 03 / 04",

        percent:
            68,

        pieces:
            [7, 8, 9]
    },

    {
        text:
            "FALLZUSAMMENHANG WIRD HERGESTELLT...",

        detail:
            "FALLANALYSE 04 / 04",

        percent:
            88,

        pieces:
            [10, 11, 12]
    },

    {
        text:
            "FALLPUZZLE VOLLSTÄNDIG",

        detail:
            "ALLE FALLDATEN VERKNÜPFT",

        percent:
            100,

        pieces:
            []
    }

];


/* =========================================================
   AUDIO
========================================================= */

function playAkte5Sound(
    sound,
    options = {}
) {

    if (
        !window.JACAudio ||
        typeof window.JACAudio.play !== "function"
    ) {

        return null;

    }


    try {

        return window.JACAudio.play(
            sound,
            options
        );

    }

    catch (error) {

        console.warn(
            "Akte 05 Audio:",
            error
        );

        return null;

    }

}


/* =========================================================
   DOM
========================================================= */

function initializeDOM() {

    startupScreen =
        document.getElementById(
            "startup-screen"
        );

    startupAnimation =
        document.getElementById(
            "startup-animation"
        );

    systemStartButton =
        document.getElementById(
            "system-start-button"
        );


    startupText =
        document.getElementById(
            "startup-text"
        );

    startupDetail =
        document.getElementById(
            "startup-detail"
        );

    startupPercent =
        document.getElementById(
            "startup-percent"
        );

    startupProgress =
        document.getElementById(
            "startup-progress"
        );

    startupStatus =
        document.getElementById(
            "startup-status"
        );


    analysisItems =
        document.querySelectorAll(
            ".analysis-item"
        );


    puzzlePieces =
        document.querySelectorAll(
            ".puzzle-piece"
        );


    puzzleCenter =
        document.querySelector(
            ".puzzle-center"
        );


    caseContent =
        document.getElementById(
            "case-content"
        );


    puzzleItems =
        document.querySelectorAll(
            ".puzzle-item"
        );


    puzzleOptions =
        document.querySelectorAll(
            ".puzzle-option"
        );


    checkPuzzleButton =
        document.getElementById(
            "check-puzzle"
        );


    puzzleProgressText =
        document.getElementById(
            "puzzle-progress-text"
        );


    puzzleHint =
        document.getElementById(
            "puzzle-hint"
        );


    resultModal =
        document.getElementById(
            "result-modal"
        );


    resultIcon =
        document.getElementById(
            "result-icon"
        );


    resultTitle =
        document.getElementById(
            "result-title"
        );


    resultText =
        document.getElementById(
            "result-text"
        );


    resultButton =
        document.getElementById(
            "result-button"
        );


    completionScreen =
        document.getElementById(
            "completion-screen"
        );


    dashboardButton =
        document.getElementById(
            "dashboard-button"
        );

}


/* =========================================================
   PUZZLE ZURÜCKSETZEN
========================================================= */

function resetStartupPuzzle() {

    puzzlePieces.forEach(
        piece => {

            piece.classList.remove(
                "active",
                "complete"
            );

        }
    );


    if (puzzleCenter) {

        puzzleCenter.classList.remove(
            "complete"
        );

    }


    analysisItems.forEach(
        item => {

            item.classList.remove(
                "active",
                "complete"
            );


            const state =
                item.querySelector(
                    ".analysis-state"
                );


            if (state) {

                state.textContent =
                    "—";

            }

        }
    );

}


/* =========================================================
   STARTBUTTON
========================================================= */

function setupSystemStart() {

    if (!systemStartButton) {

        return;

    }


    systemStartButton.addEventListener(
        "click",
        startSystem
    );

}


/* =========================================================
   SYSTEM STARTEN
========================================================= */

async function startSystem() {

    if (systemStarted) {

        return;

    }


    systemStarted =
        true;


    systemStartButton.disabled =
        true;


    /*
     * Wichtig:
     * Die Animation wird SOFORT gestartet.
     * Audio darf den Start niemals blockieren.
     */

    startPuzzleStartup();


    /*
     * Audio-Unlock nur zusätzlich.
     */

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
                "Audio Unlock:",
                error
            );

        }

    }


    playAkte5Sound(
        "uiClick",
        {
            volume: 0.30
        }
    );

}


/* =========================================================
   STARTANIMATION
========================================================= */

function startPuzzleStartup() {

    if (!startupAnimation) {

        return;

    }


    startupAnimation.classList.remove(
        "hidden"
    );


    resetStartupPuzzle();


    startupText.textContent =
        "SYSTEM WIRD INITIALISIERT...";


    startupDetail.textContent =
        "JAC FORENSIC SYSTEM";


    startupPercent.textContent =
        "0 %";


    startupProgress.style.width =
        "0%";


    startupStatus.textContent =
        "SYSTEMSTART WIRD DURCHGEFÜHRT";


    /*
     * Bootsound
     */

    playAkte5Sound(
        "systemBoot",
        {
            volume: 0.55
        }
    );


    setTimeout(
        () => {

            runStartupStep(0);

        },
        500
    );

}


/* =========================================================
   SCHRITT
========================================================= */

function runStartupStep(
    index
) {

    if (
        index >=
        startupSteps.length
    ) {

        finishStartup();

        return;

    }


    const step =
        startupSteps[index];


    startupText.textContent =
        step.text;


    startupDetail.textContent =
        step.detail;


    startupPercent.textContent =
        step.percent + " %";


    startupProgress.style.width =
        step.percent + "%";


    /*
     * Teile aktivieren
     */

    step.pieces.forEach(
        number => {

            activatePuzzlePiece(
                number
            );

        }
    );


    /*
     * Analysezeile
     */

    if (
        index < analysisItems.length
    ) {

        const analysis =
            analysisItems[index];


        analysis.classList.add(
            "active"
        );


        const state =
            analysis.querySelector(
                ".analysis-state"
            );


        if (state) {

            state.textContent =
                "SCAN";

        }


        setTimeout(
            () => {

                analysis.classList.remove(
                    "active"
                );

                analysis.classList.add(
                    "complete"
                );


                if (state) {

                    state.textContent =
                        "OK";

                }

            },
            850
        );

    }


    /*
     * Daten-Sound
     */

    playAkte5Sound(
        "dataProcess",
        {
            volume: 0.25
        }
    );


    setTimeout(
        () => {

            runStartupStep(
                index + 1
            );

        },
        900
    );

}


/* =========================================================
   PUZZLETEIL AKTIVIEREN
========================================================= */

function activatePuzzlePiece(
    number
) {

    const padded =
        String(number).padStart(
            2,
            "0"
        );


    const piece =
        document.querySelector(
            `.puzzle-piece[data-number="${padded}"]`
        );


    if (!piece) {

        return;

    }


    piece.classList.add(
        "active"
    );


    setTimeout(
        () => {

            piece.classList.remove(
                "active"
            );

            piece.classList.add(
                "complete"
            );

        },
        650
    );

}


/* =========================================================
   STARTANIMATION FERTIG
========================================================= */

function finishStartup() {

    animationFinished =
        true;


    puzzlePieces.forEach(
        piece => {

            piece.classList.remove(
                "active"
            );

            piece.classList.add(
                "complete"
            );

        }
    );


    analysisItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );

            item.classList.add(
                "complete"
            );


            const state =
                item.querySelector(
                    ".analysis-state"
                );


            if (state) {

                state.textContent =
                    "OK";

            }

        }
    );


    if (puzzleCenter) {

        puzzleCenter.classList.add(
            "complete"
        );

    }


    startupText.textContent =
        "FALLPUZZLE VOLLSTÄNDIG";


    startupDetail.textContent =
        "ALLE FALLDATEN VERKNÜPFT";


    startupPercent.textContent =
        "100 %";


    startupProgress.style.width =
        "100%";


    startupStatus.textContent =
        "SYSTEM BEREIT";


    playAkte5Sound(
        "systemReady",
        {
            volume: 0.48
        }
    );


    setTimeout(
        () => {

            playAkte5Sound(
                "progressUnlock",
                {
                    volume: 0.40
                }
            );

        },
        350
    );


    setTimeout(
        revealCaseContent,
        1400
    );

}


/* =========================================================
   AKTE ANZEIGEN
========================================================= */

function revealCaseContent() {

    if (startupScreen) {

        startupScreen.classList.add(
            "startup-finished"
        );

    }


    setTimeout(
        () => {

            if (startupScreen) {

                startupScreen.classList.add(
                    "hidden"
                );

            }


            if (caseContent) {

                caseContent.classList.remove(
                    "hidden"
                );

                caseContent.classList.add(
                    "case-visible"
                );

            }

        },
        650
    );

}


/* =========================================================
   ANTWORTEN
========================================================= */

function setupPuzzleOptions() {

    puzzleOptions.forEach(
        option => {

            option.addEventListener(
                "click",
                () => {

                    const puzzle =
                        option.closest(
                            ".puzzle-item"
                        );


                    if (!puzzle) {

                        return;

                    }


                    const category =
                        puzzle.dataset.category;


                    /*
                     * Auswahl speichern
                     */

                    selectedAnswers[
                        category
                    ] =
                        option.dataset.value;


                    /*
                     * Nur Auswahlmarkierung.
                     * Noch KEIN grün/rot.
                     */

                    puzzle
                        .querySelectorAll(
                            ".puzzle-option"
                        )
                        .forEach(
                            other => {

                                other.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    option.classList.add(
                        "selected"
                    );


                    /*
                     * Alte Prüfungsfarben
                     * entfernen.
                     */

                    puzzle
                        .querySelectorAll(
                            ".puzzle-option"
                        )
                        .forEach(
                            other => {

                                other.classList.remove(
                                    "answer-correct",
                                    "answer-wrong"
                                );

                            }
                        );


                    puzzle.classList.remove(
                        "correct",
                        "incorrect"
                    );


                    /*
                     * TON BEIM ANKLICKEN
                     */

                    playAkte5Sound(
                        "uiClick",
                        {
                            volume: 0.30
                        }
                    );


                    updatePuzzleProgress();

                }
            );

        }
    );

}


/* =========================================================
   FORTSCHRITT
========================================================= */

function updatePuzzleProgress() {

    const count =
        Object.keys(
            selectedAnswers
        ).length;


    puzzleProgressText.textContent =
        count +
        " / 4 ANALYSEN ABGESCHLOSSEN";


    if (
        count === 4
    ) {

        checkPuzzleButton.disabled =
            false;


        puzzleHint.textContent =
            "✓ ALLE VIER ANALYSEBEREICHE VERVOLLSTÄNDIGT – FALLANALYSE BEREIT";

    }

    else {

        checkPuzzleButton.disabled =
            true;


        puzzleHint.textContent =
            "Vervollständigen Sie alle vier Analysebereiche.";

    }

}


/* =========================================================
   PRÜFBUTTON
========================================================= */

function setupCheckPuzzle() {

    checkPuzzleButton.addEventListener(
        "click",
        checkPuzzle
    );

}


/* =========================================================
   PRÜFEN
/* =========================================================
   PRÜFEN
========================================================= */

function checkPuzzle() {

    if (analysisCompleted) {

        return;

    }


    let correct = 0;


    Object.keys(
        correctAnswers
    ).forEach(
        category => {

            const puzzle =
                document.querySelector(
                    `.puzzle-item[data-category="${category}"]`
                );


            if (!puzzle) {

                return;

            }


            const selected =
                selectedAnswers[
                    category
                ];


            /*
             * Alte Markierungen entfernen.
             */

            puzzle
                .querySelectorAll(
                    ".puzzle-option"
                )
                .forEach(
                    option => {

                        option.classList.remove(
                            "answer-correct",
                            "answer-wrong"
                        );

                    }
                );


            /*
             * =================================================
             * RICHTIG
             * =================================================
             *
             * Nur die tatsächlich ausgewählte
             * Antwort wird grün.
             */

            if (
                selected ===
                correctAnswers[
                    category
                ]
            ) {

                correct++;


                const selectedOption =
                    puzzle.querySelector(
                        `.puzzle-option[data-value="${CSS.escape(selected)}"]`
                    );


                if (selectedOption) {

                    selectedOption.classList.add(
                        "answer-correct"
                    );

                }


                puzzle.classList.add(
                    "correct"
                );

                puzzle.classList.remove(
                    "incorrect"
                );

            }


            /*
             * =================================================
             * FALSCH
             * =================================================
             *
             * NUR die vom Spieler gewählte Antwort
             * wird rot markiert.
             *
             * Die richtige Lösung bleibt verborgen.
             */

            else {

                const selectedOption =
                    puzzle.querySelector(
                        `.puzzle-option[data-value="${CSS.escape(selected)}"]`
                    );


                if (selectedOption) {

                    selectedOption.classList.add(
                        "answer-wrong"
                    );

                }


                puzzle.classList.add(
                    "incorrect"
                );

                puzzle.classList.remove(
                    "correct"
                );

            }

        }
    );


    /*
     * =====================================================
     * ALLES RICHTIG
     * =====================================================
     */

    if (
        correct === 4
    ) {

        analysisCompleted =
            true;


        checkPuzzleButton.disabled =
            true;


        playAkte5Sound(
            "scanSuccess",
            {
                volume: 0.52
            }
        );


        showResult(
            "success",
            "FALLANALYSE ERFOLGREICH",
            "Alle vier Beweisdaten wurden korrekt zusammengeführt. Die abschließende Fallanalyse ist vollständig.",
            "AKTE ABSCHLIESSEN"
        );


        return;

    }


    /*
     * =====================================================
     * NICHT ALLES RICHTIG
     * =====================================================
     *
     * Es wird NICHT verraten, welche Antwort
     * die richtige gewesen wäre.
     */

    playAkte5Sound(
        "scanDenied",
        {
            volume: 0.38
        }
    );


    showResult(
        "error",
        "ANALYSE NICHT KORREKT",
        correct +
        " von 4 Analysebereichen sind korrekt. Die rot markierten Angaben müssen überprüft werden.",
        "ERNEUT VERSUCHEN"
    );

}


/* =========================================================
   ERGEBNIS
========================================================= */

function showResult(
    type,
    title,
    text,
    buttonText
) {

    resultModal.classList.remove(
        "hidden"
    );


    resultModal.dataset.type =
        type;


    resultIcon.textContent =
        type === "success"
            ? "✓"
            : "!";


    resultTitle.textContent =
        title;


    resultText.textContent =
        text;


    resultButton.textContent =
        buttonText;

}


/* =========================================================
   RESULT BUTTON
========================================================= */

function setupResultButton() {

    resultButton.addEventListener(
        "click",
        () => {

            playAkte5Sound(
                "uiClick",
                {
                    volume: 0.30
                }
            );


            const type =
                resultModal.dataset.type;


            resultModal.classList.add(
                "hidden"
            );


            if (
                type === "error"
            ) {

                /*
                 * Die grünen/roten Antworten
                 * bleiben sichtbar.
                 *
                 * Sobald eine Antwort geändert wird,
                 * entfernt das JS deren alte Markierung.
                 */

                return;

            }


            if (
                type === "success"
            ) {

                completeCase5();

            }

        }
    );

}


/* =========================================================
   AKTE ABSCHLIESSEN
========================================================= */

function completeCase5() {

    if (caseCompleted) {

        return;

    }


    caseCompleted =
        true;


    playAkte5Sound(
        "caseComplete",
        {
            volume: 0.50
        }
    );


    if (
        window.JACGameState &&
        typeof window.JACGameState.completeCase ===
            "function"
    ) {

        window.JACGameState.completeCase(
            5
        );

    }


    showCompletionScreen();

}


/* =========================================================
   ABSCHLUSS
========================================================= */

function showCompletionScreen() {

    completionScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   DASHBOARD
========================================================= */

function setupDashboardButton() {

    dashboardButton.addEventListener(
        "click",
        () => {

            playAkte5Sound(
                "uiClick",
                {
                    volume: 0.30
                }
            );


            window.location.href = "abschluss.html";

        }
    );

}


/* =========================================================
   INITIALISIERUNG
========================================================= */

function initializeAkte5() {

    initializeDOM();

    setupSystemStart();

    setupPuzzleOptions();

    setupCheckPuzzle();

    setupResultButton();

    setupDashboardButton();


    if (
        window.JACAudio &&
        typeof window.JACAudio.init ===
            "function"
    ) {

        window.JACAudio.init();

    }


    console.log(
        "JAC AKTE 05 v6.0 bereit."
    );

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
        initializeAkte5
    );

}

else {

    initializeAkte5();

}