#!/bin/bash

# Konfiguracja
DB_NAME="leasing"
DB_USER="leasing"
DB_HOST="localhost"
DB_PORT="5432"
DB_PASS="Leasing_123!@#"
LOCK_FILE="/tmp/sync_events.lock"
LOG_FILE="$(dirname "$0")/sync_events.log"
BATCH_SIZE=100000

# Utworzenie katalogu na logi jeśli nie istnieje
mkdir -p "$(dirname "$LOG_FILE")"

# Funkcja logowania
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Funkcja wykonywania zapytań SQL
execute_query() {
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -c "$1"
}

# Sprawdzenie czy skrypt już nie działa
if [ -f "$LOCK_FILE" ]; then
    pid=$(cat "$LOCK_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
        log_message "Skrypt już działa (PID: $pid)"
        exit 1
    fi
fi

# Utworzenie pliku blokady
echo $$ > "$LOCK_FILE"

# Funkcja czyszcząca
cleanup() {
    rm -f "$LOCK_FILE"
    log_message "Zakończono synchronizację"
}
trap cleanup EXIT

log_message "=== Rozpoczęcie nowej synchronizacji ==="
log_message "Parametry: Batch size: $BATCH_SIZE"

# Statystyki całkowite
TOTAL_PROCESSED=0
TOTAL_ADDED=0
TOTAL_BATCHES=0

# Pętla przetwarzająca rekordy
while true; do
    # Sprawdzenie liczby rekordów do przetworzenia
    RECORDS_TO_PROCESS=$(execute_query "
        SELECT COUNT(*) 
        FROM all_events 
        WHERE indb != 666
    ")

    if [ "$RECORDS_TO_PROCESS" -eq 0 ]; then
        log_message "Brak rekordów do przetworzenia"
        break
    fi

    TOTAL_BATCHES=$((TOTAL_BATCHES + 1))
    log_message "Batch #$TOTAL_BATCHES - Znaleziono $RECORDS_TO_PROCESS rekordów do przetworzenia"

    # Pobranie statystyk przed synchronizacją
    EVENTS_BEFORE=$(execute_query "SELECT COUNT(*) FROM events")
    
    # Wywołanie skryptu SQL
    START_TIME=$(date +%s)
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/sync_events.sql" >> "$LOG_FILE" 2>&1
    SYNC_STATUS=$?
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    if [ $SYNC_STATUS -eq 0 ]; then
        # Pobranie statystyk po synchronizacji
        EVENTS_AFTER=$(execute_query "SELECT COUNT(*) FROM events")
        RECORDS_ADDED=$((EVENTS_AFTER - EVENTS_BEFORE))
        RECORDS_PROCESSED=$BATCH_SIZE
        RECORDS_SKIPPED=$((RECORDS_PROCESSED - RECORDS_ADDED))
        
        TOTAL_ADDED=$((TOTAL_ADDED + RECORDS_ADDED))
        TOTAL_PROCESSED=$((TOTAL_PROCESSED + RECORDS_PROCESSED))

        log_message "Batch #$TOTAL_BATCHES - Statystyki:"
        log_message "  - Czas wykonania: ${DURATION}s"
        log_message "  - Przetworzone rekordy: $RECORDS_PROCESSED"
        log_message "  - Dodane rekordy: $RECORDS_ADDED"
        log_message "  - Pominięte (duplikaty): $RECORDS_SKIPPED"
        log_message "  - Szybkość: $(( RECORDS_PROCESSED / (DURATION + 1) )) rekordów/s"
    else
        log_message "Błąd podczas synchronizacji (Batch #$TOTAL_BATCHES)"
        log_message "Sprawdź logi powyżej dla szczegółów błędu"
        exit 1
    fi

    sleep 1
done

# Podsumowanie końcowe
log_message ""
log_message "=== Podsumowanie synchronizacji ==="
log_message "Całkowita liczba przetworzonych partii: $TOTAL_BATCHES"
log_message "Całkowita liczba przetworzonych rekordów: $TOTAL_PROCESSED"
log_message "Całkowita liczba dodanych rekordów: $TOTAL_ADDED"
log_message "Całkowita liczba pominiętych rekordów: $((TOTAL_PROCESSED - TOTAL_ADDED))"
log_message "Średnia liczba rekordów na partię: $((TOTAL_PROCESSED / TOTAL_BATCHES))" 