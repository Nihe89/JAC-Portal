"use strict";

/* =========================================================
   JAC PORTAL
   GAMESTATE.JS
   ZENTRALE SPIELSTANDSVERWALTUNG

   Speicher:
       localStorage["jacPortalSave"]

   Enthält:
   - Aktenfortschritt
   - Aktenfreigaben
   - Ergebnisse
   - Beweise
   - Hinweise
   - Fehler
   - Systemmeldungen
   - Portalstatus
   - Prüfung 01
   - Prüfung 02
   - Sicherheitsstufe
   - Dashboard-Freigabe
   - Reset
========================================================= */


/* =========================================================
   KONSTANTEN
========================================================= */

const JAC_SAVE_KEY = "jacPortalSave";

const JAC_TOTAL_CASES = 5;


/* =========================================================
   STANDARD-SPIELSTAND
========================================================= */

function createDefaultGameState() {

    const now =
        new Date().toISOString();


    return {

        /* -------------------------------------------------
           AKTEN
        ------------------------------------------------- */

        completedCases: [],

        caseResults: {},


        /* -------------------------------------------------
           FUNDSTÜCKE
        ------------------------------------------------- */

        foundEvidence: [],

        foundClues: [],

        foundErrors: [],


        /* -------------------------------------------------
           SYSTEM
        ------------------------------------------------- */

        systemMessages: [],

        releaseMessagesShown: [],


        /* -------------------------------------------------
           AGENT
        ------------------------------------------------- */

        agentStatus:
            "AKTIV",

        securityLevel:
            1,


        /* -------------------------------------------------
           PORTAL
        ------------------------------------------------- */

        portalStatus:
            "OFFLINE",


        /* -------------------------------------------------
           PRÜFUNG 01
        ------------------------------------------------- */

        verified:
            false,


        /* -------------------------------------------------
           PRÜFUNG 02
        ------------------------------------------------- */

        fingerprintVerified:
            false,

        hologramUnlocked:
            false,


        /* -------------------------------------------------
           ABSCHLUSS
        ------------------------------------------------- */

        finalCompleted:
            false,

        assessmentCompleted:
            false,


        /* -------------------------------------------------
           ZEITSTEMPEL
        ------------------------------------------------- */

        createdAt:
            now,

        updatedAt:
            now

    };

}


/* =========================================================
   NORMALISIERUNG
========================================================= */

function normalizeCaseNumber(value) {

    const number =
        Number(value);


    if (
        !Number.isInteger(number)
    ) {

        return null;

    }


    if (
        number < 1 ||
        number > JAC_TOTAL_CASES
    ) {

        return null;

    }


    return number;

}


function normalizeCaseArray(value) {

    if (
        !Array.isArray(value)
    ) {

        return [];

    }


    return [

        ...new Set(

            value
                .map(normalizeCaseNumber)
                .filter(function (number) {

                    return number !== null;

                })

        )

    ].sort(function (a, b) {

        return a - b;

    });

}


function normalizeBoolean(value) {

    return value === true;

}


function normalizeSecurityLevel(value) {

    const level =
        Number(value);


    if (
        !Number.isFinite(level)
    ) {

        return 1;

    }


    return Math.max(

        1,

        Math.min(

            5,

            Math.round(level)

        )

    );

}


/* =========================================================
   SPIELSTAND LADEN
========================================================= */

