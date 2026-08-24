document.addEventListener("DOMContentLoaded", () => {

    console.log("JAC Portal gestartet.");

    // Nur auf der Startseite automatisch weiterleiten
    if (document.getElementById("splash-screen")) {

        setTimeout(() => {

            window.location.href = "login.html";

        }, 3000);

    }

});