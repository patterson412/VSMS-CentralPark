import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontUrl: string;

  // Image upload restrictions
  private readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILES_PER_UPLOAD = 5;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    );
    const region = this.configService.get<string>("AWS_REGION");

    this.bucketName = this.configService.get<string>(
      "AWS_S3_BUCKET_NAME",
      "vehicle-sales-images",
    );
    this.cloudFrontUrl = this.configService.get<string>(
      "AWS_CLOUDFRONT_URL",
      "https://dummy-cloudfront-url.cloudfront.net",
    );

    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error("Missing AWS S3 configuration values");
    }

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadVehicleImages(
    files: Express.Multer.File[],
    vehicleId: string,
  ): Promise<string[]> {
    // Validate number of files
    if (files.length > this.MAX_FILES_PER_UPLOAD) {
      throw new BadRequestException(
        `Maximum ${this.MAX_FILES_PER_UPLOAD} files allowed per upload`,
      );
    }

    // Validate each file
    for (const file of files) {
      this.validateImageFile(file);
    }

    const uploadPromises = files.map((file, index) =>
      this.uploadSingleImage(
        file,
        `vehicles/${vehicleId}/image-${Date.now()}-${index}`,
      ),
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("AWS S3 Upload Error:", error);
      throw new InternalServerErrorException("Failed to upload images to S3");
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new InternalServerErrorException("Failed to delete image");
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large: ${file.size} bytes. Maximum size: ${this.MAX_FILE_SIZE} bytes (5MB)`,
      );
    }
  }

  private async uploadSingleImage(
    file: Express.Multer.File,
    keyPrefix: string,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(file.mimetype);
    const key = `${keyPrefix}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    return `${this.cloudFrontUrl}/${key}`;
  }

  private getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case "image/jpeg":
      case "image/jpg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      default:
        return ".jpg";
    }
  }
}
