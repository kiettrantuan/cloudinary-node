// Require the cloudinary library
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import * as dotenv from "dotenv";
import { readdirSync } from "fs";

dotenv.config({ path: __dirname + "/../.env" });

console.log(__dirname + "/../.env");

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log the configuration
console.log(cloudinary.config());

const uploadVideoToAnimatedWebP = async (
  videoPath: string,
  public_id?: string
) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options: UploadApiOptions = {
    use_filename: true,
    unique_filename: false,
    overwrite: false,
    folder: process.env.CLOUDINARY_UPLOAD_VIDEO_FOLDER,
    // allowed_formats: ["mp4","mov"],
    resource_type: "video",

    // Cache animated .webp
    eager: [
      {
        format: "webp",
        effect: "loop",
        flags: ["animated", "awebp"],
      },
      {
        format: "webp",
        effect: "loop",
        flags: ["animated", "awebp"],
        height: 360,
        width: 640, // Set dimensions (16:9 = 640 x 360)
        // crop: "fill",
      },
    ],
    eager_async: false,
    // Webhook for notifying on completed
    // eager_async: true,
    // eager_notification_url: "https://mysite.example.com/eager_endpoint",
    // notification_url: "https://mysite.example.com/upload_endpoint"
  };

  public_id ? (options.public_id = public_id) : (options.use_filename = true);

  try {
    // Upload the video
    const result = await cloudinary.uploader.upload(videoPath, options);
    console.log(result);
    return result.public_id;
  } catch (error) {
    console.error(error);
  }
};

const uploadAll = async () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET ||
    !process.env.CLOUDINARY_UPLOAD_VIDEO_FOLDER
  ) {
    throw Error("Missing Environment Variables !");
  }

  const vDir = "assets/weather/videos";
  const filenames = readdirSync(vDir);
  for (const filename of filenames) {
    if (filename.endsWith(".mp4")) {
      const vPath = `${vDir}/${filename}`;
      const public_id = filename.slice(0, filename.length - 4);
      console.log({ vPath, public_id });
      await uploadVideoToAnimatedWebP(vPath, public_id);
    }
  }
};

uploadAll();
