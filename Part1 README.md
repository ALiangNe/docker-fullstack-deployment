# 期末考核：基于Docker的Node.js全栈项目部署

# 一、考核目标

1.基础操作：熟练掌握Linux/Docker基础命令，包括镜像管理、容器操作、数据库客户端使用。  
2.项目理解：能够理解一个完整的Node.js全栈项目结构（前端、后端、数据库）。  
3.Docker 核心技能：能够编写 `Dockerfile` 和 `docker-compose.yml` 文件，构建镜像并运行容器。  
4.部署流程：掌握从环境准备到应用验证的完整部署流程。

# 二、考核项目描述

提供一个简单的"用户管理系统"全栈应用。

- 后端：Node.js + Express，提供用户相关的 RESTful API  
-前端：next.js  
- 数据库：MySQL，用于存储用户数据

项目结构：

![](images/319b97fe2fc397840a5ecedce9b48dcfe86d4a1e016ae4d1991be1852338cdeb.jpg)

# 三、考核步骤与评分细则（总分100分）

# 第一部分：Docker 基础操作与环境准备（10 分）

1.（5分）检查Docker环境

- 命令：`docker --version`, `docker-compose --version`

- 要求：展示版本信息，确认环境正常。

# 2.（5分）拉取并检查MySQL镜像

- 命令：

docker pull mysql:8.0

docker images mysql

docker pull mysql:8.0 //执行第二次操作结果

- 要求：成功拉取MySQL8.0镜像，并展示镜像详情。

# 第二部分：项目检查与镜像构建（30分）

# 1.（15分）分析Dockerfile文件

- 命令：`cat backend/Dockerfile`, `cat frontend/Dockerfile`

- 要求：解释关键指令的作用。

讲解 backend/Dockerfile 全部指令即可，讲解不全或者未讲解得 0 分

# 2.（15分）构建项目镜像

- 命令：

构建后端镜像

cd backend

docker build -t user-backend:v1 .

构建前端镜像

cd ../frontend

docker build -t user-frontend:v1 .

检查镜像

docker images user\*

- 要求：两个镜像构建成功，无错误信息。

如果前端升级，请修改一处显示自己的姓名，重新构建镜像 v2

docker build -t user-frontend:v2 .

# V1构建8分，v2构建7分

# 第三部分：容器编排与启动（40分）

# 1.（15分）检查docker-compose.yml配置

- 要求：解释服务配置、网络、数据卷等设置。

修改相关容器名称，添加自己名字后缀

注意前后端需要使用的容器名称进行相互访问，如下：

![](images/14dd0c5770f24cc7fb03cd660a03b85e1da379c617af6a67ce080c1af965fdd6.jpg)

![](images/0a78dc8ab3573456c83380249c54ba999bcbce8f30f93cb9b336f9229516f3d9.jpg)

2.（15分）启动所有服务

- 命令：`docker-compose up -d`

- 检查命令：

docker ps

docker-compose ps //需要当前 docker-compose 配置文件目录下执行

docker-compose logs frontend

docker-compose logs backend

docker-compose logs db

- 要求：所有服务状态为`Up`，后端日志显示成功连接数据库。

# 3.（10分）验证网络连接

-命令：

docker network ls

docker network inspect app-network

docker-compose port frontend 3000

- 要求：确认容器在同一网络，查看前端访问端口。

# 第四部分：数据库操作与功能验证（20分）

# 1.（10分）连接MySQL数据库并检查

- 命令：

进入数据库容器执行MySQL客户端

docker-compose exec db mysql -u root -p

密码在 docker-compose.yml 中定义（如：123456）

- 数据库操作:

```
``sql

# 初始化表，之后

SHOW DATABASES;

USE userdb;

SHOW TABLES;

SELECT * FROM users;

EXIT;

- 要求：成功连接数据库，查看用户表结构和数据。

# 2.（10分）验证应用功能

- 操作：浏览器访问`http://localhost:<前端端口>\

-功能测试：

- 用户列表显示

- 添加新用户（从数据库插入，前端进行显示新数据）

- 要求：各项功能正常，数据持久化。

![](images/6d79c4794a8423c31ab78299c008cdf0e45496865b255e83de62a1f5c0eb3665.jpg)

# 五、考核亮点

1. 真正的从零开始：从拉取基础镜像到完整应用部署  
2. 数据库操作考核：直接使用MySQL客户端验证数据持久化  
3. 更实用的技能：数据库连接、SQL 操作等技能更贴近实际工作  
4. 完整的运维流程：涵盖镜像管理、容器编排、网络配置、数据持久化