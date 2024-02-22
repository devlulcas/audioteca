import { lucia } from "$lib/server/auth/lucia";
import { fail, redirect } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import type { Actions } from "./$types";
import { db } from "$lib/server/database/prisma";

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get("username");
		const password = formData.get("password");

		if (
			typeof username !== "string" ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				message: "Invalid username"
			});
		}

		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}

		const existingUser = await db.user.findFirst({ where: { username } });

		if (!existingUser) {
			return fail(400, {
				message: "Incorrect username or password"
			});
		}

		const validPassword = await new Argon2id().verify(existingUser.password, password);
		if (!validPassword) {
			return fail(400, {
				message: "Incorrect username or password"
			});
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		redirect(302, "/");
	}
};
