const allColors = [
    "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
    "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
    "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
    "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
    "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
    "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
];

const colorNames = {
    "#FF6666": "Lys rød",
    "#FFB266": "Lys oransje",
    "#FFFF66": "Lys gul",
    "#B2FF66": "Lime",
    "#66FFB2": "Mint",
    "#66B2FF": "Himmelblå",
    "#CC66FF": "Fiolett",
    "#FF66B2": "Knallrosa",
    "#66FF66": "Klar grønn",
    "#CCCCCC": "Grå",
    "#FF8C00": "Mørk oransje",
    "#FFD700": "Gull",
    "#7CFC00": "Plengrønn",
    "#40E0D0": "Turkis",
    "#1E90FF": "Dodgerblå",
    "#BA55D3": "Orkide",
    "#FF1493": "Dyp rosa",
    "#32CD32": "Limegrønn",
    "#D3D3D3": "Lys grå",
    "#8B0000": "Mørk rød",
    "#A52A2A": "Brun",
    "#2E8B57": "Sjøgrønn",
    "#4682B4": "Stålblå",
    "#FF4500": "Oransjerød",
    "#DA70D6": "Orkide lilla",
    "#B0C4DE": "Lys stålblå",
    "#8A2BE2": "Blålilla",
    "#20B2AA": "Lys sjøgrønn",
    "#FF6347": "Tomatrød",
    "#9ACD32": "Gulgrønn"
};

function showMessage(text, type = 'info', timeout = 4000) {
    const container = document.getElementById('message');
    if (!container) {
        alert(text);
        return;
    }

    container.textContent = text;
    container.className = type; // assign the type as class for styling
    container.style.display = 'block';

    if (timeout > 0) {
        setTimeout(() => {
            container.style.display = 'none';
        }, timeout);
    }
}

function createCard(user, options = {}) {
    const card = document.createElement('div');
    card.className = 'user-card fade';
    if (options.compact) card.classList.add('compact');
    if (options.mini) card.classList.add('mini');

    const avatar = document.createElement('div');
    avatar.className = 'avatar-img';
    if (user.avatar_url) {
        avatar.style.backgroundImage = `url('${user.avatar_url}')`;
        avatar.textContent = '';
    } else {
        avatar.textContent = '👤';
    }
    card.appendChild(avatar);

    const content = document.createElement('div');
    content.className = 'card-content';
    card.content = content;

    const info = document.createElement('div');
    info.className = 'user-info';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    const nameP = document.createElement('p');
    nameP.className = 'name';
    const strongName = document.createElement('strong');
    strongName.textContent = name.trim();
    nameP.appendChild(strongName);
    info.appendChild(nameP);
    if (!options.mini) {
        if (options.compact) {
            if (user.company) {
                const p = document.createElement('p');
                const s = document.createElement('strong');
                s.textContent = 'Firma:';
                p.appendChild(s);
                p.append(' ' + user.company);
                info.appendChild(p);
            }
            if (user.location) {
                const p = document.createElement('p');
                const s = document.createElement('strong');
                s.textContent = 'Lokasjon:';
                p.appendChild(s);
                p.append(' ' + user.location);
                info.appendChild(p);
            }
            if (user.shift) {
                const p = document.createElement('p');
                const s = document.createElement('strong');
                s.textContent = 'Turnus:';
                p.appendChild(s);
                p.append(' ' + user.shift);
                info.appendChild(p);
            }
        } else {
            if (user.company) {
                const p = document.createElement('p');
                p.textContent = user.company;
                info.appendChild(p);
            }
            if (user.location) {
                const p = document.createElement('p');
                p.textContent = user.location;
                info.appendChild(p);
            }
            if (user.shift) {
                const p = document.createElement('p');
                p.textContent = user.shift;
                info.appendChild(p);
            }
            // shift_date intentionally ignored
        }
    }
    content.appendChild(info);
    card.appendChild(content);

    if (options.modal) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showColleagueInfo(user.id));
    }

    if (options.search) {
        if (user.relation === 'colleague') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Kollega';
            content.appendChild(span);
        } else if (user.relation === 'pending') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Ventende forespørsel';
            content.appendChild(span);
        } else {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = 'Send forespørsel';
            btn.onclick = (e) => {
                e.stopPropagation();
                sendRequest(user.id, btn);
            };
            content.appendChild(btn);
        }
    }

    if (options.remove) {
        const settings = document.createElement('div');
        settings.className = 'settings-row';

        const sel = document.createElement('select');
        const autoOpt = document.createElement('option');
        autoOpt.value = '';
        autoOpt.textContent = 'Auto';
        sel.appendChild(autoOpt);
        allColors.forEach(c => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = colorNames[c] || c;
            o.style.backgroundColor = c;
            sel.appendChild(o);
        });
        sel.value = colorPrefs[user.id] || '';
        sel.addEventListener('click', e => e.stopPropagation());
        sel.onchange = e => {
            const val = e.target.value;
            if (val) colorPrefs[user.id] = val; else delete colorPrefs[user.id];
            localStorage.setItem('colleagueColorPref', JSON.stringify(colorPrefs));
            updateColorOptions();
        };
        settings.appendChild(sel);

        const lbl = document.createElement('label');
        lbl.className = 'close-label';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = closePrefs[user.id] || false;
        cb.addEventListener('click', e => e.stopPropagation());
        lbl.addEventListener('click', e => e.stopPropagation());
        cb.onchange = e => {
            const checked = e.target.checked;
            fetch('api/close_colleagues.php', {
                credentials: 'include',
                method: checked ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id })
            }).then(() => {
                if (checked) closePrefs[user.id] = true; else delete closePrefs[user.id];
                localStorage.setItem('closeColleagues', JSON.stringify(closePrefs));
            });
        };
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' Nær kollega'));
        settings.appendChild(lbl);
        content.appendChild(settings);

        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Fjern';
        btn.onclick = (e) => {
            e.stopPropagation();
            removeColleague(user.id);
        };
        content.appendChild(btn);
    }
    return card;
}

