let loadedDates = new Set();
let firstLoadedDate = new Date();
let lastLoadedDate = new Date();
let today = new Date();
firstLoadedDate.setDate(firstLoadedDate.getDate() - 60);
lastLoadedDate.setDate(lastLoadedDate.getDate() + 60);

const teamCycles = [
    ["Matin", "Matin", "Après-midi", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos", "Repos"],
    ["Après-midi", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos", "Repos", "Matin", "Matin"],
    ["Nuit", "Nuit", "Repos", "Repos", "Repos", "Repos", "Matin", "Matin", "Après-midi", "Après-midi"],
    ["Repos", "Repos", "Repos", "Repos", "Matin", "Matin", "Après-midi", "Après-midi", "Nuit", "Nuit"],
    ["Repos", "Repos", "Matin", "Matin", "Après-midi", "Après-midi", "Nuit", "Nuit", "Repos", "Repos"]
];

//const teamColors = ["#FFCCCC", "#CCFFCC", "#CCCCFF", "#FFFFCC", "#FFCCFF"];
const teamColors = ["#FFFF00", "#FF0000", "#00FF00",  "#0000FF", "#FFA500"]; 
const holidays = [
    "01-01", // Jour de l'An
    /* "04-21", // Lundi de Pâques */
    "05-01", // Fête du Travail
    "05-08", // Victoire 1945
    "05-29", // Ascension
    "06-07", // Lundi de Pentecôte
    "07-14", // Fête Nationale
    "08-15", // Assomption
    "11-01", // Toussaint
    "11-11", // Armistice 1918
    "12-25"  // Noël
];

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function isHoliday(date) {
    const dateString = date.toISOString().split('T')[0].slice(5); // Obtenir MM-DD
    return holidays.includes(dateString);
}

function generateCalendar(startDate, daysToAdd, direction) {
    let calendarBody = document.getElementById("calendarBody");
    let fragment = document.createDocumentFragment();
    
    // Dates de référence pour chaque équipe (quand elles sont du matin)
    const teamStartDates = [
        new Date(2025, 1, 2),  // Équipe 1 (jaune) : 2 février 2025 - commence par Matin
        new Date(2025, 1, 4),  // Équipe 2 (bleue) : 4 février 2025 - commence par Matin
        new Date(2025, 1, 6),  // Équipe 3 (rouge) : 6 février 2025 - commence par Matin
        new Date(2025, 1, 8),  // Équipe 4 (orange) : 8 février 2025 - commence par Matin
        new Date(2025, 1, 10)  // Équipe 5 (verte) : 10 février 2025 - commence par Matin
    ];

    // Décalage initial dans le cycle pour chaque équipe
    const teamInitialOffsets = [
        0,  // Équipe 1 commence au début du cycle (Matin)
        6,  // Équipe 2 commence 6 jours plus tard dans le cycle
        2,  // Équipe 3 commence 2 jours plus tard dans le cycle
        8,  // Équipe 4 commence 8 jours plus tard dans le cycle
        4   // Équipe 5 commence 4 jours plus tard dans le cycle
    ];

    for (let i = 0; i < daysToAdd; i++) {
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + (direction === 'forward' ? i : -i));
        let dateString = formatDate(newDate);
        if (loadedDates.has(dateString)) continue;
        loadedDates.add(dateString);
        let row = document.createElement("tr");
        let dateCell = document.createElement("td");
        dateCell.innerText = dateString;
        dateCell.classList.add("date-cell");
        if (dateString === formatDate(today)) {
            dateCell.classList.add("today");
        }
        if (newDate.getDay() === 0 || newDate.getDay() === 6) {
            dateCell.classList.add("weekend");
        }
        if (isHoliday(newDate)) {
            dateCell.classList.add("holiday");
        }
        row.appendChild(dateCell);

        for (let j = 0; j < 5; j++) {
            let extraCell = document.createElement("td");
            let daysSinceStart = Math.floor((newDate - teamStartDates[j]) / (1000 * 60 * 60 * 24));
            let cycleIndex = (daysSinceStart + teamInitialOffsets[j]) % teamCycles[j].length;
            if (cycleIndex < 0) {
                cycleIndex = (teamCycles[j].length + cycleIndex) % teamCycles[j].length;
            }
            let cycle = teamCycles[j][cycleIndex];
            extraCell.innerText = cycle === "Matin" ? "M" : cycle === "Après-midi" ? "AM" : cycle === "Nuit" ? "N" : "R";
            if (cycle !== "Repos") {
                extraCell.style.backgroundColor = teamColors[j];
            }
            extraCell.classList.add("extra-cell", `team-${j}`);
            row.appendChild(extraCell);
        }
        if (direction === 'forward') {
            fragment.appendChild(row);
        } else {
            calendarBody.insertBefore(row, calendarBody.firstChild);
        }
    }
    if (direction === 'forward') {
        calendarBody.appendChild(fragment);
    }
    updateFadeEffect();
    applyCenterRowEffect();
    updateTeamVisibility();
}

function generateDatesUntil(targetDate) {
    const maxIterations = 1000; // Limite pour éviter les boucles infinies
    let iterations = 0;
    while (targetDate < firstLoadedDate && iterations < maxIterations) {
        let newFirstDate = new Date(firstLoadedDate);
        newFirstDate.setDate(firstLoadedDate.getDate() - 30);
        generateCalendar(firstLoadedDate, 30, 'backward');
        firstLoadedDate = newFirstDate;
        iterations++;
    }
    while (targetDate > lastLoadedDate && iterations < maxIterations) {
        let newLastDate = new Date(lastLoadedDate);
        newLastDate.setDate(lastLoadedDate.getDate() + 30);
        generateCalendar(lastLoadedDate, 30, 'forward');
        lastLoadedDate = newLastDate;
        iterations++;
    }
}

function scrollToToday() {
    scrollToFormattedDate(formatDate(today));
}

function validateDate() {
    let input = document.getElementById("dateInput").value;
    if (!input) return;
    let selectedDate = new Date(input);
    showLoadingModal();
    setTimeout(() => {
        generateDatesUntil(selectedDate);
        scrollToFormattedDate(formatDate(selectedDate));
        hideLoadingModal();
    }, 100);
}

function showLoadingModal() {
    document.getElementById("loadingModal").style.display = "block";
}

function hideLoadingModal() {
    document.getElementById("loadingModal").style.display = "none";
}

function scrollToFormattedDate(dateString) {
    let container = document.getElementById("calendarContainer");
    let rows = document.querySelectorAll("#calendarBody tr");
    for (let row of rows) {
        if (row.textContent.includes(dateString)) {
            let offset = row.offsetTop - (container.clientHeight / 2) + (row.clientHeight / 2);
            container.scrollTop = offset;
            break;
        }
    }
    updateFadeEffect();
    applyCenterRowEffect(); // Appliquer l'effet de ligne centrale après le défilement
}

function onScroll() {
    let container = document.getElementById("calendarContainer");
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        let newLastDate = new Date(lastLoadedDate);
        newLastDate.setDate(lastLoadedDate.getDate() + 30);
        generateCalendar(lastLoadedDate, 30, 'forward');
        lastLoadedDate = newLastDate;
    }
    if (container.scrollTop <= 50) {
        let newFirstDate = new Date(firstLoadedDate);
        newFirstDate.setDate(firstLoadedDate.getDate() - 30);
        generateCalendar(firstLoadedDate, 30, 'backward');
        firstLoadedDate = newFirstDate;
        container.scrollTop += 150; 
    }
    updateFadeEffect();
    applyCenterRowEffect(); // Appliquer l'effet de ligne centrale lors du défilement
}

