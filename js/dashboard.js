"use strict";

/* =========================================================
   JAC PORTAL
   DASHBOARD.JS
   =========================================================

   ABLAUF

   SYSTEM BOOT
       ↓
   dashboard.html?entry=boot
       ↓
   JAC WILLKOMMEN
       ↓
   KOMMANDOZENTRALE BETRETEN
       ↓
   AUDIO FREIGEGEBEN
       ↓
   DASHBOARD LOOP

   AKTE ÖFFNEN
       ↓
   LOOP STOPP
       ↓
   AKTE
       ↓
   DASHBOARD
       ↓
   AKTE XX FREIGEGEBEN
       ↓
   WEITER
       ↓
   AUDIO FREIGEBEN
       ↓
   LOOP START

   AKTE 5 ABGESCHLOSSEN
       ↓
   DIREKT ABSCHLUSS.HTML

========================================================= */


/* =========================================================
   KONSTANTEN
========================================================= */

const TOTAL_CASES = 5;


/*
 * Anzahl der bereits gesehenen abgeschlossenen Akten
 */

const DASHBOARD_SEEN_KEY =
    "JAC_DASHBOARD_LAST_SEEN_COMPLETED";


/*
 * Merkt, ob Dashboard-Audio bereits gestartet wurde.
 */

const DASHBOARD_AUDIO_STARTED_KEY =
    "JAC_DASHBOARD_AUDIO_STARTED";


/*
 * Merkt, ob die Kommandozentrale in dieser Sitzung
 * bereits betreten wurde.
 */

const DASHBOARD_WELCOME_ACCEPTED_KEY =
    "JAC_DASHBOARD_WELCOME_ACCEPTED";


/*
 * Wichtig:
 *
 * Das Dashboard wird vom System-Boot mit
 *
 * dashboard.html?entry=boot
 *
 * geöffnet.
 *
 * Dadurch wissen wir sicher:
 * Der Agent kommt gerade aus dem System-Boot.
 */

const DASHBOARD_BOOT_ENTRY =
    new URLSearchParams(
        window.location.search
    ).get("entry") === "boot";


/* =========================================================
   VARIABLEN
========================================================= */

let pendingAnimationCase = null;

let completionPopupOpen = false;

let dashboardLoopAudio = null;

let dashboardInitialized = false;

let welcomePopupOpen = false;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


/* =========================================================
   AUDIO PRÜFEN
========================================================= */

function jacAudioReady() {

    return (
        window.JACAudio &&
        typeof window.JACAudio.play === "function"
    );

}


/* =========================================================
   WELCOME STATUS
========================================================= */

function isWelcomeAccepted() {

    return (
        sessionStorage.getItem(
            DASHBOARD_WELCOME_ACCEPTED_KEY
        ) === "true"
    );

}


/* =========================================================
   WELCOME POPUP
========================================================= */

function initializeWelcomePopup() {

    const overlay =
        document.getElementById(
            "welcome-overlay"
        );


    if (!overlay) {

        console.warn(
            "JAC: Welcome-Overlay wurde nicht gefunden."
        );

        return;

    }


    /*
     * =====================================================
     * DIREKTER EINSTIEG AUS SYSTEM BOOT
     * =====================================================
     *
     * Bei ?entry=boot MUSS das Popup erscheinen.
     *
     * Auch dann, wenn sessionStorage noch
     * eine alte Freigabe enthält.
     */

    if (DASHBOARD_BOOT_ENTRY) {

        sessionStorage.removeItem(
            DASHBOARD_WELCOME_ACCEPTED_KEY
        );


        overlay.classList.remove(
            "hidden"
        );


        overlay.classList.remove(
            "closing"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        welcomePopupOpen =
            true;


        document.body.classList.add(
            "welcome-active"
        );


        connectWelcomeButton();


        return;

    }


    /*
     * =====================================================
     * NORMALE RÜCKKEHR AUS EINER AKTE
     * =====================================================
     *
     * Wenn der Agent die Kommandozentrale bereits
     * betreten hat, erscheint das Welcome-Popup
     * NICHT erneut.
     */

    if (isWelcomeAccepted()) {

        overlay.classList.add(
            "hidden"
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        welcomePopupOpen =
            false;


        /*
         * Loop darf wieder laufen.
         */

        startDashboardLoop();


        return;

    }


    /*
     * =====================================================
     * FALLBACK
     * =====================================================
     *
     * Falls das Dashboard ohne Boot-Einstieg und
     * ohne bestehende Freigabe geöffnet wird,
     * zeigen wir ebenfalls die Begrüßung.
     */

    overlay.classList.remove(
        "hidden"
    );


    overlay.classList.remove(
        "closing"
    );


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    welcomePopupOpen =
        true;


    document.body.classList.add(
        "welcome-active"
    );


    connectWelcomeButton();

}


/* =========================================================
   WELCOME BUTTON
========================================================= */

function connectWelcomeButton() {

    const button =
        document.getElementById(
            "enter-command-center"
        );


    if (!button) {

        console.warn(
            "JAC: Button 'enter-command-center' wurde nicht gefunden."
        );

        return;

    }


    if (
        button.dataset.jacConnected ===
        "true"
    ) {

        return;

    }


    button.dataset.jacConnected =
        "true";


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            if (!welcomePopupOpen) {

                return;

            }


            enterCommandCenter();

        }
    );

}


/* =========================================================
   KOMMANDOZENTRALE BETRETEN
========================================================= */

