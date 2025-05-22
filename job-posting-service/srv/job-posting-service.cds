using {sap.llm as db} from '../db/schema';

service JobPostingService {
    entity DocumentChunks as
        projection on db.DocumentChunks
        excluding {
            embedding
        };

    entity JobPostings    as projection on db.JobPostings;

    function createVectorEmbeddings()               returns String;
    function deleteVectorEmbeddings()               returns String;
    // 구인공고 생성 user_query : 채팅 모델에 대한 사용자 입력을 나타내는 매개변수로 성공 또는 오류 문자열 메시지를 반환
    // AI 허브와 상호 작용하여 쿼리 처리하고 프록시 채팅 모델이 채용 공고 생성하도록 함. 사용자가 제공한 상황정보 기반으로 채용 공고 생성하는 RAG 흐름 
    // AI Launchpad의 오케스트레이션 서비스로 AI 모델과의 상호작용을 간소화하고, Langchain 패키지를 사용하여 AI 솔루션과 쉽게 연결하고 상호작용할 수 있도록 지원
    function createJobPosting(user_query : String)  returns String;
    // 구인공고 삭제 (개별 삭제/전체 삭제)
    function deleteJobPosting(id : String)          returns String;
    function deleteJobPostings()                    returns String;
}