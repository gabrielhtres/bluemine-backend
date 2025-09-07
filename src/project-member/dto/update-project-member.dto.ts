import { PartialType } from '@nestjs/mapped-types';
import { SyncProjectMemberDto } from './sync-project-member.dto';

export class UpdateProjectMemberDto extends PartialType(SyncProjectMemberDto) {}
