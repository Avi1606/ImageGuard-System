# Application Architecture Diagram

This document contains a diagram representing the architecture of the Image Forgery Detection and Watermarking application.

```mermaid
graph TD
    subgraph "User's Device"
        A[User] --> B{Browser};
    end

    subgraph "Frontend (Client on Vercel)"
        B --> C[React App];
    end

    subgraph "Backend (Server on Vercel/Heroku)"
        C -- "HTTPS / REST API" --> D[Node.js / Express.js API];
        D --> E["Middleware (Auth, CORS, etc.)"];
        E --> F[API Routes];
        F -- "/auth" --> G[Auth Controller];
        F -- "/images" --> H[Image Controller];
        F -- "/watermark" --> I[Watermark Controller];
        F -- "/detection" --> J[Detection Controller];
        
        G --> K((MongoDB));
        H --> K((MongoDB));
        H --> L[File System / S3 Bucket <br/> (for image storage)];
        I --> L;
        J -- "Spawns Child Process" --> M[Python ML Scripts <br/> (ELA, Metadata Analysis)];
    end

    subgraph "Database (MongoDB Atlas)"
        K((fa:fa-database MongoDB));
    end

    subgraph "Machine Learning Service"
        M;
    end

    style C fill:#61DAFB,stroke:#333,stroke-width:2px
    style D fill:#8CC84B,stroke:#333,stroke-width:2px
    style K fill:#4DB33D,stroke:#333,stroke-width:2px
    style M fill:#FFD43B,stroke:#333,stroke-width:2px
``` 