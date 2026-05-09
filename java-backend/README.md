# CinemaCravings Java Backend

This is the Spring Boot implementation of the CinemaCravings backend.

## Prerequisites
- Java 17 or higher
- Maven 3.6+

## How to Run
1. Open the project in VS Code.
2. Ensure you have the "Extension Pack for Java" installed.
3. Open a terminal and navigate to `java-backend`.
4. Run:
   ```bash
   mvn spring-boot:run
   ```
5. The backend will start on `http://localhost:8080`.

## Connecting the React Frontend
To connect your React frontend to this Java backend:
1. Update `vite.config.ts` to proxy `/api` requests to `http://localhost:8080`.
2. Or update the `fetch` calls in `App.tsx` to use the full URL `http://localhost:8080/api/...`.

## Features Included
- Menu Management (`/api/menu`)
- Order Placement (`/api/order`)
- Live Order Tracking (`/api/orders/live`)
- Order Confirmation/Delivery
