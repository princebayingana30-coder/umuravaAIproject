# 👥 Umurava Recruiter Workflow: Step-by-Step Usage Guide

**For**: Actual Recruiters at Umurava  
**Purpose**: Day-to-day usage of TalentIQ AI  
**Created**: April 11, 2026

---

## 🎯 Typical Recruiter Day

### Morning: Plan Hiring Pipeline

```
8:00 AM - Recruiter logs in
├─ Goes to dashboard
│  ├─ Sees 5 open positions
│  ├─ Sees 342 candidates already screened
│  ├─ Sees 18 already hired
│  └─ Knows hiring is on track
└─ Reviews weekend activity
   ├─ 47 new resumes arrived (screened overnight by AI)
   ├─ Top 5 candidates scored 85%+
   └─ 2 suspicious AI-generated resumes detected [WARNING]
```

---

## Morning Task 1: Create New Job Position

### Step 1: Click "Post New Job"

```
Button Location: Dashboard → "Post New Job" (top right)
```

### Step 2: Fill Out Job Details

```
📝 Job Title
Input: "Senior Backend Engineer"

📝 Description
Input: "Building payment processing systems for e-commerce. 
        Lead a team of 2 junior engineers. Remote-first, 
        but quarterly in-person required."

📝 Required Skills (select from list or add custom)
☑ Node.js
☑ TypeScript
☑ MongoDB
☑ REST APIs
☑ Redis
☑ System Design

📝 Experience Requirement
Input: "3-5 years in backend development"

📝 Nice-to-Have Skills
☑ AWS
☑ Docker / Kubernetes
☑ GraphQL
```

### Step 3: Set AI Scoring Weights (Optional)

```
Default (from IMPLEMENTATION_STRATEGY):
[CHECK] Skills: 35% (core job requirements)
[CHECK] Experience: 25% (years in role)
[CHECK] Projects: 20% (built relevant systems)
[CHECK] Education: 10% (degree/bootcamp)
[CHECK] Certifications: 5% (AWS, etc.)
[CHECK] Availability: 5% (start date match)

Custom (optional override):
- Click "Customize Weights"
- Adjust if needed (e.g., "Projects more important than Education")
- Save
```

### Step 4: Post Job

```
Click "Save & Post"
├─ Job saved to database
├─ Assigned unique job ID
├─ Job appears on dashboard
├─ Status: "Open - Ready for Candidates"
└─ Next: Upload resumes
```

---

## Morning Task 2: Upload and Screen Candidates

### Scenario: Received 50 resumes via email

### Step 1: Go to Screening Page

```
Click on job title on dashboard
├─ Redirected to: /screening/[jobId]
├─ Page shows:
│  ├─ Job title (Senior Backend Engineer)
│  ├─ Upload button
│  └─ (Empty) Candidates list
```

### Step 2: Upload Resumes (Bulk)

```
Click "Upload Resumes"
├─ File picker opens
├─ Select first 10 PDFs (or drag-drop 50 at once)
├─ System shows "Uploading..."
├─ Once complete: "Processing candidates..."
│  ├─ AI screening begins in background
│  ├─ Parsing resume text
│  ├─ Calculating 6-factor scores
│  ├─ Detecting AI-generated resumes
│  └─ (Usually 30-60 seconds for 50 resumes)
└─ Results appear as they complete
```

### Step 3: Watch Results Stream In

```
As AI finishes each candidate:
1. New row appears in candidates list
2. Ranked by score (highest first)
3. Status badge: 
   ├─ #1, #2, #3, etc. (rank)
   ├─ 92% (score)
   ├─ 15% AI (authenticity score - 15% likely AI-generated)
   └─ "Strong shortlist candidate"
```

---

## Midday Task 3: Review Top Candidates

### Step 1: See Auto-Ranked List