function getGameState() {

    const defaults =
        createDefaultGameState();


    try {

        const stored =
            localStorage.getItem(
                JAC_SAVE_KEY
            );


        if (!stored) {

            return defaults;

        }


        const parsed =
            JSON.parse(stored);


        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {

            console.warn(
                "JAC: Ungültiger Spielstand."
            );

            return defaults;

        }


        const state = {

            ...defaults,

            ...parsed

        };


        /* -------------------------------------------------
           AKTEN
        ------------------------------------------------- */

        state.completedCases =
            normalizeCaseArray(
                state.completedCases
            );


        /* -------------------------------------------------
           CASE RESULTS
        ------------------------------------------------- */

        if (
            !state.caseResults ||
            typeof state.caseResults !== "object" ||
            Array.isArray(state.caseResults)
        ) {

            state.caseResults = {};

        }


        /* -------------------------------------------------
           BEWEISE
        ------------------------------------------------- */

        if (
            !Array.isArray(
                state.foundEvidence
            )
        ) {

            state.foundEvidence = [];

        }


        /* -------------------------------------------------
           HINWEISE
        ------------------------------------------------- */

        if (
            !Array.isArray(
                state.foundClues
            )
        ) {

            state.foundClues = [];

        }


        /* -------------------------------------------------
           FEHLER
        ------------------------------------------------- */

        if (
            !Array.isArray(
                state.foundErrors
            )
        ) {

            state.foundErrors = [];

        }


        /* -------------------------------------------------
           SYSTEMMELDUNGEN
        ------------------------------------------------- */

        if (
            !Array.isArray(
                state.systemMessages
            )
        ) {

            state.systemMessages = [];

        }


        /* -------------------------------------------------
           FREIGABEMELDUNGEN
        ------------------------------------------------- */

        state.releaseMessagesShown =
            normalizeCaseArray(
                state.releaseMessagesShown
            );


        /* -------------------------------------------------
           PORTAL
        ------------------------------------------------- */

        state.verified =
            normalizeBoolean(
                state.verified
            );


        state.fingerprintVerified =
            normalizeBoolean(
                state.fingerprintVerified
            );


        state.hologramUnlocked =
            normalizeBoolean(
                state.hologramUnlocked
            );


        state.finalCompleted =
            normalizeBoolean(
                state.finalCompleted
            );


        state.assessmentCompleted =
            normalizeBoolean(
                state.assessmentCompleted
            );


        state.securityLevel =
            normalizeSecurityLevel(
                state.securityLevel
            );


        /* -------------------------------------------------
           AGENT STATUS
        ------------------------------------------------- */

        if (
            typeof state.agentStatus !== "string" ||
            !state.agentStatus.trim()
        ) {

            state.agentStatus =
                "AKTIV";

        }


        /* -------------------------------------------------
           PORTAL STATUS
        ------------------------------------------------- */

        if (
            typeof state.portalStatus !== "string" ||
            !state.portalStatus.trim()
        ) {

            state.portalStatus =
                "OFFLINE";

        }


        /* -------------------------------------------------
           AUTOMATISCHER ABSCHLUSS
        ------------------------------------------------- */

        if (
            state.completedCases.length ===
            JAC_TOTAL_CASES
        ) {

            state.assessmentCompleted =
                true;

            state.finalCompleted =
                true;

        }


        return state;


    } catch (error) {

        console.error(
            "JAC: Spielstand konnte nicht geladen werden.",
            error
        );


        return defaults;

    }

}


/* =========================================================
   SPIELSTAND SPEICHERN
========================================================= */

function saveGameState(state) {

    if (
        !state ||
        typeof state !== "object"
    ) {

        return false;

    }


    try {

        state.completedCases =
            normalizeCaseArray(
                state.completedCases
            );


        state.releaseMessagesShown =
            normalizeCaseArray(
                state.releaseMessagesShown
            );


        state.updatedAt =
            new Date().toISOString();


        /* -------------------------------------------------
           KOMPLETTER FALLABSCHLUSS
        ------------------------------------------------- */

        if (
            state.completedCases.length ===
            JAC_TOTAL_CASES
        ) {

            state.assessmentCompleted =
                true;

            state.finalCompleted =
                true;

        }


        localStorage.setItem(

            JAC_SAVE_KEY,

            JSON.stringify(state)

        );


        return true;


    } catch (error) {

        console.error(
            "JAC: Spielstand konnte nicht gespeichert werden.",
            error
        );


        return false;

    }

}


