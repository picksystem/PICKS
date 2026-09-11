import { Request, Response } from 'express';
import { prisma } from '@serviceops/database';
import { PrismaCustomFieldGateway } from '@serviceops/core/infrastructure';
import {
  CreateCustomFieldUseCase,
  DeleteCustomFieldUseCase,
  GetCustomFieldByIdUseCase,
  GetCustomFieldsUseCase,
  UpdateCustomFieldUseCase,
} from 'libs/core/use-cases/admin/customField';
import { ICustomField } from '@serviceops/interfaces';

const gateway = new PrismaCustomFieldGateway(prisma as any);

const getCustomFieldsUseCase = new GetCustomFieldsUseCase(gateway);
const getCustomFieldByIdUseCase = new GetCustomFieldByIdUseCase(gateway);
const createCustomFieldUseCase = new CreateCustomFieldUseCase(gateway);
const updateCustomFieldUseCase = new UpdateCustomFieldUseCase(gateway);
const deleteCustomFieldUseCase = new DeleteCustomFieldUseCase(gateway);

function ticketTypeFrom(req: Request): string {
  return (req.query.ticketType as string) || req.body.ticketType || '';
}

export class CustomFieldController {
  get = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = ticketTypeFrom(req);
      if (!ticketType) {
        res.status(400).json({ message: 'ticketType query param is required' });
        return;
      }
      const data = await getCustomFieldsUseCase.execute(ticketType);
      res.json({ data, message: 'Custom fields retrieved successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch custom fields' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = ticketTypeFrom(req);
      const { id } = req.params;
      if (!ticketType) {
        res.status(400).json({ message: 'ticketType query param is required' });
        return;
      }
      const data = await getCustomFieldByIdUseCase.execute(ticketType, id);
      if (!data) {
        res.status(404).json({ message: 'Custom field not found' });
        return;
      }
      res.json({ data, message: 'Custom field retrieved successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch custom field' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = ticketTypeFrom(req);
      if (!ticketType) {
        res.status(400).json({ message: 'ticketType query param is required' });
        return;
      }
      const field = req.body;
      if (!field?.id || !field?.fieldName || !field?.fieldType) {
        res.status(400).json({ message: 'id, fieldName, and fieldType are required' });
        return;
      }
      const data = await createCustomFieldUseCase.execute(ticketType, field);
      res.status(201).json({ data, message: 'Custom field created successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to create custom field' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = ticketTypeFrom(req);
      const { id } = req.params;
      if (!ticketType) {
        res.status(400).json({ message: 'ticketType query param is required' });
        return;
      }

      // Support both bulk (array) and single field updates.
      const fields: ICustomField[] = Array.isArray(req.body) ? req.body : [req.body];

      const invalid = fields.find((f) => !f?.id || !f?.fieldName || !f?.fieldType);
      if (invalid) {
        res.status(400).json({ message: 'Each field must have id, fieldName, and fieldType' });
        return;
      }

      // Get current DB state — the gateway's update() only replaces matching
      // fields, it never removes. So we must explicitly delete any field that
      // exists in the DB but is absent from the incoming payload.
      const existing = await getCustomFieldsUseCase.execute(ticketType);
      const incomingIds = new Set(fields.map((f) => f.id));
      for (const existingField of existing) {
        if (!incomingIds.has(existingField.id)) {
          await deleteCustomFieldUseCase.execute(ticketType, existingField.id);
        }
      }

      // Apply remaining updates one by one — each gateway.update() replaces
      // matching fields by id and returns the full updated array.
      let result: ICustomField[] = [];
      for (const field of fields) {
        result = await updateCustomFieldUseCase.execute(ticketType, field);
      }
      res.json({ data: result, message: 'Custom field updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to update custom field' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketType = ticketTypeFrom(req);
      const { id } = req.params;
      if (!ticketType) {
        res.status(400).json({ message: 'ticketType query param is required' });
        return;
      }
      const data = await deleteCustomFieldUseCase.execute(ticketType, id);
      res.json({ data, message: 'Custom field deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to delete custom field' });
    }
  };
}

export default CustomFieldController;
