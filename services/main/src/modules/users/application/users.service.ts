import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email ${dto.email} ya está registrado`);
    }
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.usersRepository.findAll(skip, limit);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.remove(id);
  }
}
