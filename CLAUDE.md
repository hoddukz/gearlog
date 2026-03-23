# Gearlog — CLAUDE.md

> 이 파일은 Claude Code의 작업 규칙과 프로젝트 컨텍스트를 정의합니다.
> 모든 작업은 이 파일의 규칙을 최우선으로 따릅니다.

---

## ⚠️ 작업 원칙 (반드시 준수)

### 1. 지시한 것만 작업한다
- 요청한 범위를 **절대 벗어나지 않는다**
- "이왕 하는 김에", "관련된 것도 같이" 같은 자의적 확장 금지
- 리팩토링, 최적화, 스타일 개선 등 **요청하지 않은 변경 금지**

### 2. 확인 요청 = 확인만 한다
- "확인해줘", "봐줘", "체크해줘" → 확인 후 결과 보고만
- 확인하면서 발견한 문제를 **알아서 수정하지 않는다**
- 문제 발견 시: 발견한 내용을 보고하고, 수정 여부는 사용자에게 물어본다

### 3. 불확실하면 물어본다
- 요청이 모호하거나 방향이 여러 갈래일 때 → 먼저 물어본다
- 추측으로 작업하지 않는다

### 4. 작업 전 계획을 먼저 말한다
- 복잡한 작업은 "이렇게 진행하겠습니다" 먼저 보고 후 진행
- 사용자가 방향 확인 후 진행 지시를 내리면 그때 작업 시작

### 5. 커밋은 명시적으로 요청받을 때만
- 자동 커밋 금지
- 커밋 메시지는 한국어로 작성 (요청 없으면 영어도 가능)

---

## 🛠️ 기술 스택

```
Frontend:  Next.js 14 (App Router) + TypeScript
Styling:   Tailwind CSS + shadcn/ui
Charts:    Recharts
State:     Zustand + React Query (TanStack Query)

Backend:   Next.js API Routes
DB:        PostgreSQL via Supabase
ORM:       Prisma
Auth:      Supabase Auth (Google OAuth)
Cron:      Supabase Edge Functions

Deploy:    Vercel (Frontend + API)
           Supabase (DB + Auth)
```

---

## 📁 프로젝트 구조

```
gearlog/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 로그인/회원가입
│   ├── (dashboard)/        # 메인 대시보드
│   ├── vehicles/           # 차량 관리
│   ├── fuel/               # 주유 기록
│   ├── maintenance/        # 정비 이력
│   ├── memos/              # 정비 메모
│   ├── expenses/           # 비용 관리
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   └── [feature]/          # 기능별 컴포넌트
├── lib/
│   ├── supabase/           # Supabase 클라이언트
│   ├── prisma/             # Prisma 클라이언트
│   └── utils/              # 유틸 함수
├── prisma/
│   └── schema.prisma       # DB 스키마
└── CLAUDE.md               # 이 파일
```

---

## 🗄️ DB 스키마 요약

