import * as AIHelper from './helper/ai-helper.js';
import * as DBUtils from './helper/db-utils.js';

export default function () {
    // AIHelper 호출의 결과를 벡터디비에 저장, 벡터 임베딩 생성
    this.on('createVectorEmbeddings', async req => {
        const embeddings = await AIHelper.createVectorEmbeddings();
        const embeddingEntries = await DBUtils.createEmbeddingEntries(embeddings);
        await DBUtils.insertVectorEmbeddings(embeddingEntries);
        return 'Vector embeddings created and stored in database';
    });
      
    // DBUtils 사용하여 벡터디비 삭제
    this.on('deleteVectorEmbeddings', async req => {
        return await DBUtils.deleteVectorEmbeddings();
    });    
}