import ow from 'ow';

const isOrderRecord = ow.object.valuesOfType(ow.string.oneOf(['asc', 'desc']));
const isOrderArray = ow.array.ofType(ow.any(ow.string, isOrderRecord));
const isZoom = ow.any(ow.string, ow.array.is(validateZoomArray), ow.object.is(validateZoomRecord));

/**
 * Validates zoom query parameter when it's presented as array.
 *
 * @param zoom Zoom query parameter.
 * @returns True if provided value is valid.
 */
function validateZoomArray(zoom: any): zoom is unknown[] {
  return ow.isValid(zoom, ow.array.ofType(ow.any(ow.string, ow.object.is(validateZoomRecord))));
}

/**
 * Validates zoom query parameter when it's presented as object (record).
 *
 * @param zoom Zoom query parameter.
 * @returns True if provided value is valid.
 */
function validateZoomRecord(zoom: any): zoom is Record<string, unknown> {
  return ow.isValid(zoom, ow.object.valuesOfType(isZoom));
}

export const isQuery = {
  fields: ow.optional.array.ofType(ow.string),
  filters: ow.optional.array.ofType(ow.string),
  limit: ow.optional.number.integer.greaterThanOrEqual(0),
  offset: ow.optional.number.integer.greaterThanOrEqual(0),
  order: ow.any(ow.undefined, ow.string, isOrderRecord, isOrderArray),
  zoom: ow.any(ow.undefined, isZoom),
};
