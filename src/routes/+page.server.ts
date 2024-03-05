import { lucia } from '$lib/server/auth/lucia';
import { db } from '$lib/server/database/prisma';
import { actionFail } from '$lib/server/errors/action-fail';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const page = event.url.searchParams.get('page') || '1';
	const limit = 10;
	const offset = (parseInt(page) - 1) * limit;

	const audios = await db.sound.findMany({
		skip: offset,
		take: limit,
		include: {
			user: {
				select: {
					username: true
				}
			}
		}
	});

	return {
		currentUser: event.locals.user,
		audios: audios
	};
};

export const actions = {
	signOut: async (event) => {
		if (!event.locals.session) {
			return actionFail(401, {
				as: 'error',
				message: 'You are not signed in'
			});
		}

		try {
			await lucia.invalidateSession(event.locals.session.id);
		} catch (error) {
			return actionFail(500, {
				as: 'error',
				message: error instanceof Error ? error.message : 'An error occurred'
			});
		}

		const sessionCookie = lucia.createBlankSessionCookie();

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/login');
	}
} satisfies Actions;