async function enterCommandCenter() {

    if (!welcomePopupOpen) {

        return;

    }


    const button =
        document.getElementById(
            "enter-command-center"
        );


    const systemMessage =
        document.getElementById(
            "welcome-system-message"
        );


    /*
     * Button sperren
     */

    if (button) {

        button.disabled =
            true;


        button.classList.add(
            "is-entering"
        );

    }


    /*
     * =====================================================
     * AUDIO FREIGABE
     * =====================================================
     *
     * Dieser Code läuft direkt innerhalb des
     * Benutzerklicks.
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.init ===
        "function"
    ) {

        try {

            window.JACAudio.init();

        }

        catch (error) {

            console.warn(
                "JAC Audio Init:",
                error
            );

        }

    }


    /*
     * Audio explizit freigeben
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
                "JAC Audio Unlock:",
                error
            );

        }

    }


    /*
     * JAC Klickbestätigung
     */

    playClick();


    /*
     * =====================================================
     * SYSTEMTEXT
     * =====================================================
     */

    if (systemMessage) {

        systemMessage.textContent =
            "JAC SECURE NETWORK // CONNECTION ESTABLISHED";


        window.setTimeout(
            function() {

                if (systemMessage) {

                    systemMessage.textContent =
                        "AGENT JAC-090996 // COMMAND ACCESS GRANTED";

                }

            },
            420
        );


        window.setTimeout(
            function() {

                if (systemMessage) {

                    systemMessage.textContent =
                        "CASE DATABASE // 05 FILES AVAILABLE";

                }

            },
            820
        );

    }


    /*
     * =====================================================
     * FREIGABE MERKEN
     * =====================================================
     */

    sessionStorage.setItem(
        DASHBOARD_AUDIO_STARTED_KEY,
        "true"
    );


    sessionStorage.setItem(
        DASHBOARD_WELCOME_ACCEPTED_KEY,
        "true"
    );


    /*
     * =====================================================
     * POPUP SCHLIESSEN
     * =====================================================
     */

    window.setTimeout(
        function() {

            closeWelcomePopup();

        },
        1050
    );

}


/* =========================================================
   WELCOME POPUP SCHLIESSEN
========================================================= */

function closeWelcomePopup() {

    const overlay =
        document.getElementById(
            "welcome-overlay"
        );


    if (!overlay) {

        welcomePopupOpen =
            false;


        document.body.classList.remove(
            "welcome-active"
        );


        startDashboardLoop();


        return;

    }


    overlay.classList.add(
        "closing"
    );


    window.setTimeout(
        function() {

            overlay.classList.add(
                "hidden"
            );


            overlay.classList.remove(
                "closing"
            );


            overlay.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.classList.remove(
                "welcome-active"
            );


            welcomePopupOpen =
                false;


            /*
             * Jetzt darf der Loop starten.
             */

            startDashboardLoop();

        },
        500
    );

}


/* =========================================================
   DASHBOARD LOOP STARTEN
========================================================= */

function startDashboardLoop() {

    /*
     * Während Welcome offen ist:
     * kein Loop.
     */

    if (welcomePopupOpen) {

        return false;

    }


    /*
     * Kommandozentrale muss betreten worden sein.
     */

    if (!isWelcomeAccepted()) {

        return false;

    }


    if (!jacAudioReady()) {

        console.warn(
            "JAC: Audio-System noch nicht verfügbar."
        );

        return false;

    }


    /*
     * Bereits laufender Loop.
     */

    if (
        dashboardLoopAudio &&
        !dashboardLoopAudio.paused
    ) {

        return true;

    }


    /*
     * =====================================================
     * ZENTRALER DASHBOARD LOOP
     * =====================================================
     */

    if (
        typeof window.JACAudio.dashboardLoop ===
        "function"
    ) {

        try {

            dashboardLoopAudio =
                window.JACAudio.dashboardLoop();

        }

        catch (error) {

            console.warn(
                "JAC: Dashboard-Loop konnte nicht über Engine gestartet werden.",
                error
            );

        }

    }


    /*
     * =====================================================
     * FALLBACK
     * =====================================================
     */

    if (!dashboardLoopAudio) {

        try {

            dashboardLoopAudio =
                window.JACAudio.play(
                    "dashboardLoop",
                    {
                        volume: 0.12,
                        loop: true
                    }
                );

        }

        catch (error) {

            console.warn(
                "JAC: Dashboard-Loop konnte nicht gestartet werden.",
                error
            );

        }

    }


    /*
     * =====================================================
     * AUDIO PLAY
     * =====================================================
     */

    if (dashboardLoopAudio) {

        sessionStorage.setItem(
            DASHBOARD_AUDIO_STARTED_KEY,
            "true"
        );


        if (
            typeof dashboardLoopAudio.play ===
            "function"
        ) {

            try {

                const promise =
                    dashboardLoopAudio.play();


                if (
                    promise &&
                    typeof promise.catch ===
                    "function"
                ) {

                    promise.catch(
                        function(error) {

                            console.warn(
                                "JAC: Dashboard-Loop wartet auf Audiofreigabe.",
                                error
                            );

                            dashboardLoopAudio =
                                null;

                        }
                    );

                }

            }

            catch (error) {

                console.warn(
                    "JAC: Dashboard-Audio blockiert.",
                    error
                );

                dashboardLoopAudio =
                    null;

            }

        }


        return true;

    }


    return false;

}


/* =========================================================
   AUDIO RETRY
========================================================= */

