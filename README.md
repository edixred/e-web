# LinguaRead - MVP

Plataforma de aprendizaje de idiomas con lectura paralela y audio sincronizado.

## Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Python 3.11+ (para desarrollo local)

## Inicio Rápido

### 1. Clona el repositorio

```bash
cd /home/bayron/Documents/PROYECTOS/E-WEB
```

### 2. Configura las variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tus API keys (opcional para desarrollo básico).

### 3. Inicia los servicios

```bash
docker-compose up --build
```

Esto iniciarán:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Accede a la aplicación

Abre http://localhost:3000 en tu navegador.

## Desarrollo Local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configura .env con tus credenciales
cp .env.example .env

# Inicia el servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del Proyecto

```
E-WEB/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints de la API
│   │   ├── core/         # Configuración, DB, seguridad
│   │   ├── models/       # Modelos SQLAlchemy y esquemas
│   │   ├── services/     # Lógica de negocio
│   │   └── main.py       # Aplicación FastAPI
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas de la app
│   │   ├── context/      # Contextos de React
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilidades
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   ├── init_db.sh        # Script de inicialización
│   └── seed_data.sql     # Datos de ejemplo
├── docker-compose.yml
├── .env.example
├── SPEC.md
└── PWA_GUIDE.md
```

## API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cerrar sesión

### Historias
- `GET /api/v1/stories` - Listar historias
- `GET /api/v1/stories/{id}` - Obtener historia
- `POST /api/v1/stories/generate` - Generar nueva historia (IA)
- `GET /api/v1/stories/{id}/audio` - Obtener audio y timestamps

### Progreso
- `GET /api/v1/user/progress` - Obtener progreso
- `PUT /api/v1/user/progress/{story_id}` - Actualizar progreso
- `GET /api/v1/user/stats` - Estadísticas del usuario

## Funcionalidades

- ✅ Registro e inicio de sesión
- ✅ Biblioteca de historias
- ✅ Generación de historias con IA
- ✅ Lectura paralela (inglés/español)
- ✅ Audio sincronizado con texto
- ✅ Seguimiento de progreso
- ✅ PWA instalable

## Despliegue en Producción

1. Configura las variables de entorno:
   - Cambia `SECRET_KEY` por una clave segura
   - Agrega tus API keys de OpenAI/ElevenLabs

2. Ejecuta:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. Configura un reverse proxy (nginx) con SSL

## Licencia

MIT