```
Candidates now appear in order:
1️⃣ #1 - John Smith - 92%
   [CHECK] All required skills present
   [CHECK] 5 years backend experience (exceeds 3-5 requirement)
   [CHECK] Built 3 relevant projects
   [CHECK] BS Computer Science
   [CHECK] Available immediately
   ❌ Authenticity: 8% AI (human-like ✓)

2️⃣ #2 - Alice Johnson - 87%
   [CHECK] All required skills
   [CHECK] 4 years experience
   [CHECK] 2 relevant projects
   [WARNING] "Some gaps in system design knowledge"
   [CHECK] AWS certified (bonus!)
   ❌ Authenticity: 22% AI (mostly human ✓)

3️⃣ #3 - David Lee - 81%
   [CHECK] Most skills present (missing GraphQL - nice-to-have)
   [CHECK] 3.5 years experience
   [WARNING] Only 1 relevant project
   [CHECK] Self-taught, strong background
   ❌ Authenticity: 45% AI (some generic text [WARNING])

4️⃣ #4 - Sarah Chen - 62%
   ❌ Missing Node.js (critical skill)
   ❌ 2 years experience (below 3-5 range)
   [WARNING] No relevant projects
   [CHECK] Master's in CS
   [WARNING] Not available for 1 month
   ❌ Authenticity: 8% AI

🚫 #5 - Mike Brown - 45%
   ❌ Likely AI-generated resume (87% AI-like)
   ❌ Suspicious patterns detected
   → RECOMMENDATION: Reject
```

### Step 2: Review Top Candidate in Detail

```
Click on "John Smith" (rank #1)
├─ Right panel opens with full analysis
│
├─ 🎯 Decision & Action (NEW - For this product)
│  ├─ [Shortlist] [Interview] [Hire] [Reject]
│  ├─ Shows current status
│  └─ Updates in real-time
│
├─ 📊 Recommendation
│  └─ "Strong shortlist candidate. All required skills with 
│      proven project experience. Ready for technical interview."
│
├─ [CHECK] Top Strengths
│  ├─ "Mentions Node.js"
│  ├─ "Mentions TypeScript"
│  ├─ "Mentions MongoDB"
│  ├─ "Mentions REST APIs"
│  └─ "Mentions Redis"
│
├─ [WARNING] Identified Gaps
│  ├─ "No explicit mention of system design"
│  └─ "No Kubernetes experience mentioned"
│
├─ [SEARCH] AI Authenticity Signals
│  ├─ "Specific metrics and numbers (genuine)"
│  ├─ "Named companies and projects (verifiable)"
│  ├─ "Natural language variation (not ChatGPT)"
│  └─ Overall: 8% likely AI → GENUINE CANDIDATE ✓
│
├─ 🎨 Score Breakdown (6-Factor Model)
│  ├─ Skills: 90/100 (35% weight)
│  ├─ Experience: 88/100 (25% weight)
│  ├─ Projects: 85/100 (20% weight)
│  ├─ Education: 95/100 (10% weight)
│  ├─ Certifications: 50/100 (5% weight)
│  └─ Availability: 100/100 (5% weight)
│  
│  Final Score: (90*0.35 + 88*0.25 + 85*0.20 + 95*0.10 + 50*0.05 + 100*0.05) = 86.9 → 87% displayed
```

### Step 3: Make Decision

```
Option 1: Shortlist
├─ Click [Shortlist]
├─ Status saved
├─ Updated on dashboard
└─ Recruiter notes: "Move to technical interview"

Option 2: Interview
├─ Click [Interview]  
├─ Status changes to "In Interview"
├─ Can schedule with HR system (if integrated)
└─ Track interview date/status

Option 3: Hire
├─ Click [Hire]
├─ Status changes to "Hired"
├─ Marks position as filled
├─ Logs decision for future reference
└─ Triggers offer process (if integrated)

Option 4: Reject
├─ Click [Reject]
├─ Auto-saves decision
├─ Can add reason: "Seeking more experience"
├─ Candidate removed from shortlist
└─ Keeps full record for future roles
```

