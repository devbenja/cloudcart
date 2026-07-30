import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repo.create(data);
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async findAll(skip: number, take: number): Promise<[User[], number]> {
    return this.repo.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
