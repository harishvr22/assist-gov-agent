"""
agents/seed.py
--------------
Seeds both the relational/document database (MongoDB or local JSON fallback)
and the ChromaDB vector store with 100+ Indian central and state government schemes.

Run:
    python -m backend.agents.seed
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import logging
import chromadb
from backend.db import db

logger = logging.getLogger(__name__)

_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

# 102 structured government schemes
RAW_SCHEMES = [
    # ── Farmer Welfare (10 schemes) ──
    {
        "scheme_id": "SCH001",
        "scheme_name": "PM Kisan Samman Nidhi",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 100,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "₹6,000 per year paid in three equal instalments of ₹2,000 directly into the farmer's bank account for agricultural credit support.",
        "documents": ["Aadhaar Card", "Land ownership documents (Khasra/Khatauni)", "Bank passbook"],
        "apply_url": "pmkisan.gov.in"
    },
    {
        "scheme_id": "SCH002",
        "scheme_name": "PM Fasal Bima Yojana (Crop Insurance)",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 80,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial support to farmers experiencing crop loss due to natural disasters, pests, or diseases. Insurance premium is subsidized.",
        "documents": ["Aadhaar Card", "Land records", "Sowing certificate", "Bank account details"],
        "apply_url": "pmfby.gov.in"
    },
    {
        "scheme_id": "SCH003",
        "scheme_name": "Kisan Credit Card (KCC) Scheme",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 75,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Short-term credit limits for crops, post-harvest expenses, and working capital for animal husbandry with low interest rate of 4%.",
        "documents": ["Aadhaar Card", "Land cultivation document", "Identity proof", "Bank passbook"],
        "apply_url": "sbi.co.in"
    },
    {
        "scheme_id": "SCH004",
        "scheme_name": "PM Krishi Sinchayee Yojana",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidies for micro-irrigation systems (drip and sprinkler irrigation) to enhance water-use efficiency on farms.",
        "documents": ["Aadhaar Card", "Land ownership proof", "Electricity connection bill", "Bank passbook"],
        "apply_url": "pmksy.gov.in"
    },
    {
        "scheme_id": "SCH005",
        "scheme_name": "Paramparagat Krishi Vikas Yojana (Organic Farming)",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 90,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial assistance of ₹50,000 per hectare for farmers transitioning to organic farming for cluster creation and certification.",
        "documents": ["Aadhaar Card", "Organic cluster membership card", "Land records"],
        "apply_url": "pgsindia-ncof.gov.in"
    },
    {
        "scheme_id": "SCH006",
        "scheme_name": "Sub-Mission on Agricultural Mechanization",
        "category": "Farmer",
        "state": "All India",
        "min_age": 18,
        "max_age": 75,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidies ranging from 40% to 50% for purchasing tractors, power tillers, rotavators, and other agricultural machineries.",
        "documents": ["Aadhaar Card", "Caste certificate", "Land holding certificate", "Bank details"],
        "apply_url": "agrimachinery.nic.in"
    },
    {
        "scheme_id": "SCH007",
        "scheme_name": "Tamil Nadu Uzhavan Pro Scheme",
        "category": "Farmer",
        "state": "Tamil Nadu",
        "min_age": 18,
        "max_age": 85,
        "max_income": 250000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidy support for seeds, agricultural implements, and solar water pumps for small farmers in Tamil Nadu.",
        "documents": ["Aadhaar Card", "TN smart card", "Chitta/Adangal land papers", "Bank account"],
        "apply_url": "tnagrisnet.tn.gov.in"
    },
    {
        "scheme_id": "SCH008",
        "scheme_name": "Maharashtra Baliraja Jal San संजीवनी Yojana",
        "category": "Farmer",
        "state": "Maharashtra",
        "min_age": 18,
        "max_age": 80,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "State subsidy support for completing pending irrigation projects and installing farm ponds in drought-prone districts.",
        "documents": ["Aadhaar Card", "Land records (7/12 extract)", "Income certificate", "Bank details"],
        "apply_url": "krishi.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH009",
        "scheme_name": "UP Krishi Upkaran Subsidy Scheme",
        "category": "Farmer",
        "state": "Uttar Pradesh",
        "min_age": 18,
        "max_age": 80,
        "max_income": 200000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Up to 50% subsidy on agricultural implements for farmers registered on the UP Agriculture portal.",
        "documents": ["Aadhaar Card", "UP farmer registration slip", "Bank details", "Land records"],
        "apply_url": "upagriculture.com"
    },
    {
        "scheme_id": "SCH010",
        "scheme_name": "Bihar Diesel Anudan Scheme",
        "category": "Farmer",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 80,
        "max_income": 150000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Diesel subsidy of ₹750 per acre for irrigation purposes during dry spells or delayed monsoons.",
        "documents": ["Aadhaar Card", "LPC/Land receipt", "Diesel purchase receipt", "Bank passbook"],
        "apply_url": "dbtagriculture.bihar.gov.in"
    },

    # ── Student Scholarships (12 schemes) ──
    {
        "scheme_id": "SCH011",
        "scheme_name": "NSP OBC Pre-Matric Scholarship",
        "category": "Student",
        "state": "All India",
        "min_age": 5,
        "max_age": 18,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly stipend of ₹400-₹700 and annual book grant of ₹500 for students in classes 1 to 10.",
        "documents": ["OBC Caste Certificate", "Income Certificate", "Marksheet of previous class", "Aadhaar Card"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH012",
        "scheme_name": "NSP SC Post-Matric Scholarship",
        "category": "Student",
        "state": "All India",
        "min_age": 15,
        "max_age": 30,
        "max_income": 250000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial support covering tuition fees, maintenance allowance of ₹550-₹1200/month for SC category students in post-matric courses.",
        "documents": ["SC Caste Certificate", "Annual Income Certificate", "Academic Marksheet", "College Fee receipt", "Aadhaar Card"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH013",
        "scheme_name": "PM Scholarship Scheme for CAPF Children",
        "category": "Student",
        "state": "All India",
        "min_age": 17,
        "max_age": 25,
        "max_income": 500000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Scholarship of ₹3,000/month for boys and ₹3,500/month for girls pursuing professional degree courses.",
        "documents": ["Aadhaar Card", "Service/Death Certificate of CAPF parent", "Marksheet of 12th showing min 60%"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH014",
        "scheme_name": "National Means-cum-Merit Scholarship",
        "category": "Student",
        "state": "All India",
        "min_age": 12,
        "max_age": 16,
        "max_income": 350000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Scholarship of ₹12,000 per annum for meritorious students studying in government/aided schools from class 9 to 12.",
        "documents": ["Income Certificate", "Class 7 Marksheet (min 55%)", "Aadhaar Card", "School ID Card"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH015",
        "scheme_name": "Pragati Scholarship for Girl Students",
        "category": "Student",
        "state": "All India",
        "min_age": 16,
        "max_age": 25,
        "max_income": 800000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Financial support of ₹50,000 per annum for tuition fees, computer/equipment purchase, and books for girls admitted to AICTE degree/diploma.",
        "documents": ["Admission Letter", "Fee receipt", "Income Certificate", "Caste Certificate", "Aadhaar Card"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH016",
        "scheme_name": "Tamil Nadu Free Laptop Scheme",
        "category": "Student",
        "state": "Tamil Nadu",
        "min_age": 16,
        "max_age": 20,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Provides free laptops to students who passed 12th standard exams in Government or Government-aided schools in Tamil Nadu.",
        "documents": ["12th Marksheet", "School ID/TC", "Aadhaar Card", "Ration Card/Residence proof"],
        "apply_url": "tnschools.gov.in"
    },
    {
        "scheme_id": "SCH017",
        "scheme_name": "Tamil Nadu Pudhumai Penn Scheme",
        "category": "Student",
        "state": "Tamil Nadu",
        "min_age": 17,
        "max_age": 24,
        "max_income": 400000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Monthly financial assistance of ₹1,000 directly credited to the girl student's bank account for pursuing higher education.",
        "documents": ["Aadhaar Card", "School certificate (studied class 6-12 in govt schools)", "College ID", "Bank passbook"],
        "apply_url": "penkalvi.tn.gov.in"
    },
    {
        "scheme_id": "SCH018",
        "scheme_name": "Maharashtra Rajarshi Shahu Maharaj Fee Reimbursement",
        "category": "Student",
        "state": "Maharashtra",
        "min_age": 17,
        "max_age": 30,
        "max_income": 800000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Reimbursement of 50% tuition and exam fees for students of EBC category in professional degree courses.",
        "documents": ["Income Certificate", "Domicile Certificate", "CAP allotment letter", "Aadhaar Card"],
        "apply_url": "mahadbt.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH019",
        "scheme_name": "UP Post Matric Scholarship for Gen/OBC",
        "category": "Student",
        "state": "Uttar Pradesh",
        "min_age": 16,
        "max_age": 28,
        "max_income": 200000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Full fee reimbursement and maintenance allowance for General and OBC students studying in class 11, 12, or higher courses.",
        "documents": ["UP Domicile", "Income Certificate", "Caste Certificate (for OBC)", "College Fee Receipt", "Aadhaar Card"],
        "apply_url": "scholarship.up.gov.in"
    },
    {
        "scheme_id": "SCH020",
        "scheme_name": "Bihar Post Matric Scholarship (BC/EBC)",
        "category": "Student",
        "state": "Bihar",
        "min_age": 15,
        "max_age": 26,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial aid for tuition fees and hostel fees for OBC and EBC students in post-matric technical/professional courses.",
        "documents": ["Residential Certificate", "Income Certificate", "BC/EBC Caste Certificate", "Fee Structure slip", "Aadhaar Card"],
        "apply_url": "pmsonline.bih.nic.in"
    },
    {
        "scheme_id": "SCH021",
        "scheme_name": "West Bengal Kanyashree Prakalpa (K2 Scheme)",
        "category": "Student",
        "state": "West Bengal",
        "min_age": 18,
        "max_age": 19,
        "max_income": 120000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "One-time grant of ₹25,000 for girls enrolled in higher education or vocational courses to delay marriage.",
        "documents": ["Kanyashree application form", "Unmarried declaration", "Institutional enrollment proof", "Aadhaar Card"],
        "apply_url": "wbkanyashree.gov.in"
    },
    {
        "scheme_id": "SCH022",
        "scheme_name": "Karnataka Vidyasiri Scholarship",
        "category": "Student",
        "state": "Karnataka",
        "min_age": 16,
        "max_age": 28,
        "max_income": 200000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Hostel allowance of ₹1,500/month for students belonging to SC/ST/OBC categories pursuing post-matric courses without govt hostel admission.",
        "documents": ["Caste Certificate", "Income Certificate", "Aadhaar Card", "College Admission letter"],
        "apply_url": "ssp.postmatric.karnataka.gov.in"
    },

    # ── Women Empowerment (11 schemes) ──
    {
        "scheme_id": "SCH023",
        "scheme_name": "Pradhan Mantri Ujjwala Yojana (PMUY)",
        "category": "Women",
        "state": "All India",
        "min_age": 18,
        "max_age": 80,
        "max_income": 120000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Free LPG gas connection, safety hose, and gas stove for adult women from BPL families to replace polluting kitchen fuels.",
        "documents": ["BPL Ration Card", "Aadhaar Card of all family members", "Bank Account Details"],
        "apply_url": "pmuy.gov.in"
    },
    {
        "scheme_id": "SCH024",
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "category": "Women",
        "state": "All India",
        "min_age": 1,
        "max_age": 10,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "High-interest savings account for girl child with tax-free interest rate of 8.2% and absolute maturity corpus when the child turns 21.",
        "documents": ["Birth Certificate of girl child", "Parent/Guardian Aadhaar Card", "Address proof"],
        "apply_url": "indiapost.gov.in"
    },
    {
        "scheme_id": "SCH025",
        "scheme_name": "Pradhan Mantri Matru Vandana Yojana",
        "category": "Women",
        "state": "All India",
        "min_age": 19,
        "max_age": 45,
        "max_income": 800000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Maternity cash incentive of ₹5,000 in three instalments to pregnant and lactating mothers for first child birth.",
        "documents": ["Mother and Child Protection (MCP) card", "Aadhaar Card", "Bank passbook"],
        "apply_url": "pmmvy.nic.in"
    },
    {
        "scheme_id": "SCH026",
        "scheme_name": "Mahila Samman Savings Certificate",
        "category": "Women",
        "state": "All India",
        "min_age": 10,
        "max_age": 90,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Fixed deposit scheme for women offering guaranteed 7.5% annual interest compounded quarterly for a tenure of 2 years.",
        "documents": ["Aadhaar Card", "PAN Card", "Account Opening Form", "Passport Photo"],
        "apply_url": "sansad.in"
    },
    {
        "scheme_id": "SCH027",
        "scheme_name": "Beti Bachao Beti Padhao Support Grant",
        "category": "Women",
        "state": "All India",
        "min_age": 5,
        "max_age": 18,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Educational support, school kit grants, and career orientation programs for girls in government schools.",
        "documents": ["School ID Card", "Aadhaar Card", "State Domicile Certificate"],
        "apply_url": "wcd.nic.in"
    },
    {
        "scheme_id": "SCH028",
        "scheme_name": "Tamil Nadu Sathiyavani Muthu Ammaiyar Memorial Scheme",
        "category": "Women",
        "state": "Tamil Nadu",
        "min_age": 20,
        "max_age": 45,
        "max_income": 72000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Provides free sewing machines to destitute widows, deserted wives, and physically challenged women for self-employment.",
        "documents": ["Widow/Deserted Certificate", "Income Certificate", "Aadhaar Card", "Residence proof"],
        "apply_url": "tnsocialwelfare.tn.gov.in"
    },
    {
        "scheme_id": "SCH029",
        "scheme_name": "Maharashtra Maza Ladki Bahin Scheme",
        "category": "Women",
        "state": "Maharashtra",
        "min_age": 21,
        "max_age": 65,
        "max_income": 250000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Monthly financial aid of ₹1,500 directly into the bank accounts of married, divorced, or widowed women of the state.",
        "documents": ["Aadhaar Card", "Income Certificate", "Maharashtra Domicile", "Bank passbook"],
        "apply_url": "ladkibahin.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH030",
        "scheme_name": "UP Shadi Bimar Anudan Yojana for Widows",
        "category": "Women",
        "state": "Uttar Pradesh",
        "min_age": 18,
        "max_age": 60,
        "max_income": 46000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Grant of ₹20,000 for the marriage of daughters of destitute widows in Uttar Pradesh.",
        "documents": ["Widow Death certificate of husband", "Income Certificate", "Daughter's age proof", "Aadhaar"],
        "apply_url": "sudha.up.nic.in"
    },
    {
        "scheme_id": "SCH031",
        "scheme_name": "Bihar Laxmi Bai Pension Scheme",
        "category": "Women",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 60,
        "max_income": 60000,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Social security pension of ₹400/month for widowed women below the poverty line.",
        "documents": ["Husband's Death Certificate", "BPL Certificate", "Aadhaar Card", "Bank details"],
        "apply_url": "socialwelfare.bih.nic.in"
    },
    {
        "scheme_id": "SCH032",
        "scheme_name": "West Bengal Laxmi Bhandar Scheme",
        "category": "Women",
        "state": "West Bengal",
        "min_age": 25,
        "max_age": 60,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Monthly financial assistance of ₹1,000 for general category and ₹1,200 for SC/ST category women.",
        "documents": ["Swasthya Sathy Card", "Aadhaar Card", "Caste Certificate (if SC/ST)", "Bank details"],
        "apply_url": "socialsecurity.wb.gov.in"
    },
    {
        "scheme_id": "SCH033",
        "scheme_name": "Karnataka Gruha Lakshmi Scheme",
        "category": "Women",
        "state": "Karnataka",
        "min_age": 19,
        "max_age": 75,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Monthly financial assistance of ₹2,000 directly credited to the woman head of household in Karnataka.",
        "documents": ["Ration Card showing woman as head", "Aadhaar Card", "Bank account link slip"],
        "apply_url": "sevasindhu.karnataka.gov.in"
    },

    # ── Startup & Business (10 schemes) ──
    {
        "scheme_id": "SCH034",
        "scheme_name": "PM MUDRA Yojana — Shishu Loan",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 65,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Collateral-free micro loans up to ₹50,000 for starting small business/retail shops with minimal processing fee.",
        "documents": ["Aadhaar Card", "Business address proof", "Bank statements (6 months)", "Passport photo"],
        "apply_url": "mudra.org.in"
    },
    {
        "scheme_id": "SCH035",
        "scheme_name": "PM MUDRA Yojana — Kishor Loan",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 65,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Collateral-free business expansion loans between ₹50,000 and ₹5,000,000 for machinery purchase and working capital.",
        "documents": ["Aadhaar Card", "Business registration certificate", "ITR returns (2 years)", "Bank account statement"],
        "apply_url": "mudra.org.in"
    },
    {
        "scheme_id": "SCH036",
        "scheme_name": "Stand Up India Scheme",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 70,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Bank loans between ₹10 lakh and ₹1 crore for starting a greenfield enterprise in manufacturing, services, or trading sector.",
        "documents": ["Caste Certificate (if SC/ST)", "Business plan project report", "Aadhaar Card", "Bank statement"],
        "apply_url": "standupmitra.in"
    },
    {
        "scheme_id": "SCH037",
        "scheme_name": "Startup India Seed Fund Scheme",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 50,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial assistance of up to ₹20 lakh for proof of concept/prototype development and ₹50 lakh for market entry/commercialization.",
        "documents": ["DPIIT recognition certificate", "Detailed Project Report", "Shareholding pattern", "PAN card"],
        "apply_url": "startupindia.gov.in"
    },
    {
        "scheme_id": "SCH038",
        "scheme_name": "Credit Guarantee Scheme for Micro & Small Enterprises",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 65,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Collateral-free credit facility up to ₹2 crore for new and existing micro and small enterprises via credit guarantee fund.",
        "documents": ["Business Registration Certificate", "Audit Reports", "Aadhaar Card", "Enterprise registration (Udyam)"],
        "apply_url": "cgtmse.in"
    },
    {
        "scheme_id": "SCH039",
        "scheme_name": "PMEGP (Prime Minister Employment Generation Programme)",
        "category": "Startup",
        "state": "All India",
        "min_age": 18,
        "max_age": 60,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidy of 15% to 35% on project cost up to ₹50 lakh for manufacturing and ₹20 lakh for service sector startups.",
        "documents": ["Education qualification certificate (8th pass min)", "Project Report", "Caste Certificate", "Aadhaar"],
        "apply_url": "kviconline.gov.in"
    },
    {
        "scheme_id": "SCH040",
        "scheme_name": "Tamil Nadu Startup Seed Grant Fund (TANSEED)",
        "category": "Startup",
        "state": "Tamil Nadu",
        "min_age": 18,
        "max_age": 45,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Seed grant support of up to ₹10 lakh to early-stage startups based in Tamil Nadu to build prototypes.",
        "documents": ["TN Startup registration certificate", "Product Pitch PPT", "Founders Profile", "Aadhaar"],
        "apply_url": "startuptn.in"
    },
    {
        "scheme_id": "SCH041",
        "scheme_name": "Maharashtra Startup Yatra Innovation Grant",
        "category": "Startup",
        "state": "Maharashtra",
        "min_age": 18,
        "max_age": 45,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial aid of ₹1 lakh to ₹5 lakh for top innovative startups and ideas selected through state-wide bootcamp.",
        "documents": ["Idea registration details", "Aadhaar Card", "College recommendation (if student)", "Business model canvas"],
        "apply_url": "msins.in"
    },
    {
        "scheme_id": "SCH042",
        "scheme_name": "UP Startup Policy Seed Capital Support",
        "category": "Startup",
        "state": "Uttar Pradesh",
        "min_age": 18,
        "max_age": 45,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Sustenance allowance of ₹15,000/month for 1 year and seed capital up to ₹5 lakh for marketing and prototype testing.",
        "documents": ["DPIIT registration", "UP Incubator reference letter", "Aadhaar Card", "Detailed business plan"],
        "apply_url": "start-up.up.gov.in"
    },
    {
        "scheme_id": "SCH043",
        "scheme_name": "Bihar Startup Policy Seed Fund",
        "category": "Startup",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 40,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Interest-free seed fund of up to ₹10 lakh for a period of 10 years to startups registered under Bihar Startup Policy.",
        "documents": ["Bihar Domicile Certificate", "Startup registration document", "Financial pitch deck", "Aadhaar"],
        "apply_url": "startup.bihar.gov.in"
    },

    # ── Employment & Skill Development (10 schemes) ──
    {
        "scheme_id": "SCH044",
        "scheme_name": "PM Kaushal Vikas Yojana (PMKVY)",
        "category": "Employment",
        "state": "All India",
        "min_age": 15,
        "max_age": 45,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Free skill training, certification, and assessment across 40+ sectors with post-training placement support and reward money.",
        "documents": ["Aadhaar Card", "School leaving certificate", "Bank Account Details", "Passport size photo"],
        "apply_url": "pmkvyofficial.org"
    },
    {
        "scheme_id": "SCH045",
        "scheme_name": "National Apprenticeship Promotion Scheme (NAPS)",
        "category": "Employment",
        "state": "All India",
        "min_age": 15,
        "max_age": 35,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Shared stipend support where the government reimburses 25% of prescribed stipend up to ₹1,500/month to apprentices during training.",
        "documents": ["Aadhaar Card", "Educational certificates", "Bank passbook", "Apprenticeship contract"],
        "apply_url": "apprenticeshipindia.gov.in"
    },
    {
        "scheme_id": "SCH046",
        "scheme_name": "Deen Dayal Upadhyaya Grameen Kaushalya Yojana",
        "category": "Employment",
        "state": "All India",
        "min_age": 15,
        "max_age": 35,
        "max_income": 120000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Placement-linked free skill training program for rural poor youth with free boarding, lodging, and uniform support.",
        "documents": ["BPL Ration Card / Income Certificate", "Aadhaar Card", "Caste Certificate", "Age Proof"],
        "apply_url": "ddugky.gov.in"
    },
    {
        "scheme_id": "SCH047",
        "scheme_name": "PM SVANidhi (Micro Loans for Street Vendors)",
        "category": "Employment",
        "state": "All India",
        "min_age": 18,
        "max_age": 65,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Collateral-free working capital loan of ₹10,000 (first tranche) with 7% interest subsidy and cashback on digital transactions.",
        "documents": ["Vendor Certificate of Vending (COV)", "Aadhaar Card", "Ration Card", "Bank details"],
        "apply_url": "pmsvanidhi.mohua.gov.in"
    },
    {
        "scheme_id": "SCH048",
        "scheme_name": "PM Vishwakarma Scheme",
        "category": "Employment",
        "state": "All India",
        "min_age": 18,
        "max_age": 70,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Skills upgrade training with ₹500/day stipend, modern toolkit incentive of ₹15,000, and low-interest collateral-free loans up to ₹3 lakh.",
        "documents": ["Aadhaar Card", "Artisan registration document", "Bank details", "Self-declaration"],
        "apply_url": "pmvishwakarma.gov.in"
    },
    {
        "scheme_id": "SCH049",
        "scheme_name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
        "category": "Employment",
        "state": "All India",
        "min_age": 18,
        "max_age": 70,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Guarantees at least 100 days of manual wage employment in a financial year to every rural household whose adult members volunteer.",
        "documents": ["Job Card Application form", "Aadhaar Card", "Ration Card", "Bank Account Details"],
        "apply_url": "nrega.nic.in"
    },
    {
        "scheme_id": "SCH050",
        "scheme_name": "Tamil Nadu Skill Development Corporation Free Training",
        "category": "Employment",
        "state": "Tamil Nadu",
        "min_age": 18,
        "max_age": 35,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Free job-oriented skill training, placement guidance, and certified courses in IT, logistics, hospitality, and retail.",
        "documents": ["Educational marksheets", "Aadhaar Card", "Community Certificate", "Passport size photos"],
        "apply_url": "tnsdc.gov.in"
    },
    {
        "scheme_id": "SCH051",
        "scheme_name": "Maharashtra Pramod Mahajan Skill Development Scheme",
        "category": "Employment",
        "state": "Maharashtra",
        "min_age": 18,
        "max_age": 45,
        "max_income": 200000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Free technical skill development training programs in government-approved training centers with job placement assurance.",
        "documents": ["Aadhaar Card", "School leaving certificate", "Income certificate", "Cast certificate"],
        "apply_url": "mahaswayam.gov.in"
    },
    {
        "scheme_id": "SCH052",
        "scheme_name": "UP Skill Development Mission (UPSDM)",
        "category": "Employment",
        "state": "Uttar Pradesh",
        "min_age": 14,
        "max_age": 35,
        "max_income": 150000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Free vocational skill courses for unemployed youth with special focus on minority and under-privileged classes.",
        "documents": ["UP Domicile", "Aadhaar Card", "Income Certificate", "Educational qualification proof"],
        "apply_url": "upsdm.gov.in"
    },
    {
        "scheme_id": "SCH053",
        "scheme_name": "Bihar Swayam Sahayata Bhatta (Self Help Allowance)",
        "category": "Employment",
        "state": "Bihar",
        "min_age": 20,
        "max_age": 25,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Allowance of ₹1,000 per month for a maximum of two years to unemployed youth during their job search.",
        "documents": ["Educational certificate (12th pass min)", "Unemployment declaration", "Aadhaar Card", "Domicile Certificate"],
        "apply_url": "7nischay-yuvadhan.bihar.gov.in"
    },

    # ── Healthcare & Medical (10 schemes) ──
    {
        "scheme_id": "SCH054",
        "scheme_name": "Ayushman Bharat PM-JAY",
        "category": "Healthcare",
        "state": "All India",
        "min_age": 1,
        "max_age": 100,
        "max_income": 150000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Free health insurance cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
        "documents": ["PMJAY Golden Card / Ration Card", "Aadhaar Card", "Income certificate"],
        "apply_url": "pmjay.gov.in"
    },
    {
        "scheme_id": "SCH055",
        "scheme_name": "PM Bhartiya Janaushadhi Pariyojana",
        "category": "Healthcare",
        "state": "All India",
        "min_age": 1,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Access to high-quality generic medicines, surgical items, and healthcare supplies at 50% to 90% lower price than market rates.",
        "documents": ["Doctor's Prescription", "Aadhaar Card"],
        "apply_url": "janaushadhi.gov.in"
    },
    {
        "scheme_id": "SCH056",
        "scheme_name": "Rashtriya Arogya Nidhi (RAN)",
        "category": "Healthcare",
        "state": "All India",
        "min_age": 1,
        "max_age": 90,
        "max_income": 120000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "One-time financial assistance of up to ₹15 lakh for patients below poverty line suffering from life-threatening diseases for treatment at super-specialty government hospitals.",
        "documents": ["Income certificate", "Medical report & estimation from hospital", "Aadhaar Card", "Ration card"],
        "apply_url": "main.mohfw.gov.in"
    },
    {
        "scheme_id": "SCH057",
        "scheme_name": "PM Surakshit Matritva Abhiyan (PMSMA)",
        "category": "Healthcare",
        "state": "All India",
        "min_age": 18,
        "max_age": 45,
        "max_income": 9999999,
        "gender": "Female",
        "disability_required": "No",
        "benefits": "Free diagnostic tests, health checkups, and doctor consultations to pregnant women on the 9th day of every month.",
        "documents": ["Pregnancy registration details", "Aadhaar Card", "MCP Card"],
        "apply_url": "pmsma.nhp.gov.in"
    },
    {
        "scheme_id": "SCH058",
        "scheme_name": "Central Government Health Scheme (CGHS)",
        "category": "Healthcare",
        "state": "All India",
        "min_age": 1,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Comprehensive medical care facilities for Central Government employees, pensioners, and their dependents including OPD and cashless hospitalization.",
        "documents": ["CGHS Card", "Service Certificate / PPO", "Aadhaar Card", "PAN Card"],
        "apply_url": "cghs.nic.in"
    },
    {
        "scheme_id": "SCH059",
        "scheme_name": "Tamil Nadu Chief Minister's Comprehensive Health Insurance",
        "category": "Healthcare",
        "state": "Tamil Nadu",
        "min_age": 1,
        "max_age": 100,
        "max_income": 120000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Cashless hospitalization up to ₹5 lakh per family per year in empanelled public and private hospitals in Tamil Nadu.",
        "documents": ["Smart Ration Card", "Income Certificate from Village Administrative Officer", "Aadhaar Card"],
        "apply_url": "cmchistn.com"
    },
    {
        "scheme_id": "SCH060",
        "scheme_name": "Mahatma Jyotirao Phule Jan Arogya Yojana",
        "category": "Healthcare",
        "state": "Maharashtra",
        "min_age": 1,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Cashless medical treatment cover of up to ₹1.5 lakh per family per year for 996 identified medical procedures.",
        "documents": ["Yellow or Orange Ration Card", "Aadhaar Card / Voter ID", "Medical certificate"],
        "apply_url": "jeevandayee.gov.in"
    },
    {
        "scheme_id": "SCH061",
        "scheme_name": "UP Mukhyamantri Jan Arogya Yojana",
        "category": "Healthcare",
        "state": "Uttar Pradesh",
        "min_age": 1,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Cashless medical insurance of up to ₹5 lakh per family per year for families left out of Ayushman Bharat PMJAY scheme.",
        "documents": ["Income certificate", "UP Domicile", "Ration Card", "Aadhaar Card"],
        "apply_url": "upnhm.gov.in"
    },
    {
        "scheme_id": "SCH062",
        "scheme_name": "Bihar Mukhyamantri Chikitsa Sahayata Kosh",
        "category": "Healthcare",
        "state": "Bihar",
        "min_age": 1,
        "max_age": 90,
        "max_income": 150000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Direct financial grant for critical operations/illness treatment at notified referral hospitals for needy families.",
        "documents": ["Bihar Domicile", "Income certificate", "Doctor's referral certificate", "Aadhaar Card"],
        "apply_url": "health.bih.nic.in"
    },
    {
        "scheme_id": "SCH063",
        "scheme_name": "Kerala Karunya Benevolent Fund",
        "category": "Healthcare",
        "state": "Kerala",
        "min_age": 1,
        "max_age": 90,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Direct financial assistance of up to ₹2 lakh for poor families for dialysis, cancer, and heart surgery procedures.",
        "documents": ["Income certificate", "Treatment estimate from hospital", "Aadhaar Card", "Ration Card"],
        "apply_url": "karunya.kerala.gov.in"
    },

    # ── Housing / Rural Infrastructure (10 schemes) ──
    {
        "scheme_id": "SCH064",
        "scheme_name": "PMAY-G (Gramin Housing)",
        "category": "Housing",
        "state": "All India",
        "min_age": 18,
        "max_age": 80,
        "max_income": 150000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial grant of ₹1.2 lakh (plains) or ₹1.3 lakh (hilly areas) to construct a pucca house with clean toilet and kitchen facilities.",
        "documents": ["BPL Certificate / SECC number", "Aadhaar Card", "Land ownership proof", "Bank account"],
        "apply_url": "pmayg.nic.in"
    },
    {
        "scheme_id": "SCH065",
        "scheme_name": "PMAY-U (Urban Housing Credit Subsidy)",
        "category": "Housing",
        "state": "All India",
        "min_age": 18,
        "max_age": 80,
        "max_income": 1800000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Interest rate subsidy of 3% to 6.5% on home loans for EWS, LIG, and MIG categories for buying/constructing first pucca house.",
        "documents": ["Annual Income Certificate", "Affidavit declaring no pucca house in India", "Aadhaar Card", "PAN Card", "Home loan documents"],
        "apply_url": "pmaymis.gov.in"
    },
    {
        "scheme_id": "SCH066",
        "scheme_name": "DDA Housing Scheme",
        "category": "Housing",
        "state": "Delhi",
        "min_age": 18,
        "max_age": 80,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Allotment of flats in Delhi (EWS, LIG, MIG, HIG categories) through draw of lots at concessional/subsidized prices.",
        "documents": ["PAN Card", "Aadhaar Card", "Domicile certificate of Delhi", "Income certificate (for EWS)"],
        "apply_url": "dda.gov.in"
    },
    {
        "scheme_id": "SCH067",
        "scheme_name": "Delhi Gramin Awas Scheme",
        "category": "Housing",
        "state": "Delhi",
        "min_age": 18,
        "max_age": 80,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidy of up to ₹2.5 lakh for rural Delhi residents to reconstruct old/kucha structures into pucca homes.",
        "documents": ["Ration Card", "Property ownership/possession certificate", "Income certificate", "Aadhaar Card"],
        "apply_url": "delhi.gov.in"
    },
    {
        "scheme_id": "SCH068",
        "scheme_name": "Tamil Nadu Slum Clearance Board (TNSCB) Flats",
        "category": "Housing",
        "state": "Tamil Nadu",
        "min_age": 18,
        "max_age": 75,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Allotment of tenements in multi-storied tenements at highly subsidized monthly hire purchase rates for slum dwellers.",
        "documents": ["Slum survey identification card", "Smart card/Ration card", "Aadhaar Card", "Bank Details"],
        "apply_url": "tnuhdb.tn.gov.in"
    },
    {
        "scheme_id": "SCH069",
        "scheme_name": "MHADA Housing Scheme (Maharashtra)",
        "category": "Housing",
        "state": "Maharashtra",
        "min_age": 18,
        "max_age": 80,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Concessional pricing allotment of flats across Mumbai, Pune, Konkan, and Nagpur divisions through computerized lottery.",
        "documents": ["Maharashtra Domicile (min 15 years)", "Income Certificate (EWS/LIG)", "PAN Card", "Aadhaar Card"],
        "apply_url": "mhada.gov.in"
    },
    {
        "scheme_id": "SCH070",
        "scheme_name": "UP Awas Vikas Parishad Concessional Flats",
        "category": "Housing",
        "state": "Uttar Pradesh",
        "min_age": 18,
        "max_age": 75,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidized housing plots and pre-built houses for economically weaker sections in urban clusters of Uttar Pradesh.",
        "documents": ["UP Domicile Certificate", "Income certificate", "Aadhaar Card", "PAN card"],
        "apply_url": "upavp.in"
    },
    {
        "scheme_id": "SCH071",
        "scheme_name": "Bihar Mukhyamantri Gramin Awas Yojana",
        "category": "Housing",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 75,
        "max_income": 120000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Cash financial grant of ₹1.2 lakh for families who have lost homes in natural calamities or belong to BPL category.",
        "documents": ["Calamity damage proof / BPL Certificate", "Aadhaar Card", "Land possession papers", "Bank details"],
        "apply_url": "rural.bih.nic.in"
    },
    {
        "scheme_id": "SCH072",
        "scheme_name": "Karnataka Rajiv Gandhi Rural Housing",
        "category": "Housing",
        "state": "Karnataka",
        "min_age": 18,
        "max_age": 75,
        "max_income": 200000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidy support up to ₹1.5 lakh for construction of houses in rural areas for homeless families.",
        "documents": ["Karnataka Domicile", "Ration Card", "Income certificate", "Land records", "Aadhaar"],
        "apply_url": "ashraya.karnataka.gov.in"
    },
    {
        "scheme_id": "SCH073",
        "scheme_name": "West Bengal Nijashree Housing Scheme",
        "category": "Housing",
        "state": "West Bengal",
        "min_age": 18,
        "max_age": 70,
        "max_income": 360000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Subsidized flats (1BHK and 2BHK) for LIG and MIG groups with household income below ₹30,000 per month.",
        "documents": ["Salary slip / Income declaration", "WB Domicile certificate", "Aadhaar Card", "PAN Card"],
        "apply_url": "wbhousing.gov.in"
    },

    # ── Senior Citizen Support (10 schemes) ──
    {
        "scheme_id": "SCH074",
        "scheme_name": "Indira Gandhi National Old Age Pension Scheme",
        "category": "Senior Citizen",
        "state": "All India",
        "min_age": 60,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly pension of ₹200 for ages 60-79, and ₹500 for ages 80+ belonging to BPL households, with direct bank transfers.",
        "documents": ["Age Proof (Aadhaar/School Certificate)", "BPL Certificate / BPL Ration Card", "Bank Account Details"],
        "apply_url": "nsap.nic.in"
    },
    {
        "scheme_id": "SCH075",
        "scheme_name": "Varishtha Pension Bima Yojana (VPBY)",
        "category": "Senior Citizen",
        "state": "All India",
        "min_age": 60,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Guaranteed 7.4% pension yield return on a one-time lump-sum purchase through Life Insurance Corporation (LIC) of India.",
        "documents": ["Aadhaar Card", "PAN Card", "Age Proof Certificate", "Bank details for auto credit"],
        "apply_url": "licindia.in"
    },
    {
        "scheme_id": "SCH076",
        "scheme_name": "Senior Citizens Savings Scheme (SCSS)",
        "category": "Senior Citizen",
        "state": "All India",
        "min_age": 60,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Risk-free investment option for retirement funds offering high-interest rate of 8.2% paid quarterly with a maximum cap of ₹30 lakh.",
        "documents": ["Aadhaar Card", "PAN Card", "Retirement proof (if claiming age 55-60 relief)", "Passport Photo"],
        "apply_url": "indiapost.gov.in"
    },
    {
        "scheme_id": "SCH077",
        "scheme_name": "PM Vaya Vandana Yojana (PMVVY)",
        "category": "Senior Citizen",
        "state": "All India",
        "min_age": 60,
        "max_age": 100,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Pension scheme for seniors offering an assured return of 7.40% per annum for a policy term of 10 years, managed by LIC.",
        "documents": ["Aadhaar Card", "PAN Card", "Bank passbook page", "Senior citizen card"],
        "apply_url": "licindia.in"
    },
    {
        "scheme_id": "SCH078",
        "scheme_name": "Rashtriya Vayoshri Yojana (RVY)",
        "category": "Senior Citizen",
        "state": "All India",
        "min_age": 60,
        "max_age": 100,
        "max_income": 180000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Provides physical aids and assisted-living devices (hearing aids, wheel chairs, walking sticks, spectacles) for BPL senior citizens.",
        "documents": ["Senior citizen age proof", "BPL Certificate / Pension card", "Doctor prescription for device"],
        "apply_url": "socialjustice.gov.in"
    },
    {
        "scheme_id": "SCH079",
        "scheme_name": "Tamil Nadu Old Age Pension (OAP) Scheme",
        "category": "Senior Citizen",
        "state": "Tamil Nadu",
        "min_age": 60,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly pension of ₹1,000 plus free rice and handloom clothes during festivals for destitute senior citizens.",
        "documents": ["Age Certificate (Aadhaar or Medical Officer card)", "Destitute declaration", "Bank Passbook"],
        "apply_url": "tn.gov.in"
    },
    {
        "scheme_id": "SCH080",
        "scheme_name": "Maharashtra Sanjay Gandhi Niradhar Senior Pension",
        "category": "Senior Citizen",
        "state": "Maharashtra",
        "min_age": 65,
        "max_age": 100,
        "max_income": 50000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly financial aid of ₹1,000 for destitute senior citizens who do not have any source of income or family support.",
        "documents": ["Age Proof (65+)", "Income Certificate (below 50k)", "Domicile of Maharashtra (15 yrs)", "Aadhaar"],
        "apply_url": "mahasocialjustice.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH081",
        "scheme_name": "UP Old Age Pension Scheme",
        "category": "Senior Citizen",
        "state": "Uttar Pradesh",
        "min_age": 60,
        "max_age": 100,
        "max_income": 56000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly pension of ₹1,000 directly transferred to bank accounts of senior citizens below poverty line in UP.",
        "documents": ["UP Domicile", "Income Certificate (under 56k rural/66k urban)", "Aadhaar Card", "Bank Details"],
        "apply_url": "sspy-up.gov.in"
    },
    {
        "scheme_id": "SCH082",
        "scheme_name": "Bihar Old Age Pension (Laxmi Bai / IGNOAPS State Top-up)",
        "category": "Senior Citizen",
        "state": "Bihar",
        "min_age": 60,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "State pension of ₹400/month for age 60-79 and ₹500/month for age 80+ for registered BPL senior citizens.",
        "documents": ["Age Proof", "BPL list verification copy", "Aadhaar Card", "Bank passbook"],
        "apply_url": "socialwelfare.bih.nic.in"
    },
    {
        "scheme_id": "SCH083",
        "scheme_name": "Karnataka Sandhya Suraksha Scheme",
        "category": "Senior Citizen",
        "state": "Karnataka",
        "min_age": 65,
        "max_age": 100,
        "max_income": 20000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Monthly financial assistance of ₹1,000 for senior citizens in Karnataka to meet basic survival costs.",
        "documents": ["Age proof (65+)", "Income certificate from Tahsildar", "Aadhaar Card", "Domicile Certificate"],
        "apply_url": "sevasindhu.karnataka.gov.in"
    },

    # ── Disability Support (10 schemes) ──
    {
        "scheme_id": "SCH084",
        "scheme_name": "Indira Gandhi National Disability Pension Scheme",
        "category": "Disability",
        "state": "All India",
        "min_age": 18,
        "max_age": 79,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Monthly pension of ₹300 for disabled persons with 80% or more severe disability living below poverty line.",
        "documents": ["Disability Certificate (80%+ disability)", "BPL Certificate / Ration Card", "Aadhaar Card", "Bank details"],
        "apply_url": "nsap.nic.in"
    },
    {
        "scheme_id": "SCH085",
        "scheme_name": "Accessible India Campaign (Sugamya Bharat)",
        "category": "Disability",
        "state": "All India",
        "min_age": 5,
        "max_age": 80,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Provision of free assistive devices (wheelchairs, tri-cycles, braille books, smart canes) and skill training to PwDs.",
        "documents": ["Disability Certificate (40%+)", "Aadhaar Card", "Income Certificate"],
        "apply_url": "disabilityaffairs.gov.in"
    },
    {
        "scheme_id": "SCH086",
        "scheme_name": "National Scholarship for PwD Students",
        "category": "Disability",
        "state": "All India",
        "min_age": 10,
        "max_age": 30,
        "max_income": 250000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Tuition fee waiver and monthly allowance of ₹2,500 for pursuing technical/professional degrees for students with disabilities.",
        "documents": ["Disability Certificate", "College admission proof", "Income certificate", "Aadhaar"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH087",
        "scheme_name": "Deendayal Disabled Rehabilitation Scheme (DDRS)",
        "category": "Disability",
        "state": "All India",
        "min_age": 1,
        "max_age": 80,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Financial grants to NGOs and special schools to provide free rehabilitation, therapies, and vocational training to children with disabilities.",
        "documents": ["Disability Certificate", "Aadhaar Card", "Special School registration records"],
        "apply_url": "disabilityaffairs.gov.in"
    },
    {
        "scheme_id": "SCH088",
        "scheme_name": "ADIP Scheme (Purchase of Aids/Appliances for PwD)",
        "category": "Disability",
        "state": "All India",
        "min_age": 1,
        "max_age": 90,
        "max_income": 360000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Full grant support for aids costing up to ₹15,000 (such as digital hearing aids, smart canes, motorized tricycles) for needy PwD.",
        "documents": ["Disability Certificate (40%+)", "Income Certificate (below 30k/month)", "Aadhaar Card"],
        "apply_url": "disabilityaffairs.gov.in"
    },
    {
        "scheme_id": "SCH089",
        "scheme_name": "Tamil Nadu Differently Abled Maintenance Allowance",
        "category": "Disability",
        "state": "Tamil Nadu",
        "min_age": 1,
        "max_age": 100,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Monthly allowance of ₹2,000 for persons with severe mental retardation, autism, cerebral palsy, and multiple disabilities.",
        "documents": ["Disability Certificate (indicating 75%+ disability)", "Aadhaar Card", "Ration Card"],
        "apply_url": "scd.tn.gov.in"
    },
    {
        "scheme_id": "SCH090",
        "scheme_name": "Maharashtra Sanjay Gandhi Niradhar Divyang Pension",
        "category": "Disability",
        "state": "Maharashtra",
        "min_age": 18,
        "max_age": 65,
        "max_income": 50000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Monthly financial aid of ₹1,000 for physically challenged persons with no source of livelihood.",
        "documents": ["Disability Certificate (40%+)", "Income certificate", "Maharashtra Domicile", "Aadhaar"],
        "apply_url": "mahasocialjustice.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH091",
        "scheme_name": "UP Divyang Pension Scheme",
        "category": "Disability",
        "state": "Uttar Pradesh",
        "min_age": 18,
        "max_age": 100,
        "max_income": 56000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Monthly social security pension of ₹1,000 directly transferred to Divyang beneficiaries in UP.",
        "documents": ["Disability Certificate (40%+)", "Domicile certificate", "Income certificate", "Aadhaar Card"],
        "apply_url": "sspy-up.gov.in"
    },
    {
        "scheme_id": "SCH092",
        "scheme_name": "Bihar Divyangjan Pension Yojana",
        "category": "Disability",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 70,
        "max_income": 100000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Pension of ₹400/month for disabled citizens in Bihar, irrespective of their BPL ranking, to support medication costs.",
        "documents": ["Disability Certificate", "Bihar Resident certificate", "Aadhaar Card", "Bank passbook"],
        "apply_url": "socialwelfare.bih.nic.in"
    },
    {
        "scheme_id": "SCH093",
        "scheme_name": "Karnataka Disability Pension Scheme",
        "category": "Disability",
        "state": "Karnataka",
        "min_age": 16,
        "max_age": 80,
        "max_income": 50000,
        "gender": "All",
        "disability_required": "Yes",
        "benefits": "Monthly pension of ₹800 (for 40%-75% disability) or ₹1,400 (for 75%+ disability) directly credited to accounts.",
        "documents": ["Disability Certificate / UDID Card", "Income certificate", "Aadhaar Card", "Ration card"],
        "apply_url": "sevasindhu.karnataka.gov.in"
    },

    # ── General Education & Loans (9 schemes) ──
    {
        "scheme_id": "SCH094",
        "scheme_name": "Central Sector Interest Subsidy Scheme (CSIS) for Education Loans",
        "category": "Education",
        "state": "All India",
        "min_age": 17,
        "max_age": 30,
        "max_income": 450000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Full interest subsidy during the moratorium period (course period + 1 year) on educational loans up to ₹7.5 lakh taken from nationalized banks.",
        "documents": ["Bank Loan Approval Letter", "Income Certificate from authorized authority", "Admission proof of professional course", "Aadhaar"],
        "apply_url": "education.gov.in"
    },
    {
        "scheme_id": "SCH095",
        "scheme_name": "National Overseas Scholarship Scheme",
        "category": "Education",
        "state": "All India",
        "min_age": 18,
        "max_age": 35,
        "max_income": 800000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial assistance covering full tuition fees, annual maintenance allowance, air passage, and visa fees for SC/ST students studying Masters/PhD abroad.",
        "documents": ["Admission offer from listed foreign university", "Caste Certificate", "Income Certificate", "GRE/IELTS marksheet", "Aadhaar"],
        "apply_url": "nosmsje.gov.in"
    },
    {
        "scheme_id": "SCH096",
        "scheme_name": "PM-USP Central Sector Scholarship for College Students",
        "category": "Education",
        "state": "All India",
        "min_age": 17,
        "max_age": 25,
        "max_income": 450000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Financial aid of ₹12,000 per annum for graduation and ₹20,000 per annum for post-graduation for meritorious college students.",
        "documents": ["12th standard Board roll number/marksheet (top 20th percentile)", "Income Certificate", "College admission receipt", "Aadhaar"],
        "apply_url": "scholarships.gov.in"
    },
    {
        "scheme_id": "SCH097",
        "scheme_name": "Bihar Student Credit Card Scheme",
        "category": "Education",
        "state": "Bihar",
        "min_age": 18,
        "max_age": 28,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Provides education loans up to ₹4 lakh at 1% interest rate for disabled/women (4% for others) for pursuing higher studies in engineering, medical, MBA, etc.",
        "documents": ["Bihar Domicile", "10th and 12th certificates", "College Admission Offer letter", "Detailed Course Fee structure", "Aadhaar Card"],
        "apply_url": "7nischay-yuvadhan.bihar.gov.in"
    },
    {
        "scheme_id": "SCH098",
        "scheme_name": "West Bengal Student Credit Card",
        "category": "Education",
        "state": "West Bengal",
        "min_age": 18,
        "max_age": 40,
        "max_income": 9999999,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Education loan up to ₹10 lakh at a simple annual interest rate of 4% with a repayment window of 15 years.",
        "documents": ["Resident of WB proof (10 years minimum)", "Admission receipt of course", "PAN card of student and co-borrower", "Aadhaar"],
        "apply_url": "wbscc.wb.gov.in"
    },
    {
        "scheme_id": "SCH099",
        "scheme_name": "Maharashtra Dr. Punjabrao Deshmukh Hostel Subsidy",
        "category": "Education",
        "state": "Maharashtra",
        "min_age": 17,
        "max_age": 30,
        "max_income": 800000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Hostel allowance up to ₹30,000 per year for children of registered farmers or small laborers studying in metropolitan cities.",
        "documents": ["Registered laborer card or Land papers", "Hostel fee details", "Income certificate", "Aadhaar"],
        "apply_url": "mahadbt.maharashtra.gov.in"
    },
    {
        "scheme_id": "SCH100",
        "scheme_name": "UP Fee Reimbursement Scheme for SC/ST Students",
        "category": "Education",
        "state": "Uttar Pradesh",
        "min_age": 16,
        "max_age": 30,
        "max_income": 250000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Direct reimbursement of college admission and annual tuition fees to university/college bank accounts for SC/ST students.",
        "documents": ["SC/ST Caste certificate", "UP Domicile card", "Admission validation letter", "Income certificate"],
        "apply_url": "scholarship.up.gov.in"
    },
    {
        "scheme_id": "SCH101",
        "scheme_name": "Karnataka Arivu Education Loan Scheme for Minorities",
        "category": "Education",
        "state": "Karnataka",
        "min_age": 17,
        "max_age": 28,
        "max_income": 250000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Concessional study loan of up to ₹50,000 per year at 2% interest rate for Christian, Muslim, Jain, Buddhist, and Sikh students.",
        "documents": ["Minority certificate", "Income certificate", "CET/NEET admission card", "Aadhaar Card"],
        "apply_url": "kmdc.karnataka.gov.in"
    },
    {
        "scheme_id": "SCH102",
        "scheme_name": "Tamil Nadu Dr. Ambedkar Higher Education Special Loan",
        "category": "Education",
        "state": "Tamil Nadu",
        "min_age": 17,
        "max_age": 30,
        "max_income": 300000,
        "gender": "All",
        "disability_required": "No",
        "benefits": "Interest-free educational loan support of up to ₹50,000 for SC/ST students pursuing professional degrees.",
        "documents": ["SC/ST certificate", "Tamil Nadu Domicile", "Marksheets of 12th", "College admission card", "Aadhaar"],
        "apply_url": "tahdco.tn.gov.in"
    }
]


def seed_schemes(force: bool = False) -> None:
    """
    Seeds both the core DB and the ChromaDB collection.
    """
    # 1. Seed Core DB (MongoDB or Local JSON fallback)
    db_count = db.schemes.count_documents({})
    if db_count >= len(RAW_SCHEMES) and not force:
        print(f"Database already has {db_count} schemes. Skipping DB seed.")
    else:
        # Clear existing
        deleted = db.schemes.delete_many({})
        print(f"Cleared {deleted} existing schemes from core DB.")
        for item in RAW_SCHEMES:
            db.schemes.insert_one(item.copy())
        print(f"[SUCCESS] Seeded {len(RAW_SCHEMES)} schemes into core DB.")

    # 2. Seed ChromaDB
    client = chromadb.PersistentClient(path=_CHROMA_PATH)
    col = client.get_or_create_collection(name="gov_schemes")
    existing_chroma = col.count()

    if existing_chroma >= len(RAW_SCHEMES) and not force:
        print(f"ChromaDB already has {existing_chroma} documents. Skipping ChromaDB seed.")
        return

    if existing_chroma > 0:
        col.delete(ids=col.get()["ids"])
        print(f"Cleared {existing_chroma} documents from ChromaDB.")

    # Build semantic documents for ChromaDB
    documents = []
    ids = []
    
    for item in RAW_SCHEMES:
        doc_str = (
            f"Scheme Name: {item['scheme_name']}\n"
            f"Category: {item['category']}\n"
            f"State: {item['state']}\n"
            f"Benefits: {item['benefits']}\n"
            f"Eligibility Rules: Age limits {item['min_age']} to {item['max_age']}; "
            f"Max Family Income is ₹{item['max_income']:,}; Applicable to gender: {item['gender']}; "
            f"Disability Required: {item['disability_required']}.\n"
            f"Required Documents: {', '.join(item['documents'])}.\n"
            f"Apply Link: {item['apply_url']}"
        )
        documents.append(doc_str)
        ids.append(item["scheme_id"])

    col.add(documents=documents, ids=ids)
    print(f"[SUCCESS] Seeded {len(documents)} scheme documents into ChromaDB.")


if __name__ == "__main__":
    seed_schemes(force=True)
