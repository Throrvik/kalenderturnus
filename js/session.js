document.addEventListener('DOMContentLoaded', async function () {
    // Verify the current session with the backend
    try {
        const res = await fetch('backend/session_status.php', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.loggedIn) {
                // Store the verified user name from the session
                if (data.userName) {
                    localStorage.setItem('userName', data.userName);
                }
            } else {
                // Remove any stale value if the session is not valid
                localStorage.removeItem('userName');
            }
        }
    } catch (e) {
        // If the request fails we keep the existing localStorage value
        console.error('Session status check failed:', e);
    }

    const userName = localStorage.getItem('userName');
    const userInfoDiv = document.getElementById('user-info');
    const friendsLink = document.getElementById('friends-link');
    const loginLink = document.getElementById('login-link');

    // Håndter innloggingsstatus
    if (userName) {
        // Oppdater header for å vise velkomstmelding og logg ut-knapp
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${userName}</strong></a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
        }

        // Vis venne-lenken hvis brukeren er logget inn
        if (friendsLink) friendsLink.style.display = 'list-item';

        // Skjul "Logg inn"-lenken når brukeren er logget inn
        if (loginLink) {
            loginLink.style.display = 'none';
        }

    } else {
        // Skjul venne-lenken hvis brukeren ikke er logget inn
        if (friendsLink) friendsLink.style.display = 'none';

        // Sørg for at "Logg inn"-lenken vises
        if (loginLink) loginLink.style.display = 'list-item';
    }

    // Global event listener for utlogging
    document.addEventListener('click', async function (event) {
        if (event.target && event.target.id === 'logout-btn') {
            if (confirm("Er du sikker på at du vil logge ut?")) {
                try {
                    await fetch('backend/logout.php', { credentials: 'include' });
                } catch (e) {
                    console.error('Logout request failed:', e);
                }
                localStorage.removeItem('userName'); // Fjern brukernavn fra localStorage
                window.location.href = 'index.html'; // Gå tilbake til hovedsiden
            }
        }
    });

    // Håndter navigasjon for hamburgermenyen
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', function () {
            navbar.classList.toggle('show'); // Vis/skjul navigasjonen ved å toggle 'show'-klassen
        });
    }
});
