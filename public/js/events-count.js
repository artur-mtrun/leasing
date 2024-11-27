let yearFilter, monthFilter, employeeFilter;

document.addEventListener('DOMContentLoaded', function() {
    yearFilter = document.getElementById('year-filter');
    monthFilter = document.getElementById('month-filter');
    employeeFilter = document.getElementById('employee-filter');
    const applyFiltersButton = document.getElementById('apply-filters');
    const eventEnrollnumber = document.getElementById('event-enrollnumber');
    const eventForm = document.getElementById('event-form');
    const eventMachinenumber = document.getElementById('event-machinenumber');
    const eventInOut = document.getElementById('event-in-out');
    const eventDate = document.getElementById('event-date');
    const eventTime = document.getElementById('event-time');

    // Inicjalizacja filtra roku
    function initializeYearFilter() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
        
        yearFilter.value = currentYear;
    }

    // Inicjalizacja filtra miesiąca na bieżący miesiąc
    function initializeMonthFilter() {
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        monthFilter.value = currentMonth;
    }

    // Pobieranie pracowników i wypełnianie filtra
    function populateEmployeeFilter() {
        fetch('/api/employees')
            .then(response => response.json())
            .then(employees => {
                employeeFilter.innerHTML = ''; // Usuwamy opcję "Wszyscy pracownicy"
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.enrollnumber;
                    option.textContent = employee.nick;
                    employeeFilter.appendChild(option);
                });

                // Ustaw domyślnie pierwszego pracownika, jeśli lista nie jest pusta
                if (employees.length > 0) {
                    employeeFilter.value = employees[0].enrollnumber;
                }
                
                // Aktualizuj numer pracownika w formularzu
                initializeEmployeeNumber();
            })
            .catch(error => console.error('Error fetching employees:', error));
    }

    // Aktualizacja numeru pracownika w formularzu przy zmianie filtra
    employeeFilter.addEventListener('change', function() {
        eventEnrollnumber.value = this.value;
    });

    // Inicjalizacja numeru pracownika w formularzu
    function initializeEmployeeNumber() {
        if (employeeFilter.options.length > 0) {
            eventEnrollnumber.value = employeeFilter.value;
        }
    }

    // Obsługa przycisku "Zastosuj filtry"
    applyFiltersButton.addEventListener('click', function() {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;
        const selectedEmployee = employeeFilter.value;

        console.log('Wybrane filtry:', {
            month: selectedMonth,
            year: selectedYear,
            employee: selectedEmployee
        });

        fetchFilteredEvents(selectedYear, selectedMonth, selectedEmployee);
    });

    // Obsługa formularza dodawania zdarzenia
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newEvent = {
            machinenumber: eventMachinenumber.value,
            enrollnumber: eventEnrollnumber.value,
            in_out: eventInOut.value,
            event_date: eventDate.value,
            event_time: eventTime.value
        };

        fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Zdarzenie dodane:', data);
            // Odśwież listę zdarzeń
            fetchFilteredEvents(yearFilter.value, monthFilter.value, employeeFilter.value);
            // Wyczyść formularz
            eventForm.reset();
            // Przywróć domyślne wartości dla czytnika i numeru pracownika
            eventMachinenumber.value = '0';
            eventEnrollnumber.value = employeeFilter.value;
        })
        .catch(error => console.error('Błąd podczas dodawania zdarzenia:', error));
    });

    // Inicjalizacja
    initializeYearFilter();
    initializeMonthFilter();
    populateEmployeeFilter();
});

