/* =========================================================
   JAC PORTAL – SPIELSTAND
   js/spielstand.js
   ========================================================= */

"use strict";


/* =========================================================
   WARTEN BIS DOM GELADEN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
       Prüfen, ob das zentrale Spielstand-System
       vorhanden ist.
    */

    if (!window.JACGameState) {

        console.error(
            "JAC: gameState.js wurde nicht geladen."
        );

        return;
    }


    initSavePage();

});


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

function initSavePage() {

    updateProgress();

    updateCases();

    updateInformationCounts();

    updateLastSaved();

    setupButtons();

}


/* =========================================================
   FORTSCHRITT AKTUALISIEREN
   ========================================================= */

function updateProgress() {

    const progress =
        JACGameState.getProgressData();


    /*
       Anzahl abgeschlossener Akten
    */

    const completedCount =
        document.getElementById(
            "completed-count"
        );


    if (completedCount) {

        completedCount.textContent =
            progress.completed;
    }


    /*
       Prozentanzeige
    */

    const progressPercent =
        document.getElementById(
            "progress-percent"
        );


    if (progressPercent) {

        progressPercent.textContent =
            `${progress.percent} %`;
    }


    /*
       Fortschrittsbalken
    */

    const progressBar =
        document.getElementById(
            "progress-bar-fill"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress.percent}%`;
    }

}


/* =========================================================
   AKTEN AKTUALISIEREN
   ========================================================= */

function updateCases() {

    const progress =
        JACGameState.getProgressData();


    const completedCases =
        progress.completedCases;


    const caseRows =
        document.querySelectorAll(
            ".case-row"
        );


    caseRows.forEach(row => {

        const caseNumber =
            Number(
                row.dataset.case
            );


        const status =
            row.querySelector(
                ".case-status"
            );


        /*
           Vorherige Zustände entfernen
        */

        row.classList.remove(
            "completed",
            "locked"
        );


        /*
           AKTE ABGESCHLOSSEN
        */

        if (
            completedCases.includes(
                caseNumber
            )
        ) {

            row.classList.add(
                "completed"
            );


            if (status) {

                status.textContent =
                    "ABGESCHLOSSEN";
            }


            return;
        }


        /*
           NÄCHSTE AKTE
        */

        if (
            JACGameState.isCaseUnlocked(
                caseNumber
            )
        ) {

            if (status) {

                status.textContent =
                    "VERFÜGBAR";
            }


            return;
        }


        /*
           NOCH GESPERRT
        */

        row.classList.add(
            "locked"
        );


        if (status) {

            status.textContent =
                "GESPERRT";
        }

    });

}


/* =========================================================
   INFORMATIONEN AKTUALISIEREN
   ========================================================= */

function updateInformationCounts() {

    const state =
        JACGameState.getGameState();


    /*
       BEWEISMITTEL
    */

    const evidenceCount =
        document.getElementById(
            "evidence-count"
        );


    if (evidenceCount) {

        evidenceCount.textContent =
            state.foundEvidence.length;
    }


    /*
       HINWEISE
    */

    const clueCount =
        document.getElementById(
            "clue-count"
        );


    if (clueCount) {

        clueCount.textContent =
            state.foundClues.length;
    }


    /*
       FEHLER
    */

    const errorCount =
        document.getElementById(
            "error-count"
        );


    if (errorCount) {

        errorCount.textContent =
            state.foundErrors.length;
    }

}


/* =========================================================
   LETZTE SPEICHERUNG
   ========================================================= */

function updateLastSaved() {

    const element =
        document.getElementById(
            "last-saved"
        );


    if (!element) {
        return;
    }


    const state =
        JACGameState.getGameState();


    /*
       Noch kein richtiger Spielstand
    */

    if (
        !state.updatedAt
    ) {

        element.textContent =
            "Noch keine Daten gespeichert.";

        return;
    }


    const date =
        new Date(
            state.updatedAt
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        element.textContent =
            "Spielstand vorhanden.";

        return;
    }


    element.textContent =
        `Zuletzt gespeichert: ${formatDateTime(date)}`;

}


/* =========================================================
   DATUM / UHRZEIT FORMATIEREN
   ========================================================= */

function formatDateTime(date) {

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    ).format(date);

}


/* =========================================================
   BUTTONS EINRICHTEN
   ========================================================= */

function setupButtons() {

    /*
       Dashboard
    */

    const backDashboard =
        document.getElementById(
            "back-dashboard"
        );


    if (backDashboard) {

        backDashboard.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );
    }


    /*
       Reset öffnen
    */

    const resetButton =
        document.getElementById(
            "reset-game"
        );


    const resetDialog =
        document.getElementById(
            "reset-dialog"
        );


    if (
        resetButton &&
        resetDialog
    ) {

        resetButton.addEventListener(
            "click",
            () => {

                resetDialog.classList.remove(
                    "hidden"
                );

            }
        );

    }


    /*
       Reset abbrechen
    */

    const cancelReset =
        document.getElementById(
            "cancel-reset"
        );


    if (
        cancelReset &&
        resetDialog
    ) {

        cancelReset.addEventListener(
            "click",
            () => {

                resetDialog.classList.add(
                    "hidden"
                );

            }
        );

    }


    /*
       Reset bestätigen
    */

    const confirmReset =
        document.getElementById(
            "confirm-reset"
        );


    if (confirmReset) {

        confirmReset.addEventListener(
            "click",
            () => {

                performReset();

            }
        );

    }


    /*
       Dialog schließen,
       wenn außerhalb geklickt wird.
    */

    if (resetDialog) {

        resetDialog.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    resetDialog
                ) {

                    resetDialog.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }


    /*
       ESC-Taste
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                resetDialog &&
                !resetDialog.classList.contains(
                    "hidden"
                )
            ) {

                resetDialog.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   RESET DURCHFÜHREN
   ========================================================= */

function performReset() {

    const success =
        JACGameState.resetGameState();


    if (!success) {

        console.error(
            "JAC: Spielstand konnte nicht zurückgesetzt werden."
        );

        return;
    }


    /*
       Nach dem Reset nicht sofort
       auf eine andere Seite springen.

       Erst zeigen wir den komplett
       zurückgesetzten Zustand.
    */

    updateProgress();

    updateCases();

    updateInformationCounts();

    updateLastSaved();


    /*
       Dialog schließen
    */

    const resetDialog =
        document.getElementById(
            "reset-dialog"
        );


    if (resetDialog) {

        resetDialog.classList.add(
            "hidden"
        );

    }


    /*
       Kurze visuelle Rückmeldung
    */

    showResetMessage();

}


/* =========================================================
   RESET RÜCKMELDUNG
   ========================================================= */

function showResetMessage() {

    const statusText =
        document.getElementById(
            "last-saved"
        );


    if (!statusText) {
        return;
    }


    statusText.textContent =
        "Spielstand wurde zurückgesetzt.";


    /*
       Nach kurzer Zeit wieder
       normalen Speicherstatus anzeigen.
    */

    window.setTimeout(
        () => {

            updateLastSaved();

        },
        2500
    );

}