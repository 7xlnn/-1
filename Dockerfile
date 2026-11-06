# ---- 单阶段镜像：预构建产物 + 运行依赖 ----
# 前端 dist-web 与后端 server/dist 均为本地构建后提交进 git 的产物，
# Dockerfile 不再执行 pnpm build:web / build:server，避免云端 Taro/vite 构建脆弱性（buildStart 崩溃）。
FROM node:24-slim

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# 启用 corepack 并固定 pnpm 版本（与本地一致，避免 frozen-lockfile 校验失败）
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# 仅复制依赖清单以利用缓存。workspace 清单必须在安装前存在，
# 否则 pnpm 不会识别 server 包，也就不会安装 NestJS 运行依赖。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/package.json

# 全量安装运行依赖（--prod=false 确保 server 依赖完整；Node 24 slim 无 python3，导航扣子 supabase 运行时依赖为延迟加载）
RUN pnpm install --frozen-lockfile --prod=false

# 复制全部源码与预构建产物（dist-web、server/dist、.cozeproj 等均已在 .dockerignore 放开）
COPY . .

EXPOSE 3000

# 启动后端服务（自动托管 dist-web 前端静态资源）
CMD ["node", "/app/server/dist/main.js"]