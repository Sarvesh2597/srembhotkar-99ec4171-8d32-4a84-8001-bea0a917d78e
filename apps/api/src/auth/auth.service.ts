import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { LoginDto, RegisterDto, AuthResponse, Role, IUserPayload } from '@task-management/data';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@task-management/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.VIEWER,
    });

    const savedUser = await this.userRepository.save(user);

    const payload: IUserPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      organizationId: savedUser.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        organizationId: savedUser.organizationId,
      },
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: IUserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    await this.auditService.log({
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.LOGIN,
      resource: 'auth',
      details: 'User logged in successfully',
      ipAddress,
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
      },
    };
  }

  async validateUser(payload: IUserPayload): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub },
    });
  }
}
