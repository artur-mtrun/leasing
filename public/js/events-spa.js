document.addEventListener('DOMContentLoaded', () => {
  const eventsList = document.getElementById('events-list');
  const eventForm = document.getElementById('event-form');
  const dateFilter = document.getElementById('date-filter');
  const employeeFilter = document.getElementById('employee-filter');
  const applyFiltersBtn = document.getElementById('apply-filters');

  let allEvents = []; // Przechowuje wszystkie zdarzenia

  function fetchEvents() {
    fetch('/api/events')
      .then(response => {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(events => {
        allEvents = events; // Zapisz wszystkie zdarzenia
        populateEmployeeFilter(events);
        applyFilters(); // Zastosuj filtry po załadowaniu wydarzeń
      })
      .catch(error => console.error('Error:', error));
  }

  function renderEvents(events) {
    eventsList.innerHTML = events.map(event => `
      <tr>
        <td>${event.event_id}</td>
        <td>${event.machinenumber}</td>
        <td>${event.enrollnumber}</td>
        <td>${event.nick || 'N/A'}</td>
        <td><span class="badge bg-${event.in_out === 2 ? 'success' : 'danger'}">${event.in_out === 2 ? 'We' : 'Wy'}</span></td>
        <td>${new Date(event.event_date).toLocaleDateString()}</td>
        <td>${event.event_time}</td>
        ${isAdmin ? `<td>
          <button class="btn btn-danger btn-sm delete-event" data-id="${event.event_id}">Delete</button>
        </td>` : ''}
      </tr>
    `).join('');

    if (isAdmin) {
      document.querySelectorAll('.delete-event').forEach(button => {
        button.addEventListener('click', deleteEvent);
      });
    }
  }

  function populateEmployeeFilter(events) {
    const employees = [...new Set(events.map(event => event.nick).filter(nick => nick))];
    
    // Sortowanie pracowników w kolejności alfabetycznej
    employees.sort((a, b) => a.localeCompare(b));

    employeeFilter.innerHTML = '<option value="">Select Employee</option>' + // Zmieniono na "Select Employee"
      employees.map(employee => `<option value="${employee}">${employee}</option>`).join('');

    // Ustaw domyślnie pierwszy pracownik, jeśli lista nie jest pusta
    if (employees.length > 0) {
        employeeFilter.value = employees[0]; // Ustawienie wartości na pierwszego pracownika
    }
  }

  function applyFilters() {
    const selectedDate = dateFilter.value;
    const selectedEmployee = employeeFilter.value;

    const filteredEvents = allEvents.filter(event => {
      const dateMatch = !selectedDate || event.event_date.startsWith(selectedDate);
      const employeeMatch = !selectedEmployee || event.nick === selectedEmployee;
      return dateMatch && employeeMatch;
    });

    renderEvents(filteredEvents);
  }

  applyFiltersBtn.addEventListener('click', applyFilters);

  function deleteEvent(e) {
    if (!isAdmin) return;
    const eventId = e.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this event?')) {
      fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
        fetchEvents(); // Odśwież listę po usunięciu
      })
      .catch(error => console.error('Error:', error));
    }
  }

  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!isAdmin) return;
      const formData = new FormData(eventForm);
      const eventData = Object.fromEntries(formData.entries());

      // Konwertuj datę na format ISO string
      eventData.event_date = new Date(eventData.event_date).toISOString().split('T')[0];
      
      // Upewnij się, że in_out jest liczbą
      eventData.in_out = parseInt(eventData.in_out);

      fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(() => {
          fetchEvents();
          eventForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });
  }

  fetchEvents();
});