function createProfileCard(user) {
    const card = document.createElement('div');
    card.className = 'profile-card fade';

    const nameEl = document.createElement('h2');
    nameEl.className = 'profile-name';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    nameEl.textContent = name.trim();
    card.appendChild(nameEl);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'profile-content';

    if (user.avatar_url) {
        const img = document.createElement('img');
        img.className = 'profile-image';
        img.src = user.avatar_url;
        img.alt = 'Profilbilde';
        contentDiv.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';
    if (!user.info_hide) {
        if (user.company) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Firma:';
            p.appendChild(s);
            p.append(' ' + user.company);
            infoDiv.appendChild(p);
        }
        if (user.location) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Lokasjon:';
            p.appendChild(s);
            p.append(' ' + user.location);
            infoDiv.appendChild(p);
        }
        if (user.shift) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Turnus:';
            p.appendChild(s);
            p.append(' ' + user.shift);
            infoDiv.appendChild(p);
        }
    }

    contentDiv.appendChild(infoDiv);
    card.appendChild(contentDiv);
    return card;
}
// Handle localStorage versioning for shift and color data
const APP_VERSION = '1.0'; // Increase when releasing a new version
const savedVersion = localStorage.getItem('appVersion');
if (savedVersion !== APP_VERSION) {
  localStorage.removeItem('shifts');
  localStorage.removeItem('availableColors');
  localStorage.setItem('appVersion', APP_VERSION);
  if (savedVersion !== null) {
    location.reload();
  }
}

// JavaScript for kalenderen
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const monthYearElement = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const calendarGrid = document.querySelector('.calendar-grid');
const container = document.querySelector('.container');
const yearContainer = document.getElementById('year-container');
const todayButton = document.getElementById('today-button');
const toggleYearButton = document.getElementById('toggle-year');
let isYearView = false;

// Debugging flag to enable verbose logging when needed
window.DEBUG = window.DEBUG || false;
var DEBUG = window.DEBUG;
if (DEBUG) console.log("🚀 kalender.js er lastet!");

const msPerDay = 24 * 60 * 60 * 1000; // milliseconds in a day

// Turnuser
let shifts = [];
let userShift = null;
let colleagues = [];
let selectedColleagues = [];
let colleagueColorPref = {};
let closeColleagues = {};
let currentUserFirstName = '';
let initialColleagueMode = null;
let shiftDeviations = [];

function getNextAvailableColor() {
  const usedColors = shifts.map(s => s.color);
  if (userShift) usedColors.push(userShift.color);
  selectedColleagues.forEach(c => c.color && usedColors.push(c.color));
  return allColors.find(c => !usedColors.includes(c));
}

function loadColleagueColorPrefs() {
  const s = localStorage.getItem('colleagueColorPref');
  colleagueColorPref = s ? JSON.parse(s) : {};
}

function loadCloseColleagues() {
  if (!localStorage.getItem('userName')) {
    const s = localStorage.getItem('closeColleagues');
    closeColleagues = s ? JSON.parse(s) : {};
    return;
  }
  fetch('api/close_colleagues.php', { credentials: 'include' })
    .then(r => {
      if (!r.ok) throw new Error('unauthorized');
      return r.json();
    })
    .then(ids => {
      closeColleagues = {};
      ids.forEach(id => (closeColleagues[id] = true));
      localStorage.setItem('closeColleagues', JSON.stringify(closeColleagues));
    })
    .catch(() => {
      const s = localStorage.getItem('closeColleagues');
      closeColleagues = s ? JSON.parse(s) : {};
    });
}

function saveCloseColleagues() {
  // server persistence
  localStorage.setItem('closeColleagues', JSON.stringify(closeColleagues));
}

function saveColleagueColorPrefs() {
  localStorage.setItem('colleagueColorPref', JSON.stringify(colleagueColorPref));
}

function loadShiftDeviations() {
  if (!localStorage.getItem('userName')) {
    const s = localStorage.getItem('shiftDeviations');
    if (s) {
      shiftDeviations = JSON.parse(s);
      shiftDeviations.forEach(d => (d.startDate = new Date(d.startDate + 'T00:00')));
    }
    return;
  }
  fetch('api/shift_deviations.php', { credentials: 'include' })
    .then(r => {
      if (!r.ok) throw new Error('unauthorized');
      return r.json();
    })
    .then(list => {
      shiftDeviations = list.map(d => ({
        id: d.id,
        startDate: new Date(d.start_date + 'T00:00'),
        workWeeks: parseInt(d.work_weeks, 10),
        offWeeks: parseInt(d.off_weeks, 10),
        durationDays: parseInt(d.duration_days, 10),
        keepRhythm: d.keep_rhythm == 1
      }));
      localStorage.setItem('shiftDeviations', JSON.stringify(shiftDeviations));
      renderDeviationList();
      updateView();
    })
    .catch(() => {
      const s = localStorage.getItem('shiftDeviations');
      if (s) {
        shiftDeviations = JSON.parse(s);
        shiftDeviations.forEach(d => d.startDate = new Date(d.startDate + 'T00:00'));
      }
    });
}

function saveShiftDeviations() {
  // persisted via API; localStorage acts as cache
  const cache = shiftDeviations.map(d => {
    const local = new Date(d.startDate.getTime() - d.startDate.getTimezoneOffset() * 60000)
                      .toISOString().split('T')[0];
    return Object.assign({}, d, { startDate: local });
  });
  localStorage.setItem('shiftDeviations', JSON.stringify(cache));
}
const predefinedShifts = [
    'mandag-fredag', '1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '2-4', '2-6', '3-1', '3-2', '3-3', '3-4', '4-4', '4-5', '4-8', '5-5']; 

const redDays = [
    { name: '1.Nyttårsdag', date: '01-01' },
    { name: 'Skjærtorsdag', calculate: (year) => calculateEaster(year, -3) },
    { name: 'Langfredag', calculate: (year) => calculateEaster(year, -2) },
    { name: '1. Påskedag', calculate: (year) => calculateEaster(year, 0) },
    { name: '2. Påskedag', calculate: (year) => calculateEaster(year, 1) },
    { name: 'Arbeidernes dag', date: '05-01' },
    { name: '17. mai', date: '05-17' },
    { name: 'Kristi himmelfartsdag', calculate: (year) => calculateEaster(year, 39) },
    { name: '1. Pinsedag', calculate: (year) => calculateEaster(year, 49) },
    { name: '2. Pinsedag', calculate: (year) => calculateEaster(year, 50) },
    { name: '1. Juledag', date: '12-25' },
    { name: '2. Juledag', date: '12-26' },
];

const specialDays = [
    { name: 'Julaften', date: '12-24' }, // Julaften
    { name: 'Nyttårsaften', date: '12-31' }, // Nyttårsaften
    { name: 'Påskeaften', calculate: (year) => calculateEaster(year, -1) }, // Påskeaften
    { name: 'Palmesøndag', calculate: (year) => calculateEaster(year, -7) }, // Palmesøndag
    { name: 'Bursdag Thomas', date: '06-28' } // Bursdag Thomas
];

function parseShiftString(str) {
    if (!str) return { work: null, off: null, isWeekdays: false };
    if (str === 'mandag-fredag') {
        return { work: 5 / 7, off: 2 / 7, isWeekdays: true };
    }
    if (str.startsWith('D')) {
        const parts = str.substring(1).split('-').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
            return { work: parts[0] / 7, off: parts[1] / 7, isWeekdays: false };

        }
    }
    const parts = str.split('-').map(Number);
    if (parts.length === 2 && !parts.some(isNaN)) {
        return { work: parts[0], off: parts[1], isWeekdays: false };
    }
    return { work: null, off: null, isWeekdays: false };
}


