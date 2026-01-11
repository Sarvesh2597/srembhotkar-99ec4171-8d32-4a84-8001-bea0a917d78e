import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;
}
