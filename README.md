
- GPT, Gemini, Claude 응답후 3개의 답변을 한번에 비교 및 선택하는 서비스

- 처리 순서
   - User 요청 -> 기본적인 정적 위험 필터링(Rule.json 기반 정적 비교) -> Nemo Guardralil(LLM 호출로 비교) -> 각각의 LLM 으로 요청  -> 3개의 응답을 비교 및 선택, 대화
 
- 가드레일 사용 이유 LLM 요청 전 인풋값 벨리데이션 및 불필요한 요청 방지

  
- 개발 진행중인 화면
  - <img width="1911" height="907" alt="image" src="https://github.com/user-attachments/assets/23f7740d-8fd8-4eec-a36b-ab87cc9bd7df" />
