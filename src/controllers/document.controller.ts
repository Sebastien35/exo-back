import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    NotFoundException,
    ConflictException,
    Request,
    UseGuards,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Document } from '../entity/document.entity';
  import { getTenantDataSource } from '../databases/tenants.config';
  import { JwtAuthGuard } from '../guard/jw-auth.guard';
  import { User } from '../entity/user.entity';
  
  @Controller('documents')
  export class DocumentController {
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req): Promise<Document[]> {
      const user: User = req.user;
  
      if (user.role !== 'admin') {
        throw new UnauthorizedException('You are not authorized to access this resource');
      }
  
      if (!user.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const documentRepository = tenantDataSource.getRepository(Document);
      return documentRepository.find();
    }
  
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string): Promise<Document> {
      const user: User = req.user;
  
      if (!user.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const documentRepository = tenantDataSource.getRepository(Document);
  
      const doc = await documentRepository.findOneBy({ id });
      if (!doc) {
        throw new NotFoundException('Document not found');
      }
  
      return doc;
    }
  
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() body: Partial<Document>): Promise<Document> {
      const user: User = req.user;
  
      if (!user.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const documentRepository = tenantDataSource.getRepository(Document);
  
      const existing = await documentRepository.findOne({ where: { name: body.name } });
      if (existing) {
        throw new ConflictException('A document with this name already exists');
      }
  
      const newDoc = documentRepository.create(body);
      return documentRepository.save(newDoc);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Request() req, @Param('id') id: string, @Body() body: Partial<Document>): Promise<Document> {
      const user: User = req.user;
  
      if (!user.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const documentRepository = tenantDataSource.getRepository(Document);
  
      const doc = await documentRepository.findOneBy({ id });
      if (!doc) {
        throw new NotFoundException('Document not found');
      }
  
      await documentRepository.update(id, body);
      const updatedDoc = await documentRepository.findOneBy({ id });
      if (!updatedDoc) {
        throw new NotFoundException('Document not found after update');
      }
  
      return updatedDoc;
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
      const user: User = req.user;
  
      if (!user.tenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const documentRepository = tenantDataSource.getRepository(Document);
  
      const doc = await documentRepository.findOneBy({ id });
      if (!doc) {
        throw new NotFoundException('Document not found');
      }
  
      await documentRepository.delete(id);
      return { message: 'Document deleted successfully' };
    }
  }
  