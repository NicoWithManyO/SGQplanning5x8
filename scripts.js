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

const teamColors = ["#FFCCCC", "#CCFFCC", "#CCCCFF", "#FFFFCC", "#FFCCFF"];

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function generateCalendar(startDate, daysToAdd, direction) {
    let calendarBody = document.getElementById("calendarBody");
    let fragment = document.createDocumentFragment();
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
        row.appendChild(dateCell);
        // Ajout des colonnes supplémentaires avec les cycles des équipes
        for (let j = 0; j < 5; j++) {
            let extraCell = document.createElement("td");
            let cycleIndex = (Math.floor((newDate - new Date(2025, 0, 1)) / (1000 * 60 * 60 * 24)) + j * 2) % teamCycles[j].length;
            let cycle = teamCycles[j][cycleIndex];
            extraCell.innerText = cycle === "Matin" ? "M" : cycle === "Après-midi" ? "AM" : cycle === "Nuit" ? "N" : "R";
            if (cycle !== "Repos") {
                extraCell.style.backgroundColor = teamColors[j];
            }
            extraCell.classList.add("extra-cell");
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
    applyCenterRowEffect(); // Appliquer l'effet de ligne centrale après la génération du calendrier
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
        } else if (rowRect.top < containerRect.top + 100) {
            row.classList.add("fade-top-less");
        } else if (rowRect.bottom > containerRect.bottom - 50) {
            row.classList.add("fade-bottom");
        } else if (rowRect.bottom > containerRect.bottom - 100) {
            row.classList.add("fade-bottom-less");
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

document.getElementById("calendarContainer").addEventListener("scroll", onScroll);
generateCalendar(firstLoadedDate, 120, 'forward');
setTimeout(scrollToToday, 100);