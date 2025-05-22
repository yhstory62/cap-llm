import * as AIHelper from './helper/ai-helper.js';
import * as DBUtils from './helper/db-utils.js';

export default function () {
    // AIHelper 호출의 결과를 벡터디비에 저장, 벡터 임베딩 생성
    this.on('createVectorEmbeddings', async req => {
        try {
            const embeddings = await AIHelper.createVectorEmbeddings();
            const embeddingEntries = await DBUtils.createEmbeddingEntries(embeddings);
            await DBUtils.insertVectorEmbeddings(embeddingEntries);
            return 'Vector embeddings created and stored in database';
        } catch (e) {
            console.error(e);
            return `Error: ${e.message}`;
        }
    });
      
    // DBUtils 사용하여 벡터디비 삭제
    this.on('deleteVectorEmbeddings', async req => {
        return await DBUtils.deleteVectorEmbeddings();
    });    

    this.on('createJobPosting', async req => {
        // 사용자 쿼리 전달
        const user_query = req.data.user_query;
        validateInputParameter(user_query);

        // 오케스트레이션 클라이언트 호출하여 사용자 쿼리 사용한 구인공고 처리하여 디비에 생성할 entity를 구성한다.
        let jobPosting = await AIHelper.orchestrateJobPostingCreation(user_query);
        let entry = await DBUtils.createJobPosting(jobPosting);
        // 생성 항목 정보로 DB에 삽입 처리
        await DBUtils.insertJobPosting(entry);
        return 'Job posting created and stored in the database.';
    });
    
    this.on('deleteJobPosting', async req => {
        const id = req.data.id;
        validateInputParameter(id);
    
        return await DBUtils.deleteJobPosting(id);
    });
      
    this.on('deleteJobPostings', async () => {
        return await DBUtils.deleteJobPostings();
    });
}

const wrongInputError = 'Required input parameters not supplied';

function validateInputParameter(parameter) {
    if (typeof parameter === 'undefined') {
        throw new Error(wrongInputError);
    }
    
    function isEmpty(input) {
        return input.trim() === '';
    }
    
    if (isEmpty(parameter)) {
        throw new Error(wrongInputError);
    }
}