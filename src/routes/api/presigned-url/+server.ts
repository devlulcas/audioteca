import { createPresignedURL } from '$lib/server/file-upload/create-presigned-url';
import { error, json } from '@sveltejs/kit';
import { generateId } from 'lucia';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		return error(401, {
			message: 'Unauthorized'
		});
	}

	const formData = await event.request.formData();

	const name = formData.get('name');
	const userId = user.id;

	if (typeof name !== 'string' || name.length < 3 || name.length > 255) {
		return error(400, {
			message: 'Invalid name'
		});
	}

	const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + generateId(6) + userId;

	const presignedUrl = await createPresignedURL(key);

	return json({ presignedUrl, key });
};
