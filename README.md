
- GPT, Gemini, Claude 응답후 3개의 답변을 한번에 비교 및 선택하는 서비스

- 어플리케이션 요청 및 처리 흐름
   - 1) User 요청 -> 
   - 2) 기본적인 정적 위험 필터링(Rule.json 기반 정적 비교)
   - 3) Nvidia 에서 제공하는 Nemo Guardralil 사용으로 다시한번 필터링 (LLM 호출로 비교)
   - 4) 각각의 LLM 으로 요청  
   - 5) 3개의 응답을 비교 및 선택, 대화
 
- 가드레일 사용 이유 LLM 요청 전 인풋값 벨리데이션 및 불필요한 요청 방지

  
- 개발 진행중인 화면
  - <img width="1911" height="907" alt="image" src="https://github.com/user-attachments/assets/23f7740d-8fd8-4eec-a36b-ab87cc9bd7df" />

- Application Url: 
   - https://app.parallex-ai.site/
