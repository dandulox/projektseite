// Team Repository
import { Team, TeamRole } from '@shared/types';
import { BaseRepository } from './base.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class TeamRepository extends BaseRepository<Team> {
  constructor() {
    super('team');
  }

  // Find teams by leader
  async findByLeader(leaderId: string): Promise<Team[]> {
    try {
      const teams = await prisma.team.findMany({
        where: { leaderId },
        include: {
          leader: {
            select: { id: true, username: true, email: true },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.debug('Team findByLeader', { leaderId, count: teams.length });
      return teams;
    } catch (error) {
      logger.error('Team findByLeader error', { leaderId, error });
      throw error;
    }
  }

  // Find teams by member
  async findByMember(userId: string): Promise<Team[]> {
    try {
      const teams = await prisma.team.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
        include: {
          leader: {
            select: { id: true, username: true, email: true },
          },
          members: {
            where: { userId },
            select: { role: true, joinedAt: true },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.debug('Team findByMember', { userId, count: teams.length });
      return teams;
    } catch (error) {
      logger.error('Team findByMember error', { userId, error });
      throw error;
    }
  }

  // Get team members
  async getTeamMembers(teamId: string): Promise<{
    id: string;
    userId: string;
    role: TeamRole;
    joinedAt: Date;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }[]> {
    try {
      const members = await prisma.teamMembership.findMany({
        where: { teamId },
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });

      logger.debug('Team getTeamMembers', { teamId, count: members.length });
      return members;
    } catch (error) {
      logger.error('Team getTeamMembers error', { teamId, error });
      throw error;
    }
  }

  // Add team member
  async addMember(teamId: string, userId: string, role: TeamRole = TeamRole.MEMBER): Promise<void> {
    try {
      await prisma.teamMembership.create({
        data: {
          teamId,
          userId,
          role,
        },
      });

      logger.info('Team addMember', { teamId, userId, role });
    } catch (error) {
      logger.error('Team addMember error', { teamId, userId, role, error });
      throw error;
    }
  }

  // Remove team member
  async removeMember(teamId: string, userId: string): Promise<void> {
    try {
      await prisma.teamMembership.delete({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      logger.info('Team removeMember', { teamId, userId });
    } catch (error) {
      logger.error('Team removeMember error', { teamId, userId, error });
      throw error;
    }
  }

  // Update member role
  async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<void> {
    try {
      await prisma.teamMembership.update({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
        data: { role },
      });

      logger.info('Team updateMemberRole', { teamId, userId, role });
    } catch (error) {
      logger.error('Team updateMemberRole error', { teamId, userId, role, error });
      throw error;
    }
  }

  // Check if user is team member
  async isMember(teamId: string, userId: string): Promise<boolean> {
    try {
      const membership = await prisma.teamMembership.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      return !!membership;
    } catch (error) {
      logger.error('Team isMember error', { teamId, userId, error });
      throw error;
    }
  }

  // Get user's role in team
  async getUserRole(teamId: string, userId: string): Promise<TeamRole | null> {
    try {
      const membership = await prisma.teamMembership.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
        select: { role: true },
      });

      return membership?.role || null;
    } catch (error) {
      logger.error('Team getUserRole error', { teamId, userId, error });
      throw error;
    }
  }

  // Get team statistics
  async getStats(teamId: string): Promise<{
    memberCount: number;
    projectCount: number;
    activeProjects: number;
    completedProjects: number;
  }> {
    try {
      const [
        memberCount,
        projectCount,
        activeProjects,
        completedProjects,
      ] = await Promise.all([
        prisma.teamMembership.count({ where: { teamId } }),
        prisma.project.count({ where: { teamId } }),
        prisma.project.count({ where: { teamId, status: 'ACTIVE' } }),
        prisma.project.count({ where: { teamId, status: 'COMPLETED' } }),
      ]);

      const stats = {
        memberCount,
        projectCount,
        activeProjects,
        completedProjects,
      };

      logger.debug('Team getStats', { teamId, stats });
      return stats;
    } catch (error) {
      logger.error('Team getStats error', { teamId, error });
      throw error;
    }
  }
}
