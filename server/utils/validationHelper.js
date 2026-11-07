/**
 * Backend Validation & Database Error Parsing Helper
 * Formats database constraint violations into field-specific error messages
 * and performs pre-query data validation.
 */

export function parseDbError(error) {
  if (!error) {
    return {
      isValidation: false,
      statusCode: 500,
      message: "An unknown error occurred",
      errors: { general: "An unknown error occurred" },
    };
  }

  const errors = {};
  let message = error.message || "Database error";
  let isValidation = false;
  let statusCode = 400;

  // 1. Unique constraint violation (Postgres 23505)
  if (error.code === "23505") {
    isValidation = true;
    const detail = error.detail || "";
    const match = detail.match(/Key \((.+?)\)=\((.*?)\) already exists/);
    if (match) {
      const field = match[1];
      const val = match[2];
      const niceField = field.replace(/_/g, " ");
      errors[field] = `The ${niceField} "${val}" is already in use. Please enter a unique ${niceField}.`;
      message = `Duplicate entry for ${niceField}`;
    } else {
      errors.general = "A record with this unique identifier or value already exists.";
      message = "Duplicate entry detected";
    }
  }

  // 2. Not null constraint violation (Postgres 23502)
  else if (error.code === "23502") {
    isValidation = true;
    const field = error.column || "field";
    const niceField = field.replace(/_/g, " ");
    errors[field] = `${niceField.charAt(0).toUpperCase() + niceField.slice(1)} is required and cannot be empty.`;
    message = `Missing required field: ${niceField}`;
  }

  // 3. Foreign key constraint violation (Postgres 23503)
  else if (error.code === "23503") {
    isValidation = true;
    const detail = error.detail || "";
    const match = detail.match(/Key \((.+?)\)=\((.*?)\) is not present in table "(.+?)"/);
    if (match) {
      const field = match[1];
      const val = match[2];
      const table = match[3];
      const niceField = field.replace(/_/g, " ");
      errors[field] = `Referenced ${niceField} (#${val}) does not exist in ${table}.`;
      message = `Invalid reference: ${niceField} #${val} not found`;
    } else {
      errors.general = "Referenced foreign record does not exist.";
      message = "Foreign key reference error";
    }
  }

  // 4. Invalid text representation / numeric syntax (Postgres 22P02)
  else if (error.code === "22P02") {
    isValidation = true;
    errors.general = "Invalid data format or numeric value provided.";
    message = "Invalid format: please ensure numbers and identifiers are valid.";
  }

  // 5. Datetime format violation (Postgres 22007 / 22008)
  else if (error.code === "22007" || error.code === "22008") {
    isValidation = true;
    errors.general = "Invalid date or time format provided.";
    message = "Invalid date/time format";
  }

  // 6. Value too long (Postgres 22001)
  else if (error.code === "22001") {
    isValidation = true;
    errors.general = "One of the text fields exceeds maximum allowed length.";
    message = "Text length exceeded";
  }

  // General server/DB error
  else {
    statusCode = 500;
    errors.general = error.message;
  }

  return { isValidation, statusCode, message, errors };
}

export function handleControllerError(res, error) {
  const parsed = parseDbError(error);
  return res.status(parsed.statusCode).json({
    success: false,
    message: parsed.message,
    errors: parsed.errors,
    error: error.message,
  });
}

/**
 * Pre-validation rules for all UMTMS entity schemas
 */
