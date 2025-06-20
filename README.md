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

> The backend of StockTok is built with a clean relational structure that powers video content, user investments, wallet management, and social interactions.

#### ER Diagram

![ER Diagram](./readme/StockTok-ERDiagram.png)

#### Component Diagram

![Component Diagram](./readme/componentdiagram.png)

<br><br>

<!-- Project Highlights -->
<img src="./readme/title4.svg"/>

<img src="./readme/highlights.png" width="100%"/>

> - Paid likes act as investments, users can invest in videos they believe in.
> - AI-powered suggestions recommend promising videos to help investors make smarter decisions.
> - Infinite video streaming with vertical scroll and real-time playback for a seamless TikTok-style experience.

<br><br>

<!-- Demo -->
<img src="./readme/title5.svg"/>

### Investor Screens (Mobile)

| Feed Screen                | Portfolio Screen                     | Investment Details Screen        |
| -------------------------- | ------------------------------------ | -------------------------------- |
| ![Feed](./readme/feed.png) | ![Portfolio](./readme/portoflio.png) | ![Details](./readme/details.png) |

### Creator Screens (Mobile)

| Login Screen                 | Dashboard Screen                     | Wallet Screen                  |
| ---------------------------- | ------------------------------------ | ------------------------------ |
| ![Login](./readme/login.png) | ![Dashboard](./readme/dashboard.png) | ![Wallet](./readme/wallet.png) |

### Action Demo (GIFs)

| Scroll                       | Invest                         | Upload                         |
| ---------------------------- | ------------------------------ | ------------------------------ |
| ![Scroll](./readme/feed.gif) | ![Invest](./readme/invest.gif) | ![Upload](./readme/upload.gif) |

<br><br>

<!-- Development & Testing -->
<img src="./readme/title6.svg"/>

> This section highlights how StockTok handles core backend logic, validation layers, and testing.
>
> - **Services:** Core business logic is separated into service classes, making the app modular, maintainable, and scalable.
> - **Validation:** All incoming requests go through dedicated validation layers to ensure data integrity and security.
> - **Testing:** Critical actions like video uploads are covered with feature tests to ensure stability during CI/CD and production.

### Development

#### Services

![Service](./readme/StreamVideoService.png)

#### Validation

![Validation](./readme/UploadVideoValidation.png)

### Testing

![Test](./readme/UploadVideoTest.png)

<br><br>

<!-- AI-Powered Recommendations -->
<img src="./readme/title7.svg"/>

> StockTok uses AI to provide personalized portfolio guidance:
>
> 1. **Portfolio Assessment** – The AI reviews the user's current investments and performance.
> 2. **Diversification Strategy** – It suggests how to balance the portfolio with new content categories or creators.
> 3. **Recommended Videos** – It identifies trending videos worth investing in with clear reasons for each pick.

### AI Prompt Input (User Portfolio & Trends)

![AI1](./readme/ai1.png)

### AI Output (Recommendations & Strategy)

![AI2](./readme/ai2.png)

<br><br>

<!-- Deployment -->
<img src="./readme/title8.svg"/>

### Deployment Overview

- The StockTok app is deployed using **AWS EC2 instances**:
  - **Staging:** `http://13.37.224.245`
  - **Production:** `http://35.181.171.137`
- The application is **containerized using Docker** to ensure consistency across all environments.
- **CI/CD pipelines** are implemented via **GitHub Actions**, enabling automatic testing and deployment on every push to `main`.

| GitHub Actions Deployment Log  | Production Endpoint in Use         | Staging Endpoint in Use            |
| ------------------------------ | ---------------------------------- | ---------------------------------- |
| ![Deploy](./readme/deploy.png) | ![Postman2](./readme/postman2.png) | ![Postman3](./readme/postman3.png) |

<img src="./readme/cicdflow.png"/>

<br><br>
