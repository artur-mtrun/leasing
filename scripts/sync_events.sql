-- Ustawienie parametrów dla dużych operacji
SET work_mem = '1GB';
SET maintenance_work_mem = '2GB';

-- Rozpoczęcie transakcji
BEGIN;

-- Sprawdzenie liczby rekordów przed synchronizacją
SELECT COUNT(*) as records_before FROM events;
SELECT COUNT(*) as records_to_sync FROM all_events WHERE indb != 666;

-- Wstawienie nowych rekordów bezpośrednio (bez tabeli tymczasowej)
INSERT INTO events (
    machinenumber, 
    enrollnumber, 
    in_out, 
    event_date, 
    event_time,
    "createdAt",
    "updatedAt"
)
SELECT DISTINCT 
    ae.machinenumber, 
    ae.enrollnumber, 
    ae.in_out, 
    ae.event_date::date, 
    ae.event_time::time,
    CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
    CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
FROM all_events ae
WHERE ae.indb != 666
AND NOT EXISTS (
    SELECT 1 
    FROM events e 
    WHERE e.enrollnumber = ae.enrollnumber 
    AND e.in_out = ae.in_out 
    AND e.event_date = ae.event_date 
    AND e.event_time = ae.event_time
)
LIMIT 1000;

-- Sprawdzenie liczby dodanych rekordów
SELECT COUNT(*) as records_after FROM events;

-- Aktualizacja statusu przetworzonych rekordów
UPDATE all_events
SET indb = 666
WHERE event_id IN (
    SELECT ae.event_id
    FROM all_events ae
    WHERE ae.indb != 666
    AND EXISTS (
        SELECT 1 
        FROM events e 
        WHERE e.enrollnumber = ae.enrollnumber 
        AND e.in_out = ae.in_out 
        AND e.event_date = ae.event_date 
        AND e.event_time = ae.event_time
    )
    LIMIT 1000
);

-- Sprawdzenie liczby zaktualizowanych rekordów
SELECT COUNT(*) as records_marked FROM all_events WHERE indb = 666;

-- Zapisanie zmian
COMMIT;