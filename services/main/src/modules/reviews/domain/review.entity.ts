import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('reviews')
@Index(['productId', 'userId'], { unique: true })
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** ID del producto en MongoDB (ObjectId como string). */
    @Index()
    @Column({ type: 'varchar', length: 255 })
    productId: string;

    /** ID del usuario en Keycloak (sub del token). */
    @Index()
    @Column({ type: 'varchar', length: 255 })
    userId: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
