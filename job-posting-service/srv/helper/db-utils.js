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
      console.log(
        `Error while storing the vector embeddings to SAP HANA Cloud: ${error.toString()}`
      );
      throw error;
    }
}

// 벡터 임베딩 삭제
export async function deleteVectorEmbeddings() {
    try {
        await DELETE.from(DocumentChunks);
        return 'Successfully deleted Document Chunks!';
    } catch (error) {
      console.log(
        `Error while deleting Document Chunks: \n ${JSON.stringify(error.response)}`
      );
    }
}