## API 규격서

### 1. Request (요청)
* **Content-Type:** `application/json`

#### 파라미터 설명
| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :---: | :--- |
| **input_type** | String | 필수 | 입력 데이터의 타입을 지정합니다. (텍스트 요청 시 **`text`** 로 고정) |
| **content** | String | 필수 | 모델에게 전달할 질문 또는 명령 문구입니다. |
| **file_name** | String | 선택 | 첨부된 파일의 이름입니다. |
| **file_data** | String | 선택 | Base64 인코딩된 파일 데이터 문자열입니다. |

#### Request Example
```json
{
  "input_type": "text",
  "content": "이 파일내의 뜻을 알려줘",
  "file_name": "test.txt",
  "file_data": "aGVsbG8gd29ybGQ="
}
```

### 2. Response (응답)

| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| **status** | String | 요청 처리 성공 여부 (`success`, `fail`) |
| **request_id** | String | 요청을 식별하기 위한 고유 UUID |
| **results** | Array | 각 인공지능 모델별 처리 결과 리스트 |
| └ **model** | String | 결과를 반환한 모델 이름 (`gpt`, `gemini`, `claude` 등) |
| └ **result** | String | 모델이 생성한 답변 텍스트 (실패 시 `null`) |
| └ **error** | String/Object | 요청 실패 시 반환되는 에러 메시지 객체 (성공 시 `null`) |
| └ **latency_ms** | Float | 해당 모델의 답변 생성에 소요된 시간 (밀리초 단위) |
| **message** | String | API 전반에 관련된 추가 메시지 (없을 경우 `null`) |

```json
    {
    "status": "success",
    "request_id": "0be42c5e-a973-4e31-9df8-fc5a35c6e3df",
    "results": [
        {
            "model": "gpt",
            "result": "죄송하지만, 파일을 열어볼 수는 없습니다. 그러나 \"hello world\"라는 문장은 일반적으로 프로그래밍 언어의 첫 번째 예제로 많이 사용되는 문구입니다. 이 문장은 기본적으로 \"안녕하세요, 세상!\"이라는 의미로, 프로그램의 작동 여부를 확인하는 간단한 방법입니다. 추가적으로 궁금한 점이 있다면 말씀해 주세요!",
            "error": null,
            "latency_ms": 4304.33660000017
        },
        {
            "model": "gemini",
            "result": null,
            "error": "{\n  \"error\": {\n    \"code\": 503,\n    \"message\": \"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.\",\n    \"status\": \"UNAVAILABLE\"\n  }\n}\n",
            "latency_ms": 1278.9714999998978
        },
        {
            "model": "claude",
            "result": "죄송하지만, 저는 파일을 직접 열거나 다운로드할 수 없습니다.\n\n다만, 당신이 표시한 내용을 보면:\n\n**\"hello world\"**\n\n이것은 **\"안녕하세요, 세계\"** 또는 **\"안녕 세계\"**라는 뜻입니다.\n\n- **hello** = 안녕하세요, 안녕\n- **world** = 세계, 세상\n\n**프로그래밍에서의 의미:**\n- 프로그래밍을 배울 때 가장 먼저 작성하는 기초 프로그램을 \"Hello World\"라고 부릅니다.\n- 새로운 프로그래밍 언어나 환경을 배울 때 첫 번째 예제로 사용됩니다.\n\n혹시 다른 파일의 내용을 알고 싶으시다면, **파일의 내용을 직접 복사해서 붙여넣기** 해주시면 더 자세히 도와드리겠습니다!",
            "error": null,
            "latency_ms": 6928.7995000013325
        }
    ],
    "message": null
}

```