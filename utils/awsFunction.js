import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIAQQ4V6AVOODZZVKZR",
    secretAccessKey: "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",
  },
});

export const getS3ObjectUrl = async (Key) => {
  const command = new GetObjectCommand({
    Bucket: "vivmedia-pvt",
    Key,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
};

export const postS3ClubObject = async (
  fileName,
  contentType,
  path = "clubs"
) => {
  const command = new PutObjectCommand({
    Bucket: "vivmedia-pvt",
    Key: `${path}/uploads/${fileName}`,
    ContentType: contentType,
  });

  // console.log("---- access key ----", process.env.AWS_GET_MEDIA_ACCESS_KEY)
  // console.log("---- secret key ----", process.env.AWS_GET_MEDIA_SECRET_KEY)

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return url;
};
