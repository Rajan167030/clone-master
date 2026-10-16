import crypto from "crypto";

const requiredEnv = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];

const getCloudinaryEnv = () => {
  const missing = requiredEnv.filter((key) => !String(process.env[key] || "").trim());

  if (missing.length) {
    const error = new Error(`Missing Cloudinary configuration: ${missing.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }

  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME).trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY).trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET).trim(),
  };
};

const buildSignature = (params, apiSecret) => {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
};

// `type: "authenticated"` keeps the asset off public delivery URLs; it can then
// only be fetched through a signed URL from createCloudinaryAuthenticatedUrl.
export const createCloudinaryUploadSignature = ({ folder = "founders-connect", publicId = "", resourceType = "image", type = "" } = {}) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    public_id: publicId || undefined,
    timestamp,
    type: type || undefined,
  };

  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature: buildSignature(paramsToSign, apiSecret),
    publicId: publicId || undefined,
    type: type || undefined,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
  };
};

// Signed delivery URL for an asset uploaded with type "authenticated".
export const createCloudinaryAuthenticatedUrl = ({ publicId, resourceType = "image", format = "" }) => {
  const { cloudName, apiSecret } = getCloudinaryEnv();
  const source = format ? `${publicId}.${format}` : publicId;
  const signature = crypto
    .createHash("sha1")
    .update(`${source}${apiSecret}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .slice(0, 8);

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/authenticated/s--${signature}--/${source}`;
};
