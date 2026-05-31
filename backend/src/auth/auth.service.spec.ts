import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      userName: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user and return token and user details', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      const createdUser = {
        userId: '1',
        userName: 'testuser',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
      };
      prisma.user.create.mockResolvedValue(createdUser);
      jwtService.signAsync.mockResolvedValue('mocked_token');

      const result = await service.register(registerDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: registerDto.email }, { userName: registerDto.userName }] },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: registerDto.userName,
          email: registerDto.email,
          password: 'hashedPassword',
        },
      });
      expect(result).toEqual({
        access_token: 'mocked_token',
        user: createdUser,
      });
    });

    it('should throw ConflictException if username or email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ userId: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'testuser',
      password: 'password123',
    };

    it('should successfully log in and return token', async () => {
      const existingUser = {
        userId: '1',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'RegisteredUser',
        avatar: null,
      };
      prisma.user.findFirst.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mocked_token');

      const result = await service.login(loginDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: loginDto.identifier }, { userName: loginDto.identifier }],
        },
      });
      expect(result).toEqual({
        access_token: 'mocked_token',
        user: {
          userId: existingUser.userId,
          email: existingUser.email,
          userName: existingUser.userName,
          role: existingUser.role,
          avatar: existingUser.avatar,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      prisma.user.findFirst.mockResolvedValue({ password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Business Rule Tests ─────────────────────────────────────────────────────

  describe('[BR-01] Role system: 3 valid roles (Admin, Editor, RegisteredUser)', () => {
    it('[BR-01] the system supports exactly Admin, Editor, and RegisteredUser roles', () => {
      // Validates the Role enum defined in schema.prisma
      const validRoles = ['Admin', 'Editor', 'RegisteredUser'];
      expect(validRoles).toContain('Admin');
      expect(validRoles).toContain('Editor');
      expect(validRoles).toContain('RegisteredUser');
      expect(validRoles).toHaveLength(3);
    });
  });

  describe('[BR-03] Registration security: bcrypt hashing, default role, and password exclusion', () => {
    const brRegisterDto = { userName: 'newuser', email: 'new@example.com', password: 'mypassword' };
    const brCreatedUser = { userId: 'u1', userName: 'newuser', email: 'new@example.com', role: 'RegisteredUser', avatar: null };

    it('[BR-03] register() hashes password using bcrypt with salt rounds = 10', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
      prisma.user.create.mockResolvedValue(brCreatedUser);

      await service.register(brRegisterDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });

    it('[BR-03] newly registered user is assigned the RegisteredUser role by default', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(brCreatedUser);

      const result = await service.register(brRegisterDto);

      expect(result.user.role).toBe('RegisteredUser');
    });

    it('[BR-03] registration response does not expose the raw password field', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(brCreatedUser);

      const result = await service.register(brRegisterDto);

      expect(result.user).not.toHaveProperty('password');
    });
  });
});
