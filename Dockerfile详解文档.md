## 🚀 后端 Dockerfile 详解 (backend/Dockerfile)

这是一个**简单的单阶段构建**，适合Node.js Express应用：

```dockerfile
FROM node:22                        // 使用官方Node.js 22版本作为基础镜像，包含Node.js运行环境和npm包管理器

MAINTAINER yqb                      // 标注镜像维护者为"yqb"（注：MAINTAINER已过时，推荐使用LABEL）

WORKDIR /app                        // 在容器内创建并切换到/app目录，后续所有操作都在此目录下进行

RUN npm install -g forever          // 安装forever进程管理工具，用于保持应用持续运行并自动重启崩溃的进程

COPY ./package.json /app/           // 将宿主机的package.json复制到容器/app目录，利用Docker缓存机制优化构建速度

RUN npm install                     // 根据package.json安装所有依赖包到node_modules目录

COPY . /app/                        // 将当前目录所有文件复制到容器/app目录，包括应用源码、路由文件等

EXPOSE 3001                         // 声明容器将监听3001端口（仅用于文档说明，实际端口映射需在运行时指定）

CMD forever bin/www                 // 使用forever启动应用，入口文件是bin/www，确保应用崩溃时自动重启
```

## 🌐 前端 Dockerfile 详解 (frontend/dockerfile)

这是一个**多阶段构建**，用于优化Next.js应用的生产部署：

### 阶段0: 基础配置
```dockerfile
# syntax=docker.io/docker/dockerfile:1    // 指定使用最新的Dockerfile语法特性，启用BuildKit等高级功能
FROM node:22-alpine AS base              // 使用Alpine Linux版本的Node.js 22作为基础镜像（更轻量约5MB），命名为base阶段
```

### 阶段1: 依赖安装 (deps)
```dockerfile
FROM base AS deps                        // 基于base创建deps阶段，专门处理依赖安装
RUN apk add --no-cache libc6-compat     // Alpine Linux缺少某些glibc库，安装libc6-compat提供兼容性，--no-cache减小镜像体积
WORKDIR /app                            // 设置工作目录为/app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./   // 复制所有可能的包管理器锁文件，*通配符表示文件可选存在

RUN \                                   // 智能依赖安装：根据锁文件类型自动选择包管理器
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \              // 如果存在yarn.lock则使用yarn安装
  elif [ -f package-lock.json ]; then npm ci; \                   // 如果存在package-lock.json则使用npm ci快速安装
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \  // 如果存在pnpm-lock.yaml则使用pnpm安装
  else echo "Lockfile not found." && exit 1; \                   // 如果没有找到锁文件则报错退出
  fi
```

### 阶段2: 应用构建 (builder)  
```dockerfile
FROM base AS builder                     // 基于base创建builder阶段，用于构建应用
WORKDIR /app                            // 设置工作目录
COPY --from=deps /app/node_modules ./node_modules    // 从deps阶段复制已安装的node_modules
COPY . .                                // 复制所有源代码到构建环境

RUN \                                   // 智能构建：根据包管理器执行相应的构建命令
  if [ -f yarn.lock ]; then yarn run build; \        // 如果使用yarn则执行yarn run build
  elif [ -f package-lock.json ]; then npm run build; \  // 如果使用npm则执行npm run build  
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \  // 如果使用pnpm则执行pnpm run build
  else echo "Lockfile not found." && exit 1; \       // 如果没有找到锁文件则报错退出
  fi
```

### 阶段3: 生产运行 (runner)
```dockerfile
FROM base AS runner                      // 基于base创建runner阶段，用于生产运行
WORKDIR /app                            // 设置工作目录

ENV NODE_ENV=production                 // 设置Node.js为生产模式，启用性能优化

RUN addgroup --system --gid 1001 nodejs // 创建系统用户组nodejs，指定GID为1001，提高安全性
RUN adduser --system --uid 1001 nextjs  // 创建系统用户nextjs，指定UID为1001，用于运行应用

COPY --from=builder /app/public ./public // 从builder阶段复制静态资源文件

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./        // 复制Next.js构建的standalone输出（仅包含必需文件）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static // 复制静态资源文件，--chown设置文件所有者为nextjs用户

USER nextjs                             // 切换到非特权用户nextjs运行应用，提高安全性

EXPOSE 3000                             // 暴露3000端口
ENV PORT=3000                           // 设置端口环境变量为3000
ENV HOSTNAME="0.0.0.0"                  // 设置监听所有网络接口

CMD ["node", "server.js"]               // 启动Next.js standalone服务器（server.js由next build自动生成）
```