---

## Afternoon: Dashboard Metrics

### At 3 PM, Recruiter Checks Progress

```
📊 Dashboard Shows (Real-Time):

Active Positions: 5
├─ Senior Backend (1 day old) - Top score: 92%
├─ Frontend Lead (3 days old) - 18 candidates, top: 88%
├─ DevOps Engineer (1 day old) - 5 candidates, top: 79%
├─ Product Manager (5 days old) - 42 candidates, top: 85%
└─ QA Engineer (2 days old) - 8 candidates, top: 74%

Hiring Pipeline:
├─ Total screened: 342
├─ Shortlisted: 28 (8.2%)
├─ In interviews: 12
├─ Offers pending: 3
├─ Hired: 5 (1.5% conversion)

Top Performers:
1. John Smith (Senior Backend) - 92%
2. Alice Johnson (Senior Backend) - 87%
3. Robert Chen (Frontend Lead) - 88%

[WARNING] Alerts:
├─ 3 AI-generated resumes detected (flagged)
└─ 2 candidates passed technical screen (move to final round?)

Refresh: Last updated 2 minutes ago
```

---

## Late Afternoon: Export Report

### For HR Records

```
Select a job: "Senior Backend Engineer"
└─ Click "Export Report"
   ├─ Generates PDF with:
   │  ├─ Job description
   │  ├─ AI scoring criteria (weights)
   │  ├─ Top 20 candidates with scores
   │  ├─ Decisions made (shortlist, hire, reject counts)
   │  ├─ AI authenticity flags
   │  └─ Hiring timeline
   │
   └─ Download: "Senior_Backend_Engineer_Report_2026-04-11.pdf"
```

---

## End of Day: Next Steps

### Before leaving, recruiter updates statuses

```
Task Checklist:
[CHECK] Created 1 new job (Senior Backend)
[CHECK] Reviewed 47 uploaded candidates
[CHECK] Made decisions: 5 shortlisted, 1 rejected for AI resume
[CHECK] Checked dashboard (on track)
[CHECK] Exported hiring report for HR
[CHECK] Scheduled interviews for top 5

Tomorrow Plan:
└─ Technical interviews with 5 shortlisted candidates
   ├─ John Smith (92%) - Thursday 2 PM
   ├─ Alice Johnson (87%) - Thursday 3 PM
   ├─ [Interview feedback form to fill in later]
   └─ Update decisions based on technical round results
```

---

## Multiple Positions at Once

### Day in Life: Managing 5 Open Positions

```
Morning Dashboard View:
┌─ Position 1 (Backend) ─────────────────────────────┐
│ 92 candidates screened │ 12 shortlisted │ 1 hired   │
├─ Position 2 (Frontend) ────────────────────────────┤
│ 73 candidates screened │ 8 shortlisted  │ 0 hired   │
├─ Position 3 (DevOps) ──────────────────────────────┤
│ 45 candidates screened │ 5 shortlisted  │ 0 hired   │
├─ Position 4 (PM) ─────────────────────────────────┤
│ 156 candidates screened │ 3 shortlisted │ 2 hired  │
└─ Position 5 (QA) ─────────────────────────────────┘
│ 38 candidates screened │ 4 shortlisted  │ 1 hired   │

Recruiter switches between positions as needed:
- 9 AM: Upload 20 DevOps resumes
- 10 AM: Review top Frontend candidates (8 in shortlist)
- 11 AM: Make hiring decision on PM candidate
- 12 PM: Upload 50 Backend resumes
- 1 PM: PM role - all positions filled, close job
- 2 PM: Interview scheduling for Backend role
```

---

## Compliance & Record Keeping

### For Hiring Audit Trail

