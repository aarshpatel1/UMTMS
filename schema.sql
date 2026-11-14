BEGIN;

-- 1. RESET SCHEMA
DROP SCHEMA IF EXISTS umtms CASCADE;
CREATE SCHEMA umtms;
SET search_path TO umtms;

-- 2. CREATE TABLES
CREATE TABLE public_transit (
    transit_id   INTEGER PRIMARY KEY,
    transit_type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_transit_type CHECK (TRIM(transit_type) <> '')
);

CREATE TABLE rail_track (
    track_id     INTEGER PRIMARY KEY,
    track_number VARCHAR(20) NOT NULL,
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_track_number CHECK (TRIM(track_number) <> '')
);

CREATE TABLE road (
    road_id   INTEGER PRIMARY KEY,
    road_name VARCHAR(100) NOT NULL,
    road_type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_road_name CHECK (TRIM(road_name) <> '')
);

CREATE TABLE location (
    location_id INTEGER PRIMARY KEY,
    latitude    NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude   NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE city_planner (
    planner_id INTEGER PRIMARY KEY,
    name       VARCHAR(100) NOT NULL CHECK (TRIM(name) <> ''),
    department VARCHAR(100) NOT NULL
);

CREATE TABLE traffic_authority (
    authority_id INTEGER PRIMARY KEY,
    name         VARCHAR(100) NOT NULL CHECK (TRIM(name) <> ''),
    office       VARCHAR(100) NOT NULL
);

CREATE TABLE vehicle (
    vehicle_id          INTEGER PRIMARY KEY,
    registration_number VARCHAR(30) NOT NULL UNIQUE
                        CHECK (TRIM(registration_number) <> ''),
    vehicle_type        VARCHAR(50) NOT NULL
);

CREATE TABLE bus (
    bus_id       INTEGER PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL CHECK (TRIM(route_number) <> ''),
    capacity     INTEGER NOT NULL CHECK (capacity > 0),
    transit_id   INTEGER NOT NULL,
    CONSTRAINT fk_bus_transit FOREIGN KEY (transit_id)
        REFERENCES public_transit(transit_id)
);

CREATE TABLE train (
    train_id     INTEGER PRIMARY KEY,
    train_number VARCHAR(20) NOT NULL,
    capacity     INTEGER NOT NULL CHECK (capacity > 0),
    transit_id   INTEGER NOT NULL,
    track_id     INTEGER NOT NULL,
    CONSTRAINT fk_train_transit FOREIGN KEY (transit_id)
        REFERENCES public_transit(transit_id),
    CONSTRAINT fk_train_track FOREIGN KEY (track_id)
        REFERENCES rail_track(track_id)
);

CREATE TABLE passenger (
    passenger_id    INTEGER PRIMARY KEY,
    passenger_count INTEGER NOT NULL DEFAULT 1 CHECK (passenger_count > 0),
    bus_id          INTEGER,
    train_id        INTEGER,
    CONSTRAINT fk_passenger_bus FOREIGN KEY (bus_id)
        REFERENCES bus(bus_id),
    CONSTRAINT fk_passenger_train FOREIGN KEY (train_id)
        REFERENCES train(train_id),
    CONSTRAINT chk_passenger_transport CHECK (
        (bus_id IS NOT NULL AND train_id IS NULL)
        OR (bus_id IS NULL AND train_id IS NOT NULL)
    )
);

CREATE TABLE transit_schedule (
    schedule_id    INTEGER PRIMARY KEY,
    arrival_time   TIME NOT NULL,
    departure_time TIME NOT NULL,
    bus_id         INTEGER UNIQUE,
    train_id       INTEGER UNIQUE,
    CONSTRAINT fk_schedule_bus FOREIGN KEY (bus_id)
        REFERENCES bus(bus_id),
    CONSTRAINT fk_schedule_train FOREIGN KEY (train_id)
        REFERENCES train(train_id),
    CONSTRAINT chk_schedule_transport CHECK (
        (bus_id IS NOT NULL AND train_id IS NULL)
        OR (bus_id IS NULL AND train_id IS NOT NULL)
    ),
    CONSTRAINT chk_schedule_time CHECK (arrival_time >= departure_time)
);

CREATE TABLE historical_traffic_data (
    history_id     INTEGER PRIMARY KEY,
    record_date    DATE NOT NULL,
    traffic_pattern VARCHAR(100) NOT NULL,
    planner_id     INTEGER NOT NULL,
    CONSTRAINT fk_history_planner FOREIGN KEY (planner_id)
        REFERENCES city_planner(planner_id)
);

CREATE TABLE road_sensor (
    sensor_id   INTEGER PRIMARY KEY,
    sensor_type VARCHAR(50) NOT NULL,
    status      VARCHAR(30) NOT NULL
                CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    road_id     INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_sensor_road FOREIGN KEY (road_id)
        REFERENCES road(road_id),
    CONSTRAINT fk_sensor_location FOREIGN KEY (location_id)
        REFERENCES location(location_id)
);

CREATE TABLE traffic_camera (
    camera_id   INTEGER PRIMARY KEY,
    camera_type VARCHAR(50) NOT NULL,
    status      VARCHAR(30) NOT NULL
                CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    source_id   VARCHAR(50),
    road_id     INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_camera_road FOREIGN KEY (road_id)
        REFERENCES road(road_id),
    CONSTRAINT fk_camera_location FOREIGN KEY (location_id)
        REFERENCES location(location_id)
);

CREATE TABLE traffic_signal (
    signal_id      INTEGER PRIMARY KEY,
    timing_pattern VARCHAR(100) NOT NULL,
    status         VARCHAR(30) NOT NULL
                   CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    authority_id   INTEGER NOT NULL,
    CONSTRAINT fk_signal_authority FOREIGN KEY (authority_id)
        REFERENCES traffic_authority(authority_id)
);

CREATE TABLE intersection (
    intersection_id   INTEGER PRIMARY KEY,
    intersection_name VARCHAR(100) NOT NULL,
    status            VARCHAR(30) NOT NULL
                      CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    road_id           INTEGER NOT NULL,
    location_id       INTEGER NOT NULL,
    signal_id         INTEGER,
    CONSTRAINT fk_intersection_road FOREIGN KEY (road_id)
        REFERENCES road(road_id),
    CONSTRAINT fk_intersection_location FOREIGN KEY (location_id)
        REFERENCES location(location_id),
    CONSTRAINT fk_intersection_signal FOREIGN KEY (signal_id)
        REFERENCES traffic_signal(signal_id)
);

CREATE TABLE emergency_vehicle (
    emergency_vehicle_id INTEGER PRIMARY KEY,
    vehicle_type         VARCHAR(50) NOT NULL,
    status               VARCHAR(30) NOT NULL
                         CHECK (status IN ('AVAILABLE', 'DISPATCHED', 'BUSY', 'MAINTENANCE')),
    location_id          INTEGER NOT NULL,
    signal_id            INTEGER,
    CONSTRAINT fk_emergency_location FOREIGN KEY (location_id)
        REFERENCES location(location_id),
    CONSTRAINT fk_emergency_signal FOREIGN KEY (signal_id)
        REFERENCES traffic_signal(signal_id)
);

CREATE TABLE emergency_response (
    response_id     INTEGER PRIMARY KEY,
    response_status VARCHAR(50) NOT NULL,
    emergency_id    INTEGER NOT NULL,
    CONSTRAINT fk_response_emergency FOREIGN KEY (emergency_id)
        REFERENCES emergency_vehicle(emergency_vehicle_id)
);

CREATE TABLE traffic_violation (
    violation_id   INTEGER PRIMARY KEY,
    violation_type VARCHAR(100) NOT NULL,
    violation_date DATE NOT NULL,
    violation_time TIME NOT NULL,
    fine_status    VARCHAR(30) NOT NULL
                   CHECK (fine_status IN ('PAID', 'UNPAID', 'PENDING')),
    fine_amount    NUMERIC(10,2) NOT NULL CHECK (fine_amount >= 0),
    authority_id   INTEGER NOT NULL,
    CONSTRAINT fk_violation_authority FOREIGN KEY (authority_id)
        REFERENCES traffic_authority(authority_id)
);

CREATE TABLE traffic_monitoring_record (
    record_id       INTEGER PRIMARY KEY,
    vehicle_speed   NUMERIC(7,2) NOT NULL CHECK (vehicle_speed >= 0),
    traffic_volume  INTEGER NOT NULL CHECK (traffic_volume >= 0),
    "timestamp"     TIMESTAMP NOT NULL,
    history_id      INTEGER,
    sensor_id       INTEGER,
    camera_id       INTEGER,
    road_id         INTEGER NOT NULL,
    CONSTRAINT fk_record_history FOREIGN KEY (history_id)
        REFERENCES historical_traffic_data(history_id),
    CONSTRAINT fk_record_sensor FOREIGN KEY (sensor_id)
        REFERENCES road_sensor(sensor_id),
    CONSTRAINT fk_record_camera FOREIGN KEY (camera_id)
        REFERENCES traffic_camera(camera_id),
    CONSTRAINT fk_record_road FOREIGN KEY (road_id)
        REFERENCES road(road_id)
);

CREATE TABLE commits (
    vehicle_id   INTEGER NOT NULL,
    violation_id INTEGER NOT NULL,
    PRIMARY KEY (vehicle_id, violation_id),
    CONSTRAINT fk_commits_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle(vehicle_id),
    CONSTRAINT fk_commits_violation FOREIGN KEY (violation_id)
        REFERENCES traffic_violation(violation_id)
);

CREATE TABLE monitored_in (
    vehicle_id   INTEGER NOT NULL,
    signal_id    INTEGER NOT NULL,
    violation_id INTEGER NOT NULL,
    PRIMARY KEY (vehicle_id, signal_id, violation_id),
    CONSTRAINT fk_monitored_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle(vehicle_id),
    CONSTRAINT fk_monitored_signal FOREIGN KEY (signal_id)
        REFERENCES traffic_signal(signal_id),
    CONSTRAINT fk_monitored_violation FOREIGN KEY (violation_id)
        REFERENCES traffic_violation(violation_id)
);

-- 3. INSERT SAMPLE DATA
-- Each table receives 100 rows. IDs are generated deterministically.
-- Parent rows are inserted before rows that reference them.

INSERT INTO public_transit
SELECT g, CASE WHEN g % 2 = 0 THEN 'BUS_TRANSIT' ELSE 'RAIL_TRANSIT' END
FROM generate_series(1,100) AS g;

INSERT INTO rail_track
SELECT g, 'TRK-' || LPAD(g::text,3,'0'), (g % 5 <> 0)
FROM generate_series(1,100) AS g;

INSERT INTO road
SELECT g, 'Road ' || g,
       (ARRAY['ARTERIAL','COLLECTOR','LOCAL','HIGHWAY'])[1 + ((g-1) % 4)]
FROM generate_series(1,100) AS g;

INSERT INTO location
SELECT g,
       ROUND((-89.0 + (g * 1.7))::numeric, 6),
       ROUND((-179.0 + (g * 3.5))::numeric, 6)
FROM generate_series(1,100) AS g;

INSERT INTO city_planner
SELECT g, 'Planner ' || g,
       (ARRAY['Urban Planning','Traffic Engineering','Transport Planning'])[1 + ((g-1) % 3)]
FROM generate_series(1,100) AS g;

INSERT INTO traffic_authority
SELECT g, 'Traffic Authority ' || g, 'Regional Office ' || g
FROM generate_series(1,100) AS g;

INSERT INTO vehicle
SELECT g, 'GJ' || LPAD((10 + (g % 80))::text,2,'0') || 'AB' ||
          LPAD((1000 + g)::text,4,'0'),
       (ARRAY['CAR','BUS','TRUCK','MOTORCYCLE','VAN'])[1 + ((g-1) % 5)]
FROM generate_series(1,100) AS g;

INSERT INTO bus
SELECT g, 'R-' || LPAD(g::text,3,'0'), 30 + (g % 71), g
FROM generate_series(1,100) AS g;

INSERT INTO train
SELECT g, 'TN-' || LPAD(g::text,3,'0'), 300 + (g % 701), g, g
FROM generate_series(1,100) AS g;

INSERT INTO passenger
SELECT g, 1 + (g % 5),
       CASE WHEN g % 2 = 0 THEN g ELSE NULL END,
       CASE WHEN g % 2 = 1 THEN g ELSE NULL END
FROM generate_series(1,100) AS g;

-- The original check requires arrival_time >= departure_time.
-- Each row is assigned to either a bus or a train, not both.
INSERT INTO transit_schedule
SELECT g,
       TIME '08:00:00' + (g % 8) * INTERVAL '1 hour',
       TIME '07:00:00' + (g % 8) * INTERVAL '1 hour',
       CASE WHEN g % 2 = 0 THEN g ELSE NULL END,
       CASE WHEN g % 2 = 1 THEN g ELSE NULL END
FROM generate_series(1,100) AS g;

INSERT INTO historical_traffic_data
SELECT g, DATE '2026-01-01' + (g % 280),
       (ARRAY['LOW','MODERATE','HEAVY','CONGESTED'])[1 + ((g-1) % 4)],
       g
FROM generate_series(1,100) AS g;

INSERT INTO road_sensor
SELECT g,
       (ARRAY['LOOP','RADAR','INFRARED','INDUCTIVE'])[1 + ((g-1) % 4)],
       (ARRAY['ACTIVE','INACTIVE','MAINTENANCE'])[1 + ((g-1) % 3)],
       g, g
FROM generate_series(1,100) AS g;

INSERT INTO traffic_camera
SELECT g,
       (ARRAY['CCTV','ANPR','PTZ','THERMAL'])[1 + ((g-1) % 4)],
       (ARRAY['ACTIVE','INACTIVE','MAINTENANCE'])[1 + ((g-1) % 3)],
       'SRC-' || LPAD(g::text,3,'0'), g, g
FROM generate_series(1,100) AS g;

INSERT INTO traffic_signal
SELECT g,
       (ARRAY['30-30-10','40-20-10','45-25-10','FIXED-60'])[1 + ((g-1) % 4)],
       (ARRAY['ACTIVE','INACTIVE','MAINTENANCE'])[1 + ((g-1) % 3)],
       g
FROM generate_series(1,100) AS g;

INSERT INTO intersection
SELECT g, 'Intersection ' || g,
       (ARRAY['ACTIVE','INACTIVE','MAINTENANCE'])[1 + ((g-1) % 3)],
       g, g, g
FROM generate_series(1,100) AS g;

INSERT INTO emergency_vehicle
SELECT g,
       (ARRAY['AMBULANCE','FIRE_ENGINE','POLICE_VAN'])[1 + ((g-1) % 3)],
       (ARRAY['AVAILABLE','DISPATCHED','BUSY','MAINTENANCE'])[1 + ((g-1) % 4)],
       g, g
FROM generate_series(1,100) AS g;

INSERT INTO emergency_response
SELECT g,
       (ARRAY['OPEN','IN_PROGRESS','COMPLETED','CANCELLED'])[1 + ((g-1) % 4)],
       g
FROM generate_series(1,100) AS g;

INSERT INTO traffic_violation
SELECT g,
       (ARRAY['OVERSPEEDING','SIGNAL_JUMP','ILLEGAL_PARKING','NO_HELMET','LANE_VIOLATION'])[1 + ((g-1) % 5)],
       DATE '2026-01-01' + (g % 280),
       TIME '08:00:00' + (g % 12) * INTERVAL '1 hour',
       (ARRAY['PAID','UNPAID','PENDING'])[1 + ((g-1) % 3)],
       (500 + (g % 10) * 250)::numeric(10,2),
       g
FROM generate_series(1,100) AS g;

INSERT INTO traffic_monitoring_record
SELECT g,
       (20 + (g % 101))::numeric(7,2),
       50 + (g % 950),
       TIMESTAMP '2026-01-01 06:00:00' + g * INTERVAL '15 minutes',
       g, g, g, g
FROM generate_series(1,100) AS g;

INSERT INTO commits
SELECT g, g
FROM generate_series(1,100) AS g;

INSERT INTO monitored_in
SELECT g, g, g
FROM generate_series(1,100) AS g;

COMMIT;



-- SELECT * FROM umtms.public_transit ORDER BY transit_id;
-- SELECT * FROM umtms.bus ORDER BY bus_id;
-- SELECT * FROM umtms.train ORDER BY train_id;
-- SELECT * FROM umtms.passenger ORDER BY passenger_id;
-- SELECT * FROM umtms.transit_schedule ORDER BY schedule_id;
-- SELECT * FROM umtms.rail_track ORDER BY track_id;
-- SELECT * FROM umtms.city_planner ORDER BY planner_id;
-- SELECT * FROM umtms.historical_traffic_data ORDER BY history_id;
-- SELECT * FROM umtms.traffic_monitoring_record ORDER BY record_id;
-- SELECT * FROM umtms.road ORDER BY road_id;
-- SELECT * FROM umtms.road_sensor ORDER BY sensor_id;
-- SELECT * FROM umtms.traffic_camera ORDER BY camera_id;
-- SELECT * FROM umtms.intersection ORDER BY intersection_id;
-- SELECT * FROM umtms.location ORDER BY location_id;
-- SELECT * FROM umtms.emergency_response ORDER BY response_id;
-- SELECT * FROM umtms.emergency_vehicle ORDER BY emergency_vehicle_id;
-- SELECT * FROM umtms.traffic_signal ORDER BY signal_id;
-- SELECT * FROM umtms.traffic_authority ORDER BY authority_id;
-- SELECT * FROM umtms.traffic_violation ORDER BY violation_id;
-- SELECT * FROM umtms.vehicle ORDER BY vehicle_id;
-- SELECT * FROM umtms.commits ORDER BY vehicle_id, violation_id;
-- SELECT * FROM umtms.monitored_in ORDER BY vehicle_id, signal_id, violation_id;
