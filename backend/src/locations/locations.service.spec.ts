import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: any;

  const mockPrisma = {
    location: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of locations sorted by name', async () => {
      const mockLocations = [
        { locationId: '1', locationName: 'A Location', description: 'Desc A', coordinates: 'Coord A', region: 'North' },
        { locationId: '2', locationName: 'B Location', description: 'Desc B', coordinates: 'Coord B', region: 'South' },
      ];
      prisma.location.findMany.mockResolvedValue(mockLocations);

      const result = await service.findAll();
      expect(prisma.location.findMany).toHaveBeenCalledWith({ orderBy: { locationName: 'asc' } });
      expect(result).toEqual(mockLocations);
    });
  });

  describe('findOne', () => {
    it('should return location if found', async () => {
      const mockLocation = { locationId: '1', locationName: 'A Location', description: 'Desc A', coordinates: 'Coord A', region: 'Central' };
      prisma.location.findUnique.mockResolvedValue(mockLocation);

      const result = await service.findOne('1');
      expect(prisma.location.findUnique).toHaveBeenCalledWith({ where: { locationId: '1' } });
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException if location not found', async () => {
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new location', async () => {
      const dto = { locationName: 'New Location', description: 'New Desc', region: 'North' as const };
      const createdLocation = { locationId: '1', ...dto, coordinates: null };
      prisma.location.create.mockResolvedValue(createdLocation);

      const result = await service.create(dto);
      expect(prisma.location.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdLocation);
    });

    it('should create a location without region (optional field)', async () => {
      const dto = { locationName: 'No Region', description: 'Desc' };
      const createdLocation = { locationId: '2', ...dto, coordinates: null, region: null };
      prisma.location.create.mockResolvedValue(createdLocation);

      const result = await service.create(dto);
      expect(prisma.location.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdLocation);
      expect(result.region).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing location', async () => {
      const dto = { locationName: 'Updated', region: 'Central' as const };
      const existing = { locationId: '1', locationName: 'Old', description: null, coordinates: null, region: 'North' };
      const updated = { ...existing, ...dto };
      prisma.location.findUnique.mockResolvedValue(existing);
      prisma.location.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);
      expect(prisma.location.update).toHaveBeenCalledWith({ where: { locationId: '1' }, data: dto });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if location does not exist', async () => {
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.update('x', { locationName: 'Y' })).rejects.toThrow(NotFoundException);
      expect(prisma.location.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a location not used by any post', async () => {
      const existing = { locationId: '1', locationName: 'Loc', description: null, coordinates: null, region: 'North' };
      prisma.location.findUnique.mockResolvedValue(existing);
      prisma.post.count.mockResolvedValue(0);
      prisma.location.delete.mockResolvedValue(existing);

      const result = await service.remove('1');
      expect(prisma.post.count).toHaveBeenCalledWith({ where: { locationId: '1' } });
      expect(prisma.location.delete).toHaveBeenCalledWith({ where: { locationId: '1' } });
      expect(result).toEqual(existing);
    });

    it('should throw ConflictException if location is used by posts', async () => {
      const existing = { locationId: '1', locationName: 'Loc', description: null, coordinates: null, region: 'North' };
      prisma.location.findUnique.mockResolvedValue(existing);
      prisma.post.count.mockResolvedValue(3);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(prisma.location.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if location does not exist', async () => {
      prisma.location.findUnique.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toThrow(NotFoundException);
    });
  });
});
