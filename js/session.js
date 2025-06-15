document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');
    const friendsLink = document.getElementById('friends-link');
    const loginLink = document.getElementById('login-link');
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    let userName = null;
    try {
        const resp = await fetch('backend/session_status.php', { credentials: 'include' });
        if (resp.ok) {
            const data = await resp.json();
            if (data.loggedIn) {
                userName = data.userName;
                localStorage.setItem('userName', userName);
            } else {
                localStorage.removeItem('userName');
            }
        } else {
            userName = localStorage.getItem('userName');
        }
    } catch (err) {
        console.error('Failed to check session status', err);
        userName = localStorage.getItem('userName');
    }

    renderHeader(userName);
    document.dispatchEvent(new CustomEvent('session-verified', { detail: { loggedIn: !!userName, userName } }));

    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'logout-btn') {
            if (confirm("Er du sikker på at du vil logge ut?")) {
                localStorage.removeItem('userName');
                window.location.href = 'index.html';
            }
        }
    });

    if (hamburger && navbar) {
        hamburger.addEventListener('click', function () {
            navbar.classList.toggle('show');
        });
    }

    function renderHeader(name) {
        if (name) {
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${name}</strong></a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
            }
            if (friendsLink) friendsLink.style.display = 'list-item';
            if (loginLink) loginLink.style.display = 'none';
        } else {
            if (friendsLink) friendsLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'list-item';
        }
    }
});
