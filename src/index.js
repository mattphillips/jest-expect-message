import withMessage from './withMessage';

global.expect = withMessage(global.expect);
