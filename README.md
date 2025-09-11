# Bluemine API

Blumine API é o backend para um sistema de gestão de projetos, desenvolvido para ser robusto, escalável e de fácil manutenção.

## Funcionalidades Implementadas

- **Autenticação de Usuários**:
  - Registro de novos usuários.
  - Login com e-mail e senha.
  - Sistema de autenticação baseado em JSON Web Tokens (JWT), com tokens de acesso e de atualização (refresh tokens) para maior segurança.
  - Logout de usuários.

- **Gerenciamento de Usuários**:
  - Criação, leitura, atualização e exclusão (CRUD) de usuários.
  - Atribuição de papéis (roles) aos usuários: `admin`, `manager`, `developer`.
  - Controle de acesso baseado em papéis para diferentes funcionalidades da API.

- **Gerenciamento de Projetos**:
  - CRUD completo para projetos.
  - Associação de um gerente (manager) a cada projeto.
  - Listagem de projetos por usuário (gerente ou membro).

- **Gerenciamento de Tarefas**:
  - CRUD completo para tarefas.
  - Associação de tarefas a projetos e a um responsável (assignee).
  - Definição de status, prioridade e data de vencimento para as tarefas.
  - Atualização do status das tarefas.

- **Membros de Projetos**:
  - Adição e remoção de membros (developers) em projetos.
  - Atribuição de papéis específicos de projeto aos membros: `viewer`, `contributor`, `maintainer`.

- **Documentação da API**:
  - Geração automática de documentação interativa da API com Swagger (OpenAPI).

## Decisões Técnicas

- **Framework**: O [NestJS](https://nestjs.com/) foi escolhido como framework principal. Sua arquitetura modular, o uso de TypeScript e a estrutura opinativa promovem um desenvolvimento organizado, escalável e de fácil manutenção.

- **Banco de Dados e ORM**: Utilizamos o **PostgreSQL**, um banco de dados relacional robusto e confiável. A interação com o banco é gerenciada pelo **Sequelize**, através do `@nestjs/sequelize`, que facilita a modelagem dos dados e as consultas de forma segura e eficiente.

- **Autenticação**: A autenticação é implementada com **Passport.js**, utilizando uma estratégia local (e-mail e senha) e JWT. O uso de _refresh tokens_ aumenta a segurança, permitindo que os tokens de acesso tenham uma vida útil curta, enquanto a sessão do usuário pode ser mantida por mais tempo de forma segura.

- **Validação de Dados**: Para garantir a integridade dos dados que chegam à API, utilizamos os pacotes `class-validator` e `class-transformer`. Eles permitem a criação de DTOs (Data Transfer Objects) com regras de validação declarativas, tornando o código mais limpo e seguro.

- **Containerização**: O ambiente de desenvolvimento é containerizado com **Docker** e **Docker Compose**. Isso garante que o ambiente seja consistente e fácil de configurar, tanto para desenvolvimento quanto para produção, incluindo o banco de dados PostgreSQL e uma interface de gerenciamento (Adminer).

- **Estrutura do Projeto**: A aplicação é dividida em módulos (Auth, User, Project, Task), seguindo as melhores práticas do NestJS. Isso promove a separação de responsabilidades e facilita a manutenção e a adição de novas funcionalidades. Foi implementada uma `BaseService` genérica para reaproveitar a lógica de CRUD.

- **Documentação da API**: A documentação é gerada automaticamente a partir dos controladores e DTOs usando o `@nestjs/swagger`, o que garante que a documentação esteja sempre atualizada com a implementação da API.

## Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### Passos para Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd bluemine-backend
    ```

2.  **Instale as dependências:**

    ```bash
    yarn install
    ```

3.  **Configuração do Ambiente:**
    - Crie uma cópia do arquivo de exemplo `.env.example` e renomeie para `.env`:
      ```bash
      cp .env.example .env
      ```
    - Preencha as variáveis de ambiente no arquivo `.env` com as suas configurações, especialmente as de banco de dados e JWT secrets.

4.  **Inicie os containers Docker:**
    - Este comando irá iniciar o container do banco de dados PostgreSQL e do Adminer.

    ```bash
    docker-compose up -d
    ```

5.  **Execute as Migrations (Opcional, se `synchronize: true` estiver desabilitado):**
    - O projeto está configurado para sincronizar as entidades com o banco de dados automaticamente. Se preferir usar migrations, execute:
    ```bash
    yarn sequelize-cli db:migrate
    ```

### Executando a Aplicação

- **Modo de Desenvolvimento (com watch mode):**

  ```bash
  yarn run start:dev
  ```

  A aplicação estará disponível em `http://localhost:3000`.

- **Modo de Produção:**
  ```bash
  yarn run build
  yarn run start:prod
  ```

### Acessando a Documentação da API

Após iniciar a aplicação, a documentação da API gerada pelo Swagger estará disponível em:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Executando os Testes

- **Testes Unitários:**

  ```bash
  yarn run test
  ```

- **Testes com Coverage:**
  ```bash
  yarn run test:cov
  ```
