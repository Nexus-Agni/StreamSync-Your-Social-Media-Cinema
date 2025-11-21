import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const healthCheckRouter = Router();

healthCheckRouter.route('/').get(healthcheck);

export default healthCheckRouter