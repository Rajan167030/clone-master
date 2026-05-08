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

export const createCloudinaryUploadSignature = ({ folder = "founders-connect", publicId = "", resourceType = "image" } = {}) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    public_id: publicId || undefined,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature: buildSignature(paramsToSign, apiSecret),
    publicId: publicId || undefined,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
  };
};
