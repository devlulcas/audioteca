import { db } from '$lib/server/database/prisma';
import { actionFail } from '$lib/server/errors/action-fail';
import { createPresignedURL } from '$lib/server/file-upload/create-presigned-url';
import { redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const key = generateId(6) + event.locals.user.id;

	const presignedUrl = await createPresignedURL(key);

	const myUploads = db.sound.findMany({
		where: {
			userId: event.locals.user.id
		}
	});

	return {
		username: event.locals.user.username,
		presignedUrl,
		key,
		lazy: {
			myUploads
		}
	};
};

export const actions = {
	default: async (event) => {
		if (!event.locals.user) {
			return actionFail(401, {
				as: 'warning',
				message: 'Unauthorized'
			});
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const key = formData.get('key');

		if (typeof name !== 'string' || name.length < 3 || name.length > 255) {
			return actionFail(400, {
				as: 'warning',
				message: 'Invalid name'
			});
		}

		if (typeof key !== 'string') {
			return actionFail(400, {
				as: 'warning',
				message: 'Invalid key'
			});
		}

		try {
			await db.sound.create({
				data: {
					name: name,
					url: key,
					userId: event.locals.user.id
				}
			});
		} catch (error) {
			console.error('Error on file upload: ', String(error));

			return actionFail(500, {
				as: 'error',
				message: 'Failed to save audio'
			});
		}

		redirect(302, '/dashboard');
	}
} satisfies Actions;
