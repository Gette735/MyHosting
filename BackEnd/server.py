import os
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()


#app.mount("/static", StaticFiles(directory="FrontEnd"), name="static")
#templates = Jinja2Templates(directory="FrontEnd")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost", "http://frontend"],
    allow_methods=["*"],
    allow_headers=["*"],
)
#@app.get("/", response_class=HTMLResponse)
#async def home(request: Request):
#    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/hello")
def hello():
    return {"message": "Hello, this is my site!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG/JPEG images are allowed!"
        )


    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)


    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename

    try:
        with open(file_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                f.write(chunk)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )

    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "content_type": file.content_type,
        "size": file_path.stat().st_size,
        "saved_at": str(file_path),
        "url": f"/uploads/{unique_filename}"
    }


@app.get("/api/files")
async def list_files():
    try:
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)

        files = []
        for file_path in upload_dir.iterdir():
            if file_path.is_file():
                files.append({
                    "name": file_path.name,
                    "size": file_path.stat().st_size,
                    "url": f"/uploads/{file_path.name}"
                })

        return JSONResponse(content={"files": files})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving file list: {str(e)}"
        )
@app.delete("/api/files/{filename}")
async def delete_file(filename: str):
    file_path = Path("uploads") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        file_path.unlink()
        return {"status":"success", "message": f"File {filename} delited"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delite error: {str(e)}")

@app.get("/api/uploads/{filename}")
async def get_file(filename: str):
    file_path = Path("uploads") / filename
    if not file_path.is_file():
        raise HTTPException(status_code=404)
    return FileResponse(file_path)
