import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Check if Whop SDK is properly configured
	if (!process.env.NEXT_PUBLIC_WHOP_APP_ID || !process.env.WHOP_API_KEY) {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-xl font-bold text-red-600 mb-4">
						Configuration Required
					</h1>
					<p className="text-gray-600">
						Please configure your Whop SDK credentials in the environment variables
						to use this experience page.
					</p>
				</div>
			</div>
		);
	}

	try {
		// The headers contains the user token
		const headersList = await headers();

		// The experienceId is a path param
		const { experienceId } = await params;

		// The user token is in the headers
		const { userId } = await whopSdk.verifyUserToken(headersList);

		const result = await whopSdk.access.checkIfUserHasAccessToExperience({
			userId,
			experienceId,
		});

		const user = await whopSdk.users.getUser({ userId });
		const experience = await whopSdk.experiences.getExperience({ experienceId });

		// Either: 'admin' | 'customer' | 'no_access';
		// 'admin' means the user is an admin of the whop, such as an owner or moderator
		// 'customer' means the user is a common member in this whop
		// 'no_access' means the user does not have access to the whop
		const { accessLevel } = result;

		return (
			<div className="flex justify-center items-center h-screen px-8">
				<h1 className="text-xl">
					Hi <strong>{user.name}</strong>, you{" "}
					<strong>{result.hasAccess ? "have" : "do not have"} access</strong> to
					this experience. Your access level to this whop is:{" "}
					<strong>{accessLevel}</strong>. <br />
					<br />
					Your user ID is <strong>{userId}</strong> and your username is{" "}
					<strong>@{user.username}</strong>.<br />
					<br />
					You are viewing the experience: <strong>{experience.name}</strong>
				</h1>
			</div>
		);
	} catch (error) {
		console.error("Error in ExperiencePage:", error);
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-xl font-bold text-red-600 mb-4">
						Error Loading Experience
					</h1>
					<p className="text-gray-600">
						There was an error loading this experience. Please try again later.
					</p>
				</div>
			</div>
		);
	}
}
