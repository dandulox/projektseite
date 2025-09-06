// Database Seed Script - Erstellt initiale System-Daten
// WICHTIG: Dieses Script wird NUR für Development verwendet!
// In Production werden KEINE Demo-Daten erstellt (No-Seeds Policy)

import { PrismaClient, UserRole, ProjectStatus, TaskStatus, Priority, Visibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Nur in Development-Umgebung ausführen
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Seeding ist in Production nicht erlaubt!');
    return;
  }

  try {
    // 1. Erstelle Admin-Benutzer
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@projektseite.de' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@projektseite.de',
        password: adminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    // 2. Erstelle Test-Benutzer
    console.log('👥 Creating test users...');
    const userPassword = await bcrypt.hash('user123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'user@projektseite.de' },
      update: {},
      create: {
        username: 'testuser',
        email: 'user@projektseite.de',
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
    });

    // 3. Erstelle Test-Team
    console.log('👥 Creating test team...');
    const team = await prisma.team.upsert({
      where: { id: 'test-team-id' },
      update: {},
      create: {
        id: 'test-team-id',
        name: 'Development Team',
        description: 'Hauptentwicklungsteam für Projektseite',
        leaderId: admin.id,
        isActive: true,
      },
    });

    // 4. Füge Benutzer zum Team hinzu
    await prisma.teamMembership.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: admin.id,
        },
      },
      update: {},
      create: {
        teamId: team.id,
        userId: admin.id,
        role: 'LEADER',
      },
    });

    await prisma.teamMembership.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: testUser.id,
        },
      },
      update: {},
      create: {
        teamId: team.id,
        userId: testUser.id,
        role: 'MEMBER',
      },
    });

    // 5. Erstelle Test-Projekt
    console.log('📁 Creating test project...');
    const project = await prisma.project.upsert({
      where: { id: 'test-project-id' },
      update: {},
      create: {
        id: 'test-project-id',
        name: 'Projektseite v3.0',
        description: 'Modernisierung der Projektmanagement-Plattform',
        status: ProjectStatus.ACTIVE,
        priority: Priority.HIGH,
        ownerId: admin.id,
        teamId: team.id,
        visibility: Visibility.TEAM,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-06-30'),
        completionPercentage: 25,
      },
    });

    // 6. Erstelle Test-Module
    console.log('📦 Creating test modules...');
    const backendModule = await prisma.module.upsert({
      where: { id: 'backend-module-id' },
      update: {},
      create: {
        id: 'backend-module-id',
        projectId: project.id,
        name: 'Backend API',
        description: 'Express.js API mit Prisma ORM',
        status: 'IN_PROGRESS',
        priority: Priority.HIGH,
        assignedTo: admin.id,
        estimatedHours: 120,
        actualHours: 30,
        completionPercentage: 25,
      },
    });

    const frontendModule = await prisma.module.upsert({
      where: { id: 'frontend-module-id' },
      update: {},
      create: {
        id: 'frontend-module-id',
        projectId: project.id,
        name: 'Frontend App',
        description: 'React App mit TypeScript',
        status: 'NOT_STARTED',
        priority: Priority.MEDIUM,
        assignedTo: testUser.id,
        estimatedHours: 80,
        completionPercentage: 0,
      },
    });

    // 7. Erstelle Test-Tasks
    console.log('📋 Creating test tasks...');
    const tasks = [
      {
        id: 'task-1',
        title: 'API Authentication implementieren',
        description: 'JWT-basierte Authentifizierung mit Refresh-Tokens',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        assigneeId: admin.id,
        projectId: project.id,
        moduleId: backendModule.id,
        createdById: admin.id,
        dueDate: new Date('2024-01-15'),
        estimatedHours: 8,
        actualHours: 8,
        tags: ['backend', 'auth', 'security'],
        completedAt: new Date('2024-01-14'),
      },
      {
        id: 'task-2',
        title: 'Task Management API',
        description: 'CRUD-Operationen für Tasks mit Validierung',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        assigneeId: admin.id,
        projectId: project.id,
        moduleId: backendModule.id,
        createdById: admin.id,
        dueDate: new Date('2024-01-20'),
        estimatedHours: 12,
        actualHours: 6,
        tags: ['backend', 'api', 'crud'],
      },
      {
        id: 'task-3',
        title: 'Frontend Dashboard',
        description: 'React Dashboard mit Task-Übersicht',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: testUser.id,
        projectId: project.id,
        moduleId: frontendModule.id,
        createdById: admin.id,
        dueDate: new Date('2024-02-01'),
        estimatedHours: 16,
        tags: ['frontend', 'react', 'dashboard'],
      },
      {
        id: 'task-4',
        title: 'Kanban Board',
        description: 'Drag & Drop Kanban Board für Task-Management',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: testUser.id,
        projectId: project.id,
        moduleId: frontendModule.id,
        createdById: admin.id,
        dueDate: new Date('2024-02-15'),
        estimatedHours: 20,
        tags: ['frontend', 'react', 'kanban', 'dnd'],
      },
    ];

    for (const taskData of tasks) {
      await prisma.task.upsert({
        where: { id: taskData.id },
        update: {},
        create: taskData,
      });
    }

    // 8. Erstelle Test-Benachrichtigungen
    console.log('🔔 Creating test notifications...');
    await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          type: 'task_assigned',
          title: 'Neue Task zugewiesen',
          message: 'Sie haben eine neue Task erhalten: "API Authentication implementieren"',
          projectId: project.id,
          actionUrl: `/projects/${project.id}/tasks/task-1`,
        },
        {
          userId: testUser.id,
          type: 'project_created',
          title: 'Neues Projekt erstellt',
          message: 'Das Projekt "Projektseite v3.0" wurde erstellt',
          projectId: project.id,
          actionUrl: `/projects/${project.id}`,
        },
      ],
      skipDuplicates: true,
    });

    // 9. Erstelle Test-Aktivitätslogs
    console.log('📝 Creating test activity logs...');
    await prisma.activityLog.createMany({
      data: [
        {
          userId: admin.id,
          entityType: 'project',
          entityId: project.id,
          action: 'created',
          details: { name: project.name, status: project.status },
        },
        {
          userId: admin.id,
          entityType: 'task',
          entityId: 'task-1',
          action: 'created',
          details: { title: 'API Authentication implementieren', status: 'TODO' },
        },
        {
          userId: admin.id,
          entityType: 'task',
          entityId: 'task-1',
          action: 'status_changed',
          details: { from: 'TODO', to: 'COMPLETED' },
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Created:');
    console.log(`  - 2 Users (1 Admin, 1 User)`);
    console.log(`  - 1 Team (Development Team)`);
    console.log(`  - 1 Project (Projektseite v3.0)`);
    console.log(`  - 2 Modules (Backend API, Frontend App)`);
    console.log(`  - 4 Tasks (verschiedene Status)`);
    console.log(`  - 2 Notifications`);
    console.log(`  - 3 Activity Logs`);
    console.log('\n🔑 Login Credentials:');
    console.log(`  Admin: admin@projektseite.de / admin123`);
    console.log(`  User:  user@projektseite.de / user123`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