/* =========================================================
   INITIALISIERUNG
========================================================= */

function initializeGameState() {

    const existing =
        localStorage.getItem(
            JAC_SAVE_KEY
        );


    if (existing) {

        return getGameState();

    }


    const state =
        createDefaultGameState();


    saveGameState(
        state
    );


    return state;

}


/* =========================================================
   PORTAL STATUS
========================================================= */

function setPortalStatus(
    updates = {}
) {

    if (
        !updates ||
        typeof updates !== "object"
    ) {

        return false;

    }


    const state =
        getGameState();


    if (
        "verified" in updates
    ) {

        state.verified =
            Boolean(
                updates.verified
            );

    }


    if (
        "fingerprintVerified" in updates
    ) {

        state.fingerprintVerified =
            Boolean(
                updates.fingerprintVerified
            );

    }


    if (
        "hologramUnlocked" in updates
    ) {

        state.hologramUnlocked =
            Boolean(
                updates.hologramUnlocked
            );

    }


    if (
        "agentStatus" in updates
    ) {

        state.agentStatus =
            String(
                updates.agentStatus ||
                "AKTIV"
            );

    }


    if (
        "securityLevel" in updates
    ) {

        state.securityLevel =
            normalizeSecurityLevel(
                updates.securityLevel
            );

    }


    if (
        "portalStatus" in updates
    ) {

        state.portalStatus =
            String(
                updates.portalStatus ||
                "OFFLINE"
            );

    }


    return saveGameState(
        state
    );

}


function getPortalStatus() {

    const state =
        getGameState();


    return {

        verified:
            state.verified,

        fingerprintVerified:
            state.fingerprintVerified,

        hologramUnlocked:
            state.hologramUnlocked,

        agentStatus:
            state.agentStatus,

        securityLevel:
            state.securityLevel,

        portalStatus:
            state.portalStatus,

        portalOnline:
            state.portalStatus ===
            "ONLINE"

    };

}


function setVerified(
    value = true
) {

    return setPortalStatus({

        verified:
            Boolean(value)

    });

}


function setFingerprintVerified(
    value = true
) {

    return setPortalStatus({

        fingerprintVerified:
            Boolean(value)

    });

}


function setHologramUnlocked(
    value = true
) {

    return setPortalStatus({

        hologramUnlocked:
            Boolean(value)

    });

}


function setFinalCompleted(
    value = true
) {

    const state =
        getGameState();


    state.finalCompleted =
        Boolean(value);


    return saveGameState(
        state
    );

}


/* =========================================================
   PRÜFUNG 02
   SEKUNDÄRE BIOMETRISCHE VERIFIZIERUNG
========================================================= */

function completeSecondaryVerification() {

    const state =
        getGameState();


    /* -------------------------------------------------
       PRÜFUNG 01 MUSS ABGESCHLOSSEN SEIN
    ------------------------------------------------- */

    if (
        state.verified !== true
    ) {

        console.warn(
            "JAC: Sekundärprüfung verweigert. Prüfung 01 nicht abgeschlossen."
        );


        return false;

    }


    /* -------------------------------------------------
       FINGERABDRUCK
    ------------------------------------------------- */

    state.fingerprintVerified =
        true;


    /* -------------------------------------------------
       HOLOGRAMM
    ------------------------------------------------- */

    state.hologramUnlocked =
        true;


    /* -------------------------------------------------
       IDENTITÄT
    ------------------------------------------------- */

    state.verified =
        true;


    /* -------------------------------------------------
       SICHERHEITSSTUFE
    ------------------------------------------------- */

    state.securityLevel =
        Math.max(

            state.securityLevel,

            2

        );


    /* -------------------------------------------------
       AGENT
    ------------------------------------------------- */

    state.agentStatus =
        "VERIFIZIERT";


    /* -------------------------------------------------
       PORTAL
    ------------------------------------------------- */

    state.portalStatus =
        "ONLINE";


    /* -------------------------------------------------
       SYSTEMMELDUNG
    ------------------------------------------------- */

    addSystemMessageToState(

        state,

        {

            type:
                "success",

            title:
                "BIOMETRISCHE IDENTITÄT BESTÄTIGT",

            text:
                "Fingerabdruck und Sicherheitshologramm wurden erfolgreich verifiziert. Der Systemzugriff wurde freigegeben."

        }

    );


    /* -------------------------------------------------
       SPEICHERN
    ------------------------------------------------- */

    return saveGameState(
        state
    );

}


