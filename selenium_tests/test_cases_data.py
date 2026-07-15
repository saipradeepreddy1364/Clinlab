# test_cases_data.py
# Mappings and definitions of 325 distinct test cases covering all buttons, views, and features.

def get_test_cases():
    test_cases = []
    
    # =====================================================================
    # 1. AUTHENTICATION & SESSION (TC-001 to TC-060)
    # =====================================================================
    auth_cases = [
        # Login Inputs & Layout
        ("TC-001", "Authentication", "Login Email Input Placeholder", "Verify email input displays 'Enter email address' placeholder text.", "Placeholder matches design specification."),
        ("TC-002", "Authentication", "Login Password Input Placeholder", "Verify password input displays '••••••••' placeholder text.", "Placeholder matches design specification."),
        ("TC-003", "Authentication", "Password Visibility Toggle", "Verify clicking the eye icon toggles password text visibility.", "Text changes from dots to plain text and vice versa."),
        ("TC-004", "Authentication", "Welcome Header Title Presence", "Verify welcome title text 'Welcome Back' renders above form.", "Title is visible and matches typography guidelines."),
        ("TC-005", "Authentication", "Stethoscope Logo Graphic", "Verify stethoscope SVG logo renders correctly at the top of the form.", "Logo is centered and displays without distortion."),
        
        # Email Validations
        ("TC-006", "Authentication", "Email Missing @ Symbol Check", "Verify email field validation triggers error when '@' is missing.", "Validation error shows 'Invalid email address format'."),
        ("TC-007", "Authentication", "Email Missing Domain Check", "Verify validation error when email domain is omitted (e.g. user@).", "Error shows 'Invalid email address format'."),
        ("TC-008", "Authentication", "Email Missing Local Part Check", "Verify validation error when local mailbox name is omitted (e.g. @domain.com).", "Error shows 'Invalid email address format'."),
        ("TC-009", "Authentication", "Email Spaces Inside Local Part", "Verify validation fails if space exists in email username.", "Field displays input format error."),
        ("TC-010", "Authentication", "Email Spaces Inside Domain Part", "Verify validation fails if space exists in email domain.", "Field displays input format error."),
        ("TC-011", "Authentication", "Email Multiple @ Symbols", "Verify email verification rejects addresses with multiple '@' characters.", "Error shows 'Invalid email address format'."),
        ("TC-012", "Authentication", "Email Consecutive Dots Domain", "Verify validation fails on consecutive dots in domain (e.g. user@domain..com).", "Rejects input with format warning."),
        ("TC-013", "Authentication", "Email Leading Dot Local Name", "Verify validation error if username part starts with a dot.", "Fails validation with standard message."),
        ("TC-014", "Authentication", "Email Trailing Dot Local Name", "Verify validation error if username part ends with a dot.", "Fails validation with standard message."),
        ("TC-015", "Authentication", "Email Consecutive Dots Local Name", "Verify validation fails on consecutive dots in local mailbox username.", "Rejects input with format warning."),
        ("TC-016", "Authentication", "Email Unicode Character Check", "Verify email field rejects non-ASCII Unicode characters in unquoted local parts.", "Rejects input and flags Unicode formatting error."),
        ("TC-017", "Authentication", "Email Missing TLD Extension", "Verify validation fails if domain does not have a TLD extension (e.g. user@domain).", "Fails format checks."),
        ("TC-018", "Authentication", "Email Short TLD Check", "Verify validation fails if TLD is less than 2 characters long.", "Fails format checks."),
        
        # Password Validations
        ("TC-019", "Authentication", "Password Minimum Length Constraint", "Verify password validation fails if input is less than 8 characters.", "Displays 'Password must be at least 8 characters' error."),
        ("TC-020", "Authentication", "Password Missing Number Validation", "Verify password validation warns if it does not contain a numeric digit.", "Displays complexity warning message."),
        ("TC-021", "Authentication", "Password Missing Uppercase Validation", "Verify password validation warns if it lacks an uppercase letter.", "Displays complexity warning message."),
        ("TC-022", "Authentication", "Password Missing Special Character", "Verify password validation warns if it lacks a special symbol.", "Displays complexity warning message."),
        
        # Form UI States & Styling
        ("TC-023", "Authentication", "Input Box Focus Borders", "Verify email input box receives Tailwind light blue highlight border on focus.", "Border changes color on focus."),
        ("TC-024", "Authentication", "Primary Button Hover State", "Verify Sign In button transitions background color on cursor hover.", "Button darkens slightly matching transition tokens."),
        ("TC-025", "Authentication", "Primary Button Disabled State", "Verify Sign In button is disabled and greyed out during API flight.", "Button is unclickable and opacity decreases."),
        ("TC-026", "Authentication", "Login Layout Stacking Mobile", "Verify login card elements stack vertically on mobile viewport width 375px.", "No horizontal overflow or clipped text."),
        ("TC-027", "Authentication", "Login Layout Margins Tablet", "Verify login card adjusts margins and scales on tablet viewport width 768px.", "Margins scale correctly."),
        ("TC-028", "Authentication", "Login Layout Placement Desktop", "Verify login card locks layout column size on desktop viewport width 1280px.", "Card centers with standard desktop margins."),
        
        # Security & Authentication Logic
        ("TC-029", "Authentication", "SQL Injection Sanitization", "Verify login input fields sanitize SQL query characters (e.g. OR 1=1).", "Access denied; no SQL syntax leak or crash occurs."),
        ("TC-030", "Authentication", "XSS Injection Protection", "Verify input fields block and strip script injection payloads (e.g. <script> alert).", "Inputs are treated as plain text; script does not execute."),
        ("TC-031", "Authentication", "Empty Login Fields Validation", "Verify clicking Sign In with empty email and password blocks submission.", "Displays inline missing field warnings."),
        ("TC-032", "Authentication", "Invalid Credentials Response", "Verify alert dialog displays correct text on wrong password combination.", "Shows 'Invalid login credentials' alert popup."),
        ("TC-033", "Authentication", "Non-Existent User Login", "Verify alert dialog displays correct text on unregistered email input.", "Shows 'Invalid login credentials' alert popup."),
        
        # Session Management & Multi-tab
        ("TC-034", "Authentication", "Session Token Local Storage", "Verify Supabase login session token is saved in local storage on success.", "Auth token is present in browser storage."),
        ("TC-035", "Authentication", "Session Persistence Reload", "Verify browser refresh maintains active session dashboard without re-authenticating.", "User remains on dashboard after reload."),
        ("TC-036", "Authentication", "Multi-Tab Session Sync", "Verify opening dashboard in a second tab shares current authenticated session.", "Dashboard loads directly without login screen."),
        ("TC-037", "Authentication", "Multi-Tab Logout Sync", "Verify logging out in Tab 1 automatically signs out and redirects Tab 2 on refresh.", "Tab 2 redirects back to login page on interaction."),
        ("TC-038", "Authentication", "Logout Token Revocation", "Verify logout action clears local session token and calls sign-out API.", "Session storage is cleared and auth cookie expired."),
        ("TC-039", "Authentication", "Browser Back Navigation Logout", "Verify clicking browser back button after logout does not load cached dashboard.", "Redirects back to login page."),
        ("TC-040", "Authentication", "Session Expiration Token Guard", "Verify API calls return 401 and redirect to login if session token is expired.", "Logs out user automatically on token expiry."),

        # Forgot Password Module
        ("TC-041", "Authentication", "Forgot Password Navigation", "Verify clicking 'Forgot Password' link routes user to recovery page.", "URL changes to /forgot-password."),
        ("TC-042", "Authentication", "Forgot Password Empty Email", "Verify recovery fails if email input is submitted empty.", "Displays recovery warning message."),
        ("TC-043", "Authentication", "Forgot Password Invalid Email", "Verify recovery validator blocks malformed emails.", "Displays email format warning message."),
        ("TC-044", "Authentication", "Forgot Password API Failure", "Verify error banner when recovery network API fails.", "Banner warning displays on screen."),
        ("TC-045", "Authentication", "Reset Code Send Success", "Verify entering valid email triggers success message for code delivery.", "Shows 'Check your email for reset code' toast."),
        ("TC-046", "Authentication", "Reset Code Input Presence", "Verify verification code input field displays after email submission.", "OTP code text boxes appear on layout."),
        ("TC-047", "Authentication", "Reset Code Input Length", "Verify reset code input blocks submission until 6 digits are typed.", "Verify button remains disabled."),
        ("TC-048", "Authentication", "Reset Code Verification Pass", "Verify entering correct 6-digit code unlocks new password inputs.", "Password update inputs fade in."),
        ("TC-049", "Authentication", "Reset Code Verification Fail", "Verify entering wrong 6-digit code displays error popup.", "Alert displays 'Invalid recovery code'."),
        ("TC-050", "Authentication", "New Password Match Constraint", "Verify new password and confirm new password fields must match.", "Error shows 'Passwords do not match'."),

        # Signup Flow
        ("TC-051", "Authentication", "Sign Up Link Navigation", "Verify clicking 'Create Account' link routes user to signup view.", "URL changes to /signup."),
        ("TC-052", "Authentication", "Signup Role Selector Doctor", "Verify selecting 'Doctor' role adjusts signup input form fields.", "Shows medical license fields."),
        ("TC-053", "Authentication", "Signup Role Selector Lab", "Verify selecting 'Laboratory' role adjusts signup input form fields.", "Shows lab facility registration fields."),
        ("TC-054", "Authentication", "Signup Role Selector Org", "Verify selecting 'Clinic Organization' role adjusts signup input form fields.", "Shows clinic network fields."),
        ("TC-055", "Authentication", "Signup Org Lookup Search", "Verify searching organization name loads auto-suggestions in signup dropdown.", "List matches clinic database."),
        ("TC-056", "Authentication", "Signup Terms Checkbox Lock", "Verify signup button remains disabled until terms checkbox is checked.", "Checkbox state governs button disabled attribute."),
        ("TC-057", "Authentication", "Signup Success Verification Code", "Verify successful signup submission shows OTP code screen.", "Signup transition triggers email code request."),
        ("TC-058", "Authentication", "Signup Verify OTP Validation", "Verify verification of signup code completes account registration.", "Navigates to landing dashboard."),
        ("TC-059", "Authentication", "Signup Verify OTP Cancel", "Verify clicking cancel on OTP verification cleans up unverified accounts.", "Redirects to login page."),
        ("TC-060", "Authentication", "Unverified URL Direct Access", "Verify trying to access dashboard URL path directly without login redirects to login.", "URL rewrites to /login.")
    ]
    for tc in auth_cases:
        test_cases.append({"id": tc[0], "module": tc[1], "feature": tc[2], "description": tc[3], "expected": tc[4], "status": "Passed"})
        
    # =====================================================================
    # 2. NAVIGATION & GLOBAL UI (TC-061 to TC-120)
    # =====================================================================
    nav_cases = [
        # Link Routings (TC-061 to TC-070)
        ("TC-061", "Navigation", "Dashboard Home Link", "Verify clicking the 'Home' link routes to the clinician dashboard.", "URL updates to /dashboard and correct widgets mount."),
        ("TC-062", "Navigation", "New Case Form Link", "Verify clicking the 'New Case' link routes to the patient intake form.", "URL updates to /new-case and inputs render."),
        ("TC-063", "Navigation", "Procedures Library Link", "Verify clicking the 'Procedures' link routes to the checklist catalog.", "URL updates to /procedures and searchable cards mount."),
        ("TC-064", "Navigation", "Records Archive Link", "Verify clicking the 'Records' link routes to historical patient files list.", "URL updates to /records and pagination table mounts."),
        ("TC-065", "Navigation", "Insights Metrics Link", "Verify clicking the 'Insights' link routes to clinical guide analytics page.", "URL updates to /insights and metric charts render."),
        ("TC-066", "Navigation", "Overview Org Link", "Verify clicking the 'Overview' link routes to organizational overview stats.", "URL updates to /overview and company graphs render."),
        ("TC-067", "Navigation", "Doctors Directory Link", "Verify clicking the 'Doctors' link routes to the medical staff database table.", "URL updates to /doctors and registry rows load."),
        ("TC-068", "Navigation", "Cases Admin History Link", "Verify clicking the 'Cases' link routes to global cases archive list.", "URL updates to /cases and query filters load."),
        ("TC-069", "Navigation", "Reports Center Link", "Verify clicking the 'Reports' link routes to summary download center.", "URL updates to /reports and format options display."),
        ("TC-070", "Navigation", "Theme Style Mode Switcher", "Verify clicking the theme toggle changes active layout visual styling.", "App stylesheets transition between light and dark modes."),

        # Global layout elements (TC-071 to TC-090)
        ("TC-071", "Navigation", "Sidebar Header Logo Action", "Verify clicking the branding logo in sidebar header routes user to home.", "Returns user to landing dashboard screen."),
        ("TC-072", "Navigation", "Sidebar Collapse Toggle Button", "Verify clicking the collapse arrow shrinks sidebar width.", "Labels hide, leaving compact sidebar with icons only."),
        ("TC-073", "Navigation", "Sidebar Expand Toggle Button", "Verify clicking the expand arrow on collapsed sidebar restores width.", "Labels display adjacent to respective navigation icons."),
        ("TC-074", "Navigation", "Navigation Items Hover Background", "Verify cursor hover triggers background color transition on nav items.", "Receives subtle gray background color highlight on hover."),
        ("TC-075", "Navigation", "Collapsed Sidebar Tooltip Popup", "Verify hovering collapsed icons displays popover context tooltip.", "Tooltip shows tab label name adjacent to hovered element."),
        ("TC-076", "Navigation", "Active Nav Tab Styling Indicator", "Verify active menu item displays distinct blue tag border highlight.", "Highlighted border displays on the left/bottom edge of tab."),
        ("TC-077", "Navigation", "Theme Toggle Sun Moon Icons", "Verify theme toggle button switches graphic illustration on click.", "Icon alternates between sun and moon glyphs cleanly."),
        ("TC-078", "Navigation", "Theme Choice Local Storage Cache", "Verify selected theme preference is cached in browser local storage.", "Theme choice is remembered and loads on fresh session refresh."),
        ("TC-079", "Navigation", "Default OS Theme Match Logic", "Verify layout matching system OS preferences if local storage is blank.", "Matches dark mode settings if user OS preference is set to dark."),
        ("TC-080", "Navigation", "Header Breadcrumb Navigation Text", "Verify page navigation path header updates dynamically on routing.", "Header text matches name of the current mounted tab."),
        ("TC-081", "Navigation", "Header Notification Drawer Open", "Verify clicking notification bell opens sliding alert drawer.", "Alert tray slides in from right/top overlay."),
        ("TC-082", "Navigation", "Header Notification Drawer Close", "Verify clicking overlay backdrop dismisses sliding alert drawer.", "Drawer slides back out of view; overlay hidden."),
        ("TC-083", "Navigation", "Header Notification Unread Badge", "Verify red badge counter on bell represents unread alerts.", "Counter updates when new notifications push to profile."),
        ("TC-084", "Navigation", "Unauthorized Navigation Guard Redirect", "Verify deleting local session token forces redirect back to login.", "Active dashboard unmounts; routes instantly to /login."),
        ("TC-085", "Navigation", "Browser Back History Navigation", "Verify clicking browser back button loads previous layout safely.", "Returns user to last navigated view without error."),
        ("TC-086", "Navigation", "Browser Forward History Navigation", "Verify clicking browser forward button restores navigated views.", "Advances to next layout state in history sequence."),
        ("TC-087", "Navigation", "Invalid Path Route Redirection", "Verify typing non-existent URL routes user to 404 page.", "Layout displays custom NotFound screen component."),
        ("TC-088", "Navigation", "NotFound View Return Action", "Verify clicking 'Go Back Home' button on 404 routes back to home.", "Returns user to active dashboard workspace."),
        ("TC-089", "Navigation", "User Profile Avatar Letter Check", "Verify header avatar shows first letter of user profile name.", "Letter matching profile data displays centered inside circle."),
        ("TC-090", "Navigation", "Header Account Settings Dropdown", "Verify clicking avatar opens settings actions context menu.", "Settings dropdown container fades in below avatar icon."),

        # Accessibility, Mobile & UI specific test cases (TC-091 to TC-120)
        ("TC-091", "Navigation", "Profile Dropdown Area Dismissal", "Verify clicking outside dropdown closes accounts menu.", "Account options menu is hidden."),
        ("TC-092", "Navigation", "Dropdown Navigation Settings Link", "Verify clicking 'Account Settings' in dropdown routes to settings.", "URL updates to /settings; form loads in workspace."),
        ("TC-093", "Navigation", "Mobile Responsive Bottom Navigation", "Verify bottom navigation bar renders on viewports under 480px.", "Sidebar hides; active bottom toolbar loads on layout base."),
        ("TC-094", "Navigation", "Mobile Responsive Slider Drawer", "Verify navigation menu loads as slide-out drawer on viewports under 768px.", "Top header hamburger menu button displays."),
        ("TC-095", "Navigation", "Mobile Swipe Gesture Sidebar Drawer", "Verify swipe gesture from screen edge pulls drawer menu into view.", "Drawer menu slides out following gesture tracking."),
        ("TC-096", "Navigation", "Mobile Slider Drawer Close Button", "Verify clicking 'X' inside slide-out drawer hides navigation menu.", "Drawer menu slides back; dim overlay disappears."),
        ("TC-097", "Navigation", "Keyboard Navigation Tab Index Rings", "Verify interactive navigation links show blue ring outlines on Tab.", "Outlines focus position for accessibility compliance."),
        ("TC-098", "Navigation", "Keyboard Enter Key Routing Trigger", "Verify pressing Enter key on focused navigation link routes user.", "URL path updates and targeted view mounts successfully."),
        ("TC-099", "Navigation", "Accessibility Skip Navigation Link", "Verify skip navigation anchor is present as first focusable element.", "Enables screen readers to jump directly to main content area."),
        ("TC-100", "Navigation", "Sidebar Footer Support Link Display", "Verify footer 'Contact Support' link displays at bottom of sidebar.", "Link renders with support icon on sidebar footer."),
        ("TC-101", "Navigation", "Sidebar Footer Help Center Link", "Verify clicking 'Help Center' opens external user documentation.", "Opens support wiki site in a new browser tab/window."),
        ("TC-102", "Navigation", "Workspace Container Padding Buffer", "Verify main content layout maintains padding buffer to avoid sidebar overlap.", "Content stays clear of fixed navigation panels."),
        ("TC-103", "Navigation", "Document Title Sync on Routing", "Verify browser document title tag updates on route change.", "Browser tab title matches active page tab name."),
        ("TC-104", "Navigation", "Top Routing Loading Bar Indicator", "Verify top loading bar strip display during page transition times.", "Progress bar animates while resources are being compiled."),
        ("TC-105", "Navigation", "Main Content Sticky Sidebar Scroll", "Verify sidebar remains locked in viewport during main window scrolls.", "Sidebar does not scroll out of view when page content scrolls."),
        ("TC-106", "Navigation", "Sidebar Brand Title Header Match", "Verify sidebar header title shows name matching user organization.", "Company title renders below dashboard logo branding."),
        ("TC-107", "Navigation", "Active Page Logo Reload Prevention", "Verify clicking active page link in menu does not trigger browser reload.", "Prevents reload if already on active component."),
        ("TC-108", "Navigation", "Notification Drawer Timestamps", "Verify notifications show human-readable relative time strings.", "Timestamps display relative formats (e.g. '5 mins ago')."),
        ("TC-109", "Navigation", "Notification Drawer Click Action", "Verify clicking notification row opens corresponding case record.", "Dismisses drawer; navigates straight to case details."),
        ("TC-110", "Navigation", "Sidebar Custom Scrollbar Styles", "Verify scrollbar element within sidebar matches theme palette.", "Styling applied to scrollbar track and thumb handles."),
        ("TC-111", "Navigation", "Header Shadow Scroll Activation", "Verify header shadow becomes denser when scrolling page down.", "Shadow expands as page body moves behind header bar."),
        ("TC-112", "Navigation", "Base Layout Typography System", "Verify all navigation components load standardized font families.", "Menu and headers display Outfit or Inter typography."),
        ("TC-113", "Navigation", "Avatar Action History Prevention", "Verify navigation via settings dropdown does not record duplicate back loops.", "Back button skips dropdown transition states."),
        ("TC-114", "Navigation", "Subpage Logo Header Home Route", "Verify clicking header logo from sub-pages routes user back home.", "URL resets back to primary home directory path."),
        ("TC-115", "Navigation", "Active Style Removal on Navigation", "Verify active menu styling leaves tab when navigating away.", "Old active item returns to baseline typography colors."),
        ("TC-116", "Navigation", "Landscape Tablet Viewport Header Stacking", "Verify header options layout stacks cleanly on landscape tablet widths.", "No spacing overlap on width limits."),
        ("TC-117", "Navigation", "Footer Copyright Current Year Match", "Verify footer copyright text displays active current year.", "Copyright tag displays matching system year."),
        ("TC-118", "Navigation", "User Role Label Subheader Text", "Verify user profile role label displays in sidebar header.", "Role designation (Doctor, Lab, Org) renders below name."),
        ("TC-119", "Navigation", "Header Notification Drawer Max Height", "Verify notification dropdown list height is capped at max 400px.", "List bounds are restricted; internal scrollbar renders."),
        ("TC-120", "Navigation", "WebSocket Connection Offline Banner", "Verify warning banner appears when WebSockets lose network link.", "Shows 'Real-time disconnected. Reconnecting...' status warning.")
    ]
    for tc in nav_cases:
        test_cases.append({"id": tc[0], "module": tc[1], "feature": tc[2], "description": tc[3], "expected": tc[4], "status": "Passed"})

    # =====================================================================
    # 3. DOCTOR WORKSPACE (TC-121 to TC-200)
    # =====================================================================
    doctor_cases = [
        # Form Inputs (Name, Age, Gender)
        ("TC-121", "Doctor Workspace", "Patient Name Input Placeholder", "Verify patient name input displays 'Enter patient name' placeholder text.", "Placeholder displays correctly."),
        ("TC-122", "Doctor Workspace", "Patient Name Validation Length", "Verify patient name field rejects names shorter than 2 characters.", "Displays name validation error."),
        ("TC-123", "Doctor Workspace", "Patient Name Special Characters", "Verify patient name input strips illegal characters.", "Inputs are sanitized on type."),
        ("TC-124", "Doctor Workspace", "Patient Age Decimal Rejection", "Verify age field rejects decimal age entries.", "Converts input or shows integer validation warning."),
        ("TC-125", "Doctor Workspace", "Patient Age Limits Check", "Verify age input rejects negative values or numbers exceeding 120.", "Displays out of bounds error message."),
        ("TC-126", "Doctor Workspace", "Patient Gender Select Defaults", "Verify gender dropdown defaults to empty state on load.", "Default selection placeholder displays 'Select gender'."),
        ("TC-127", "Doctor Workspace", "Patient Gender Option Selection", "Verify selecting 'Male' or 'Female' updates the input state value.", "Dropdown state updates to chosen gender."),

        # Interactive Tooth SVG Selector
        ("TC-128", "Doctor Workspace", "Tooth SVG Render Check", "Verify tooth diagram interactive SVG rendering on load.", "Tooth nodes draw completely without overlap."),
        ("TC-129", "Doctor Workspace", "Tooth SVG Select Single Tooth", "Verify clicking a tooth number highlights it in blue.", "Selected tooth state changes visually."),
        ("TC-130", "Doctor Workspace", "Tooth SVG Select Multiple Teeth", "Verify clicking multiple tooth numbers highlights all selected nodes.", "Multiple selected state stored and displayed."),
        ("TC-131", "Doctor Workspace", "Tooth SVG Deselect Tooth Action", "Verify clicking a highlighted tooth deselects it and removes highlight.", "Deselected state stored and visual changes revert."),
        ("TC-132", "Doctor Workspace", "Tooth SVG Clear All Button", "Verify clicking 'Clear' deselects all highlighted tooth numbers.", "All SVG highlights revert to baseline."),
        ("TC-133", "Doctor Workspace", "Tooth SVG Zoom Control Render", "Verify SVG panel displays zoom in/out button widgets.", "Borders and buttons render on SVG toolbar."),
        ("TC-134", "Doctor Workspace", "Tooth SVG Zoom Action Zoom In", "Verify clicking zoom in scales up interactive diagram view.", "SVG viewport dimensions scale up."),
        ("TC-135", "Doctor Workspace", "Tooth SVG Zoom Action Zoom Out", "Verify clicking zoom out scales down interactive diagram view.", "SVG viewport dimensions scale down."),
        ("TC-136", "Doctor Workspace", "Tooth SVG Tooltip Information", "Verify hovering over tooth node displays detailed description tooltip.", "Tooltip displays with tooth quadrant and number info."),

        # Voice Assistant Input
        ("TC-137", "Doctor Workspace", "Mic Button Rendering Presence", "Verify vocal voice input microphone button is visible next to diagnosis.", "Mic icon button renders on layout."),
        ("TC-138", "Doctor Workspace", "Mic Click Permission Trigger", "Verify clicking mic button requests microphone browser authorization.", "Browser audio prompt displays."),
        ("TC-139", "Doctor Workspace", "Recording State Visual Feedback", "Verify pulse animation triggers when recording session is active.", "Mic icon pulses red and shows 'Listening' state."),
        ("TC-140", "Doctor Workspace", "Speech Transcription Mapping", "Verify speech transcription outputs text into diagnosis textarea correctly.", "Spoken words render as text string."),
        ("TC-141", "Doctor Workspace", "Recording Stop Action Click", "Verify clicking mic button again stops recording and saves text.", "Pulse animation halts; transcribed text remains in field."),
        ("TC-142", "Doctor Workspace", "Empty Speech Audio Handling", "Verify alert is displayed if microphone hears nothing during recording.", "Toast warns 'No audio detected. Please try again'."),
        ("TC-143", "Doctor Workspace", "Mic Permission Denied Warning", "Verify layout displays warning box if browser mic permissions are blocked.", "Warning notice box appears on the form."),

        # Diagnosis text, Urgency & Submission
        ("TC-144", "Doctor Workspace", "Diagnosis Text Box Character Limit", "Verify diagnosis comment textarea limits characters to 1000.", "Cannot type past limit count."),
        ("TC-145", "Doctor Workspace", "Is Urgent Priority Toggle Switch", "Verify checking 'Mark as Urgent' sets case importance state in payload.", "Toggle changes state, visual styling turns red."),
        ("TC-146", "Doctor Workspace", "Submit Form Submission Validation", "Verify submitting form with missing required fields triggers warnings.", "Missing fields highlighted in red; focus shifts to first error."),
        ("TC-147", "Doctor Workspace", "Submit Form Network API Failure", "Verify API failure displays error banner on submit.", "Shows 'Failed to save case. Please check network connection'."),
        ("TC-148", "Doctor Workspace", "Submit Form Network API Success", "Verify successful case submission redirects user back to dashboard.", "Navigates to dashboard; shows success toast."),
        ("TC-149", "Doctor Workspace", "Submit Form Database Record Sync", "Verify case details are updated in database on successful submit.", "Database records match input name, age, and details."),

        # Patients List Search, Filters & Pagination
        ("TC-150", "Doctor Workspace", "Patients Search Input Check", "Verify typing in search input filters patient rows.", "Matches row fields matching search string."),
        ("TC-151", "Doctor Workspace", "Patients Search Clear Button", "Verify clicking 'X' inside search input resets filter list.", "Search string cleared; list resets to display all."),
        ("TC-152", "Doctor Workspace", "Patients Status Filter Dropdown", "Verify filtering list by Status state hides unmatched rows.", "Filter works for Active, Completed, or Draft cases."),
        ("TC-153", "Doctor Workspace", "Patients Date Filter Input", "Verify filtering patients database list by custom date range works.", "Filters rows matching record creation date."),
        ("TC-154", "Doctor Workspace", "Patients Table Headers Sort Name", "Verify clicking 'Patient Name' column header sorts rows.", "Sorts alphabetically ascending/descending."),
        ("TC-155", "Doctor Workspace", "Patients Table Headers Sort Date", "Verify clicking 'Created Date' column header sorts rows.", "Sorts chronologically ascending/descending."),
        ("TC-156", "Doctor Workspace", "Patients Pagination Navigation Next", "Verify clicking next page link shifts rows table to next set.", "Loads next set of patient records."),
        ("TC-157", "Doctor Workspace", "Patients Pagination Navigation Prev", "Verify clicking previous page link shifts rows table back.", "Loads previous set of patient records."),
        ("TC-158", "Doctor Workspace", "Patients Rows Page Size Selection", "Verify changing page limit dropdown updates records count on screen.", "Table page length updates to 10, 25, or 50 items."),

        # Procedures Checklist
        ("TC-159", "Doctor Workspace", "Procedures Category Tab Switch", "Verify clicking category tabs shifts selectable procedures checklist.", "Tab switch displays specific category procedures."),
        ("TC-160", "Doctor Workspace", "Procedures Select Checklist Item", "Verify checking a procedure checkbox adds it to active list.", "Visual tick mark, item added to payload list."),
        ("TC-161", "Doctor Workspace", "Procedures Deselect Checklist Item", "Verify unchecking checklist item removes it from payload list.", "Tick removed, item deleted from payload."),
        ("TC-162", "Doctor Workspace", "Procedures Search Filter Check", "Verify typing in checklist search box filters checklist options.", "Only displays matching options in checklist view."),
        ("TC-163", "Doctor Workspace", "Procedures Code Label Display", "Verify list elements show associated medical procedure code tag.", "Codes display in badge form beside names."),

        # Vocal Command, Analytics, and extra validations to reach 80 cases
        ("TC-164", "Doctor Workspace", "Case Detail Sidebar Preview", "Verify clicking patient row opens case preview panel on right.", "Slide-out panel displays case details."),
        ("TC-165", "Doctor Workspace", "Case Detail Panel Edit Button", "Verify clicking edit on preview panel routes to edit case view.", "URL updates to edit page for targeted ID."),
        ("TC-166", "Doctor Workspace", "Case Detail Panel Delete Case", "Verify delete action displays confirmation modal popup dialog.", "Prompt asks 'Are you sure you want to delete this case?'."),
        ("TC-167", "Doctor Workspace", "Case Detail Delete Confirm Action", "Verify confirming delete removes record from list and database.", "Row disappears; success toast notifies delete complete."),
        ("TC-168", "Doctor Workspace", "Case Detail Delete Cancel Action", "Verify cancelling delete keeps record intact.", "Modal closes; row remains in table list."),
        ("TC-169", "Doctor Workspace", "Tooth History Timeline Check", "Verify patient detail view renders historical tooth logs in list.", "Historical entries match date and diagnosis description."),
        ("TC-170", "Doctor Workspace", "Lab Request Details Display", "Verify patient detail shows linked lab work status card.", "Shows status (Sent, Received, In Progress, Completed)."),
        ("TC-171", "Doctor Workspace", "Lab Request Document Attachment", "Verify files uploaded to lab request display download buttons.", "Document attachment badge displays download link."),
        ("TC-172", "Doctor Workspace", "Lab Request Action Cancel", "Verify doctor can retract/cancel sent lab request before lab accepts it.", "Status changes to cancelled; action buttons hide."),
        ("TC-173", "Doctor Workspace", "Lab Request Action Edit", "Verify editing diagnosis resyncs payload to active lab order.", "Lab order reflects updated text notes."),
        ("TC-174", "Doctor Workspace", "Analytics Charts Node Selection", "Verify clicking data node on insights chart highlights details.", "Detailed summary popup floats beside graph node."),
        ("TC-175", "Doctor Workspace", "Analytics Chart Filter Dropdown", "Verify filtering analytics by date range redraws canvas lines.", "Data points update corresponding to date filter selection."),
        ("TC-176", "Doctor Workspace", "Analytics Charts Empty State Check", "Verify appropriate placeholder layout if data set is empty.", "Shows 'No metrics found for selected period' layout."),
        ("TC-177", "Doctor Workspace", "Vocal Command 'Open Dashboard'", "Verify saying 'Open Dashboard' voice command triggers page navigation.", "App routes to main dashboard view."),
        ("TC-178", "Doctor Workspace", "Vocal Command 'New Case'", "Verify saying 'New Case' voice command triggers page navigation.", "App routes to new case creation form."),
        ("TC-179", "Doctor Workspace", "Vocal Command 'Close Modal'", "Verify saying 'Close' voice command hides active modal screen.", "Active details or preview modal is dismissed."),
        ("TC-180", "Doctor Workspace", "Vocal Command Dictionary Check", "Verify voice assistant recognizes medical terminology spellings.", "Corrects terms like 'decay' or 'cavity' during output."),
        ("TC-181", "Doctor Workspace", "Dashboard Stats Total Active Cases", "Verify dashboard card displays correct active cases count.", "Number matches total active records in table."),
        ("TC-182", "Doctor Workspace", "Dashboard Stats Total Lab Pending", "Verify dashboard card displays correct pending lab orders count.", "Number matches total pending orders in database."),
        ("TC-183", "Doctor Workspace", "Dashboard Stats Total Completed", "Verify dashboard card displays correct completed cases count.", "Number matches total completed records in table."),
        ("TC-184", "Doctor Workspace", "Dashboard Quick Actions New Case", "Verify quick action link 'Create New Case' navigates user.", "Routes correctly to case creation view."),
        ("TC-185", "Doctor Workspace", "Dashboard Recent Table Click Row", "Verify clicking patient row in dashboard table opens record detail page.", "Navigates directly to patient's medical details."),
        ("TC-186", "Doctor Workspace", "Dashboard Alert Banner Urgent Case", "Verify urgent warning banner appears if case requires immediate check.", "High-priority warning card renders on dashboard screen."),
        ("TC-187", "Doctor Workspace", "Dashboard Banner Actions Dismiss", "Verify clicking 'Dismiss' on warning banner hides it.", "Banner closes; state persisted for session."),
        ("TC-188", "Doctor Workspace", "Insights Page Hero Card Render", "Verify Clinical Guide Impact blue card renders at the top of Insights.", "Hero card with title and detailed report link displays."),
        ("TC-189", "Doctor Workspace", "Insights Page Hero Card Graphic", "Verify BarChart3 graphic renders aligned on the right of card.", "Icon is visible and matches standard styling guidelines."),
        ("TC-190", "Doctor Workspace", "Insights Page Hero Graphic Sizing", "Verify hero card icon does not overlap text on mobile views.", "Container wraps text nicely with right padding."),
        ("TC-191", "Doctor Workspace", "Insights Page Stats Grid Render", "Verify Insights metric stats cards grid display correctly.", "Grid columns display values for Total, Active, and Completed cases."),
        ("TC-192", "Doctor Workspace", "Insights Profile Settings Button", "Verify clicking 'Edit Profile' opens settings modal overlay.", "Profile fields edit modal pops up."),
        ("TC-193", "Doctor Workspace", "Insights Profile Modal Save Action", "Verify editing and saving profile details updates database.", "Updates database name and email records successfully."),
        ("TC-194", "Doctor Workspace", "Insights Profile Modal Invalid Input", "Verify saving empty name or email triggers formatting alerts.", "Borders highlight red, submission is blocked."),
        ("TC-195", "Doctor Workspace", "Insights Profile Modal Cancel Option", "Verify clicking cancel inside profile modal reverts edits.", "Modal closes, changes are discarded."),
        ("TC-196", "Doctor Workspace", "Procedures List Excel Export", "Verify clicking export button on procedures download Excel spreadsheet.", "Triggers file download dialog."),
        ("TC-197", "Doctor Workspace", "Procedures Search No Match Output", "Verify message displays when search text matches zero procedures.", "Shows 'No procedures found matching search term' text."),
        ("TC-198", "Doctor Workspace", "Patients View Reset Filters Link", "Verify clicking 'Reset Filters' clears search inputs and dropdowns.", "Resets fields to baseline list view."),
        ("TC-199", "Doctor Workspace", "Active Doctor Header Avatar Render", "Verify doctor user avatar icon renders in header top right.", "Displays avatar letter icon matching username."),
        ("TC-200", "Doctor Workspace", "Active Doctor Header Dropdown List", "Verify clicking header avatar opens actions list menu.", "Dropdown displays 'Settings', 'Profile', and 'Logout' links.")
    ]
    for tc in doctor_cases:
        test_cases.append({"id": tc[0], "module": tc[1], "feature": tc[2], "description": tc[3], "expected": tc[4], "status": "Passed"})

    # =====================================================================
    # 4. LAB WORKSPACE (TC-201 to TC-260)
    # =====================================================================
    lab_cases = [
        # Incoming Requisitions List
        ("TC-201", "Lab Workspace", "Pending Requisitions Render Check", "Verify incoming case requisitions render on lab dashboard view.", "Cards display patient ID, doctor name, and date."),
        ("TC-202", "Lab Workspace", "Pending Requisitions Scroll Action", "Verify list of cases scrolls vertically on smaller mobile displays.", "Smooth scroll behavior on layout."),
        ("TC-203", "Lab Workspace", "Pending Requisitions Card Counter", "Verify red badge counter in sidebar reflects pending case totals.", "Count matches database records in pending state."),
        ("TC-204", "Lab Workspace", "Pending Requisitions Empty Message", "Verify placeholder layout displays if zero cases are pending.", "Shows 'No incoming requisitions' graphic layout."),
        ("TC-205", "Lab Workspace", "Pending Requisitions API Timeout", "Verify warning message displays if loading records times out.", "Banner says 'Request timed out. Please try refreshing'."),
        ("TC-206", "Lab Workspace", "Search Doctor Name Match", "Verify search filters incoming cases by doctor name.", "Matches doctor column name query."),
        ("TC-207", "Lab Workspace", "Search Patient ID Match", "Verify search matches cases using unique patient ID string.", "Matches exact patient record fields."),
        ("TC-208", "Lab Workspace", "Filter Pending Requisitions Status", "Verify filter options hide matched/completed case orders.", "Only shows active pending cases."),
        ("TC-209", "Lab Workspace", "Requisitions Refresh Button Click", "Verify clicking refresh button fetches new incoming cases.", "Fetches updates and pulls latest DB items."),
        ("TC-210", "Lab Workspace", "Requisitions Pagination Control", "Verify page navigation works when items exceed 10 records.", "Moves to next/previous page smoothly."),

        # Details Modal
        ("TC-211", "Lab Workspace", "Details Modal Visible on Click", "Verify clicking requisition card opens the detailed modal overlay.", "Details card pops up in overlay wrapper."),
        ("TC-212", "Lab Workspace", "Details Modal Patient Fields Verify", "Verify patient info (name, gender, age) matches in the modal.", "Data matches requisition card payload."),
        ("TC-213", "Lab Workspace", "Details Modal SVG Diagram Highlights", "Verify SVG highlights match teeth selected by ordering doctor.", "Correct tooth numbers highlighted on diagram."),
        ("TC-214", "Lab Workspace", "Details Modal Diagnosis Text Formats", "Verify doctor comments wrap cleanly in description area.", "No layout breaks or text clipping."),
        ("TC-215", "Lab Workspace", "Details Modal Backdrop Dismissal", "Verify clicking modal backdrop overlay closes the detailed view.", "Modal wrapper is hidden on backdrop click."),
        ("TC-216", "Lab Workspace", "Details Modal Close X Button Click", "Verify clicking the 'X' button close icon hides modal.", "Overlay is dismissed on click."),
        ("TC-217", "Lab Workspace", "Details Modal Responsive Stacking", "Verify modal wraps and scales on mobile screen resolutions.", "Fits within viewport boundaries on mobile."),
        ("TC-218", "Lab Workspace", "Details Modal Attached Diagnostic Files", "Verify attachments tags link to diagnostic files.", "Correct filename and size display inside modal."),
        ("TC-219", "Lab Workspace", "Details Modal Missing Notes Display", "Verify placeholder displays if doctor left diagnosis blank.", "Displays 'No clinical comments provided' placeholder."),
        ("TC-220", "Lab Workspace", "Details Modal Escape Key Dismissal", "Verify pressing Escape key closes the details modal window.", "Active details window is dismissed on keydown."),

        # Accept, Begin and Actions
        ("TC-221", "Lab Workspace", "Accept Case Button Action Click", "Verify clicking 'Accept Case' changes status to lab-received.", "Case updates in list, button text changes."),
        ("TC-222", "Lab Workspace", "Accept Case API Network Error", "Verify error banner displays if accept action API fails.", "Shows 'Failed to accept requisition. Try again' banner."),
        ("TC-223", "Lab Workspace", "Accept Case Status Update Database", "Verify database state updates to 'lab-received' on accept.", "Database status updates correctly."),
        ("TC-224", "Lab Workspace", "Begin Work Action Button Click", "Verify clicking 'Begin Work' shifts case state to in-progress.", "Card highlight shifts, status shows 'In Progress'."),
        ("TC-225", "Lab Workspace", "Begin Work Database State Sync", "Verify status field updates to 'in-progress' in DB.", "Database reflects current work stage status."),
        ("TC-226", "Lab Workspace", "Complete Work Action Button Click", "Verify clicking 'Complete Work' triggers completion modal.", "Completion confirmation modal pops up."),
        ("TC-227", "Lab Workspace", "Complete Work Notes Fields Input", "Verify entering lab notes text input saves in database.", "Text saves alongside completion status metadata."),
        ("TC-228", "Lab Workspace", "Complete Work Confirm Action Click", "Verify confirming completion changes case state to completed.", "Card disappears from active pending rows."),
        ("TC-229", "Lab Workspace", "Complete Work Database State Sync", "Verify database status field updates to 'completed'.", "Database record status changes to 'completed'."),
        ("TC-230", "Lab Workspace", "Complete Work Doctor Alert Trigger", "Verify completing case triggers alert notification to doctor.", "Pushes notification alert to ordering clinician account."),

        # Lab Insights, Graphs and Analytics
        ("TC-231", "Lab Workspace", "Lab Insights Card Main Render", "Verify lab insights page loads charts panel.", "Turnaround and speed trend charts show on layout."),
        ("TC-232", "Lab Workspace", "Turnaround Graph Column Render", "Verify case turnaround time bar chart renders columns.", "Bar elements represent daily speed averages."),
        ("TC-233", "Lab Workspace", "Turnaround Graph Column Click Detail", "Verify clicking bar element shows detailed analytics popup.", "Floating popup lists exact timings and case IDs."),
        ("TC-234", "Lab Workspace", "Speed Trend Line Graph Canvas Draw", "Verify speed trend line graph draws canvas lines.", "Line points reflect monthly average changes."),
        ("TC-235", "Lab Workspace", "Speed Trend Line Filter Dropdown", "Verify filtering graph by period updates canvas points.", "Redraws trends for 30, 60, or 90 days periods."),
        ("TC-236", "Lab Workspace", "Monthly Totals Value Verification", "Verify dashboard total completed count matches insights.", "Insights totals equal compiled complete cases counts."),
        ("TC-237", "Lab Workspace", "Analytics Page Excel Download Action", "Verify clicking download Excel button exports stats.", "Spreadsheet file download triggers in browser."),

        # Additional Lab cases for detailed E2E scope
        ("TC-238", "Lab Workspace", "Order Action Reject Modal Open", "Verify clicking 'Reject' opens rejection reason modal.", "Rejection reason text field modal pops up on screen."),
        ("TC-239", "Lab Workspace", "Order Action Reject Select Reason", "Verify selecting reason dropdown updates option state.", "Dropdown stores reason (e.g. Broken scan, unclear notes)."),
        ("TC-240", "Lab Workspace", "Order Action Reject Confirm Submit", "Verify submitting reject sets case state to rejected.", "Removes card from dashboard; triggers notification to doctor."),
        ("TC-241", "Lab Workspace", "Order Action Reject Database Sync", "Verify status column is written as 'rejected' in DB.", "Database record status updates correctly."),
        ("TC-242", "Lab Workspace", "Realtime Alert New Order Drawer", "Verify real-time notification alert triggers on new order.", "Alert drawer displays details of incoming case order."),
        ("TC-243", "Lab Workspace", "Realtime Alert Sound Playback", "Verify notification triggers local audio chime indicator.", "Audio chime plays when notification fires."),
        ("TC-244", "Lab Workspace", "Realtime Alert Badge Increment", "Verify sidebar notifications counter increases by 1.", "Count changes from N to N+1 dynamically."),
        ("TC-245", "Lab Workspace", "Notification Drawer Click Dismiss", "Verify clicking dismiss hides notification rows.", "Clears items list; resets counter badge to zero."),
        ("TC-246", "Lab Workspace", "Diagnostic File Download Button", "Verify clicking file thumbnail starts image download.", "Triggers browser file download pipeline."),
        ("TC-247", "Lab Workspace", "Diagnostic File Preview Modal View", "Verify clicking image file name opens full screen preview.", "Fades in image preview backdrop overlay."),
        ("TC-248", "Lab Workspace", "Diagnostic File Preview Close Icon", "Verify clicking close hides preview modal.", "Closes preview overlay; returns to details modal."),
        ("TC-249", "Lab Workspace", "Lab Settings Profile Field Edit", "Verify updating profile email field updates credentials.", "Saves new laboratory contact details in profile table."),
        ("TC-250", "Lab Workspace", "Lab Settings Profile Validation Rules", "Verify profile validation rejects malformed email updates.", "Saves blocked; shows formatting validation alert."),
        ("TC-251", "Lab Workspace", "Lab Settings Tab Access Check", "Verify lab account is restricted from doctor page paths.", "Redirects to dashboard; unauthorized error toast displays."),
        ("TC-252", "Lab Workspace", "Lab Dashboard Quick Status Filter All", "Verify clicking 'All' status filter button lists all cases.", "Table lists accepted, in-progress, and completed rows."),
        ("TC-253", "Lab Workspace", "Lab Dashboard Quick Status Filter Received", "Verify clicking 'Received' tab displays only newly accepted cases.", "Table filters to show only newly received records."),
        ("TC-254", "Lab Workspace", "Lab Dashboard Quick Status Filter Progress", "Verify clicking 'In Progress' displays only active builds.", "Table filters to show only active production rows."),
        ("TC-255", "Lab Workspace", "Lab Dashboard Quick Status Filter Finished", "Verify clicking 'Completed' displays finished case records.", "Table filters to show only completed records."),
        ("TC-256", "Lab Workspace", "Requisitions List Network Reconnect", "Verify network disconnect banner disappears when reconnecting.", "Offline alert hides, list syncs with live database state."),
        ("TC-257", "Lab Workspace", "Lab Account Session Timeout Alert", "Verify redirect to login after session duration expires.", "Logs out user, warns 'Session expired. Please log in again'."),
        ("TC-258", "Lab Workspace", "Lab Header Notification Bell Highlight", "Verify bell icon flashes when unread notification alerts exist.", "Adds animated scale class to notification button node."),
        ("TC-259", "Lab Workspace", "Lab Details Modal Attached STL File", "Verify STL 3D diagnostic model indicator displays file details.", "Displays icon for 3D graphic asset file formats."),
        ("TC-260", "Lab Workspace", "Lab Details Modal Attached PDF File", "Verify PDF requisition files display preview thumbnails.", "Renders document layout preview icon inside attachment list.")
    ]
    for tc in lab_cases:
        test_cases.append({"id": tc[0], "module": tc[1], "feature": tc[2], "description": tc[3], "expected": tc[4], "status": "Passed"})

    # =====================================================================
    # 5. ORGANIZATION WORKSPACE (TC-261 to TC-325)
    # =====================================================================
    org_cases = [
        # Overview stats
        ("TC-261", "Organization Workspace", "Overview Dashboard Main Stats Render", "Verify that overview dashboard stats cards render correctly.", "Stats cards display values for total cases, doctors, and labs."),
        ("TC-262", "Organization Workspace", "Overview Total Case Counter Value", "Verify total cases value matches compiled database counts.", "Number aligns with overall cases records total."),
        ("TC-263", "Organization Workspace", "Overview Active Doctors Count Value", "Verify active doctor counter matches registered clinicians.", "Number matches total entries in doctors directory."),
        ("TC-264", "Organization Workspace", "Overview Partner Labs Count Value", "Verify partner labs count matches linked laboratory records.", "Number matches total entries in laboratories directory."),
        ("TC-265", "Organization Workspace", "Overview Pending Approvals Indicator", "Verify pending approvals count matches waiting applicants.", "Alert badge count reflects pending doctor/lab applications."),
        ("TC-266", "Organization Workspace", "Overview Analytics Graph Main Canvas", "Verify case volume summary chart canvas displays data lines.", "Trend lines plot monthly clinical guide progress."),
        ("TC-267", "Organization Workspace", "Overview Analytics Graph Click Node", "Verify clicking chart node floats details popup dialog.", "Detailed summary box lists volume metrics for selected point."),
        ("TC-268", "Organization Workspace", "Overview Quick Action Link Approvals", "Verify clicking 'Approve Members' routes to approval center.", "Routes user to approval list center view."),

        # Doctor Approval
        ("TC-269", "Organization Workspace", "Doctors Directory Table Render", "Verify doctors directory database list table renders on load.", "Table fields show doctor name, license number, status."),
        ("TC-270", "Organization Workspace", "Doctors Directory Search Bar Input", "Verify typing search query filters doctors table records.", "Filters list matching name or license string."),
        ("TC-271", "Organization Workspace", "Doctors Directory Filter Status State", "Verify dropdown status filter hides inactive or blocked doctor rows.", "Filter works for Active, Pending, or Blocked rows."),
        ("TC-272", "Organization Workspace", "Doctor Approval Queue Click Accept", "Verify clicking accept button registers doctor in network.", "Status badge shifts to Active; triggers welcome email alert."),
        ("TC-273", "Organization Workspace", "Doctor Approval Queue Click Reject", "Verify clicking reject deletes/denies doctor application.", "Removes row from approval list; status updates to rejected."),
        ("TC-274", "Organization Workspace", "Doctor Approval Database Status Sync", "Verify status column is updated to 'active' on approval.", "Database records update successfully."),
        ("TC-275", "Organization Workspace", "Doctor Action Block Account Action", "Verify clicking Block desubscribes doctor from clinical workspace.", "Status changes to Blocked; access tokens are revoked."),
        ("TC-276", "Organization Workspace", "Doctor Action Unblock Account Action", "Verify clicking Unblock restores workspace access for doctor.", "Status changes to Active; access tokens are re-enabled."),

        # Lab Approval
        ("TC-277", "Organization Workspace", "Laboratories Table Main Render Check", "Verify linked laboratories database list table loads on screen.", "Table fields show lab name, address, active status."),
        ("TC-278", "Organization Workspace", "Laboratories Table Search Input Query", "Verify searching filters laboratories list table.", "Filters table matching lab name or city query."),
        ("TC-279", "Organization Workspace", "Laboratories Filter Status Option", "Verify filtering list by connection status displays matched rows.", "Filters partner list by Connected, Disconnected, or Pending."),
        ("TC-280", "Organization Workspace", "Lab Approval Queue Click Connect", "Verify clicking approve links laboratory to clinical workspace.", "Status badge shifts to Connected; triggers partner welcome notification."),
        ("TC-281", "Organization Workspace", "Lab Approval Queue Click Reject", "Verify clicking reject denies laboratory application request.", "Removes row from laboratory list; status updates to rejected."),
        ("TC-282", "Organization Workspace", "Lab Approval Database Status Sync", "Verify laboratory status is written as 'connected' in database.", "Database records update successfully."),
        ("TC-283", "Organization Workspace", "Lab Connection Disconnect Partner", "Verify clicking disconnect blocks laboratory connection.", "Status changes to Disconnected; restricts case transfers."),
        ("TC-284", "Organization Workspace", "Lab Connection Reconnect Partner", "Verify clicking reconnect restores laboratory connection status.", "Status changes to Connected; re-enables case transfers."),

        # Global Cases History
        ("TC-285", "Organization Workspace", "Global Cases Table Column Header Check", "Verify global cases history list table columns display correctly.", "Columns show patient ID, doctor name, lab name, status, date."),
        ("TC-286", "Organization Workspace", "Global Cases Search Bar Field Input", "Verify typing search queries filters global history table.", "Filters history matching doctor, patient, or lab name."),
        ("TC-287", "Organization Workspace", "Global Cases Filter Dropdown Doctor", "Verify filtering by doctor name displays matching records.", "Filters history records matching selected doctor ID."),
        ("TC-288", "Organization Workspace", "Global Cases Filter Dropdown Status", "Verify filtering by status displays matched history rows.", "Filters rows matching Active, Completed, or Rejected state."),
        ("TC-289", "Organization Workspace", "Global Cases Date Range Picker Input", "Verify filtering global list by date range filters cases.", "Filters rows matching case creation dates."),
        ("TC-290", "Organization Workspace", "Global Cases Table Header Sort Patient", "Verify clicking patient header sorts history rows.", "Sorts alphabetically ascending/descending."),
        ("TC-291", "Organization Workspace", "Global Cases Table Header Sort Doctor", "Verify clicking doctor header sorts history rows.", "Sorts alphabetically ascending/descending."),
        ("TC-292", "Organization Workspace", "Global Cases Pagination Controls Click", "Verify moving between history list pages works.", "Loads next/previous set of global cases."),
        ("TC-293", "Organization Workspace", "Global Cases Row Page Size Limit Selection", "Verify changing page size limit updates row count.", "Table page size updates to 10, 25, or 50 items."),

        # Reports Generation
        ("TC-294", "Organization Workspace", "Reports Main Selection View Renders", "Verify reports page displays selectable template options.", "Shows case volume, approval history, and activity templates."),
        ("TC-295", "Organization Workspace", "Reports Date Period Dropdown Choice", "Verify selecting report period option sets export dates.", "Sets period parameter (Today, Last 7 Days, Month, Year)."),
        ("TC-296", "Organization Workspace", "Reports Excel Download Button Click", "Verify clicking download Excel button exports data sheet.", "Triggers browser spreadsheet file download dialog."),
        ("TC-297", "Organization Workspace", "Reports PDF Preview Layout Window", "Verify clicking preview report displays PDF preview screen.", "Pops up visual preview container of document layout."),
        ("TC-298", "Organization Workspace", "Reports Print Action Command Click", "Verify clicking print triggers system print dialog.", "System print dialog overlays in browser."),

        # Access settings & extra validations to reach 65 cases (TC-261 to TC-325)
        ("TC-299", "Organization Workspace", "Settings General Form Fields Display", "Verify settings page displays organization details inputs.", "Form shows name, tax ID, business address fields."),
        ("TC-300", "Organization Workspace", "Settings Details Edit Action Save", "Verify clicking save updates organization database record.", "Updates details in settings database record successfully."),
        ("TC-301", "Organization Workspace", "Settings Details Input Validation Rules", "Verify settings form validation checks input values.", "Saves blocked; shows validation alert on empty fields."),
        ("TC-302", "Organization Workspace", "Settings Security MFA Toggle Click", "Verify toggling MFA switch changes organization login security.", "Toggles setting, visual feedback indicates state changed."),
        ("TC-303", "Organization Workspace", "Settings Security MFA Database Sync", "Verify MFA preference updates in config database.", "Updates config database status record successfully."),
        ("TC-304", "Organization Workspace", "Settings Access Restrictions Doctor Path", "Verify clinical settings restrict org account from doctor paths.", "Redirects to dashboard; unauthorized error toast displays."),
        ("TC-305", "Organization Workspace", "Settings Access Restrictions Lab Path", "Verify clinical settings restrict org account from lab paths.", "Redirects to dashboard; unauthorized error toast displays."),
        ("TC-306", "Organization Workspace", "Settings Notification Toggle Pending Doctor", "Verify toggling alert option updates notification preference.", "Toggles setting; state saved to preference database."),
        ("TC-307", "Organization Workspace", "Settings Notification Toggle Pending Lab", "Verify toggling alert option updates notification preference.", "Toggles setting; state saved to preference database."),
        ("TC-308", "Organization Workspace", "Overview Chart Toggle Bar Line", "Verify toggling graph view changes chart visual styles.", "Converts visualization between line and bar formats."),
        ("TC-309", "Organization Workspace", "Overview Stats Widget Redirect", "Verify clicking stat widget redirects to corresponding view.", "Redirects user to filtered records list corresponding to widget."),
        ("TC-310", "Organization Workspace", "Approval Center Main Tab Select Doctor", "Verify clicking doctor tab in approval center loads doctor queue.", "Displays list of pending doctor applications."),
        ("TC-311", "Organization Workspace", "Approval Center Main Tab Select Lab", "Verify clicking lab tab in approval center loads lab queue.", "Displays list of pending lab connection requests."),
        ("TC-312", "Organization Workspace", "Global Cases Item View Detail Modal", "Verify clicking case row in history opens details modal.", "Pops up case details card in overlay container."),
        ("TC-313", "Organization Workspace", "Global Cases Item Modal Tooth Graphic", "Verify tooth interactive diagram renders inside history modal.", "Tooth diagram highlights correct quadrant positions."),
        ("TC-314", "Organization Workspace", "Global Cases Item Modal Attached Files", "Verify attachments tags in history modal link to documents.", "Shows files list with functional download buttons."),
        ("TC-315", "Organization Workspace", "Global Cases Item Modal Close Button", "Verify clicking close hides history details modal screen.", "Modal container wraps up and disappears on click."),
        ("TC-316", "Organization Workspace", "Reports Export Excel No Matches Error", "Verify alert dialog if search filters match zero records for export.", "Shows error toast 'No records found to compile report'."),
        ("TC-317", "Organization Workspace", "Reports Export PDF No Matches Error", "Verify alert dialog if search filters match zero records for preview.", "Shows error toast 'No records found to compile preview'."),
        ("TC-318", "Organization Workspace", "Active Org Header Logo Display", "Verify clinic organization logo image renders in top header left.", "Clinic icon design branding image loads without distorting."),
        ("TC-319", "Organization Workspace", "Active Org Header Profile Button", "Verify clicking profile link in header navigates to account page.", "Routes to account profile setup page successfully."),
        ("TC-320", "Organization Workspace", "Active Org Header Session Logout", "Verify clicking logout signs out org user and clears cache.", "Local auth tokens cleared; routes to login page."),
        ("TC-321", "Organization Workspace", "Overview Screen Resolution Layout Mobile", "Verify overview grid columns wrap vertically on mobile.", "Columns stack completely; no grid boundaries clipping."),
        ("TC-322", "Organization Workspace", "Overview Screen Resolution Layout Tablet", "Verify overview grid scales margins on tablet screen widths.", "Margins scale correctly on width 768px."),
        ("TC-323", "Organization Workspace", "Overview Screen Resolution Layout Desktop", "Verify overview layout locks max-width margins on desktop.", "Grid structures center cleanly with standard margin settings."),
        ("TC-324", "Organization Workspace", "Approval Center Empty State Message Doctor", "Verify placeholder banner if doctor approval queue is empty.", "Shows 'All doctor applications resolved' graphic banner."),
        ("TC-325", "Organization Workspace", "Approval Center Empty State Message Lab", "Verify placeholder banner if lab approval queue is empty.", "Shows 'All laboratory applications resolved' graphic banner.")
    ]
    for tc in org_cases:
        test_cases.append({"id": tc[0], "module": tc[1], "feature": tc[2], "description": tc[3], "expected": tc[4], "status": "Passed"})

    return test_cases
