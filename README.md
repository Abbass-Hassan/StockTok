<img src="./readme/title1.svg"/>

<br><br>

<!-- project overview -->
<img src="./readme/title2.svg"/>

> StockTok is a bold new platform where creators and investors fuel the next wave of viral content.
> It merges the power of social media with the dynamics of financial markets, letting creativity become a shared investment.
> In StockTok, every video is an opportunity and every click can be a return.

<br><br>

<!-- System Design -->
<img src="./readme/title3.svg"/>

### System Design

The backend of StockTok is built with a clean relational structure that powers video content, user investments, wallet management, and social interactions.

#### ER Diagram

![ER Diagram](./readme/StockTok-ERDiagram.png)

The database is structured around core entities:

- `users`, `user_types`: handle authentication, roles (creator/investor), and profiles.
- `videos`: store uploaded video metadata including financial and engagement metrics.
- `likes_investments` and `transactions`: track investment flows and wallet activity.
- `wallets`, `comments`, and `follows`: support user funds, community features, and relationships.

<br><br>

<!-- Project Highlights -->
<img src="./readme/title4.svg"/>

### Project Highlights

- Paid likes act as investments, users can invest in videos they believe in.
- AI-powered suggestions recommend promising videos to help investors make smarter decisions.
- Infinite video streaming with vertical scroll for a TikTok-style experience.
- Users can upload and stream videos seamlessly with real-time playback.

<br><br>

<!-- Demo -->
<img src="./readme/title5.svg"/>

### Investor Screens (Mobile)

| Login screen                            | Register screen                       | Register screen                       |
| --------------------------------------- | ------------------------------------- | ------------------------------------- |
| ![Landing](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) |

### Creator Screens (Mobile)

| Login screen                            | Register screen                       |
| --------------------------------------- | ------------------------------------- |
| ![Landing](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) |

<br><br>

<!-- Development & Testing -->
<img src="./readme/title6.svg"/>

### Add Title Here

| Services                                | Validation                            | Testing                               |
| --------------------------------------- | ------------------------------------- | ------------------------------------- |
| ![Landing](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) |

<br><br>

<!-- Deployment -->
<img src="./readme/title7.svg"/>

### Deployment Overview

- The StockTok app is deployed using **AWS EC2 instances**:
  - **Staging:** `http://13.37.224.245`
  - **Production:** `http://35.181.171.137`
- The application is **containerized using Docker** to ensure consistency across all environments.
- **CI/CD pipelines** are implemented via **GitHub Actions**, enabling automatic testing and deployment on every push to main.

| Postman API 1                           | Postman API 2                         | Postman API 3                         |
| --------------------------------------- | ------------------------------------- | ------------------------------------- |
| ![Landing](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) | ![fsdaf](./readme/demo/1440x1024.png) |

<br><br>
