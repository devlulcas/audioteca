import { lucia } from '$lib/server/auth/lucia';
import { db } from '$lib/server/database/prisma';
import { actionFail } from '$lib/server/errors/action-fail';
import { redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
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

		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(password);

		const userAlreadyExists = await db.user.findFirst({ where: { username: username } });

		if (userAlreadyExists) {
			return actionFail(400, {
				as: 'error',
				message: 'Username already taken'
			});
		}

		try {
			await db.user.create({
				data: {
					id: userId,
					password: hashedPassword,
					username: username
				}
			});

			const session = await lucia.createSession(userId, {});

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
