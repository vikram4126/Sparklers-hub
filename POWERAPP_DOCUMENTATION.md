# Sparklers Hub — Power Apps Implementation Documentation

> Purpose: Yeh document Sparklers Hub web app ka poora blueprint hai jise Power Apps mein rebuild karna hai.
> Har section mein screens, data tables, logic, aur Power Apps formulas step-by-step likhi hain.

---

## Table of Contents

1. Project Overview
2. Data Model — SharePoint Lists
3. Roles & User Mapping
4. App Structure — Screens List
5. Screen 1 — My Dashboard (User/PM/Admin)
6. Screen 2 — Self Nominate
7. Screen 3 — Nominate Team Member (PM only)
8. Screen 4 — Winners Board (Leaderboard)
9. Screen 5 — Team Approvals (PM only)
10. Screen 6 — PM Approve Modal
11. Screen 7 — Final Approvals (Admin only)
12. Screen 8 — Admin Approve Modal
13. Screen 9 — Design Generator (Admin only)
14. Navigation Logic
15. Badge & Leaderboard Calculations
16. Category/Reason Priority Chain
17. Auto-Expiry Logic
18. Department Mapping
19. Power Apps Formulas Reference
20. SharePoint CRUD & Power Apps Integration Guide
21. Build Checklist
22. Step-by-Step Guide: Process Efficiency & Hours Saved Integration in PowerApps

---

## 1. Project Overview

App Name: Sparklers Hub
Purpose: Internal employee recognition platform — employees weekly awards receive karte hain.

### Workflow:
  User (Self-Nominate) --> PM Review --> Admin Final Approval --> Winners Board
  PM (Nominate Team)  ----------------------------------------> Admin Final Approval --> Winners Board

### Key Rules:
- Agar PM time se approve nahi karta, nomination next week ke liye valid rahegi (expire nahi hogi)
- Har nomination status se track hoti hai: Pending -> PMApproved -> Approved ya Rejected
- PM aur Admin dono optional apna category aur reason add kar sakte hain
- Priority Chain: Admin ka category/reason > PM ka > User ka original

---

## 2. Data Model — SharePoint Lists (Step-by-Step Creation Guide)

Aapko SharePoint Site par kul **4 main Lists (Tables)** banani hain. Har list kaise banegi aur usme kya columns create karne hain, iska poora detail niche diya gaya hai:

---

### List 1: `Nominations` (Weekly Awards & Recognition)

1. SharePoint Site par jayein -> Click **+ New** -> Select **List** -> Select **Blank list** -> Name: `Nominations`.
2. **Columns Creation Steps**:
   - `Title` (Default Column): Rename label to **NomineeName** (Single line of text).
   - **Category** (Choice Column): Add options `Innovation`, `Process & Efficiency`, `Team Player`, `Extra Mile`, `Customer Success`.
   - **Reason** (Multiple lines of text / Plain text).
   - **Status** (Choice Column): Add options `Pending`, `PMApproved`, `Approved`, `Rejected`. Default value: `Pending`.
   - **SubmittedBy** (Single line of text / Person): Submitter ka Name.
   - **SubmittedDate** (Date and Time).
   - **PMCategory** (Choice Column - Optional): Same choices as Category.
   - **PMReason** (Multiple lines of text - Optional).
   - **AdminCategory** (Choice Column - Optional): Same choices as Category.
   - **AdminReason** (Multiple lines of text - Optional).
   - **RejectReason** (Multiple lines of text - Optional).

#### Example Sample Data Table for `Nominations`:

| NomineeName | Category | Reason | Status | SubmittedBy | SubmittedDate | PMCategory | PMReason | AdminCategory | AdminReason | RejectReason |
|---|---|---|---|---|---|---|---|---|---|---|
| Parteek | Innovation | Built automation script | PMApproved | Parteek | 2026-08-15 | — | Great initiative | — | — | — |
| Vikram | Extra Mile | Worked weekend for client release | Approved | Himanshu | 2026-08-14 | — | — | Customer Success | Outstanding commitment | — |
| Sivani | Team Player | Mentored new joiner | Pending | Sivani | 2026-08-18 | — | — | — | — | — |

---

### List 2: `Users` (User Roles & Team Hierarchy)

1. Click **+ New** -> Select **List** -> Select **Blank list** -> Name: `Users`.
2. **Columns Creation Steps**:
   - `Title` (Default Text column): Use for **DisplayName** (e.g. "Parteek").
   - **Email** (Single line of text / Person): User ka Office 365 Email ID (`parteek@kpmg.com`). *Auto-login ke liye mandatory!*
   - **Role** (Choice Column): Add options `User`, `TL`, `AM`, `Manager`, `AD`, `Director`, `Admin`.
   - **PMName** (Single line of text): User ke reporting Manager/TL ka Name (`Abhineet`).
   - **PMEmail** (Single line of text): Reporting Manager ka Email ID (`abhineet@kpmg.com`).
   - **Department** (Choice Column): `CD`, `Digital`, `Design`, `Sales`, `Motion`, `Admin`.

#### Example Data Table for `Users` List (Is tarah Data Enter karein):

| Title (DisplayName) | Email | Role | PMName | PMEmail | Department |
|---|---|---|---|---|---|
| Parteek | parteek@kpmg.com | User | Abhineet | abhineet@kpmg.com | CD |
| Shreya | shreya@kpmg.com | User | Abhineet | abhineet@kpmg.com | CD |
| Ganash lal | ganash@kpmg.com | User | Abhineet | abhineet@kpmg.com | CD |
| Vikram | vikram@kpmg.com | User | Himanshu | himanshu@kpmg.com | Digital |
| Shantanu | shantanu@kpmg.com | User | Himanshu | himanshu@kpmg.com | Digital |
| Sukhvindar | sukhvindar@kpmg.com | User | Himanshu | himanshu@kpmg.com | Digital |
| Sivani | sivani@kpmg.com | User | Ameen | ameen@kpmg.com | Design |
| Abhineet | abhineet@kpmg.com | TL | Monam | monam@kpmg.com | CD |
| Himanshu | himanshu@kpmg.com | TL | Ses | ses@kpmg.com | Digital |
| Ameen | ameen@kpmg.com | TL | Ses | ses@kpmg.com | Design |
| Monam | monam@kpmg.com | AM | Ashok | ashok@kpmg.com | Sales |
| Ses | ses@kpmg.com | AM | Sol | sol@kpmg.com | Digital |
| Ashok | ashok@kpmg.com | Manager | Kumaran | kumaran@kpmg.com | Design |
| Sol | sol@kpmg.com | Manager | Kumaran | kumaran@kpmg.com | Digital |
| Kumaran | kumaran@kpmg.com | AD | Krishan | krishan@kpmg.com | Admin |
| Krishan | krishan@kpmg.com | Director | — | — | Admin |
| Avinash | avinash@kpmg.com | Admin | — | — | Admin |
| Sola | sola@kpmg.com | Admin | — | — | Admin |

---

### List 3: `ProcessEfficiencies` (Hours Saved & Process Improvement Log)

1. Click **+ New** -> **List** -> **Blank list** -> Name: `ProcessEfficiencies`.
2. **Columns Creation Steps**:
   - `Title`: Process / Tool Name (e.g. "PowerAutomate Invoice Parsing").
   - **SubmittedBy**: Single line of text.
   - **Department**: Choice (`CD`, `Digital`, `Design`, `Sales`, `Motion`).
   - **HoursSaved**: Number Column (Decimal allowed).
   - **Description**: Multiple lines of text.
   - **Status**: Choice (`Pending`, `Approved`, `Rejected`).

#### Example Sample Data Table for `ProcessEfficiencies`:

| Title (Process Name) | SubmittedBy | Department | HoursSaved | Description | Status |
|---|---|---|---|---|---|
| Outlook Mail Parser Script | Parteek | CD | 15.5 | Automated daily report emails parsing | Approved |
| Photoshop Action Batching | Sivani | Design | 8.0 | Batch resized 500 images automatically | Approved |
| Sales Pipeline Macro | Rahul | Sales | 12.0 | Excel VBA macro for weekly pipeline | Pending |

---

### List 4: `ClientFeedbacks` (Outlook Client Appreciation Log & Impact AI)

1. Click **+ New** -> **List** -> **Blank list** -> Name: `ClientFeedbacks`.
2. **Columns Creation Steps**:
   - `Title`: Email Subject / Headline (e.g. "Client Kudos for Q3 Launch").
   - **SubmittedBy**: Single line of text.
   - **NomineeEmail**: Single line of text.
   - **Category**: Choice (`Client Experience`, `Process Improvement`, `Technical Excellence`, `Team Culture`, `General Appreciation`).
   - **Description**: Multiple lines of text (Pasted Outlook email text).
   - **AttachmentName**: Single line of text (`.msg` file name).
   - **ImpactTier**: Choice (`Standard Appreciation`, `High Value / NPS Booster`, `Strategic Game Changer`).
   - **ImpactScore**: Number (1 to 10).
   - **Status**: Choice (`Pending`, `Approved`, `Rejected`).
   - **IsShared**: Yes/No (Boolean).

#### Example Sample Data Table for `ClientFeedbacks`:

| Title | SubmittedBy | Category | ImpactTier | ImpactScore | Status | AttachmentName |
|---|---|---|---|---|---|---|
| Q3 Campaign Success | Vikram | Client Experience | High Value / NPS Booster | 7 | Approved | Client_Kudos.msg |
| Escalation Resolved | Parteek | Technical Excellence | Strategic Game Changer | 10 | Approved | Appreciated.msg |

---

---

## 3. Roles & User Mapping

Aap agar **SharePoint, Power Apps, aur Power Automate** mein naye hain, toh niche diye gaye step-by-step instructions follow karein. Yeh section batata hai ki SharePoint mein Users ki list kaise banegi aur Power Apps mein login hone wale user ko uski Role ke hisab se screen buttons kaise dikhenge.

---

### Step 1: Users List Reference

*(Note: `Users` list ka full creation guide, columns, aur sample data table **Section 2 -> List 2** mein upar define kar diya gaya hai. Aapko double mehnat karne ki zaroorat nahi hai — bas wahan di gayi `Users` list ko SharePoint par create karein.)*

---

