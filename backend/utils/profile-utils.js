import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique profile ID for users
 * Format: fc-{uuid}
 */
export const generateProfileId = () => {
  const uuid = uuidv4().replace(/-/g, '').slice(0, 12);
  return `fc-${uuid}`;
};

export default generateProfileId;
