import { lucia } from '$lib/server/auth/lucia';
import { db } from '$lib/server/database/prisma';
import { actionFail } from '$lib/server/errors/action-fail';
import { redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return actionFail(400, {
				as: 'warning',
				message: 'Invalid username'
			});
		}

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return actionFail(400, {
				as: 'warning',
				message: 'Invalid password'
			});
		}

		const existingUser = await db.user.findFirst({ where: { username } });

		if (!existingUser) {
			return actionFail(400, {
				as: 'error',
				message: 'Incorrect username or password'
			});
		}

		const validPassword = await new Argon2id().verify(existingUser.password, password);

		if (!validPassword) {
			return actionFail(400, {
				as: 'error',
				message: 'Incorrect username or password'
			});
		}

		try {
			const session = await lucia.createSession(existingUser.id, {});

			const sessionCookie = lucia.createSessionCookie(session.id);

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (error) {
			return actionFail(500, {
				as: 'error',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		redirect(302, '/');
	}
};
