import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedRolesAndPermissions(prisma: PrismaClient) {
  // Create permissions
  const permissions = [
    // Admin permissions
    { name: "admin:access", description: "Access admin dashboard" },
    { name: "admin:users:read", description: "View users" },
    { name: "admin:users:write", description: "Manage users" },
    { name: "admin:content:read", description: "View all content" },
    { name: "admin:content:write", description: "Manage all content" },
    { name: "admin:personalities:read", description: "View personalities" },
    { name: "admin:personalities:write", description: "Manage personalities" },
    { name: "admin:presets:read", description: "View presets" },
    { name: "admin:presets:write", description: "Manage presets" },
    { name: "admin:templates:read", description: "View templates" },
    { name: "admin:templates:write", description: "Manage templates" },
    { name: "admin:moderation", description: "Moderate content" },
    // User permissions
    { name: "prompts:create", description: "Create prompts" },
    { name: "prompts:read", description: "View prompts" },
    { name: "prompts:update:own", description: "Update own prompts" },
    { name: "prompts:delete:own", description: "Delete own prompts" },
    { name: "comments:create", description: "Create comments" },
    { name: "comments:update:own", description: "Update own comments" },
    { name: "comments:delete:own", description: "Delete own comments" },
    { name: "votes:create", description: "Vote on content" },
    { name: "profile:read", description: "View own profile" },
    { name: "profile:update", description: "Update own profile" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
    });
  }

  // Create roles
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Regular user with basic permissions",
      permissions: [
        "prompts:create",
        "prompts:read",
        "prompts:update:own",
        "prompts:delete:own",
        "comments:create",
        "comments:update:own",
        "comments:delete:own",
        "votes:create",
        "profile:read",
        "profile:update",
      ],
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrator with full access",
      permissions: permissions.map((p) => p.name),
    },
  });

  // Link permissions to roles via RolePermission
  const allPermissions = await prisma.permission.findMany();

  // Admin gets all permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets subset of permissions
  const userPermissionNames = [
    "prompts:create",
    "prompts:read",
    "prompts:update:own",
    "prompts:delete:own",
    "comments:create",
    "comments:update:own",
    "comments:delete:own",
    "votes:create",
    "profile:read",
    "profile:update",
  ];

  const userPermissions = allPermissions.filter((p) =>
    userPermissionNames.includes(p.name)
  );

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(`  - Created ${permissions.length} permissions`);
  console.log(`  - Created 2 roles (USER, ADMIN)`);
}
