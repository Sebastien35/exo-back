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
    // 🔐 Protected route - Get all documents
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req): Promise<Document[]> {
        const user: User = req.user;
        if (user.role !== 'admin') {
        throw new UnauthorizedException('You are not authorized to access this resource');
        }

        const tenantDataSource = await getTenantDataSource(user.tenantId);
        const documentRepository = tenantDataSource.getRepository(Document);
        return await documentRepository.find();
    }

    // 🔐 Protected route - Get document by ID
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string): Promise<Document> {
        const user: User = req.user;
        const tenantDataSource = await getTenantDataSource(user.tenantId);
        const documentRepository = tenantDataSource.getRepository(Document);

        const doc = await documentRepository.findOneBy({ id });
        if (!doc) {
        throw new NotFoundException('Document not found');
        }

        return doc;
    }

    // 🔐 Protected route - Create document
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() body: Partial<Document>): Promise<Document> {
        const user: User = req.user;
        const tenantDataSource = await getTenantDataSource(user.tenantId);
        const documentRepository = tenantDataSource.getRepository(Document);

        const existing = await documentRepository.findOne({ where: { name: body.name } });
        if (existing) {
        throw new ConflictException('A document with this name already exists');
        }

        const newDoc = documentRepository.create(body);
        return await documentRepository.save(newDoc);
    }

    // 🔐 Protected route - Update document
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Request() req, @Param('id') id: string, @Body() body: Partial<Document>): Promise<Document> {
        const user: User = req.user;
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

    // 🔐 Protected route - Delete document
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
        const user: User = req.user;
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
  