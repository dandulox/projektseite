// Test Fixtures - Ephemere Test-Daten zur Laufzeit
import { prisma } from '../../src/config/database';
import { UserRole, ProjectStatus, TaskStatus, Priority, Visibility } from '@shared/types';
import bcrypt from 'bcryptjs';

// Test User Factory
export async function createTestUser(overrides: Partial<any> = {}) {
  const defaultUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: await bcrypt.hash('testpassword123', 12),
    role: UserRole.USER,
    isActive: true,
  };

  const userData = { ...defaultUser, ...overrides };
  
  return await prisma.user.create({
    data: userData,
  });
}

// Test Project Factory
export async function createTestProject(ownerId: string, overrides: Partial<any> = {}) {
  const defaultProject = {
    name: `Test Project ${Date.now()}`,
    description: 'Test project description',
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    ownerId,
    visibility: Visibility.PRIVATE,
    completionPercentage: 0,
  };

  const projectData = { ...defaultProject, ...overrides };
  
  return await prisma.project.create({
    data: projectData,
  });
}

// Test Task Factory
export async function createTestTask(
  createdById: string, 
  projectId?: string, 
  overrides: Partial<any> = {}
) {
  const defaultTask = {
    title: `Test Task ${Date.now()}`,
    description: 'Test task description',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    createdById,
    projectId,
    tags: ['test'],
  };

  const taskData = { ...defaultTask, ...overrides };
  
  return await prisma.task.create({
    data: taskData,
  });
}

// Test Team Factory
export async function createTestTeam(leaderId: string, overrides: Partial<any> = {}) {
  const defaultTeam = {
    name: `Test Team ${Date.now()}`,
    description: 'Test team description',
    leaderId,
    isActive: true,
  };

  const teamData = { ...defaultTeam, ...overrides };
  
  return await prisma.team.create({
    data: teamData,
  });
}

// Test Module Factory
export async function createTestModule(projectId: string, overrides: Partial<any> = {}) {
  const defaultModule = {
    projectId,
    name: `Test Module ${Date.now()}`,
    description: 'Test module description',
    status: 'NOT_STARTED' as any,
    priority: Priority.MEDIUM,
    completionPercentage: 0,
  };

  const moduleData = { ...defaultModule, ...overrides };
  
  return await prisma.module.create({
    data: moduleData,
  });
}

// Test Notification Factory
export async function createTestNotification(userId: string, overrides: Partial<any> = {}) {
  const defaultNotification = {
    userId,
    type: 'task_assigned',
    title: 'Test Notification',
    message: 'Test notification message',
    isRead: false,
  };

  const notificationData = { ...defaultNotification, ...overrides };
  
  return await prisma.notification.create({
    data: notificationData,
  });
}

// Test Activity Log Factory
export async function createTestActivityLog(
  entityType: string, 
  entityId: string, 
  userId?: string,
  overrides: Partial<any> = {}
) {
  const defaultActivityLog = {
    userId,
    entityType,
    entityId,
    action: 'created',
    details: { test: true },
  };

  const activityLogData = { ...defaultActivityLog, ...overrides };
  
  return await prisma.activityLog.create({
    data: activityLogData,
  });
}

// Test Task Comment Factory
export async function createTestTaskComment(taskId: string, userId: string, overrides: Partial<any> = {}) {
  const defaultComment = {
    taskId,
    userId,
    content: 'Test comment content',
  };

  const commentData = { ...defaultComment, ...overrides };
  
  return await prisma.taskComment.create({
    data: commentData,
  });
}

// Test Task Attachment Factory
export async function createTestTaskAttachment(taskId: string, userId: string, overrides: Partial<any> = {}) {
  const defaultAttachment = {
    taskId,
    userId,
    filename: 'test-file.txt',
    originalName: 'test-file.txt',
    filePath: '/uploads/test-file.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
  };

  const attachmentData = { ...defaultAttachment, ...overrides };
  
  return await prisma.taskAttachment.create({
    data: attachmentData,
  });
}