### Step 2: Role-Based Access Matrix (PowerApps Button `Visible` & `OnSelect` Formulas Guide)

> [!NOTE]
> ❌ **Yeh Table SharePoint Mein Nahi Banegi!** 
> Yeh table batati hai ki **Power Apps Studio (Canvas App)** mein Sidebar ke Buttons ki **`Visible` property** (Hide/Show ke liye) aur **`OnSelect` property** (Screen navigate karne ke liye) mein kya formulas copy-paste karne hain.

#### 📍 Power Apps Studio Mein Kaise Apply Karein (Step-by-Step):
1. Power Apps Studio ([make.powerapps.com](https://make.powerapps.com)) khol kar apna Canvas App open karein.
2. Left Tree View se Sidebar Menu ke Button ko select karein (e.g. `btnNavDashboard`).
3. Top-Left Property Dropdown se:
   - Choose **`Visible`** $\rightarrow$ Paste Formula from **Column 3 (`Visible` Property Formula)**.
   - Choose **`OnSelect`** $\rightarrow$ Paste Formula from **Column 4 (`OnSelect` Property Formula)**.

#### 🛠️ Complete Button Setup Table for PowerApps Studio:

| Button ID / Name in PowerApps | Allowed Roles (Info) | `Visible` Property Formula *(Button Kab Dikhega?)* | `OnSelect` Property Formula *(Click Pe Kya Hoga?)* |
|---|---|---|---|
| **`btnNavDashboard`** | User, Admin | `varUserRole in ["User", "Admin"]` | `Navigate(scrDashboard)` |
| **`btnNavLeadership`** | TL, AM, Manager, AD, Director | `varUserRole in ["TL", "AM", "Manager", "AD", "Director"]` | `Navigate(scrLeadershipBoard)` |
| **`btnNavSelfNominate`** | User, TL, AM, Admin | `varUserRole in ["User", "TL", "AM", "Admin"]` | `Navigate(scrSelfNominate)` |
| **`btnNavNominateTeam`** | TL, AM, Manager | `varUserRole in ["TL", "AM", "Manager"]` | `Navigate(scrNominateTeam)` |
| **`btnNavWinners`** | All Roles | `true` | `Navigate(scrWinnersBoard)` |
| **`btnNavTeamApprovals`** | TL, AM, Manager | `varUserRole in ["TL", "AM", "Manager"]` | `Navigate(scrTeamApprovals)` |
| **`btnNavAdminApprovals`**| Admin | `varUserRole = "Admin"` | `Navigate(scrAdminApprovals)` |
| **`btnNavDesignGen`** | Admin | `varUserRole = "Admin"` | `Navigate(scrDesignGenerator)` |

#### 📌 [BLUEPRINT ONLY — INFORMATIONAL REFERENCE] Role-to-Screen Visual Matrix

> [!IMPORTANT]
> **⚠️ INFORMATION ONLY (READ THIS FIRST):**
> 1. ❌ **NOT a SharePoint List**: Is table ko SharePoint par bilkul nahi banana hai.
> 2. ❌ **NOT PowerFx Code**: Is table ko PowerApps mein kisi formula ya property mein copy-paste nahi karna hai.
> 3. ✅ **JUST A BLUEPRINT / VISUAL CHEATSHEET**: Yeh table sirf app ka visual blueprint hai taaki aapko ek nazar mein pata rahe ki kaunsi screen kis role ke liye allowed (✅ YES) ya blocked (❌ NO) hai.

| Role | My Dashboard (`scrDashboard`) | Leadership Board (`scrLeadershipBoard`) | Self Nominate (`scrSelfNominate`) | Nominate Team (`scrNominateTeam`) | Winners Board (`scrWinnersBoard`) | Team Approvals (`scrTeamApprovals`) | Admin Approvals (`scrAdminApprovals`) | Design Gen (`scrDesignGenerator`) |
|---|---|---|---|---|---|---|---|---|
| **User** | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **TL / AM** | ❌ NO | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ❌ NO | ❌ NO |
| **Manager** | ❌ NO | ✅ YES | ❌ NO | ✅ YES | ✅ YES | ✅ YES | ❌ NO | ❌ NO |
| **AD / Director**| ❌ NO | ✅ YES | ❌ NO | ❌ NO | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **Admin** | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ✅ YES | ✅ YES |

*Note: Manager, AD, aur Director kabhi self-nominate nahi karenge. AD aur Director kabhi team member nominate nahi karenge.*

---

### Step 3: Power Apps Mein Auto-Login & User Details Load Kaise Karein

Jab user Power Apps kholega, Power Apps Office 365 account se logged-in user ki Email ID auto-detect kar leta hai: `User().Email`.

#### A. App Ke `App.OnStart` Property Mein Yeh Formula Likhein:
1. Power Apps Studio mein Left Tree View mein **`App`** par click karein.
2. Property Dropdown se **`OnStart`** select karein.
3. Formula Bar mein yeh paste karein:

```powerfx
// 1. Current logged-in user ki email se SharePoint 'Users' list lookup karein
Set(
    varCurrentUserRecord,
    LookUp(Users, Email = User().Email)
);

// 2. Variables store karein
Set(varUserRole, varCurrentUserRecord.Role.Value);
Set(varUserName, varCurrentUserRecord.Title);
Set(varUserDepartment, varCurrentUserRecord.Department.Value);
Set(varUserPMName, varCurrentUserRecord.PMName);
```

---

### Step 4: Navigation Menu / Buttons Par Permissions (Visible Property Setup)

Power Apps Canvas mein Sidebar ya Top Navigation ke Buttons ki **`Visible`** property par ye exact formulas likhein. Jiske paas permission nahi hogi, usko button screen par dikhega hi nahi!

1. **"My Dashboard" Button (`btnNavDashboard`)**:
   - `Visible` = `varUserRole in ["User", "Admin"]`
2. **"Leadership Board" Button (`btnNavLeadership`)**:
   - `Visible` = `varUserRole in ["TL", "AM", "Manager", "AD", "Director"]`
3. **"Self Nominate" Button (`btnNavSelfNominate`)**:
   - `Visible` = `varUserRole in ["User", "TL", "AM", "Admin"]` *(Manager/AD/Director ke liye false)*
4. **"Nominate Team Member" Button (`btnNavNominateTeam`)**:
   - `Visible` = `varUserRole in ["TL", "AM", "Manager"]`
5. **"Winners Board" Button (`btnNavWinners`)**:
   - `Visible` = `true` *(Sabhi roles dekh sakte hain)*
6. **"Team Approvals (PM)" Button (`btnNavTeamApprovals`)**:
   - `Visible` = `varUserRole in ["TL", "AM", "Manager"]`
7. **"Final Approvals (Admin)" Button (`btnNavAdminApprovals`)**:
   - `Visible` = `varUserRole = "Admin"`
8. **"Design Generator" Button (`btnNavDesignGen`)**:
   - `Visible` = `varUserRole = "Admin"`

---

### Step 5: Multi-Role Handling (Jaise Avinash = User + Admin)

Agar koi banda (jaise Avinash) normal **User** bhi hai (apne awards submit karne ke liye) aur **Admin** bhi hai (approvals final karne ke liye):

- **kaise karna hai**: Above Step 4 wale formulas mein `in ["User", "Admin"]` use kiya gaya hai.
- **Result**: Avinash jab login karega, uski Role `"Admin"` milegi, lekin formulas ke karan usko **My Dashboard**, **Self Nominate**, **Winners Board**, **Final Approvals (Admin)**, aur **Design Generator** — saare buttons ek saath dikhenge!

---

### Step 6: Leadership Approval Routing Logic (Manager Nominations)

Agar koi **Manager** (jaise Sol ya Ashok) kisi team member ko nominate karta hai, toh rule ye hai ki routing **AD/Director ko bypass karke seedha Admin ke paas jayegi**.

**Nominate Form Submit Button (`btnSubmitNomination.OnSelect`) ka Formula**:
```powerfx
Patch(
    Nominations,
    Defaults(Nominations),
    {
        NomineeName: drpNominee.Selected.Title,
        Category: drpCategory.Selected.Value,
        Reason: txtReason.Text,
        SubmittedBy: varUserName,
        SubmittedDate: Now(),
        // Manager nomination goes directly to Admin (PMApproved status)
        Status: If(varUserRole = "Manager", "PMApproved", "Pending")
    }
);
Notify("Nomination submitted successfully!", NotificationType.Success);
Navigate(scrDashboard);
```

---

## 4. App Structure — Screens List

Power Apps mein yeh screens banani hain:

| #  | Screen Name         | Visible To               |
|----|---------------------|--------------------------|
| 1  | scrDashboard        | User, PM                 |
| 2  | scrSelfNominate     | User, PM                 |
| 3  | scrNominateTeam     | PM only                  |
| 4  | scrWinnersBoard     | All roles                |
| 5  | scrTeamApprovals    | PM only                  |
| 6  | scrPMApproveModal   | PM only (overlay)        |
| 7  | scrFinalApprovals   | Admin only               |
| 8  | scrDesignGenerator  | Admin only               |
| 9  | scrFeedback         | User, PM (Hidden for AD/Director & Admin) |

---

## 5. Screen 1 — My Dashboard (KPMG Command Center)

File reference: `UserDashboard.jsx`

### 🎨 Layout Architecture (KPMG Modern Enterprise Grid)
- **Top Bar**: User Avatar, Welcome Title ("Welcome back, [Name]!"), and FY Selector Dropdown (`drpFY`).
- **Top Row (3 Crisp Metric Banners - No Left Borders)**:
  - **Metric Banner 1**: Total Won Count (`varMyTotal`) + Navy Trophy Icon Circle.
  - **Metric Banner 2**: Pending Review Count + Blue Clock Icon Circle.
  - **Metric Banner 3**: Total Hours Saved (ROI) + Teal Zap Icon Circle.
- **Bottom Row (100% Full-Width History Table)**:
  - Header: Title, FY Filter, Category Filter, Status Filter.
  - Body: Scrollable Gallery (`galMyHistoryTable`) displaying Date, Category, Achievement, Status Badge (`Approved`, `Pending`, `PM Approved`).

---

### 🛠️ PowerApps Controls & Step-by-Step Setup:

#### Step 1: Create Vertical Container (`conMainDashboard`)
- `Insert` $\rightarrow$ `Layout` $\rightarrow$ `Blank Vertical Container`
- `Width` = `Parent.Width`, `Height` = `Parent.Height`, `EnableScrollbar` = `false` *(Locked Main Page!)*

#### Step 2: Add 3 Top Metric Banners (`conMetricBanners`)
- `Insert` $\rightarrow$ `Blank Horizontal Container` inside `conMainDashboard`.
- Drop 3 Cards with KPMG colors:
  1. **Total Won Card**:
     - Number Label `lblTotalWon.Text` = `CountRows(Filter(Nominations, NomineeName = varUserName && Status = "Approved"))`
  2. **Pending Review Card**:
     - Number Label `lblPending.Text` = `CountRows(Filter(Nominations, NomineeName = varUserName && Status = "Pending"))`
  3. **Hours Saved (ROI) Card**:
     - Number Label `lblHoursSaved.Text` = `Sum(Filter(Nominations, NomineeName = varUserName && Status = "Approved"), Value(HoursSaved)) & "h"`

#### Step 3: Add Full-Width History Table (`conHistoryTableCard`)
- `Insert` $\rightarrow$ `Container` inside `conMainDashboard` (`Height` = `Parent.Height - 160`, `Fill` = `White`, `BorderColor` = `#E2E8F0`).
- **Inner Scroll Gallery (`galMyHistoryTable`)**:
  - `Insert` $\rightarrow$ `Flexible Height Gallery` inside `conHistoryTableCard`.
  - Set Gallery `ShowScrollbar` = `true` *(Only table scrolls, page stays locked!)*
  - `Items` Property =
    ```powerfx
    Sort(
        Filter(
            Nominations,
            NomineeName = varUserName &&
            (drpCategoryFilter.Selected.Value = "All" || Category = drpCategoryFilter.Selected.Value) &&
            (drpStatusFilter.Selected.Value = "All" || Status = drpStatusFilter.Selected.Value)
        ),
        SubmittedDate,
        Descending
    )
    ```

---

### D. Peer Group Leaderboard (Role-Based Matrix)

- **Peer Group Logic**:
  ```powerapps
  Set(varUserRole, LookUp(Users, Title = varUserName).Role);
  
  // Set peer group for dynamic filtering
  If(
    varUserRole = "User",
    ClearCollect(colPeers, {PeerName: "Parteek"}, {PeerName: "Shreya"}, {PeerName: "Ganash lal"}, {PeerName: "Vikram"}),
    varUserRole = "TL",
    ClearCollect(colPeers, {PeerName: "Abhineet"}, {PeerName: "Himanshu"}, {PeerName: "Ameen"}),
    varUserRole = "AM",
    ClearCollect(colPeers, {PeerName: "Ses"}, {PeerName: "Monam"}),
    ClearCollect(colPeers, {PeerName: "Sol"}, {PeerName: "Ashok"})
  );
  ```

---

### F. My Past Wins Table
- **Items Formula**:
  ```powerapps
  SortByColumns(
    Filter(Nominations, NomineeName = varUserName && Status = "Approved"),
    "SubmittedDate", 
    Descending
  )
  ```
- **Columns**: Date | EffectiveCategory | EffectiveReason | Hours Saved Badge (if Process & Efficiency)

---

---

## 6. Screen 2 — Self Nominate

File reference: SelfNominate.jsx

### Components:
- Back button -> Back() or Navigate(scrDashboard)
- Nominee field: Read-only, prefilled with User().FullName
- Category dropdown: Innovation | Team Player | Extra Mile | Customer Success (mandatory)
- Reason textarea (mandatory)
- Submit button (disabled until both fields filled)

### Submit Formula:
  Patch(
    Nominations,
    Defaults(Nominations),
    {
      NomineeName:   User().FullName,
      Category:      drpCategory.Selected.Value,
      Reason:        txtReason.Text,
      Status:        "Pending",
      SubmittedBy:   "User",
      SubmittedDate: Now()
    }
  );
  Navigate(scrSelfNomSuccess)

### Success Screen:
- Emoji + "Nomination Submitted!"
- Shows category selected
- Button: Back to My Dashboard

---

## 7. Screen 3 — Nominate Team Member (PM & Manager Only)

File reference: `NominationForm.jsx`

### 🎨 Layout Architecture (KPMG Clean 60/40 Split Design)
- **Top Row (3 KPI Cards)**: Total Team Submissions | Pending Approvals | Team Hours Saved.
- **Bottom Row**:
  - **Left Form Card (60%)**: Nominee Dropdown (Only PM's Direct Reportees) | Category Dropdown | Reason Textarea | Hours Saved (if Process & Efficiency).
  - **Right Table Card (40%)**: Team Nomination History & Status Tracker.

### 🛠️ PowerApps Controls & Step-by-Step Setup:

1. **Nominee Dropdown (`drpNominee`)**:
   - `Insert` $\rightarrow$ `Dropdown`
   - `Items` Property = `Filter(Users, PMName = varUserName)` *(Displays only direct reportees!)*
2. **Category Dropdown (`drpCategory`)**:
   - `Items` Property = `["Innovation", "Process & Efficiency", "Team Player", "Extra Mile", "Customer Success"]`
3. **Submit Button (`btnSubmitNomination`)**:
   - `OnSelect` Property =
     ```powerfx
     Patch(
         Nominations,
         Defaults(Nominations),
         {
             NomineeName: drpNominee.Selected.Title,
             Category: drpCategory.Selected.Value,
             Reason: txtReason.Text,
             SubmittedBy: varUserName,
             SubmittedDate: Now(),
             // PM/Manager nomination bypasses PM queue -> Status set to PMApproved (Direct to Admin)
             Status: "PMApproved"
         }
     );
     Notify("Team nomination submitted and sent directly to Admin for final approval!", NotificationType.Success);
     Reset(txtReason);
     ```

---

## 8. Screen 4 — Winners Board (Leaderboard & Past Winners)

File reference: `LeadershipDashboard.jsx`

### 🎨 Layout Architecture:
- **Top Filter Strip**: Month Selector Dropdown (`drpMonthFilter`).
- **Main Section**: Full-Width Dynamic Winner Cards Gallery (`galWinners`).

### 🛠️ PowerApps Setup:

1. **Month Filter Dropdown (`drpMonthFilter`)**:
   - `Items` Property = 
     ```powerfx
     Distinct(
         AddColumns(
             Filter(Nominations, Status = "Approved"),
             "MonthYear", Text(SubmittedDate, "mmmm yyyy")
         ),
         MonthYear
     )
     ```
2. **Winners Gallery (`galWinners`)**:
   - `Insert` $\rightarrow$ `Flexible Height Gallery`
   - `Items` Property =
     ```powerfx
     Filter(
         Nominations,
         Status = "Approved" &&
         (IsBlank(drpMonthFilter.Selected.Value) || Text(SubmittedDate, "mmmm yyyy") = drpMonthFilter.Selected.Value)
     )
     ```
   - **Winner Card Badge Formula**:
     - `lblBadge.Text` = 
       ```powerfx
       If(ThisItem.Category = "Process & Efficiency", "⚡ Efficiency Champion", "🏆 Sparkler Winner")
       ```

---

## 9. Screen 5 & 6 — Team Approvals & Detail Modal (PM / TL Only)

File reference: `PMApprovals.jsx`

### 🎨 Layout Architecture:
- **Top Row**: Pending Review Counter | Approved Count | Rejected Count.
- **Main Section**: Full-Width Pending Approvals Table (`galPendingApprovals`).
- **Modal Overlay (`conPMApproveModal`)**: Appears when PM clicks **`👁️ View Details & Approve`**.

### 🛠️ PowerApps Controls & Formulas:

1. **Pending Approvals Table (`galPendingApprovals`)**:
   - `Items` Property = 
     ```powerfx
     Filter(
         Nominations,
         Status = "Pending" &&
         LookUp(Users, Title = NomineeName).PMName = varUserName
     )
     ```
2. **View Details & Approve Button (`btnViewDetails`)**:
   - `OnSelect` Property = 
     ```powerfx
     Set(varSelectedNomination, ThisItem);
     Set(varShowPMModal, true); // Opens Modal Overlay
     ```
3. **Modal Overlay Container (`conPMApproveModal`)**:
   - `Visible` Property = `varShowPMModal`
   - **Approve Button (`btnApproveNomination`)**:
     - `OnSelect` Property =
       ```powerfx
       Patch(
           Nominations,
           varSelectedNomination,
           {
               Status: "PMApproved",
               PMCategory: If(IsBlank(drpPMCategory.Selected.Value), varSelectedNomination.Category, drpPMCategory.Selected.Value),
               PMReason: txtPMReason.Text
           }
       );
       Notify("Nomination approved and forwarded to Admin!", NotificationType.Success);
       Set(varShowPMModal, false);
       ```
   - **Reject Button (`btnRejectNomination`)**:
     - `OnSelect` Property =
       ```powerfx
       If(
           IsBlank(Trim(txtRejectReason.Text)),
           Notify("Rejection reason is MANDATORY!", NotificationType.Error),
           Patch(
               Nominations,
               varSelectedNomination,
               {
                   Status: "Rejected",
                   RejectReason: txtRejectReason.Text
               }
           );
           Notify("Nomination rejected.", NotificationType.Information);
           Set(varShowPMModal, false);
       )
       ```

---

## 10. Screen 7 & 8 — Admin Final Approvals & Verification Modal (Admin Only)

File reference: `AdminVerification.jsx`

### 🎨 Layout Architecture:
- **Header Action Bar**: Search Bar | **`Feedback AI Switch (ON/OFF)`** Master Control Button.
- **Tab 1: Final Approvals Queue**: Nominations approved by PM (`Status = "PMApproved"`).
- **Tab 2: Pending with PMs Queue**: Nominations pending with PMs (`Status = "Pending"`).
- **Tab 3: Complete Audit Log Table**: All past approved/rejected nominations.

### 🛠️ PowerApps Formulas:

1. **Final Approval Queue Gallery (`galAdminQueue`)**:
   - `Items` Property = `Filter(Nominations, Status = "PMApproved")`
2. **Final Approve Button (`btnAdminApprove`)**:
   - `OnSelect` Property =
     ```powerfx
     Patch(
         Nominations,
         varSelectedNomination,
         {
             Status: "Approved",
             AdminCategory: If(IsBlank(drpAdminCategory.Selected.Value), varSelectedNomination.Category, drpAdminCategory.Selected.Value),
             AdminReason: txtAdminReason.Text
         }
     );
     Notify("Nomination given FINAL APPROVAL!", NotificationType.Success);
     Set(varShowAdminModal, false);
     ```

---

## 11. Screen 9 — Design Generator & Poster Export (Admin Only)

File reference: `DesignGeneratorPreview.jsx`

### 🎨 Layout Architecture:
- **Top Bar**: Week Selector | **"Generate Teams Broadcast Message"** Button | **"Export Poster PDF"** Button.
- **Card Preview Area**: 4 Category Award Card Templates with KPMG Logo & Winner Name.

### 🛠️ PowerApps Setup & Power Automate Flow:

1. **Teams Message Generator Formula (`btnCopyTeamsMsg.OnSelect`)**:
   ```powerfx
   Set(
       varTeamsAnnouncementText,
       "🎉 *Congratulations to our Sparklers of the Week!*" & Char(10) & Char(10) &
       Concat(
           Filter(Nominations, Status = "Approved" && WeekNum(SubmittedDate) = WeekNum(Today())),
           "⭐ " & NomineeName & " - " & If(!IsBlank(AdminCategory), AdminCategory, Category) & Char(10)
       ) & Char(10) &
       "Great work team! Keep shining! 🚀"
   );
   ```
2. **Poster Export via Power Automate (`btnExportPoster.OnSelect`)**:
   ```powerfx
   'GenerateAwardCertificateFlow'.Run(
       JSON(Filter(Nominations, Status = "Approved" && WeekNum(SubmittedDate) = WeekNum(Today())), JSONFormat.IndentFour)
   );
   Notify("Winner posters are being generated and sent to email!", NotificationType.Information);
   ```

---

## 14. Navigation Logic

### Sidebar Nav — Visible by Role:

  Home/Dashboard:          Always visible
  Nominate Team Member:    Visible = (varCurrentRole = "PM")
  Winners Board:           Always visible
  Team Approvals:          Visible = (varCurrentRole = "PM")
    Badge count = CountRows(Filter(Nominations, Status="Pending" && NomineeName in varMyReportees))
  Final Approvals:         Visible = (varCurrentRole = "Admin")
    Badge count = CountRows(Filter(Nominations, Status="PMApproved"))
  Design Generator:        Visible = (varCurrentRole = "Admin")

### Home Screen by Role:
  If(varCurrentRole = "Leadership",
    Navigate(scrWinnersBoard),
    Navigate(scrDashboard)
  )

---

## 15. Badge & Leaderboard Calculations

### Yearly Badge (User Dashboard):
  Set(varMyTotal, CountRows(Filter(Nominations, NomineeName = varCurrentUser && Status = "Approved")));
  Set(varBadge,
    If(varMyTotal >= 25, {name:"Platinum", stars:4, color:"#a0b2c6"},
    If(varMyTotal >= 20, {name:"Platinum", stars:3, color:"#a0b2c6"},
    If(varMyTotal >= 15, {name:"Platinum", stars:2, color:"#a0b2c6"},
    If(varMyTotal >= 10, {name:"Platinum", stars:1, color:"#a0b2c6"},
    If(varMyTotal >= 6,  {name:"Gold",    stars:0, color:"#ffd700"},
    If(varMyTotal >= 3,  {name:"Silver",  stars:0, color:"#b0bec5"},
                         {name:"Bronze",  stars:0, color:"#cd7f32"}
  ))))))

### All Members Leaderboard (Top 6):
  FirstN(
    Sort(
      AddColumns(
        GroupBy(
          Filter(Nominations, Status = "Approved", NomineeName in varAllReportees),
          "NomineeName", "Awards"
        ),
        "Total",      CountRows(Awards),
        "Department", LookUp(Users, DisplayName = NomineeName, Department)
      ),
      Total, Descending
    ),
    6
  )

---

## 16. Category/Reason Priority Chain

RULE: Admin ka override > PM ka override > User ka original

### EffectiveCategory:
  If(!IsBlank(AdminCategory), AdminCategory,
  If(!IsBlank(PMCategory),    PMCategory,
  Category))

### EffectiveReason:
  If(!IsBlank(AdminReason), AdminReason,
  If(!IsBlank(PMReason),    PMReason,
  Reason))

Use karo in:
  - Winners Board category/reason display
  - My Past Wins table
  - Design Generator cards
  - Admin approval "Effective Category" column

---

## 17. No Expiry Rule

### Rule:
  Nominations KABHI expire nahi hongi.
  Agar PM kisi week mein approve nahi karta, nomination Pending state mein rahegi
  aur automatically next week ke liye carry over ho jaayegi.
  Sirf PM ya Admin manually Reject kar sakte hain.

### Status List (sirf yeh 4):
  - Pending       -> User ne submit kiya, PM ke paas pending
  - PMApproved    -> PM ne approve kiya, Admin ke paas pending
  - Approved      -> Admin ne final approve kiya (Winners Board mein dikhega)
  - Rejected      -> PM ya Admin ne reject kiya

### Power Apps mein koi scheduled flow NAHI chahiye.

---

## 18. Department Mapping

| Person     | Department | PM       |
|------------|------------|----------|
| Abhineet   | CD         | Monam    |
| Parteek    | CD         | Abhineet |
| Shreya     | CD         | Abhineet |
| Ganash lal | CD         | Abhineet |
| Ses        | Digital    | Sol      |
| Vikram     | Digital    | Himanshu |
| Shantanu   | Digital    | Himanshu |
| Sukhvindar | Digital    | Himanshu |
| Himanshu   | Digital    | Ses      |
| Ameen      | Design     | Ses      |
| Sivani     | Design     | Ameen    |
| Monam      | Sales      | Ashok    |
| Sol        | Digital    | --       |
| Ashok      | Design     | --       |
| Kumaran    | Admin      | --       |
| Krishan    | Admin      | --       |

---

## 19. Power Apps Formulas Reference

### App.OnStart Variables:
  Set(varCurrentUser, User().FullName);
  Set(varCurrentRole, LookUp(Users, DisplayName = User().FullName, Role));
  Set(varMyReportees,
    If(varCurrentRole = "PM",
       Filter(Users, PMName = varCurrentUser).DisplayName,
       []
    )
  );
  Set(varMyDepartment, LookUp(Users, DisplayName = varCurrentUser, Department));

### Status Badge Color:
  Switch(ThisItem.Status,
    "Pending",    RGBA(245,158,11,1),
    "PMApproved", RGBA(99,102,241,1),
    "Approved",   RGBA(34,197,94,1),
    "Rejected",   RGBA(239,68,68,1)
  )

### Rank Emoji (Leaderboard):
  Switch(
    CountRows(Filter(leaderboardData, Total > ThisItem.Total)) + 1,
    1, "Gold Medal",
    2, "Silver Medal",
    3, "Bronze Medal",
    "Medal"
  )

### Week of Month:
  RoundUp(Day(varDate) / 7, 0)

### Friday of Given Week:
  DateAdd(varDate, (5 - Weekday(varDate, 2) + 7) Mod 7, Days)

### Bold Current User in Leaderboard:
  If(ThisItem.NomineeName = varCurrentUser, FontWeight.Bold, FontWeight.Normal)

### Disable Submit if fields empty:
  !IsBlank(drpCategory.Selected.Value) && !IsBlank(txtReason.Text)

---

## 20. Build Checklist for Power Apps

### Phase 1 — Data Setup
  [ ] SharePoint mein Nominations list banao with all columns
  [ ] Users list banao with Role, PMName, Department
  [ ] Test data seed karo

### Phase 2 — App Shell
  [ ] New Canvas App (Tablet layout)
  [ ] Sidebar nav component (reusable)
  [ ] Top header with user name + role display
  [ ] App.OnStart variables set karo

### Phase 3 — Core Screens
  [ ] Screen 1: My Dashboard (badge + leaderboards + past wins)
  [ ] Screen 2: Self Nominate form + Success screen
  [ ] Screen 3: PM Nominate Team form
  [ ] Screen 4: Winners Board with month filter + week grouping

### Phase 4 — Approval Workflows
  [ ] Screen 5: Team Approvals list (PM)
  [ ] Screen 6: PM Approve modal (3-section — original + PM override + actions)
  [ ] Screen 7: Final Approvals list (Admin) with 3 sub-tables
  [ ] Screen 8: Admin Approve modal (3-section — original + PM readonly + admin override)

### Phase 5 — Advanced Features
  [ ] Screen 9: Design Generator with Teams message + award cards
  [ ] Power Automate: Auto-expiry flow (Friday 5 PM IST)
  [ ] EffectiveCategory / EffectiveReason everywhere (see Section 16)
  [ ] Badge logic (yearly + monthly)

### Phase 6 — Polish
  [ ] Role-based nav (show/hide tabs per role)
  [ ] Pending badge counts on nav tabs
  [ ] Status badge colors
  [ ] Search/filter on approval screens
  [ ] Responsive layout

### Phase 7 — My Achievement Locker (External Awards)
  [ ] Verify conditional visible logic (Roles).
  [ ] Connect Power Automate HTTP URL to the App for email notifications.
  [ ] Test End-to-End: User -> PM -> Admin -> Leaderboard.
  [ ] Screen 10: Log an Award (User/PM view)
  [ ] Screen 11: External Awards tab in Team Dashboard (PM approval)
  [ ] Dashboard mein My Achievement Locker section add karo

---

Documentation created: July 2026
Based on: Sparklers Hub — React/Vite web prototype

---

---

# Feature: My Achievement Locker — External Awards

> **Purpose:** Employees kisi bhi doosre platform (KPMG Encore, Kloud, Teams, etc.) par mile awards yahan log kar sakein. Ek unified portfolio ban jaata hai jo year-end review mein kaam aata hai.

---

## A. SharePoint — New List: `ExternalAwards`

### Step 1: SharePoint Site pe jaao

1. Browser mein apni KPMG SharePoint site kholo (e.g. `https://kpmg.sharepoint.com/sites/SparklerHub`)
2. Left sidebar mein **"New"** → **"List"** click karo
3. **"Blank list"** select karo
4. Name: `ExternalAwards` → **Create** karo

---

### Step 2: Columns add karo

Yeh columns `ExternalAwards` list mein add karo:

| Column Name   | Type                  | Required | Values / Notes                                                                 |
|---------------|-----------------------|----------|--------------------------------------------------------------------------------|
| Title         | Single line of text   | Yes      | Award ka naam (e.g. "Rising Star") — yeh default Title column hai              |
| AwardName     | Choice                | Yes      | Rising Star, Kudos, Above and Beyond, Service Excellence, Innovation Award, Living the Values, Client Champion, Team Spirit, Leadership Excellence, Other |
| CustomAwardName | Single line of text | No       | Agar AwardName = "Other" to yahan actual naam likhein                         |
| Platform      | Single line of text   | Yes      | e.g. KPMG Encore, KPMG Kloud, Teams Recognition                               |
| AwardedBy     | Single line of text   | No       | Jisne award diya uska naam                                                     |
| DateReceived  | Date and Time         | Yes      | Award milne ki actual date (backdated allowed)                                 |
| Description   | Multiple lines of text| Yes      | Award kyun mila — short description                                            |
| SubmittedBy   | Single line of text   | Yes      | Employee ka naam (Power Apps se auto-fill hoga)                                |
| PMName        | Single line of text   | Yes      | Employee ke PM ka naam (auto-fill from Users list)                             |
| Status        | Choice                | Yes      | Pending, Approved, Rejected (Default: Pending)                                 |
| RejectReason  | Multiple lines of text| No       | PM ne reject kiya to reason yahan                                              |
| SubmittedAt   | Date and Time         | Yes      | Submission ka timestamp (auto-fill)                                            |
| ApprovedAt    | Date and Time         | No       | Jab PM ne approve kiya                                                         |

**Column add karne ke steps:**
1. List open karo → top-right **"+ Add column"** click karo
2. Type select karo (e.g. "Choice" ya "Single line of text")
3. Name dalo → **Save** karo
4. Choice columns ke liye Options mein values daalo

---

## B. Power Automate — Email Notification Flow

> **Trigger:** Jab bhi koi new item `ExternalAwards` SharePoint list mein add ho, PM ko email jaaye.

### Step 1: Power Automate kholo

1. `https://make.powerautomate.com` kholo
2. Left menu → **"Create"** click karo
3. **"Automated cloud flow"** select karo
4. Flow name: `External Award — PM Notification`
5. Trigger: `When an item is created (SharePoint)` → **Create** karo

---

### Step 2: Trigger configure karo

1. **Site Address:** Apni SharePoint site URL select karo (e.g. SparklerHub)
2. **List Name:** `ExternalAwards`
3. **Save** karo

---

### Step 3: PM Email address lookup karo (Users list se)

1. **"+ New step"** → `Get items (SharePoint)` action add karo
2. **Site Address:** Same SharePoint site
3. **List Name:** `Users`
4. **Filter Query:** `DisplayName eq '@{triggerOutputs()?['body/PMName']}'`
   - Yeh Users list mein PM ka record dhundega
5. Action ka naam rename karo: `Get PM Details`

---

### Step 4: Send email action add karo

1. **"+ New step"** → `Send an email (V2) (Office 365 Outlook)` add karo
2. **To:** `@{first(outputs('Get_PM_Details')?['body/value'])?['Email']}`
   - Agar Users list mein Email column hai to wahi use karo
   - Ya sirf PM naam se address banao: `@{triggerOutputs()?['body/PMName']}@kpmg.com`
3. **Subject:**
   ```
   [Action Required] @{triggerOutputs()?['body/SubmittedBy']} ne ek award log kiya — Approval Pending
   ```
4. **Body (HTML format select karo):**
   ```html
   <p>Hi <strong>@{triggerOutputs()?['body/PMName']}</strong>,</p>

   <p>
     <strong>@{triggerOutputs()?['body/SubmittedBy']}</strong> ne apna 
     <strong>"@{triggerOutputs()?['body/AwardName']}"</strong> award log kiya hai 
     jo unhe <strong>@{triggerOutputs()?['body/DateReceived']}</strong> ko mila tha.
   </p>

   <table border="0" cellpadding="6" style="font-family: Arial, sans-serif; font-size: 14px;">
     <tr><td><strong>Platform / Source:</strong></td><td>@{triggerOutputs()?['body/Platform']}</td></tr>
     <tr><td><strong>Awarded By:</strong></td><td>@{triggerOutputs()?['body/AwardedBy']}</td></tr>
     <tr><td><strong>Description:</strong></td><td>@{triggerOutputs()?['body/Description']}</td></tr>
   </table>

   <br/>
   <p>Please Sparklers Hub Power App mein login karke <strong>Team Dashboard → External Awards</strong> tab pe jaayein aur approve ya reject karein.</p>

   <p style="color: #888; font-size: 12px;">Yeh message Sparklers Hub se automatically bheja gaya hai.</p>
   ```

---

### Step 5: Flow save aur test karo

1. Top-right **"Save"** karo
2. **"Test"** → **"Manually"** → SharePoint list mein ek dummy item add karo
3. PM ke email inbox mein notification check karo
4. Agar email nahi aaya — "Flow run history" mein error check karo

---

### Step 6: (Optional) Approval karne par User ko notification

1. Ek aur flow banao: `External Award — Approval Result Notification`
2. Trigger: `When an existing item is modified (SharePoint)` → `ExternalAwards` list
3. Condition add karo: `Status is equal to Approved` OR `Status is equal to Rejected`
4. User ko email bhejo:
   - **To:** `@{triggerOutputs()?['body/SubmittedBy']}@kpmg.com`
   - **Subject:** `Your "@{triggerOutputs()?['body/AwardName']}" award has been @{triggerOutputs()?['body/Status']}`
   - **Body:** Result + reason (agar rejected) include karo

---

## C. Power Apps — Screen Implementation

### Screen 10: `scrLogExternalAward` (User / PM)

**Visible To:** User aur PM roles

**Layout:**
```
Header: "Log an External Award"
Subtitle: "Apne doosre platform ke award yahan add karo"

Form Fields:
  - ddlAwardName     : Dropdown (Choice values from EXTERNAL_AWARD_TYPES)
  - txtCustomAward   : TextInput (Visible only when ddlAwardName.Selected.Value = "Other")
  - txtPlatform      : TextInput (Required)
  - dpDateReceived   : DatePicker (Max: Today(), no restriction on past)
  - txtAwardedBy     : TextInput (Optional)
  - txtDescription   : TextInput, Multiline (Required)

Read-Only Info Box:
  lblPMInfo: "Approval will be sent to: " & varCurrentUserPM

Submit Button: btnSubmitAward
```

**Submit Button — OnSelect formula:**
```powerapps
// 1. Validate
If(
    IsBlank(dpDateReceived.SelectedDate) || IsBlank(txtPlatform.Text) || IsBlank(txtDescription.Text),
    Notify("Please fill all required fields.", NotificationType.Error),

    // 2. Patch to SharePoint
    Patch(
        ExternalAwards,
        Defaults(ExternalAwards),
        {
            Title: If(ddlAwardName.Selected.Value = "Other", txtCustomAward.Text, ddlAwardName.Selected.Value),
            AwardName: ddlAwardName.Selected.Value,
            CustomAwardName: txtCustomAward.Text,
            Platform: txtPlatform.Text,
            DateReceived: dpDateReceived.SelectedDate,
            AwardedBy: txtAwardedBy.Text,
            Description: txtDescription.Text,
            SubmittedBy: varCurrentUserName,
            PMName: varCurrentUserPM,
            Status: "Pending",
            SubmittedAt: Now()
        }
    );
    // 3. Power Automate automatically email bhejega (Step B ke flow se)
    // 4. Navigate to success screen
    Navigate(scrDashboard, ScreenTransition.Fade);
    Notify("Award logged successfully! Your PM will be notified.", NotificationType.Success)
)
```

---

### Screen 11: External Awards Tab in `scrTeamApprovals` (PM only)

**Modification:** Existing Team Approvals screen mein ek nayi tab add karo.

**Tab Toggle:**
```powerapps
// Tab button ke OnSelect:
UpdateContext({locActiveTab: "external"})   // ya "sparklers"

// Sparklers content:
Visible = locActiveTab = "sparklers"

// External Awards content:
Visible = locActiveTab = "external"
```

**External Awards Gallery — Items formula:**
```powerapps
Filter(
    ExternalAwards,
    PMName = varCurrentUserName && Status = "Pending"
)
```

**Approve Button — OnSelect:**
```powerapps
Patch(
    ExternalAwards,
    ThisItem,
    {
        Status: "Approved",
        ApprovedAt: Now()
    }
);
Notify("Award approved!", NotificationType.Success);
Refresh(ExternalAwards)
```

**Reject Button — OnSelect:**
```powerapps
// Pehle reject reason input lena hoga (popup/modal se)
If(
    IsBlank(txtRejectReason.Text),
    Notify("Rejection reason mandatory hai.", NotificationType.Error),
    Patch(
        ExternalAwards,
        ThisItem,
        {
            Status: "Rejected",
            RejectReason: txtRejectReason.Text
        }
    );
    Notify("Award rejected.", NotificationType.Warning);
    Refresh(ExternalAwards)
)
```

---

### Dashboard mein Achievement Locker Section (`scrDashboard`)

**Gallery — Items formula:**
```powerapps
Filter(
    ExternalAwards,
    SubmittedBy = varCurrentUserName
)
```

**Status Badge Color:**
```powerapps
// lblStatus ka Color:
Switch(
    ThisItem.Status,
    "Approved", RGBA(34, 197, 94, 1),    // Green
    "Pending",  RGBA(245, 158, 11, 1),   // Amber
    "Rejected", RGBA(239, 68, 68, 1)     // Red
)
```

**"Log an Award" Button:**
```powerapps
Navigate(scrLogExternalAward, ScreenTransition.Cover)
```

---

## D. App.OnStart — Variables

Existing `App.OnStart` mein yeh bhi add karo:

```powerapps
// Current user ka PM lookup (Users SharePoint list se)
Set(
    varCurrentUserPM,
    LookUp(Users, DisplayName = varCurrentUserName, PMName)
);

// Is user ke external awards
ClearCollect(
    colMyExternalAwards,
    Filter(ExternalAwards, SubmittedBy = varCurrentUserName)
)
```

---

## E. Summary — Poora Flow

```
Employee → "Log an Award" screen → Form fill karo
    ↓
Submit → ExternalAwards SharePoint list mein item create hota hai (Status: Pending)
    ↓
Power Automate trigger fires → PM ko email jaata hai
    ↓
PM → Power App → Team Dashboard → "External Awards" tab
    ↓
PM: Approve karo → Status: Approved → Employee ko notification
PM: Reject karo  → Status: Rejected + Reason → Employee ko notification
    ↓
Employee ka Dashboard → "My Achievement Locker" section mein award dikhta hai
    ↓
Year-end review → Ek jagah saare awards (Sparklers + External) — complete portfolio
```

---

## F. Checklist

```
SharePoint Setup:
  [ ] ExternalAwards list banao
  [ ] Saare columns add karo (Table A ke according)
  [ ] Users list mein Email column add karo (agar nahi hai)

Power Automate:
  [ ] Flow 1: "External Award — PM Notification" banao (Trigger: item created)
  [ ] Flow 2: "External Award — Approval Result" banao (Trigger: item modified) [Optional]
  [ ] Dono flows test karo with dummy data

Power Apps:
  [ ] App.OnStart mein varCurrentUserPM set karo
  [ ] Screen 10: scrLogExternalAward banao (form + submit)
  [ ] scrTeamApprovals mein External Awards tab add karo
  [ ] scrDashboard mein Achievement Locker gallery section add karo
  [ ] Status badge colors set karo
  [ ] Test: Submit → Email check → Approve → Dashboard check
```

---

## 21. Employee Feedback Feature & Analyzer

This feature allows employees to log feedback they received from clients (e.g. from Outlook) to build their personal portfolio. The app automatically determines the feedback category and impact score in real-time using keyword analysis.

### 21.1 SharePoint List: Feedbacks
Create a new SharePoint List named **Feedbacks** with the following schema:

| Column Name    | Type                   | Description                                                |
|----------------|------------------------|------------------------------------------------------------|
| ID             | Auto Number            | Primary key                                                |
| SubmittedBy    | Text                   | Employee who received & logged the feedback                |
| Category       | Text                   | Auto-categorized value (Client Appreciation, Team, etc.)   |
| Description    | Multiline Text         | The detailed feedback text pasted from client email        |
| ImpactScore    | Number                 | Calculated impact score (1-10)                             |
| HasAttachment  | Yes/No                 | True if email screenshot or PDF attachment exists          |
| Acknowledged   | Yes/No                 | Checked by Admin once reviewed                             |
| SubmittedDate  | Date/Time              | Timestamp of submission                                    |

### 21.2 Power Fx Real-Time Impact Score Calculation
Add this formula to the **OnChange** or **OnSelect** property of your feedback text input box (`txtFeedbackDescription`), or use it dynamically in a label's `Text` property:

```powerapps
Set(
    varImpactScore,
    Min(
        10,
        Max(
            1,
            Round(
                If(IsBlank(txtFeedbackDescription.Text), 0,
                    // Check keyword occurrences and sum weights
                    If("automat" in Lower(txtFeedbackDescription.Text), 1.5, 0) +
                    If("revenue" in Lower(txtFeedbackDescription.Text), 1.4, 0) +
                    If("cost saving" in Lower(txtFeedbackDescription.Text), 1.4, 0) +
                    If("save" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("hours" in Lower(txtFeedbackDescription.Text), 0.6, 0) +
                    If("efficiency" in Lower(txtFeedbackDescription.Text), 1.2, 0) +
                    If("nps" in Lower(txtFeedbackDescription.Text), 1.3, 0) +
                    If("client" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("customer" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("error" in Lower(txtFeedbackDescription.Text), 0.6, 0) +
                    If("reduce" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    If("improve" in Lower(txtFeedbackDescription.Text), 0.5, 0) +
                    If("increase" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    If("process" in Lower(txtFeedbackDescription.Text), 0.6, 0) +
                    If("tool" in Lower(txtFeedbackDescription.Text), 0.4, 0) +
                    If("implement" in Lower(txtFeedbackDescription.Text), 0.6, 0) +
                    If("data" in Lower(txtFeedbackDescription.Text), 0.5, 0) +
                    If("risk" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("deadline" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    If("sla" in Lower(txtFeedbackDescription.Text), 1.0, 0) +
                    If("kpi" in Lower(txtFeedbackDescription.Text), 1.0, 0) +
                    If("metric" in Lower(txtFeedbackDescription.Text), 0.9, 0) +
                    If("percent" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("%" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    If("bottleneck" in Lower(txtFeedbackDescription.Text), 0.9, 0) +
                    If("blocker" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("delay" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    If("manual" in Lower(txtFeedbackDescription.Text), 0.6, 0) +
                    If("streamline" in Lower(txtFeedbackDescription.Text), 0.8, 0) +
                    If("pipeline" in Lower(txtFeedbackDescription.Text), 0.7, 0) +
                    // Length Bonus
                    If(Len(txtFeedbackDescription.Text) > 100, 0.5, 0) +
                    If(Len(txtFeedbackDescription.Text) > 200, 0.5, 0) +
                    If(Len(txtFeedbackDescription.Text) > 350, 0.5, 0)
                ),
                0
            )
        )
    )
);

Set(
    varDetectedCategory,
    If(
        IsBlank(txtFeedbackDescription.Text) || Len(txtFeedbackDescription.Text) < 5,
        "General Appreciation",
        If(
            Or(
                "automat" in Lower(txtFeedbackDescription.Text),
                "power automate" in Lower(txtFeedbackDescription.Text),
                "workflow" in Lower(txtFeedbackDescription.Text),
                "process" in Lower(txtFeedbackDescription.Text),
                "streamline" in Lower(txtFeedbackDescription.Text),
                "efficiency" in Lower(txtFeedbackDescription.Text),
                "save hours" in Lower(txtFeedbackDescription.Text)
            ),
            "Process Efficiency",
            If(
                Or(
                    "nps" in Lower(txtFeedbackDescription.Text),
                    "client" in Lower(txtFeedbackDescription.Text),
                    "customer" in Lower(txtFeedbackDescription.Text),
                    "delight" in Lower(txtFeedbackDescription.Text),
                    "support" in Lower(txtFeedbackDescription.Text),
                    "satisfaction" in Lower(txtFeedbackDescription.Text),
                    "feedback" in Lower(txtFeedbackDescription.Text),
                    "outlook" in Lower(txtFeedbackDescription.Text)
                ),
                "Client Appreciation",
                If(
                    Or(
                        "team" in Lower(txtFeedbackDescription.Text),
                        "culture" in Lower(txtFeedbackDescription.Text),
                        "collaborate" in Lower(txtFeedbackDescription.Text),
                        "mentor" in Lower(txtFeedbackDescription.Text),
                        "help" in Lower(txtFeedbackDescription.Text),
                        "supportive" in Lower(txtFeedbackDescription.Text),
                        "relationship" in Lower(txtFeedbackDescription.Text),
                        "people" in Lower(txtFeedbackDescription.Text)
                    ),
                    "Team & Culture",
                    If(
                        Or(
                            "technical" in Lower(txtFeedbackDescription.Text),
                            "code" in Lower(txtFeedbackDescription.Text),
                            "architecture" in Lower(txtFeedbackDescription.Text),
                            "bug" in Lower(txtFeedbackDescription.Text),
                            "fix" in Lower(txtFeedbackDescription.Text),
                            "design" in Lower(txtFeedbackDescription.Text),
                            "develop" in Lower(txtFeedbackDescription.Text),
                            "delivery" in Lower(txtFeedbackDescription.Text)
                        ),
                        "Technical Excellence",
                        "General Appreciation"
                    )
                )
            )
        )
    ```

---

## 22. Step-by-Step Guide: Process Efficiency & Hours Saved Integration in PowerApps

Leadership ka focus efficiency aur time savings par alignment ke liye, PowerApps aur SharePoint mein ye step-by-step changes karein:

### Step 1: SharePoint List Schema Update (`Nominations` List)

1. Open **SharePoint Site** > **Site Contents** > **Nominations List** > **List Settings**.
2. **Choice Column Update (`Category`)**:
   - Add new choice option: `"Process & Efficiency"`
   - Final Choices: `Process & Efficiency`, `Innovation`, `Team Player`, `Extra Mile`, `Customer Success`
3. **New Column Addition (`HoursSaved`)**:
   - Column Name: `HoursSaved`
   - Type: `Number` (Decimal places: 0)
   - Default value: `0`
   - Minimum value: `0`

---

### Step 2: Canvas App Form Updates (`SelfNominate` & `NominateTeam` Screens)

1. Set `drpCategory.Items` = 
   ```powerfx
   ["Process & Efficiency", "Innovation", "Team Player", "Extra Mile", "Customer Success"]
   ```

2. Add a new Card / TextInput for Hours Saved (`txtHoursSaved`):
   - `Format`: `TextFormat.Number`
   - `HintText`: `"e.g. 15 (Hours saved through automation/process fix)"`
   - `Visible`: `drpCategory.Selected.Value = "Process & Efficiency"`

3. Update **Submit Button `OnSelect`** Patch formula:
   ```powerfx
   Patch(
       Nominations,
       Defaults(Nominations),
       {
           NomineeName: drpNominee.Selected.Value,
           Category: { Value: drpCategory.Selected.Value },
           HoursSaved: Value(txtHoursSaved.Text),
           Reason: txtReason.Text,
           Status: If(varUserRole = "PM", "PMApproved", "Pending"),
           SubmittedDate: Now(),
           SubmittedBy: varUserRole
       }
   );
   Notify("Nomination submitted successfully!", NotificationType.Success);
   ```

---

### Step 3: Executive & Leadership Dashboard KPI Formulas (Weekly Standard)

1. **Total Segment Hours Saved KPI Card (`lblTotalHoursSaved.Text`)**:
   ```powerfx
   // Direct Sum of Weekly Hours Saved across all Approved Process & Efficiency nominations
   Text(Sum(Filter(Nominations, Status = "Approved"), HoursSaved), "#,##0") & " hrs/wk saved"
   ```

2. **Process Efficiency Nominations Count (`lblEffCount.Text`)**:
   ```powerfx
   Text(
       CountRows(
           Filter(Nominations, Status = "Approved" && Category.Value = "Process & Efficiency")
       )
   ) & " Efficiency Awards"
   ```

3. **Segment-Wise Weekly Hours Saved (for Manager View)**:
   ```powerfx
   Text(
       Sum(
           Filter(
               Nominations,
               Status = "Approved" && NomineeName in colSegmentTeamMembers
           ),
           HoursSaved
       ),
       "#,##0"
   ) & " hrs/wk"
   ```

---

### Step 4: Efficiency Champions Leaderboard Gallery Setup

To show top employees by total weekly hours saved on the **Winners Board / Executive Screen**:

1. Insert a **Vertical Gallery** (`galEfficiencyChampions`).
2. Set `Items` property to group by employee name and sum total weekly hours saved:
   ```powerfx
   Sort(
       AddColumns(
           GroupBy(
               Filter(Nominations, Status = "Approved", HoursSaved > 0),
               "NomineeName",
               "GroupedNominations"
           ),
           "TotalWeeklyHoursSaved",
           Sum(GroupedNominations, HoursSaved)
       ),
       TotalWeeklyHoursSaved,
       SortOrder.Descending
   )
   ```
3. Inside Gallery Card Controls:
   - `lblNomineeName.Text` = `ThisItem.NomineeName`
   - `lblHoursSavedBadge.Text` = `"⚡ " & Text(ThisItem.TotalWeeklyHoursSaved) & " hrs/wk saved"`
   - `lblRankIcon.Text` = 
     ```powerfx
     Switch(
         ThisItem.Index,
         1, "⚡ Champion",
         2, "⚙️ Runner-up",
         "⏱️ Contributor"
     )
     ```

---

### Step 5: Automatic Efficiency Keyword Detection & Category Auto-Suggest

User jab nomination reason type kar raha ho, tab auto-select logic chalane ke liye `txtReason.OnChange` / `OnUnfocus` property update karein:

```powerfx
If(
    Or(
        "automat" in Lower(txtReason.Text),
        "workflow" in Lower(txtReason.Text),
        "efficiency" in Lower(txtReason.Text),
        "save hours" in Lower(txtReason.Text),
        "streamline" in Lower(txtReason.Text)
    ),
    UpdateContext({varAutoSuggestedCategory: "Process & Efficiency"});
    Select(drpCategory, "Process & Efficiency")
);
```

---

*Step-by-step Efficiency & Hours Saved Documentation — August 2026*
*Includes complete PowerFx formulas and SharePoint schema changes.*

---

## 23. Typography & UI Style Guide: Open Sans Font & Line Icons Setup in PowerApps

PowerApps mein professional visual standard and KPMG brand alignment ke liye Open Sans typography aur Line SVG Icons configure karein:

### Step 1: Custom Font Configuration (`App.OnStart`)

1. Open **App** object > **OnStart** property.
2. Add global font definitions to global theme variable `varTheme`:
   ```powerfx
   Set(
       varTheme,
       {
           FontFamilyBody: "Open Sans, sans-serif",
           FontFamilyHeadline: "Open Sans Condensed, sans-serif",
           ColorPrimary: ColorValue("#00338D"),    // KPMG Blue
           ColorSecondary: ColorValue("#7213EA"),  // Royal Purple
           ColorTeal: ColorValue("#00C0AE"),       // Efficiency Teal
           ColorAmber: ColorValue("#F59E0B")        // Alert Amber
       }
   );
   ```
3. Set control properties across screens:
   - `Header.Font` = `varTheme.FontFamilyHeadline`
   - `Header.FontWeight` = `FontWeight.Bold`
   - `BodyText.Font` = `varTheme.FontFamilyBody`

---

### Step 2: Line Vector Icons Replacement (Replacing Emoji Text)

Plain text emojis (⚡, 🎖️, 💬) ki jagah PowerApps vector line icon controls use karein:

| Metric / Section | Old Emoji | PowerApps Control / Icon Property | Color Hex |
|---|---|---|---|
| Sparklers Awards | ⚡ / 🏆 | `Icon.Trophy` | `#00338D` |
| Hours Saved (ROI) | ⚡ / ⏱️ | `Icon.Clock` | `#00C0AE` |
| External Awards | 🎖️ | `Icon.Medal` | `#7213EA` |
| Pending Approvals | ⚠️ | `Icon.ShieldAlert` / `Icon.Warning` | `#F59E0B` |
| Team / Participants | 👥 | `Icon.People` / `Icon.UserCircle` | `#1E49E2` |
| Client Feedbacks | 💬 | `Icon.Message` / `Icon.Chat` | `#059669` |

**PowerApps Icon Button Setup Example**:
```powerfx
// Insert Line Icon control
Insert > Icons > Trophy
Icon.Color = varTheme.ColorPrimary
Icon.Padding = 8
Icon.DisplayMode = DisplayMode.Edit
```

---

## 24. Role-Based Navigation: My Personal Dashboard vs Leadership Board

TLs, AMs, Managers, and Directors ke paas do views hote hain:
1. **Team/Segment Leadership Board (`scrLeadershipBoard`)**: Segment metrics, team breakdown, efficiency ROI.
2. **My Personal Dashboard (`scrMyDashboard`)**: Personal Badge level, personal awards won, client feedbacks received, self-nominate option.

### Step 1: Sidebar Navigation Control Setup

Sidebar menu gallery item `OnSelect` formula:
```powerfx
Switch(
    ThisItem.ScreenTarget,
    "MyDashboard", Navigate(scrMyDashboard, ScreenTransition.Fade),
    "LeadershipBoard", Navigate(scrLeadershipBoard, ScreenTransition.Fade),
    "SelfNominate", Navigate(scrSelfNominate, ScreenTransition.Fade),
    "PMApprovals", Navigate(scrPMApprovals, ScreenTransition.Fade),
    "Feedback", Navigate(scrFeedback, ScreenTransition.Fade),
    Navigate(scrMyDashboard, ScreenTransition.Fade)
);
```

### Step 2: Header User Profile Chip Click Formula

Top header mein user name / profile avatar click karne par unka personal dashboard kholne ke liye `icnUserProfile.OnSelect` property set karein:
```powerfx
Navigate(scrMyDashboard, ScreenTransition.Fade);
Notify("Navigated to My Personal Dashboard", NotificationType.Information);
```

---

---

## 25. Client Feedback Enhancements: 3-Tier PM Impact Scale, Portfolio Export & Outlook Team Broadcast

### A. 3-Tier Business Impact Scale (Set by PM on Approval)

User submission stage par impact field nahi rakhi gayi hai. Attachment (`.msg` / Email Snapshot PDF/Image) submission ke liye **Mandatory (`*`)** hai. PM Approval stage par 3-Tier Business Impact dropdown options:

| Impact Tier | Value Label | Definition / Criteria | Score Equivalent |
|---|---|---|---|
| 🟢 Standard | Standard Appreciation | Routine good client feedback, praise email | 3 / 10 |
| 🔵 High Value | High Value / NPS Booster | Strong client appreciation, key deliverable success | 7 / 10 |
| ⭐ Strategic | Game Changer / Account Growth | Escalation solved, business extension, process transformation | 10 / 10 |

**PM Approval Formula (`btnApproveFeedback.OnSelect`)**:
```powerfx
Patch(
    ClientFeedbacks,
    GalleryPendingFeedbacks.Selected,
    {
        Status: "Approved",
        ImpactTier: drpPMImpactTier.Selected.Value,
        ImpactScore: Switch(drpPMImpactTier.Selected.Value, "Game Changer / Account Growth", 10, "High Value / NPS Booster", 7, 3),
        PMApprovedAt: Now(),
        PMNotes: txtPMNotes.Text
    }
);
Notify("Client Feedback approved and impact level tagged!", NotificationType.Success);
```

---

### B. Year-End Feedback Portfolio Export (User Self-Service)

Employees apne saal bhar ke approved client feedbacks aur snapshots ek click mein export kar sakte hain (Performance Appraisals / Year-End Reviews ke liye).

**PowerApps Collection Export Formula (`btnExportPortfolio.OnSelect`)**:
```powerfx
// 1. User ke approved feedbacks collect karein
ClearCollect(
    colUserPortfolio,
    ShowColumns(
        Filter(ClientFeedbacks, SubmittedBy = User().FullName && Status = "Approved"),
        "SubmittedDate", "Category", "Description", "ImpactTier", "AttachmentName"
    )
);

// 2. Power Automate Flow triggering PDF/Excel generation
'GenerateFeedbackPortfolioFlow'.Run(
    User().Email,
    JSON(colUserPortfolio, JSONFormat.IndentFour)
);
Notify("Your Year-End Client Feedback Portfolio is being generated and sent to your email!", NotificationType.Information);
```

**Power Automate Flow Steps**:
1. **Trigger**: PowerApps (V2)
2. **Data Processing**: Parse JSON array of user feedbacks.
3. **HTML Report Generation**: Create HTML Table template with KPMG styling.
4. **Convert to PDF**: OneDrive / SharePoint HTML to PDF Action.
5. **Send Email**: Attach PDF & original attachment snapshots -> Send to `User().Email`.

---

### C. PM "Share with Team via Outlook" Email Broadcast

PMs received client feedbacks ko direct pre-configured Outlook Distribution Lists (DLs) aur team members ke saath share kar sakte hain.

**PowerFx Formula for Outlook Broadcast (`btnShareWithTeam.OnSelect`)**:
```powerfx
// 1. Mark as Shared in SharePoint List
Patch(
    ClientFeedbacks,
    GalleryFeedback.Selected,
    {
        IsShared: true,
        ShareCount: Coalesce(GalleryFeedback.Selected.ShareCount, 0) + 1,
        SharedAt: Now()
    }
);

// 2. Direct Launch Outlook Compose Window
Launch(
    "mailto:" & EncodeUrl(GalleryFeedback.Selected.NomineeEmail) & 
    "?cc=" & EncodeUrl("UK-DLStarGraphicsTeamGGN@KPMG.co.uk; UK-DLStarGraphicsTeamBLR@KPMG.co.uk; dkumaran@kpmg.com") &
    "&subject=" & EncodeUrl(If(IsBlank(GalleryFeedback.Selected.Subject), "Client Appreciation Share: Kudos to " & GalleryFeedback.Selected.SubmittedBy, GalleryFeedback.Selected.Subject)) &
    "&body=" & EncodeUrl(
        "Hi " & GalleryFeedback.Selected.SubmittedBy & "," & Char(10) & Char(10) &
        "Kudos on receiving great client appreciation! Sharing this with the team." & Char(10) & Char(10) &
        "----------------------------------------" & Char(10) &
        "Client Feedback Details:" & Char(10) &
        GalleryFeedback.Selected.Description
    )
);

Notify("Client Feedback shared with team via Outlook email!", NotificationType.Success);
```

---

### D. Zero-Prompt Feedback AI Analyzer (User Button + Admin ON/OFF Master Switch)

User ko koi extra prompt text (*"Analyze feedback"* / *"Check impact"*) nahi likhna padega. Feedback textarea ke neche **`Feedback AI (Analyze Impact)`** button diya gaya hai. Admin is AI feature ko **ON / OFF** toggle kar sakta hai (jab tak project live AI production par move nahi ho jata).

#### 1. SharePoint Settings List (Admin Configuration)
Admin configuration store karne ke liye `AppSettings` list:
- **Title**: `FeedbackAIEnabled` (Text)
- **Value**: `true` / `false` (Text or Boolean)

#### 2. Admin AI Switch Formula (`btnToggleAdminAI.OnSelect`)
```powerfx
// Admin Panel: Toggle AI Master Switch ON/OFF
Set(varAIFeatureEnabled, !varAIFeatureEnabled);
Patch(
    AppSettings,
    LookUp(AppSettings, Title = "FeedbackAIEnabled"),
    { Value: Text(varAIFeatureEnabled) }
);
Notify("Feedback AI feature toggled " & If(varAIFeatureEnabled, "ON", "OFF"), NotificationType.Information);
```

#### 3. User Feedback AI Button Formula (`btnAnalyzeAI.OnSelect`)
```powerfx
// Button Visible condition: Admin ON switch active
// OnClick: Auto-Analyze pasted text using PowerApps AI Builder / Copilot
If(
    varAIFeatureEnabled,
    Set(varIsAnalyzing, true);
    Set(
        varAIAnalysisResult,
        'AnalyzeClientFeedbackAI'.Predict(txtFeedbackDescription.Text)
    );
    Set(varIsAnalyzing, false);
)
```

#### 4. Dynamic Screen Card Output (No user prompt required)
Screen par live output Card `varAIAnalysisResult` ke according display hoga:
- **Impact Badge**: `varAIAnalysisResult.ImpactTier` (Standard Appreciation / High Value / Strategic Game Changer)
- **Impact Score**: `varAIAnalysisResult.ImpactScore` (1 to 10)
- **Auto Category**: `varAIAnalysisResult.Category`
- **Reasoning**: `varAIAnalysisResult.SummaryReason`

---

## 26. Step-by-Step Guide: PowerApps Containers, Dynamic Galleries & Layout Design

Aap agar PowerApps mein **Responsive Containers, Dynamic Galleries, Tabs, aur Form Layouts** pehle nahi banaye hain, toh is section ke simple step-by-step steps ko follow karein.

---

### A. Screen Layout Architecture (60% Form + 40% KPI Top Row & 100% Full-Width Bottom Table)

Is modern layout ke liye PowerApps Studio mein **Flex Containers** use hote hain:

```
Screen (scrFeedback / scrSelfNominate / scrOtherAwards)
  └── Main Vertical Container (Width: Parent.Width, Height: Parent.Height)
        ├── Top Horizontal Container (Fill Portion: 0.45)
        │     ├── Top Left Container (Width Portion: 6)  <-- 60% Width Form
        │     └── Top Right Container (Width Portion: 4) <-- 40% Width KPI Summary Cards
        └── Bottom Container (Fill Portion: 0.55)       <-- 100% Full Width Gallery / Table
```

#### Step-by-Step Container Creation in PowerApps Studio:
1. Screen par click karein -> **Insert** menu -> Search **Container** -> Add **Vertical Container** (`conMainScreen`).
   - Set `X` = 0, `Y` = 0, `Width` = `Parent.Width`, `Height` = `Parent.Height`.
2. Inside `conMainScreen`: Add **Horizontal Container** (`conTopRow`).
   - Set `Flexible Height` = `On`, `Fill Portions` = `4.5`.
3. Inside `conTopRow`: Add 2 Containers:
   - **Left Form Container (`conTopLeftForm`)**: Set `Flexible Width` = `On`, `Fill Portions` = `6` (60% width).
   - **Right KPI Container (`conTopRightKPI`)**: Set `Flexible Width` = `On`, `Fill Portions` = `4` (40% width).
4. Inside `conMainScreen`: Add a **Container (`conBottomTable`)**.
   - Set `Flexible Height` = `On`, `Fill Portions` = `5.5`, `Width` = `Parent.Width` (100% full width).

---

### B. PowerApps Dynamic Gallery (Full-Width Profile Table) Kaise Banayein

PowerApps mein Excel/HTML table jaise full-width data dikhane ke liye **Vertical Gallery** control use hota hai.

#### Step-by-Step Gallery Creation:
1. `conBottomTable` container ke andar click karein -> **Insert** -> **Blank Flexible Height Gallery** (`galFeedbackHistory`).
2. Gallery ki **`Items` Property** mein formula likhein:
   ```powerfx
   // Logged-in user ke feedbacks filter aur sort karein
   Sort(
       Filter(ClientFeedbacks, SubmittedBy = varUserName),
       SubmittedDate,
       SortOrder.Descending
   )
   ```
3. Gallery Template ke andar Labels insert karein:
   - **Date Label (`lblDate`)**: `Text = Text(ThisItem.SubmittedDate, "dd-mmm-yyyy")`
   - **Category Label (`lblCategory`)**: `Text = ThisItem.Category`
   - **Description Label (`lblDescription`)**: `Text = ThisItem.Description` *(Set `AutoHeight` = `true` taaki multi-line text poora dikhe!)*
   - **Impact Badge Label (`lblImpact`)**: `Text = ThisItem.ImpactTier & " (" & ThisItem.ImpactScore & "/10)"`
   - **Status Badge Label (`lblStatus`)**: `Text = ThisItem.Status`

---

### C. PowerApps Form & AI Action Setup (Top Left 60% Container)

#### Form Controls Setup:
1. `conTopLeftForm` ke andar **Text Input** control insert karein (`txtFeedbackDescription`).
   - `Mode` = `TextMode.MultiLine`
   - `Height` = `140`
2. **AI Button (`btnAnalyzeAI`)**:
   - `OnSelect` = 
     ```powerfx
     Set(varIsAnalyzing, true);
     Set(varAIResult, 'AnalyzeClientFeedbackAI'.Predict(txtFeedbackDescription.Text));
     Set(varIsAnalyzing, false);
     ```
3. **Submit Button (`btnSubmitFeedback`)**:
   - `OnSelect` = 
     ```powerfx
     Patch(
         ClientFeedbacks,
         Defaults(ClientFeedbacks),
         {
             Title: "Client Appreciation by " & varUserName,
             SubmittedBy: varUserName,
             Description: txtFeedbackDescription.Text,
             Status: "Pending",
             SubmittedDate: Now()
         }
     );
     Notify("Feedback submitted to PM for approval!", NotificationType.Success);
     Reset(txtFeedbackDescription);
     ```

---

---

## 27. Step-by-Step Guide: PowerApps Main Page Scrolling Setup

Aapne poocha ki **PowerApps mein main page scroll kaise hota hai** — PowerApps Canvas apps mein page scrolling handle karne ke **2 sabse popular aur easy tareeqe** hote hain:

---

### Method 1: Scrollable Screen (Default Canvas Page Scrolling) — *Easiest Way*

Jab aapki screen par bohot saare sections, forms, aur dynamic tables hon jo 100% viewport height (screen size) se aage nikal rahe hain:

#### Kaise Set Karein (Step-by-Step):
1. PowerApps Studio mein **+ New Screen** par click karein.
2. Template List se **`Scrollable`** screen select karein (is screen par automatic ek `Canvas1` control lag jata hai jo vertical scrolling permit karta hai).
3. **Existing Screen Ko Scrollable Banayein**:
   - Screen object select karein (e.g. `scrFeedback`).
   - Screen ki **`Height` Property** mein formula likhein: 
     ```powerfx
     Max(App.Height, conMainScreen.Height + 50)
     ```
   - Isse jab screen par data badhega, PowerApps phone/laptop screen par automatic vertical scrollbar de dega!

---

### Method 2: Main Vertical Container Scrolling (`EnableScrollbar = true`) — *Best Practice ⭐*

Agar aap dynamic Flex Containers (`conMainScreen`) use kar rahe hain:

#### Step-by-Step Setup:
1. Tree view mein **`conMainScreen`** (Main Parent Container) par click karein.
2. Property panel mein property dhoondhein: **`EnableScrollbar`**.
3. Formula set karein: **`true`**
4. Screen Height setting:
   - `conMainScreen.Height` = `Parent.Height` (ya `Max(768, conBottomTable.Y + conBottomTable.Height)`).

---

### Method 3: Gallery Scrollbars (Only Bottom Table Scroll)

Agar aap chahte hain ki **Top Row (Form + Cards) Screen par FIXED rahe** aur sirf **Bottom Table Scroll ho**:

1. `conBottomTable` (100% full-width container) ke andar ki Gallery (`galFeedbackHistory`) ko select karein.
2. Set Gallery property: **`ShowScrollbar = true`**.
3. Set Gallery Height: `conBottomTable.Height - 60`.
4. Isse Top Form persistent dikhega aur neeche ki table smooth scroll hogi!

---

*Updated PowerApps Documentation — August 2026 Edition*
*All SharePoint List Schemas, PowerFx Formulas, Layout Container Architectures (60/40 & 100%), Page Scrolling Guides, Dynamic Galleries, Font Tokens, Navigation & Power Automate Email/Export Workflows Complete.*