function updateFadeEffect() {
    let container = document.getElementById("calendarContainer");
    let rows = document.querySelectorAll("#calendarBody tr");
    let containerRect = container.getBoundingClientRect();

    rows.forEach(row => {
        let rowRect = row.getBoundingClientRect();
        row.classList.remove("fade-top", "fade-bottom", "fade-top-less", "fade-bottom-less");

        if (rowRect.top < containerRect.top + 50) {
            row.classList.add("fade-top");
            //row.style.transform = "rotateX(30deg)"; // Rotation pour l'effet de roue
        } else if (rowRect.top < containerRect.top + 100) {
            row.classList.add("fade-top-less");
            //row.style.transform = "rotateX(15deg)"; // Rotation pour l'effet de roue
        } else if (rowRect.bottom > containerRect.bottom - 50) {
            row.classList.add("fade-bottom");
            //row.style.transform = "rotateX(-30deg)"; // Rotation pour l'effet de roue
        } else if (rowRect.bottom > containerRect.bottom - 100) {
            row.classList.add("fade-bottom-less");
            //row.style.transform = "rotateX(-15deg)"; // Rotation pour l'effet de roue
        } else {
            // row.style.transform = "rotateX(0deg)"; // Réinitialiser la rotation
        }
    });
}

function applyCenterRowEffect() {
    let container = document.getElementById("calendarContainer");
    let rows = document.querySelectorAll("#calendarBody tr");
    let containerRect = container.getBoundingClientRect();
    let centerY = containerRect.top + containerRect.height / 2;

    rows.forEach(row => {
        let rowRect = row.getBoundingClientRect();
        row.classList.remove("center-row");
        if (Math.abs(centerY - (rowRect.top + rowRect.height / 2)) < rowRect.height / 2) {
            row.classList.add("center-row");
        }
    });
}

