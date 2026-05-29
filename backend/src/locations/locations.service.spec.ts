import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: any;

  const mockPrisma = {
    location: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
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
        { locationId: '1', locationName: 'A Location', description: 'Desc A', coordinates: 'Coord A' },
        { locationId: '2', locationName: 'B Location', description: 'Desc B', coordinates: 'Coord B' },
      ];
      prisma.location.findMany.mockResolvedValue(mockLocations);

      const result = await service.findAll();
      expect(prisma.location.findMany).toHaveBeenCalledWith({ orderBy: { locationName: 'asc' } });
      expect(result).toEqual(mockLocations);
    });
  });

  describe('findOne', () => {
    it('should return location if found', async () => {
      const mockLocation = { locationId: '1', locationName: 'A Location', description: 'Desc A', coordinates: 'Coord A' };
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
      const dto = { locationName: 'New Location', description: 'New Desc' };
      const createdLocation = { locationId: '1', ...dto, coordinates: null };
      prisma.location.create.mockResolvedValue(createdLocation);

      const result = await service.create(dto);
      expect(prisma.location.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdLocation);
    });
  });
});
