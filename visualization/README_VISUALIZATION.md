# SQL 윈도우 함수 시각화 프로젝트

이 프로젝트는 SQL의 윈도우 함수를 시각적으로 설명하는 인터랙티브 웹 애플리케이션입니다.

## 기능

1. **프레임 절 시각화**
   - ROWS와 RANGE의 차이점 이해
   - 다양한 프레임 유형(CURRENT ROW, UNBOUNDED PRECEDING 등)에 따른 결과 확인
   - 윈도우 함수의 프레임이 어떻게 데이터를 선택하는지 시각적으로 확인

2. **PARTITION BY 시각화**
   - 데이터를 다양한 기준으로 파티셔닝하는 방법 이해
   - 윈도우 함수(AVG, SUM, COUNT, ROW_NUMBER, RANK)의 작동 방식 확인
   - ORDER BY와 함께 사용했을 때의 영향 확인

## 사용 방법

1. 웹 서버를 사용하여 `WindowFunctionVisualization.html` 파일을 호스팅합니다.
2. 또는 VS Code의 Live Server 확장 프로그램을 사용하여 실행합니다.

### VS Code Live Server로 실행하기

1. VS Code에 Live Server 확장 프로그램이 설치되어 있지 않다면 설치합니다.
2. HTML 파일을 열고 우클릭한 다음 "Live Server로 열기"를 선택합니다.
3. 브라우저가 자동으로 열리며 애플리케이션이 실행됩니다.

### 로컬 웹 서버로 실행하기

아래 명령어를 터미널에서 실행합니다:

```bash
cd /Users/sons-wook/class_source/dbAdvanced
python3 -m http.server 8000
```

그런 다음 브라우저에서 `http://localhost:8000/WindowFunctionVisualization.html`로 접속합니다.

## 파일 구조

- `WindowFunctionVisualization.html`: 메인 HTML 파일
- `WindowFunctionVisualization.jsx`: 프레임 절 시각화 컴포넌트
- `WindowFunctionPartitionVisualization.jsx`: PARTITION BY 시각화 컴포넌트

## 기술 스택

- React (CDN 버전)
- Tailwind CSS (CDN 버전)
- Babel (JSX 변환용)
