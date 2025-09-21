import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("admins")
export class Admin {
  @ApiProperty({
    description: "Unique identifier for the admin",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Admin username for login",
    example: "admin",
  })
  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @ApiProperty({
    description: "Admin creation timestamp",
    example: "2023-09-18T10:30:00Z",
  })
  @CreateDateColumn()
  createdAt: Date;
}