function retryDashboardAudio() {

    if (welcomePopupOpen) {

        return;

    }


    if (!isWelcomeAccepted()) {

        return;

    }


    if (
        dashboardLoopAudio &&
        !dashboardLoopAudio.paused
    ) {

        return;

    }


    startDashboardLoop();

}


/* =========================================================
   DASHBOARD LOOP STOPPEN
========================================================= */

function stopDashboardLoop() {

    if (dashboardLoopAudio) {

        try {

            if (
                window.JACAudio &&
                typeof window.JACAudio.stop ===
                "function"
            ) {

                window.JACAudio.stop(
                    dashboardLoopAudio
                );

            }

            else if (
                typeof dashboardLoopAudio.pause ===
                "function"
            ) {

                dashboardLoopAudio.pause();

                dashboardLoopAudio.currentTime =
                    0;

            }

        }

        catch (error) {

            console.warn(
                "JAC: Dashboard-Loop konnte nicht gestoppt werden.",
                error
            );

        }


        dashboardLoopAudio =
            null;

    }


    /*
     * Zentralen Loop ebenfalls stoppen.
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.stopDashboardLoop ===
        "function"
    ) {

        try {

            window.JACAudio.stopDashboardLoop();

        }

        catch (error) {

            console.warn(
                "JAC: Zentraler Dashboard-Loop konnte nicht gestoppt werden.",
                error
            );

        }

    }

}


/* =========================================================
   UI CLICK
========================================================= */

function playClick() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.click ===
        "function"
    ) {

        try {

            window.JACAudio.click();

        }

        catch (error) {

            console.warn(
                "JAC: Click-Sound konnte nicht abgespielt werden.",
                error
            );

        }

    }

}


/* =========================================================
   AKTE ÖFFNEN SOUND
========================================================= */

function playCaseOpenSound() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.openCase ===
        "function"
    ) {

        try {

            window.JACAudio.openCase();

        }

        catch (error) {

            console.warn(
                "JAC: Case-Open-Sound:",
                error
            );

        }

    }

}


/* =========================================================
   AKTE FREIGABE SOUND
========================================================= */

function playUnlockSound() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.unlockCase ===
        "function"
    ) {

        try {

            window.JACAudio.unlockCase();

        }

        catch (error) {

            console.warn(
                "JAC: Unlock-Sound:",
                error
            );

        }

    }

}


/* =========================================================
   PROGRESS SOUND
========================================================= */

function playProgressSound() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.progressUnlock ===
        "function"
    ) {

        try {

            window.JACAudio.progressUnlock();

        }

        catch (error) {

            console.warn(
                "JAC: Progress-Sound:",
                error
            );

        }

    }

    else if (
        window.JACAudio &&
        typeof window.JACAudio.completeCase ===
        "function"
    ) {

        try {

            window.JACAudio.completeCase();

        }

        catch (error) {

            console.warn(
                "JAC: Complete-Sound:",
                error
            );

        }

    }


    /*
     * ERSTER GLITZER
     */

    window.setTimeout(
        function() {

            if (
                window.JACAudio &&
                typeof window.JACAudio.sparkle ===
                "function"
            ) {

                try {

                    window.JACAudio.sparkle();

                }

                catch (error) {

                    console.warn(
                        "JAC: Sparkle:",
                        error
                    );

                }

            }

        },
        180
    );


    /*
     * ZWEITER GLITZER
     */

    window.setTimeout(
        function() {

            if (
                window.JACAudio &&
                typeof window.JACAudio.doubleSparkle ===
                "function"
            ) {

                try {

                    window.JACAudio.doubleSparkle();

                }

                catch (error) {

                    console.warn(
                        "JAC: Double Sparkle:",
                        error
                    );

                }

            }

            else if (
                window.JACAudio &&
                typeof window.JACAudio.play ===
                "function"
            ) {

                try {

                    window.JACAudio.play(
                        "doubleSparkle",
                        {
                            volume: 0.20
                        }
                    );

                }

                catch (error) {

                    console.warn(
                        "JAC: Double Sparkle Fallback:",
                        error
                    );

                }

            }

        },
        420
    );

}


/* =========================================================
   INITIALISIERUNG
========================================================= */

function initializeDashboard() {

    if (dashboardInitialized) {

        return;

    }


    dashboardInitialized =
        true;


    console.log(
        "JAC: Dashboard wird initialisiert."
    );


    if (!window.JACGameState) {

        console.error(
            "JAC: gameState.js wurde nicht geladen."
        );

        return;

    }


    /*
     * =====================================================
     * AUDIO INITIALISIEREN
     *
     * Noch KEIN Loop.
     * =====================================================
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.init ===
        "function"
    ) {

        try {

            window.JACAudio.init();

        }

        catch (error) {

            console.warn(
                "JAC Audio Init:",
                error
            );

        }

    }


    /*
     * =====================================================
     * WELCOME
     * =====================================================
     */

    initializeWelcomePopup();


    /*
     * =====================================================
     * AUDIO RETRY
     * =====================================================
     */

    window.setTimeout(
        retryDashboardAudio,
        100
    );


    window.setTimeout(
        retryDashboardAudio,
        500
    );


    window.setTimeout(
        retryDashboardAudio,
        1200
    );


    /*
     * =====================================================
     * BROWSER FOCUS
     * =====================================================
     */

    window.addEventListener(
        "focus",
        retryDashboardAudio
    );


    window.addEventListener(
        "pageshow",
        retryDashboardAudio
    );


    document.addEventListener(
        "visibilitychange",
        function() {

            if (
                document.visibilityState ===
                "visible"
            ) {

                retryDashboardAudio();

            }

        }
    );


    /*
     * =====================================================
     * GAME STATE
     * =====================================================
     */

    const state =
        JACGameState.getGameState();


    const completedCases =
        getCompletedCases(
            state
        );


    const completedCount =
        completedCases.length;


    /*
     * =====================================================
     * AKTENSTATUS MERKEN
     * =====================================================
     */

    if (
        sessionStorage.getItem(
            DASHBOARD_SEEN_KEY
        ) === null
    ) {

        sessionStorage.setItem(
            DASHBOARD_SEEN_KEY,
            String(completedCount)
        );

    }


    /*
     * =====================================================
     * UI
     * =====================================================
     */

    updateDashboard(
        state
    );


    connectCaseButtons();

    connectResetButtons();

    createNewGameButton();


    /*
     * =====================================================
     * NEUE ABGESCHLOSSENE AKTE
     * =====================================================
     */

    detectRecentlyCompletedCase(
        completedCases
    );


    console.log(
        "JAC: Dashboard vollständig initialisiert."
    );

}


