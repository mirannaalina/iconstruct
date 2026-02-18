# iConstruct

Platformă marketplace pentru servicii de construcții, renovări și reparații.

## Descriere

iConstruct conectează clienții cu profesioniști (firme și meseriași) pentru:
- **Reparații** - Instalații, electricitate, centrală termică, etc.
- **Renovări** - Băi, bucătării, apartamente, case
- **Construcții** - Case, duplexuri, anexe, garaje

## Arhitectură

```
iconstruct/
├── backend/          # Java Spring Boot API
├── frontend-web/     # Next.js web application
├── frontend-mobile/  # React Native mobile app
└── docs/             # Documentation
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Java 21, Spring Boot 3.2 |
| Database | PostgreSQL 14 |
| Web Frontend | Next.js 14, React, TypeScript |
| Mobile | React Native |
| Real-time | WebSocket / Socket.io |
| File Storage | AWS S3 |
| Push Notifications | Firebase Cloud Messaging |
| Payments | Stripe |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local development)
- Node.js 18+ (for frontend development)

### Run with Docker

```bash
docker-compose up -d
```

Services:
- Backend API: http://localhost:8081
- Web App: http://localhost:3001
- Swagger UI: http://localhost:8081/swagger-ui.html

### Local Development

#### Backend
```bash
cd backend
./gradlew bootRun
```

#### Frontend Web
```bash
cd frontend-web
npm install
npm run dev
```

## Features

### Pentru Clienți
- Creare cereri de reparații/renovări/construcții
- Primire și comparare oferte
- Chat cu profesioniști
- Tracking status lucrare
- Review și rating

### Pentru Profesioniști
- Notificări pentru cereri noi în zonă
- Trimitere oferte
- Chat cu clienți
- Gestionare proiecte active
- Portofoliu și rating

## Model de Business

- Comision platformă: 5-15% (invizibil pentru client)
- Comision meseriaș: 3-5% din manoperă
- Plăți prin cont intermediar

## License

Proprietary - All rights reserved
