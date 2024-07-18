import os

class Config:
    HOST = os.environ.get('HOST') or '0.0.0.0'
    PORT = os.environ.get('PORT') or 5000
    CORS_URL = os.environ.get('CORS_URL') or 'http://localhost:3000'
