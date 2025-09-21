import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({
    description: 'Unique identifier for the vehicle',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Type of vehicle',
    example: 'Car',
    enum: ['Car', 'Bike', 'SUV', 'Truck', 'Van'],
  })
  @Column({ length: 50 })
  type: string;

  @ApiProperty({
    description: 'Vehicle brand',
    example: 'Toyota',
  })
  @Column({ length: 100 })
  brand: string;

  @ApiProperty({
    description: 'Vehicle model name',
    example: 'Camry',
  })
  @Column({ length: 100 })
  model: string;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Blue',
  })
  @Column({ length: 50 })
  color: string;

  @ApiProperty({
    description: 'Engine size specification',
    example: '2.5L',
  })
  @Column({ length: 50 })
  engineSize: string;

  @ApiProperty({
    description: 'Manufacturing year',
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @Column()
  year: number;

  @ApiProperty({
    description: 'Vehicle price in USD',
    example: 25000.00,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'AI-generated or custom vehicle description',
    example: 'Experience the perfect blend of reliability and performance with this stunning Toyota Camry...',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    description: 'Array of image URLs from S3/CloudFront',
    example: ['https://cloudfront-url.com/vehicle1/image1.jpg', 'https://cloudfront-url.com/vehicle1/image2.jpg'],
    type: [String],
  })
  @Column('json')
  images: string[];

  @ApiProperty({
    description: 'Vehicle creation timestamp',
    example: '2023-09-18T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Vehicle last update timestamp',
    example: '2023-09-18T15:45:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}