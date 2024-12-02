document.addEventListener('DOMContentLoaded', initializePage);

let currentYear, currentMonth, currentEmployee;
let events = [];
let accounts = []; // Dodaj tę linię na początku pliku

function initializePage() {
    initializeFilters();
    fetchEmployees();
    fetchAccounts(); // Dodaj tę linię
    addEventListeners();
}

function initializeFilters() {
    const currentDate = new Date();
    currentYear = currentDate.getFullYear();
    currentMonth = currentDate.getMonth();

    const yearFilter = document.getElementById('year-filter');
    const monthFilter = document.getElementById('month-filter');

    // Inicjalizacja lat (bieżący rok +/- 2 lata)
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
    yearFilter.value = currentYear;

    // Ustawiamy aktualny miesiąc
    monthFilter.value = (currentMonth + 1).toString().padStart(2, '0');
}

function fetchEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(employees => {
            const employeeFilter = document.getElementById('employee-filter');
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.enrollnumber;
                option.textContent = employee.nick;
                employeeFilter.appendChild(option);
            });
            if (employees.length > 0) {
                currentEmployee = employees[0].enrollnumber;
                employeeFilter.value = currentEmployee;
            }
            generateCalendar();
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function addEventListeners() {
    document.getElementById('year-filter').addEventListener('change', generateCalendar);
    document.getElementById('month-filter').addEventListener('change', generateCalendar);
    document.getElementById('employee-filter').addEventListener('change', generateCalendar);
}

// Dodaj tę nową funkcję
async function fetchEmployeeData(enrollnumber) {
    try {
        const response = await fetch(`/api/worksheet/employee-data?enrollnumber=${enrollnumber}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Pobrane dane pracownika:', data); // Dodaj to dla debugowania
        return data;
    } catch (error) {
        console.error('Error fetching employee data:', error);
        throw error; // Rzuć błąd, aby został obsłużony w .catch() w generateCalendar
    }
}

// Zmodyfikuj funkcję generateCalendar
function generateCalendar() {
    const year = parseInt(document.getElementById('year-filter').value);
    const month = parseInt(document.getElementById('month-filter').value) - 1;
    const employee = document.getElementById('employee-filter').value;

    fetchEmployeeData(employee).then(employeeData => {
        console.log('Otrzymane dane pracownika:', employeeData); // Dodaj to dla debugowania
        if (employeeData && employeeData.Company) {
            document.getElementById('employee-company-id').textContent = employeeData.Company.company_id;
            document.getElementById('employee-company-descript').textContent = employeeData.Company.company_descript;
        } else {
            document.getElementById('employee-company-id').textContent = 'Brak danych';
            document.getElementById('employee-company-descript').textContent = 'Brak danych';
        }
    }).catch(error => {
        console.error('Błąd podczas pobierania danych pracownika:', error);
        document.getElementById('employee-company-id').textContent = 'Błąd';
        document.getElementById('employee-company-descript').textContent = 'Błąd';
    });

    fetchEvents(year, month, employee);
}

function fetchEvents(year, month, employee) {
    console.log(`Pobieranie wydarzeń dla pracownika: ${employee}, rok: ${year}, miesiąc: ${month + 1}`);
    fetch(`/api/worksheet/events?year=${year}&month=${month + 1}&enrollnumber=${employee}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Otrzymane dane:`, data);
            events = data;
            updateCalendar(year, month);
        })
        .catch(error => console.error('Error fetching events:', error));
}

function updateCalendar(year, month) {
    console.log('Otrzymane wydarzenia:', events);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarBody = document.querySelector('#calendar-table tbody');
    calendarBody.innerHTML = '';

    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

    // Sortujemy wydarzenia chronologicznie
    events.sort((a, b) => new Date(a.event_date + 'T' + a.event_time) - new Date(b.event_date + 'T' + b.event_time));

    let lastInEvent = null;
    let usedEventIds = new Set();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const row = document.createElement('tr');

        // Data
        const dateCell = document.createElement('td');
        dateCell.textContent = `${day.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
        row.appendChild(dateCell);

        // Dzień tygodnia
        const dayNameCell = document.createElement('td');
        dayNameCell.textContent = dayNames[date.getDay()];
        row.appendChild(dayNameCell);

        // Numer czytnika (machinenumber)
        const machineNumberCell = document.createElement('td');
        row.appendChild(machineNumberCell);

        // Wejście i wyjście
        const inTimeCell = document.createElement('td');
        const outTimeCell = document.createElement('td');

        // Nowa komórka dla czasu pracy
        const workTimeCell = document.createElement('td');

        const dayEvents = events.filter(event => 
            new Date(event.event_date).getDate() === day &&
            new Date(event.event_date).getMonth() === month &&
            new Date(event.event_date).getFullYear() === year &&
            !usedEventIds.has(event.event_id)
        );

        console.log(`Wydarzenia dla ${day}.${month + 1}.${year}:`, dayEvents);

        let inEvent = dayEvents.find(event => event.in_out === 2) || (lastInEvent && !usedEventIds.has(lastInEvent.event_id) ? lastInEvent : null);
        let outEvent = dayEvents.find(event => event.in_out === 3 || event.in_out === 4);

        if (inEvent && !outEvent) {
            const nextDayEvents = events.filter(event => 
                new Date(event.event_date).getDate() === day + 1 &&
                new Date(event.event_date).getMonth() === month &&
                new Date(event.event_date).getFullYear() === year &&
                !usedEventIds.has(event.event_id) &&
                (event.in_out === 3 || event.in_out === 4)
            );
            outEvent = nextDayEvents[0];
        }

        console.log('Wydarzenie wejścia:', inEvent);
        console.log('Wydarzenie wyjścia:', outEvent);

        if (inEvent && !usedEventIds.has(inEvent.event_id)) {
            inTimeCell.textContent = formatTime(inEvent.event_time);
            usedEventIds.add(inEvent.event_id);
            machineNumberCell.textContent = inEvent.machinenumber;
        }

        if (outEvent && !usedEventIds.has(outEvent.event_id)) {
            outTimeCell.textContent = formatTime(outEvent.event_time);
            usedEventIds.add(outEvent.event_id);
            if (!inEvent) {
                machineNumberCell.textContent = outEvent.machinenumber;
            }
        }

        // Obliczanie i wyświetlanie czasu pracy w formacie godzinowym dla wiersza kalendarza
        if (inEvent && outEvent) {
            const workTimeInMinutes = calculateWorkTime(inEvent, outEvent);
            workTimeCell.textContent = formatTimeHours(workTimeInMinutes);
        }

        if (inEvent && !outEvent) {
            lastInEvent = inEvent;
        } else {
            lastInEvent = null;
        }

        row.appendChild(inTimeCell);
        row.appendChild(outTimeCell);
        row.appendChild(workTimeCell);

        calendarBody.appendChild(row);

        // Modyfikacja wiersza worksheet
        const worksheetRow = document.createElement('tr');
        worksheetRow.classList.add('worksheet-row');

        // Dodajemy puste komórki do wiersza worksheet
        const numberOfColumns = 6;
        for (let i = 0; i < numberOfColumns; i++) {
            worksheetRow.appendChild(document.createElement('td'));
        }

        const hasEntryData = inTimeCell.textContent && outTimeCell.textContent;

        if (hasEntryData) {
            getWorksheetDataForDay(year, month, day).then(worksheetData => {
                if (worksheetData) {
                    // Jeśli istnieją dane Worksheet, wypełnij komórki
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Zmień';
                    editButton.classList.add('btn', 'btn-sm', 'btn-secondary');
                    editButton.onclick = () => editWorksheetEntry(worksheetData.worksheet_id, year, month, day, inEvent, outEvent);
                    worksheetRow.cells[0].appendChild(editButton);

                    const accountSelect = createAccountSelect(worksheetData.account_id, false); // Nie dodajemy opcji "Wybierz konto"
                    worksheetRow.cells[1].appendChild(accountSelect);

                    worksheetRow.cells[2].textContent = worksheetData.machinenumber !== undefined ? worksheetData.machinenumber.toString() : '';
                    worksheetRow.cells[3].textContent = formatTime(worksheetData.in_time);
                    worksheetRow.cells[4].textContent = formatTime(worksheetData.out_time);
                    worksheetRow.cells[5].textContent = worksheetData.work_time ? formatTimeMinutes(worksheetData.work_time) : '';

                    // Dodajemy atrybuty data- do przechowywania oryginalnych wartości
                    worksheetRow.dataset.originalAccountId = worksheetData.account_id;
                    worksheetRow.dataset.originalMachinenumber = worksheetData.machinenumber;
                    worksheetRow.dataset.originalInTime = worksheetData.in_time;
                    worksheetRow.dataset.originalOutTime = worksheetData.out_time;
                    worksheetRow.dataset.originalWorkTime = worksheetData.work_time;
                } else {
                    // Dla nowych wpisów, używamy createAccountSelect z domyślną opcją
                    const addButton = document.createElement('button');
                    addButton.textContent = 'Dodaj';
                    addButton.classList.add('btn', 'btn-sm', 'btn-primary');
                    addButton.onclick = () => addWorksheetEntry(year, month, day, inEvent, outEvent);
                    worksheetRow.cells[0].appendChild(addButton);

                    const accountSelect = createAccountSelect(null, true); // Dodajemy opcję "Wybierz konto"
                    worksheetRow.cells[1].appendChild(accountSelect);

                    // Zmiana tutaj: zawsze wyświetlaj machinenumber, nawet jeśli jest zero
                    worksheetRow.cells[2].textContent = machineNumberCell.textContent !== undefined ? machineNumberCell.textContent : '';
                    worksheetRow.cells[3].textContent = inTimeCell.textContent || '';
                    worksheetRow.cells[4].textContent = outTimeCell.textContent || '';
                    const workTimeInMinutes = inEvent && outEvent ? calculateWorkTime(inEvent, outEvent) : 0;
                    worksheetRow.cells[5].textContent = formatTimeMinutes(workTimeInMinutes);
                }
            }).catch(error => {
                console.error('Error fetching worksheet data:', error);
            });
        }

        calendarBody.appendChild(worksheetRow);
    }
}

function formatTime(timeString) {
    if (!timeString) return ''; // Jeśli timeString jest undefined lub null, zwróć pusty string
    console.log('Oryginalny czas:', timeString);
    return timeString.slice(0, 5);  // Zwracamy tylko godziny i minuty (HH:MM)
}

function formatTimeHours(timeInMinutes) {
    if (typeof timeInMinutes !== 'number' || isNaN(timeInMinutes)) {
        return '';
    }
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatTimeMinutes(timeInMinutes) {
    if (typeof timeInMinutes !== 'number' || isNaN(timeInMinutes)) {
        return '';
    }
    return Math.round(timeInMinutes).toString();
}

function calculateWorkTime(inEvent, outEvent) {
    if (!inEvent || !outEvent || !inEvent.event_time || !outEvent.event_time) {
        return 0;
    }

    const inTime = parseDateTime(inEvent.event_date, inEvent.event_time);
    const outTime = parseDateTime(outEvent.event_date, outEvent.event_time);
    
    if (inTime && outTime) {
        let diffInMinutes = (outTime - inTime) / (1000 * 60);
        
        // Jeśli czas wyjścia jest wcześniejszy niż czas wejścia, zakładamy, że wyjście było następnego dnia
        if (diffInMinutes < 0) {
            diffInMinutes += 24 * 60; // dodajemy 24 godziny w minutach
        }
        
        return Math.round(diffInMinutes);
    }
    return 0;
}

function parseDateTime(dateString, timeString) {
    if (!dateString || !timeString) return null;
    
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timeString.split(':');
    
    return new Date(year, month - 1, day, hours, minutes);
}

async function getWorksheetDataForDay(year, month, day) {
    const employee = document.getElementById('employee-filter').value;
    try {
        const response = await fetch(`/api/worksheet/worksheet-data?year=${year}&month=${month + 1}&day=${day}&enrollnumber=${employee}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data || null; // Zwróć null, jeśli nie ma danych
    } catch (error) {
        console.error('Error fetching worksheet data:', error);
        return null;
    }
}

function addWorksheetEntry(year, month, day, inEvent, outEvent) {
    const employee = document.getElementById('employee-filter').value;
    const row = event.target.closest('tr');
    const accountSelect = row.cells[1].querySelector('select');
    const accountId = accountSelect ? accountSelect.value : null;

    if (!accountId) {
        alert('Proszę wybrać konto przed dodaniem wpisu.');
        return;
    }

    // Pobierz wartość czasu pracy z wiersza
    const workTimeCell = row.cells[5];
    const workTime = workTimeCell ? parseInt(workTimeCell.textContent, 10) : 0;

    console.log('Czas pracy przed wysłaniem:', workTime); // Dodaj to dla debugowania

    const data = {
        day,
        month: month + 1,
        year,
        enrollnumber: employee,
        machinenumber: inEvent ? inEvent.machinenumber : (outEvent ? outEvent.machinenumber : ''),
        in_time: inEvent ? inEvent.event_time : '',
        out_time: outEvent ? outEvent.event_time : '',
        account_id: accountId,
        work_time: workTime // Upewnij się, że ta wartość jest poprawna
    };

    fetch('/api/worksheet/add-entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
        console.log('Czas pracy po dodaniu:', result.entry.work_time); // Dodaj to dla debugowania
        generateCalendar(); // Odśwież kalendarz po dodaniu wpisu
    })
    .catch((error) => {
        console.error('Error:', error);
        alert(error.message || 'Wystąpił błąd podczas dodawania wpisu. Spróbuj ponownie.');
    });
}

// Dodaj tę nową funkcję
function fetchAccounts() {
    fetch('/api/worksheet/accounts')
        .then(response => response.json())
        .then(data => {
            accounts = data;
        })
        .catch(error => console.error('Error fetching accounts:', error));
}

// Dodaj tę nową funkcję
function createAccountSelect(selectedAccountId, includeDefaultOption = true) {
    const select = document.createElement('select');
    select.classList.add('form-control', 'form-control-sm', 'account-select');
    
    if (includeDefaultOption) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Wybierz konto';
        select.appendChild(defaultOption);
    }

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.account_id;
        option.textContent = `${account.account_id} - ${account.account_descript}`;
        if (account.account_id === selectedAccountId) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    // Inicjalizuj Select2 na nowym elemencie
    setTimeout(() => {
        $(select).select2({
            theme: 'bootstrap-5',
            width: '100%',
            language: {
                noResults: function() {
                    return "Nie znaleziono konta";
                },
                searching: function() {
                    return "Wyszukiwanie...";
                }
            },
            placeholder: 'Wybierz lub wyszukaj konto',
            allowClear: includeDefaultOption,
            matcher: function(params, data) {
                // Jeśli nie ma szukanej frazy, zwróć wszystkie wyniki
                if ($.trim(params.term) === '') {
                    return data;
                }

                // Nie szukaj w pustych danych
                if (typeof data.text === 'undefined') {
                    return null;
                }

                // Konwertuj do małych liter dla lepszego wyszukiwania
                const searchTerm = params.term.toLowerCase();
                const textToSearch = data.text.toLowerCase();

                // Szukaj zarówno w ID jak i w opisie
                if (textToSearch.indexOf(searchTerm) > -1) {
                    return data;
                }

                // Jeśli nie znaleziono, zwróć null
                return null;
            }
        });
    }, 0);

    return select;
}

function editWorksheetEntry(worksheetId, year, month, day, inEvent, outEvent) {
    const row = event.target.closest('tr');
    const accountSelect = row.cells[1].querySelector('select');
    const accountId = accountSelect.value;

    const data = {
        worksheet_id: worksheetId,
        day,
        month: month + 1,
        year,
        enrollnumber: document.getElementById('employee-filter').value,
        machinenumber: row.cells[2].textContent,
        in_time: row.cells[3].textContent,
        out_time: row.cells[4].textContent,
        account_id: accountId,
        work_time: parseInt(row.cells[5].textContent, 10)
    };

    fetch(`/api/worksheet/edit-entry/${worksheetId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
        generateCalendar(); // Odśwież kalendarz po edycji wpisu
    })
    .catch((error) => {
        console.error('Error:', error);
        alert(error.message || 'Wystąpił błąd podczas edycji wpisu. Spróbuj ponownie.');
    });
}