/* =========================================================
   DASHBOARD-ZUGRIFF
========================================================= */

function canAccessDashboard() {

    const state =
        getGameState();


    if (!state) {

        return false;

    }


    return Boolean(

        state.verified === true &&

        state.fingerprintVerified === true &&

        state.hologramUnlocked === true &&

        state.securityLevel >= 2

    );

}


/* =========================================================
   AKTEN
========================================================= */

function isCaseCompleted(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return false;

    }


    const state =
        getGameState();


    return state.completedCases.includes(
        number
    );

}


function getNextCase() {

    const state =
        getGameState();


    for (
        let number = 1;
        number <= JAC_TOTAL_CASES;
        number++
    ) {

        if (
            !state.completedCases.includes(
                number
            )
        ) {

            return number;

        }

    }


    return null;

}


function isCaseUnlocked(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return false;

    }


    if (
        isCaseCompleted(number)
    ) {

        return false;

    }


    return (
        number ===
        getNextCase()
    );

}


function getCaseStatus(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return "invalid";

    }


    if (
        isCaseCompleted(number)
    ) {

        return "completed";

    }


    if (
        isCaseUnlocked(number)
    ) {

        return "available";

    }


    return "locked";

}


function getAllCaseStatuses() {

    const result = [];


    for (
        let number = 1;
        number <= JAC_TOTAL_CASES;
        number++
    ) {

        result.push({

            caseNumber:
                number,

            status:
                getCaseStatus(number),

            completed:
                isCaseCompleted(number),

            unlocked:
                isCaseUnlocked(number)

        });

    }


    return result;

}


/* =========================================================
   AKTE ABSCHLIESSEN
========================================================= */

function completeCase(
    caseNumber,
    result = null
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        console.error(
            "JAC: Ungültige Aktennummer:",
            caseNumber
        );


        return false;

    }


    const state =
        getGameState();


    if (
        state.completedCases.includes(
            number
        )
    ) {

        return false;

    }


    const nextCase =
        getNextCase();


    if (
        number !== nextCase
    ) {

        console.warn(
            "JAC: Akte noch nicht freigegeben."
        );


        return false;

    }


    state.completedCases.push(
        number
    );


    state.completedCases =
        normalizeCaseArray(
            state.completedCases
        );


    if (
        result !== null
    ) {

        state.caseResults[number] =
            result;

    }


    addSystemMessageToState(

        state,

        createCaseCompletionMessage(
            number
        )

    );


    /* -------------------------------------------------
       LETZTE AKTE
    ------------------------------------------------- */

    if (
        number === JAC_TOTAL_CASES
    ) {

        state.assessmentCompleted =
            true;

        state.finalCompleted =
            true;

        state.agentStatus =
            "MISSION COMPLETE";

        state.portalStatus =
            "ONLINE";

    }


    return saveGameState(
        state
    );

}


/* =========================================================
   FREIGABEN
========================================================= */

function hasPendingCaseRelease() {

    const state =
        getGameState();


    const nextCase =
        getNextCase();


    if (
        nextCase === null
    ) {

        return false;

    }


    if (
        state.completedCases.length === 0
    ) {

        return false;

    }


    return !state.releaseMessagesShown.includes(
        nextCase
    );

}