// Funksjon for å beregne påsken
function calculateEaster(year, offset = 0) {
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day + offset).toISOString().slice(0, 10);
}

// Funksjon for å hente informasjon om røde dager
function getRedDayInfo(date) {
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const redDay = redDays.find((day) => {
        if (day.date) {
            return formattedDate === day.date; // Faste helligdager
        } else if (day.calculate) {
            return date.toISOString().slice(0, 10) === day.calculate(date.getFullYear());
        }
        return false;
    });
    return redDay ? { name: redDay.name } : null; // Returner navn eller null
}

function getSpecialDayInfo(date) {
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const specialDay = specialDays.find((day) => {
        if (day.date) {
            return formattedDate === day.date; // Faste spesielle dager
        } else if (day.calculate) {
            return date.toISOString().slice(0, 10) === day.calculate(date.getFullYear());
        }
        return false;
    });
    return specialDay ? { name: specialDay.name } : null;
}



const months = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = [
    'Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'
];

document.addEventListener('DOMContentLoaded', function () {
    // Only initialize the calendar when the required elements are present
    if (!calendarGrid) {
        return;
    }

    renderWeekdayRow();
    initializeEventListeners();
    loadShiftsFromLocalStorage();
    loadSelectedColleagues();
    loadColleagueColorPrefs();
    loadCloseColleagues();
    loadShiftDeviations();
    renderDeviationList();
    loadColleaguesList();
    loadUserShift();
    renderCalendar(currentMonth, currentYear);
    renderShiftList();
});

function initializeEventListeners() {
    prevMonthButton.addEventListener('click', () => {
        if (isYearView) {
            currentYear--;
            renderYearCalendar(currentYear);
        } else {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            renderCalendar(currentMonth, currentYear);
        }
    });

    nextMonthButton.addEventListener('click', () => {
        if (isYearView) {
            currentYear++;
            renderYearCalendar(currentYear);
        } else {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            renderCalendar(currentMonth, currentYear);
        }
    });

    if (todayButton) {
        todayButton.addEventListener('click', () => {
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            isYearView = false;
            updateView();
        });
    }

    if (toggleYearButton) {
        toggleYearButton.addEventListener('click', () => {
            isYearView = !isYearView;
            updateView();
        });
    }

    // Event Listener for adding new shift
    const addShiftButton = document.getElementById('add-shift');
    addShiftButton.addEventListener('click', addNewShift);

    // Event Listener for reset button
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetShifts);

    const btnAll = document.getElementById('colleagues-all');
    const btnNone = document.getElementById('colleagues-none');
    const btnClose = document.getElementById('colleagues-close');
    if (btnAll) btnAll.addEventListener('click', () => setColleagueMode('all'));
    if (btnNone) btnNone.addEventListener('click', () => setColleagueMode('none'));
    if (btnClose) btnClose.addEventListener('click', () => setColleagueMode('close'));

    const toggleDev = document.getElementById('toggle-deviation');
    const saveDev = document.getElementById('save-deviation');
    if (toggleDev) {
        toggleDev.addEventListener('click', () => {
            const form = document.getElementById('deviation-form');
            const show = form.style.display === 'none' || form.style.display === '';
            form.style.display = show ? 'block' : 'none';
            toggleDev.textContent = show ? 'Lukk skjema for avvik fra turnus' : 'Legg til avvik fra turnus';
        });
    }
    if (saveDev) saveDev.addEventListener('click', addDeviation);
}


let resetPending = false;
let resetTimeout;

function resetShifts() {
    if (!resetPending) {
        showMessage("Trykk på 'T\u00f8m skjema' igjen innen 10 sekunder for \u00e5 t\u00f8mme alle turnusene.");
        resetPending = true;
        resetTimeout = setTimeout(() => {
            resetPending = false;
        }, 10000);
        return;
    }

    resetPending = false;
    clearTimeout(resetTimeout);

    shifts = shifts.filter(s => s.isUserShift || s.isColleagueShift);
    saveShiftsToLocalStorage();
    updateView(); // Oppdater kalenderen
    renderShiftList(); // Oppdaterer listen som viser turnuser

    // Tøm oversikten under kalenderen
    const oversiktContainer = document.getElementById('turnus-oversikt');
    oversiktContainer.innerHTML = ''; // Fjern alt innhold
    showMessage('Skjemaet ble t\u00f8mt.', 'success');
}


