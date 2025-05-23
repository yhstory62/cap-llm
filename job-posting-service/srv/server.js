import cds from '@sap/cds';
import aiTokenRouter from './ai-token.js';

cds.on('bootstrap', app => {
  app.use(aiTokenRouter); // /ai-token 등 커스텀 라우트 등록
});