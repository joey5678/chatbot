# AI 聊天应用

这是一个基于 React 和 Ollama 的 AI 聊天应用，支持多轮对话、历史记录查看和模型切换功能。

## 功能特性

- 🗨️ 与 AI 进行自然语言对话
- 📚 查看和管理聊天历史记录
- 🔄 切换不同的 AI 模型
- ⚡ 实时响应
- 📝 保存对话上下文

## 快速开始

### 环境要求

- Node.js (v16 或更高版本)
- Ollama (本地运行)

### 安装步骤

1. 克隆项目仓库
    ```bash
    git clone https://github.com/joey5678/chatbot.git
    ```

2. User Guide
- 安装ollama
    - 安装
    ```bash
    curl URL_ADDRESS    curl https://ollama.ai/install.sh | sh
    ```
    - 启动
    ```bash
    ollama serve
    ```
    - 拉取模型
    ```bash
    ollama pull mistral
    ```
- cd ai-chat-app
- npm install
- npm start
- 在浏览器中打开 http://localhost:3000
