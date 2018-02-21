import {UnitOfWork} from '../../db';
const MockLogger = require('../mocks/logger');
const logger = new MockLogger(false);

const uow = new UnitOfWork(logger);

export default uow;