function getPendingCaseRelease() {

    if (
        !hasPendingCaseRelease()
    ) {

        return null;

    }


    return createCaseReleaseMessage(
        getNextCase()
    );

}


function markCaseReleaseShown(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return false;

    }


    const state =
        getGameState();


    if (
        !state.releaseMessagesShown.includes(
            number
        )
    ) {

        state.releaseMessagesShown.push(
            number
        );

    }


    return saveGameState(
        state
    );

}


/* =========================================================
   SYSTEMMELDUNGEN
========================================================= */

function addSystemMessageToState(
    state,
    message
) {

    if (
        !state ||
        !message
    ) {

        return null;

    }


    const systemMessage = {

        id:
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        type:
            message.type ||
            "info",

        title:
            message.title ||
            "SYSTEMMITTEILUNG",

        text:
            message.text ||
            "",

        timestamp:
            new Date().toISOString(),

        read:
            false

    };


    if (
        !Array.isArray(
            state.systemMessages
        )
    ) {

        state.systemMessages = [];

    }


    state.systemMessages.push(
        systemMessage
    );


    if (
        state.systemMessages.length > 50
    ) {

        state.systemMessages =
            state.systemMessages.slice(-50);

    }


    return systemMessage;

}


function addSystemMessage(
    title,
    text,
    type = "info"
) {

    const state =
        getGameState();


    addSystemMessageToState(

        state,

        {

            title,

            text,

            type

        }

    );


    return saveGameState(
        state
    );

}


function getSystemMessages() {

    return [

        ...getGameState()
            .systemMessages

    ].reverse();

}


function getUnreadSystemMessages() {

    return getSystemMessages()
        .filter(function (message) {

            return (

                message &&

                message.read === false

            );

        });

}


function markSystemMessageRead(
    messageId
) {

    const state =
        getGameState();


    const message =
        state.systemMessages.find(
            function (item) {

                return (
                    item.id ===
                    messageId
                );

            }
        );


    if (!message) {

        return false;

    }


    message.read =
        true;


    return saveGameState(
        state
    );

}


function markAllSystemMessagesRead() {

    const state =
        getGameState();


    state.systemMessages.forEach(
        function (message) {

            message.read =
                true;

        }
    );


    return saveGameState(
        state
    );

}


/* =========================================================
   AKTENMELDUNGEN
========================================================= */

function createCaseReleaseMessage(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return null;

    }


    return {

        type:
            "release",

        title:
            "NEUE ERMITTLUNGSAKTE FREIGEGEBEN",

        text:
            "AKTE " +
            String(number).padStart(2, "0") +
            " wurde für die weitere Bearbeitung freigegeben."

    };

}


function createCaseCompletionMessage(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return null;

    }


    if (
        number === JAC_TOTAL_CASES
    ) {

        return {

            type:
                "success",

            title:
                "ERMITTLUNGSFALL ABGESCHLOSSEN",

            text:
                "Alle fünf Ermittlungsakten wurden erfolgreich bearbeitet."

        };

    }


    const next =
        number + 1;


    return {

        type:
            "success",

        title:
            "AKTE " +
            String(number).padStart(2, "0") +
            " ABGESCHLOSSEN",

        text:
            "Die Ermittlungsphase wurde erfolgreich abgeschlossen. " +
            "AKTE " +
            String(next).padStart(2, "0") +
            " wurde freigegeben."

    };

}


function createNextCaseReleaseMessage() {

    const nextCase =
        getNextCase();


    if (
        nextCase === null
    ) {

        return null;

    }


    const state =
        getGameState();


    if (
        state.completedCases.length === 0
    ) {

        return null;

    }


    return createCaseReleaseMessage(
        nextCase
    );

}


/* =========================================================
   BEWEISE
========================================================= */