/* =========================================================
   DASHBOARD AKTUALISIEREN
========================================================= */

function updateDashboard(state) {

    if (!state) {

        return;

    }


    updateProgress(
        state
    );

    updateCases(
        state
    );

    updateSystemMessage(
        state
    );

}


/* =========================================================
   ABGESCHLOSSENE AKTEN
========================================================= */

function getCompletedCases(state) {

    if (
        !state ||
        !Array.isArray(
            state.completedCases
        )
    ) {

        return [];

    }


    return state.completedCases
        .map(Number)
        .filter(
            function(number) {

                return (
                    Number.isInteger(number) &&
                    number >= 1 &&
                    number <= TOTAL_CASES
                );

            }
        )
        .sort(
            function(a, b) {

                return a - b;

            }
        );

}


/* =========================================================
   NEUE ABGESCHLOSSENE AKTE ERKENNEN
========================================================= */

function detectRecentlyCompletedCase(
    completedCases
) {

    const currentCount =
        completedCases.length;


    const storedValue =
        sessionStorage.getItem(
            DASHBOARD_SEEN_KEY
        );


    if (storedValue === null) {

        sessionStorage.setItem(
            DASHBOARD_SEEN_KEY,
            String(currentCount)
        );

        /*
         * Wenn bereits 5 Akten abgeschlossen sind,
         * direkt zum großen Abschluss.
         */

        if (
            currentCount >= TOTAL_CASES
        ) {

            redirectToFinal();

        }

        return;

    }


    const previousCount =
        Number(storedValue);


    if (!Number.isInteger(previousCount)) {

        sessionStorage.setItem(
            DASHBOARD_SEEN_KEY,
            String(currentCount)
        );

        return;

    }


    /*
     * =====================================================
     * ALLE 5 AKTEN ABGESCHLOSSEN
     * =====================================================
     *
     * Kein Dashboard-Abschluss-Popup mehr.
     *
     * Direkt zu abschluss.html.
     */

    if (
        currentCount >= TOTAL_CASES &&
        previousCount < TOTAL_CASES
    ) {

        sessionStorage.setItem(
            DASHBOARD_SEEN_KEY,
            String(currentCount)
        );


        redirectToFinal();


        return;

    }


    /*
     * Keine neue Akte.
     */

    if (
        currentCount <= previousCount
    ) {

        return;

    }


    let newlyCompletedCase =
        null;


    completedCases.forEach(
        function(number) {

            if (
                number > previousCount
            ) {

                newlyCompletedCase =
                    number;

            }

        }
    );


    if (
        newlyCompletedCase === null
    ) {

        newlyCompletedCase =
            completedCases[
                completedCases.length - 1
            ];

    }


    sessionStorage.setItem(
        DASHBOARD_SEEN_KEY,
        String(currentCount)
    );


    /*
     * =====================================================
     * AKTE FREIGABE
     * =====================================================
     */

    playUnlockSound();


    showCaseCompletedPopup(
        newlyCompletedCase
    );

}


/* =========================================================
   ABSCHLUSS WEITERLEITUNG
========================================================= */

function redirectToFinal() {

    /*
     * Dashboard-Loop sicher stoppen.
     */

    stopDashboardLoop();


    /*
     * Kleine Verzögerung verhindert abrupten Seitenwechsel
     * mitten im UI-Update.
     */

    window.setTimeout(
        function() {

            window.location.href =
                "abschluss.html";

        },
        180
    );

}


/* =========================================================
   FORTSCHRITT
========================================================= */

