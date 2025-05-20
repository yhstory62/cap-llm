import { AzureOpenAiEmbeddingClient, } from '@sap-ai-sdk/langchain';

// 임베딩 모델의 이름
const embeddingModelName = 'text-embedding-3-small';
// 리소스 그룹명
const resourceGroup = 'new-resource-group';

import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import path from 'path';

async function createVectorEmbeddings() {
    try {
        const loader = new TextLoader(path.resolve('db/data/demo_grounding.txt'));
        const document = await loader.load();

        // 문서 내의 텍스트를 지정된 크기로 분할
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,           // Aim for ~400 characters/tokens
            chunkOverlap: 50,         // Include 50 chars of overlap to maintain context
            separators: ["\n\n", "\n", ".", " ", ""],  // Recursive priority: break by paragraph > line > sentence > word > char
        });
      
        // 문서 로드
        const splitDocuments = await splitter.splitDocuments(document);
      
        // 텍스트 분할 값을 추출하기 위한 간단한 배열 루프
        const textSplits = [];
          for (const chunk of splitDocuments) {
            textSplits.push(chunk.pageContent);
        }
        // 임베딩 클라이언트 생성
        const embeddingClient = new AzureOpenAiEmbeddingClient({
            modelName: embeddingModelName,
            maxRetries: 0,
            resourceGroup: resourceGroup
        });
        // 문서 분할 임베딩 하기 위한 임베딩 클라이언트 호출
        const embeddings = await embeddingClient.embedDocuments(textSplits);
        // 임베딩, 문서 분할, 경로 반환
        return [embeddings, splitDocuments];
    } catch (error) {
       console.log(
        `Error while creating Vector Embeddings.
        Error: ${error.response}`
      );
      throw error;
    }
}

export { createVectorEmbeddings};