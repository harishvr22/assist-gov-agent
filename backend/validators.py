"""
validators.py
Input validation for the /api/check-eligibility endpoint.
Returns (cleaned_profile, errors_dict). errors_dict is empty on success.
"""

VALID_GENDERS = {"Male", "Female", "Other"}
VALID_OCCUPATIONS = {
    "Student", "Farmer", "Employee",
    "Self-Employed", "Unemployed", "Senior Citizen",
}
VALID_CATEGORIES = {"General", "OBC", "SC", "ST"}
VALID_DISABILITY = {"Yes", "No"}

INDIAN_STATES_UTS = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
    # Union Territories
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
}


def validate_profile(data: dict) -> tuple[dict, dict]:
    """
    Returns (cleaned_profile, errors).
    cleaned_profile has Python-native types (int for age/income etc.)
    """
    errors = {}
    profile = {}

    # full_name
    full_name = str(data.get("full_name", "")).strip()
    if not full_name or len(full_name) > 100:
        errors["full_name"] = "Full name must be 1–100 characters."
    else:
        profile["full_name"] = full_name

    # age
    try:
        age = int(data.get("age"))
        if not (1 <= age <= 120):
            raise ValueError
        profile["age"] = age
    except (TypeError, ValueError):
        errors["age"] = "Age must be an integer between 1 and 120."

    # gender
    gender = str(data.get("gender", "")).strip()
    if gender not in VALID_GENDERS:
        errors["gender"] = f"Gender must be one of {sorted(VALID_GENDERS)}."
    else:
        profile["gender"] = gender

    # state
    state = str(data.get("state", "")).strip()
    if state not in INDIAN_STATES_UTS:
        errors["state"] = "Please provide a valid Indian state or union territory."
    else:
        profile["state"] = state

    # district
    district = str(data.get("district", "")).strip()
    if not district or len(district) > 100:
        errors["district"] = "District must be 1–100 characters."
    else:
        profile["district"] = district

    # annual_family_income
    try:
        income = int(data.get("annual_family_income"))
        if income < 0:
            raise ValueError
        profile["annual_family_income"] = income
    except (TypeError, ValueError):
        errors["annual_family_income"] = "Annual family income must be a non-negative integer."

    # occupation
    occupation = str(data.get("occupation", "")).strip()
    if occupation not in VALID_OCCUPATIONS:
        errors["occupation"] = f"Occupation must be one of {sorted(VALID_OCCUPATIONS)}."
    else:
        profile["occupation"] = occupation

    # category
    category = str(data.get("category", "")).strip()
    if category not in VALID_CATEGORIES:
        errors["category"] = f"Category must be one of {sorted(VALID_CATEGORIES)}."
    else:
        profile["category"] = category

    # disability_status
    disability = str(data.get("disability_status", "")).strip()
    if disability not in VALID_DISABILITY:
        errors["disability_status"] = "Disability status must be 'Yes' or 'No'."
    else:
        profile["disability_status"] = disability

    return profile, errors