function updateProgress(state) {

    const completedCases =
        getCompletedCases(
            state
        );


    const completed =
        completedCases.length;


    const current =
        document.getElementById(
            "progress-current"
        );


    if (current) {

        current.textContent =
            String(completed);

    }


    const status =
        document.getElementById(
            "progress-status"
        );


    if (status) {

        const remaining =
            TOTAL_CASES -
            completed;


        if (remaining <= 0) {

            status.textContent =
                "Alle fünf Akten wurden abgeschlossen.";

        }

        else if (remaining === 1) {

            status.textContent =
                "1 Akte wartet auf Bearbeitung.";

        }

        else {

            status.textContent =
                remaining +
                " Akten warten auf Bearbeitung.";

        }

    }


    const segments =
        document.querySelectorAll(
            ".progress-segment"
        );


    segments.forEach(
        function(segment) {

            const number =
                Number(
                    segment.dataset.segment
                );


            if (!Number.isInteger(number)) {

                return;

            }


            segment.classList.remove(
                "active",
                "completed",
                "segment-flash"
            );


            if (
                completedCases.includes(
                    number
                )
            ) {

                segment.classList.add(
                    "completed"
                );

            }

            else {

                segment.classList.add(
                    "available"
                );

            }

        }
    );


    const progressLogo =
        document.getElementById(
            "progress-logo"
        );


    if (progressLogo) {

        progressLogo.classList.toggle(
            "has-progress",
            completed > 0
        );


        progressLogo.classList.toggle(
            "completed",
            completed >= TOTAL_CASES
        );

    }


    const percentage =
        document.getElementById(
            "progress-percentage"
        );


    if (percentage) {

        percentage.textContent =
            Math.round(
                (
                    completed /
                    TOTAL_CASES
                ) *
                100
            ) +
            "%";

    }


    const fill =
        document.querySelector(
            ".progress-bar-fill"
        );


    if (fill) {

        fill.style.width =
            (
                (
                    completed /
                    TOTAL_CASES
                ) *
                100
            ) +
            "%";

    }

}


/* =========================================================
   AKTEN STATUS
========================================================= */

function updateCases(state) {

    const completedCases =
        getCompletedCases(
            state
        );


    let nextCase =
        null;


    if (
        typeof JACGameState.getNextCase ===
        "function"
    ) {

        nextCase =
            JACGameState.getNextCase();

    }


    if (
        nextCase === null ||
        nextCase === undefined
    ) {

        for (
            let i = 1;
            i <= TOTAL_CASES;
            i++
        ) {

            if (
                !completedCases.includes(i)
            ) {

                nextCase =
                    i;

                break;

            }

        }

    }


    for (
        let number = 1;
        number <= TOTAL_CASES;
        number++
    ) {

        const card =
            document.querySelector(
                '.case-card[data-case="' +
                number +
                '"]'
            );


        const button =
            document.querySelector(
                '[data-case-button="' +
                number +
                '"]'
            );


        if (
            !card ||
            !button
        ) {

            continue;

        }


        card.classList.remove(
            "case-available",
            "case-locked",
            "case-completed",
            "available",
            "locked",
            "completed"
        );


        /*
         * =====================================================
         * ABGESCHLOSSEN
         * =====================================================
         */

        if (
            completedCases.includes(
                number
            )
        ) {

            card.classList.add(
                "case-completed",
                "completed"
            );


            button.disabled =
                true;


            button.textContent =
                "ABGESCHLOSSEN";


            continue;

        }


        /*
         * =====================================================
         * FREIGEGEBEN
         * =====================================================
         */

        if (
            number === nextCase
        ) {

            card.classList.add(
                "case-available",
                "available"
            );


            button.disabled =
                false;


            button.textContent =
                "AKTE ÖFFNEN";


            continue;

        }


        /*
         * =====================================================
         * GESPERRT
         * =====================================================
         */

        card.classList.add(
            "case-locked",
            "locked"
        );


        button.disabled =
            true;


        button.textContent =
            "GESPERRT";

    }

}


/* =========================================================
   AKTEN BUTTONS
========================================================= */

function connectCaseButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-case-button]"
        );


    buttons.forEach(
        function(button) {

            if (
                button.dataset.jacConnected ===
                "true"
            ) {

                return;

            }


            button.dataset.jacConnected =
                "true";


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    if (
                        button.disabled
                    ) {

                        return;

                    }


                    const caseNumber =
                        Number(
                            button.dataset.caseButton
                        );


                    if (
                        !Number.isInteger(
                            caseNumber
                        )
                    ) {

                        return;

                    }


                    playClick();

                    playCaseOpenSound();


                    openCase(
                        caseNumber
                    );

                }
            );

        }
    );

}


/* =========================================================
   AKTE ÖFFNEN
========================================================= */

function openCase(
    caseNumber
) {

    if (!window.JACGameState) {

        return;

    }


    if (
        typeof JACGameState.isCaseUnlocked ===
        "function"
    ) {

        if (
            !JACGameState.isCaseUnlocked(
                caseNumber
            )
        ) {

            console.warn(
                "JAC: Akte " +
                String(caseNumber).padStart(
                    2,
                    "0"
                ) +
                " ist nicht freigegeben."
            );

            return;

        }

    }


    const state =
        JACGameState.getGameState();


    const completedCases =
        getCompletedCases(
            state
        );


    if (
        completedCases.includes(
            caseNumber
        )
    ) {

        return;

    }


    /*
     * Loop beim Betreten der Akte stoppen.
     */

    stopDashboardLoop();


    const target =
        "akte-message.html?akte=" +
        encodeURIComponent(
            caseNumber
        );


    window.setTimeout(
        function() {

            window.location.href =
                target;

        },
        220
    );

}


/* =========================================================
   SYSTEMMELDUNG
========================================================= */

function updateSystemMessage(
    state
) {

    const element =
        document.getElementById(
            "system-message"
        );


    if (!element) {

        return;

    }


    const completed =
        getCompletedCases(
            state
        ).length;


    if (
        completed >= TOTAL_CASES
    ) {

        element.textContent =
            "Alle Ermittlungsakten wurden erfolgreich bearbeitet.";

        return;

    }


    const nextCase =
        completed + 1;


    element.textContent =
        "AKTE " +
        String(nextCase).padStart(
            2,
            "0"
        ) +
        " steht zur Bearbeitung bereit.";

}


