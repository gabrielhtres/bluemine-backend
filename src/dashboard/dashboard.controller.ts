import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna dados do dashboard baseado no role do usuário',
    description:
      'Retorna dados diferentes para admin/manager e developer conforme o role do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard retornados com sucesso.',
  })
  async getDashboard(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    if (!userId) {
      throw new Error('User ID not found');
    }

    if (userRole === 'developer') {
      return this.dashboardService.getDeveloperDashboard(+userId);
    } else {
      // Admin ou Manager
      return this.dashboardService.getAdminDashboard(+userId, userRole);
    }
  }
}
