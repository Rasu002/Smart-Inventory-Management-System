from pydantic import BaseModel, EmailStr, Field, field_validator
from decimal import Decimal
from typing import Literal
from datetime import date
import re

# =======================
# login schemas
# =======================
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

# ==========================
# SignUp Page Schemas
# ==========================
class SignupRequest(BaseModel):
    user_name: str = Field( ..., min_length=3, max_length=50 )
    user_email: EmailStr
    password: str = Field( ..., min_length=2, max_length=128 )
    user_phone: str = Field( ..., min_length=10, max_length=10 )
    role_id: str = Field( ..., min_length=1, max_length=20 )
    is_active: bool = True

    @field_validator("user_phone")
    @classmethod
    def validate_phone(cls, value: str):
        if not value.isdigit():
            raise ValueError("Phone number must contain only digits and exactly 10 digit")

        return value


# ===============================
# Company Create Page Schemas
# ===============================
class CompanyRequest(BaseModel):

    company_name: str = Field( ..., min_length=3, max_length=100 )
    gst: str = Field( ..., min_length=15, max_length=15 )
    pan: str = Field( ..., min_length=10, max_length=10 )
    phone: str = Field( ..., min_length=10, max_length=10 )
    email: EmailStr
    address: str = Field( ..., min_length=3, max_length=150 )
    country: str = Field( ..., min_length=2, max_length=50 )
    state: str = Field( ..., min_length=2, max_length=50 )
    city: str = Field( ..., min_length=2, max_length=50 )
    pincode: str = Field( ..., min_length=6, max_length=6 ) 

    # -----------------------------
    # PAN validation
    # -----------------------------
    @field_validator("pan")
    @classmethod
    def validate_pan(cls, value):
        value = value.upper()

        if not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", value):
            raise ValueError("Invalid PAN format")

        return value

    # -----------------------------
    # GST validation
    # -----------------------------
    @field_validator("gst")
    @classmethod
    def validate_gst(cls, value):
        value = value.upper()

        if not re.fullmatch(
            r"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]",
            value
        ):
            raise ValueError("Invalid GST format")

        return value

    # -----------------------------
    # Phone validation
    # -----------------------------
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):

        if not re.fullmatch(r"[6-9][0-9]{9}", value):
            raise ValueError(
                "Phone number must contain 10 digits and start with 6-9"
            )

        return value


    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, value):
        if not value.isdigit():
            raise ValueError("Pincode must contain only digits")

        return value

# Customers Create Page Schemas
class CustomerRequest(BaseModel):

    name: str = Field( ..., min_length=3, max_length=100 )
    company_id: str = Field( ... )
    email: EmailStr
    phone: str = Field( ..., min_length=10, max_length=10 )
    is_active : bool = Field(...)

    # -----------------------------
    # Phone validation
    # -----------------------------
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):

        if not re.fullmatch(r"[6-9][0-9]{9}", value):
            raise ValueError(
                "Phone number must contain 10 digits and start with 6-9"
            )

        return value


# supplier Create Page Schemas
class SupplierRequest(BaseModel):

    name: str = Field( ..., min_length=3, max_length=100 )
    company_id: str = Field( ... )
    email: EmailStr
    phone: str = Field( ..., min_length=10, max_length=10 )
    is_active : bool = Field(...)

    # -----------------------------
    # Phone validation
    # -----------------------------
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):

        if not re.fullmatch(r"[6-9][0-9]{9}", value):
            raise ValueError(
                "Phone number must contain 10 digits and start with 6-9"
            )

        return value

# Products Create Page Schema
class ProductRequest(BaseModel):
    product_id: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=3, max_length=100)
    unit_measure: Literal[ "KG", "PCS", "LITER", "BOX", "METER" ]
    selling_price: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    minimum_stock: int = Field(..., ge=1)
    product_type: Literal[ "RAW MATERIAL", "FINISHED GOODS" ]
    is_expiry_tracked: bool = Field(True)
    is_active: bool = Field(...)

# Purchase order Page Schema
class PoRequest(BaseModel):
    supplier_id : str = Field(...)
    product_id : str = Field(...)
    qty : int = Field(..., ge = 1)

    
# GRN Page Schema
class grnRequest(BaseModel):
    po_id : str = Field(...)
    received_qty : int = Field(..., ge = 1)
    total_amount : int = Field(...)
    expiry_at: date | None = None


# Sales Order Page Schema
class salesRequest(BaseModel):
    customer_id : str = Field(...)
    po_id : str = Field(...)
    ordered_qty : int = Field(..., ge = 1)