## 🐳 Docker Compose 配置详解 (docker-compose.yml)

这是一个完整的**多服务容器编排**配置，实现前后端分离架构的用户管理系统：

### 📋 版本声明和服务定义
```yaml
version: '3.8'                          // 指定Docker Compose文件版本为3.8，支持最新的编排特性
services:                               // 定义所有服务容器的配置
```

### 🗄️ 数据库服务配置 (db)
```yaml
  db:                                   // 数据库服务名称，其他服务可通过此名称访问
    image: mysql:latest                 // 使用MySQL官方最新版本镜像
    container_name: mysql-db-llq        // 指定容器名称为mysql-db-llq，便于管理和识别
    networks:                           // 网络配置
      - app-network                     // 加入自定义网络app-network，实现服务间通信
    volumes:                            // 数据卷配置
      - type: volume                    // 数据持久化：将MySQL数据目录挂载到命名卷
        source: mysql-data              // 源卷名称mysql-data
        target: /var/lib/mysql          // 容器内MySQL数据存储路径
      - type: bind                      // 文件绑定：将初始化SQL脚本挂载到容器
        source: ./init.sql              // 宿主机init.sql文件路径  
        target: /docker-entrypoint-initdb.d/init.sql  // 容器内自动执行SQL脚本的目录
    ports:                              // 端口映射配置
      - "3309:3306"                     // 将容器3306端口映射到宿主机3309端口，避免与本地MySQL冲突
    environment:                        // 环境变量配置
      - MYSQL_ROOT_PASSWORD=123456      // 设置MySQL root用户密码为123456
      - MYSQL_DATABASE=userdb           // 自动创建名为userdb的数据库
```

### 🔙 后端服务配置 (backend)
```yaml
  backend:                              // 后端服务名称
    build: ./backend                    // 使用./backend目录下的Dockerfile构建镜像
    container_name: user-backend-llq    // 指定容器名称为user-backend-llq
    restart: always                     // 容器异常退出时自动重启，确保服务可用性
    ports:                              // 端口映射
      - "3001:3001"                     // 将容器3001端口映射到宿主机3001端口
    depends_on:                         // 服务依赖关系
      - db                              // 依赖数据库服务，确保db服务先启动
    networks:                           // 网络配置  
      - app-network                     // 加入app-network网络，可通过服务名访问数据库
```

### 🎨 前端服务配置 (frontend)
```yaml
  frontend:                             // 前端服务名称
    build: ./frontend                   // 使用./frontend目录下的Dockerfile构建镜像
    container_name: user-frontend       // 指定容器名称为user-frontend
    restart: always                     // 容器异常退出时自动重启
    ports:                              // 端口映射
      - "3000:3000"                     // 将容器3000端口映射到宿主机3000端口，用户通过此端口访问前端
    depends_on:                         // 服务依赖关系
      - backend                         // 依赖后端服务，确保backend服务先启动
    networks:                           // 网络配置
      - app-network                     // 加入app-network网络，可通过服务名访问后端API
```

### 🌐 网络配置 (networks)
```yaml
networks:                               // 自定义网络配置
  app-network:                          // 网络名称为app-network
    name: "app-network"                 // 显式指定网络名称，便于外部引用
    ipam:                               // IP地址管理配置 
      driver: default                   // 使用默认的网络驱动
      config:                           // 网络配置参数
        - subnet: 10.0.0.0/16           // 指定子网范围为10.0.0.0/16，支持65534个IP地址
```

### 💾 数据卷配置 (volumes)  
```yaml
volumes:                                // 命名卷配置
  mysql-data:                           // 卷名称为mysql-data
    name: "mysql-data"                  // 显式指定卷名称，用于MySQL数据持久化存储
```

## 🌐 网络连接验证命令详解

验证容器网络配置和连接状态的关键命令：

### 📋 网络检查命令
```bash
docker network ls                       // 列出所有Docker网络，确认app-network网络已创建
docker network inspect app-network     // 详细查看app-network网络配置，包含连接的容器IP地址和网络设置
docker-compose port frontend 3000      // 查看前端服务3000端口的具体映射情况，确认外部访问端口
```

## 📊 容器状态检查命令对比
#### 🐳 docker ps 命令
```bash
docker ps                              // 显示所有正在运行的Docker容器（全系统范围）
docker ps -a                           // 显示所有容器，包括已停止的（全系统范围）
```
#### 🎯 docker-compose ps 命令
```bash
docker-compose ps                       // 显示当前项目中由docker-compose管理的容器状态
```