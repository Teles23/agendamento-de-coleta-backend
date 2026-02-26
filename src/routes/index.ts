import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CollectionController } from '../controllers/CollectionController';
import { MaterialController } from '../controllers/MaterialController';
import { authMiddleware } from '../middlewares/auth';

const routes = Router();
const authController = new AuthController();
const collectionController = new CollectionController();
const materialController = new MaterialController();

// Auth routes
routes.post('/auth/login', authController.login);

// Public Collection routes
routes.post('/collections', collectionController.create);
routes.get('/materials', materialController.list); // Public to allow citizens to see options

// Private routes (protected)
routes.use(authMiddleware);

// Collections management
routes.get('/collections', collectionController.list);
routes.get('/collections/:id', collectionController.detail);
routes.patch('/collections/:id/status', collectionController.updateStatus);

// Materials management (RF006 - Diferencial)
routes.post('/materials', materialController.create);
routes.put('/materials/:id', materialController.update);
routes.delete('/materials/:id', materialController.delete);

export default routes;
