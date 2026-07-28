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

## 2. Data Model — SharePoint Lists

### Table: Nominations

| Column Name   | Type                   | Description                                               |
|---------------|------------------------|-----------------------------------------------------------|
| ID            | Auto Number            | Primary key                                               |
| NomineeName   | Text                   | Nominee ka name (e.g. "Parteek")                          |
| Category      | Choice                 | User submission: Innovation, Team Player, Extra Mile, Customer Success |
| Reason        | Multiline Text         | User original nomination reason                           |
| Status        | Choice                 | Pending, PMApproved, Approved, Rejected                   |
| SubmittedBy   | Choice                 | User, PM                                                  |
| SubmittedDate | Date/Time              | Submission Timestamp                                      |
| PMCategory    | Choice (Optional)      | PM's override category (leave blank if same as Category)  |
| PMReason      | Multiline Text (Opt.)  | PM's additional comment/reason override                   |
| AdminCategory | Choice (Optional)      | Admin's override category (leave blank to fallback)       |
| AdminReason   | Multiline Text (Opt.)  | Admin's final comment/reason override                     |
| RejectReason  | Multiline Text (Opt.)  | Rejection comments (if status is Rejected)                |

### Table: Users

| Column Name | Type    | Description                                |
|-------------|---------|--------------------------------------------|
| DisplayName | Text    | User ka naam                               |
| Role        | Choice  | User, PM, Admin, Leadership                |
| PMName      | Text    | User ka reporting PM ka naam               |
| Department  | Choice  | CD, Digital, Design, Sales, Motion         |

---

## 3. Roles & User Mapping

### Team Structure:

  PM: Abhineet (CD Department)
    -- Parteek
    -- Shreya
    -- Ganash lal

  PM: Ses (Digital Department)
    -- Vikram
    -- Shantanu
    -- Sukhvindar

  PM: Himanshu (Design Department)
    -- Sivani

  AM: Monam (Sales Department)
    -- Ameen

  Admin: Sola
  Leadership: Kumaran

### Role-Based Access Table:

| Role       | Dashboard | Self-Nom | Nom Team | Winners | Team Approvals | Final Approvals | Design Gen |
|------------|-----------|----------|----------|---------|----------------|-----------------|------------|
| User       | YES       | YES      | NO       | YES     | NO             | NO              | NO         |
| TL / AM    | YES       | YES      | YES      | YES     | YES            | NO              | NO         |
| Manager    | NO        | NO       | YES      | YES     | YES            | NO              | NO         |
| AD / Director | NO     | NO       | NO       | YES     | YES            | NO              | NO         |
| Admin      | YES       | NO       | NO       | YES     | NO             | YES             | YES        |

*Note: Manager, AD, and Director will never self-nominate. AD and Director will never nominate team members either. If a Manager nominates someone, it goes directly to Admin (bypassing the AD).*

### 3.1 Multi-Role Handling (Auto-Login with Microsoft Entra ID)

Power Apps auto-detects the logged-in user via `User().Email`. Agar koi person (like Avinash) normal **User** bhi hai (apne awards log karne ke liye) aur **Admin** bhi hai (approvals ke liye), toh ise manage karne ke 2 tareeqe hain:

**Method 1: Hierarchy Access (Recommended)**
Admin role ko top-tier maniye. Jab app load ho:
`Set(varUserRole, LookUp(Users, Email = User().Email).Role);`

Phir navigation buttons ki `Visible` property ko array check ke through set karein taaki Admin ko User wale features bhi dikhein:
- Home/Dashboard Visible: `varUserRole in ["User", "Admin", "PM"]`
- Leadership Board Visible: `varUserRole in ["Manager", "AD", "Director"]`
- Self Nominate Button Visible: `varUserRole in ["User", "Admin", "PM"]` *(Manager, AD, Director cannot self nominate)*
- Nominate Team Member Visible: `!IsBlank(Filter(Users, PMName = User().FullName)) And varUserRole exactin ["PM", "Manager"]`
- Final Approvals Button Visible: `varUserRole = "Admin"`

Isse Avinash auto-login hote hi apna dashboard bhi dekh payega, self-nominate bhi kar payega, aur sidebar mein usko "Admin Approvals" ka button bhi dikhega.

**Method 2: Multi-Select Role Column**
SharePoint `Users` list mein `Role` column ko "Allow multiple selections" kar dein. Avinash ke aage "User" aur "Admin" dono tick karein.
Phir PowerApps mein:
- `Set(varUserRoles, LookUp(Users, Email = User().Email).Role);`
- Home/Dashboard Visible: `"User" in varUserRoles Or "PM" in varUserRoles`
- Self Nominate Visible: `"User" in varUserRoles Or "PM" in varUserRoles`
- Admin Approvals Visible: `"Admin" in varUserRoles`

