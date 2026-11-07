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
