import { Router } from 'express';
import { NotFoundController } from './NotFound.controller';
import { NotFoundService } from './NotFound.service';
import { NotFoundRepository } from './NotFound.repository';

const router = Router();

const repository = new NotFoundRepository();
const service = new NotFoundService(repository);
const controller = new NotFoundController(service);

/**
 * @route   POST /api/consultant/not-found
 * @desc    Create a new ConsultantNotFound entry
 * @access  Private
 */
router.post('/', controller.create);

/**
 * @route   GET /api/consultant/not-found
 * @desc    Get all ConsultantNotFound entries
 * @access  Private
 */
router.get('/', controller.getAll);

/**
 * @route   GET /api/consultant/not-found/:id
 * @desc    Get ConsultantNotFound entry by ID
 * @access  Private
 */
router.get('/:id', controller.getById);

/**
 * @route   PUT /api/consultant/not-found/:id
 * @desc    Update ConsultantNotFound entry (full update)
 * @access  Private
 */
router.put('/:id', controller.update);

/**
 * @route   PATCH /api/consultant/not-found/:id
 * @desc    Update ConsultantNotFound entry (partial update)
 * @access  Private
 */
router.patch('/:id', controller.update);

/**
 * @route   DELETE /api/consultant/not-found/:id
 * @desc    Delete ConsultantNotFound entry
 * @access  Private
 */
router.delete('/:id', controller.delete);

export default router;