function addEvidence(
    evidenceId
) {

    if (
        evidenceId === undefined ||
        evidenceId === null
    ) {

        return false;

    }


    const state =
        getGameState();


    if (
        !state.foundEvidence.includes(
            evidenceId
        )
    ) {

        state.foundEvidence.push(
            evidenceId
        );

    }


    return saveGameState(
        state
    );

}


/* =========================================================
   HINWEISE
========================================================= */

function addClue(
    clueId
) {

    if (
        clueId === undefined ||
        clueId === null
    ) {

        return false;

    }


    const state =
        getGameState();


    if (
        !state.foundClues.includes(
            clueId
        )
    ) {

        state.foundClues.push(
            clueId
        );

    }


    return saveGameState(
        state
    );

}


/* =========================================================
   FEHLER
========================================================= */

function addFoundError(
    errorId
) {

    if (
        errorId === undefined ||
        errorId === null
    ) {

        return false;

    }


    const state =
        getGameState();


    if (
        !state.foundErrors.includes(
            errorId
        )
    ) {

        state.foundErrors.push(
            errorId
        );

    }


    return saveGameState(
        state
    );

}


/* =========================================================
   AKTENERGEBNISSE
========================================================= */

function saveCaseResult(
    caseNumber,
    result
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return false;

    }


    const state =
        getGameState();


    state.caseResults[number] =
        result;


    return saveGameState(
        state
    );

}


function getCaseResult(
    caseNumber
) {

    const number =
        normalizeCaseNumber(
            caseNumber
        );


    if (
        number === null
    ) {

        return null;

    }


    const state =
        getGameState();


    return (

        state.caseResults[number] ??

        null

    );

}


/* =========================================================
   FORTSCHRITT
========================================================= */

function getCompletedCaseCount() {

    return getGameState()
        .completedCases
        .length;

}


function getProgressPercent() {

    return Math.round(

        (

            getCompletedCaseCount() /

            JAC_TOTAL_CASES

        ) * 100

    );

}


function getProgressData() {

    const state =
        getGameState();


    const completed =
        state.completedCases.length;


    return {

        completed:
            completed,

        total:
            JAC_TOTAL_CASES,

        percent:
            Math.round(

                (

                    completed /

                    JAC_TOTAL_CASES

                ) * 100

            ),

        completedCases:
            [
                ...state.completedCases
            ],

        nextCase:
            getNextCase(),

        finished:
            completed ===
            JAC_TOTAL_CASES,

        assessmentCompleted:
            state.assessmentCompleted,

        finalCompleted:
            state.finalCompleted

    };

}


function isGameCompleted() {

    return (

        getCompletedCaseCount() ===

        JAC_TOTAL_CASES

    );

}


