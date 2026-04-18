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

const BLOG_UPLOAD_TRANSFORMATION = [
  {
    crop: "limit",
    width: 2400,
    quality: "auto:best",
  },
] as const;

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
    folder: "xmdx/blogs",
    overwrite: false,
    resource_type: "image",
    transformation: BLOG_UPLOAD_TRANSFORMATION,
    unique_filename: true,
    use_filename: false,
  });

  return getOptimizedImageUrl(result.public_id);
}

export default cloudinary;
