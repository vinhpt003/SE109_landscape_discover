import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        userId: '1',
        userName: 'testuser',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
        password: 'hashedCurrentPassword',
        createdAt: new Date(),
      }),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCloudinary = {
    deleteByPublicId: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Setup default mock return values before each test
    prisma.user.findUnique.mockResolvedValue({
      userId: '1',
      userName: 'testuser',
      email: 'test@example.com',
      role: 'RegisteredUser',
      avatar: null,
      password: 'hashedCurrentPassword',
      createdAt: new Date(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMe', () => {
    it('should return user info if found', async () => {
      const mockUser = {
        userId: '1',
        userName: 'testuser',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
        createdAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findMe('1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        select: {
          userId: true,
          userName: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findMe('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    const userId = '1';
    const updateDto = {
      userName: 'newname',
      avatar: 'newavatar',
    };

    it('should update profile successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(null); // No username clash
      const updatedUser = {
        userId,
        userName: 'newname',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: 'newavatar',
        createdAt: new Date(),
      };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateMe(userId, updateDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { userName: 'newname', NOT: { userId } },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: { userName: 'newname', avatar: 'newavatar' },
        select: {
          userId: true,
          userName: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if username is already taken', async () => {
      prisma.user.findFirst.mockResolvedValue({ userId: '2' }); // Taken by someone else
      await expect(service.updateMe(userId, { userName: 'taken' })).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if newPassword is provided without currentPassword', async () => {
      await expect(service.updateMe(userId, { newPassword: 'newPassword123' })).rejects.toThrow(BadRequestException);
    });

    it('should update password when both currentPassword and newPassword are valid', async () => {
      const existingUser = {
        userId,
        password: 'hashedCurrentPassword',
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      
      const updatedUser = {
        userId,
        userName: 'testuser',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
        createdAt: new Date(),
      };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateMe(userId, {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith('currentPassword123', 'hashedCurrentPassword');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: { password: 'hashedNewPassword' },
        select: {
          userId: true,
          userName: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw UnauthorizedException if currentPassword does not match', async () => {
      const existingUser = {
        userId,
        password: 'hashedCurrentPassword',
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateMe(userId, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});


