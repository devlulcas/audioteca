import { lucia } from '$lib/server/auth/lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/database/prisma';

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
			return fail(401);
		}

		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		
    redirect(302, '/login');
	}
} satisfies Actions;