/* =========================================================
   AKTE ABGESCHLOSSEN
   JAC RELEASE OVERLAY

   Ablauf:

   AKTE abgeschlossen
        ↓
   Overlay erscheint
        ↓
   Dashboard bleibt unverändert
        ↓
   WEITER
        ↓
   Overlay schließt
        ↓
   Goldsegment / Progress-Animation
========================================================= */

function showCaseCompletedPopup(caseNumber) {

    if (completionPopupOpen) {
        return;
    }


    completionPopupOpen = true;

    pendingAnimationCase = caseNumber;


    /*
     * Falls noch ein altes Overlay existiert,
     * entfernen.
     */

    const oldPopup =
        document.getElementById(
            "jac-release-popup"
        );


    if (oldPopup) {

        if (oldPopup._escapeHandler) {

            document.removeEventListener(
                "keydown",
                oldPopup._escapeHandler
            );

        }

        oldPopup.remove();

    }


    /*
     * =====================================================
     * OVERLAY
     * =====================================================
     */

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "jac-release-popup";


    overlay.className =
        "jac-release-popup";
/* =====================================================
   JAC FULLSCREEN OVERLAY
   Dashboard vollständig abdecken.
   Kein Dashboard darf während der Freigabe
   sichtbar sein.
===================================================== */

overlay.style.position = "fixed";
overlay.style.inset = "0";
overlay.style.width = "100vw";
overlay.style.height = "100vh";

overlay.style.zIndex = "999999";

overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";

overlay.style.background =
    "rgba(2, 7, 12, 0.98)";

overlay.style.backdropFilter =
    "blur(12px)";

overlay.style.webkitBackdropFilter =
    "blur(12px)";

overlay.style.opacity = "1";

overlay.style.pointerEvents = "auto";

overlay.style.overflow = "hidden";
/* JAC Vollbild-Abdeckung */

const blackout =
    document.createElement("div");

blackout.style.position =
    "absolute";

blackout.style.inset =
    "0";

blackout.style.background =
    "linear-gradient(" +
        "145deg," +
        "rgba(2,7,12,0.99)," +
        "rgba(5,12,19,0.99)" +
    ")";

blackout.style.zIndex =
    "0";

blackout.style.pointerEvents =
    "none";

overlay.appendChild(
    blackout
);

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * =====================================================
     * DIALOG
     * =====================================================
     */

    const dialog =
        document.createElement(
            "div"
        );


    dialog.className =
        "jac-release-dialog";


    const formattedCase =
        String(
            caseNumber
        ).padStart(
            2,
            "0"
        );


    /*
     * NÄCHSTE AKTE
     *
     * Die nächste Akte wird hier NICHT
     * im Dashboard freigeschaltet.
     */

    const nextCase =
        Math.min(
            Number(caseNumber) + 1,
            TOTAL_CASES
        );


    const formattedNextCase =
        String(
            nextCase
        ).padStart(
            2,
            "0"
        );


    dialog.innerHTML =

        '<div class="jac-popup-scanline"></div>' +

        '<div class="jac-release-logo">' +
            'JAC' +
        '</div>' +

        '<div class="section-label">' +
            'FREIGABE-PROTOKOLL' +
        '</div>' +

        '<h2>' +
            'AKTE ' +
            formattedNextCase +
            ' FREIGEGEBEN' +
        '</h2>' +

        '<p>' +

            'Agent JAC-090996, die vorherige ' +
            'Ermittlungsakte wurde erfolgreich ' +
            'abgeschlossen.' +

            '<br><br>' +

            'Die nächste Ermittlungsakte wurde ' +
            'für Ihre Zugriffsstufe autorisiert.' +

        '</p>' +

        '<div class="jac-release-case">' +

            'AKTE ' +
            formattedNextCase +
            ' · ZUGRIFF AUTORISIERT' +

        '</div>' +

        '<div class="jac-release-audio">' +

            '<span class="audio-indicator">' +
                            '</span>' +

           
            '</span>' +

        '</div>' +

        '<button ' +
            'id="jac-release-confirm" ' +
            'type="button">' +

            'WEITER' +

        '</button>';


    overlay.appendChild(
        dialog
    );


    document.body.appendChild(
        overlay
    );


    /*
     * =====================================================
     * WEITER
     * =====================================================
     */

    const button =
        document.getElementById(
            "jac-release-confirm"
        );


    if (button) {

        button.addEventListener(
            "click",
            async function() {


                /*
                 * -------------------------------------------------
                 * AUDIO INITIALISIEREN
                 * -------------------------------------------------
                 */

                if (
                    window.JACAudio &&
                    typeof window.JACAudio.init ===
                    "function"
                ) {

                    try {

                        window.JACAudio.init();

                    }
                    catch (error) {

                        console.warn(
                            "JAC Audio Init:",
                            error
                        );

                    }

                }


                /*
                 * -------------------------------------------------
                 * AUDIO UNLOCK
                 * -------------------------------------------------
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
                            "JAC Audio Unlock:",
                            error
                        );

                    }

                }


                /*
                 * -------------------------------------------------
                 * BUTTON-KLICK
                 * -------------------------------------------------
                 */

                playClick();


                /*
                 * -------------------------------------------------
                 * OVERLAY SCHLIESSEN
                 * -------------------------------------------------
                 */

                closeCaseCompletedPopup();

            }
        );

    }


    /*
     * =====================================================
     * ESCAPE
     * =====================================================
     *
     * Escape bleibt wie bisher möglich.
     */

    overlay._escapeHandler =
        function(event) {

            if (
                event.key === "Escape"
            ) {

                playClick();

                closeCaseCompletedPopup();

            }

        };


    document.addEventListener(
        "keydown",
        overlay._escapeHandler
    );

}


