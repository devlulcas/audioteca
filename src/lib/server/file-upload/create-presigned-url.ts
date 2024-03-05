import { S3_BUCKET } from '$env/static/private';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { bucketClient } from './bucket';

export function createPresignedURL(key: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: 'audios/' + key
	});

	return getSignedUrl(bucketClient, command, {
		expiresIn: 3600
	});
}

