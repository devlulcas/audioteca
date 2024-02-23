import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId } from 'lucia';
import { createPresignedURL } from '$lib/server/file-upload/create-presigned-url';

export const POST: RequestHandler = async (event) => {
	const author = event.locals.user;

	if (!author) {
		return error(401, {
			message: 'Unauthorized'
		});
	}

	const formData = await event.request.formData();

	const name = formData.get('name');
	const authorId = author.id;

	if (typeof name !== 'string' || name.length < 3 || name.length > 255) {
		return error(400, {
			message: 'Invalid name'
		});
	}

	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + generateId(6) + authorId;

	const url = await createPresignedURL(slug);

	return json({ url, key: slug });
};
