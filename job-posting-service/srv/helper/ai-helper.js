import { AzureOpenAiEmbeddingClient, } from '@sap-ai-sdk/langchain';
import { OrchestrationClient, buildAzureContentSafetyFilter } from '@sap-ai-sdk/orchestration'
import cds from '@sap/cds';

const { DocumentChunks } = cds.entities;

// 임베딩 모델의 이름 (텍스트를 고차원 벡터로 변환하여 유사도 검색, 클러스터링, 의미 기반 검색 등에 사용-입력 텍스트를 의미 벡터로 변환하는 데 최적화 됨)
const embeddingModelName = 'text-embedding-3-small';
// 생성형 AI 모델, 질문-답변, 채팅, 요약, 문서 생성 등 다양한 언어 작업에 사용
const chatModelName = 'gpt-4o-mini';
// 리소스 그룹명
const resourceGroup = 'new-resource-group';

import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import path from 'path';

async function createVectorEmbeddings() {
    try {
        const loader = new TextLoader(path.resolve('db/data/demo_biztechi.txt'));
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
        console.log(`Error while creating Vector Embeddings.Error: ${error.response}`);
        throw error;
    }
}

async function orchestrateJobPostingCreation(user_query) {
    try {
        // RAG 흐름에 대한 전체 로직을 추가
        const embeddingClient = new AzureOpenAiEmbeddingClient({
            modelName: embeddingModelName,
            maxRetries: 0,
            resourceGroup: resourceGroup
        });
        // 임베딩 클라이언트 사용하여 사용자 쿼리를 임베디
        let embedding = await embeddingClient.embedQuery(user_query);
        // 코사인 유사도를 실행 SELECT 하고 사용자 쿼리의 주어진 벡터에 대한 코사인 유사도를 사용하여 결과를 정렬
        // cosine_similarity 는 기본 SQL 아님. HANA Cloud Vector Engine에서 추가된 기능
        let splits = await SELECT.from(DocumentChunks).orderBy`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) DESC`;

        // 목록에서 3개의 결과를 추출
        let text_chunks = splits.slice(0, 3).map((split) => split.text_chunk);

        // AZURE의 컨텐츠 안전성 필터 - ALLOW_SAFE : 안전한 컨텐츠만 사용
        const filter = buildAzureContentSafetyFilter({
            Hate: 'ALLOW_SAFE',         // 혐오 발언
            Violence: 'ALLOW_SAFE',     // 폭력성
            SelfHarm: 'ALLOW_SAFE',     // 자해/자살 관련
            Sexual: 'ALLOW_SAFE',       // 성적인 내용
        });

        // 준비된 관련 정보들을 활용하여 LLM, 템플릿, 필터를 전달하여 오케스트레이션 클라이언트를 생성
        const orchestrationClient = new OrchestrationClient(
            {
            llm: {
                model_name: chatModelName,
                model_params: { max_tokens: 1000, temperature: 0.1 },
            },
            templating: {
                template: [
                {
                    role: 'system',
                    content: `You are an assistant for HR recruiter and manager.
                    You are receiving a user query to create a job posting for new hires.
                    Consider the given context when creating the job posting to include company relevant information like pay range and employee benefits.
                    Consider all the input before responding.`,
                },
                {
                    role: 'user',
                    content: `Question: {{?question}}, context information: ${text_chunks}`,
                },
                ],
            },
            filtering: {
                input: {
                filters: [filter],
                },
                output: {
                filters: [filter],
                },
            }
            },
            { resourceGroup: resourceGroup }
        );

        const response = await orchestrationClient.chatCompletion({
            inputParams: {
                question: user_query
            }
        });
        console.log(`Successfully executed chat completion. ${response.getContent()}`);
        return [user_query, response.getContent()];

      } catch (error) {
        console.log(`Error while generating Job Posting. Error: ${error.response}`  );
        throw error;
    }
}

export { createVectorEmbeddings, orchestrateJobPostingCreation};