// Funksjon for å legge til ny turnus
function addNewShift() {
    if (shifts.length >= maxShifts) {
        showMessage(`Maksimum antall turnuser er nådd. Slett en turnus for å legge til en ny.`, 'error');
        return;
    }

    const name = document.getElementById('shift-name').value.trim();
    let durationInput = document.getElementById('shift-duration').value;
    let inputDate = document.getElementById('shift-start').value;
    let startDate = new Date(inputDate + "T00:00:00"); // Sørger for at det starter ved midnatt
    const color = getNextAvailableColor();


    
    if (!name || !durationInput || isNaN(startDate.getTime())) {
        showMessage('Vennligst fyll inn alle feltene riktig.', 'error');
        return;
    }

    // Håndter tilpasset turnus hvis "custom" er valgt
    if (durationInput === 'custom') {
        durationInput = prompt('Angi ønsket turnus i formatet "X-Y" for uker eller "D5-2" for dager:', '');
        if (!durationInput || !/^(\d+-\d+|D\d+-\d+)$/.test(durationInput)) {
            showMessage('Ugyldig format. Bruk formatet "2-4" eller "D5-2".', 'error');
            return;
        }
    }

    // Identifiser om det er en dagbasert turnus
    const isDayBased = durationInput.startsWith('D');
    let workPeriod, offPeriod;

    if (isDayBased) {
        [workPeriod, offPeriod] = durationInput.substring(1).split('-').map(Number);
    } else {
        [workPeriod, offPeriod] = durationInput.split('-').map(Number);
    }

    if (!workPeriod || !offPeriod || workPeriod <= 0 || offPeriod <= 0) {
        showMessage('Ugyldig turnuslengde. Bruk formatet "2-4" eller "D5-2".', 'error');
        return;
    }

    // Sjekk om turnusen allerede finnes
    const isDuplicate = shifts.some(shift =>
        shift.name === name &&
        shift.workWeeks === workPeriod &&
        shift.offWeeks === offPeriod &&
        shift.startDate.getTime() === startDate.getTime()
    );

    if (isDuplicate) {
        showMessage('Denne turnusen er allerede lagt til!', 'error');
        return;
    }

    // Opprett turnusobjektet
    const shift = {
        name,
        workWeeks: isDayBased ? workPeriod / 7 : workPeriod, // Konverter dagbasert til uker om nødvendig
        offWeeks: isDayBased ? offPeriod / 7 : offPeriod,
        startDate,
        color,
        visible: true,
        type: isDayBased ? 'dagbasert' : 'ukebasert',
        raw: isDayBased ? `D${workPeriod}-${offPeriod}` : `${workPeriod}-${offPeriod}`
    };

    shifts.push(shift);


    saveShiftsToLocalStorage();
    renderShiftList();
    updateView();
    updateTurnusOversikt();

    // Nullstill skjemaet etterpå
    document.getElementById('shift-name').value = '';
    document.getElementById('shift-start').value = '';

}

function addDeviation() {
    const startInput = document.getElementById('deviation-start').value;
    const pattern = document.getElementById('deviation-pattern').value.trim();
    const behavior = document.getElementById('deviation-behavior').value;
    if (!startInput || !/^\d+-\d+$/.test(pattern)) return;
    const [w, o] = pattern.split('-').map(Number);
    const startDate = new Date(startInput + 'T00:00:00');
    let durationDays = (w + o) * 7;
    if (w === 0) {
        durationDays += 1; // include travel day when skipping an entire work period
    }
    const payload = {
        start_date: startInput,
        work_weeks: w,
        off_weeks: o,
        duration_days: durationDays,
        keep_rhythm: behavior === 'keep'
    };
    fetch('api/shift_deviations.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
        shiftDeviations.push({
            id: res.id,
            startDate,
            workWeeks: w,
            offWeeks: o,
            durationDays,
            keepRhythm: behavior === 'keep'
        });
        saveShiftDeviations();
        document.getElementById('deviation-form').reset();
        renderDeviationList();
        updateView();
    });
}

function deleteDeviation(index) {
    const dev = shiftDeviations[index];
    if (!dev) return;
    fetch('api/shift_deviations.php', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify({ id: dev.id })
    })
    .then(() => {
        shiftDeviations.splice(index, 1);
        saveShiftDeviations();
        renderDeviationList();
        updateView();
    });
}

function renderDeviationList() {
    const list = document.getElementById('deviation-list');
    if (!list) return;
    list.innerHTML = '';
    shiftDeviations.forEach((d, idx) => {
        const item = document.createElement('div');
        item.className = 'shift-item';
        const start = new Date(d.startDate.getTime() - d.startDate.getTimezoneOffset() * 60000)
                        .toISOString().split('T')[0];
        const pattern = `${d.workWeeks}-${d.offWeeks}`;
        const span1 = document.createElement('span');
        span1.textContent = start;
        const span2 = document.createElement('span');
        span2.textContent = pattern;
        const btn = document.createElement('button');
        btn.textContent = 'Fjern';
        btn.addEventListener('click', () => deleteDeviation(idx));
        item.appendChild(span1);
        item.appendChild(span2);
        item.appendChild(btn);
        list.appendChild(item);
    });
}


// Funksjon for å slette en turnus
function deleteShift(index) {
    if (shifts[index].isColleagueShift || shifts[index].isUserShift) return;
    shifts.splice(index, 1);

    saveShiftsToLocalStorage();
    renderShiftList();
    updateView();
    updateTurnusOversikt();
}

