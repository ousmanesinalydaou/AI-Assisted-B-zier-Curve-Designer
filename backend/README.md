# Backend API - AI-Assisted Bézier Curve Designer

FastAPI backend providing RESTful endpoints for curve fitting, smoothing, curvature analysis, and ML predictions.

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run server
python main.py
```

Server will start at `http://localhost:8000`

### Docker

```bash
# Build and run
docker build -t bezier-backend .
docker run -p 8000:8000 bezier-backend
```

## API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # API routes
│   ├── core/          # Configuration
│   ├── models/        # Data models
│   └── services/      # Business logic
├── tests/             # Unit & integration tests
├── ml_training/       # ML model training
├── models/            # Trained models
├── main.py            # Application entry point
└── requirements.txt   # Dependencies
```

## Environment Variables

```bash
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=bezier_designer

# ML Model
ML_MODEL_PATH=./models/control_point_predictor.pth
ML_MODEL_ENABLED=true
```

## Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_curve_fitting.py
```

## Development

```bash
# Format code
black .

# Lint
flake8

# Type check
mypy .
```

## License

MIT License - See ../LICENSE file
