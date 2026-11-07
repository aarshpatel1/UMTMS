import { ENTITIES_CONFIG } from '../config/routesConfig.js'

// Mutable in-memory fallback store initialized per entity to provide instant local reactivity
const fallbackStore = {}

function getLocalStore(entityKey) {
  if (!fallbackStore[entityKey]) {
    const config = ENTITIES_CONFIG[entityKey]
    fallbackStore[entityKey] = config?.fallbackData ? JSON.parse(JSON.stringify(config.fallbackData)) : []
  }
  return fallbackStore[entityKey]
}

/**
 * Universal API fetcher for all UMTMS endpoints
 * Fetches from the backend and provides graceful fallback to preview data if the server is offline.
 */
export async function fetchEntityRecords(entityKey) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) {
    throw new Error(`Unknown entity: ${entityKey}`)
  }

  const endpoint = config.endpoint

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json = await response.json()

    if (json && Array.isArray(json.data)) {
      // Update local store with fresh server data
      fallbackStore[entityKey] = JSON.parse(JSON.stringify(json.data))
      return {
        data: json.data,
        isFallback: false,
        source: 'server',
      }
    } else if (Array.isArray(json)) {
      fallbackStore[entityKey] = JSON.parse(JSON.stringify(json))
      return {
        data: json,
        isFallback: false,
        source: 'server',
      }
    } else {
      throw new Error('Unexpected response format from server')
    }
  } catch (err) {
    console.warn(`API call to ${endpoint} failed (${err.message}). Using preview fallback data.`)
    return {
      data: getLocalStore(entityKey),
      isFallback: true,
      source: 'offline-preview',
      errorMessage: err.message,
    }
  }
}

/**
 * Fetch a single record by its entity key and ID.
 */