function updateTeamVisibility() {
    const checkboxes = document.querySelectorAll('.team-checkbox');
    checkboxes.forEach(checkbox => {
        const teamIndex = checkbox.getAttribute('data-team');
        const cells = document.querySelectorAll(`.team-${teamIndex}`);
        cells.forEach(cell => {
            if (checkbox.checked) {
                cell.classList.remove('hidden-cell');
                cell.classList.add('visible-cell');
                setTimeout(() => {
                    cell.style.display = '';
                }, 500); // Délai pour l'effet de fondu
            } else {
                cell.classList.remove('visible-cell');
                cell.classList.add('hidden-cell');
                setTimeout(() => {
                    cell.style.display = 'none';
                }, 500); // Délai pour l'effet de fondu
            }
        });
    });
}

document.querySelectorAll('.team-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateTeamVisibility);
});

document.getElementById("calendarContainer").addEventListener("scroll", onScroll);
generateCalendar(firstLoadedDate, 120, 'forward');
setTimeout(scrollToToday, 100);
updateTeamVisibility();

function increaseFontSize() {
    const table = document.getElementById("calendarBody");
    const cells = table.getElementsByTagName("td");
    const currentSize = window.getComputedStyle(cells[0]).fontSize;
    const newSize = parseFloat(currentSize) + 2;
    
    // Appliquer la nouvelle taille à toutes les cellules
    for (let cell of cells) {
        cell.style.fontSize = newSize + "px";
    }
}

function decreaseFontSize() {
    const table = document.getElementById("calendarBody");
    const cells = table.getElementsByTagName("td");
    const currentSize = window.getComputedStyle(cells[0]).fontSize;
    const newSize = Math.max(8, parseFloat(currentSize) - 2); // Minimum 8px
    
    // Appliquer la nouvelle taille à toutes les cellules
    for (let cell of cells) {
        cell.style.fontSize = newSize + "px";
    }
}
function resetFontSize() {
    const table = document.getElementById("calendarBody");
    const cells = table.getElementsByTagName("td");
    
    // Réinitialiser la taille de police à 12px pour toutes les cellules
    for (let cell of cells) {
        cell.style.fontSize = "14px";
    }
}


// Ajout des gestionnaires d'événements aux icônes de navigation
document.querySelector('.fa-chevron-up').parentElement.addEventListener('click', increaseFontSize);
document.querySelector('.fa-chevron-down').parentElement.addEventListener('click', decreaseFontSize);
