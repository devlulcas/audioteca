import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_REGION } from "$env/static/private";
import { S3Client } from "@aws-sdk/client-s3";

export const bucketClient = new S3Client({ 
  region: S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
 });
