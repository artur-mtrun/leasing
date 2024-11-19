-- Ustawienie parametrów dla dużych operacji
SET work_mem = '1GB';
SET maintenance_work_mem = '2GB';

-- Rozpoczęcie transakcji
BEGIN;

-- Tworzenie tymczasowej tabeli dla nowych rekordów
CREATE TEMP TABLE new_events AS
SELECT DISTINCT 
    ae.machinenumber, 
    ae.enrollnumber, 
    ae.in_out, 
    ae.event_date, 
    ae.event_time,
    ae.event_id,
    CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as "createdAt",
    CURRENT_TIMESTAMP AT TIME ZONE 'UTC' as "updatedAt"
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
LIMIT 100000; -- Przetwarzanie porcjami po 100k rekordów

-- Utworzenie indeksu na tabeli tymczasowej dla lepszej wydajności
CREATE INDEX idx_temp_events ON new_events (enrollnumber, in_out, event_date, event_time);

-- Wstawienie nowych rekordów
INSERT INTO events (
    machinenumber, 
    enrollnumber, 
    in_out, 
    event_date, 
    event_time,
    "createdAt",
    "updatedAt"
)
SELECT 
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
LIMIT 100000;

-- Aktualizacja statusu przetworzonych rekordów
UPDATE all_events ae
SET indb = 666
WHERE event_id IN (SELECT event_id FROM new_events);

-- Zapisanie zmian
COMMIT;

-- Usunięcie tymczasowej tabeli
DROP TABLE new_events; 