const ENTITY_RULES = {
  "public-transits": {
    required: ["transit_type"],
  },
  "rail-tracks": {
    required: ["track_number", "availability"],
  },
  trains: {
    required: ["train_number", "capacity", "transit_id", "track_id"],
    numeric: ["capacity", "transit_id", "track_id"],
  },
  buses: {
    required: ["route_number", "capacity", "transit_id"],
    numeric: ["capacity", "transit_id"],
  },
  "transit-schedules": {
    required: ["arrival_time", "departure_time"],
    numeric: ["bus_id", "train_id"],
  },
  passengers: {
    required: ["passenger_count"],
    numeric: ["passenger_count", "bus_id", "train_id"],
  },
  "traffic-authorities": {
    required: ["name", "office"],
  },
  "traffic-violations": {
    required: ["violation_type", "violation_date", "violation_time", "fine_status", "fine_amount", "authority_id"],
    numeric: ["fine_amount", "authority_id"],
  },
  "traffic-signals": {
    required: ["timing_pattern", "status", "authority_id"],
    numeric: ["authority_id"],
  },
  commits: {
    required: ["vehicle_id", "violation_id"],
    numeric: ["vehicle_id", "violation_id"],
  },
  "monitored-in": {
    required: ["vehicle_id", "signal_id", "violation_id"],
    numeric: ["vehicle_id", "signal_id", "violation_id"],
  },
  vehicles: {
    required: ["registration_number", "vehicle_type"],
  },
  "emergency-vehicles": {
    required: ["vehicle_type", "status", "location_id"],
    numeric: ["location_id"],
  },
  "emergency-responses": {
    required: ["response_status", "emergency_id"],
    numeric: ["emergency_id"],
  },
  roads: {
    required: ["road_name", "road_type"],
  },
  intersections: {
    required: ["intersection_name", "status", "location_id", "signal_id"],
    numeric: ["location_id", "signal_id"],
  },
  "traffic-cameras": {
    required: ["camera_type", "status"],
    numeric: ["road_id", "location_id", "record_id"],
  },
  "road-sensors": {
    required: ["sensor_type", "status"],
    numeric: ["road_id", "location_id"],
  },
  "traffic-monitoring-records": {
    required: ["vehicle_speed", "traffic_volume", "timestamp"],
    numeric: ["vehicle_speed", "traffic_volume", "road_id", "sensor_id", "camera_id", "history_id"],
  },
  "historical-traffic-data": {
    required: ["record_date", "traffic_pattern", "planner_id"],
    numeric: ["planner_id"],
  },
  locations: {
    required: ["latitude", "longitude"],
    numeric: ["latitude", "longitude"],
  },
  "city-planners": {
    required: ["name", "department"],
  },
};

/**
 * Validates payload fields before hitting the database
 */
export function validatePayload(entityKey, data, isUpdate = false) {
  const rules = ENTITY_RULES[entityKey];
  if (!rules) return { isValid: true, errors: {} };

  const errors = {};

  // For CREATE, check all required fields
  // For UPDATE, check required fields only if they are provided
  if (!isUpdate && rules.required) {
    for (const field of rules.required) {
      const val = data[field];
      if (val === undefined || val === null || String(val).trim() === "") {
        const niceName = field.replace(/_/g, " ");
        errors[field] = `${niceName.charAt(0).toUpperCase() + niceName.slice(1)} is required.`;
      }
    }
  } else if (isUpdate && rules.required) {
    for (const field of rules.required) {
      if (data[field] !== undefined) {
        const val = data[field];
        if (val === null || String(val).trim() === "") {
          const niceName = field.replace(/_/g, " ");
          errors[field] = `${niceName.charAt(0).toUpperCase() + niceName.slice(1)} cannot be empty.`;
        }
      }
    }
  }

  // Check numeric fields
  if (rules.numeric) {
    for (const field of rules.numeric) {
      if (data[field] !== undefined && data[field] !== null && String(data[field]).trim() !== "") {
        const num = Number(data[field]);
        if (isNaN(num)) {
          const niceName = field.replace(/_/g, " ");
          errors[field] = `${niceName.charAt(0).toUpperCase() + niceName.slice(1)} must be a valid number.`;
        } else if (num < 0 && (field === "capacity" || field === "fine_amount" || field === "passenger_count" || field === "vehicle_speed" || field === "traffic_volume")) {
          const niceName = field.replace(/_/g, " ");
          errors[field] = `${niceName.charAt(0).toUpperCase() + niceName.slice(1)} cannot be negative.`;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