function isAssessmentCompleted() {

    return Boolean(

        getGameState()
            .assessmentCompleted

    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function getDashboardData() {

    const state =
        getGameState();


    const progress =
        getProgressData();


    return {

        agent: {

            status:
                state.agentStatus,

            securityLevel:
                state.securityLevel,

            verified:
                state.verified,

            fingerprintVerified:
                state.fingerprintVerified,

            hologramUnlocked:
                state.hologramUnlocked

        },


        systemStatus: {

            portal:
                state.portalStatus,

            portalOnline:
                state.portalStatus ===
                "ONLINE",

            identity:
                state.verified
                    ? "BESTÄTIGT"
                    : "AUSSTEHEND",

            fingerprint:
                state.fingerprintVerified
                    ? "BESTÄTIGT"
                    : "AUSSTEHEND",

            hologram:
                state.hologramUnlocked
                    ? "BESTÄTIGT"
                    : "AUSSTEHEND",

            security:
                "STUFE " +
                String(
                    state.securityLevel
                )

        },


        cases: {

            completed:
                progress.completed,

            total:
                progress.total,

            percent:
                progress.percent,

            completedCases:
                progress.completedCases,

            nextCase:
                progress.nextCase,

            statuses:
                getAllCaseStatuses()

        },


        final: {

            assessmentCompleted:
                state.assessmentCompleted,

            finalCompleted:
                state.finalCompleted

        }

    };

}


/* =========================================================
   GESAMTEN SAVE AUSLESEN
========================================================= */

function getFullSaveData() {

    return getGameState();

}


/* =========================================================
   SPIELFORTSCHRITT VORHANDEN?
========================================================= */

function hasGameProgress() {

    const state =
        getGameState();


    return (

        state.completedCases.length > 0 ||

        state.foundEvidence.length > 0 ||

        state.foundClues.length > 0 ||

        state.foundErrors.length > 0 ||

        Object.keys(
            state.caseResults
        ).length > 0 ||

        state.systemMessages.length > 0 ||

        state.verified === true ||

        state.fingerprintVerified === true ||

        state.hologramUnlocked === true ||

        state.finalCompleted === true

    );

}


/* =========================================================
   RESET
========================================================= */

function resetGame() {

    try {

        localStorage.removeItem(
            JAC_SAVE_KEY
        );


        sessionStorage.removeItem(
            "JAC_PENDING_CASE"
        );


        sessionStorage.removeItem(
            "JAC_CASE_MESSAGE"
        );


        sessionStorage.removeItem(
            "JAC_COMPLETION_PENDING"
        );


        const freshState =
            createDefaultGameState();


        return saveGameState(
            freshState
        );


    } catch (error) {

        console.error(
            "JAC: Reset fehlgeschlagen.",
            error
        );


        return false;

    }

}


/* =========================================================
   GLOBALE API
========================================================= */

window.JACGameState = {

    /* -------------------------------------------------
       BASIS
    ------------------------------------------------- */

    getGameState,

    saveGameState,

    createDefaultGameState,

    initializeGameState,

    getFullSaveData,

    hasGameProgress,


    /* -------------------------------------------------
       AKTEN
    ------------------------------------------------- */

    completeCase,

    isCaseCompleted,

    isCaseUnlocked,

    getCaseStatus,

    getAllCaseStatuses,

    getNextCase,

    getCompletedCaseCount,


    /* -------------------------------------------------
       FORTSCHRITT
    ------------------------------------------------- */

    getProgressPercent,

    getProgressData,

    isGameCompleted,

    isAssessmentCompleted,


    /* -------------------------------------------------
       FREIGABEN
    ------------------------------------------------- */

    createNextCaseReleaseMessage,

    createCaseReleaseMessage,

    createCaseCompletionMessage,

    hasPendingCaseRelease,

    getPendingCaseRelease,

    markCaseReleaseShown,


    /* -------------------------------------------------
       BEWEISE
    ------------------------------------------------- */

    addEvidence,

    addClue,

    addFoundError,


    /* -------------------------------------------------
       ERGEBNISSE
    ------------------------------------------------- */

    saveCaseResult,

    getCaseResult,


    /* -------------------------------------------------
       SYSTEM
    ------------------------------------------------- */

    addSystemMessage,

    getSystemMessages,

    getUnreadSystemMessages,

    markSystemMessageRead,

    markAllSystemMessagesRead,


    /* -------------------------------------------------
       PORTAL
    ------------------------------------------------- */

    setPortalStatus,

    getPortalStatus,

    setVerified,

    setFingerprintVerified,

    setHologramUnlocked,

    setFinalCompleted,


    /* -------------------------------------------------
       PRÜFUNG 02
    ------------------------------------------------- */

    completeSecondaryVerification,

    canAccessDashboard,


    /* -------------------------------------------------
       DASHBOARD
    ------------------------------------------------- */

    getDashboardData,


    /* -------------------------------------------------
       RESET
    ------------------------------------------------- */

    resetGame,


    /* -------------------------------------------------
       KONSTANTEN
    ------------------------------------------------- */

    totalCases:
        JAC_TOTAL_CASES

};


/* =========================================================
   START
========================================================= */

initializeGameState();


console.log(
    "JAC: gameState.js geladen."
);