// Test Team Membership Factory
export async function createTestTeamMembership(teamId: string, userId: string, overrides: Partial<any> = {}) {
  const defaultMembership = {
    teamId,
    userId,
    role: 'MEMBER' as any,
  };

  const membershipData = { ...defaultMembership, ...overrides };
  
  return await prisma.teamMembership.create({
    data: membershipData,
  });
}

// Cleanup Helper
export async function cleanupTestData() {
  // Delete in reverse order of dependencies
  await prisma.taskAttachment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskActivity.deleteMany();
  await prisma.moduleActivity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.module.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

// Test Data Builder Pattern
export class TestDataBuilder {
  private data: any = {};

  static create() {
    return new TestDataBuilder();
  }

  user(overrides: Partial<any> = {}) {
    this.data.user = overrides;
    return this;
  }

  project(overrides: Partial<any> = {}) {
    this.data.project = overrides;
    return this;
  }

  task(overrides: Partial<any> = {}) {
    this.data.task = overrides;
    return this;
  }

  team(overrides: Partial<any> = {}) {
    this.data.team = overrides;
    return this;
  }

  module(overrides: Partial<any> = {}) {
    this.data.module = overrides;
    return this;
  }

  async build() {
    const result: any = {};

    if (this.data.user) {
      result.user = await createTestUser(this.data.user);
    }

    if (this.data.project) {
      if (!result.user) {
        result.user = await createTestUser();
      }
      result.project = await createTestProject(result.user.id, this.data.project);
    }

    if (this.data.task) {
      if (!result.user) {
        result.user = await createTestUser();
      }
      if (!result.project) {
        result.project = await createTestProject(result.user.id);
      }
      result.task = await createTestTask(result.user.id, result.project.id, this.data.task);
    }

    if (this.data.team) {
      if (!result.user) {
        result.user = await createTestUser();
      }
      result.team = await createTestTeam(result.user.id, this.data.team);
    }

    if (this.data.module) {
      if (!result.project) {
        if (!result.user) {
          result.user = await createTestUser();
        }
        result.project = await createTestProject(result.user.id);
      }
      result.module = await createTestModule(result.project.id, this.data.module);
    }

    return result;
  }
}

// Helper Functions
export async function createTestUserWithProject() {
  const user = await createTestUser();
  const project = await createTestProject(user.id);
  return { user, project };
}

export async function createTestUserWithProjectAndTask() {
  const user = await createTestUser();
  const project = await createTestProject(user.id);
  const task = await createTestTask(user.id, project.id);
  return { user, project, task };
}

export async function createTestUserWithTeam() {
  const user = await createTestUser();
  const team = await createTestTeam(user.id);
  return { user, team };
}

export async function createTestUserWithTeamAndProject() {
  const user = await createTestUser();
  const team = await createTestTeam(user.id);
  const project = await createTestProject(user.id, { teamId: team.id });
  return { user, team, project };
}

// Mock Data Generators
export function generateMockTask(overrides: Partial<any> = {}) {
  return {
    id: `task_${Date.now()}`,
    title: `Mock Task ${Date.now()}`,
    description: 'Mock task description',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeId: null,
    projectId: null,
    moduleId: null,
    createdById: `user_${Date.now()}`,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    tags: ['mock'],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

export function generateMockProject(overrides: Partial<any> = {}) {
  return {
    id: `project_${Date.now()}`,
    name: `Mock Project ${Date.now()}`,
    description: 'Mock project description',
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    ownerId: `user_${Date.now()}`,
    teamId: null,
    visibility: Visibility.PRIVATE,
    startDate: null,
    targetDate: null,
    completionPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function generateMockUser(overrides: Partial<any> = {}) {
  return {
    id: `user_${Date.now()}`,
    username: `mockuser_${Date.now()}`,
    email: `mock_${Date.now()}@example.com`,
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
