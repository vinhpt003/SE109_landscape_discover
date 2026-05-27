import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  const mockUsersService = {
    findMe: jest.fn(),
    updateMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const mockUser = {
        userId: '1',
        userName: 'testuser',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
      };
      service.findMe.mockResolvedValue(mockUser);

      const result = await controller.getMe({ userId: '1' });
      expect(service.findMe).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe', () => {
    it('should update and return the current user', async () => {
      const mockUser = {
        userId: '1',
        userName: 'newname',
        email: 'test@example.com',
        role: 'RegisteredUser',
        avatar: null,
      };
      const dto = { userName: 'newname' };
      service.updateMe.mockResolvedValue(mockUser);

      const result = await controller.updateMe({ userId: '1' }, dto);
      expect(service.updateMe).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockUser);
    });
  });
});

