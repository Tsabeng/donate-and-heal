// routes/requestRoutes.ts
import { getRequests, createRequest } from '../controllers/requestController.js';
import { protect, doctorOnly } from '../middleware/auth.js';

router.get('/', protect, doctorOnly, getRequests);
router.post('/', protect, doctorOnly, createRequest);