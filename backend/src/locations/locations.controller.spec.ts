import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

describe('LocationsController', () => {
  let controller: LocationsController;
  let service: any;

  const mockLocationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [{ provide: LocationsService, useValue: mockLocationsService }],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of locations', async () => {
      const mockLocations = [
        { locationId: '1', locationName: 'A Location', description: null, coordinates: null, region: 'North' },
      ];
      service.findAll.mockResolvedValue(mockLocations);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLocations);
    });
  });

  describe('findOne', () => {
    it('should return a single location by ID', async () => {
      const mockLocation = { locationId: '1', locationName: 'A Location', description: null, coordinates: null, region: 'North' };
      service.findOne.mockResolvedValue(mockLocation);

      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockLocation);
    });
  });

  describe('create', () => {
    it('should create and return a new location', async () => {
      const dto = { locationName: 'New Location', region: 'South' as const };
      const mockLocation = { locationId: '1', locationName: 'New Location', description: null, coordinates: null, region: 'South' };
      service.create.mockResolvedValue(mockLocation);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLocation);
    });

    it('should create a location without region', async () => {
      const dto = { locationName: 'No Region Location' };
      const mockLocation = { locationId: '2', locationName: 'No Region Location', description: null, coordinates: null, region: null };
      service.create.mockResolvedValue(mockLocation);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLocation);
    });
  });

  describe('update', () => {
    it('should update a location by ID', async () => {
      const dto = { locationName: 'Updated', region: 'Central' as const };
      const mockLocation = { locationId: '1', locationName: 'Updated', description: null, coordinates: null, region: 'Central' };
      service.update.mockResolvedValue(mockLocation);

      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockLocation);
    });
  });

  describe('remove', () => {
    it('should remove a location by ID', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