function renderEventsTable(events) {
    const tableBody = document.getElementById('events-list');
    tableBody.innerHTML = '';

    // Usuń klasę table-striped z tabeli
    const table = tableBody.closest('table');
    table.classList.remove('table-striped');

    if (events.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">Brak danych do wyświetlenia</td></tr>';
        return;
    }

    events.forEach((event, index) => {
        // Sprawdzamy poprzednie i następne zdarzenie dla tego samego pracownika
        const prevEvent = index > 0 ? events[index - 1] : null;
        const nextEvent = index < events.length - 1 ? events[index + 1] : null;
        
        // Sprawdzamy czy jest nieprawidłowa sekwencja
        const isInvalidSequence = 
            // Sprawdzamy czy to ten sam pracownik
            ((prevEvent && prevEvent.enrollnumber === event.enrollnumber && 
              // Dwa wejścia pod rząd
              (prevEvent.in_out === 2 && event.in_out === 2)) ||
             // Dwa wyjścia pod rząd
             (prevEvent && prevEvent.enrollnumber === event.enrollnumber && 
              prevEvent.in_out === 3 && event.in_out === 3) ||
             // To samo dla następnego zdarzenia
             (nextEvent && nextEvent.enrollnumber === event.enrollnumber && 
              event.in_out === nextEvent.in_out));

        // Określamy kolor tła
        let backgroundColor;
        if (isInvalidSequence) {
            // Kolor dla nieprawidłowej sekwencji
            backgroundColor = '#ff9999'; // Czerwony dla błędów
        } else if (event.machinenumber === 0) {
            // Dla czytnika 0: bardziej intensywne żółte tło
            backgroundColor = event.in_out === 2 ? '#fff2cc' : '#fff7e6';
        } else {
            // Dla pozostałych czytników: jasny szary dla wejścia, biały dla wyjścia
            backgroundColor = event.in_out === 2 ? '#f0f0f0' : 'white';
        }
        
        const cellStyle = `style="background-color: ${backgroundColor} !important"`;
        const row = `
            <tr ${cellStyle}>
                <td ${cellStyle}>${index + 1}</td>
                <td ${cellStyle}>${event.machinenumber}</td>
                <td ${cellStyle}>${event.enrollnumber}</td>
                <td ${cellStyle}>${event.nick || 'Unknown'}</td>
                <td ${cellStyle}>${event.in_out === 2 ? 'We' : 'Wy'}</td>
                <td ${cellStyle}>${new Date(event.event_date).toLocaleDateString()}</td>
                <td ${cellStyle}>${event.event_time}</td>
                <td ${cellStyle}>
                    <button class="btn btn-danger btn-sm delete-event me-2" data-event-id="${event.event_id}">Usuń zdarzenie</button>
                    <button class="btn btn-warning btn-sm toggle-status" data-event-id="${event.event_id}" data-current-status="${event.in_out}">
                        Zamień status
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Dodaj nasłuchiwacze po renderowaniu
    addDeleteEventListeners();
    addToggleStatusListeners();
}

function addDeleteEventListeners() {
    console.log('Adding delete event listeners');
    const deleteButtons = document.querySelectorAll('.delete-event');
    console.log('Found delete buttons:', deleteButtons.length);
    
    deleteButtons.forEach(button => {
        // Usuń wszystkie istniejące nasłuchiwacze
        const clone = button.cloneNode(true);
        button.parentNode.replaceChild(clone, button);
        
        // Dodaj nowy nasłuchiwacz
        clone.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            console.log('Delete button clicked for event ID:', eventId);
            if (confirm('Czy na pewno chcesz usunąć to zdarzenie?')) {
                deleteEvent(eventId);
            }
        });
    });
}

function deleteEvent(eventId) {
    console.log('Starting delete operation for event ID:', eventId);
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Delete response status:', response.status);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Delete successful:', data);
        // Odśwież listę zdarzeń z aktualnymi filtrami
        const year = yearFilter.value;
        const month = monthFilter.value;
        const enrollnumber = employeeFilter.value;
        fetchFilteredEvents(year, month, enrollnumber);
    })
    .catch(error => {
        console.error('Error in deleteEvent:', error);
        alert('Wystąpił błąd podczas usuwania zdarzenia: ' + error.message);
    });
}

function calculateWorkTime(event, previousEvent) {
    if (event.in_out === 3 && previousEvent && previousEvent.in_out === 2) {
        console.log('Event:', event);
        console.log('Previous event:', previousEvent);
        
        const eventDateTime = new Date(event.event_date.split('T')[0] + 'T' + event.event_time);
        const previousEventDateTime = new Date(previousEvent.event_date.split('T')[0] + 'T' + previousEvent.event_time);
        
        console.log('Event date time:', eventDateTime);
        console.log('Previous event date time:', previousEventDateTime);
        
        if (isNaN(eventDateTime.getTime()) || isNaN(previousEventDateTime.getTime())) {
            console.error('Nieprawidłowy format daty lub czasu');
            return ''; // Zwracamy pusty string zamiast '---'
        }
        
        const workTime = eventDateTime.getTime() - previousEventDateTime.getTime();
        console.log('Work time in milliseconds:', workTime);
        
        const hours = Math.floor(workTime / (1000 * 60 * 60));
        const minutes = Math.floor((workTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((workTime % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return ''; // Zwracamy pusty string zamiast '---'
}

function fetchFilteredEvents(year, month, enrollnumber) {
    year = year || yearFilter.value;
    month = month || monthFilter.value;
    enrollnumber = enrollnumber || employeeFilter.value;

    console.log('Fetching filtered events:', { year, month, enrollnumber });
    
    fetch(`/api/events/filter?year=${year}&month=${month}&enrollnumber=${enrollnumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(events => {
            console.log('Received events:', events);
            renderEventsTable(events);
        })
        .catch(error => {
            console.error('Error fetching filtered events:', error);
            alert('Wystąpił błąd podczas pobierania zdarzeń: ' + error.message);
        });
}

function convertTimeToSeconds(timeString) {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function formatSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Dodaj nową funkcję dla obsługi przycisków zmiany statusu
function addToggleStatusListeners() {
    const toggleButtons = document.querySelectorAll('.toggle-status');
    
    toggleButtons.forEach(button => {
        const clone = button.cloneNode(true);
        button.parentNode.replaceChild(clone, button);
        
        clone.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            const currentStatus = parseInt(this.getAttribute('data-current-status'));
            const newStatus = currentStatus === 2 ? 3 : 2;
            
            if (confirm('Czy na pewno chcesz zmienić status tego zdarzenia?')) {
                toggleEventStatus(eventId, newStatus);
            }
        });
    });
}

// Dodaj nową funkcję do obsługi zmiany statusu
function toggleEventStatus(eventId, newStatus) {
    fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ in_out: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Status changed successfully:', data);
        // Odśwież listę zdarzeń z aktualnymi filtrami
        const year = yearFilter.value;
        const month = monthFilter.value;
        const enrollnumber = employeeFilter.value;
        fetchFilteredEvents(year, month, enrollnumber);
    })
    .catch(error => {
        console.error('Error in toggleEventStatus:', error);
        alert('Wystąpił błąd podczas zmiany statusu: ' + error.message);
    });
}
