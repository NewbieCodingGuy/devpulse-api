import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime!: Date | null;

  @Column({ type: "int", nullable: true })
  duration!: number | null;

  @Column({ type: "varchar" })
  language!: string;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ nullable: true, type: "text" })
  aiSummary!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
