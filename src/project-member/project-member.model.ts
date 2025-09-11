import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';

@Table({ tableName: 'project_members' })
export class ProjectMember extends Model<ProjectMember> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare projectId: number;

  @BelongsTo(() => Project, 'projectId')
  declare project: Project;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @Column({
    type: DataType.ENUM('viewer', 'contributor', 'maintainer'),
    allowNull: false,
    defaultValue: 'viewer',
  })
  declare role: 'viewer' | 'contributor' | 'maintainer';
}
