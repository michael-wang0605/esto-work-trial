"""
Data models for the backend
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PropertySettings(BaseModel):
    property_id: str
    property_name: str
    tenant_name: str
    unit: str
    address: str
    hotline: Optional[str] = None
    portal_url: Optional[str] = None
    ai_enabled: bool = True
    auto_reply: bool = True
    verification_sent: bool = False

class MaintenanceTicket(BaseModel):
    id: str
    tenant_phone: str
    tenant_name: str
    unit: str
    property_name: str
    issue_description: str
    priority: str
    status: str
    created_at: str
    media_urls: List[str] = []

class Context(BaseModel):
    property_name: Optional[str] = None
    unit: Optional[str] = None
    tenant_name: Optional[str] = None
    address: Optional[str] = None
    hotline: Optional[str] = None
    portal_url: Optional[str] = None
    tenant_phone: Optional[str] = None

class TenantSmsRequest(BaseModel):
    phone: str
    message: str
    context: Context
    media_urls: Optional[List[str]] = None

class TenantSmsResponse(BaseModel):
    reply: str
    maintenance_ticket_created: bool
    ticket_id: Optional[str] = None

class PmChatRequest(BaseModel):
    message: str
    context: Context
    phone: Optional[str] = None
    image_url: Optional[str] = None
    document_url: Optional[str] = None

class PmChatResponse(BaseModel):
    reply: str
    context: Dict[str, Any]
    maintenance_tickets: List[MaintenanceTicket]
    sms_history: List[Dict[str, Any]]

# Tenant Application Models
class PropertyScreeningSettings(BaseModel):
    """Screening criteria for property"""
    minCreditScore: int = 600
    incomeMultiplier: float = 3.0  # Rent must be <= income / multiplier
    minIncomeMultiplier: float = 2.5  # Yellow flag threshold
    businessHoursStart: str = "09:00"
    businessHoursEnd: str = "18:00"
    excludeWeekends: bool = False
    parkingInstructions: Optional[str] = None

class TenantApplication(BaseModel):
    """Tenant application model"""
    id: Optional[str] = None
    userId: str
    propertyId: Optional[str] = None
    
    # Contact Info
    applicantName: str
    applicantEmail: str
    applicantPhone: Optional[str] = None
    
    # Email Metadata
    emailSubject: Optional[str] = None
    emailBody: Optional[str] = None
    receivedAt: Optional[datetime] = None
    
    # Document URLs
    driversLicenseUrl: Optional[str] = None
    driversLicenseText: Optional[str] = None
    payStubUrls: List[str] = []
    payStubTexts: List[str] = []
    creditScoreUrl: Optional[str] = None
    creditScoreText: Optional[str] = None
    
    # Extracted Data
    licenseName: Optional[str] = None
    licenseDOB: Optional[datetime] = None
    licenseExpiration: Optional[datetime] = None
    licenseNumber: Optional[str] = None
    
    employerName: Optional[str] = None
    monthlyIncome: Optional[float] = None
    annualIncome: Optional[float] = None
    payFrequency: Optional[str] = None  # "weekly", "bi-weekly", "monthly"
    
    creditScore: Optional[int] = None
    creditScoreDate: Optional[datetime] = None
    
    # Screening Status
    status: str = "pending"  # "pending", "under_review", "approved", "rejected", "scheduled"
    screeningScore: Optional[str] = None  # "green", "yellow", "red"
    screeningNotes: Optional[str] = None
    
    # Scheduling
    calendarEventId: Optional[str] = None
    scheduledDate: Optional[datetime] = None
    scheduledTime: Optional[str] = None
    showingConfirmed: bool = False
    
    # Metadata
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class ProcessDocumentsRequest(BaseModel):
    """Request to process tenant application documents"""
    applicationId: str
    driversLicenseUrl: Optional[str] = None
    payStubUrls: List[str] = []
    creditScoreUrl: Optional[str] = None

class DocumentExtractionResult(BaseModel):
    """Result from document extraction"""
    licenseName: Optional[str] = None
    licenseDOB: Optional[datetime] = None
    licenseExpiration: Optional[datetime] = None
    licenseNumber: Optional[str] = None
    licenseValid: bool = True
    
    employerName: Optional[str] = None
    monthlyIncome: Optional[float] = None
    annualIncome: Optional[float] = None
    payFrequency: Optional[str] = None
    
    creditScore: Optional[int] = None
    creditScoreDate: Optional[datetime] = None
    
    extractionErrors: List[str] = []

class ScreeningScoreRequest(BaseModel):
    """Request to calculate screening score"""
    applicationId: str
    propertyId: Optional[str] = None

class ScreeningScoreResponse(BaseModel):
    """Screening score calculation result"""
    score: str  # "green", "yellow", "red"
    notes: str
    autoApproved: bool = False
