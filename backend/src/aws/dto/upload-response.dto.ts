import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({
    description: "URLs of successfully uploaded images",
    example: [
      "https://cloudfront-url.com/vehicles/123/image1.jpg",
      "https://cloudfront-url.com/vehicles/123/image2.jpg",
    ],
    type: [String],
  })
  imageUrls: string[];

  @ApiProperty({
    description: "Number of successfully uploaded images",
    example: 2,
  })
  uploadedCount: number;
}
