import { db } from '$lib/server/database/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	return {
		username: event.locals.user.username
	};
};

export const actions = {
	saveAudio: async (event) => {
		const author = event.locals.user;

		if (!author)
			return fail(401, {
				message: 'Unauthorized'
			});

		const formData = await event.request.formData();
		const name = formData.get('name');
		const file = formData.get('file');
		const authorId = author.id;

		if (typeof name !== 'string' || name.length < 3 || name.length > 255) {
			return fail(400, {
				message: 'Invalid name'
			});
		}

		if (!(file instanceof File)) {
			return fail(400, {
				message: 'Invalid file'
			});
		}

		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + generateId(6);

		try {
			await db.sound.create({
				data: {
					name: name,
					url: slug,
					userId: authorId
				}
			});
		} catch (error) {
			console.log("Error on file upload: ", String(error))
			return fail(500, {
				message: 'Failed to save audio'
			});
		}
	}
} satisfies Actions;