// Laste eksisterende turnuser fra localStorage
function loadShiftsFromLocalStorage() {
    const storedShifts = localStorage.getItem('shifts');
    if (storedShifts) {
        shifts = JSON.parse(storedShifts);
        shifts.forEach(shift => {
            shift.startDate = new Date(shift.startDate);
            if (shift.raw === 'mandag-fredag' && shift.weekdays === undefined) {
                shift.weekdays = true;
            }
        });
        // Fjern eventuelle duplikater
        const seen = new Set();
        shifts = shifts.filter(shift => {
            const key = [shift.name, shift.workWeeks, shift.offWeeks,
                shift.startDate.toISOString(), shift.color].join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        saveShiftsToLocalStorage();
    }
    updateTurnusOversikt(); // Kall funksjonen her for å oppdatere visningen ved lasting

}

// Lagre turnuser til localStorage
function saveShiftsToLocalStorage() {
    const custom = shifts.filter(s => !s.isUserShift && !s.isColleagueShift);
    localStorage.setItem('shifts', JSON.stringify(custom));
}

function loadSelectedColleagues() {
    const stored = localStorage.getItem('selectedColleagues');
    if (stored) {
        selectedColleagues = JSON.parse(stored);
        selectedColleagues.forEach(sc => {
            if (sc.visible === undefined) sc.visible = true;
        });
    } else {
        initialColleagueMode = 'close';
    }
}

function saveSelectedColleagues() {
    localStorage.setItem('selectedColleagues', JSON.stringify(selectedColleagues));
}


function loadColleaguesList() {
    if (!localStorage.getItem('userName')) {
        colleagues = [];
        renderColleagueList();
        return;
    }
    fetch('api/my_colleagues.php', { credentials: 'include' })
        .then(r => {
            if (!r.ok) throw new Error('unauthorized');
            return r.json();
        })
        .then(data => {
            if (!Array.isArray(data)) return;
            colleagues = data.filter(c => !c.info_hide);
            // Fjern valgte kollegaer som ikke finnes lenger
            selectedColleagues = selectedColleagues.filter(sc =>
                colleagues.some(c => c.id === sc.id && c.shift && c.shift_date)
            );

            // Legg til eventuelle nye kollegaer som mangler i listen
            colleagues.forEach(c => {
                if (!c.shift || !c.shift_date) return;
                if (!selectedColleagues.some(sc => sc.id === c.id)) {
                    const pref = colleagueColorPref[c.id];
                    selectedColleagues.push({ id: c.id, color: pref || getNextAvailableColor(), visible: true });
                }
            });

            // Sørg for at kollegaer markert som "nære" alltid er synlige
            selectedColleagues.forEach(sc => {
                if (closeColleagues[sc.id]) sc.visible = true;
            });
            colleagues.forEach(c => {
                if (!c.shift || !c.shift_date) return;
                if (closeColleagues[c.id] && !selectedColleagues.some(sc => sc.id === c.id)) {
                    const pref = colleagueColorPref[c.id];
                    selectedColleagues.push({ id: c.id, color: pref || getNextAvailableColor(), visible: true });
                }
            });

            if (initialColleagueMode) {
                setColleagueMode(initialColleagueMode);
                initialColleagueMode = null;
            } else {
                saveSelectedColleagues();
                renderColleagueList();
                applySelectedColleagueShifts();
            }
        });
}

function renderColleagueList(filter = '') {
    const list = document.getElementById('colleague-list');
    if (!list) return;
    const toggleDiv = document.getElementById('user-shift-toggle');
    list.innerHTML = '';
    if (toggleDiv) {
        list.appendChild(toggleDiv);
    }
    const term = filter.toLowerCase();
    colleagues
        .filter(c => (`${c.firstname} ${c.lastname}`.trim()).toLowerCase().includes(term))
        .sort((a, b) => `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`))
        .forEach(c => {
            const item = document.createElement('div');
            item.className = 'colleague-item';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = selectedColleagues.some(sc => sc.id === c.id && sc.visible);
            cb.addEventListener('change', () => toggleColleagueSelection(c.id, cb.checked));
            const label = document.createElement('label');
            label.textContent = `${c.firstname} ${c.lastname}`.trim();
            label.className = 'colleague-name';
            label.addEventListener('click', () => showColleagueCard(c.id));
            item.appendChild(cb);
            item.appendChild(label);
            list.appendChild(item);
        });
    const search = document.getElementById('colleague-search');
    if (search && !search.oninput) {
        search.addEventListener('input', e => renderColleagueList(e.target.value));
    }
}

function showColleagueCard(id) {
    fetch(`api/user_info.php?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success') return;
            const modal = document.getElementById('colleague-modal');
            const content = document.getElementById('colleague-content');
            const card = createProfileCard(data.user);
            content.innerHTML = '';
            content.appendChild(card);
            modal.style.display = 'block';
            const closeBtn = document.getElementById('colleague-close');
            if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
            window.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
        });
}

function toggleColleagueSelection(id, checked) {
    let obj = selectedColleagues.find(c => c.id === id);
    if (checked) {
        if (obj) {
            obj.visible = true;
        } else {
            const pref = colleagueColorPref[id];
            selectedColleagues.push({ id, color: pref || getNextAvailableColor(), visible: true });
        }
    } else {
        if (obj) {
            obj.visible = false;
        } else {
            selectedColleagues.push({ id, color: getNextAvailableColor(), visible: false });
        }
    }
    saveSelectedColleagues();
    applySelectedColleagueShifts();
}

function applySelectedColleagueShifts() {
    shifts = shifts.filter(s => !s.isColleagueShift);
    selectedColleagues.forEach(sel => {
        if (!sel.visible) return;
        const c = colleagues.find(col => col.id === sel.id);
        if (!c || !c.shift || !c.shift_date) return;
        const { work, off, isWeekdays } = parseShiftString(c.shift);

        if (work === null || off === null) return;
        const startDate = new Date(c.shift_date + 'T00:00:00');
        const prefColor = colleagueColorPref[sel.id];
        const shift = {
            name: `${c.firstname} ${c.lastname}`.trim(),
            workWeeks: work,
            offWeeks: off,
            startDate,
            color: prefColor || sel.color || getNextAvailableColor(),
            visible: true,
            isColleagueShift: true,
            colleagueId: c.id,
            raw: c.shift,
            weekdays: isWeekdays
        };
        sel.color = shift.color;
        shifts.push(shift);
    });
    saveSelectedColleagues();
    saveShiftsToLocalStorage();
    renderShiftList();
    updateTurnusOversikt();
    updateView();
}

function setColleagueMode(mode) {
    if (mode === 'all') {
        colleagues.forEach(c => {
            if (!c.shift || !c.shift_date) return;
            let obj = selectedColleagues.find(sc => sc.id === c.id);
            if (obj) {
                obj.visible = true;
            } else {
                const pref = colleagueColorPref[c.id];
                selectedColleagues.push({ id: c.id, color: pref || getNextAvailableColor(), visible: true });
            }
        });
    } else if (mode === 'none') {
        selectedColleagues.forEach(sc => sc.visible = false);
    } else if (mode === 'close') {
        colleagues.forEach(c => {
            if (!c.shift || !c.shift_date) return;
            const visible = !!closeColleagues[c.id];
            let obj = selectedColleagues.find(sc => sc.id === c.id);
            if (obj) {
                obj.visible = visible;
            } else {
                const pref = colleagueColorPref[c.id];
                selectedColleagues.push({ id: c.id, color: pref || getNextAvailableColor(), visible });
            }
        });
    }
    saveSelectedColleagues();
    applySelectedColleagueShifts();
    renderColleagueList();
}

function loadUserShift() {
    fetch('backend/get_user_data.php', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data || data.status !== 'success') return;
            if (!data.user.shift || !data.user.shift_date) return;

            const label = document.getElementById('user-shift-label');
            const checkbox = document.getElementById('show-user-shift');
            const toggleDiv = document.getElementById('user-shift-toggle');
            const { work, off, isWeekdays } = parseShiftString(data.user.shift);
            if (work === null || off === null) return;
            const startDate = new Date(data.user.shift_date + 'T00:00:00');
            const pref = localStorage.getItem('userColor');
            currentUserFirstName = data.user.firstname || '';
            userShift = {
                name: `${data.user.firstname} ${data.user.lastname}`.trim(),
                workWeeks: work,
                offWeeks: off,
                startDate,
                color: pref || getNextAvailableColor(),
                visible: localStorage.getItem('showUserShift') !== '0',
                isUserShift: true,
                raw: data.user.shift,
                weekdays: isWeekdays
            };
            // Fjern tidligere lagret brukerskift og legg til den nye
            shifts = shifts.filter(s => !s.isUserShift);
            shifts.push(userShift);
            saveShiftsToLocalStorage();
            updateTurnusOversikt();

            if (label && checkbox && toggleDiv) {
                label.textContent = `${userShift.name} (meg)`;
                checkbox.checked = userShift.visible;
                toggleDiv.style.display = 'block';
                const devBtn = document.getElementById('toggle-deviation');
                if (devBtn) devBtn.style.display = 'block';
                checkbox.addEventListener('change', () => {
                    userShift.visible = checkbox.checked;
                    localStorage.setItem('showUserShift', checkbox.checked ? '1' : '0');
                    updateView();
                });
            }

            updateView();
        })
        .catch(() => {});
}

function updateTurnusOversikt() {
    const oversiktContainer = document.getElementById('turnus-oversikt');
    oversiktContainer.innerHTML = ''; 

    shifts.forEach(shift => {
        const turnusItem = document.createElement('div');
        turnusItem.classList.add('turnus-item');

        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = shift.color;

        const nameText = document.createElement('span');
        const firstName = shift.name.split(' ')[0];
        const label = shift.raw || `${shift.workWeeks}-${shift.offWeeks}`;
        nameText.textContent = `${firstName} (${label})`;

        turnusItem.appendChild(colorBox);
        turnusItem.appendChild(nameText);

        oversiktContainer.appendChild(turnusItem);
    });
}


function updateShiftCounts() {
    document.querySelectorAll('.day').forEach(day => {
        const shiftMarks = day.querySelectorAll('.shift-mark');
        day.style.setProperty('--shift-count', shiftMarks.length);
        shiftMarks.forEach((mark, index) => {
            mark.style.left = `calc(${index} * (100% / var(--shift-count)))`;
        });
    });
}

function toggleShiftVisibility(index) {
    shifts[index].visible = !shifts[index].visible;
    saveShiftsToLocalStorage();
    updateView();
}

function renderMonthInto(targetGrid, month, year, hideText = false) {
    targetGrid.innerHTML = '';
    hideDayPopup();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    let weekNumber = getWeekNumber(new Date(year, month, 1));

    const firstWeekRow = document.createElement('div');
    firstWeekRow.classList.add('week-number');
    firstWeekRow.textContent = weekNumber;
    targetGrid.appendChild(firstWeekRow);

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        targetGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');

        const dateText = document.createElement('span');
        dateText.classList.add('day-text');
        dateText.textContent = day;
        dayElement.appendChild(dateText);

        const shiftContainer = document.createElement('div');
        shiftContainer.classList.add('shift-container');
        dayElement.appendChild(shiftContainer);

        const date = new Date(year, month, day);
        addDayClickEvent(dayElement, date);

        if (
            date.getFullYear() === currentDate.getFullYear() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getDate() === currentDate.getDate()
        ) {
            dayElement.classList.add('today');
        }

        const redDay = getRedDayInfo(date);
        if (redDay) {
            dayElement.classList.add('red-day');
            if (!hideText) {
                const holidayText = document.createElement('span');
                holidayText.classList.add('holiday-text');
                holidayText.textContent = redDay.name;
                dayElement.appendChild(holidayText);
            }
        }

        const specialDay = getSpecialDayInfo(date);
        if (specialDay && !hideText) {
            const specialText = document.createElement('span');
            specialText.classList.add('special-text');
            specialText.textContent = specialDay.name;
            dayElement.appendChild(specialText);
        }

        const list = getShiftsForDate(date);
        list.forEach(shift => {
            const shiftBox = document.createElement('div');
            shiftBox.classList.add('shift-box');
            if (shift.deviationActive) shiftBox.classList.add('shift-deviation');
            shiftBox.style.backgroundColor = shift.color;
            shiftContainer.appendChild(shiftBox);
        });

        targetGrid.appendChild(dayElement);

        if ((day + firstDay) % 7 === 0 && day !== daysInMonth) {
            weekNumber++;
            const weekRow = document.createElement('div');
            weekRow.classList.add('week-number');
            weekRow.textContent = weekNumber;
            targetGrid.appendChild(weekRow);
        }
    }

    // Fyll siste uke med tomme ruter om nødvendig
    const remainingDays = (7 - ((daysInMonth + firstDay) % 7)) % 7;
    for (let i = 0; i < remainingDays; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        targetGrid.appendChild(emptyCell);
    }
}

function renderCalendar(month, year) {
    monthYearElement.textContent = `${months[month]} ${year}`;
    renderMonthInto(calendarGrid, month, year, false);
}

// Funksjon for å beregne ukenummer
function getWeekNumber(date) {
    const firstThursday = new Date(date.getFullYear(), 0, 4); // 4. januar er alltid i uke 1
    const firstWeekStart = new Date(firstThursday.getTime() - ((firstThursday.getDay() + 6) % 7) * 86400000); // Første mandag
    const diff = date - firstWeekStart;
    return Math.ceil((diff / (7 * 24 * 60 * 60 * 1000)));
}

function renderWeekdayRow() {
    const weekdayRow = document.querySelector('.weekday-row');
    weekdayRow.innerHTML = ''; // Fjern eksisterende innhold

    // Legg til "Uke"-overskrift
    const weekHeader = document.createElement('div');
    weekHeader.classList.add('weekday');
    weekHeader.textContent = 'Uke';
    weekdayRow.appendChild(weekHeader);

    // Legg til resten av ukedagene
    ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'].forEach((day) => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weekday');
        dayElement.textContent = day;
        weekdayRow.appendChild(dayElement);
    });
}

function renderYearCalendar(year) {
    yearContainer.innerHTML = '';
    monthYearElement.textContent = year;

    for (let m = 0; m < 12; m++) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('month-wrapper');

        const header = document.createElement('h3');
        header.textContent = months[m];
        wrapper.appendChild(header);

        const weekdayRow = document.createElement('div');
        weekdayRow.classList.add('weekday-row');
        const weekHeader = document.createElement('div');
        weekHeader.classList.add('weekday');
        weekHeader.textContent = 'Uke';
        weekdayRow.appendChild(weekHeader);
        ['MAN','TIR','ONS','TOR','FRE','LØR','SØN'].forEach(d => {
            const el = document.createElement('div');
            el.classList.add('weekday');
            el.textContent = d;
            weekdayRow.appendChild(el);
        });
        wrapper.appendChild(weekdayRow);

        const grid = document.createElement('div');
        grid.classList.add('calendar-grid');
        wrapper.appendChild(grid);

        renderMonthInto(grid, m, year, true);
        yearContainer.appendChild(wrapper);
    }
}

function updateView() {
    if (!container) return;
    const weekdayRow = document.querySelector('.weekday-row');

    if (isYearView) {
        container.classList.add('year-view');
        if (calendarGrid) calendarGrid.style.display = 'none';
        if (weekdayRow) weekdayRow.style.display = 'none';
        if (yearContainer) yearContainer.style.display = 'grid';
        if (yearContainer) renderYearCalendar(currentYear);
        if (toggleYearButton) toggleYearButton.textContent = 'Vis måned';
    } else {
        container.classList.remove('year-view');
        if (yearContainer) yearContainer.style.display = 'none';
        if (weekdayRow) weekdayRow.style.display = 'grid';
        if (calendarGrid) calendarGrid.style.display = 'grid';
        if (calendarGrid) renderCalendar(currentMonth, currentYear);
        if (toggleYearButton) toggleYearButton.textContent = 'Vis år';
    }
}

function renderShiftList() {
    const shiftList = document.getElementById('shift-list');
    shiftList.innerHTML = '';

    shifts.forEach((shift, index) => {
        if (shift.isUserShift || shift.isColleagueShift) return;
        const listItem = document.createElement('div');
        listItem.className = 'shift-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!shift.visible;
        cb.addEventListener('click', () => toggleShiftVisibility(index));
        listItem.appendChild(cb);

        const nameSpan = document.createElement('span');
        nameSpan.style.color = shift.color;
        nameSpan.style.fontWeight = 'bold';
        nameSpan.textContent = shift.name;
        listItem.appendChild(nameSpan);

        const infoSpan = document.createElement('span');
        infoSpan.textContent = `(${shift.raw || `${shift.workWeeks}-${shift.offWeeks}`})`;
        listItem.appendChild(infoSpan);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Slett';
        delBtn.addEventListener('click', () => deleteShift(index));
        listItem.appendChild(delBtn);

        shiftList.appendChild(listItem);
    });
    saveShiftsToLocalStorage(); // Husk å lagre etter hver endring
}

// Legg til ny turnus
const maxShifts = 10; // Sett maksgrensen her

// ----- Dag-popup funksjonalitet -----
const dayPopup = document.getElementById('day-popup');
let outsideHandler = null;

// Initialiser kalenderen
if (container) {
    updateView();
}

function getShiftsForDate(date) {
    const result = [];
    shifts.forEach(shift => {
        if (!shift.visible) return;

        let startDate = shift.startDate;
        let workWeeks = shift.workWeeks;
        let offWeeks = shift.offWeeks;
        let type = shift.type;
        let deviationActive = false;

        if (shift.isUserShift && shiftDeviations.length) {
            const dev = shiftDeviations.find(d => date >= d.startDate && date < new Date(d.startDate.getTime() + d.durationDays * msPerDay));
            if (dev) {
                workWeeks = dev.workWeeks;
                offWeeks = dev.offWeeks;
                startDate = dev.startDate;
                type = 'ukebasert';
                deviationActive = true;
            } else {
                shiftDeviations.forEach(d => {
                    const end = new Date(d.startDate.getTime() + d.durationDays * msPerDay);
                    if (!d.keepRhythm && end <= date) {
                        startDate = new Date(startDate.getTime() + d.durationDays * msPerDay);
                    }
                });
            }
        }

        if (shift.weekdays && !deviationActive) {
            const d = date.getDay();
            if (d >= 1 && d <= 5) result.push(Object.assign({}, shift, {deviationActive}));
            return;
        }

        const daysSinceStart = Math.floor(
            (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
             Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) /
            msPerDay
        );
        const extraDay = (type === 'dagbasert' || shift.weekdays || workWeeks === 0) ? 0 : 1;
        const workDays = (workWeeks * 7) + extraDay;
        const cycleLength = (workWeeks * 7) + (offWeeks * 7);
        let cyclePos = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
        if (cyclePos < workDays) {
            result.push({
                name: shift.name,
                workWeeks, offWeeks, startDate, color: shift.color, type, raw: shift.raw,
                deviationActive
            });
        }
    });
    return result;
}

function hideDayPopup() {
    if (dayPopup) {
        dayPopup.style.display = 'none';
        dayPopup.innerHTML = '';
        dayPopup.classList.remove('mobile');
        dayPopup.style.top = '';
        dayPopup.style.left = '';
    }
    if (outsideHandler) {
        document.removeEventListener('click', outsideHandler);
        outsideHandler = null;
    }
}

function showDayPopup(date, anchorEl) {
    if (!dayPopup) return;
    hideDayPopup();

    const list = getShiftsForDate(date);
    if (list.length === 0) return;

    const closeSpan = document.createElement('span');
    closeSpan.className = 'close-popup';
    closeSpan.textContent = '\u00d7';
    closeSpan.addEventListener('click', hideDayPopup);
    dayPopup.appendChild(closeSpan);

    const header = document.createElement('div');
    header.className = 'popup-date';
    header.textContent = `${dayNames[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
    dayPopup.appendChild(header);

    list.forEach(shift => {
        const item = document.createElement('div');
        item.className = 'turnus-item';
        if (shift.deviationActive) item.classList.add('shift-deviation');

        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = shift.color;
        if (shift.deviationActive) colorBox.classList.add('shift-deviation');

        const span = document.createElement('span');
        const first = shift.name.split(' ')[0];
        const label = shift.raw || `${shift.workWeeks}-${shift.offWeeks}`;
        span.textContent = `${first} (${label})`;

        item.appendChild(colorBox);
        item.appendChild(span);
        dayPopup.appendChild(item);
    });

    const rect = anchorEl.getBoundingClientRect();
    if (window.innerWidth <= 600) {
        dayPopup.classList.add('mobile');
        dayPopup.style.top = '';
        dayPopup.style.left = '';
    } else {
        dayPopup.classList.remove('mobile');
        dayPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
        dayPopup.style.left = `${rect.left + window.scrollX}px`;
    }
    dayPopup.style.display = 'block';

    outsideHandler = (e) => {
        if (!dayPopup.contains(e.target)) hideDayPopup();
    };
    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

function addDayClickEvent(el, date) {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showDayPopup(date, el);
    });
}
// Global debug flag
window.DEBUG = window.DEBUG || false;
var DEBUG = window.DEBUG;

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
        if (DEBUG) console.error('Session status check failed:', e);
    }

    const userName = localStorage.getItem('userName');
    const userInfoDiv = document.getElementById('user-info');
    const friendsItem = document.getElementById('friends-item');
    const profileItem = document.getElementById('profile-item');
    const loginLink = document.getElementById('login-link');
    const pendingBadge = document.getElementById('pending-count');
    const requestBell = document.getElementById('request-bell');
    const requestCount = document.getElementById('request-count');
    const colleagueSection = document.getElementById('colleague-section');
    const manualShiftInfo = document.getElementById('manual-shift-info');

    // Håndter innloggingsstatus
    if (userName) {
        // Oppdater header for å vise velkomstmelding og logg ut-knapp
        if (userInfoDiv) {
            userInfoDiv.textContent = '';
            const welcomeSpan = document.createElement('span');
            welcomeSpan.textContent = 'Velkommen, ';
            const nameLink = document.createElement('a');
            nameLink.href = 'user_profile.html';
            const strong = document.createElement('strong');
            strong.textContent = userName;
            nameLink.appendChild(strong);
            welcomeSpan.appendChild(nameLink);
            const sep = document.createElement('span');
            sep.className = 'accent-text';
            sep.textContent = ' | ';
            const logout = document.createElement('a');
            logout.href = '#';
            logout.id = 'logout-btn';
            logout.textContent = 'Logg ut';
            userInfoDiv.appendChild(welcomeSpan);
            userInfoDiv.appendChild(sep);
            userInfoDiv.appendChild(logout);
        }

        // Vis venne- og profil-lenken hvis brukeren er logget inn
        if (friendsItem) friendsItem.style.display = 'list-item';
        if (profileItem) profileItem.style.display = 'list-item';
        if (pendingBadge) pendingBadge.style.display = 'inline';
        if (requestBell) requestBell.style.display = 'none';
        if (colleagueSection) colleagueSection.style.display = 'block';
        if (manualShiftInfo) manualShiftInfo.style.display = 'none';

        // Skjul "Logg inn"-lenken når brukeren er logget inn
        if (loginLink) {
            loginLink.style.display = 'none';
        }

    } else {
        // Skjul venne- og profil-lenken hvis brukeren ikke er logget inn
        if (friendsItem) friendsItem.style.display = 'none';
        if (profileItem) profileItem.style.display = 'none';
        
        // Sørg for at "Logg inn"-lenken vises
        if (loginLink) loginLink.style.display = 'list-item';
        if (pendingBadge) pendingBadge.style.display = 'none';
        if (requestBell) requestBell.style.display = 'none';
        if (colleagueSection) colleagueSection.style.display = 'none';
        if (manualShiftInfo) manualShiftInfo.style.display = 'block';
    }

    // Global event listener for utlogging
    document.addEventListener('click', async function (event) {
        if (event.target && event.target.id === 'logout-btn') {
            if (confirm("Er du sikker på at du vil logge ut?")) {
                try {
                    await fetch('backend/logout.php', { credentials: 'include' });
                } catch (e) {
                    if (DEBUG) console.error('Logout request failed:', e);
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

    if (requestBell) {
        requestBell.addEventListener('click', function () {
            window.location.href = 'friends.html';
        });
    }

    if (pendingBadge || requestCount) {
        updatePendingBadge();
        setInterval(updatePendingBadge, 60000);
    }
});

async function updatePendingBadge() {
    const badge = document.getElementById('pending-count');
    const bellBadge = document.getElementById('request-count');
    const requestBell = document.getElementById('request-bell');
    if (!badge && !bellBadge) return;
    if (!localStorage.getItem('userName')) {
        if (badge) badge.style.display = 'none';
        if (bellBadge) bellBadge.style.display = 'none';
        if (requestBell) requestBell.style.display = 'none';
        return;
    }
    try {
        const res = await fetch('api/pending_count.php', { credentials: 'include' });
        if (!res.ok) {
            if (badge) badge.style.display = 'none';
            if (bellBadge) bellBadge.style.display = 'none';
            if (requestBell) requestBell.style.display = 'none';
            return;
        }
        const data = await res.json();
        if (data.count > 0) {
            if (badge) { badge.textContent = data.count; badge.style.display = 'block'; }
            if (bellBadge) { bellBadge.textContent = data.count; bellBadge.style.display = 'block'; }
            if (requestBell) requestBell.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
            if (bellBadge) bellBadge.style.display = 'none';
            if (requestBell) requestBell.style.display = 'none';
        }
    } catch (e) {
        if (DEBUG) console.error('Failed to fetch pending count:', e);
    }
}
window.CSRF_TOKEN = null;
async function loadCsrfToken() {
    try {
        const res = await fetch('backend/get_csrf_token.php', { credentials: 'include' });
        const data = await res.json();
        window.CSRF_TOKEN = data.token;
        document.querySelectorAll('input[name="csrf_token"]').forEach(el => {
            el.value = window.CSRF_TOKEN;
        });
    } catch (e) {
        console.error('Failed to get CSRF token', e);
    }
}

document.addEventListener('DOMContentLoaded', loadCsrfToken);
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      banner.style.display = 'flex';
    }
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    if (acceptBtn) {
      acceptBtn.onclick = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
      };
    }
    if (rejectBtn) {
      rejectBtn.onclick = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.style.display = 'none';
      };
    }
  });
}
