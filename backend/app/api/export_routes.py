import csv
import io
from fastapi import APIRouter, Response
from app.core.db import get_all_leads


router = APIRouter()

@router.get("/export/csv")
async def export_csv():
    data = get_all_leads()

    if not data:
        return Response(content="No data available to export", media_type="text/plain")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "name", "category", "location", "website", "email", "phone", "status", "sources"])
    writer.writeheader()
    
    for row in data:
        row_copy = dict(row)
        if isinstance(row_copy.get("sources"), list):
            row_copy["sources"] = ", ".join(row_copy["sources"])
        writer.writerow({k: row_copy.get(k, "") for k in ["id", "name", "category", "location", "website", "email", "phone", "status", "sources"]})

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )

