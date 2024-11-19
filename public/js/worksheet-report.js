document.addEventListener('DOMContentLoaded', initializePage);

let currentYear, currentMonth;

function initializePage() {
    initializeFilters();
    fetchAccounts();
    fetchCompanies();
    fetchEmployees();
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

function fetchAccounts() {
    fetch('/api/worksheet/accounts')
        .then(response => response.json())
        .then(accounts => {
            const accountFilter = document.getElementById('account-filter');
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.account_id;
                option.textContent = `${account.account_number} - ${account.account_descript}`;
                accountFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching accounts:', error));
}

function fetchCompanies() {
    fetch('/api/worksheet/companies')
        .then(response => response.json())
        .then(companies => {
            const companyFilter = document.getElementById('company-filter');
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.company_id;
                option.textContent = company.company_descript;
                companyFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
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
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function addEventListeners() {
    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
    document.getElementById('generate-timesheet-pdf').addEventListener('click', generateTimesheetPDF);
}

function generateReport() {
    const year = document.getElementById('year-filter').value;
    const month = document.getElementById('month-filter').value;
    const accountId = document.getElementById('account-filter').value;
    const companyId = document.getElementById('company-filter').value;
    const employeeId = document.getElementById('employee-filter').value;

    let url = `/api/worksheet/report?year=${year}&month=${month}`;
    if (accountId) url += `&account_id=${accountId}`;
    if (companyId) url += `&company_id=${companyId}`;
    if (employeeId) url += `&employee_id=${employeeId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateReportTable(data);
        })
        .catch(error => console.error('Error generating report:', error));
}

function updateReportTable(data) {
    const tableBody = document.querySelector('#report-table tbody');
    tableBody.innerHTML = '';
    
    let totalMinutes = 0;

    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.event_date)}</td>
            <td>${entry.employee_nick}</td>
            <td>${entry.company_descript}</td>
            <td>${entry.account_number} - ${entry.account_descript}</td>
            <td>${formatTime(entry.in_time)}</td>
            <td>${formatTime(entry.out_time)}</td>
            <td>${formatWorkTime(entry.work_time)}</td>
        `;
        tableBody.appendChild(row);
        
        totalMinutes += entry.work_time || 0;
    });

    // Dodaj wiersz podsumowania
    const summaryRow = document.createElement('tr');
    summaryRow.innerHTML = `
        <td colspan="6" style="text-align: right;"><strong>Suma czasu pracy:</strong></td>
        <td><strong>${formatWorkTime(totalMinutes)}</strong></td>
    `;
    tableBody.appendChild(summaryRow);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}

function formatTime(timeString) {
    return timeString ? timeString.slice(0, 5) : '';
}

function formatWorkTime(minutes) {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function generatePDF() {
    // Sprawdź, czy jsPDF jest dostępny globalnie
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF nie jest załadowany. Upewnij się, że skrypt jest poprawnie dołączony.');
        return;
    }

    const doc = new window.jspdf.jsPDF();
    
    // Dodaj czcionkę obsługującą polskie znaki
    // Uwaga: Upewnij się, że ścieżka do czcionki jest poprawna
    doc.addFont('/fonts/roboto.ttf', 'Polish', 'normal');
    doc.setFont('Polish');

    // Tytuł raportu
    doc.setFontSize(18);
    const title = `Raport za ${document.getElementById('month-filter').options[document.getElementById('month-filter').selectedIndex].text} ${document.getElementById('year-filter').value}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    // Opcje filtra
    doc.setFontSize(11);
    let yPosition = 30;

    const accountFilter = document.getElementById('account-filter');
    if (accountFilter.value !== "") {
        doc.text(`Konto: ${accountFilter.options[accountFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }
    
    const companyFilter = document.getElementById('company-filter');
    if (companyFilter.value !== "") {
        doc.text(`Firma: ${companyFilter.options[companyFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }
    
    const employeeFilter = document.getElementById('employee-filter');
    if (employeeFilter.value !== "") {
        doc.text(`Pracownik: ${employeeFilter.options[employeeFilter.selectedIndex].text}`, 10, yPosition);
        yPosition += 7;
    }

    // Tabela
    const table = document.getElementById('report-table');
    
    doc.autoTable({
        html: table,
        startY: yPosition + 15,
        styles: { font: 'Polish', fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40 }
    });

    doc.save('raport.pdf');
}

function generateTimesheetPDF() {
    const year = document.getElementById('year-filter').value;
    const month = document.getElementById('month-filter').value;
    const accountId = document.getElementById('account-filter').value;
    const companyId = document.getElementById('company-filter').value;
    const employeeId = document.getElementById('employee-filter').value;

    // Budujemy parametry zapytania tylko z wybranych filtrów
    const params = new URLSearchParams({
        year: year,
        month: month
    });

    // Dodajemy pozostałe filtry tylko jeśli zostały wybrane (nie są puste)
    if (accountId) params.append('account_id', accountId);
    if (companyId) params.append('company_id', companyId);
    if (employeeId) params.append('employee_id', employeeId);

    // Pobierz dane z API z uwzględnieniem wszystkich aktywnych filtrów
    fetch('/api/worksheet/timesheet?' + params)
        .then(response => response.json())
        .then(data => {
            createTimesheetPDF(data, month, year);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas generowania karty pracy');
        });
}

function formatHoursAndMinutes(minutes) {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function roundWorkTime(minutes) {
    if (!minutes) return 0;
    const hours = minutes / 60;
    const roundedHours = (minutes % 60) >= 30 ? Math.ceil(hours) : Math.floor(hours);
    return roundedHours;
}

function createTimesheetPDF(data, month, year) {
    const useFullHours = document.getElementById('full-hours-checkbox').checked;

    const doc = new window.jspdf.jsPDF('l', 'mm', 'a4');
    
    // Dodanie i ustawienie czcionki
    doc.addFont('/fonts/roboto.ttf', 'Polish', 'normal');
    doc.setFont('Polish');
    doc.setFontSize(8);

    // Oblicz wymiary strony i marginesy
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 10;
    const marginRight = 10;
    const usableWidth = pageWidth - marginLeft - marginRight;

    // Nagłówek
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    const monthName = monthNames[parseInt(month) - 1];
    doc.text(`${monthName}`, pageWidth / 2, 15, { align: 'center' });

    // Przygotuj dane do tabeli
    const daysInMonth = new Date(year, month, 0).getDate();
    const headers = ['L.p.', 'NAZWISKO IMIĘ'];
    
    // Tablica do przechowywania indeksów weekendów
    const weekendIndexes = [];
    
    // Dodaj dni i zaznacz weekendy
    for (let i = 1; i <= daysInMonth; i++) {
        headers.push(i.toString());
        // Sprawdź czy dany dzień jest weekendem
        const date = new Date(year, month - 1, i);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = niedziela, 6 = sobota
            weekendIndexes.push(i + 1); // +1 bo mamy 2 pierwsze kolumny (L.p. i NAZWISKO IMIĘ)
        }
    }
    headers.push('S/R');

    // Przygotuj dane wierszy
    const rows = data.map((employee, index) => {
        const row = [
            (index + 1).toString(),
            employee.employee_nick
        ];
        
        let totalMinutes = 0;
        
        // Dodaj dane dla każdego dnia
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = employee.days[day] || '';
            if (dayData) {
                if (useFullHours) {
                    // Zaokrąglij do pełnych godzin
                    const roundedHours = roundWorkTime(dayData);
                    row.push(roundedHours.toString());
                    totalMinutes += roundedHours * 60; // Dodajemy do sumy zaokrąglone godziny
                } else {
                    row.push(formatHoursAndMinutes(dayData));
                    totalMinutes += dayData;
                }
            } else {
                row.push('');
            }
        }
        
        // Dodaj zaokrągloną sumę w ostatniej kolumnie
        const roundedTotal = roundWorkTime(totalMinutes);
        row.push(roundedTotal.toString());
        
        return row;
    });

    // Oblicz szerokość kolumn
    const lpWidth = 8;
    const nameWidth = 30;
    const sumWidth = 15;
    const remainingWidth = usableWidth - lpWidth - nameWidth - sumWidth;
    const dayColumnWidth = remainingWidth / daysInMonth;

    // Przygotuj style kolumn
    const columnStyles = {
        0: { cellWidth: lpWidth }, // L.p.
        1: { 
            cellWidth: nameWidth, 
            halign: 'left',
            fontSize: 7  // zawsze 7 dla nazwiska
        }
    };

    // Dodaj jednakową szerokość dla kolumn z dniami
    for (let i = 2; i < headers.length - 1; i++) {
        columnStyles[i] = { 
            cellWidth: dayColumnWidth,
            fillColor: weekendIndexes.includes(i) ? [200, 200, 200] : false,
            fontSize: useFullHours ? 7 : 5 // 7 dla pełnych godzin, 5 dla normalnego trybu
        };
    }
    
    // Ostatnia kolumna (S/R)
    columnStyles[headers.length - 1] = { 
        cellWidth: sumWidth,
        fontSize: 7,
        fontStyle: 'bold'
    };

    // Oblicz sumę godzin w zależności od trybu
    let totalHours = 0;
    data.forEach(employee => {
        if (useFullHours) {
            // W trybie pełnych godzin sumujemy zaokrąglone wartości z poszczególnych dni
            Object.values(employee.days).forEach(minutes => {
                if (minutes) {
                    totalHours += roundWorkTime(minutes);
                }
            });
        } else {
            // W trybie normalnym sumujemy zaokrąglone wartości z ostatniej kolumny (S/R)
            if (employee.total) {
                totalHours += roundWorkTime(employee.total);
            }
        }
    });

    // Generuj tabelę i zapisz jej końcową pozycję Y
    const finalY = doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        styles: {
            font: 'Polish',
            fontSize: useFullHours ? 7 : 5,
            cellPadding: 1,
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        columnStyles: columnStyles,
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: 0,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            font: 'Polish',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        theme: 'grid',
        tableLineWidth: 0.1,
        tableLineColor: [0, 0, 0],
        margin: { top: 20, left: marginLeft, right: marginRight }
    });

    // Dodaj podsumowanie pod tabelą
    doc.setFont('Polish');
    doc.setFontSize(10);
    const summaryText = `Suma godzin: ${totalHours}`;
    doc.text(summaryText, marginLeft, finalY.lastAutoTable.finalY + 10);

    doc.save(`karta_pracy_${monthName}_${year}.pdf`);
}
