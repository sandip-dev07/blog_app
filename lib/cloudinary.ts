import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const BLOG_UPLOAD_FOLDER = "xmdx/blogs";

const BLOG_UPLOAD_TRANSFORMATION = [
  {
    crop: "limit",
    width: 2400,
    quality: "auto:best",
  },
] as const;

const BLOG_DIRECT_UPLOAD_TRANSFORMATION = "c_limit,w_2400,q_auto:best";

const BLOG_DELIVERY_TRANSFORMATION = [
  {
    crop: "limit",
    fetch_format: "auto",
    quality: "auto:best",
    width: 1920,
  },
] as const;

function getOptimizedImageUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "image",
    secure: true,
    transformation: BLOG_DELIVERY_TRANSFORMATION,
  });
}

export async function uploadDataUriImage(dataUri: string) {
  if (!dataUri.startsWith("data:image/")) {
    throw new Error("Only image data URLs can be uploaded.");
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: BLOG_UPLOAD_FOLDER,
    overwrite: false,
    resource_type: "image",
    transformation: BLOG_UPLOAD_TRANSFORMATION,
    unique_filename: true,
    use_filename: false,
  });

  return getOptimizedImageUrl(result.public_id);
}

export function createBlogImageUploadSignature() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary upload is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: BLOG_UPLOAD_FOLDER,
    timestamp,
    transformation: BLOG_DIRECT_UPLOAD_TRANSFORMATION,
  };

  return {
    apiKey,
    cloudName,
    folder: BLOG_UPLOAD_FOLDER,
    signature: cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    ),
    timestamp,
    transformation: BLOG_DIRECT_UPLOAD_TRANSFORMATION,
  };
}

export default cloudinary;
