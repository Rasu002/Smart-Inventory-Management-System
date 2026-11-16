from fastapi import FastAPI, Request
from models import create_tables
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


app = FastAPI()

create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

from routers.login import router as login_router
app.include_router(login_router)
from routers.signup import router as signup_router
app.include_router(signup_router)
from routers.company import router as company_router
app.include_router(company_router)
from routers.customers import router as customers_router
app.include_router(customers_router)
from routers.vendors import router as vendors_router
app.include_router(vendors_router)
from routers.products import router as products_router
app.include_router(products_router)
from routers.purchase import router as purchase_router
app.include_router(purchase_router)
from routers.grn import router as grn_router
app.include_router(grn_router)
from routers.stock_balance import router as stock_balance_router
app.include_router(stock_balance_router)
from routers.stock_ledger import router as stock_ledger_router
app.include_router(stock_ledger_router)
from routers.sales_order import router as sales_order_router
app.include_router(sales_order_router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    errors = []

    for error in exc.errors():

        field = error["loc"][-1]

        errors.append({
            "field": field,
            "message": error["msg"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "errors": errors
        }
    )