- Admin Approvals Visible: `"Admin" in varUserRoles`

### 3.2 Leadership Approval Routing Logic
Agar koi **Manager** apne aap ko ya kisi aur ko nominate karta hai, toh woh request AD/Director ke paas nahi jayegi. Woh seedha **Admin** ke paas jayegi (status `PMApproved` ya `AdminPending` ke sath). 

Power Apps formula for Nominate button:
`If(varUserRole = "Manager", Patch(Nominations, Defaults(Nominations), {Status: "PMApproved"}), Patch(Nominations, Defaults(Nominations), {Status: "Pending"}))`

---

## 4. App Structure — Screens List

Power Apps mein yeh screens banani hain:

| #  | Screen Name         | Visible To               |
|----|---------------------|--------------------------|
| 1  | scrDashboard        | User, PM, Admin          |
| 2  | scrSelfNominate     | User only                |
| 3  | scrNominateTeam     | PM only                  |
| 4  | scrWinnersBoard     | All roles                |
| 5  | scrTeamApprovals    | PM only                  |
| 6  | scrPMApproveModal   | PM only (overlay)        |
| 7  | scrFinalApprovals   | Admin only               |
| 8  | scrAdminApproveModal| Admin only (overlay)     |
| 9  | scrDesignGenerator  | Admin only               |

---

## 5. Screen 1 — My Dashboard

File reference: UserDashboard.jsx

### A. Header
- Text: "Welcome, " & User().FullName & "!"
- Sub text: "Here is your personal Sparklers summary (Year: Oct - Sep)"
- Button: "Self Nominate" -> Navigate to scrSelfNominate (User role only)

### B. Badge Guide Bar (Static strip)
- Bronze (1), Silver (3), Gold (6), Platinum star(10) starstar(15) starstarstar(20) starstarstarstar(25+)

### C. My Current Badge Card & Fiscal Year Filter

#### Dropdown Drop FY Selection (`drpFY`):
- **Items Formula**: 
  ```powerapps
  // Submissions se fiscal years generate aur sort karne ke liye
  ClearCollect(
    colFYs,
    Distinct(
      AddColumns(
        Filter(Nominations, NomineeName = User().FullName && Status = "Approved"),
        "FYLabel",
        If(
          Month(SubmittedDate) >= 10,
          "FY " & Text(Year(SubmittedDate)) & "-" & Right(Text(Year(SubmittedDate) + 1), 2),
          "FY " & Text(Year(SubmittedDate) - 1) & "-" & Right(Text(Year(SubmittedDate)), 2)
        )
      ),
      FYLabel
    )
  );
  // Default and all time options
  Collect(colFYs, {Value: "All Time"});
  colFYs
  ```
- **DefaultSelectedItems**: `["FY " & If(Month(Today()) >= 10, Text(Year(Today())), Text(Year(Today()) - 1)) & "-" & Right(If(Month(Today()) >= 10, Text(Year(Today()) + 1), Text(Year(Today()))), 2)]`

#### Count approved awards in selected Fiscal Year:
- **Formula**:
  ```powerapps
  Set(
    varMyAwards,
    Filter(
      Nominations,
      NomineeName = User().FullName && 
      Status = "Approved" &&
      (
        drpFY.Selected.Value = "All Time" ||
        If(
          Month(SubmittedDate) >= 10,
          "FY " & Text(Year(SubmittedDate)) & "-" & Right(Text(Year(SubmittedDate) + 1), 2),
          "FY " & Text(Year(SubmittedDate) - 1) & "-" & Right(Text(Year(SubmittedDate)), 2)
        ) = drpFY.Selected.Value
      )
    )
  );
  Set(varMyTotal, CountRows(varMyAwards));
  ```

