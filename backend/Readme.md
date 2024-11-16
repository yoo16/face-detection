
## Install
### Case requirements.txt
```bash
pip install -r requirements.txt
```

### Case pip install 
```bash
pip install fastapi uvicorn opencv-python numpy
```

## launch
```bash
uvicorn main:app --reload
```

### anotor port
```bash
uvicorn main:app --reload --port 8001
```