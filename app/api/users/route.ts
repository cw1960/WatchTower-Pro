import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth, PlanType } from "@/lib/whop-sdk";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

const createUserSchema = z.object({
  whopId: z.string().min(1, "Whop ID is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  companyId: z.string().optional(),
});

// GET /api/users - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const whopId = searchParams.get("whopId");

    if (!userId && !whopId) {
      return NextResponse.json(
        { error: "User ID or Whop ID is required" },
        { status: 400 },
      );
    }

    // Validate user access if userId is provided
    if (userId) {
      const hasAccess = await whopAuth.validateUserAccess(userId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const where = userId ? { id: userId } : { whopId: whopId! };

    const user = await db.user.findUnique({
      where,
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                domain: true,
                plan: true,
              },
            },
          },
        },
        _count: {
          select: {
            monitors: true,
            alerts: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information
    const { ...userProfile } = user;

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { whopId: validatedData.whopId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Create the user
    const user = await db.user.create({
      data: {
        ...validatedData,
        plan: PlanType.FREE,
      },
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                domain: true,
                plan: true,
              },
            },
          },
        },
        _count: {
          select: {
            monitors: true,
            alerts: true,
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate input
    const validatedData = updateUserSchema.parse(updateData);

    // Update the user
    const user = await db.user.update({
      where: { id: userId },
      data: validatedData,
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                domain: true,
                plan: true,
              },
            },
          },
        },
        _count: {
          select: {
            monitors: true,
            alerts: true,
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/users - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user (cascading deletes will handle related records)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