export async function fetchRecordById(entityKey, id) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) {
    throw new Error(`Unknown entity: ${entityKey}`)
  }

  const endpoint = `${config.endpoint}/${id}`

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      if (json && json.data) {
        return { data: json.data, source: 'server', isFallback: false }
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch record from ${endpoint}:`, err.message)
  }

  // Fallback: search in local store
  const store = getLocalStore(entityKey)
  const matched = store.find((item) => String(item[config.primaryKey]) === String(id))

  if (matched) {
    return { data: matched, source: 'offline-preview', isFallback: true }
  }

  // Synthetic preview if not found
  const synthetic = { [config.primaryKey]: id }
  config.columns.forEach((col) => {
    if (synthetic[col.key] === undefined) {
      synthetic[col.key] = col.key.endsWith('_id') ? 1 : `Demo ${col.label}`
    }
  })

  return { data: synthetic, source: 'offline-preview', isFallback: true }
}

/**
 * CREATE a new record
 */
export async function createEntityRecord(entityKey, payload) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) throw new Error(`Unknown entity: ${entityKey}`)

  const endpoint = config.endpoint

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(json?.message || `HTTP ${response.status}: Failed to create record`)
      error.status = response.status
      error.errors = json?.errors || {}
      throw error
    }

    const createdRecord = json?.data || payload
    // Update local store
    const store = getLocalStore(entityKey)
    store.unshift(createdRecord)

    return {
      success: true,
      data: createdRecord,
      message: json?.message || 'Record created successfully',
      isFallback: false,
    }
  } catch (err) {
    // If it's a backend validation error (has status or errors object), rethrow so UI can highlight fields!
    if (err.errors && Object.keys(err.errors).length > 0) {
      throw err
    }

    console.warn(`Server unreachable for create on ${endpoint}. Simulating locally.`, err.message)
    const store = getLocalStore(entityKey)
    const newRecord = { ...payload }

    // Auto-generate primary key if not provided
    if (!newRecord[config.primaryKey]) {
      const maxId = store.reduce((max, item) => {
        const val = Number(item[config.primaryKey])
        return !isNaN(val) && val > max ? val : max
      }, 100)
      newRecord[config.primaryKey] = maxId + 1
    }

    store.unshift(newRecord)
    return {
      success: true,
      data: newRecord,
      message: 'Record created locally (offline preview)',
      isFallback: true,
    }
  }
}

/**
 * UPDATE an existing record
 */
export async function updateEntityRecord(entityKey, id, payload) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) throw new Error(`Unknown entity: ${entityKey}`)

  const endpoint = `${config.endpoint}/${id}`

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(json?.message || `HTTP ${response.status}: Failed to update record`)
      error.status = response.status
      error.errors = json?.errors || {}
      throw error
    }

    const updatedRecord = json?.data || { ...payload, [config.primaryKey]: id }
    // Update in local store
    const store = getLocalStore(entityKey)
    const idx = store.findIndex((item) => String(item[config.primaryKey]) === String(id))
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...updatedRecord }
    }

    return {
      success: true,
      data: updatedRecord,
      message: json?.message || 'Record updated successfully',
      isFallback: false,
    }
  } catch (err) {
    // If it's a backend validation error, rethrow so UI can highlight fields!
    if (err.errors && Object.keys(err.errors).length > 0) {
      throw err
    }

    console.warn(`Server unreachable for update on ${endpoint}. Simulating locally.`, err.message)
    const store = getLocalStore(entityKey)
    const idx = store.findIndex((item) => String(item[config.primaryKey]) === String(id))
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...payload }
      return {
        success: true,
        data: store[idx],
        message: 'Record updated locally (offline preview)',
        isFallback: true,
      }
    }
    throw new Error('Record not found')
  }
}

/**
 * DELETE a single record
 */
export async function deleteEntityRecord(entityKey, id) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) throw new Error(`Unknown entity: ${entityKey}`)

  const endpoint = `${config.endpoint}/${id}`

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })

    const json = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(json?.message || `HTTP ${response.status}: Failed to delete record`)
      error.status = response.status
      error.errors = json?.errors || {}
      throw error
    }

    // Remove from local store
    const store = getLocalStore(entityKey)
    const idx = store.findIndex((item) => String(item[config.primaryKey]) === String(id))
    if (idx !== -1) {
      store.splice(idx, 1)
    }

    return {
      success: true,
      message: json?.message || 'Record deleted successfully',
      isFallback: false,
    }
  } catch (err) {
    if (err.status && err.status >= 400) {
      throw err
    }
    console.warn(`Server unreachable for delete on ${endpoint}. Simulating locally.`, err.message)
    const store = getLocalStore(entityKey)
    const idx = store.findIndex((item) => String(item[config.primaryKey]) === String(id))
    if (idx !== -1) {
      store.splice(idx, 1)
    }
    return {
      success: true,
      message: 'Record deleted locally (offline preview)',
      isFallback: true,
    }
  }
}

/**
 * DELETE multiple records in batch
 */
export async function deleteMultipleEntityRecords(entityKey, ids) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) throw new Error(`Unknown entity: ${entityKey}`)

  if (!ids || ids.length === 0) {
    return { success: true, count: 0 }
  }

  const endpoint = `${config.endpoint}/batch-delete`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ids }),
    })

    const json = await response.json().catch(() => null)

    if (!response.ok) {
      // If batch endpoint not found, fall back to individual deletes
      if (response.status === 404) {
        await Promise.all(ids.map((id) => deleteEntityRecord(entityKey, id)))
        return {
          success: true,
          count: ids.length,
          message: `${ids.length} records deleted`,
          isFallback: false,
        }
      }
      const error = new Error(json?.message || `HTTP ${response.status}: Failed to delete records`)
      error.status = response.status
      error.errors = json?.errors || {}
      throw error
    }

    // Remove from local store
    const idSet = new Set(ids.map(String))
    fallbackStore[entityKey] = getLocalStore(entityKey).filter(
      (item) => !idSet.has(String(item[config.primaryKey]))
    )

    return {
      success: true,
      count: json?.count || ids.length,
      message: json?.message || `${ids.length} records deleted successfully`,
      isFallback: false,
    }
  } catch (err) {
    if (err.status && err.status >= 400) {
      throw err
    }
    console.warn(`Server unreachable for batch delete on ${endpoint}. Simulating locally.`, err.message)
    const idSet = new Set(ids.map(String))
    fallbackStore[entityKey] = getLocalStore(entityKey).filter(
      (item) => !idSet.has(String(item[config.primaryKey]))
    )
    return {
      success: true,
      count: ids.length,
      message: `${ids.length} records deleted locally (offline preview)`,
      isFallback: true,
    }
  }
}

/**
 * Fetch Full Database Summary for Dashboard
 */
export async function fetchDashboardSummary() {
  try {
    const response = await fetch('/api/dashboard/summary', {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json = await response.json()
    if (json && json.success) {
      return {
        data: json,
        isFallback: false,
        source: 'server',
      }
    }
    throw new Error('Invalid dashboard payload format')
  } catch (err) {
    console.warn('Dashboard summary fetch failed, generating fallback summary:', err.message)
    return {
      data: generateFallbackDashboardSummary(),
      isFallback: true,
      source: 'offline-preview',
      errorMessage: err.message,
    }
  }
}

function generateFallbackDashboardSummary() {
  const tablesMeta = [
    { key: 'public-transits', table: 'umtms.public_transit', label: 'Public Transits', category: 'Transit & Passenger', icon: 'bi-train-front', path: '/public-transits', count: 100 },
    { key: 'rail-tracks', table: 'umtms.rail_track', label: 'Rail Tracks', category: 'Transit & Passenger', icon: 'bi-signpost-split', path: '/rail-tracks', count: 100 },
    { key: 'trains', table: 'umtms.train', label: 'Trains', category: 'Transit & Passenger', icon: 'bi-train-lightrail-front', path: '/trains', count: 100 },
    { key: 'buses', table: 'umtms.bus', label: 'Buses', category: 'Transit & Passenger', icon: 'bi-bus-front', path: '/buses', count: 100 },
    { key: 'transit-schedules', table: 'umtms.transit_schedule', label: 'Transit Schedules', category: 'Transit & Passenger', icon: 'bi-calendar3', path: '/transit-schedules', count: 100 },
    { key: 'passengers', table: 'umtms.passenger', label: 'Passengers', category: 'Transit & Passenger', icon: 'bi-people', path: '/passengers', count: 98 },
    { key: 'traffic-authorities', table: 'umtms.traffic_authority', label: 'Traffic Authorities', category: 'Traffic & Enforcement', icon: 'bi-shield-check', path: '/traffic-authorities', count: 100 },
    { key: 'traffic-violations', table: 'umtms.traffic_violation', label: 'Traffic Violations', category: 'Traffic & Enforcement', icon: 'bi-exclamation-triangle', path: '/traffic-violations', count: 100 },
    { key: 'traffic-signals', table: 'umtms.traffic_signal', label: 'Traffic Signals', category: 'Traffic & Enforcement', icon: 'bi-traffic-light', path: '/traffic-signals', count: 100 },
    { key: 'commits', table: 'umtms.commits', label: 'Commits (Violations)', category: 'Traffic & Enforcement', icon: 'bi-journal-check', path: '/commits', count: 100 },
    { key: 'monitored-in', table: 'umtms.monitored_in', label: 'Monitored In', category: 'Traffic & Enforcement', icon: 'bi-eye', path: '/monitored-in', count: 100 },
    { key: 'vehicles', table: 'umtms.vehicle', label: 'Vehicles', category: 'Vehicles & Emergency', icon: 'bi-car-front', path: '/vehicles', count: 100 },
    { key: 'emergency-vehicles', table: 'umtms.emergency_vehicle', label: 'Emergency Vehicles', category: 'Vehicles & Emergency', icon: 'bi-truck', path: '/emergency-vehicles', count: 100 },
    { key: 'emergency-responses', table: 'umtms.emergency_response', label: 'Emergency Responses', category: 'Vehicles & Emergency', icon: 'bi-activity', path: '/emergency-responses', count: 100 },
    { key: 'roads', table: 'umtms.road', label: 'Roads', category: 'Infrastructure & Sensors', icon: 'bi-signpost-2', path: '/roads', count: 100 },
    { key: 'intersections', table: 'umtms.intersection', label: 'Intersections', category: 'Infrastructure & Sensors', icon: 'bi-diagram-3', path: '/intersections', count: 100 },
    { key: 'traffic-cameras', table: 'umtms.traffic_camera', label: 'Traffic Cameras', category: 'Infrastructure & Sensors', icon: 'bi-camera-video', path: '/traffic-cameras', count: 100 },
    { key: 'road-sensors', table: 'umtms.road_sensor', label: 'Road Sensors', category: 'Infrastructure & Sensors', icon: 'bi-broadcast-pin', path: '/road-sensors', count: 100 },
    { key: 'traffic-monitoring-records', table: 'umtms.traffic_monitoring_record', label: 'Monitoring Records', category: 'Infrastructure & Sensors', icon: 'bi-speedometer2', path: '/traffic-monitoring-records', count: 100 },
    { key: 'historical-traffic-data', table: 'umtms.historical_traffic_data', label: 'Historical Data', category: 'Infrastructure & Sensors', icon: 'bi-graph-up', path: '/historical-traffic-data', count: 100 },
    { key: 'locations', table: 'umtms.location', label: 'Locations', category: 'Infrastructure & Sensors', icon: 'bi-geo-alt', path: '/locations', count: 100 },
    { key: 'city-planners', table: 'umtms.city_planner', label: 'City Planners', category: 'Infrastructure & Sensors', icon: 'bi-person-badge', path: '/city-planners', count: 100 },
  ]

  return {
    success: true,
    timestamp: new Date().toISOString(),
    totalDatabaseRecords: 2198,
    kpis: {
      totalRecords: 2198,
      totalVehicles: 100,
      violations: {
        totalCount: 100,
        totalAmount: 162500,
        paidAmount: 53750,
        pendingAmount: 54750,
        unpaidAmount: 54000,
        recoveryRate: '33.1',
      },
      infrastructure: {
        totalSignals: 100,
        activeSignals: 34,
        totalCameras: 100,
        activeCameras: 34,
        totalSensors: 100,
        activeSensors: 34,
        totalHardware: 300,
        totalActiveHardware: 102,
        hardwareHealthRate: '34.0',
        totalRoads: 100,
        totalIntersections: 100,
      },
      emergency: {
        totalVehicles: 100,
        statusBreakdown: { AVAILABLE: 25, DISPATCHED: 25, BUSY: 25, MAINTENANCE: 25 },
        readinessRate: '50.0',
        activeResponsesCount: 50,
      },
      transit: {
        total_buses: 100,
        bus_capacity: 5920,
        total_trains: 100,
        train_capacity: 35050,
        totalFleetCapacity: 40970,
        total_schedules: 100,
        available_tracks: 80,
        total_passengers: 294,
      },
      monitoring: {
        total_records: 100,
        avg_speed: '70.5',
        max_speed: '120.00',
        avg_volume: '100.5',
        total_volume: 10050,
      },
    },
    charts: {
      violationsByType: [
        { violation_type: 'NO_HELMET', count: 20, total_fines: 42500, avg_fine: 2125 },
        { violation_type: 'ILLEGAL_PARKING', count: 20, total_fines: 37500, avg_fine: 1875 },
        { violation_type: 'SIGNAL_JUMP', count: 20, total_fines: 32500, avg_fine: 1625 },
        { violation_type: 'OVERSPEEDING', count: 20, total_fines: 27500, avg_fine: 1375 },
        { violation_type: 'LANE_VIOLATION', count: 20, total_fines: 22500, avg_fine: 1125 },
      ],
      violationsByStatus: [
        { fine_status: 'PAID', count: 34, total_fines: 53750 },
        { fine_status: 'PENDING', count: 33, total_fines: 54750 },
        { fine_status: 'UNPAID', count: 33, total_fines: 54000 },
      ],
      vehiclesByType: [
        { vehicle_type: 'CAR', count: 20 },
        { vehicle_type: 'TRUCK', count: 20 },
        { vehicle_type: 'BUS', count: 20 },
        { vehicle_type: 'VAN', count: 20 },
        { vehicle_type: 'MOTORCYCLE', count: 20 },
      ],
      roadTypes: [
        { road_type: 'HIGHWAY', count: 25 },
        { road_type: 'ARTERIAL', count: 25 },
        { road_type: 'LOCAL', count: 25 },
        { road_type: 'COLLECTOR', count: 25 },
      ],
      trafficPatterns: [
        { traffic_pattern: 'CONGESTED', count: 25 },
        { traffic_pattern: 'HEAVY', count: 25 },
        { traffic_pattern: 'MODERATE', count: 25 },
        { traffic_pattern: 'LOW', count: 25 },
      ],
      emergencyVehicles: [
        { vehicle_type: 'AMBULANCE', status: 'AVAILABLE', count: 9 },
        { vehicle_type: 'FIRE_ENGINE', status: 'AVAILABLE', count: 8 },
        { vehicle_type: 'POLICE_VAN', status: 'AVAILABLE', count: 8 },
        { vehicle_type: 'AMBULANCE', status: 'DISPATCHED', count: 8 },
      ],
      emergencyResponses: [
        { response_status: 'OPEN', count: 25 },
        { response_status: 'IN_PROGRESS', count: 25 },
        { response_status: 'COMPLETED', count: 25 },
        { response_status: 'CANCELLED', count: 25 },
      ],
      monitoringTimeline: [
        { record_id: 1, vehicle_speed: 45, traffic_volume: 80 },
        { record_id: 2, vehicle_speed: 65, traffic_volume: 110 },
        { record_id: 3, vehicle_speed: 90, traffic_volume: 135 },
        { record_id: 4, vehicle_speed: 75, traffic_volume: 95 },
        { record_id: 5, vehicle_speed: 110, traffic_volume: 150 },
      ],
    },
    topRecords: {
      violations: [
        { violation_id: 9, violation_type: 'NO_HELMET', fine_amount: 2750, fine_status: 'PENDING', registration_number: 'GJ19AB1009', authority_name: 'Traffic Authority 9', violation_date: '2026-01-09' },
        { violation_id: 14, violation_type: 'NO_HELMET', fine_amount: 2600, fine_status: 'PAID', registration_number: 'GJ14AB1014', authority_name: 'Traffic Authority 14', violation_date: '2026-01-14' },
        { violation_id: 3, violation_type: 'SIGNAL_JUMP', fine_amount: 2500, fine_status: 'UNPAID', registration_number: 'GJ03AB1003', authority_name: 'Traffic Authority 3', violation_date: '2026-01-03' },
        { violation_id: 1, violation_type: 'OVERSPEEDING', fine_amount: 2400, fine_status: 'PAID', registration_number: 'GJ01AB1001', authority_name: 'Traffic Authority 1', violation_date: '2026-01-01' },
      ],
      monitoring: [
        { record_id: 100, road_name: 'Road 100', road_type: 'HIGHWAY', traffic_volume: 150, vehicle_speed: '120.00', sensor_type: 'INDUCTIVE', camera_type: 'THERMAL', timestamp: '2026-01-02T01:30:00.000Z' },
        { record_id: 95, road_name: 'Road 95', road_type: 'ARTERIAL', traffic_volume: 145, vehicle_speed: '105.00', sensor_type: 'LOOP', camera_type: 'ANPR', timestamp: '2026-01-02T01:15:00.000Z' },
        { record_id: 88, road_name: 'Road 88', road_type: 'HIGHWAY', traffic_volume: 140, vehicle_speed: '115.00', sensor_type: 'RADAR', camera_type: 'CCTV', timestamp: '2026-01-02T01:00:00.000Z' },
      ],
      emergencies: [
        { response_id: 1, response_status: 'OPEN', emergency_id: 1, vehicle_type: 'AMBULANCE', vehicle_status: 'AVAILABLE', latitude: '23.0225', longitude: '72.5714' },
        { response_id: 2, response_status: 'IN_PROGRESS', emergency_id: 2, vehicle_type: 'FIRE_ENGINE', vehicle_status: 'DISPATCHED', latitude: '23.0335', longitude: '72.5850' },
      ],
      transit: [
        { transit_unit_id: 1, identifier: 'Route R-001', capacity: 65, type: 'Bus', departure_time: '08:00:00', arrival_time: '09:00:00' },
        { transit_unit_id: 2, identifier: 'Route R-002', capacity: 60, type: 'Bus', departure_time: '08:30:00', arrival_time: '09:30:00' },
      ],
    },
    tablesSummary: tablesMeta,
  }
}

