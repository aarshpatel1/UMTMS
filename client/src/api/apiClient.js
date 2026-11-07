import { ENTITIES_CONFIG } from '../config/routesConfig'

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
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json = await response.json()

    if (json && Array.isArray(json.data)) {
      return {
        data: json.data,
        isFallback: false,
        source: 'server',
      }
    } else if (Array.isArray(json)) {
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
      data: config.fallbackData || [],
      isFallback: true,
      source: 'offline-preview',
      errorMessage: err.message,
    }
  }
}

/**
 * Fetch a single record by its entity key and ID.
 * Supports online backend lookup with graceful fallback to local data.
 */
export async function fetchRecordById(entityKey, id) {
  const config = ENTITIES_CONFIG[entityKey]
  if (!config) {
    throw new Error(`Unknown entity: ${entityKey}`)
  }

  const endpoint = `${config.endpoint}/${id}`

  try {
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
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

  // Fallback: search in config.fallbackData
  const matched = config.fallbackData?.find(
    (item) => String(item[config.primaryKey]) === String(id)
  )

  if (matched) {
    return { data: matched, source: 'offline-preview', isFallback: true }
  }

  // Synthetic preview if not found in mock array
  const synthetic = { [config.primaryKey]: id }
  config.columns.forEach((col) => {
    if (synthetic[col.key] === undefined) {
      synthetic[col.key] = col.key.endsWith('_id') ? 1 : `Demo ${col.label}`
    }
  })

  return { data: synthetic, source: 'offline-preview', isFallback: true }
}