/* =========================================================
   POPUP SCHLIESSEN
========================================================= */

function closeCaseCompletedPopup() {

    const popup =
        document.getElementById(
            "jac-release-popup"
        );


    if (!popup) {

        completionPopupOpen =
            false;

        return;

    }


    /*
     * Escape Listener entfernen.
     */

    if (
        popup._escapeHandler
    ) {

        document.removeEventListener(
            "keydown",
            popup._escapeHandler
        );

    }


    /*
     * =====================================================
     * OVERLAY AUSBLENDEN
     * =====================================================
     */

    popup.classList.add(
        "closing"
    );


    /*
     * =====================================================
     * ERST NACH DER OVERLAY-ANIMATION
     * WIRD DIE GOLDANIMATION AUSGEFÜHRT.
     * =====================================================
     */

    window.setTimeout(
        function() {


            if (
                popup &&
                popup.parentNode
            ) {

                popup.parentNode.removeChild(
                    popup
                );

            }


            completionPopupOpen =
                false;


            /*
             * =================================================
             * PROGRESS ANIMATION
             * =================================================
             */

            if (
                pendingAnimationCase !== null
            ) {

                const caseNumber =
                    pendingAnimationCase;


                pendingAnimationCase =
                    null;


                /*
                 * AKTE 5
                 *
                 * Finale unverändert behandeln.
                 */

                if (
                    caseNumber >= TOTAL_CASES
                ) {

                    redirectToFinal();

                    return;

                }


                /*
                 * =================================================
                 * JETZT ERST:
                 *
                 * Goldsegment
                 * Progress-Sound
                 * Sparkle
                 *
                 * Das passiert bewusst NACH dem Overlay.
                 * =================================================
                 */

                window.setTimeout(
                    function() {

                        animateCompletedSegment(
                            caseNumber
                        );

                    },
                    80
                );

            }

        },
        350
    );

}


/* =========================================================
   GOLD SEGMENT
========================================================= */

function animateCompletedSegment(
    caseNumber
) {

    const segment =
        document.querySelector(
            '.progress-segment[data-segment="' +
            caseNumber +
            '"]'
        );


    if (!segment) {

        console.warn(
            "JAC: Segment " +
            caseNumber +
            " nicht gefunden."
        );


        /*
         * Trotzdem Loop wieder starten.
         */

        startDashboardLoop();


        return;

    }


    /*
     * AUDIO
     */

    playProgressSound();


    /*
     * GOLD DAUERHAFT
     */

    segment.classList.add(
        "completed"
    );


    segment.classList.remove(
        "available"
    );


    segment.classList.remove(
        "segment-flash"
    );


    void segment.offsetWidth;


    segment.classList.add(
        "segment-flash"
    );


    createSparkleBurst(
        segment
    );


    window.setTimeout(
        function() {

            segment.classList.remove(
                "segment-flash"
            );


            segment.classList.add(
                "completed"
            );


            /*
             * =================================================
             * LOOP NACH AKTEN-POPUP WIEDER STARTEN
             * =================================================
             */

            startDashboardLoop();

        },
        1400
    );

}


/* =========================================================
   SPARKLE BURST
========================================================= */

function createSparkleBurst(
    segment
) {

    const container =
        document.getElementById(
            "sparkle-container"
        );


    const logo =
        document.getElementById(
            "progress-logo"
        );


    if (
        !container ||
        !logo ||
        !segment
    ) {

        return;

    }


    const logoRect =
        logo.getBoundingClientRect();


    const segmentRect =
        segment.getBoundingClientRect();


    const centerX =
        segmentRect.left +
        segmentRect.width / 2 -
        logoRect.left;


    const centerY =
        segmentRect.top +
        segmentRect.height / 2 -
        logoRect.top;


    const sparkleCount =
        32;


    for (
        let i = 0;
        i < sparkleCount;
        i++
    ) {

        const spark =
            document.createElement(
                "span"
            );


        spark.className =
            "spark";


        spark.style.left =
            centerX + "px";


        spark.style.top =
            centerY + "px";


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            25 +
            Math.random() *
            70;


        const x =
            Math.cos(angle) *
            distance;


        const y =
            Math.sin(angle) *
            distance;


        spark.style.setProperty(
            "--spark-x",
            x + "px"
        );


        spark.style.setProperty(
            "--spark-y",
            y + "px"
        );


        const size =
            2 +
            Math.random() *
            4;


        spark.style.width =
            size + "px";


        spark.style.height =
            size + "px";


        spark.style.animationDelay =
            (
                Math.random() *
                0.2
            ) +
            "s";


        container.appendChild(
            spark
        );


        window.setTimeout(
            function() {

                if (
                    spark &&
                    spark.parentNode
                ) {

                    spark.parentNode.removeChild(
                        spark
                    );

                }

            },
            1800
        );

    }


    /*
     * ZENTRALER ENERGY FLASH
     */

    const flash =
        document.createElement(
            "span"
        );


    flash.className =
        "segment-energy-flash";


    flash.style.left =
        centerX + "px";


    flash.style.top =
        centerY + "px";


    container.appendChild(
        flash
    );


    window.setTimeout(
        function() {

            if (
                flash &&
                flash.parentNode
            ) {

                flash.parentNode.removeChild(
                    flash
                );

            }

        },
        1000
    );

}


