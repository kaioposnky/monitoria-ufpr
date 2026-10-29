import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiClient, ApiClientError } from './api.client.js';
import {
  getResource,
  isResourceKey,
  type ResourceKey,
} from './resources.js';
import { renderDashboard, renderResourcePage } from './views.js';

@Controller()
export class AppController {
  constructor(private readonly apiClient: ApiClient) {}

  @Get()
  getHome(@Res() response: Response): void {
    response.type('html').send(renderDashboard());
  }

  @Get('health/backend')
  async backendHealth(@Req() request: Request, @Res() response: Response): Promise<void> {
    try {
      await this.apiClient.list('courses');
      response.status(200).json({ status: 'ok' });
    } catch (error) {
      response.status(this.errorStatus(error)).json({
        status: 'error',
        message: this.errorMessage(error),
        path: request.path,
      });
    }
  }

  @Get(':resource')
  async list(
    @Param('resource') resource: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!isResourceKey(resource)) {
      response.status(404).type('html').send(renderDashboard('Página não encontrada.'));
      return;
    }

    const definition = getResource(resource);
    try {
      const records = await this.apiClient.list(resource);
      const related = await this.loadRelated(resource);
      response.type('html').send(renderResourcePage(definition, records, related));
    } catch (error) {
      response
        .status(this.errorStatus(error))
        .type('html')
        .send(renderResourcePage(definition, [], {}, this.errorMessage(error)));
    }
  }

  @Post(':resource')
  async create(
    @Param('resource') resource: string,
    @Body() body: Record<string, string>,
    @Res() response: Response,
  ): Promise<void> {
    if (!isResourceKey(resource)) {
      response.status(404).type('html').send(renderDashboard('Recurso não encontrado.'));
      return;
    }
    try {
      await this.apiClient.create(resource, body);
      response.redirect(`/${resource}?success=created`);
    } catch (error) {
      const definition = getResource(resource);
      const related = await this.loadRelated(resource);
      response
        .status(this.errorStatus(error))
        .type('html')
        .send(renderResourcePage(definition, [], related, this.errorMessage(error), body));
    }
  }

  @Post(':resource/:id')
  async update(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
    @Res() response: Response,
  ): Promise<void> {
    if (!isResourceKey(resource)) {
      response.status(404).type('html').send(renderDashboard('Recurso não encontrado.'));
      return;
    }
    try {
      await this.apiClient.update(resource, id, body);
      response.redirect(`/${resource}?success=updated`);
    } catch (error) {
      const definition = getResource(resource);
      const related = await this.loadRelated(resource);
      response
        .status(this.errorStatus(error))
        .type('html')
        .send(renderResourcePage(definition, [], related, this.errorMessage(error), body));
    }
  }

  @Post(':resource/:id/delete')
  async remove(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!isResourceKey(resource)) {
      response.status(404).type('html').send(renderDashboard('Recurso não encontrado.'));
      return;
    }
    try {
      await this.apiClient.remove(resource, id);
      response.redirect(`/${resource}?success=deleted`);
    } catch (error) {
      const definition = getResource(resource);
      const related = await this.loadRelated(resource);
      response
        .status(this.errorStatus(error))
        .type('html')
        .send(renderResourcePage(definition, [], related, this.errorMessage(error)));
    }
  }

  private async loadRelated(resource: ResourceKey): Promise<Record<string, unknown[]>> {
    const relations = new Set(
      getResource(resource).fields
        .filter((field) => field.relation)
        .map((field) => field.relation as ResourceKey),
    );
    const entries = await Promise.all(
      [...relations].map(async (relation) => [relation, await this.apiClient.list(relation)] as const),
    );
    return Object.fromEntries(entries);
  }

  private errorStatus(error: unknown): number {
    return error instanceof ApiClientError ? error.status : 502;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof ApiClientError) {
      if (error.status === 400) return 'Dados inválidos. Revise os campos e tente novamente.';
      if (error.status === 404) return 'Registro não encontrado no backend.';
      if (error.status === 409) return 'A operação entra em conflito com um registro existente.';
      return `O backend retornou um erro (${error.status}).`;
    }
    return 'Não foi possível conectar ao backend Spring Boot.';
  }
}
