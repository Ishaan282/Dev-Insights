# Project Title: Dev-Insights 

## Description 
DevInsights is an AI-powered web application designed to help developers efficiently manage and understand code changes in large repositories. By leveraging AI-generated commit summaries, natural language-based code search, and meeting summaries, DevInsights streamlines the development process, saving time and improving productivity. The application also stores and summarizes meeting recordings, ensuring that all team discussions are easily accessible and actionable.


## Features
- **AI-Powered Commit Summaries**: Automatically generates concise summaries of code commits, reducing the need for manual review.
- **Natural Language Code Search**: Enables developers to search for code snippets or logic using plain English.
- **Meeting Summaries**: Stores and summarizes meeting recordings using Assembly AI.
- **GitHub Integration**: Seamlessly links with GitHub repositories to fetch commit history and repository details.
- **User Authentication**: Secure login and access control using Clerk.
- **Scalable Deployment**: Hosted on Vercel with serverless capabilities for high availability and performance.

## Technologies
- **Frontend**: Next.js, ShadCN UI, Tailwind CSS 
- **Backend**: Next.js, Bun, Clerk Auth, tRPC, Langchain
- **AI APIs**: Google Gemini AI, Assembly AI, GitHub API
- **Database**: Neon Console (PostgreSQL), Supabase
- **Authentication**: Clerk
- **Version Control**: Git & GitHub
- **Deployment**: Vercel


## Installation & running 
- Clone the repository: 
    ```bash
    git clone https://github.com/Dev-Insights/Dev-Insights.git
    ```
- Navigate to the project directory:
    ```bash
    cd Dev-Insights
    ```
- Install dependencies:
    ```bash
    npm install
    ```
- Start the development server:
    ```bash
    npm run dev
    ```

- fill in the required values in .env
    - GITHUB_TOKEN=''
    - GEMINI_API_KEY=''

    - NEXT_PUBLIC_SUPABASE_URL=
    - NEXT_PUBLIC_SUPABASE_KEY=
    - DATABASE_URL=""
    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    - CLERK_SECRET_KEY=


## usage
1. **Link GitHub Repository**: Enter your GitHub repository URL in the "Repository URL" field & give it a name.
2. **View Commit Summaries**: Access AI-generated summaries of your commits to quickly understand changes.
3. **Search Code Using Natural Language**: Use plain English to search for specific code snippets or logic within your repository.
4. **Manage Meetings**: Store and generate summaries of meeting recordings using Assembly AI
5. **User Authentication**: Secure login and access control using Clerk


## Advantages
1. **AI-Powered Code Understanding**
    - Automatically generates commit summaries, reducing manual effort in tracking changes.
    - Helps developers quickly understand project updates without reviewing entire commits.
2. **Smart Code Search with Natural Language**
    - Enables developers to search for code snippets or logic using plain English.
    - Improves efficiency by eliminating the need for manual repository navigation.
3. **Improved Collaboration & Productivity**
    - Teams can quickly grasp recent changes and contributions.
    - Helps onboard new developers faster by summarizing past work.
4. **Seamless Integration with GitHub**
    - Works directly with GitHub repositories, making it easy to link and manage projects.
    - Uses the GitHub API to fetch real-time data, ensuring up-to-date insights.
5. **Web-Based & User-Friendly**
    - No need to install additional software—accessible from any browser.
    - Provides a clean and intuitive UI using Next.js, ShadCN, and Clerk for authentication.
6. **Scalable & Cost-Effective Deployment**
    - Hosted on Vercel, ensuring high availability and fast performance.
    - Uses Neon Console (PostgreSQL) for efficient database management.

## Disadvantages
1. **AI Accuracy & Limitations**
    - AI-generated summaries may not always be 100% accurate or capture the full context of changes.
    - Natural language code search may struggle with complex queries or ambiguous phrasing.
2. **Dependence on External APIs**
    - Relies on Google Gemini AI and GitHub API, meaning service downtime or API rate limits could affect functionality.
    - Potential API cost implications if usage scales up significantly.
3. **Limited Offline Functionality**
    - Since it’s a web-based platform, it requires an active internet connection.
    - No local repository analysis without cloud-based access.
4. **Learning Curve for Users**
    - Developers unfamiliar with AI-powered tools might need time to adapt.
    - Some may prefer traditional methods over AI-generated insights.

## References
- Next.js Documentation
- Google Gemini AI
- GitHub API Documentation
- Vercel Documentation
- Neon PostgreSQL
- Clerk (User Authentication)
- ShadCn UI Library

