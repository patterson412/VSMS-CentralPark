import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { AwsService } from "./aws.service";
import { UploadResponseDto } from "./dto/upload-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("aws")
@Controller("aws")
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post("upload/:vehicleId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @UseInterceptors(FilesInterceptor("images", 5)) // Max 5 files
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload vehicle images",
    description:
      "Upload multiple images for a vehicle (max 5, 5MB each). Admin authentication required.",
  })
  @ApiResponse({
    status: 201,
    description: "Images uploaded successfully",
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid files or file validation failed",
  })
  async uploadVehicleImages(
    @Param("vehicleId") vehicleId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    const imageUrls = await this.awsService.uploadVehicleImages(
      files,
      vehicleId,
    );

    return {
      imageUrls,
      uploadedCount: imageUrls.length,
    };
  }

  @Delete("image/:key")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete image",
    description:
      "Delete an image from S3 storage. Admin authentication required.",
  })
  @ApiResponse({
    status: 204,
    description: "Image deleted successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 500, description: "Failed to delete image" })
  async deleteImage(@Param("key") key: string): Promise<void> {
    // Decode the key as it might be URL encoded
    const decodedKey = decodeURIComponent(key);
    return this.awsService.deleteImage(decodedKey);
  }
}
