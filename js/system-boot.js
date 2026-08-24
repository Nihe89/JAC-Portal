"use strict";

/* =========================================================
   JAC PORTAL
   SYSTEM BOOT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initSystemBoot();

    }
);


/* =========================================================
   INITIALISIERUNG
========================================================= */

function initSystemBoot() {

    const startOverlay =
        document.getElementById(
            "boot-start-overlay"
        );

    const startButton =
        document.getElementById(
            "start-system-boot"
        );

    const bootStatus =
        document.getElementById(
            "boot-status"
        );

    const bootLog =
        document.getElementById(
            "boot-log"
        );

    const bootPercent =
        document.getElementById(
            "boot-percent"
        );

    const bootProgressBar =
        document.getElementById(
            "boot-progress-bar"
        );

    const bootTerminalState =
        document.getElementById(
            "boot-terminal-state"
        );

    const bootFooterStatus =
        document.getElementById(
            "boot-footer-status"
        );

    const bootComplete =
        document.getElementById(
            "boot-complete"
        );

    const bootAccess =
        document.getElementById(
            "boot-access"
        );


    const modules = {

        identity:
            document.getElementById(
                "boot-module-identity"
            ),

        biometric:
            document.getElementById(
                "boot-module-biometric"
            ),

        security:
            document.getElementById(
                "boot-module-security"
            ),

        database:
            document.getElementById(
                "boot-module-database"
            )

    };


    if (
        !startOverlay ||
        !startButton
    ) {

        console.error(
            "JAC: Boot-Start-Elemente fehlen."
        );

        return;

    }


    function wait(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );

    }


    /* =====================================================
       AUDIO INIT
    ===================================================== */

    function initializeAudio() {

        if (
            window.JACAudio &&
            typeof window.JACAudio.init ===
                "function"
        ) {

            window.JACAudio.init();

        }

    }


    /* =====================================================
       AUDIO UNLOCK
    ===================================================== */

    async function unlockAudio() {

        if (
            !window.JACAudio ||
            typeof window.JACAudio.unlock !==
                "function"
        ) {

            return false;

        }


        try {

            return await window.JACAudio.unlock();

        }

        catch (error) {

            console.warn(
                "JAC Audio Unlock:",
                error
            );

            return false;

        }

    }


    /* =====================================================
       BOOT SOUND
    ===================================================== */

    function playBootSound() {

        if (
            window.JACAudio &&
            typeof window.JACAudio.boot ===
                "function"
        ) {

            return window.JACAudio.boot();

        }

        return null;

    }


    /* =====================================================
       MODUL BESTÄTIGUNG
    ===================================================== */

    function playModuleConfirmation() {

        if (
            window.JACAudio &&
            typeof window.JACAudio.scanSuccess ===
                "function"
        ) {

            return window.JACAudio.scanSuccess();

        }

        return null;

    }


    /* =====================================================
       READY
    ===================================================== */

    function playReadySound() {

        if (
            window.JACAudio &&
            typeof window.JACAudio.ready ===
                "function"
        ) {

            return window.JACAudio.ready();

        }

        return null;

    }


    /* =====================================================
       LOG
    ===================================================== */

    function addLog(
        text,
        type = ""
    ) {

        if (!bootLog) {

            return;

        }


        const line =
            document.createElement(
                "div"
            );


        line.className =
            "boot-log-line " +
            type;


        const time =
            new Date()
                .toLocaleTimeString(
                    "de-DE",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );


        const timeElement =
            document.createElement(
                "span"
            );


        timeElement.textContent =
            "[" + time + "]";


        line.appendChild(
            timeElement
        );


        line.appendChild(
            document.createTextNode(
                " " + text
            )
        );


        bootLog.appendChild(
            line
        );


        bootLog.scrollTop =
            bootLog.scrollHeight;

    }


    /* =====================================================
       PROGRESS
    ===================================================== */

    function setProgress(value) {

        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );


        if (bootProgressBar) {

            bootProgressBar.style.width =
                percent + "%";

        }


        if (bootPercent) {

            bootPercent.textContent =
                Math.round(percent) +
                "%";

        }

    }


    /* =====================================================
       MODULE
    ===================================================== */

    function setModule(
        module,
        state,
        text
    ) {

        if (!module) {

            return;

        }


        module.dataset.state =
            state;


        const status =
            module.querySelector(
                ".boot-module-info strong"
            );


        const indicator =
            module.querySelector(
                ".boot-module-indicator"
            );


        if (status) {

            status.textContent =
                text;

        }


        if (indicator) {

            if (
                state === "active"
            ) {

                indicator.textContent =
                    "◉";

            }

            else if (
                state === "verified"
            ) {

                indicator.textContent =
                    "✓";

            }

            else {

                indicator.textContent =
                    "○";

            }

        }

    }


    /* =====================================================
       GAMESTATE
    ===================================================== */

    function getGameStatus() {

        try {

            if (
                window.JACGameState &&
                typeof window.JACGameState
                    .getPortalStatus ===
                    "function"
            ) {

                return window.JACGameState
                    .getPortalStatus();

            }

        }

        catch (error) {

            console.warn(
                "JAC GameState:",
                error
            );

        }


        return null;

    }


    /* =====================================================
       BOOT
    ===================================================== */

    async function startBoot() {

        if (
            startButton.disabled
        ) {

            return;

        }


        startButton.disabled =
            true;


        startButton.textContent =
            "SYSTEM WIRD GESTARTET...";


        /* =================================================
           WICHTIG:
           AUDIO FREIGABE INNERHALB DES USER-KLICKS
        ================================================= */

        initializeAudio();

        await unlockAudio();


        /*
         * Der Unlock wurde jetzt in sessionStorage
         * hinterlegt.
         *
         * dashboard.html kann dadurch den Loop
         * ohne neuen Benutzerklick starten.
         */


        /* =================================================
           BOOT SOUND
        ================================================= */

        playBootSound();


        /* =================================================
           OVERLAY
        ================================================= */

        startOverlay.classList.add(
            "hidden"
        );


        setProgress(0);


        if (bootTerminalState) {

            bootTerminalState.textContent =
                "INITIALIZING";

        }


        if (bootFooterStatus) {

            bootFooterStatus.textContent =
                "SYSTEM INITIALIZATION ACTIVE";

        }


        if (bootStatus) {

            bootStatus.textContent =
                "SICHERE SYSTEMUMGEBUNG WIRD INITIALISIERT...";

        }


        addLog(
            "JAC SECURE TERMINAL INITIALIZED",
            "system"
        );


        await wait(450);


        /* =================================================
           01
        ================================================= */

        setModule(
            modules.identity,
            "active",
            "PRÜFUNG"
        );


        if (bootStatus) {

            bootStatus.textContent =
                "Identitätskern wird geladen...";

        }


        addLog(
            "Loading identity core..."
        );


        await wait(650);


        const identityStatus =
            getGameStatus();


        setModule(
            modules.identity,
            "verified",
            identityStatus &&
            identityStatus.verified
                ? "BESTÄTIGT"
                : "ONLINE"
        );


        addLog(
            "Identity core online.",
            "success"
        );


        playModuleConfirmation();

        setProgress(20);


        /* =================================================
           02
        ================================================= */

        await wait(350);


        setModule(
            modules.biometric,
            "active",
            "PRÜFUNG"
        );


        if (bootStatus) {

            bootStatus.textContent =
                "Biometrische Authentifizierung wird übernommen...";

        }


        addLog(
            "Loading biometric authentication core..."
        );


        await wait(700);


        const biometricStatus =
            getGameStatus();


        setModule(
            modules.biometric,
            "verified",
            biometricStatus &&
            biometricStatus.fingerprintVerified &&
            biometricStatus.hologramUnlocked
                ? "BESTÄTIGT"
                : "ONLINE"
        );


        addLog(
            "Biometric core online.",
            "success"
        );


        playModuleConfirmation();

        setProgress(45);


        /* =================================================
           03
        ================================================= */

        await wait(350);


        setModule(
            modules.security,
            "active",
            "PRÜFUNG"
        );


        if (bootStatus) {

            bootStatus.textContent =
                "Sicherheitsebene wird aktiviert...";

        }


        addLog(
            "Initializing security layer..."
        );


        await wait(700);


        setModule(
            modules.security,
            "verified",
            "SECURE"
        );


        addLog(
            "Security layer operational.",
            "success"
        );


        playModuleConfirmation();

        setProgress(70);


        /* =================================================
           04
        ================================================= */

        await wait(350);


        setModule(
            modules.database,
            "active",
            "LADEN"
        );


        if (bootStatus) {

            bootStatus.textContent =
                "Ermittlungsdatenbank wird geladen...";

        }


        addLog(
            "Connecting to case database..."
        );


        await wait(700);


        setModule(
            modules.database,
            "verified",
            "ONLINE"
        );


        addLog(
            "Case database connection established.",
            "success"
        );


        playModuleConfirmation();

        setProgress(90);


        /* =================================================
           READY
        ================================================= */

        await wait(450);


        setProgress(100);


        if (bootTerminalState) {

            bootTerminalState.textContent =
                "READY";

        }


        if (bootFooterStatus) {

            bootFooterStatus.textContent =
                "SYSTEM BEREIT";

        }


        if (bootStatus) {

            bootStatus.textContent =
                "Alle Systeme erfolgreich initialisiert.";

        }


        addLog(
            "ALL SYSTEMS OPERATIONAL.",
            "success"
        );


        addLog(
            "ACCESS GRANTED.",
            "success"
        );


        if (bootComplete) {

            bootComplete.classList.add(
                "ready"
            );

        }


        if (bootAccess) {

            bootAccess.textContent =
                "ACCESS GRANTED";

        }


        await wait(250);


        playReadySound();


        await wait(1800);


        /* =================================================
           DASHBOARD
        ================================================= */

      window.location.href = "dashboard.html?entry=boot";

    }


    /* =====================================================
       BUTTON
    ===================================================== */

    startButton.addEventListener(
        "click",
        function() {

            startBoot();

        }
    );

}