/* =========================================================
   NEUES SPIEL
========================================================= */

function createNewGameButton() {

    if (
        document.getElementById(
            "new-game-button"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "new-game-button";


    button.type =
        "button";


    button.className =
        "jac-new-game-button";


    button.innerHTML =
        '<span class="new-game-icon"></span>' +
        '<span>NEUES SPIEL</span>';


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            playClick();


            openResetOverlay();

        }
    );


    document.body.appendChild(
        button
    );

}


/* =========================================================
   RESET OVERLAY
========================================================= */

function openResetOverlay() {

    let overlay =
        document.getElementById(
            "reset-overlay"
        );


    if (!overlay) {

        overlay =
            createResetOverlay();

    }


    overlay.classList.remove(
        "hidden"
    );


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   RESET OVERLAY ERZEUGEN
========================================================= */

function createResetOverlay() {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "reset-overlay";


    overlay.className =
        "reset-overlay hidden";


    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    overlay.innerHTML =

        '<div class="reset-dialog">' +

            '<div class="jac-reset-logo">JAC</div>' +

            '<div class="section-label">SYSTEMRESET</div>' +

            '<h2>NEUES SPIEL STARTEN?</h2>' +

            '<p>' +
                'Der aktuelle Ermittlungsfortschritt wird vollständig gelöscht.' +
            '</p>' +

            '<div class="reset-warning">' +
                'ACHTUNG · DIESER VORGANG KANN NICHT RÜCKGÄNGIG GEMACHT WERDEN' +
            '</div>' +

            '<div class="reset-actions">' +

                '<button id="reset-cancel-button" type="button">' +
                    'ABBRECHEN' +
                '</button>' +

                '<button id="reset-confirm-button" type="button">' +
                    'NEUES SPIEL' +
                '</button>' +

            '</div>' +

        '</div>';


    document.body.appendChild(
        overlay
    );


    const cancel =
        overlay.querySelector(
            "#reset-cancel-button"
        );


    const confirm =
        overlay.querySelector(
            "#reset-confirm-button"
        );


    if (cancel) {

        cancel.addEventListener(
            "click",
            function() {

                playClick();

                closeResetOverlay();

            }
        );

    }


    if (confirm) {

        confirm.addEventListener(
            "click",
            function() {

                playClick();


                if (
                    window.JACAudio &&
                    typeof window.JACAudio.reset ===
                    "function"
                ) {

                    window.JACAudio.reset();

                }


                performReset();

            }
        );

    }


    overlay._escapeHandler =
        function(event) {

            if (
                event.key === "Escape"
            ) {

                playClick();

                closeResetOverlay();

            }

        };


    document.addEventListener(
        "keydown",
        overlay._escapeHandler
    );


    return overlay;

}


/* =========================================================
   RESET BUTTONS
========================================================= */

function connectResetButtons() {

    const confirmButton =
        document.getElementById(
            "reset-confirm-button"
        );


    const cancelButton =
        document.getElementById(
            "reset-cancel-button"
        );


    if (confirmButton) {

        if (
            confirmButton.dataset.jacConnected !==
            "true"
        ) {

            confirmButton.dataset.jacConnected =
                "true";


            confirmButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    playClick();


                    if (
                        window.JACAudio &&
                        typeof window.JACAudio.reset ===
                        "function"
                    ) {

                        window.JACAudio.reset();

                    }


                    performReset();

                }
            );

        }

    }


    if (cancelButton) {

        if (
            cancelButton.dataset.jacConnected !==
            "true"
        ) {

            cancelButton.dataset.jacConnected =
                "true";


            cancelButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    playClick();


                    closeResetOverlay();

                }
            );

        }

    }

}


/* =========================================================
   RESET SCHLIESSEN
========================================================= */

function closeResetOverlay() {

    const overlay =
        document.getElementById(
            "reset-overlay"
        );


    if (!overlay) {

        return;

    }


    overlay.classList.add(
        "hidden"
    );


    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   RESET AUSFÜHREN
========================================================= */

function performReset() {

    if (!window.JACGameState) {

        return;

    }


    const success =
        JACGameState.resetGame();


    if (!success) {

        console.error(
            "JAC: Spielstand konnte nicht zurückgesetzt werden."
        );

        return;

    }


    /*
     * Sessiondaten löschen.
     */

    sessionStorage.removeItem(
        DASHBOARD_SEEN_KEY
    );


    sessionStorage.removeItem(
        DASHBOARD_AUDIO_STARTED_KEY
    );


    sessionStorage.removeItem(
        DASHBOARD_WELCOME_ACCEPTED_KEY
    );


    stopDashboardLoop();


    window.setTimeout(
        function() {

            window.location.href =
                "login.html";

        },
        450
    );

}


/* =========================================================
   DATUM / UHRZEIT
========================================================= */

function updatePortalDateTime() {

    const element =
        document.getElementById(
            "portal-datetime"
        );


    if (!element) {

        return;

    }


    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            "de-DE",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );


    const time =
        now.toLocaleTimeString(
            "de-DE",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    element.textContent =
        `${date} · ${time}`;

}


/* =========================================================
   UHRZEIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updatePortalDateTime();


        setInterval(
            updatePortalDateTime,
            1000
        );

    }
);


/* =========================================================
   ENDE
========================================================= */

console.log(
    "JAC: dashboard.js geladen."
);