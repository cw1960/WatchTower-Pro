import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  try {
    // The experienceId is a path param
    const { experienceId } = await params;

    console.log("🔍 ExperiencePage: Starting authentication for experience:", experienceId);

    // Use the development-mode aware authentication
    const authResult = await validateWhopAuth();
    console.log("🔍 ExperiencePage: Auth result:", { success: authResult.success, error: authResult.error });

    if (!authResult.success || !authResult.user) {
      console.error("❌ ExperiencePage: Authentication failed:", authResult.error);
      return (
        <div className="flex justify-center items-center h-screen px-8">
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Please authenticate to access this experience.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {authResult.error}
            </p>
          </div>
        </div>
      );
    }

    const authenticatedUser = authResult.user;
    const userId = authenticatedUser.whopId;
    console.log("✅ ExperiencePage: User authenticated:", { userId, name: authenticatedUser.name });

    console.log("🔍 ExperiencePage: Checking access for experience:", experienceId);
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });
    console.log("🔍 ExperiencePage: Access check result:", result);

    console.log("🔍 ExperiencePage: Getting user info from Whop");
    const whopUser = await whopSdk.users.getUser({ userId });
    console.log("🔍 ExperiencePage: Got user info:", whopUser?.name);

    console.log("🔍 ExperiencePage: Getting experience info");
    const experience = await whopSdk.experiences.getExperience({
      experienceId,
    });
    console.log("🔍 ExperiencePage: Got experience info:", experience?.name);

    // Either: 'admin' | 'customer' | 'no_access';
    // 'admin' means the user is an admin of the whop, such as an owner or moderator
    // 'customer' means the user is a common member in this whop
    // 'no_access' means the user does not have access to the whop
    const { accessLevel } = result;

    return (
      <div className="flex justify-center items-center h-screen px-8">
        <h1 className="text-xl">
          Hi <strong>{authenticatedUser.name}</strong>, you{" "}
          <strong>{result.hasAccess ? "have" : "do not have"} access</strong> to
          this experience. Your access level to this whop is:{" "}
          <strong>{accessLevel}</strong>. <br />
          <br />
          Your user ID is <strong>{userId}</strong> and your email is{" "}
          <strong>{authenticatedUser.email}</strong>.<br />
          <br />
          You are viewing the experience: <strong>{experience.name}</strong>
        </h1>
      </div>
    );
  } catch (error) {
    console.error("❌ ExperiencePage: Detailed error:", error);
    console.error("❌ ExperiencePage: Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("❌ ExperiencePage: Error message:", error instanceof Error ? error.message : String(error));
    
    return (
      <div className="flex justify-center items-center h-screen px-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Error Loading Experience
          </h1>
          <p className="text-gray-600">
            There was an error loading this experience. Please try again later.
          </p>
          <details className="mt-4 text-left bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer font-semibold">Debug Info</summary>
            <pre className="mt-2 text-xs text-gray-600">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
