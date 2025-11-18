# FutureStack - Architecture Diagrams

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Home   │  │Dashboard │  │  Status  │  │ Calendar │       │
│  │   Page   │  │   Page   │  │  Board   │  │   Page   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Internship│  │Hackathon │  │   Add    │  │  Reports │       │
│  │   List   │  │   List   │  │Opportunity│  │   Page   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ React Router
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYER                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Common    │  │   Dashboard  │  │ Opportunities│         │
│  │  Components  │  │  Components  │  │  Components  │         │
│  │              │  │              │  │              │         │
│  │ • Button     │  │ • StatsCard  │  │ • Form       │         │
│  │ • Card       │  │ • Deadline   │  │              │         │
│  │ • Modal      │  │   Widget     │  │              │         │
│  │ • Navbar     │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Props & State
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              opportunityService                         │    │
│  │                                                         │    │
│  │  • getAll()    → GET /opportunities                    │    │
│  │  • getById()   → GET /opportunities/:id                │    │
│  │  • create()    → POST /opportunities                   │    │
│  │  • update()    → PATCH /opportunities/:id              │    │
│  │  • delete()    → DELETE /opportunities/:id             │    │
│  │                                                         │    │
│  │  Error Handling | Request/Response Transformation      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Axios HTTP Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    REST API Endpoints                   │    │
│  │                                                         │    │
│  │  GET    /opportunities          → List all            │    │
│  │  GET    /opportunities/:id      → Get one             │    │
│  │  POST   /opportunities          → Create              │    │
│  │  PATCH  /opportunities/:id      → Update              │    │
│  │  DELETE /opportunities/:id      → Delete              │    │
│  │                                                         │    │
│  │  Port: 3001 | Content-Type: application/json          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON Server
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                      db.json                            │    │
│  │                                                         │    │
│  │  {                                                      │    │
│  │    "opportunities": [                                   │    │
│  │      {                                                  │    │
│  │        "id": "3913",                                    │    │
│  │        "title": "SDE 1 at Google",                     │    │
│  │        "category": "internship",                       │    │
│  │        "status": "applied",                            │    │
│  │        "deadline": "2025-11-28",                       │    │
│  │        ...                                              │    │
│  │      }                                                  │    │
│  │    ]                                                    │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
│
├── AppContent
│   │
│   ├── Navbar (Conditional - hidden on home page)
│   │   ├── Logo/Brand
│   │   ├── Desktop Navigation
│   │   │   ├── Dashboard Link
│   │   │   ├── Internships Link
│   │   │   ├── Hackathons Link
│   │   │   ├── Status Board Link
│   │   │   ├── Calendar Link
│   │   │   └── Reports Link
│   │   └── Mobile Menu
│   │       └── Mobile Navigation Links
│   │
│   └── Routes
│       │
│       ├── Home
│       │   ├── Hero Section
│       │   ├── Tagline
│       │   └── CTA Button
│       │
│       ├── Dashboard
│       │   ├── Header
│       │   ├── Statistics Cards
│       │   │   ├── Internships Card (StatsCard)
│       │   │   ├── Hackathons Card (StatsCard)
│       │   │   ├── Shortlisted Card (StatsCard)
│       │   │   └── Selected Card (StatsCard)
│       │   ├── Overdue Alert (Card)
│       │   ├── Deadline Widget (DeadlineWidget)
│       │   └── Quick Actions (Card)
│       │       ├── Add New Button
│       │       ├── View Internships Button
│       │       └── View Hackathons Button
│       │
│       ├── InternshipList / HackathonList
│       │   ├── Header
│       │   ├── Search Bar
│       │   ├── Status Filter
│       │   └── Opportunity Cards
│       │       ├── Card
│       │       │   ├── Title
│       │       │   ├── Deadline
│       │       │   ├── Status Badge
│       │       │   └── Action Buttons
│       │       │       ├── Edit Button
│       │       │       └── Delete Button
│       │       └── ...more cards
│       │
│       ├── AddOpportunity / EditOpportunity
│       │   ├── Header
│       │   └── Card
│       │       ├── Section Title
│       │       ├── OpportunityForm
│       │       │   ├── Title Input
│       │       │   ├── Description Textarea
│       │       │   ├── Link Input
│       │       │   ├── Deadline Input
│       │       │   ├── Category Radio Buttons
│       │       │   ├── Status Dropdown
│       │       │   ├── Notes Textarea
│       │       │   └── Submit Button
│       │       └── Cancel Button
│       │
│       ├── StatusBoard
│       │   ├── Header
│       │   └── Status Columns
│       │       ├── Applied Column
│       │       ├── Shortlisted Column
│       │       ├── Interviewed Column
│       │       ├── Selected Column
│       │       └── Rejected Column
│       │           └── Opportunity Cards
│       │               ├── Title
│       │               ├── Deadline
│       │               ├── Status Dropdown
│       │               └── Action Buttons
│       │
│       ├── Calendar
│       │   ├── Header
│       │   ├── Legend (Card)
│       │   ├── Calendar Component (Card)
│       │   │   ├── Month Navigation
│       │   │   ├── Calendar Grid
│       │   │   └── Date Markers
│       │   ├── Summary Statistics
│       │   └── Modal (Conditional)
│       │       ├── Selected Date Opportunities
│       │       └── Close Button
│       │
│       └── Reports
│           ├── Header
│           ├── Export Options (Card)
│           │   ├── Radio Buttons
│           │   │   ├── All Opportunities
│           │   │   ├── Selected Opportunities
│           │   │   └── Summary Only
│           │   └── Download Button
│           ├── Statistics Card
│           └── Preview Section (Card)
│               └── Opportunity Cards
│                   ├── Checkbox (if selected mode)
│                   └── Opportunity Details
│
└── ToastContainer (Global)
```

## Data Flow Diagram

### Create Opportunity Flow

```
User fills form
      │
      ▼
Form validation
      │
      ├─── Invalid ──→ Show errors ──→ User corrects
      │
      ▼ Valid
OpportunityForm.handleSubmit()
      │
      ▼
AddOpportunity.handleSubmit()
      │
      ▼
opportunityService.create(data)
      │
      ▼
axios.post('/opportunities', data)
      │
      ▼
JSON Server processes request
      │
      ▼
Save to db.json
      │
      ▼
Return response with new ID
      │
      ▼
Success toast notification
      │
      ▼
navigate('/dashboard')
      │
      ▼
Dashboard fetches updated data
      │
      ▼
UI updates with new opportunity
```

### Read Opportunities Flow

```
Component mounts (useEffect)
      │
      ▼
setLoading(true)
      │
      ▼
opportunityService.getAll()
      │
      ▼
axios.get('/opportunities')
      │
      ▼
JSON Server reads db.json
      │
      ▼
Return array of opportunities
      │
      ▼
setOpportunities(data)
      │
      ▼
setLoading(false)
      │
      ▼
Component renders with data
      │
      ▼
Apply filters/search (if any)
      │
      ▼
Display filtered opportunities
```

### Update Opportunity Flow

```
User clicks "Edit"
      │
      ▼
navigate('/edit/:id')
      │
      ▼
EditOpportunity component mounts
      │
      ▼
Fetch opportunity by ID
      │
      ▼
Pre-fill form with data
      │
      ▼
User modifies fields
      │
      ▼
User clicks "Update"
      │
      ▼
Form validation
      │
      ├─── Invalid ──→ Show errors
      │
      ▼ Valid
opportunityService.update(id, data)
      │
      ▼
axios.patch('/opportunities/:id', data)
      │
      ▼
JSON Server updates db.json
      │
      ▼
Return updated opportunity
      │
      ▼
Success toast notification
      │
      ▼
navigate(-1) // Go back
      │
      ▼
Previous page refreshes data
```

### Delete Opportunity Flow

```
User clicks "Delete"
      │
      ▼
Show confirmation modal
      │
      ├─── Cancel ──→ Close modal
      │
      ▼ Confirm
opportunityService.delete(id)
      │
      ▼
axios.delete('/opportunities/:id')
      │
      ▼
JSON Server removes from db.json
      │
      ▼
Return success response
      │
      ▼
Update local state (remove from array)
      │
      ▼
Success toast notification
      │
      ▼
UI updates (card disappears)
      │
      ▼
Statistics recalculate
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Component State                       │
│                                                          │
│  const [opportunities, setOpportunities] = useState([]); │
│  const [loading, setLoading] = useState(true);          │
│  const [error, setError] = useState(null);              │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │ useEffect
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Side Effects                           │
│                                                          │
│  useEffect(() => {                                       │
│    fetchOpportunities();                                 │
│  }, []);                                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │ API Call
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                           │
│                                                          │
│  const data = await opportunityService.getAll();        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Response
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  State Update                            │
│                                                          │
│  setOpportunities(data);                                 │
│  setLoading(false);                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Re-render
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   UI Update                              │
│                                                          │
│  {opportunities.map(opp => (                             │
│    <OpportunityCard key={opp.id} data={opp} />          │
│  ))}                                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Routing Architecture

```
Browser URL
     │
     ▼
React Router
     │
     ├─── / ──────────────────────→ Home
     │
     ├─── /dashboard ─────────────→ Dashboard
     │
     ├─── /internships ───────────→ InternshipList
     │
     ├─── /hackathons ────────────→ HackathonList
     │
     ├─── /add ───────────────────→ AddOpportunity
     │
     ├─── /edit/:id ──────────────→ EditOpportunity
     │                                    │
     │                                    ├─ useParams() → get ID
     │                                    └─ Fetch opportunity by ID
     │
     ├─── /status-board ──────────→ StatusBoard
     │
     ├─── /calendar ──────────────→ Calendar
     │
     └─── /reports ───────────────→ Reports
```

## Error Handling Flow

```
API Request
     │
     ▼
Try Block
     │
     ├─── Success ──→ Process response ──→ Update state ──→ Success toast
     │
     └─── Error
            │
            ▼
     Catch Block
            │
            ▼
     handleApiError()
            │
            ├─── error.response ──→ Server error ──→ Extract message
            │
            ├─── error.request ──→ Network error ──→ "Check connection"
            │
            └─── Other ──→ Generic error ──→ error.message
                   │
                   ▼
            Error toast notification
                   │
                   ▼
            Log to console
                   │
                   ▼
            (Optional) Send to error tracking service
```

---

**Last Updated**: November 17, 2025
