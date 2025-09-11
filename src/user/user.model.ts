import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { Project, ProjectMember } from 'src/models';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM('admin', 'manager', 'developer'),
    allowNull: true,
  })
  declare role: 'admin' | 'manager' | 'developer';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare currentHashedRefreshToken?: string;

  @BelongsToMany(() => Project, () => ProjectMember)
  declare projects: Array<Project & { ProjectMember: ProjectMember }>;

  @HasMany(() => Project, 'managerId')
  declare managedProjects: Project[];
}
