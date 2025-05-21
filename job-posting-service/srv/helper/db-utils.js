import cds from '@sap/cds';

// sql Insert, Delete 쿼리 사용 가능
const { INSERT, DELETE } = cds.ql;
// 호출된 db entity 사용 가능
const { JobPostings, DocumentChunks } = cds.entities;

// db Insert를 위한 Json 객체 생성
export function createEmbeddingEntries([embeddings, splitDocuments]) {
    // 임베딩 항목 보관 배열
    let embeddingEntries = [];

    // 임베딩 반복하며 임베딩에 대한 json 객체 생성
    for (const [index, embedding] of embeddings.entries()) {
        const embeddingEntry = {
          metadata: splitDocuments[index].metadata.source,
          text_chunk: splitDocuments[index].pageContent,
          embedding: `[${embedding}]`
        };
        embeddingEntries.push(embeddingEntry);
    }

    return embeddingEntries;
}

// 벡터 임베딩 항목 DocumentChunks 테이블에 삽입
export async function insertVectorEmbeddings(embeddingEntries) {
    try {
        await INSERT.into(DocumentChunks).entries(embeddingEntries);

        return `Embeddings inserted successfully to table.`;
    } catch (error) {
      console.log(`Error while storing the vector embeddings to SAP HANA Cloud: ${error.toString()}`);
      throw error;
    }
}

// 벡터 임베딩 삭제
export async function deleteVectorEmbeddings() {
    try {
        await DELETE.from(DocumentChunks);
        return 'Successfully deleted Document Chunks!';
    } catch (error) {
      console.log(`Error while deleting Document Chunks: \n ${JSON.stringify(error.response)}`);
    }
}

// -- 채용공고 삽입 및 삭제 구현 -- 
// 사용자 쿼리와 채팅 모덱의 RAG 응답 [검색증강, 사용자 쿼리 기반으로 벡터디비에서 유사도 높은 내용 추출하여 생성형 AI에 함께 전달하여 정확도 높은 응답 유도 ]
export function createJobPosting([userQuery, ragResponse]) {
  const entry = {
    user_query: userQuery,
    rag_response: ragResponse
  };
  return entry;
}
// 벡터 데이터베이스에 삽입
export async function insertJobPosting(jobPosting) {
  try {
    await INSERT.into(JobPostings).entries(jobPosting);
    return 'Job Posting inserted successfully to the table.';
  } catch (error) {
      console.log(`Error while storing the Job Posting to SAP HANA Cloud. \n Error: ${error.response}`);
      throw error;
  }
}

// 벡테 데이터베이스에 개별 삭제 / 전체 삭제
export async function deleteJobPosting(withID) {
  try {
    await DELETE.from(JobPostings).where(JobPostings.id == withID);
    return `Successfully deleted Job Posting with ID: ${withID}`;
  } catch (error) {
    console.log(`Error while deleting Job Posting with ID: ${withID} because: \n Error: ${error.response}`);
    throw error;
  }
}
export async function deleteJobPostings() {
  try {
    await DELETE.from(JobPostings);
    return 'Successfully deleted Job Postings!';
  } catch (error) {
    console.log(`Error while deleting Job Postings: \n Error: ${error.response}`);
  }
}



