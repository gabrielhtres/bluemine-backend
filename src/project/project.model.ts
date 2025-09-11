import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { ProjectMember } from 'src/models';

@Table({ tableName: 'projects' })
export class Project extends Model<Project> {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.ENUM('planned', 'active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'planned',
  })
  declare status: 'planned' | 'active' | 'completed' | 'cancelled';

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare endDate: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare managerId: number;

  @BelongsTo(() => User, 'managerId')
  declare manager: User;

  @BelongsToMany(() => User, () => ProjectMember)
  declare developers: Array<User & { ProjectMember: ProjectMember }>;
}
