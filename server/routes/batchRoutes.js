import express from "express";
import db from "../db/db.js";
import { handleControllerError } from "../utils/validationHelper.js";

const router = express.Router();

export const ENTITY_TABLE_MAP = {
  "public-transits": { table: "umtms.public_transit", pk: "transit_id", name: "Public Transit" },
  "rail-tracks": { table: "umtms.rail_track", pk: "track_id", name: "Rail Track" },
  trains: { table: "umtms.train", pk: "train_id", name: "Train" },
  buses: { table: "umtms.bus", pk: "bus_id", name: "Bus" },
  "transit-schedules": { table: "umtms.transit_schedule", pk: "schedule_id", name: "Transit Schedule" },
  passengers: { table: "umtms.passenger", pk: "passenger_id", name: "Passenger" },
  "traffic-authorities": { table: "umtms.traffic_authority", pk: "authority_id", name: "Traffic Authority" },
  "traffic-violations": { table: "umtms.traffic_violation", pk: "violation_id", name: "Traffic Violation" },
  "traffic-signals": { table: "umtms.traffic_signal", pk: "signal_id", name: "Traffic Signal" },
  commits: { table: "umtms.commits", pk: ["vehicle_id", "violation_id"], name: "Commit" },
  "monitored-in": { table: "umtms.monitored_in", pk: ["vehicle_id", "signal_id", "violation_id"], name: "Monitored In" },
  vehicles: { table: "umtms.vehicle", pk: "vehicle_id", name: "Vehicle" },
  "emergency-vehicles": { table: "umtms.emergency_vehicle", pk: "emergency_vehicle_id", name: "Emergency Vehicle" },
  "emergency-responses": { table: "umtms.emergency_response", pk: "response_id", name: "Emergency Response" },
  roads: { table: "umtms.road", pk: "road_id", name: "Road" },
  intersections: { table: "umtms.intersection", pk: "intersection_id", name: "Intersection" },
  "traffic-cameras": { table: "umtms.traffic_camera", pk: "camera_id", name: "Traffic Camera" },
  "road-sensors": { table: "umtms.road_sensor", pk: "sensor_id", name: "Road Sensor" },
  "traffic-monitoring-records": { table: "umtms.traffic_monitoring_record", pk: "record_id", name: "Traffic Monitoring Record" },
  "historical-traffic-data": { table: "umtms.historical_traffic_data", pk: "history_id", name: "Historical Traffic Data" },
  locations: { table: "umtms.location", pk: "location_id", name: "Location" },
  "city-planners": { table: "umtms.city_planner", pk: "planner_id", name: "City Planner" },
};

/**
 * Universal Batch Deletion Handler
 */
export async function handleBatchDelete(req, res) {
  const entityKey = req.params.entityKey;
  const target = ENTITY_TABLE_MAP[entityKey];

  if (!target) {
    return res.status(404).json({
      success: false,
      message: `Unknown entity: ${entityKey}`,
      errors: { general: `Entity '${entityKey}' does not support batch deletion` },
    });
  }

  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one record to delete",
      errors: { general: "No record IDs provided for deletion." },
    });
  }

  try {
    let result;
    if (Array.isArray(target.pk)) {
      // Composite PK (commits, monitored-in)
      const deletedRows = [];
      for (const item of ids) {
        if (typeof item === "object") {
          const conditions = target.pk.map((k, i) => `${k} = $${i + 1}`).join(" AND ");
          const vals = target.pk.map((k) => item[k]);
          const rowRes = await db.query(
            `DELETE FROM ${target.table} WHERE ${conditions} RETURNING *`,
            vals
          );
          if (rowRes.rowCount > 0) deletedRows.push(rowRes.rows[0]);
        } else {
          // If scalar ID passed for composite key, delete by first PK component
          const rowRes = await db.query(
            `DELETE FROM ${target.table} WHERE ${target.pk[0]} = $1 RETURNING *`,
            [item]
          );
          if (rowRes.rowCount > 0) deletedRows.push(...rowRes.rows);
        }
      }
      return res.status(200).json({
        success: true,
        count: deletedRows.length,
        message: `${deletedRows.length} ${target.name} record(s) deleted successfully`,
        data: deletedRows,
      });
    } else {
      // Single PK
      const query = `DELETE FROM ${target.table} WHERE ${target.pk} = ANY($1) RETURNING *`;
      result = await db.query(query, [ids]);

      return res.status(200).json({
        success: true,
        count: result.rowCount,
        message: `${result.rowCount} ${target.name} record(s) deleted successfully`,
        data: result.rows,
      });
    }
  } catch (error) {
    return handleControllerError(res, error);
  }
}

router.post("/:entityKey/batch-delete", handleBatchDelete);
router.delete("/:entityKey/batch-delete", handleBatchDelete);
router.delete("/:entityKey", handleBatchDelete);

export default router;
