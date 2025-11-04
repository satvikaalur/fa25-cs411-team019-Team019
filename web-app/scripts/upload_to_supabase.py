# scripts/upload_to_supabase.py
import pandas as pd
import numpy as np
from supabase import create_client
from dotenv import load_dotenv
import os

# --- Load environment variables ---
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Load CSV ---
csv_file = "data/purchasing_2023.csv"  # Update path if needed
df = pd.read_csv(csv_file)

# --- DATA TRANSFORMATION ---

# 1. Handle N/A values
df = df.replace(['n/a', 'N/A', 'na', 'NA', ''], np.nan)

# 2. Generate emails
df['customer_name_clean'] = df['customer_name'].fillna('Unknown Customer')
df['email'] = df.apply(
    lambda row: f"{row['customer_name_clean'].strip().replace(' ', '.').lower()}.{int(row['customer_id'])}@example.com"
    if pd.notna(row['customer_name']) else f"customer.{int(row['customer_id'])}@example.com",
    axis=1
)

# 3. Convert dates to datetime
df['purchase_date'] = pd.to_datetime(df['purchase_date'], format='%m/%d/%Y %H:%M', errors='coerce')
df['call_date'] = pd.to_datetime(df['call_date'], format='%m/%d/%Y %H:%M', errors='coerce')

# 4. Create unique IDs
df['customerid'] = df['customer_id']
df['purchaseid'] = range(1, len(df) + 1)

# Return IDs
df['return_clean'] = df['return'].astype(str).str.lower().str.strip()
return_mask = (
    df['return'].notna() &
    (df['return_clean'] != 'nan') &
    (df['return_clean'] != 'n/a') &
    (df['return_clean'] != 'false') &
    (df['return_clean'] != '0') &
    (df['return_clean'] != '')
)
df['returnid'] = np.nan
df.loc[return_mask, 'returnid'] = range(1, return_mask.sum() + 1)

# --- EmailList table ---
emaillist_df = df[df['call_category'].notna()][['call_category']].drop_duplicates()
emaillist_df['listid'] = range(1, len(emaillist_df) + 1)
emaillist_df['createddate'] = pd.Timestamp.today()
emaillist_df.rename(columns={'call_category': 'listtitle'}, inplace=True)
emaillist_df['createddate'] = emaillist_df['createddate'].apply(lambda x: x.isoformat() if pd.notna(x) else None)

# --- Employee table ---
employees_list = []

# Agents
agents = df[df['agent'].notna()][['agent', 'employment_length']].drop_duplicates()
for _, row in agents.iterrows():
    tenure_text = str(row['employment_length']) if pd.notna(row['employment_length']) else None
    employees_list.append({'empname': row['agent'], 'emptitle': 'Agent', 'tenure': tenure_text})

# Supervisors
supervisors = df[df['supervisor'].notna()]['supervisor'].unique()
for s in supervisors:
    if not any(emp['empname'] == s for emp in employees_list):
        employees_list.append({'empname': s, 'emptitle': 'Supervisor', 'tenure': None})

# Managers
managers = df[df['manager'].notna()]['manager'].unique()
for m in managers:
    if not any(emp['empname'] == m for emp in employees_list):
        employees_list.append({'empname': m, 'emptitle': 'Manager', 'tenure': None})

employee_df = pd.DataFrame(employees_list)
employee_df['employeeid'] = range(1, len(employee_df) + 1)

# Map employee names to IDs
agent_to_id = dict(zip(employee_df['empname'], employee_df['employeeid']))
df['employeeid'] = df['agent'].map(agent_to_id)

# Map call categories to list IDs
category_to_listid = dict(zip(emaillist_df['listtitle'], emaillist_df['listid']))
df['listid'] = df['call_category'].map(category_to_listid)

# Convert returned column to boolean
df['returned'] = return_mask

# --- PREPARE TABLE DATA ---

# Customer table
customer_temp = df[['customerid', 'email', 'customer_name_clean', 'customer_age', 'customer_gender']].copy()
customer_temp['name_not_null'] = customer_temp['customer_name_clean'].notna() & (customer_temp['customer_name_clean'] != 'Unknown Customer')
customer_temp['age_not_null'] = customer_temp['customer_age'].notna()
customer_temp['gender_not_null'] = customer_temp['customer_gender'].notna()

customer_df = customer_temp.sort_values(
    ['customerid', 'name_not_null', 'age_not_null', 'gender_not_null'],
    ascending=[True, False, False, False]
).drop_duplicates(subset=['customerid'], keep='first')

customer_df = customer_df[['customerid', 'email', 'customer_name_clean', 'customer_age', 'customer_gender']]
customer_df.columns = ['customerid', 'email', 'custname', 'age', 'gender']
customer_df['age'] = customer_df['age'].fillna(-1)

# CustomerEmailList
customer_emaillist_df = df[df['listid'].notna()][['customerid', 'listid']].drop_duplicates()
customer_emaillist_df = customer_emaillist_df.dropna(subset=['customerid', 'listid'])
customer_emaillist_df['customerid'] = customer_emaillist_df['customerid'].astype(int)
customer_emaillist_df['listid'] = customer_emaillist_df['listid'].astype(int)

# Purchase table
purchase_df = df[['purchaseid', 'customerid', 'purchase_date', 'product_quantity',
                  'product_category', 'purchase_amount', 'returned']].copy()
purchase_df.columns = ['purchaseid', 'customerid', 'purchdate', 'quantity', 'category', 'amount', 'returned']
purchase_df['purchdate'] = purchase_df['purchdate'].apply(lambda x: x.isoformat() if pd.notna(x) else None)

# --- Returns table ---
returns_df = df[df['returnid'].notna()][['returnid', 'purchaseid', 'employeeid', 'call_date', 'csat_score']].copy()
returns_df.columns = ['returnid', 'purchaseid', 'employeeid', 'returndate', 'csat_score']

# Ensure datetime is ISO format string
returns_df['returndate'] = returns_df['returndate'].apply(lambda x: x.isoformat() if pd.notna(x) else None)

# Drop rows missing key IDs
returns_df = returns_df.dropna(subset=['returnid', 'purchaseid'])

# --- Clean up numeric IDs ---
for col in ['returnid', 'purchaseid', 'employeeid']:
    if col in returns_df.columns:
        returns_df[col] = (
            pd.to_numeric(returns_df[col], errors='coerce')
            .fillna(-1)
            .astype(int)
            .replace(-1, None)
        )


# --- UPSERT INTO SUPABASE ---

supabase.table("customer").upsert(customer_df.to_dict(orient="records"), on_conflict="customerid").execute()
supabase.table("emaillist").upsert(emaillist_df.to_dict(orient="records"), on_conflict="listid").execute()
supabase.table("employee").upsert(employee_df.to_dict(orient="records"), on_conflict="employeeid").execute()
supabase.table("purchase").upsert(purchase_df.to_dict(orient="records"), on_conflict="purchaseid").execute()
supabase.table("customeremaillist").upsert(customer_emaillist_df.to_dict(orient="records")).execute()
supabase.table("returns").upsert(returns_df.to_dict(orient="records"), on_conflict="returnid").execute()

print("All data successfully uploaded to Supabase!")