#### Badge level formula:
  ```powerapps
  Set(varBadge,
    If(varMyTotal >= 25, "Platinum ⭐⭐⭐⭐",
    If(varMyTotal >= 20, "Platinum ⭐⭐⭐",
    If(varMyTotal >= 15, "Platinum ⭐⭐",
    If(varMyTotal >= 10, "Platinum ⭐",
    If(varMyTotal >= 6,  "Gold",
    If(varMyTotal >= 3,  "Silver",
    If(varMyTotal >= 1,  "Bronze",
                         "Novice 🩶"
  ))))))))
  ```
  ```

#### Category breakdown gallery:
- **Items**: `GroupBy(varMyAwards, "EffectiveCategory", "Awards")`

### D. Leaderboard (3-column layout)

- **Layout**:
  - **Col 1 (Left, flex:1)**: Rank emoji + Name (TL/AM/Manager suffixes included if manager)
  - **Col 2 (Center, flex:1 justify-center)**: Department Badge Pill
  - **Col 3 (Right, flex:1 justify-end)**: Dynamic calculated awards count
- **Items Formula**:
  ```powerapps
  // On Dashboard start or switch, identify user peer group
  Set(varUserLevel, LookUp(Users, DisplayName = varCurrentUser, Role));
  
  If(
    varUserLevel = "User",
    // Peer group for standard users
    ClearCollect(
      colPeers,
      {PeerName: "Parteek"}, {PeerName: "Shreya"}, {PeerName: "Ganash lal"},
      {PeerName: "Vikram"}, {PeerName: "Shantanu"}, {PeerName: "Sukhvindar"}, {PeerName: "Sivani"}
    ),
    varUserLevel = "TL",
    // Peer group for Team Leads
    ClearCollect(
      colPeers,
      {PeerName: "Abhineet"}, {PeerName: "Himanshu"}, {PeerName: "Ameen"}
    ),
    varUserLevel = "AM",
    // Peer group for AMs
    ClearCollect(
      colPeers,
      {PeerName: "Ses"}, {PeerName: "Monam"}
    ),
    // Otherwise Management / Managers (AD and Director are excluded to only compare Ashok vs Sol)
    ClearCollect(
      colPeers,
      {PeerName: "Sol"}, {PeerName: "Ashok"}
    )
  );

  Sort(
    AddColumns(
      colPeers,
      "DisplayName", If(varUserLevel = "User", PeerName, PeerName & " (" & LookUp(Users, DisplayName = PeerName, Role) & ")"),
      "Department", LookUp(Users, DisplayName = PeerName, Department),
      "Total", 
        // Direct awards won by the person
        CountRows(Filter(Nominations, NomineeName = PeerName && Status = "Approved")) +
        // + Awards won by all their recursive reportees down the chain
        CountRows(
          Filter(
            Nominations, 
            Status = "Approved" && 
            (
              // Direct reportee of PM/Leader
              LookUp(Users, DisplayName = NomineeName, PMName) = PeerName ||
              // Nested reportee 2 levels down
              LookUp(Users, DisplayName = LookUp(Users, DisplayName = NomineeName, PMName), PMName) = PeerName ||
              // Nested reportee 3 levels down
              LookUp(Users, DisplayName = LookUp(Users, DisplayName = LookUp(Users, DisplayName = NomineeName, PMName), PMName), PMName) = PeerName
            )
          )
        )
    ),
    Total,
    Descending
  )
  ```
- **Rank emoji per row**:
  `Switch(ThisItem.Rank, 1, "🥇", 2, "🥈", 3, "🥉", "🏅")`

### F. My Past Wins Table
- **Items Formula**:
  ```powerapps
  SortByColumns(
    varMyAwards, // varMyAwards contains the pre-filtered items from step C above
    "SubmittedDate", 
    Descending
  )
  ```
- **Columns**: Date | EffectiveCategory | EffectiveReason

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

## 7. Screen 3 — Nominate Team Member (PM only)

File reference: NominationForm.jsx

### Components:
- Nominee dropdown (only PM's team members):
    Filter(Users, PMName = varCurrentUser)
- Category dropdown (mandatory)
- Reason textarea (mandatory)
- Attachment (optional)
- Submit button

### Submit Formula (PM nomination skips PM queue -> direct to Admin):
  Patch(
    Nominations,
    Defaults(Nominations),
    {
      NomineeName:   drpNominee.Selected.Value,
      Category:      drpCategory.Selected.Value,
      Reason:        txtReason.Text,
      Status:        "PMApproved",
      SubmittedBy:   "PM",
      SubmittedDate: Now()
    }
  );
  Notify("Nomination submitted!", NotificationType.Success)

---

## 8. Screen 4 — Winners Board

File reference: LeadershipDashboard.jsx

### Layout:
- Month filter dropdown (top-right)
- Weeks grouped by month -> each week shows that Friday's winners
- Each winner row: Name | EffectiveCategory | EffectiveReason | Monthly badge emoji

### Month Filter:
  Distinct(
    AddColumns(
      Filter(Nominations, Status = "Approved"),
      "MonthYear", Text(SubmittedDate, "[$-en-IN]mmmm yyyy")
    ),
    MonthYear
  )

### Week Grouping (by Friday of the week):
  Friday of date = DateAdd(date, (5 - Weekday(date, 2) + 7) Mod 7, Days)

Gallery formula:
  Filter(
    Nominations,
    Status = "Approved" &&
    Text(FridayOfWeek, "mmmm yyyy") = varSelectedMonth
  )

### Monthly Badge per person:
  If(varPersonCount >= 3, "Gold",
  If(varPersonCount = 2,  "Silver",
  If(varPersonCount = 1,  "Bronze", "")))

---

## 9. Screen 5 — Team Approvals (PM only)

File reference: PMApprovals.jsx

### Pending Nominations Gallery:
  Filter(
    Nominations,
    Status = "Pending" && NomineeName in varMyReportees
  )
  Columns: Nominee | Category | Reason | Actions (Approve/Reject)

### Past Actions Table:
  Filter(
    Nominations,
    Status <> "Pending" && NomineeName in varMyReportees
  )

---

## 10. Screen 6 — PM Approve Modal

File reference: PMApprovals.jsx (approve modal section)

### Layout — 3 Sections:

SECTION A: Original Submission (Read-only panel, blue background)
  - Nominee: varSelectedNom.NomineeName
  - Category: varSelectedNom.Category
  - Reason: varSelectedNom.Reason

SECTION B: PM Override (Optional, purple background)
  - Category dropdown:
      Default option: "-- Keep original: " & varSelectedNom.Category & " --"
      Options: Innovation | Team Player | Extra Mile | Customer Success
  - Reason textarea:
      Placeholder: "Add your perspective (optional)..."
  NOTE: Agar PM blank chhodhe to original values use hongi.

SECTION C: Buttons
  - Cancel -> Back()
  - Approve & Forward to Admin ->
      Patch(Nominations, varSelectedNom, {
        Status:     "PMApproved",
        PMCategory: If(drpPMCat.Selected.Value = "default", "", drpPMCat.Selected.Value),
        PMReason:   txtPMReason.Text
      });
      Navigate(scrTeamApprovals)

---

## 11. Screen 7 — Final Approvals (Admin only)

File reference: AdminVerification.jsx

### Section A: Awaiting Final Approval
  Filter(Nominations, Status = "PMApproved")
  Columns: Nominee | Effective Category | Effective Reason | Actions

### Section B: Pending with PMs
  Filter(Nominations, Status = "Pending")
  Columns: Nominee | Category | Reason | Assigned PM/Team | Status

### Section C: All Nominations Overview
  Filter(Nominations, Status <> "PMApproved" && Status <> "Pending")
  Columns: Nominee | Date | Effective Category | Status | Rejection Reason

---

## 12. Screen 8 — Admin Approve Modal

File reference: AdminVerification.jsx (approve modal section)

### Layout — 3 Sections:

SECTION A: Original Submission (Read-only, blue panel)
  - Nominee, Category, Reason from varSelectedNom

SECTION B: PM Override (Read-only display, purple panel)
  If(IsBlank(varSelectedNom.PMCategory) && IsBlank(varSelectedNom.PMReason),
    "PM did not add an override — original values carry forward.",
    "PM Category: " & varSelectedNom.PMCategory &
    " | PM Reason: " & varSelectedNom.PMReason
  )

SECTION C: Admin Override (Optional, green panel)
  - Category dropdown:
      Default: "-- Keep: " & EffectiveCategory & " --"
      EffectiveCategory = If(!IsBlank(PMCategory), PMCategory, Category)
  - Reason textarea:
      Placeholder: "Add your final remarks (optional)..."

SECTION D: Buttons
  - Cancel
  - Final Approve ->
      Patch(Nominations, varSelectedNom, {
        Status:        "Approved",
        AdminCategory: If(drpAdminCat.Selected.Value = "default", "", drpAdminCat.Selected.Value),
        AdminReason:   txtAdminReason.Text
      });
      Navigate(scrFinalApprovals)

---

## 13. Screen 9 — Design Generator (Admin only)

File reference: DesignGeneratorPreview.jsx

### Purpose: Weekly winner announcement cards auto-generate karta hai.

### Filter — Current week approved nominations:
  Filter(
    Nominations,
    Status = "Approved" &&
    Month(SubmittedDate) = Month(Today()) &&
    Year(SubmittedDate)  = Year(Today()) &&
    WeekNum(SubmittedDate) = WeekNum(Today())
  )

### Teams Message Preview (text box):
  "Congratulations to our Sparklers of the week!" &
  Char(10) & Char(10) &
  "This week, we are celebrating:" &
  Concat(varApprovedThisWeek, Char(10) & "- " & NomineeName & " for " & EffectiveCategory) &
  Char(10) & Char(10) &
  "Thank you all!"

### Award Card Gallery:
  Each card:
    - Background image: switch by EffectiveCategory (4 different category images)
    - Category label (top)
    - Nominee name (bold, bottom)
    - Week/Month: "Week " & WeekNum(Today()) & ", " & Text(Today(), "mmmm yyyy")

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

*External Awards Feature Documentation — July 2026*
*React prototype mein implemented, Power Apps migration guide upar hai.*
