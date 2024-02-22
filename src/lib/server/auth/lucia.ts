import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { db } from "$lib/server/database/prisma";
import { dev } from "$app/environment";

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getUserAttributes: (databaseUserAttributes: any) => {
			return {
				id: databaseUserAttributes.id,
				username: databaseUserAttributes.username
			}
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
	}
}