```prisma
model Vehicle {
  id            String          @id @default(cuid())
  userId        String
  name          String          // 차량명
  year          Int             // 연식
  fuelType      FuelType        // GASOLINE | DIESEL | HYBRID
  licensePlate  String?         // 번호판
  currentMileage Int            // 현재 주행거리
  purchasePrice Int?            // 구매가 (총 소유비용 계산용)
  createdAt     DateTime        @default(now())

  fuelLogs      FuelLog[]
  maintenanceLogs MaintenanceLog[]
  maintenanceMemos MaintenanceMemo[]
  expenseLogs   ExpenseLog[]
  reminders     Reminder[]
  gasStations   GasStation[]
}

model FuelLog {
  id          String   @id @default(cuid())
  vehicleId   String
  date        DateTime
  mileage     Int              // 주유 시 주행거리
  liters      Float            // 주유량
  pricePerL   Float            // 리터당 단가
  totalCost   Float            // 총 금액
  stationName String?          // 주유소명
  notes       String?
  createdAt   DateTime @default(now())
}

model MaintenanceLog {
  id          String   @id @default(cuid())
  vehicleId   String
  date        DateTime
  category    String           // 엔진/타이어/브레이크/전기/기타
  item        String           // 정비 항목명
  cost        Float
  mileage     Int
  shopName    String?          // 정비소명
  notes       String?
  memoId      String?          // 연결된 MaintenanceMemo
  createdAt   DateTime @default(now())
}

model MaintenanceMemo {
  id          String       @id @default(cuid())
  vehicleId   String
  category    String       // 엔진/타이어/브레이크/전기/기타
  content     String
  status      MemoStatus   // PENDING | SCHEDULED | DONE
  linkedLogId String?      // 완료 시 연결된 MaintenanceLog
  createdAt   DateTime     @default(now())
}

model ExpenseLog {
  id          String      @id @default(cuid())
  vehicleId   String
  category    ExpenseCategory  // FUEL | MAINTENANCE | INSURANCE | TAX | OTHER
  date        DateTime
  amount      Float
  notes       String?
  createdAt   DateTime    @default(now())
}

model Reminder {
  id            String       @id @default(cuid())
  vehicleId     String
  type          String       // 보험만기/자동차세/정비주기
  triggerDate   DateTime?
  triggerMileage Int?
  isSent        Boolean      @default(false)
  createdAt     DateTime     @default(now())
}

model GasStation {
  id            String   @id @default(cuid())
  vehicleId     String
  name          String
  lastPricePerL Float?   // 마지막 단가 (자동완성용)
  createdAt     DateTime @default(now())
}

enum FuelType { GASOLINE DIESEL HYBRID }
enum MemoStatus { PENDING SCHEDULED DONE }
enum ExpenseCategory { FUEL MAINTENANCE INSURANCE TAX OTHER }
```

---

## 🎯 기능 범위 (Phase별)

### Phase 1 — MVP
- Google 로그인 (Supabase Auth)
- 차량 등록 / 멀티 차량 전환
- 주유 기록 입력 + 연비 자동 계산
- 주행거리 누적 추적
- 기본 대시보드 (차량 요약 카드)

### Phase 2
- 정비 이력 기록
- 정비 메모 & 체크리스트 (상태 관리)
- 소모품 교체 주기 템플릿 (연료타입별)
- 비용 카테고리 대시보드
- 연비 추이 그래프 (Recharts)

### Phase 3
- 보험/세금/정비 알림 (브라우저 푸시 + 이메일)
- CSV 내보내기 / 가져오기
- 총 소유비용 계산
- 다크모드
- PWA 설정 (홈 화면 추가)

### Phase 4
- 일반 배포
- 전기차 지원 (충전 기록, 배터리 상태)

---

## 🚫 의도적으로 제외한 것들

| 항목 | 이유 |
|------|------|
| 영수증 OCR | 한국 주유소에서 영수증 수령 거의 없음 |
| 텔레그램 알림 | 일반 유저 진입장벽 높음 |
| 리콜 알림 | 기존 앱과 차별점 없음 |
| 차량 사진 등록 | 우선순위 낮음 |
| 카드사/오픈뱅킹 연동 | 개인 프로젝트 수준에서 심사 장벽 |

---

## 💡 UX 원칙

1. **모바일 퍼스트** — 주유소/정비소에서 폰으로 바로 입력하는 상황 기준
2. **빠른 입력** — 주유 기록은 10초 안에 완료 (자동완성, 최근값 채움)
3. **정비소 모드** — 방문 전 미완료 메모를 한눈에 확인 가능해야 함
4. **오프라인 고려** — PWA 기반, 주요 화면 캐싱

---

## 🔗 외부 연동 예정

- **국토교통부 차량정보 API** — 차량번호로 기본정보 자동완성 (차명/연식/연료타입)
- **CTRL Dashboard** — `/api/summary` 엔드포인트로 요약 위젯 연동 (Phase 3~4)

---

*Last updated: 2026-03-23*