```
Q: "Why wasn't Sarah Chen hired for Senior Backend role?"

Answer (from system):
├─ Status: Screened
├─ Score: 62% (below 70% shortlist threshold)
├─ Reason from AI: "Missing Node.js (critical skill). 
│  Only 2 years experience (below 3-5 range). 
│  Not available for 1 month."
├─ Decision: Rejected
├─ Made by: recruiter@umurava.com
├─ Timestamp: 2026-04-11 12:45 PM
├─ Notes: "Keep on file for future roles"
└─ Proof: [CHECK] Fair, data-driven decision with audit trail
```

---

## Training New Recruiter

### Onboarding a New Team Member

```
Day 1:
1. Show dashboard - "This is the hiring pipeline"
2. Show job creation - "Create a test job"
3. Show resume upload - "Upload test resumes"
4. Show candidate screening - "AI does the ranking"
5. Show decisions - "You decide shortlist/hire/reject"
6. Show analytics - "These are your metrics"

By End of Day 1:
- New recruiter posts their first job
- Uploads 10 sample resumes
- Reviews top candidates
- Makes first decision
- Understands dashboard

Expected Productivity: Full speed by Day 3
```

---

## Real-World Scenario: Urgent Hire

### Scenario: Need to fill position by Friday

```
Monday 8 AM:
├─ Create job: "Emergency Frontend Developer"
├─ Urgency level: High
└─ Target: 5 candidates to interview by Wednesday

Monday 9 AM:
├─ Upload 100 resumes from database
├─ AI screens all in ~2 minutes
├─ Top 15 scored 75%+

Monday 10 AM:
├─ Review top 10 (scores 85%+)
├─ Shortlist 8 candidates immediately
└─ Schedule phone screens for today

Monday 2-5 PM:
├─ Phone screens with top 8
├─ Rate candidates
└─ Invite 4 to technical interview

Tuesday 10 AM-12 PM:
├─ Technical interviews with 4 candidates
├─ 2 candidates pass

Tuesday 1 PM:
├─ Extend offers to 2 candidates
├─ Wait for responses

Wednesday AM:
├─ Candidate #1 accepts offer
├─ 🎉 Position filled in 2 days (vs 2 weeks typical)
└─ Dashboard shows: "Hired" + "Time to Fill: 2 days"
```

---

## Key Metrics Umurava Tracks

### Daily Metrics
```
📊 Positions open: 5
📊 Resumes screened: 347
📊 Shortlist rate: 8.1%
📊 Candidates in interviews: 12
📊 Offers pending: 3
📊 Hire rate: 1.8%
```

### Weekly Metrics
```
📊 Positions filled: 2
📊 Time to fill avg: 5.2 days (was 14 days before AI)
📊 Cost per hire: $3,200 (productivity gain: $45K saved)
📊 Interview-to-hire: 67% (2 offers, 1.3 accepted)
```

### Monthly Metrics
```
📊 Total hired: 8
📊 AI screening accuracy: 89% (hired candidates matched AI top 20)
📊 Recruiter time saved: 120 hours (8 positions × 15 hrs/pos)
📊 Revenue impact: 8 new people productive × $10K/month = $80K monthly value
```

---

## Conclusion: Recruiter Workflow

**TalentIQ AI Replaces This:**
```
❌ 4 hours manually reading 100 resumes
❌ Subjective scoring (gut feel)
❌ No consistency between candidates
❌ Forgotten context ("why did I reject this person?")
❌ High bias risk
❌ Lost candidates (no historical record)
❌ Slow hiring (weeks to find top 5)
```

**With This:**
```
[CHECK] 30 seconds AI screening of 100 resumes
[CHECK] Consistent 6-factor scoring
[CHECK] Same criteria for all candidates
[CHECK] Full audit trail (automatic)
[CHECK] Bias-free evaluation
[CHECK] Permanent candidate database
[CHECK] Fast hiring (days to find top 5)
```

**Result**: Umurava recruiter goes from 30+ hours/position to 3-4 hours/position.
**Impact**: 8x faster hiring, better candidates, lower cost.

[LAUNCH] **TalentIQ AI makes recruiting smart.**

